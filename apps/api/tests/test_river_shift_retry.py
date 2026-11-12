from copy import deepcopy
from types import SimpleNamespace
from uuid import uuid4

import pytest

from app import river_shift_retry as retry
from app import river_shift_jobs as source
from test_river_shift_jobs import RiverShiftStore, configure, payload, setup_function, teardown_function


def failed_job(monkeypatch):
    store = RiverShiftStore()
    client = configure(monkeypatch, store)
    request = payload() | {
        "main_band_polarization": "VV+VH", "flight_direction": "DESCENDING",
        "frame_coverage": "FULL", "frequency": "frequencyB", "covariance_term": "VVVV",
        "threshold_method": "manual", "threshold_db": -17.5,
    }
    job_id = client.post("/api/river-shift/jobs", json=request).json()["id"]
    store.rows[job_id].update(state="failed", stage="download_failed", error_message="Download failed")
    monkeypatch.setattr(retry, "_saved_request", lambda _store, owner, job: deepcopy(store.get_river_shift_job(owner, job)["request_snapshot"]))
    return client, store, job_id


def test_retry_preserves_all_saved_settings_and_original_job(monkeypatch):
    client, store, job_id = failed_job(monkeypatch)
    original = deepcopy(store.rows[job_id])
    dispatched = []
    monkeypatch.setattr(source, "_dispatch", lambda *args: dispatched.append(args))

    response = client.post(f"/api/river-shift/jobs/{job_id}/retry")

    assert response.status_code == 200, response.text
    new_id = response.json()["id"]
    assert new_id != job_id
    assert response.json()["state"] == "dispatching"
    assert store.rows[job_id] == original
    assert store.rows[new_id]["request_snapshot"] == original["request_snapshot"] | {"idempotency_key": f"retry:{job_id}"}
    assert len(dispatched) == 1

    # Network-response loss or double click returns the same durable attempt.
    again = client.post(f"/api/river-shift/jobs/{job_id}/retry")
    assert again.json()["id"] == new_id
    assert len(dispatched) == 1

    store.rows[new_id]["state"] = "failed"
    next_attempt = client.post(f"/api/river-shift/jobs/{new_id}/retry")
    assert next_attempt.status_code == 200
    assert next_attempt.json()["id"] not in {job_id, new_id}
    assert len(dispatched) == 2


@pytest.mark.parametrize("state", ["queued", "dispatching", "running", "succeeded", "cancelled"])
def test_retry_rejects_nonfailed_jobs(monkeypatch, state):
    client, store, job_id = failed_job(monkeypatch)
    store.rows[job_id]["state"] = state
    assert client.post(f"/api/river-shift/jobs/{job_id}/retry").status_code == 409
    assert len(store.rows) == 1


def test_retry_is_owner_scoped(monkeypatch):
    client, store, job_id = failed_job(monkeypatch)
    client = configure(monkeypatch, store, owner="another-user")
    assert client.post(f"/api/river-shift/jobs/{job_id}/retry").status_code == 404
    assert len(store.rows) == 1


def test_retry_revalidates_and_keeps_failed_job_on_preflight_error(monkeypatch):
    client, store, job_id = failed_job(monkeypatch)
    original = deepcopy(store.rows[job_id])
    monkeypatch.setattr(source, "_discover_manifest", lambda _payload: ({"unique_dates": []}, []))
    assert client.post(f"/api/river-shift/jobs/{job_id}/retry").status_code == 422
    assert store.rows == {job_id: original}


def test_retry_respects_account_capacity(monkeypatch):
    client, store, job_id = failed_job(monkeypatch)
    active_id = str(uuid4())
    store.rows[active_id] = store.rows[job_id] | {"id": active_id, "state": "running", "idempotency_key": "different-active-request"}
    assert client.post(f"/api/river-shift/jobs/{job_id}/retry").status_code == 409
    assert len(store.rows) == 2


def test_retry_missing_snapshot_never_substitutes_defaults(monkeypatch):
    client, store, job_id = failed_job(monkeypatch)
    monkeypatch.setattr(retry, "_saved_request", lambda *args: {})
    assert client.post(f"/api/river-shift/jobs/{job_id}/retry").status_code == 409
    assert len(store.rows) == 1


def test_saved_request_query_is_owner_scoped_and_narrow():
    calls = []

    class Query:
        def __getattr__(self, name):
            def call(*args):
                calls.append((name, args))
                return SimpleNamespace(data=[{"request_snapshot": {"frequency": "frequencyB"}}]) if name == "execute" else self
            return call

    job_id = uuid4()
    result = retry._saved_request(SimpleNamespace(client=Query()), "owner-123", job_id)
    assert result == {"frequency": "frequencyB"}
    assert calls == [
        ("table", ("river_shift_jobs",)), ("select", ("request_snapshot",)),
        ("eq", ("owner_uid", "owner-123")), ("eq", ("id", str(job_id))),
        ("limit", (1,)), ("execute", ()),
    ]
