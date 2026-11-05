# Live Vercel inventory — read-only audit

**Audited:** 2026-11-05  
**Team:** `moshiour-rahman-sarkers-projects-2cebe363`  
**Plan:** Hobby  
**Change scope:** inspection only; no project, root directory, environment, alias, or deployment changed.

## Existing Git-linked projects

| Existing project | Project ID | Framework | Linked repository | Latest observed production |
|---|---|---|---|---|
| `sar-guardian-dynamic` | `prj_2wYF8FsOkzI0acPS0qINWGTZfwKQ` | Vite | `moshiour0/SARGuardian_Dynamic` | READY, deployment `dpl_CLi5LFvrGUVKXuHyAbYXhBdQ9C9f`, main `42d977b5abd186866ac0d78454239563eebb18d2` |
| `sarguardian-backend-api` | `prj_Dzh0myaGpcseGXWIj2PIZVSW2vXS` | FastAPI | `moshiour0/SARGuardian_Dynamic` | READY, deployment `dpl_P7BBnE7PG7EiowYB2w7hS64ZmfMs`, main `42d977b5abd186866ac0d78454239563eebb18d2` |

Verified domains:
- Frontend: `sar-guardian-dynamic-lilac.vercel.app`
- API: `sarguardian-backend-api.vercel.app`

The API project also has a newer READY **Preview** deployment:
- Deployment: `dpl_9T8d5NAwNDkRSYHpNdYTpGFCqZoW`
- Branch: `feat/rivershift-map-place-search-20261105`
- Commit: `c5ff0c1273ddf75d9e7ea270a039e2ca5f9723e9`
- Preview target: not production; no production domain alias was assigned in the returned deployment metadata.

The latest project metadata for the frontend points to the READY production deployment above. The API project's latest deployment metadata points to the Preview build, while the production deployment list confirms `dpl_P7BB...` remains the active latest production entry. This distinction prevents confusing a READY Preview with a production cutover.

The Monorepo is not yet linked to either Vercel project. No new Vercel project was created during migration.

## Existing root/build evidence

The team-scoped Vercel deployment/build logs were read:
- Frontend production build runs `npm run build` and completes `tsc -b && vite build`. The source repository's frontend root is `Frontend/`, where `package.json`, `package-lock.json`, `vite.config.ts`, and `vercel.json` live. This build evidence is consistent with the current project's root being the frontend workspace, but the exact `rootDirectory` setting is not included in the project metadata response.
- API production build reports `Installing required dependencies from Backend/requirements.txt` and builds the FastAPI/Python functions. The source repository's API root is `Backend/`, where `index.py`, `requirements.txt`, and `vercel.json` live. The exact configured `rootDirectory` field was not included in the project metadata response.

The project-detail endpoint currently returns project ID/name/framework/deployment/aliases/protection fields, but not `rootDirectory`, `buildCommand`, `installCommand`, or `outputDirectory`. The project list can be read using the team slug; that result also does not include those settings. Therefore the build evidence identifies the current source workspaces, but the exact Vercel Settings values still need dashboard verification before any project root is changed.

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

Before creating the Monorepo Preview projects:
1. confirm the exact current frontend/API `rootDirectory`, build/install/output settings, and Git production branch in Vercel Settings (build logs indicate the source workspaces are `Frontend/` and `Backend/`, but project metadata did not expose the exact configured field);
2. confirm frontend/API Preview env scopes separately from Production;
3. confirm the Monorepo GitHub repository is accessible to the Vercel Git integration;
4. create separate Monorepo Vercel projects for `apps/web` and `apps/api` with those root directories only after settings and cross-root dependency handling are ready;
5. deploy Preview only; do not assign the current production aliases.

No production Vercel setting, environment variable, domain, or deployment was changed by this audit.


## Production deployment freshness cross-check — 2026-11-05

The latest production deployment records were checked independently from project metadata:

| Project | Latest Production deployment | Deployed commit | Current Dynamic main |
|---|---|---|---|
| Frontend `sar-guardian-dynamic` | `dpl_CLi5LFvrGUVKXuHyAbYXhBdQ9C9f` — READY | `42d977b5abd186866ac0d78454239563eebb18d2` | `dd64b7adc90594f1d7f316b352e39fbac2013cb6` |
| API `sarguardian-backend-api` | `dpl_P7BBnE7PG7EiowYB2w7hS64ZmfMs` — READY | `42d977b5abd186866ac0d78454239563eebb18d2` | `dd64b7adc90594f1d7f316b352e39fbac2013cb6` |

GitHub compare confirms `42d977b5…` is an ancestor of current Dynamic `main`; main is one commit ahead. Therefore both latest Production deployments are behind current main by one commit. The newer API Preview `c5ff0c1273ddf75d9e7ea270a039e2ca5f9723e9` is from the feature branch `feat/rivershift-map-place-search-20261105`; compare shows this branch and main have diverged, so it must not be mistaken for a production deployment or a direct main cutover.

No deployment was triggered, promoted, cancelled, or reassigned during this check. This is existing-system deployment freshness, independent of the new Monorepo's inactive migration candidate.
