#!/usr/bin/env python3
"""Validate the inactive RiverShift monorepo workflow candidate against its source."""

from __future__ import annotations

import re
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "migration/source-snapshots/backend-main/.github/workflows/river-shift-gcov-process.yml"
CANDIDATE = ROOT / "migration/workflow-candidates/river-shift-gcov-process.yml"

REPLACEMENTS = (
    ("actions/checkout@v4", "actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1"),
    ("actions/upload-artifact@v4", "actions/upload-artifact@cf430e030ddbb5b0abf93d22962f4752f3646cd9 # v7.0.2"),
    ("actions/download-artifact@v4", "actions/download-artifact@9000827ccba6bdab643e8b6fd33ac0654aef8333 # v8.0.2"),
    ("mamba-org/setup-micromamba@v3", "mamba-org/setup-micromamba@f457c30a868e4760d3a6fcea5f25dc655b8edf39 # v3"),
    ("environment-file: tools/river_shift/environment.yml", "environment-file: engines/river-shift/tools/river_shift/environment.yml"),
    ("python -u tools/river_shift/batched_gcov_job.py", "python -u engines/river-shift/tools/river_shift/batched_gcov_job.py"),
    ("python -u tools/river_shift/validate_retry_matrix.py", "python -u engines/river-shift/tools/river_shift/validate_retry_matrix.py"),
)


def main() -> int:
    source_text = SOURCE.read_text(encoding="utf-8")
    candidate_text = CANDIDATE.read_text(encoding="utf-8")
    expected = source_text

    for old, new in REPLACEMENTS:
        count = expected.count(old)
        if count == 0:
            raise SystemExit(f"ERROR=SOURCE_CONTRACT_TOKEN_MISSING token={old}")
        expected = expected.replace(old, new)

    if candidate_text != expected:
        raise SystemExit("ERROR=RIVERSHIFT_CANDIDATE_DIFFERS_BEYOND_APPROVED_PATH_AND_ACTION_PIN_CHANGES")

    source_doc = yaml.safe_load(source_text)
    candidate_doc = yaml.safe_load(candidate_text)
    if not isinstance(source_doc, dict) or not isinstance(candidate_doc, dict):
        raise SystemExit("ERROR=RIVERSHIFT_WORKFLOW_YAML_INVALID")
    source_jobs, candidate_jobs = source_doc.get("jobs"), candidate_doc.get("jobs")
    if not isinstance(source_jobs, dict) or not isinstance(candidate_jobs, dict):
        raise SystemExit("ERROR=RIVERSHIFT_WORKFLOW_JOBS_MISSING")
    if list(source_jobs) != list(candidate_jobs) or len(candidate_jobs) != 20:
        raise SystemExit("ERROR=RIVERSHIFT_20_JOB_GRAPH_CHANGED")

    if len(re.findall(r"(?m)^\s+max-parallel:\s*15\s*$", candidate_text)) != 7:
        raise SystemExit("ERROR=RIVERSHIFT_MAX_PARALLEL_MATRIX_COUNT_CHANGED")
    if candidate_text.count("environment-file: engines/river-shift/tools/river_shift/environment.yml") != 17:
        raise SystemExit("ERROR=RIVERSHIFT_ENVIRONMENT_FILE_PATH_COUNT_CHANGED")
    if "environment-file: tools/river_shift/environment.yml" in candidate_text:
        raise SystemExit("ERROR=RIVERSHIFT_OLD_ENVIRONMENT_PATH_REMAINS")
    if "python -u tools/river_shift/" in candidate_text:
        raise SystemExit("ERROR=RIVERSHIFT_OLD_SCRIPT_PATH_REMAINS")

    action_pins = {
        "actions/checkout": "3d3c42e5aac5ba805825da76410c181273ba90b1",
        "actions/upload-artifact": "cf430e030ddbb5b0abf93d22962f4752f3646cd9",
        "actions/download-artifact": "9000827ccba6bdab643e8b6fd33ac0654aef8333",
        "mamba-org/setup-micromamba": "f457c30a868e4760d3a6fcea5f25dc655b8edf39",
    }
    for action, sha in action_pins.items():
        if f"{action}@{sha}" not in candidate_text:
            raise SystemExit(f"ERROR=RIVERSHIFT_ACTION_PIN_MISSING action={action}")
    if re.search(r"(?m)^\s+uses:\s+[^\s]+@v\d", candidate_text):
        raise SystemExit("ERROR=RIVERSHIFT_UNPINNED_ACTION_TAG")

    required_contracts = (
        "cancel-in-progress: false",
        "rivershift-prepared-",
        "rivershift-product-",
        "rivershift-retry-wave-",
        "retention-days: 1",
        "continue-on-error: true",
        "retry_status:",
        "assemble:",
        "GOOGLE_DRIVE_PARENT_FOLDER_ID: " + chr(36) + "{{ secrets.GOOGLE_DRIVE_PARENT_FOLDER_ID }}",
    )
    for marker in required_contracts:
        if marker not in candidate_text:
            raise SystemExit(f"ERROR=RIVERSHIFT_REQUIRED_CONTRACT_MISSING marker={marker}")

    expected_counts = {
        "actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1": 20,
        "actions/upload-artifact@cf430e030ddbb5b0abf93d22962f4752f3646cd9": 8,
        "actions/download-artifact@9000827ccba6bdab643e8b6fd33ac0654aef8333": 30,
        "mamba-org/setup-micromamba@f457c30a868e4760d3a6fcea5f25dc655b8edf39": 17,
    }
    for marker, count in expected_counts.items():
        if candidate_text.count(marker) != count:
            raise SystemExit(f"ERROR=RIVERSHIFT_ACTION_OCCURRENCE_COUNT_CHANGED marker={marker}")

    print("RIVERSHIFT_MONOREPO_WORKFLOW_CANDIDATE_PASS")
    print(f"RIVERSHIFT_JOB_COUNT={len(candidate_jobs)}")
    print("RIVERSHIFT_CHECKOUT_PIN_COUNT=20")
    print("RIVERSHIFT_UPLOAD_PIN_COUNT=8")
    print("RIVERSHIFT_DOWNLOAD_PIN_COUNT=30")
    print("RIVERSHIFT_MICROMAMBA_PIN_COUNT=17")
    print("RIVERSHIFT_BATCH_RETRY_ARTIFACT_CALLBACK_RETENTION_CONTRACT=UNCHANGED")
    print("RIVERSHIFT_WORKFLOW_STATUS=INACTIVE_CANDIDATE_ONLY")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
