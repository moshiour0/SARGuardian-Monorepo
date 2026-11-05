# Historical secret scanning

<badge color="success">Full-history scan passed</badge>

## Scanner and coverage

- Scanner: Gitleaks CLI 8.30.1.
- Binary: official Linux x64 release asset, SHA-256 verified before execution:
  `551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb`.
- Checkout: full history (`fetch-depth: 0`).
- Git scan: `gitleaks git --redact --exit-code=1 --report-format=json --report-path=... --log-opts=--all .`.
- The scan traverses commits reachable from all fetched refs, including preserved source commit parents; it is not limited to the current working tree or latest commit.
- Reports are written only to the ephemeral runner temp directory, parsed for safe metadata, and deleted. No SARIF/report artifact is uploaded and no `Match` or `Secret` field is printed.

## Initial triage and reviewed false positives

The first full-history scan produced 20 `generic-api-key` findings. All were in test files:
- deterministic `idempotency-key-001`-style test IDs;
- `displacement-test-001`-style test IDs;
- explicit Google Maps test environment/header stubs and a corresponding test URL assertion.

The historical source lines were inspected without exposing the literal values in logs. The key-like values are synthetic test inputs/stubs, not credentials for a live Google Cloud project, GitHub account, or deployment. No finding appeared in an environment file, production configuration module, deployment workflow, or live runtime adapter.

## Narrow false-positive handling

The root `.gitleaksignore` contains exactly the 20 reviewed `commit:path:rule:line` fingerprints. It does **not** ignore:
- all files in test directories;
- the `generic-api-key` rule;
- any whole source repository or snapshot path;
- new commits, changed lines, or new test values.

`tools/validate_gitleaks_allowlist.py` enforces:
- exactly 20 entries;
- unique fingerprints;
- the `generic-api-key` rule only;
- test-file paths only;
- exact commit and line coordinates.

The allowlist is checked by [Migration Metadata Validation](../.github/workflows/migration-metadata.yml). A new value or changed line receives a new fingerprint and fails the scan until separately reviewed.

## Latest result

- Latest full-history scan workflow: [run 41964029586](https://github.com/moshiour0/SARGuardian-Monorepo/actions/runs/41964029586).
- Result: **PASS** on the latest migration branch head `25aa5c76f04b1b1e3a7588a24ff3b29317ebc54c`.
- Gitleaks unignored finding count: **0**.
- The RiverShift candidate workflow and its validator were included in this scanned commit.
- Allowlist validator: **PASS** in metadata-validation CI.
- No raw report artifact retained.

A passing Gitleaks scan means no unreviewed finding was detected in the scanned Git history. It does not prove that a provider credential is active, inactive, or never leaked outside this repository. If a future scan points to a probable real credential:
1. stop merge/cutover;
2. identify the owning service/provider without printing the value;
3. rotate/revoke it at the provider;
4. check logs/artifacts and downstream copies;
5. remove it from current code and coordinate source-history remediation where needed;
6. add a fingerprint exception only when the value is proven synthetic and the exact finding is documented.
