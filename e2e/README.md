# e2e: Playwright tests

Automated black-box tests for Togethr, written with Playwright (TypeScript, Chrome only).
They drive the running frontend and backend from the outside, the way a user or API
client would.

This folder is its own npm project with its own `package.json`. Its dependencies are not
part of the frontend app's, so install them inside `e2e/` (step 5).

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

## Configuration

| Variable | Default | Used for |
| --- | --- | --- |
| `BASE_URL` | `http://localhost:5173` | Frontend (Playwright `baseURL`) |
| `API_URL` | `http://localhost:3000/api` | Backend API, for the API checks and global setup |
| `MAILPIT_URL` | `http://localhost:8025` | Mailpit HTTP API, to read the test inbox |

## Files

- `playwright.config.ts`: Chrome-only project, single worker, global setup
- `global-setup.ts`: makes sure `somchai@gmail.com` / `Travel@2026` can log in
- `helpers/env.ts`: URLs from environment variables
- `helpers/test-data.ts`: test-plan accounts, passwords and expected messages
- `helpers/mailpit.ts`: `getLatestMessage(address)` and `waitForNewMessage(...)` through Mailpit's HTTP API, plus `extractResetLink(message)`
- `tests/`: the specs
