# Ninjacart Manual E2E Bug Report

## Test Environment
- Branch: `development`
- Frontend: Next.js 16.3.2, running at `http://localhost:3000`
- Backend: Node.js backend, could not start because `nodemon` is unavailable
- Database: Not verified; backend could not start and no backend `.env` was present
- Date: 2026-08-29
- Browser: VS Code integrated browser (Chromium)

## Overall Result
The frontend started and was manually exercised through the main routes, catalogue, product details, catalogue controls, and order modal. The complete end-to-end flow could not succeed because the backend was unavailable. Several frontend and configuration defects were observed and are documented below.

## Test Cases

### Authentication
- FAIL
- `/login` rendered, but clicking `Login` did not submit a request, validate fields, show an error, or navigate.
- `/register` rendered four inputs but no registration submit control was available.
- Login and registration could not be completed because the backend was unavailable; no logout control was found.
- `/farmer/dashboard` and `/orders` returned HTTP 200 without authentication and did not redirect to login, so protected-route enforcement could not be confirmed and appears absent.

### Farmer Flow
- BLOCKED
- The farmer dashboard and add-produce form rendered. The form exposed name, description, category, price, unit, quantity, minimum order quantity, image, and publish controls.
- Submit, persistence, image upload, success response, and listing verification were blocked by the unavailable backend and missing runtime dependencies.

### Retailer Catalogue
- FAIL
- `/catalogue` rendered eight fallback listings with product cards, images, names, prices, quantities, farmer names/locations, category/status badges, filters, sorting controls, and pagination area.
- Product details rendered correctly for `/catalogue/prod-001` and `/catalogue/prod-002`, including farmer information, price, quantity, minimum order, image, and fallback-capable UI.
- Browser network/console output showed failed requests to `http://localhost:5000/api/api/produce?...` because the configured base URL already ends in `/api` and the client appends `/api` again.
- The page then used sample fallback data, so backend catalogue behavior was not verified.
- Filtering and sorting controls were visible and interactive, but their live-data behavior could not be trusted while the API was unavailable.

### Order Flow
- BLOCKED
- An available product opened the confirmation modal. Quantity controls and product pricing/total display were visible.
- Backend order submission, authentication, address handling, notes persistence, loading response, and success response were blocked.
- The order request path should be verified after the backend is available; the same configured base URL may produce `/api/api/orders`.

### Sold-Out Flow
- FAIL
- The catalogue displayed four visible `Out of Stock`/`Sold Out` cards from fallback data, including `Fresh Kolar Carrots` and `Himachal Sweet Plums`.
- The available-status filter did not remove those cards from the rendered grid during the manual test; the page still reported eight listings.
- A real AVAILABLE -> stock zero -> refresh -> disappearance flow was blocked because the backend could not start.
- Loading skeletons were observable in source/UI behavior, but an API-failure toast was not observed; the current fallback path masks the failure.
- A genuine zero-AVAILABLE backend response and network failure notification could not be tested against a running API.

### Regression
- FAIL / BLOCKED
- Task #20: product cards, product details, catalogue fields, farmer information, badges, image rendering, and quantity/pagination controls were manually visible. Live pagination and backend filtering/sorting were blocked.
- Task #23: order modal opened and quantity controls were visible. Backend order submission, address/notes transmission, loading, and success state were blocked.
- Task #27: frontend code references `/api/produce`, `/api/produce/:id`, and `/api/orders`, but the runtime generated `/api/api/produce` due to configuration. Backend endpoint behavior was blocked.
- Task #32: loading skeleton and empty-state branches exist, but sold-out fallback cards remained visible and no user-visible API error toast appeared during the failed request.

## Bugs Found

### BUG-001 — Backend cannot start with project command

**Severity:** High

**Area:** backend/dependencies/environment

**Steps to reproduce:**
1. From the project root, run `npm run dev:backend`.
2. Observe the backend process output.

**Expected:**
The backend starts on port 5000 so the frontend can perform manual API testing.

**Actual:**
The command exits with `'nodemon' is not recognized as an internal or external command`. Backend API and database-dependent flows cannot run.

**Evidence:**
- Command: `npm run dev:backend`
- Runtime message: `nodemon is not recognized as an internal or external command`
- `backend/node_modules` was not available for the configured scripts.

**Likely location:**
`backend/package.json` scripts and local dependency installation.

**Status:** Found

### BUG-002 — Frontend constructs an invalid double `/api` URL

**Severity:** High

**Area:** frontend/configuration/API

**Steps to reproduce:**
1. Start the frontend.
2. Open `http://localhost:3000/catalogue`.
3. Inspect browser Network/Console output.

**Expected:**
Catalogue requests target `http://localhost:5000/api/produce`.

**Actual:**
Requests target `http://localhost:5000/api/api/produce?...` and product details target `http://localhost:5000/api/api/produce/:id`, producing connection failures in this environment.

**Evidence:**
- `frontend/.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:5000/api`
- `frontend/lib/api.ts`: appends `/api/produce` and `/api/produce/:id`
- Browser event: `GET http://localhost:5000/api/api/produce?... failed: net::ERR_CONNECTION_REFUSED`

**Likely location:**
`frontend/.env.local` and URL construction in `frontend/lib/api.ts`.

**Status:** Found

### BUG-003 — Sold-out fallback products remain visible in the catalogue grid

**Severity:** Medium

**Area:** frontend/catalogue

**Steps to reproduce:**
1. Start the frontend while the backend is unavailable.
2. Open `http://localhost:3000/catalogue`.
3. Inspect the product grid or select `Available Now`.
4. Refresh or allow the catalogue fetch to complete.

**Expected:**
Products with zero stock or sold-out status disappear from the catalogue grid after refresh, while valid available products remain visible.

**Actual:**
The grid rendered eight cards, including four cards marked `Out of Stock`/`Sold Out`. Selecting `Available Now` did not reduce the rendered grid in the manual test.

**Evidence:**
- URL: `http://localhost:3000/catalogue`
- Visible products included `Fresh Kolar Carrots` and `Himachal Sweet Plums` marked sold out.
- Page text reported `Showing 8 of 8 produce listings`.
- Backend was unavailable, so this observation used the intentional sample fallback path.

**Likely location:**
`frontend/app/catalogue/page.tsx` and the fallback path in `frontend/lib/api.ts`.

**Status:** Found

### BUG-004 — Login control has no observable submission behavior

**Severity:** High

**Area:** frontend/auth

**Steps to reproduce:**
1. Open `http://localhost:3000/login`.
2. Enter no credentials or any credentials.
3. Click `Login`.

**Expected:**
The form validates input and submits to the authentication API, showing a result or understandable error.

**Actual:**
The URL and page content remained unchanged; no visible validation, request, redirect, or error occurred.

**Evidence:**
- URL remained `http://localhost:3000/login` after clicking `Login`.
- Browser page contained a button but no observable login result.

**Likely location:**
`frontend/app/(auth)/login/page.tsx`.

**Status:** Found

### BUG-005 — Registration page has no submit control

**Severity:** High

**Area:** frontend/auth

**Steps to reproduce:**
1. Open `http://localhost:3000/register`.
2. Inspect the registration form.
3. Enter values in the name, email, password, and role inputs.

**Expected:**
A registration submit action sends the entered data to the backend and reports success or failure.

**Actual:**
The page rendered four inputs but no registration button or submit action.

**Evidence:**
- URL: `http://localhost:3000/register`
- Browser inspection found four inputs and one empty-text button, with no visible `Register`/`Submit` control.

**Likely location:**
`frontend/app/(auth)/register/page.tsx`.

**Status:** Found

### BUG-006 — Protected pages are accessible without authentication

**Severity:** High

**Area:** frontend/auth/access control

**Steps to reproduce:**
1. Clear authentication state or use a fresh browser session.
2. Open `http://localhost:3000/farmer/dashboard`.
3. Open `http://localhost:3000/orders`.

**Expected:**
Unauthenticated users are redirected to login or shown an authorization message.

**Actual:**
Both pages returned HTTP 200 and rendered their page shells without redirecting to login.

**Evidence:**
- `GET /farmer/dashboard` -> HTTP 200, rendered `Farmer Dashboard`.
- `GET /orders` -> HTTP 200, rendered `My Orders`.
- No authenticated token was established during the test.

**Likely location:**
`frontend/app/farmer/dashboard/page.tsx`, `frontend/app/orders/page.tsx`, or missing route-level auth guard.

**Status:** Found

## Blockers

- Backend could not start: `npm run dev:backend` failed because `nodemon` was unavailable.
- Backend dependencies were not available to run the configured API/tests.
- No backend `.env` file was present; only `backend/.env.example` exists. Database connectivity and required secrets were therefore not verified.
- Because the backend was unavailable, authenticated registration/login, farmer persistence, live catalogue data, real inventory deduction, order creation, and API success/error contracts could not be completed.
- The frontend base URL configuration generated double `/api` paths and caused connection failures.

## Final Summary

- Total test cases attempted: 6 major flows, plus route, control, network, and regression checks
- Passed: frontend route rendering, product detail rendering, visible catalogue card fields, basic order modal opening, and visible loading/empty branches
- Failed: authentication UI behavior, sold-out filtering in fallback data, API URL construction, and unauthenticated protected-page behavior
- Blocked: backend-dependent farmer, authentication, live catalogue, order, inventory, and end-to-end API checks
- Number of bugs found: 6
- Highest severity bug: BUG-001, BUG-002, BUG-004, BUG-005, and BUG-006 (High)
- Suitable for further testing: No, not until backend dependencies/configuration are restored and the authentication/API URL defects are addressed
