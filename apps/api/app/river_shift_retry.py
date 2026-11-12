"""UI retry adapter; the imported RiverShift API and science engine stay verbatim."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from . import river_shift_jobs as source
from .auth import get_current_user
from .persistence import PersistenceError

router = APIRouter(prefix="/api/river-shift", tags=["RiverShift"])


def _saved_request(store, owner_uid: str, job_id: UUID) -> dict:
    # The source's lightweight job response deliberately omits request_snapshot.
    # Read it only on an explicit retry, scoped to the authenticated owner.
    try:
        response = (
            store.client.table("river_shift_jobs")
            .select("request_snapshot")
            .eq("owner_uid", owner_uid)
            .eq("id", str(job_id))
            .limit(1)
            .execute()
        )
        rows = response.data
    except Exception:
        raise HTTPException(status_code=503, detail="Could not read the saved River Shift request.") from None
    if not rows or not isinstance(rows[0].get("request_snapshot"), dict):
        raise HTTPException(status_code=409, detail="The original River Shift settings are unavailable. Start a new run from setup.")
    return rows[0]["request_snapshot"]


@router.post("/jobs/{job_id}/retry", response_model=source.RiverShiftJobResponse)
def retry_river_shift_job(job_id: UUID, user: dict = Depends(get_current_user)):
    owner_uid = source._owner_uid(user)
    store = source._store()
    try:
        original = store.get_river_shift_job(owner_uid, job_id)
    except PersistenceError:
        raise HTTPException(status_code=503, detail="Could not read the failed River Shift job.") from None
    if not original:
        raise HTTPException(status_code=404, detail="RiverShift job was not found for this account.")
    if original["state"] != "failed":
        raise HTTPException(status_code=409, detail="Only a failed River Shift job can be retried.")

    # One durable successor per failed job: double clicks, a lost response or a
    # page reload cannot dispatch multiple retries. A failed successor can itself
    # be retried. Leave the original record and its provenance intact.
    retry_key = f"retry:{job_id}"
    try:
        existing = store.get_river_shift_job_by_idempotency(owner_uid, retry_key)
    except PersistenceError:
        raise HTTPException(status_code=503, detail="Could not check the River Shift retry status.") from None
    if existing:
        return source._response(existing)

    saved = _saved_request(store, owner_uid, job_id)
    try:
        payload = source.CreateRiverShiftJobRequest.model_validate({**saved, "idempotency_key": retry_key})
    except ValueError:
        raise HTTPException(status_code=409, detail="The saved River Shift settings are invalid. Start a new run from setup.") from None
    # This is a fresh attempt with source preflight/discovery and unchanged
    # failed-product retry waves, stage barriers and signed callbacks.
    return source.create_river_shift_job(payload, user)
