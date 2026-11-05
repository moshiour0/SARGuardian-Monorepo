# Historical secret scanning

## Scanner and coverage

- Scanner: Gitleaks CLI 8.30.1.
- Binary: official Linux x64 release asset, SHA-256 verified in the runner before execution.
- Checkout: full history (`fetch-depth: 0`).
- Git scan: `gitleaks git --redact --log-opts=--all`, which scans patches across all reachable refs/commits in the checkout rather than only the latest working tree.
- Reports are written only to the ephemeral runner temp directory, parsed for safe metadata, and deleted. No SARIF/report artifact is uploaded and no `Match` or `Secret` field is printed.

## Initial triage

The first full-history scan produced 20 `generic-api-key` findings. All were in test files:
- deterministic `idempotency-key-001` style test IDs;
- `displacement-test-001` style test IDs;
- explicit Google Maps test environment/header stubs and a corresponding URL assertion.

The findings were inspected at the cited historical commit/path/line. The test values are mock fixture inputs, not credentials for a live Google Cloud project, GitHub account, or deployment. No finding was reported in an environment file, production configuration module, deployment workflow, or live runtime adapter.

## Narrow false-positive handling

The root `.gitleaksignore` contains exactly the 20 reviewed `commit:path:rule:line` fingerprints. It does **not** ignore:
- all files in test directories;
- the `generic-api-key` rule;
- any whole source repository or snapshot path;
- new commits, changed lines, or new test values.

A new value or changed line receives a new fingerprint and fails the scan until separately reviewed. Do not add broad path/rule ignores to quiet findings.

## Remediation policy

If a future scan points to a probable real credential:
1. stop merge/cutover;
2. identify the owning service/provider without printing the value;
3. rotate/revoke it at the provider;
4. check logs/artifacts and downstream copies;
5. remove the value from current code and, where necessary, coordinate source-history remediation;
6. add a fingerprint exception only when the value is proven synthetic and the exact finding is documented.

A passing Gitleaks scan means no unreviewed finding was detected in the scanned Git history; it does not prove that a provider credential is active, inactive, or never leaked outside this repository.
