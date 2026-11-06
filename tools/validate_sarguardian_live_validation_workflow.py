#!/usr/bin/env python3
"""Fail-closed structural contract checks for the Monorepo live-retention port."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
WORKFLOW = ROOT / ".github" / "workflows" / "sarguardian-live-validation.yml"
EXPECTED_SCIENCE_COMMIT = "ab547ecc82bcc4d6ccef545a59852536c2beacc6"
EXPECTED_GRANULES = {
    ("GUNW", "NISAR_L2_PR_GUNW_026_048_D_074_028_4000_SH_20260723T125813_20260723T125848_20260816T125812_20260816T125846_P05023_N_F_J_001"),
    ("GOFF", "NISAR_L2_PR_GOFF_026_048_D_074_028_4000_SH_20260723T125813_20260723T125848_20260816T125812_20260816T125846_P05023_N_F_J_001"),
}


def fail(message: str) -> None:
    print(f"LIVE_RETENTION_WORKFLOW_ERROR={message}", file=sys.stderr)
    raise SystemExit(1)


def main() -> int:
    if not WORKFLOW.is_file():
        fail(f"missing workflow: {WORKFLOW}")

    raw = WORKFLOW.read_text(encoding="utf-8")
    try:
        workflow = yaml.safe_load(raw)
    except yaml.YAMLError as exc:
        fail(f"invalid YAML: {exc}")

    if not isinstance(workflow, dict):
        fail("workflow YAML root must be a mapping")
    events = workflow.get("on", workflow.get(True))
    if not isinstance(events, dict) or set(events) != {"workflow_dispatch"}:
        fail("live retention must remain workflow_dispatch-only")
    dispatch = events.get("workflow_dispatch")
    inputs = dispatch.get("inputs") if isinstance(dispatch, dict) else {}
    consent = inputs.get("confirm_live_retention") if isinstance(inputs, dict) else None
    if not isinstance(consent, dict) or consent.get("required") is not True or consent.get("type") != "boolean":
        fail("required boolean confirm_live_retention input is missing")

    permissions = workflow.get("permissions")
    if permissions != {"contents": "read"}:
        fail(f"unexpected token permissions: {permissions}")

    jobs = workflow.get("jobs")
    if not isinstance(jobs, dict) or set(jobs) != {"preflight", "validate-retention"}:
        fail("expected only preflight and validate-retention jobs")
    preflight = jobs["preflight"]
    preflight_text = json.dumps(preflight, sort_keys=True)
    if "MONOREPO_SARGUARDIAN_LIVE_VALIDATION_ENABLED" not in preflight_text:
        fail("repository opt-in gate is missing")
    if "inputs.confirm_live_retention" not in preflight_text or "secrets." in preflight_text:
        fail("per-run consent must be checked before the processing job receives secrets")
    if '!= "true"' not in preflight_text:
        fail("preflight must fail closed unless both gates equal the literal true string")

    processing = jobs["validate-retention"]
    if processing.get("needs") != "preflight":
        fail("processing must depend on successful credential-free preflight")
    strategy = processing.get("strategy", {})
    if strategy.get("fail-fast") is not False or strategy.get("max-parallel") != 1:
        fail("GUNW and GOFF retention jobs must run sequentially without matrix fail-fast")
    matrix = strategy.get("matrix", {}).get("include")
    observed = {
        (row.get("product_type"), row.get("granule_name"))
        for row in matrix or []
        if isinstance(row, dict)
    }
    if observed != EXPECTED_GRANULES:
        fail("fixed P05023 GUNW/GOFF products changed without a reviewed source update")

    encoded = json.dumps(processing, sort_keys=True)
    if EXPECTED_SCIENCE_COMMIT not in encoded:
        fail("exact ab547 science pin is missing")
    if "git worktree add --detach" not in encoded or "fetch-depth" not in encoded:
        fail("historical source must be materialized from the Monorepo's full Git history")
    if "engines/find-displacements/tools" not in encoded:
        fail("retention worker must use the promoted Monorepo tool package")
    if "DRIVE_ARCHIVE_VERIFICATION=PASS" not in encoded:
        fail("remote Drive archive receipt verification is missing")
    if "AUTOMATIC_RAW_DELETION=DISABLED" not in encoded:
        fail("non-destructive raw-retention boundary is missing")
    if "RENDER_CALLBACK_URL" in raw or "WORKER_CALLBACK_SECRET" in raw:
        fail("legacy callback secrets do not belong in this independent retention workflow")

    uses = re.findall(r"uses:\s*([^\s]+)", raw)
    for reference in uses:
        if "@" not in reference or not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+@[0-9a-f]{40}", reference):
            fail(f"third-party action is not pinned to a full commit SHA: {reference}")
    if re.search(r"repository:\s*moshiour0/SARGuardian|repository:\s*Sagormodak/SARGuardian", raw):
        fail("workflow must not check out an external science repository")

    print(
        "LIVE_RETENTION_WORKFLOW_CONTRACT=PASS "
        "products=GUNW,GOFF "
        f"science_commit={EXPECTED_SCIENCE_COMMIT} "
        "manual_only=true repository_gate=true per_run_consent=true "
        "drive_receipts=true automatic_raw_deletion=false"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
