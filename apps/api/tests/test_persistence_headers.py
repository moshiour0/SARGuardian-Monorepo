from __future__ import annotations

import base64
import json
import logging
from types import SimpleNamespace

import pytest

from app import persistence


def _fake_legacy_key(role: str) -> str:
    header = base64.urlsafe_b64encode(b'{"alg":"HS256","typ":"JWT"}').decode().rstrip("=")
    payload = base64.urlsafe_b64encode(json.dumps({"role": role}).encode()).decode().rstrip("=")
    return f"{header}.{payload}.test-signature"


def test_displacement_reads_select_only_compact_metadata_columns() -> None:
    class FakeQuery:
        def __init__(self, captured: dict[str, object]) -> None:
            self.captured = captured

        def select(self, columns: str) -> "FakeQuery":
            self.captured.setdefault("selects", []).append(columns)
            return self

        def eq(self, column: str, value: object) -> "FakeQuery":
            self.captured.setdefault("filters", []).append((column, value))
            return self

        def update(self, values: dict[str, object]) -> "FakeQuery":
            self.captured["update_values"] = values
            return self

        def order(self, _column: str, desc: bool = False) -> "FakeQuery":
            return self

        def limit(self, _count: int) -> "FakeQuery":
            return self

        def in_(self, _column: str, _values: list[str]) -> "FakeQuery":
            return self

        def execute(self) -> SimpleNamespace:
            return SimpleNamespace(data=[{"id": "00000000-0000-4000-8000-000000000001", "state": "running"}])

    class FakeClient:
        def __init__(self) -> None:
            self.captured: dict[str, object] = {}

        def table(self, table_name: str) -> FakeQuery:
            self.captured.setdefault("tables", []).append(table_name)
            return FakeQuery(self.captured)

    client = FakeClient()
    store = persistence.SupabaseJobStore(client, preflight_ttl_seconds=60)

    store.list_displacement_jobs("firebase-owner")
    store.get_displacement_job_status("firebase-owner", __import__("uuid").UUID("00000000-0000-4000-8000-000000000001"))
    store.has_active_displacement_job("firebase-owner")
    store.list_active_displacement_jobs("firebase-owner")

    selects = client.captured["selects"]
    assert isinstance(selects, list)
    assert selects[0] == persistence.DISPLACEMENT_JOB_METADATA_COLUMNS
    assert selects[1] == persistence.DISPLACEMENT_JOB_STATUS_COLUMNS
    assert selects[2] == "id"
    assert selects[3] == "id,state"
    assert all("result_summary" not in columns and "artifact_url" not in columns for columns in selects)


def test_compact_status_update_is_filtered_by_verified_owner_and_job_id() -> None:
    from uuid import UUID

    class FakeQuery:
        def __init__(self, captured: dict[str, object]) -> None:
            self.captured = captured

        def update(self, values: dict[str, object]) -> "FakeQuery":
            self.captured["update_values"] = values
            return self

        def eq(self, column: str, value: object) -> "FakeQuery":
            self.captured.setdefault("filters", []).append((column, value))
            return self

        def select(self, columns: str) -> "FakeQuery":
            self.captured["select"] = columns
            return self

        def execute(self) -> SimpleNamespace:
            return SimpleNamespace(data=[{"id": "00000000-0000-4000-8000-000000000001", "state": "failed"}])

    class FakeClient:
        def __init__(self) -> None:
            self.captured: dict[str, object] = {}

        def table(self, table_name: str) -> FakeQuery:
            self.captured["table"] = table_name
            return FakeQuery(self.captured)

    client = FakeClient()
    store = persistence.SupabaseJobStore(client, preflight_ttl_seconds=60)
    job_id = UUID("00000000-0000-4000-8000-000000000001")

    store.update_displacement_job_status("verified-firebase-owner", job_id, {"state": "failed"})

    assert client.captured["table"] == "displacement_jobs"
    assert client.captured["filters"] == [
        ("owner_uid", "verified-firebase-owner"),
        ("id", str(job_id)),
    ]
    assert client.captured["select"] == persistence.DISPLACEMENT_JOB_STATUS_COLUMNS


def test_legacy_service_role_jwt_is_accepted() -> None:
    assert persistence._validate_service_role_key(_fake_legacy_key("service_role")) is False


def test_legacy_anon_jwt_is_rejected_as_server_persistence_key() -> None:
    anon_key = _fake_legacy_key("anon")

    with pytest.raises(persistence.PersistenceConfigurationError, match="without the service_role claim") as error:
        persistence._validate_service_role_key(anon_key)

    assert anon_key not in str(error.value)


def test_modern_supabase_key_is_only_an_apikey_header() -> None:
    secret = "sb_secret_test_only"
    client = SimpleNamespace(
        options=SimpleNamespace(
            headers={
                "X-Client-Info": "test",
                "apiKey": secret,
                "Authorization": f"Bearer {secret}",
            }
        )
    )

    persistence._normalize_modern_key_headers(client, secret)

    assert client.options.headers == {"X-Client-Info": "test", "apikey": secret}
    assert "Authorization" not in client.options.headers
    assert secret not in repr({key: value for key, value in client.options.headers.items() if key != "apikey"})


def test_secret_client_initialization_suppresses_sdk_bearer_fallback(monkeypatch, caplog) -> None:
    secret = "sb_secret_test_only"
    captured: dict[str, object] = {"probe_tables": []}

    class FakeOptions:
        def __init__(self, **kwargs: object) -> None:
            self.headers = dict(kwargs.get("headers") or {})

    class FakeQuery:
        def select(self, column: str) -> "FakeQuery":
            captured["probe_column"] = column
            return self

        def limit(self, count: int) -> "FakeQuery":
            captured["probe_limit"] = count
            return self

        def execute(self) -> SimpleNamespace:
            captured["probe_executed"] = True
            return SimpleNamespace(data=[])

    class FakeClient:
        def __init__(self, headers: dict[str, str]) -> None:
            self.options = SimpleNamespace(headers=headers)

        def table(self, table_name: str) -> FakeQuery:
            tables = captured["probe_tables"]
            assert isinstance(tables, list)
            tables.append(table_name)
            captured["probe_table"] = table_name
            return FakeQuery()

    def fake_create_client(url: str, key: str, options: FakeOptions) -> FakeClient:
        captured["url"] = url
        captured["key"] = key
        captured["options"] = options
        return FakeClient({"apiKey": key, "Authorization": ""})

    monkeypatch.setenv("SUPABASE_URL", "https://example.invalid")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", secret)
    monkeypatch.setenv("PREFLIGHT_TTL_SECONDS", "86400")
    monkeypatch.setattr(persistence, "ClientOptions", FakeOptions)
    monkeypatch.setattr(persistence, "create_client", fake_create_client)
    persistence.get_job_store.cache_clear()

    with caplog.at_level(logging.DEBUG):
        store = persistence.get_job_store()

    options = captured["options"]
    assert isinstance(options, FakeOptions)
    assert options.headers == {"Authorization": ""}
    assert store.client.options.headers == {"apikey": secret}
    assert "Authorization" not in store.client.options.headers
    assert "Bearer" not in repr(store.client.options.headers)
    assert captured["probe_tables"] == ["displacement_jobs", "known_place_requests"]
    assert captured["probe_table"] == "known_place_requests"
    assert captured["probe_column"] == "request_id"
    assert captured["probe_limit"] == 0
    assert captured["probe_executed"] is True
    assert secret not in caplog.text
    persistence.get_job_store.cache_clear()


def test_publishable_key_is_rejected_as_server_persistence_key(monkeypatch) -> None:
    publishable = "sb_publishable_test_only"
    create_client_called = False

    class FakeOptions:
        def __init__(self, **_kwargs: object) -> None:
            pass

    def forbidden_create_client(*_args: object, **_kwargs: object) -> None:
        nonlocal create_client_called
        create_client_called = True
        raise AssertionError("client must not initialize with a publishable key")

    monkeypatch.setenv("SUPABASE_URL", "https://example.invalid")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", publishable)
    monkeypatch.setattr(persistence, "ClientOptions", FakeOptions)
    monkeypatch.setattr(persistence, "create_client", forbidden_create_client)
    persistence.get_job_store.cache_clear()

    with pytest.raises(persistence.PersistenceConfigurationError, match="publishable key") as error:
        persistence.get_job_store()

    assert not create_client_called
    assert publishable not in str(error.value)
    persistence.get_job_store.cache_clear()


def test_server_access_probe_fails_closed_without_exposing_provider_error(monkeypatch) -> None:
    secret = "sb_secret_test_only"

    class FakeOptions:
        def __init__(self, **kwargs: object) -> None:
            self.headers = dict(kwargs.get("headers") or {})

    class FakeQuery:
        def select(self, _column: str) -> "FakeQuery":
            return self

        def limit(self, _count: int) -> "FakeQuery":
            return self

        def execute(self) -> None:
            raise RuntimeError(f"permission denied for key {secret}")

    class FakeClient:
        def __init__(self, headers: dict[str, str]) -> None:
            self.options = SimpleNamespace(headers=headers)

        def table(self, _table_name: str) -> FakeQuery:
            return FakeQuery()

    def fake_create_client(_url: str, key: str, options: FakeOptions) -> FakeClient:
        return FakeClient({"apiKey": key, "Authorization": ""})

    monkeypatch.setenv("SUPABASE_URL", "https://example.invalid")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", secret)
    monkeypatch.setattr(persistence, "ClientOptions", FakeOptions)
    monkeypatch.setattr(persistence, "create_client", fake_create_client)
    persistence.get_job_store.cache_clear()

    with pytest.raises(persistence.PersistenceConfigurationError, match="server-side access check failed") as error:
        persistence.get_job_store()

    assert secret not in str(error.value)
    assert error.value.__cause__ is None
    persistence.get_job_store.cache_clear()


def test_supabase_initialization_error_does_not_expose_secret(monkeypatch) -> None:
    secret = "sb_secret_test_only"

    class FakeOptions:
        def __init__(self, **_kwargs: object) -> None:
            pass

    def failing_create_client(*_args: object, **_kwargs: object) -> None:
        raise RuntimeError(f"provider rejected {secret}")

    monkeypatch.setenv("SUPABASE_URL", "https://example.invalid")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", secret)
    monkeypatch.setattr(persistence, "ClientOptions", FakeOptions)
    monkeypatch.setattr(persistence, "create_client", failing_create_client)
    persistence.get_job_store.cache_clear()

    with pytest.raises(persistence.PersistenceConfigurationError) as error:
        persistence.get_job_store()

    assert str(error.value) == "Supabase persistence could not be initialized."
    assert secret not in str(error.value)
    assert error.value.__cause__ is None
    persistence.get_job_store.cache_clear()
