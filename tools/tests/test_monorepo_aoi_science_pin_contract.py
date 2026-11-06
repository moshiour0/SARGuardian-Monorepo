"""Regression checks for the active reusable AOI workflow's science revision binding."""

from pathlib import Path

import yaml


ROOT = Path(__file__).resolve().parents[2]
ENGINE_WORKFLOW = ROOT / ".github" / "workflows" / "sarguardian-aoi-dashboard-engine.yml"
PRODUCT_WORKER = ROOT / ".github" / "workflows" / "sarguardian-aoi-product-worker.yml"
DISCOVERY_TOOL = ROOT / "engines" / "find-displacements" / "tools" / "discover_aoi_products.py"
SCIENCE_ROOT = ROOT / "migration" / "source-snapshots" / "nisar-pins" / "006d4cd"
EXPECTED_SCIENCE_COMMIT = "006d4cd1485cf80e509eaf8717c12e9c6390ac09"


def test_reusable_workflow_exports_one_immutable_science_pin_to_all_jobs() -> None:
    workflow = yaml.load(ENGINE_WORKFLOW.read_text(encoding="utf-8"), Loader=yaml.BaseLoader)

    assert workflow["env"]["SCIENCE_COMMIT"] == EXPECTED_SCIENCE_COMMIT
    assert (SCIENCE_ROOT / "README.md").is_file()
    assert (SCIENCE_ROOT / "requirements.txt").is_file()

    workflow_text = ENGINE_WORKFLOW.read_text(encoding="utf-8")
    assert workflow_text.count('echo "SCIENCE_REVISION_VERIFIED=$SCIENCE_COMMIT"') == 2
    assert workflow_text.count("SCIENCE_REVISION_STORAGE=IMMUTABLE_MONOREPO_SNAPSHOT") == 2


def test_reusable_workflow_pin_matches_worker_and_discovery_tool_pins() -> None:
    worker = PRODUCT_WORKER.read_text(encoding="utf-8")
    discovery = DISCOVERY_TOOL.read_text(encoding="utf-8")

    assert f"SCIENCE_COMMIT: {EXPECTED_SCIENCE_COMMIT}" in worker
    assert f'SCIENCE_COMMIT = "{EXPECTED_SCIENCE_COMMIT}"' in discovery
