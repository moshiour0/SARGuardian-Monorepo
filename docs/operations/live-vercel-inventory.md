# Live Vercel inventory — read-only audit

**Audited:** 2026-11-05  
**Team:** `moshiour-rahman-sarkers-projects-2cebe363`  
**Plan:** Hobby  
**Change scope:** inspection only; no project, root directory, environment, alias, or deployment changed.

## Existing Git-linked projects

| Existing project | Project ID | Framework | Linked repository | Latest observed production |
|---|---|---|---|---|
| `sar-guardian-dynamic` | `prj_2wYF8FsOkzI0acPS0qINWGTZfwKQ` | Vite | `moshiour0/SARGuardian_Dynamic` | READY, main `42d977b5abd186866ac0d78454239563eebb18d2` |
| `sarguardian-backend-api` | `prj_Dzh0myaGpcseGXWIj2PIZVSW2vXS` | FastAPI | `moshiour0/SARGuardian_Dynamic` | READY, main `42d977b5abd186866ac0d78454239563eebb18d2` |

Verified domains:
- Frontend: `sar-guardian-dynamic-lilac.vercel.app`
- API: `sarguardian-backend-api.vercel.app`

The Monorepo is not yet linked to either Vercel project. No new Vercel project was created during migration.

## Existing environment-variable inventory (names and non-secret routing only)

### Frontend project

The project contains production and preview configuration for:
- `VITE_SARGUARDIAN_API_URL`
- Firebase browser configuration: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_GOOGLE_MAPS_API_KEY`

The production `VITE_SARGUARDIAN_API_URL` points to the existing API domain. A branch-scoped Preview override exists for a previous frontend integration branch. Sensitive browser key values were not decrypted.

One unexplained Production environment entry named `re` was also returned by the Vercel inventory. It was not decrypted, edited, or removed. It should be reviewed by the project owner in the Vercel dashboard to determine whether it is obsolete or a typo.

### API project

Observed configuration names include:
- Runtime/auth: `APP_ENV`, `FIREBASE_SERVICE_ACCOUNT_JSON`, `CORS_ORIGINS`, `PUBLIC_API_URL`
- Supabase: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- Dispatch: `GITHUB_ACTIONS_TOKEN`, `GITHUB_ACTIONS_REPOSITORY`, `GITHUB_ACTIONS_WORKFLOW`, `GITHUB_ACTIONS_REF`, `DISPLACEMENT_ACTIONS_ENABLED`, `DISPLACEMENT_CALLBACK_SECRET`
- RiverShift: `RIVERSHIFT_ACTIONS_ENABLED`, `RIVERSHIFT_GITHUB_ACTIONS_REPOSITORY`, `RIVERSHIFT_GITHUB_ACTIONS_WORKFLOW`, `RIVERSHIFT_GITHUB_ACTIONS_REF`, `RIVERSHIFT_PUBLIC_API_URL`, `RIVERSHIFT_CALLBACK_SECRET`
- Drive/ASF: `GOOGLE_DRIVE_OAUTH_CLIENT_JSON`, `GOOGLE_DRIVE_REFRESH_TOKEN`, `GOOGLE_DRIVE_FOLDER_ID`, plus ASF catalogue configuration.

Sensitive values were not decrypted or copied. Existing plain endpoint/repository/ref values were inspected only to establish current routing.

**Important routing decision:** the production API currently dispatches to `moshiour0/SARGuardian-backend` on `main`, including `sarguardian-aoi-wkt-dashboard.yml` and `river-shift-gcov-process.yml`. Keep those dispatch destinations and callback URLs unchanged during the first Monorepo Preview. New Monorepo root workflows must not replace old workers until request/callback/artifact/retry parity is separately tested and cutover is approved.

The existing API Vercel project contains a production `GOOGLE_DRIVE_FOLDER_ID` setting. This is not the same thing as the existing GitHub Actions variable documented in the processing workflows as `Google drive parent folder id`. Do not conflate or rename these two consumers during migration.

## Remaining Vercel checks

The connected Vercel context can read existing project summaries, aliases, latest deployments, and environment variable names. A team-scoped project-list request requiring full team authorization returned 403, and the consent-link attempt did not resolve the team grant. Therefore the exact existing project Root Directory/build settings and GitHub repository connection controls are **not yet independently verified** from the available read path.

Before creating the Monorepo Preview projects:
1. inspect each current Vercel project's Root Directory, build/install/output commands, and Git production branch in Vercel Settings;
2. confirm frontend/API Preview env scopes separately from Production;
3. confirm the Monorepo GitHub repo is accessible to the Vercel Git integration;
4. create separate Monorepo Vercel projects for `apps/web` and `apps/api` with the correct root directories only after settings are ready;
5. deploy Preview only; do not assign the current production aliases.

No production Vercel setting, environment variable, domain, or deployment was changed by this audit.
