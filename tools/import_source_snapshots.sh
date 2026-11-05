#!/usr/bin/env bash
# Import immutable source trees into a monorepo snapshot with full Git ancestry.
# Run only from the isolated migration GitHub Actions workflow.

set -euo pipefail

DESTINATION_BRANCH="${DESTINATION_BRANCH:-migration/source-snapshot-import}"
BASE_COMMIT="$(git rev-parse HEAD)"
SOURCE_COMMITS=()
REPORT=()

add_source() {
  local label="$1"
  local prefix="$2"
  local url="$3"
  local expected_sha="$4"

  if [[ -e "$prefix" ]]; then
    echo "Refusing to overwrite existing snapshot path: $prefix" >&2
    exit 20
  fi

  echo "::group::Fetch $label at $expected_sha"
  git fetch --no-tags "$url" "$expected_sha"
  local source_commit
  source_commit="$(git rev-parse --verify 'FETCH_HEAD^{commit}')"
  if [[ "$source_commit" != "$expected_sha" ]]; then
    echo "Fetched SHA mismatch for $label: expected $expected_sha, got $source_commit" >&2
    exit 21
  fi

  local file_count
  file_count="$(git ls-tree -r --name-only "$source_commit" | wc -l | tr -d ' ')"
  git read-tree --prefix="$prefix/" -u "$source_commit^{tree}"
  SOURCE_COMMITS+=("$source_commit")
  REPORT+=("$label|$prefix|$source_commit|$file_count")
  echo "Imported $label: $file_count tracked paths at $source_commit"
  echo "::endgroup::"
}

echo "Destination branch: $DESTINATION_BRANCH"
echo "Base commit: $BASE_COMMIT"

add_source \
  "Dynamic main" \
  "migration/source-snapshots/dynamic" \
  "https://github.com/moshiour0/SARGuardian_Dynamic.git" \
  "dd64b7adc90594f1d7f316b352e39fbac2013cb6"

add_source \
  "Backend main" \
  "migration/source-snapshots/backend-main" \
  "https://github.com/moshiour0/SARGuardian-backend.git" \
  "97d849454918b1425ac41bb70e7a32d11cfd3833"

add_source \
  "Backend Known Place PR #85 head" \
  "migration/source-snapshots/backend-known-place-pr85" \
  "https://github.com/moshiour0/SARGuardian-backend.git" \
  "bfde7dde8ada92a03054cd8dbad8daa7a5c119f8"

add_source \
  "NISAR science main" \
  "migration/source-snapshots/nisar-science" \
  "https://github.com/moshiour0/SARGuardian.git" \
  "9fcb543ef28a7f6fe70a379aed9cfe3e43e277ec"

SNAPSHOT_TREE="$(git write-tree)"
PARENT_ARGS=()
for source_commit in "${SOURCE_COMMITS[@]}"; do
  PARENT_ARGS+=(-p "$source_commit")
done

MESSAGE=$'chore(migration): import immutable SARGuardian source snapshots\n\nSource snapshots are stored under migration/source-snapshots/.\nAll source SHAs are pinned in docs/migration/source-pins.json.\nThis commit keeps each imported source history as a parent.'
NEW_COMMIT="$(printf '%s\n' "$MESSAGE" | git commit-tree "$SNAPSHOT_TREE" -p "$BASE_COMMIT" "${PARENT_ARGS[@]}")"

git update-ref "refs/heads/$DESTINATION_BRANCH" "$NEW_COMMIT" "$BASE_COMMIT"
git push origin "refs/heads/$DESTINATION_BRANCH:refs/heads/$DESTINATION_BRANCH"

echo "::notice title=Snapshot import complete::Created $NEW_COMMIT with ${#SOURCE_COMMITS[@]} source-history parents"
printf '%s\n' "${REPORT[@]}"
echo "New commit: $NEW_COMMIT"
