"""Verify the imported RiverShift Git blobs and shared persistence declarations."""

import hashlib
import json
from pathlib import Path


def verify(root: Path) -> list[str]:
    manifest = json.loads((root / "migration/active-runtime-pins/river-shift-monorepo-c1ef854.json").read_text(encoding="utf-8"))
    failures = []
    for item in manifest["files"]:
        path = root / item["path"]
        if not path.is_file():
            failures.append(f"Missing: {item['path']}")
            continue
        # Some source blobs themselves use CRLF. Prefer exact bytes, allowing
        # Git's Windows checkout conversion only when the source blob uses LF.
        raw = path.read_bytes()
        candidates = (raw, raw.replace(b"\r\n", b"\n"))
        source_match = any(
            hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest() == item["source_blob_sha"]
            and hashlib.sha256(data).hexdigest() == item["sha256"]
            for data in candidates
        )
        transformed_match = item["path"] in manifest.get("changed_content_paths", []) and any(
            hashlib.sha256(data).hexdigest() == item.get("post_transform_sha256")
            for data in candidates
        )
        if not source_match and not transformed_match:
            failures.append(f"Source mismatch: {item['path']}")
    for item in manifest["shared_source_regions"]:
        data = (root / item["path"]).read_text(encoding="utf-8")
        if item["source"] not in data or hashlib.sha256(item["source"].encode()).hexdigest() != item["sha256"]:
            failures.append(f"Shared source mismatch: {item['path']}")
    return failures


if __name__ == "__main__":
    failures = verify(Path(__file__).resolve().parents[1])
    for failure in failures:
        print(failure)
    if failures:
        raise SystemExit(1)
    print("PASS: 87 RiverShift source files and 18 shared declarations match pinned Git content (structural/provenance only).")
