#!/usr/bin/env python3
"""Compare imported monorepo snapshot entries with their exact source Git trees."""

from __future__ import annotations

import subprocess
import sys
from dataclasses import dataclass


@dataclass(frozen=True)
class Snapshot:
    label: str
    source_sha: str
    destination_prefix: str


SNAPSHOTS = (
    Snapshot(
        "Dynamic main",
        "dd64b7adc90594f1d7f316b352e39fbac2013cb6",
        "migration/source-snapshots/dynamic",
    ),
    Snapshot(
        "Backend main",
        "97d849454918b1425ac41bb70e7a32d11cfd3833",
        "migration/source-snapshots/backend-main",
    ),
    Snapshot(
        "Known Place PR #85 head",
        "bfde7dde8ada92a03054cd8dbad8daa7a5c119f8",
        "migration/source-snapshots/backend-known-place-pr85",
    ),
    Snapshot(
        "NISAR science main",
        "9fcb543ef28a7f6fe70a379aed9cfe3e43e277ec",
        "migration/source-snapshots/nisar-science",
    ),
    Snapshot(
        "NISAR historical pin 10639",
        "10639a916c9829850775410b3ed7de62e527770d",
        "migration/source-snapshots/nisar-pins/10639a9",
    ),
    Snapshot(
        "NISAR historical pin 006d",
        "006d4cd1485cf80e509eaf8717c12e9c6390ac09",
        "migration/source-snapshots/nisar-pins/006d4cd",
    ),
)

ANCESTOR_CHECKS = (
    (
        "Known Place feature branch base",
        "bd7a59c54ddae7c19fd88896e877c3a530b43d9e",
        "bfde7dde8ada92a03054cd8dbad8daa7a5c119f8",
    ),
    (
        "Historical extended-science pin",
        "ab547ecc82bcc4d6ccef545a59852536c2beacc6",
        "9fcb543ef28a7f6fe70a379aed9cfe3e43e277ec",
    ),
)


def git(*args: str) -> bytes:
    completed = subprocess.run(
        ["git", *args],
        check=False,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    if completed.returncode:
        message = completed.stderr.decode("utf-8", errors="replace").strip()
        raise RuntimeError(f"git {' '.join(args)} failed: {message}")
    return completed.stdout


def tree_entries(revision: str) -> dict[str, tuple[str, str, str]]:
    """Return path -> (mode, object type, object SHA), preserving raw path names."""
    raw = git("ls-tree", "-r", "-z", "--full-tree", revision)
    result: dict[str, tuple[str, str, str]] = {}
    for record in raw.split(b"\0"):
        if not record:
            continue
        try:
            metadata, path_bytes = record.split(b"\t", 1)
            mode, object_type, object_sha = metadata.decode("ascii").split(" ")
            path = path_bytes.decode("utf-8")
        except (ValueError, UnicodeDecodeError) as exc:
            raise RuntimeError(f"Cannot parse git ls-tree record: {exc}") from exc
        result[path] = (mode, object_type, object_sha)
    return result


def check_ancestor(label: str, ancestor: str, descendant: str) -> None:
    result = subprocess.run(
        ["git", "merge-base", "--is-ancestor", ancestor, descendant],
        check=False,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE,
    )
    if result.returncode == 1:
        raise RuntimeError(
            f"{label} is not preserved as an ancestor: {ancestor} -> {descendant}"
        )
    if result.returncode != 0:
        message = result.stderr.decode("utf-8", errors="replace").strip()
        raise RuntimeError(f"Cannot verify {label}: {message}")
    print(f"ANCESTRY_PASS {label}: {ancestor} -> {descendant}")


def main() -> int:
    target = git("rev-parse", "HEAD").decode("ascii").strip()
    target_entries = tree_entries(target)
    print(f"TARGET_COMMIT={target}")
    print(f"TARGET_TRACKED_ENTRIES={len(target_entries)}")

    total = 0
    for snapshot in SNAPSHOTS:
        # Failing here means the checkout did not fetch the source history parents.
        git("cat-file", "-e", f"{snapshot.source_sha}^{{tree}}")
        source_entries = tree_entries(snapshot.source_sha)
        prefix = snapshot.destination_prefix + "/"
        imported_entries = {
            path[len(prefix) :]: entry
            for path, entry in target_entries.items()
            if path.startswith(prefix)
        }

        missing = sorted(set(source_entries) - set(imported_entries))
        extra = sorted(set(imported_entries) - set(source_entries))
        changed = sorted(
            path
            for path in set(source_entries) & set(imported_entries)
            if source_entries[path] != imported_entries[path]
        )
        if missing or extra or changed:
            details = [
                f"{snapshot.label}: expected={len(source_entries)} imported={len(imported_entries)}",
                f"missing sample={missing[:10]}",
                f"extra sample={extra[:10]}",
                f"changed object sample={changed[:10]}",
            ]
            raise RuntimeError("; ".join(details))

        total += len(source_entries)
        print(
            f"SNAPSHOT_BLOB_INTEGRITY_PASS {snapshot.label}: "
            f"{len(source_entries)} entries at {snapshot.source_sha}"
        )

    promoted_paths = (
        (
            "Dynamic frontend promotion",
            "migration/source-snapshots/dynamic/Frontend/",
            "apps/web/",
        ),
        (
            "Dynamic active API promotion",
            "migration/source-snapshots/dynamic/Backend/",
            "apps/api/",
        ),
        (
            "Dynamic shared tools promotion",
            "migration/source-snapshots/dynamic/tools/",
            "apps/tools/",
        ),
        (
            "Dynamic workflow compatibility promotion",
            "migration/source-snapshots/dynamic/.github/workflows/",
            "apps/.github/workflows/",
        ),
    )
    for label, source_prefix, destination_prefix in promoted_paths:
        source_view = {
            path[len(source_prefix) :]: entry
            for path, entry in target_entries.items()
            if path.startswith(source_prefix)
        }
        destination_view = {
            path[len(destination_prefix) :]: entry
            for path, entry in target_entries.items()
            if path.startswith(destination_prefix)
        }
        if source_view != destination_view:
            missing = sorted(set(source_view) - set(destination_view))
            extra = sorted(set(destination_view) - set(source_view))
            changed = sorted(
                path
                for path in set(source_view) & set(destination_view)
                if source_view[path] != destination_view[path]
            )
            raise RuntimeError(
                f"{label}: source={len(source_view)} destination={len(destination_view)}; "
                f"missing={missing[:10]}; extra={extra[:10]}; changed={changed[:10]}"
            )
        print(f"PROMOTED_PATH_BLOB_INTEGRITY_PASS {label}: {len(source_view)} entries")

    for label, ancestor, descendant in ANCESTOR_CHECKS:
        check_ancestor(label, ancestor, descendant)

    print(f"ALL_SNAPSHOT_BLOB_INTEGRITY_PASS total_entries={total}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except RuntimeError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
