from __future__ import annotations

from pathlib import Path

import yaml


ROOT = Path(__file__).resolve().parents[1]
DISPATCHER = ROOT / ".github" / "workflows" / "sarguardian-aoi-wkt-dispatcher.yml"
ENGINE = ROOT / ".github" / "workflows" / "sarguardian-aoi-dashboard-engine.yml"


def load_workflow(path: Path) -> dict:
    value = yaml.load(path.read_text(encoding="utf-8"), Loader=yaml.BaseLoader)
    if not isinstance(value, dict) or not isinstance(value.get("jobs"), dict):
        raise SystemExit(f"Invalid workflow or missing jobs: {path}")
    return value


def main() -> int:
    dispatcher = load_workflow(DISPATCHER)
    engine = load_workflow(ENGINE)

    dispatch_inputs = dispatcher.get("on", {}).get("workflow_dispatch", {}).get("inputs", {})
    required_inputs = (
        "aoi_wkt", "start_date", "end_date",
        "date_filter_mode", "run_profile", "retention_profile",
    )
    missing = sorted(set(required_inputs) - set(dispatch_inputs))
    if missing:
        raise SystemExit(f"Dispatcher is missing inputs: {', '.join(missing)}")

    engine_inputs = engine.get("on", {}).get("workflow_call", {}).get("inputs", {})
    missing = sorted(set(required_inputs) - set(engine_inputs))
    if missing:
        raise SystemExit(f"Reusable engine is missing inputs: {', '.join(missing)}")

    jobs = dispatcher["jobs"]
    preflight = jobs.get("preflight", {})
    preflight_text = str(preflight)
    if "MONOREPO_DISPLACEMENT_ACTIONS_ENABLED" not in preflight_text:
        raise SystemExit("Find Displacements preflight variable is missing.")
    if '!= "true"' not in preflight_text:
        raise SystemExit("Find Displacements processing gate is not fail-closed.")

    run = jobs.get("run-isolated-aoi-pipeline", {})
    if run.get("needs") != "preflight":
        raise SystemExit("Processing must wait for the preflight gate.")
    if run.get("uses") != "./.github/workflows/sarguardian-aoi-dashboard-engine.yml":
        raise SystemExit("Dispatcher must call the local Monorepo reusable engine.")
    if "moshiour0/SARGuardian-backend" in str(run):
        raise SystemExit("Dispatcher still references the old Backend repository.")

    secrets = run.get("secrets", {})
    expected_secrets = {
        "DISPLACEMENT_CALLBACK_SECRET",
        "EARTHDATA_TOKEN",
        "EARTHDATA_USERNAME",
        "EARTHDATA_PASSWORD",
        "GOOGLE_DRIVE_OAUTH_CLIENT_JSON",
        "GOOGLE_DRIVE_REFRESH_TOKEN",
        "GOOGLE_DRIVE_PARENT_FOLDER_ID",
    }
    if set(secrets) != expected_secrets:
        raise SystemExit("Dispatcher secret scope does not match the reusable engine contract.")

    permissions = dispatcher.get("permissions", {})
    if permissions.get("contents") != "read" or permissions.get("actions") != "read":
        raise SystemExit("Dispatcher must use read-only workflow token permissions.")

    print("MONOREPO_FIND_DISPLACEMENTS_DISPATCHER_CONTRACT=PASS")
    print("MONOREPO_FIND_DISPLACEMENTS_LOCAL_REUSABLE_WORKFLOW=PASS")
    print("MONOREPO_FIND_DISPLACEMENTS_SECRET_SCOPE=PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
