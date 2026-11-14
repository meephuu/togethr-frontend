# e2e: Playwright tests

Automated black-box tests for Togethr, written with Playwright (TypeScript, Chrome only).
They drive the running frontend and backend from the outside, the way a user or API
client would.

This folder is its own npm project with its own `package.json`. Its dependencies are not
part of the frontend app's, so install them inside `e2e/` (step 5).

There are two suites:

- **The whole test plan, TC01–TC71** (`npm run test:plan`): fills in the "Actual Outputs"
  and P/F columns. See [Test-plan runner](#test-plan-runner-tc01tc71).
- **Demo specs** (`npm test`), the 7 cases below.

| Spec | Test cases | What it checks |
| --- | --- | --- |
| `tests/login.spec.ts` | TC17, TC20 | Login through the UI: redirect, status code, HttpOnly `token` cookie, error message |
| `tests/password-reset.spec.ts` | TC27–TC31 | Forgot-password API responses, the reset email in Mailpit, resetting through the emailed link, logging in afterwards |

Expected status codes and messages are copied from the test plan character for character
(`helpers/test-data.ts`).

## Before you start

> **TC31 changes somchai's password** from `Travel@2026` to `NewTravel@2026` and leaves it
> changed (later test-plan cases log in with the new password). A second run against the
> same database fails in global setup. **Run the suite against a fresh test database
> every time** (step 2), and never against the `deawkoykid` dev database.

`global-setup.ts` logs in as `somchai@gmail.com` / `Travel@2026`. If that fails, it
registers the account through `POST /api/auth/register` with the TC01 data
(`consent: true`). If the account already exists with another password, it stops and
tells you to recreate the database.

The specs run one at a time in a fixed order (`workers: 1`, no retries): `login.spec.ts`
needs the original password and runs before `password-reset.spec.ts`, and TC31 uses the
reset link that TC27 requested.

## Run steps

Commands are for PowerShell on Windows. In bash, replace `$env:NAME="value"` with
`export NAME=value`. Paths start from the folder that holds both repos,
`DeawKoyKid-Backend/` and `togethr-frontend/`.

### 1. Start Postgres and Mailpit

Mailpit is a fake SMTP server that keeps every email it receives, so the tests can read
the reset link. It is an opt-in service in `DeawKoyKid-Backend/docker-compose.yml` under
the `test` profile, so a plain `docker compose up -d` does not start it. Its ports are
bound to localhost only: SMTP on 1025, web UI and API on http://localhost:8025.

```powershell
cd DeawKoyKid-Backend
docker compose --profile test up -d
```

This starts Postgres and Mailpit. Stop Mailpit afterwards with
`docker compose --profile test stop mailpit`.

Until [DeawKoyKid-Backend#42](https://github.com/DiewKoyKid/DeawKoyKid-Backend/pull/42) is
merged, the `test` profile exists only on the backend branch `chore/mailpit-test-profile`.

### 2. Create a fresh test database

Use `deawkoykid_test`. Stop the backend first if it is connected to that database.

```powershell
docker exec deawkoykid-postgres dropdb -U deawkoykid --if-exists --force deawkoykid_test
docker exec deawkoykid-postgres createdb -U deawkoykid deawkoykid_test

$env:DATABASE_URL="postgresql://deawkoykid:deawkoykid@localhost:5432/deawkoykid_test?schema=public"
npx prisma migrate deploy --config prisma7.config.ts
```

Check that `DATABASE_URL` ends in `deawkoykid_test` before running `dropdb` or `migrate`.

### 3. Start the backend against the test database, sending email to Mailpit

In the same terminal (so `DATABASE_URL` is still set):

```powershell
$env:SMTP_HOST="127.0.0.1"
$env:SMTP_PORT="1025"
npm run dev
```

Use `127.0.0.1`, not `localhost`. Mailpit's ports are bound to IPv4 localhost only, but
Node resolves `localhost` to IPv6 `::1`, so the backend's email fails with
`ECONNREFUSED ::1:1025` (logged as "password reset email failed"; the API still answers 200).

Variables set in the shell take precedence over `.env`, so `.env` does not need changing.
Without `SMTP_HOST` the backend only logs emails to the console (`[mail] ...`), and
TC27 and TC31 fail because nothing reaches Mailpit.

The reset link in the email points at `FRONTEND_URL` (or `CORS_ORIGIN`), which must be
the frontend the tests use (`http://localhost:5173` by default).

### 4. Start the frontend

```powershell
cd togethr-frontend
npm run dev
```

`VITE_API_BASE_URL` in `togethr-frontend/.env.local` must point at the backend from step 3.

### 5. Install and run the tests

```powershell
cd togethr-frontend/e2e
npm install
npx playwright install chromium

$env:API_URL="http://localhost:8081/api"   # only if the backend is not on port 3000
npm test
```

Open the HTML report afterwards with `npm run test:report`. To run one spec:
`npx playwright test tests/login.spec.ts`.

To run again, repeat step 2 (stop the backend, recreate the database), then steps 3 and 5.

## Test-plan runner (TC01–TC71)

`npm run test:plan` runs every test case in the test plan
(`files from claude/test-plan-cases.md`) in the plan's order. It writes
`results/test-plan-results.md`, a table of **TC ID | Actual output | P/F**, plus a coverage
matrix with the P/F sequence for each user story.

- **Specs:** one per user story in `tests/test-plan/` (`01-us1-1` … `08-us6-4`), run
  serially and sharing state, because later cases build on earlier ones. After TC16 the runner
  runs `npm run seed:test` in the backend and uses the ids and token T2 it prints.
- **Actual output** is written in the style of the expected output, one part per check. A
  case is **P** only when every part matches the expected output exactly.
- **A mismatch never stops the run:** the Playwright test itself always passes and only
  records P/F. So "72 passed" in the Playwright output means every case ran, not that
  every case is P. Read the results file (or the P/F annotations in `npm run test:report`).
- **Browser vs API:** most cases are API calls. The browser is used for TC01 (the
  "Registration successful" toast), TC17 (redirect to `/customer/dashboard`) and TC62
  (the unread badge).
- **Emails** (TC27, TC28, TC31, TC35, TC56, TC64) are read from Mailpit.
- **Database checks:** expected outputs that are database facts ("users.consentAt set",
  "customer row created", "no user created", "token row expires 15 min later", "no token
  row", "T3 still usable") are checked with read-only queries on `TEST_DATABASE_URL`.

How some inputs are handled:

- **TC01:** the sign-up page has no phone or gender fields. The runner fills in the form
  and adds the plan's `phoneNumber` and `gender` to the page's register request on its way
  to the backend.
- **TC35:** "T3 still usable" is checked without using T3 up: the token row is unused and
  not expired.
- **TC59** ("Run after TC65 (US6-4)") runs in the US6-4 spec right after TC65, but is reported under
  US6-3.
- **Missing ids:** `SV-999`, `SL-999` and `BK-9999` are sent as those literal strings. Ids
  are plain text, so they match nothing.
- **Fixed dates:** the plan uses dates such as SL-01 on 2026-11-20 and BK-1003 on
  2026-11-25, so it stops working once those dates pass.

### Running the test plan

The database must be empty: TC01 registers somchai. Use the same database for the
backend and for `TEST_DATABASE_URL`. **Never use the `deawkoykid` dev database**; the runner
refuses to.

1. Start Mailpit (and Postgres):
   ```powershell
   cd DeawKoyKid-Backend
   docker compose --profile test up -d
   ```
2. Create a fresh `deawkoykid_test` and run the migrations. `dropdb` deletes it, so first
   make sure nobody else (another terminal or session) is using it, and stop any backend
   connected to it.
   ```powershell
   docker exec deawkoykid-postgres dropdb -U deawkoykid --if-exists --force deawkoykid_test
   docker exec deawkoykid-postgres createdb -U deawkoykid deawkoykid_test

   $env:DATABASE_URL="postgresql://deawkoykid:deawkoykid@localhost:5432/deawkoykid_test?schema=public"
   npx prisma migrate deploy --config prisma7.config.ts
   ```
3. In the same terminal, start the backend on `deawkoykid_test`, sending email to Mailpit:
   ```powershell
   $env:SMTP_HOST="127.0.0.1"
   $env:SMTP_PORT="1025"
   npm run dev
   ```
4. Start the frontend, with mocks off so the notification bell uses the real API (TC62):
   ```powershell
   cd togethr-frontend
   $env:VITE_USE_MOCKS="false"
   npm run dev
   ```
   `VITE_API_BASE_URL` (in `.env.local`) must point at the backend from step 3.
5. Run the plan:
   ```powershell
   cd togethr-frontend/e2e
   npm install
   npx playwright install chromium

   $env:TEST_DATABASE_URL="postgresql://deawkoykid:deawkoykid@localhost:5432/deawkoykid_test?schema=public"
   $env:API_URL="http://localhost:8081/api"   # only if the backend is not on port 3000
   npm run test:plan
   ```
   The results are in `results/test-plan-results.md`.

The run changes the data (somchai's password, kanya's 15-minute lock, bookings), so repeat
from step 2 before every run. Global setup stops if the database already has somchai or
somsri.

## Configuration

| Variable | Default | Used for |
| --- | --- | --- |
| `BASE_URL` | `http://localhost:5173` | Frontend (Playwright `baseURL`) |
| `API_URL` | `http://localhost:3000/api` | Backend API, for the API checks and global setup |
| `MAILPIT_URL` | `http://localhost:8025` | Mailpit HTTP API, to read the test inbox |
| `TEST_DATABASE_URL` | none (required by `test:plan`) | The backend's test database: the seed runs on it and the database checks read it |
| `BACKEND_DIR` | `../../DeawKoyKid-Backend` (from `e2e/`) | Backend checkout where `npm run seed:test` runs |

## Files

- `playwright.config.ts`: demo specs. Chrome-only project, single worker, global setup
- `playwright.test-plan.config.ts`: the test-plan runner (`npm run test:plan`)
- `global-setup.ts`: makes sure `somchai@gmail.com` / `Travel@2026` can log in (demo specs)
- `helpers/env.ts`: URLs from environment variables
- `helpers/test-data.ts`: test-plan accounts, passwords and expected messages (demo specs)
- `helpers/mailpit.ts`: `getLatestMessage(address)`, `waitForNewMessage(...)`, `listMessageIds(address)` and `newMessagesTo(...)` through Mailpit's HTTP API, plus `extractResetLink(message)`
- `helpers/plan/`: the test-plan runner: test data and expected messages (`data.ts`), API sessions (`api.ts`), how P/F is decided (`outcome.ts`, `plan-test.ts`), shared state, the seed, database checks, and the results file
- `tests/`: the demo specs; `tests/test-plan/`: one spec per user story
- `results/test-plan-results.md`: the latest test-plan results
