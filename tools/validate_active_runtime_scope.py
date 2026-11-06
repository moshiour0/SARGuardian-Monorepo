#!/usr/bin/env python3
"""Enforce the evidence-based active SARGuardian runtime scope."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCOPE_PATH = ROOT / "migration" / "active-runtime-scope.json"


def fail(message: str) -> None:
    print(f"ACTIVE_RUNTIME_SCOPE_ERROR={message}", file=sys.stderr)
    raise SystemExit(1)


def require_file(relative: str) -> str:
    path = ROOT / relative
    if not path.is_file():
        fail(f"required active runtime file is missing: {relative}")
    return path.read_text(encoding="utf-8")


def require_contains(relative: str, *needles: str) -> str:
    content = require_file(relative)
    for needle in needles:
        if needle not in content:
            fail(f"{relative} is missing required contract marker: {needle}")
    return content


def main() -> int:
    scope = json.loads(SCOPE_PATH.read_text(encoding="utf-8"))
    if scope.get("schema_version") != 1:
        fail("unsupported active runtime scope schema")

    paths = scope.get("runtime_paths")
    if not isinstance(paths, list) or len(paths) != 4:
        fail("expected exactly four separately classified runtime paths")

    expected_runtime_files = {
        ".github/workflows/sarguardian-aoi-wkt-dashboard.yml",
        ".github/workflows/sarguardian-aoi-dashboard-engine.yml",
        ".github/workflows/sarguardian-aoi-product-worker.yml",
        ".github/workflows/river-shift-gcov-process.yml",
        ".github/workflows/know-place-aoi-dispatcher.yml",
        ".github/workflows/know-place-aoi-analysis.yml",
        ".github/workflows/know-place-paper-reproduction-dispatcher.yml",
        ".github/workflows/know-place-author-exact-replay.yml",
    }
    runtime_allowlist = set(scope.get("runtime_workflow_allowlist", []))
    if runtime_allowlist != expected_runtime_files:
        fail("runtime workflow allowlist differs from the reviewed API call graph")
    if len(scope.get("runtime_workflow_allowlist", [])) != len(runtime_allowlist):
        fail("duplicate workflow in runtime allowlist")

    expected_ci_files = {
        ".github/workflows/snapshot-regression-tests.yml",
        ".github/workflows/backend-source-regression-tests.yml",
        ".github/workflows/migration-metadata.yml",
        ".github/workflows/historical-secret-scan.yml",
        ".github/workflows/retention-archive-tests.yml",
        ".github/workflows/dashboard-assets-test.yml",
        ".github/workflows/sarguardian-aoi-code-validation.yml",
    }
    ci_allowlist = set(scope.get("migration_ci_allowlist", []))
    if ci_allowlist != expected_ci_files:
        fail("migration CI allowlist differs from the reviewed test/verification set")
    if runtime_allowlist & ci_allowlist:
        fail("runtime workflows and migration CI workflows must remain separate")
    for path in runtime_allowlist | ci_allowlist:
        require_file(path)

    # Dynamic's active app/API is promoted; preserve the distinct public routes.
    api_main = require_contains(
        "apps/api/app/main.py",
        '@app.post("/api/displacement-jobs"',
        "include_router(river_shift_jobs_router)",
        '@app.post("/api/known-place-analysis"',
        '@app.post("/api/known-place-paper-reproduction"',
    )
    require_file("apps/web/package.json")
    require_file("apps/api/app/persistence.py")

    # The currently proven Find Displacements caller and its exact local worker chain.
    require_contains(
        ".github/workflows/sarguardian-aoi-wkt-dashboard.yml",
        "workflow_dispatch:",
        "MONOREPO_DISPLACEMENT_ACTIONS_ENABLED",
        "uses: ./.github/workflows/sarguardian-aoi-dashboard-engine.yml",
    )
    require_contains(
        ".github/workflows/sarguardian-aoi-dashboard-engine.yml",
        "uses: ./.github/workflows/sarguardian-aoi-product-worker.yml",
        "max-parallel: 15",
    )
    require_contains(
        ".github/workflows/sarguardian-aoi-product-worker.yml",
        "006d4cd1485cf80e509eaf8717c12e9c6390ac09",
        "GOOGLE_DRIVE_PARENT_FOLDER_ID",
    )

    # RiverShift remains a distinct GCOV feature and fails closed before work.
    require_contains(
        ".github/workflows/river-shift-gcov-process.yml",
        "MONOREPO_RIVERSHIFT_PROCESSING_ENABLED",
        "max-parallel: 15",
        "retry_status:",
    )
    require_contains("engines/river-shift/tools/river_shift/batched_gcov_job.py", "EVENT_WINDOW_NOT_BRACKETED")

    # Preserve both Known Place paths, their separate gates and exact pins.
    require_contains(
        ".github/workflows/know-place-aoi-dispatcher.yml",
        "MONOREPO_KNOWN_PLACE_ACTIONS_ENABLED",
        "uses: ./.github/workflows/know-place-aoi-analysis.yml",
    )
    require_contains(
        ".github/workflows/know-place-paper-reproduction-dispatcher.yml",
        "MONOREPO_KNOWN_PLACE_PAPER_REPRODUCTION_ENABLED",
        "uses: ./.github/workflows/know-place-author-exact-replay.yml",
        "b825df798ea4cb9874aa10dd01174d2a8ef73cba",
    )

    # Never turn on production dispatch from a source-migration change.
    config = require_contains(
        "apps/api/app/config.py",
        '_flag(values, "DISPLACEMENT_ACTIONS_ENABLED", False)',
        '_flag(values, "RIVERSHIFT_ACTIONS_ENABLED", False)',
    )
    if "DISPLACEMENT_ACTIONS_ENABLED=true" in config or "RIVERSHIFT_ACTIONS_ENABLED=true" in config:
        fail("API runtime defaults must remain fail-closed")

    # The source inventory remains provenance-complete even though not all
    # source workflows are part of the active API call graph.
    disposition = json.loads((ROOT / "migration" / "workflow-dispositions.json").read_text(encoding="utf-8"))
    if len(disposition.get("workflow_instances", [])) != 82:
        fail("the full 82-instance source workflow inventory must remain preserved")
    source_counts = {item["id"]: item["expected_workflow_count"] for item in disposition.get("sources", [])}
    if source_counts != {
        "dynamic-main": 7,
        "backend-main": 35,
        "backend-known-place-pr85": 40,
    }:
        fail(f"unexpected source workflow provenance counts: {source_counts}")

    evidence = scope.get("evidence", {})
    fd = evidence.get("find_displacements", {})
    if not (
        fd.get("conclusion") == "success"
        and fd.get("jobs_total") == 20
        and fd.get("jobs_success") == 19
        and fd.get("jobs_failed_initial_attempt") == 1
        and fd.get("retry_conclusion") == "success"
    ):
        # A future audit should update this evidence explicitly, rather than
        # silently broadening the active scope.
        fail("Find Displacements live-run evidence is incomplete or inconsistent")
    rs = evidence.get("river_shift", {})
    if not (
        rs.get("error_code") == "EVENT_WINDOW_NOT_BRACKETED"
        and rs.get("catalogue_exact_matches") == 14
        and rs.get("product_batches_started") is False
    ):
        fail("RiverShift must retain the observed fail-closed eligibility distinction")
    kp = evidence.get("known_place", {})
    if kp.get("matching_dispatches_in_latest_100_backend_runs") != 0:
        fail("Known Place recent-run evidence must be explicitly refreshed before reclassification")

    print(
        "ACTIVE_RUNTIME_SCOPE=PASS "
        f"runtime_workflows={len(runtime_allowlist)} "
        f"migration_ci_workflows={len(ci_allowlist)} "
        f"api_feature_paths={len(paths)} "
        f"source_workflow_instances={len(disposition['workflow_instances'])}"
    )
    print("PRIMARY_RUNTIME=find-displacements")
    print("CONNECTED_FEATURE=river-shift-positive-case-pilot-required")
    print("PRESERVED_GATED_FEATURES=known-place-generic,known-place-author-exact-p05023")
    print("NOTE=scope_validation_does_not_claim_live_preview_authentication_or_production_cutover")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
