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
        fail("expected four separately classified API feature paths")

    expected_primary = {
        ".github/workflows/sarguardian-aoi-wkt-dashboard.yml",
        ".github/workflows/sarguardian-aoi-dashboard-engine.yml",
        ".github/workflows/sarguardian-aoi-product-worker.yml",
    }
    expected_gated = {".github/workflows/river-shift-gcov-process.yml"}
    expected_preserved = {
        ".github/workflows/know-place-aoi-dispatcher.yml",
        ".github/workflows/know-place-aoi-analysis.yml",
        ".github/workflows/know-place-paper-reproduction-dispatcher.yml",
        ".github/workflows/know-place-author-exact-replay.yml",
    }
    primary = set(scope.get("runtime_workflow_allowlist", []))
    gated = set(scope.get("gated_feature_workflow_allowlist", []))
    preserved = set(scope.get("preserved_disabled_feature_workflow_allowlist", []))
    if primary != expected_primary:
        fail("primary runtime allowlist must contain only the three proven Find Displacements workflows")
    if gated != expected_gated:
        fail("gated feature allowlist must contain only the positive-case-pilot RiverShift workflow")
    if preserved != expected_preserved:
        fail("preserved disabled-feature allowlist differs from the separately retained Known Place call graph")
    all_feature_workflows = primary | gated | preserved
    if len(primary) + len(gated) + len(preserved) != len(all_feature_workflows):
        fail("primary, gated and preserved workflow allowlists must be disjoint")

    expected_ci = {
        ".github/workflows/snapshot-regression-tests.yml",
        ".github/workflows/backend-source-regression-tests.yml",
        ".github/workflows/migration-metadata.yml",
        ".github/workflows/historical-secret-scan.yml",
        ".github/workflows/retention-archive-tests.yml",
        ".github/workflows/dashboard-assets-test.yml",
        ".github/workflows/sarguardian-aoi-code-validation.yml",
    }
    ci = set(scope.get("migration_ci_allowlist", []))
    if ci != expected_ci:
        fail("migration CI allowlist differs from the reviewed test/verification set")
    if ci & all_feature_workflows:
        fail("product runtime and migration CI workflows must remain separate")
    for path in all_feature_workflows | ci:
        require_file(path)

    # Dynamic's active Web/API is promoted; preserve the feature APIs separately.
    require_contains(
        "apps/api/app/main.py",
        '@app.post("/api/displacement-jobs"',
        "include_router(river_shift_jobs_router)",
        '@app.post("/api/known-place-analysis"',
        '@app.post("/api/known-place-paper-reproduction"',
    )
    require_file("apps/web/package.json")
    require_file("apps/api/app/persistence.py")

    # Primary current path: Dynamic API dispatch -> Monorepo dashboard engine -> one-product worker.
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
        "migration/source-snapshots/nisar-pins/006d4cd",
    )
    require_contains(
        ".github/workflows/sarguardian-aoi-product-worker.yml",
        "006d4cd1485cf80e509eaf8717c12e9c6390ac09",
        "GOOGLE_DRIVE_PARENT_FOLDER_ID",
    )
    require_file("migration/source-snapshots/nisar-pins/006d4cd/README.md")

    # RiverShift is kept separate and gated until a positive-case pilot succeeds.
    require_contains(
        ".github/workflows/river-shift-gcov-process.yml",
        "MONOREPO_RIVERSHIFT_PROCESSING_ENABLED",
        "max-parallel: 15",
        "retry_status:",
        "acquisition_compatibility_audit",
    )
    require_contains(
        "engines/river-shift/tools/river_shift/batched_gcov_job.py",
        "GOOGLE_DRIVE_PARENT_FOLDER_ID",
    )

    # Known Place is not in the primary allowlist. Preserve both paths and their exact gates.
    require_contains(
        ".github/workflows/know-place-aoi-dispatcher.yml",
        "MONOREPO_KNOWN_PLACE_ACTIONS_ENABLED",
        "uses: ./.github/workflows/know-place-aoi-analysis.yml",
    )
    require_contains(
        ".github/workflows/know-place-paper-reproduction-dispatcher.yml",
        "uses: ./.github/workflows/know-place-author-exact-replay.yml",
        "b825df798ea4cb9874aa10dd01174d2a8ef73cba",
    )
    require_contains(
        ".github/workflows/know-place-author-exact-replay.yml",
        "MONOREPO_KNOWN_PLACE_PAPER_REPRODUCTION_ENABLED",
        "b825df798ea4cb9874aa10dd01174d2a8ef73cba",
    )

    # API defaults remain fail-closed for dispatch, even before repository-level gates.
    config = require_contains(
        "apps/api/app/config.py",
        '_flag(values, "DISPLACEMENT_ACTIONS_ENABLED", False)',
        '_flag(values, "RIVERSHIFT_ACTIONS_ENABLED", False)',
    )
    if "DISPLACEMENT_ACTIONS_ENABLED=true" in config or "RIVERSHIFT_ACTIONS_ENABLED=true" in config:
        fail("API runtime defaults must remain fail-closed")

    disposition = json.loads((ROOT / "migration" / "workflow-dispositions.json").read_text(encoding="utf-8"))
    instances = disposition.get("workflow_instances", [])
    if len(instances) != 82:
        fail("all 82 source workflow instances must remain preserved as provenance")
    counts = {item["id"]: item["expected_workflow_count"] for item in disposition.get("sources", [])}
    if counts != {"dynamic-main": 7, "backend-main": 35, "backend-known-place-pr85": 40}:
        fail(f"unexpected source workflow provenance counts: {counts}")

    evidence = scope.get("evidence", {})
    fd = evidence.get("find_displacements", {})
    if not (
        fd.get("conclusion") == "success"
        and fd.get("jobs_total") == 20
        and fd.get("jobs_success") == 19
        and fd.get("jobs_failed_initial_attempt") == 1
        and fd.get("retry_conclusion") == "success"
        and fd.get("final_dashboard_conclusion") == "success"
        and fd.get("terminal_callback_conclusion") == "success"
    ):
        fail("Find Displacements primary runtime evidence is incomplete or inconsistent")
    rs = evidence.get("river_shift", {})
    if not (
        rs.get("error_code") == "EVENT_WINDOW_NOT_BRACKETED"
        and rs.get("catalogue_exact_matches") == 14
        and rs.get("product_batches_started") is False
    ):
        fail("RiverShift evidence must retain the observed eligibility fail-closed distinction")
    kp = evidence.get("known_place", {})
    if kp.get("matching_dispatches_in_latest_100_backend_runs") != 0:
        fail("Known Place recent-run evidence must be refreshed before moving it into primary scope")

    print(
        "ACTIVE_RUNTIME_SCOPE=PASS "
        f"primary_runtime_workflows={len(primary)} "
        f"gated_feature_workflows={len(gated)} "
        f"preserved_disabled_feature_workflows={len(preserved)} "
        f"migration_ci_workflows={len(ci)} "
        f"api_feature_paths={len(paths)} "
        f"source_workflow_instances={len(instances)}"
    )
    print("PRIMARY_RUNTIME=find-displacements")
    print("GATED_FEATURE=river-shift-positive-case-pilot-required")
    print("PRESERVED_DISABLED_FEATURES=known-place-generic,known-place-author-exact-p05023")
    print("NOTE=scope-validation-does-not-claim-live-preview-authentication-or-production-cutover")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
