from __future__ import annotations
from pathlib import Path
import re
REPOSITORY_ROOT = Path(__file__).resolve().parents[3]
WORKFLOW_PATH = REPOSITORY_ROOT / ".github" / "workflows" / "river-shift-gcov-process.yml"

def _job_block(workflow: str, job_name: str, next_job: str) -> str:
    start_marker = f"  {job_name}:"
    end_marker = f"  {next_job}:"
    start = workflow.find(start_marker)
    end = workflow.find(end_marker, start + len(start_marker))
    assert start >= 0, f"Missing RiverShift job: {job_name}"
    assert end > start, f"Missing next job after {job_name}"
    return workflow[start:end]

def test_every_retry_wave_uses_a_fresh_runner_and_validated_matrix():
    workflow = WORKFLOW_PATH.read_text(encoding="utf-8")
    assert "\\" + "$" + "{{" not in workflow
    specs = [
        ("retry_prepare", "retry_dispatch", "retry", "retry_prepare_2"),
        ("retry_prepare_2", "retry_dispatch_2", "retry_2", "retry_prepare_3"),
        ("retry_prepare_3", "retry_dispatch_3", "retry_3", "retry_status"),
    ]
    for prepare_name, dispatch_name, retry_name, next_name in specs:
        prepare = _job_block(workflow, prepare_name, dispatch_name)
        dispatch = _job_block(workflow, dispatch_name, retry_name)
        retry = _job_block(workflow, retry_name, next_name)
        assert "RIVERSHIFT_RETRY_ATTEMPT:" in prepare
        assert "RIVERSHIFT_EXPECTED_RETRY_ATTEMPT:" in dispatch
        assert "validate_retry_matrix.py" in dispatch
        assert "if: >-" in retry and "!cancelled()" in retry
        assert "max-parallel: 15" in retry
        assert "RIVERSHIFT_RETRY_ATTEMPT: " + "$" + "{{ matrix.retry_attempt }}" in retry
        assert "RIVERSHIFT_PRODUCT_OUTPUT_DIR: product-output/wave-" + "$" + "{{ matrix.retry_attempt }}" in retry
        assert "rivershift-retry-wave-" + "$" + "{{ matrix.retry_attempt }}" + "-product-" in retry

def test_later_waves_run_even_when_previous_worker_failed_but_validation_passed():
    workflow = WORKFLOW_PATH.read_text(encoding="utf-8")
    wave_two = _job_block(workflow, "retry_prepare_2", "retry_dispatch_2")
    wave_three = _job_block(workflow, "retry_prepare_3", "retry_dispatch_3")
    assert "needs: [retry_prepare, retry_dispatch, retry]" in wave_two
    assert "needs.retry_prepare.result == 'success'" in wave_two
    assert "needs.retry_dispatch.result == 'success'" in wave_two
    assert "needs: [retry_prepare_2, retry_dispatch_2, retry_2]" in wave_three
    assert "needs.retry_prepare_2.result == 'success'" in wave_three
    assert "needs.retry_dispatch_2.result == 'success'" in wave_three

def test_retry_status_reconciles_every_wave_and_assembly_waits_for_it():
    workflow = WORKFLOW_PATH.read_text(encoding="utf-8")
    retry_status = _job_block(workflow, "retry_status", "assemble")
    for name in ("retry_dispatch", "retry_dispatch_2", "retry_dispatch_3", "retry_prepare_2", "retry_prepare_3", "retry_2", "retry_3"):
        assert name in retry_status
    assert "RIVERSHIFT_RETRY_DISPATCH_STATUSES:" in retry_status
    assert "RIVERSHIFT_RETRY_PREPARE_STATUSES:" in retry_status
    assert "RIVERSHIFT_RETRY_COUNTS:" in retry_status
    assert "pattern: rivershift-retry-wave-*-product-*" in retry_status
    assert "if: always()" in retry_status
    assemble = workflow[workflow.find("  assemble:"):]
    assert "needs.retry_status.result == 'success'" in assemble

def test_initial_retry_worker_is_not_suppressed_by_failed_first_attempt_ancestors():
    workflow = WORKFLOW_PATH.read_text(encoding="utf-8")
    retry = _job_block(workflow, "retry", "retry_prepare_2")
    assert "needs: [retry_prepare, retry_dispatch]" in retry
    assert "!cancelled()" in retry
    assert "needs.retry_prepare.result == 'success'" in retry
    assert "needs.retry_dispatch.result == 'success'" in retry
    assert "needs.retry_prepare.outputs.retry_count != '0'" in retry
    assert "matrix: " + "$" + "{{ fromJSON(needs.retry_prepare.outputs.retry_matrix) }}" in retry

def test_root_workflow_exposes_the_complete_gated_twenty_job_processing_graph():
    workflow = WORKFLOW_PATH.read_text(encoding="utf-8")
    jobs_section = workflow.split("\njobs:\n", 1)[1]
    job_names = re.findall(r"^  ([A-Za-z0-9_-]+):\s*$", jobs_section, re.MULTILINE)
    expected = {
        "preflight", "prepare",
        "batch_1", "batch_1_status",
        "batch_2", "batch_2_status",
        "batch_3", "batch_3_status",
        "batch_4", "batch_4_status",
        "retry_prepare", "retry_dispatch", "retry",
        "retry_prepare_2", "retry_dispatch_2", "retry_2",
        "retry_prepare_3", "retry_dispatch_3", "retry_3",
        "retry_status", "assemble",
    }
    assert len(job_names) == 21
    assert set(job_names) == expected
    assert "permissions:\n  contents: read\n" in workflow
    assert "actions: write" not in workflow
    assert "needs: preflight" in _job_block(workflow, "prepare", "batch_1")

def test_processing_gate_is_fail_closed_and_receives_no_secret():
    workflow = WORKFLOW_PATH.read_text(encoding="utf-8")
    preflight = _job_block(workflow, "preflight", "prepare")
    assert "MONOREPO_RIVERSHIFT_PROCESSING_ENABLED" in preflight
    assert '!= "true"' in preflight
    assert "secrets." not in preflight
    assert "MONOREPO_PROCESSING_ENABLED" in preflight

def test_first_attempt_batches_are_sequential_with_verified_status_barriers():
    workflow = WORKFLOW_PATH.read_text(encoding="utf-8")
    cases = [
        ("batch_1", "batch_1_status", "prepare", None),
        ("batch_2", "batch_2_status", "batch_1_status", "batch_1_status"),
        ("batch_3", "batch_3_status", "batch_2_status", "batch_2_status"),
        ("batch_4", "batch_4_status", "batch_3_status", "batch_3_status"),
    ]
    for batch, status, predecessor, release_gate in cases:
        next_job = {
            "batch_1": "batch_1_status",
            "batch_2": "batch_2_status",
            "batch_3": "batch_3_status",
            "batch_4": "batch_4_status",
        }[batch]
        block = _job_block(workflow, batch, next_job)
        status_block = _job_block(
            workflow,
            status,
            {"batch_1_status": "batch_2", "batch_2_status": "batch_3",
             "batch_3_status": "batch_4", "batch_4_status": "retry_prepare"}[status],
        )
        assert "max-parallel: 15" in block
        expected_needs = (
            "needs: prepare"
            if batch == "batch_1"
            else f"needs: [prepare, {predecessor}]"
        )
        assert expected_needs in block
        assert "if: always()" in status_block
        assert f"needs: [prepare, {batch}]" in status_block
        if release_gate:
            assert f"needs.{release_gate}.result == 'success'" in block

def test_secret_scope_keeps_worker_data_credentials_out_of_product_and_status_jobs():
    workflow = WORKFLOW_PATH.read_text(encoding="utf-8")
    prepare = _job_block(workflow, "prepare", "batch_1")
    product = _job_block(workflow, "batch_1", "batch_1_status")
    status = _job_block(workflow, "batch_1_status", "batch_2")
    assemble = workflow[workflow.find("  assemble:"):]
    for name in (
        "RIVERSHIFT_CALLBACK_SECRET",
        "EARTHDATA_TOKEN",
        "EARTHDATA_USERNAME",
        "EARTHDATA_PASSWORD",
        "GOOGLE_DRIVE_OAUTH_CLIENT_JSON",
        "GOOGLE_DRIVE_REFRESH_TOKEN",
        "GOOGLE_DRIVE_PARENT_FOLDER_ID",
    ):
        assert f"secrets.{name}" in prepare
        assert f"secrets.{name}" in assemble
    assert "secrets.EARTHDATA_TOKEN" in product
    assert "secrets.EARTHDATA_USERNAME" in product
    assert "secrets.EARTHDATA_PASSWORD" in product
    assert "secrets.RIVERSHIFT_CALLBACK_SECRET" not in product
    assert "secrets.GOOGLE_DRIVE_OAUTH_CLIENT_JSON" not in product
    assert "secrets.GOOGLE_DRIVE_REFRESH_TOKEN" not in product
    assert "secrets.GOOGLE_DRIVE_PARENT_FOLDER_ID" not in product
    assert "secrets.RIVERSHIFT_CALLBACK_SECRET" in status
    assert "secrets.EARTHDATA_TOKEN" not in status
    assert "secrets.GOOGLE_DRIVE_OAUTH_CLIENT_JSON" not in status

def test_product_matrix_failures_remain_visible_and_are_not_continue_on_error():
    workflow = WORKFLOW_PATH.read_text(encoding="utf-8")
    product_jobs = [
        ("batch_1", "batch_1_status"),
        ("batch_2", "batch_2_status"),
        ("batch_3", "batch_3_status"),
        ("batch_4", "batch_4_status"),
        ("retry", "retry_prepare_2"),
        ("retry_2", "retry_prepare_3"),
        ("retry_3", "retry_status"),
    ]
    for name, next_job in product_jobs:
        block = _job_block(workflow, name, next_job)
        assert "max-parallel: 15" in block
        assert "continue-on-error: true" not in block
        assert "run: python -u engines/river-shift/tools/river_shift/batched_gcov_job.py" in block
