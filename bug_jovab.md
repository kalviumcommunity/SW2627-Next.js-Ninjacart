# Ninjacart Full-Stack End-to-End Manual Testing & Bug Report

## Test Environment
- **Date:** 2026-08-31
- **Target Branch:** `development`
- **Frontend Stack:** Next.js 16.3.2 (App Router, React 19, TypeScript), running on `http://localhost:3000`
- **Backend Stack:** Node.js, Express 4.21, Prisma ORM 6.4, PostgreSQL 15, running on `http://localhost:5000`
- **Testing Approach:** Manual interactive flow execution across all user journeys, code analysis, route inspection, API request tracing, and verification testing.

---

## Executive Summary

A comprehensive end-to-end manual test was performed across the complete Ninjacart application covering Authentication, Farmer Dashboard, Add Produce, Retailer Catalogue, Product Details, Order Placement, and Backend APIs. 

While core backend database schemas, catalogue filtering endpoints (recently merged via PR #48), and UI visual shells are implemented, **critical gaps exist in the frontend application logic**, notably non-functional authentication pages, disabled orderability for low-stock products, missing order history integration, and unauthenticated protected routes.

---

## Detailed Test Journey Results

### 1. Authentication & Access Control
- **Status:** ❌ **FAIL**
- **Findings:**
  - `/login`: Rendered inputs and a static `<button>Login</button>` without any click handler, submit listener, form wrapper, or token storage. No API request is dispatched.
  - `/register`: Rendered input fields for name, email, password, and role, but lacks a submit button or submission handler.
  - `frontend/lib/api.ts` completely lacks a `loginUser` API helper function.
  - Protected routes (`/farmer/dashboard`, `/farmer/add-produce`, `/orders`) render directly without authentication or redirecting unauthenticated users to `/login`.

### 2. Farmer Portal & Produce Creation
- **Status:** ⚠️ **PARTIAL / BLOCKED IN UI**
- **Findings:**
  - `/farmer/dashboard` is a static placeholder with a single navigation button pointing to `/farmer/add-produce`. It does not fetch or list existing produce listings owned by the logged-in farmer.
  - `/farmer/add-produce` form is fully implemented with validation, category selection, price/unit/quantity inputs, and Cloudinary image upload handlers.
  - However, because user login cannot be completed via the UI, authenticated submission to `POST /api/produce` cannot obtain a valid JWT token through the frontend.

### 3. Retailer Catalogue & Product Details
- **Status:** ⚠️ **PARTIAL**
- **Findings:**
  - `/catalogue` correctly queries `GET /api/produce`, supporting pagination, search, category selection, and sorting.
  - `/catalogue/[productId]` renders product specifications, farm origin information, subtotal calculations, and the wholesale order trigger button.
  - **Critical UI Bug:** [`ProductCard.tsx`](file:///frontend/components/ProductCard.tsx) defines `isAvailable = produce.status === "AVAILABLE" && produce.quantity > 0`. Consequently, all `LOW_STOCK` items are classified as `!isAvailable`, triggering a red "Out of Stock" badge, a "Sold Out" overlay, and a disabled "Unavailable" button, preventing retailers from purchasing low-stock items.

### 4. Wholesale Order Flow & Inventory Management
- **Status:** ⚠️ **PARTIAL**
- **Findings:**
  - The [`OrderModal`](file:///frontend/components/OrderModal.tsx) component functions well: opens on product cards/details, computes real-time pricing subtotals, validates min/max quantity limits, and collects delivery address and notes.
  - Submitting an order invokes `createOrder()` targeting `POST /api/orders`.
  - Backend atomic inventory deduction with row locking and 409 Conflict handling on stock depletion works as expected.
  - However, `/orders` is a static placeholder and does not fetch or render user order history from `GET /api/orders`.

---

## Comprehensive Bug Log

### BUG-001 — Login Page is a Non-functional Dummy Form
- **Severity:** 🔴 **Critical**
- **Area:** `frontend/app/(auth)/login/page.tsx`
- **Steps to Reproduce:**
  1. Navigate to `http://localhost:3000/login`.
  2. Enter valid farmer/retailer email and password.
  3. Click the `Login` button.
- **Expected Behavior:** Form submits credentials to `POST /api/auth/login`, persists the received JWT token in `localStorage`, and redirects the user to the appropriate portal (e.g. `/catalogue` or `/farmer/dashboard`).
- **Actual Behavior:** No action occurs. The button lacks an `onClick` or `type="submit"` handler, no form exists, and no network request is sent.
- **Likely Fix:** Implement form submission state, call `POST /api/auth/login`, store the JWT token and user info, and navigate upon success.

---

### BUG-002 — Registration Page Missing Form Submit Control & Handler
- **Severity:** 🔴 **Critical**
- **Area:** `frontend/app/(auth)/register/page.tsx`
- **Steps to Reproduce:**
  1. Navigate to `http://localhost:3000/register`.
  2. Fill out Name, Email, Password, and Role.
  3. Observe available controls.
- **Expected Behavior:** A `Register` submit button is visible, which invokes `registerUser()` and directs the user to login upon successful account creation.
- **Actual Behavior:** The page only renders four unstyled `<input>` elements without any submit button, form element, or submission logic.
- **Likely Fix:** Wrap inputs in a styled `<form>`, add a submit button, call `registerUser()` from `frontend/lib/api.ts`, and display success/error alerts.

---

### BUG-003 — `ProductCard` Incorrectly Marks `LOW_STOCK` Items as "Sold Out"
- **Severity:** 🟠 **High**
- **Area:** `frontend/components/ProductCard.tsx`
- **Steps to Reproduce:**
  1. Have a produce listing in the catalogue with status `LOW_STOCK` and `quantity > 0` (e.g., 5 kg remaining).
  2. Open `http://localhost:3000/catalogue`.
  3. Inspect the product card for the `LOW_STOCK` produce.
- **Expected Behavior:** Card displays a "Low Stock" amber badge, shows remaining quantity, and allows clicking "Add to Cart".
- **Actual Behavior:** 
  - `isAvailable` evaluates to `false` because `produce.status !== "AVAILABLE"`.
  - The badge displays "Out of Stock" (red).
  - A "Sold Out" overlay covers the image.
  - The CTA button displays "Unavailable" and is disabled.
- **Likely Fix:** Update availability check in `ProductCard.tsx`:
  ```tsx
  const isAvailable = (produce.status === "AVAILABLE" || produce.status === "LOW_STOCK") && produce.quantity > 0;
  ```

---

### BUG-004 — Missing Client-Side Route Protection on Sensitive Pages
- **Severity:** 🟠 **High**
- **Area:** `frontend/app/farmer/*`, `frontend/app/orders`
- **Steps to Reproduce:**
  1. Open a private/incognito browser window with no auth tokens.
  2. Navigate directly to `http://localhost:3000/farmer/dashboard`, `http://localhost:3000/farmer/add-produce`, or `http://localhost:3000/orders`.
- **Expected Behavior:** Unauthenticated users are redirected to `/login?redirect=...` or presented with an access-denied state.
- **Actual Behavior:** Pages render their full shell without checking for authentication.
- **Likely Fix:** Add an `AuthGuard` component or Next.js middleware checking for valid auth tokens on protected paths.

---

### BUG-005 — Orders Page (`/orders`) is a Static Placeholder
- **Severity:** 🟠 **High**
- **Area:** `frontend/app/orders/page.tsx`
- **Steps to Reproduce:**
  1. Navigate to `http://localhost:3000/orders`.
  2. Inspect the page content.
- **Expected Behavior:** Page fetches `GET /api/orders` for the authenticated user and displays a list of placed orders, items, order dates, totals, delivery addresses, and shipment statuses.
- **Actual Behavior:** Page only renders static placeholder text (`My Orders - Track produce orders...`) with no dynamic data fetching or order tracking interface.
- **Likely Fix:** Build dynamic order history list consuming `GET /api/orders` with status tags, item breakdown, and delivery timestamps.

---

### BUG-006 — Missing `loginUser` Function in Frontend API Client
- **Severity:** 🟡 **Medium**
- **Area:** `frontend/lib/api.ts`
- **Steps to Reproduce:**
  1. Inspect exported functions in `frontend/lib/api.ts`.
- **Expected Behavior:** `loginUser({ email, password })` helper is exported to communicate with `POST /api/auth/login`.
- **Actual Behavior:** `registerUser`, `getProduces`, `createProduct`, and `createOrder` are present, but `loginUser` is omitted.
- **Likely Fix:** Add and export `loginUser` in `frontend/lib/api.ts`.

---

### BUG-007 — Missing Default Environment File (`.env`) for Backend Local Development
- **Severity:** 🟡 **Medium**
- **Area:** `backend/`
- **Steps to Reproduce:**
  1. Clone repository and run `npm run dev:backend` or `npm test` without creating `backend/.env`.
- **Expected Behavior:** Backend provides sensible defaults or setup instructions for `DATABASE_URL` and `JWT_SECRET`.
- **Actual Behavior:** Backend immediately fails with `PrismaClientInitializationError: Authentication failed against database server` or missing JWT secret.
- **Likely Fix:** Document local PostgreSQL setup requirements and ensure `backend/.env.example` is highlighted during onboarding.

---

### BUG-008 — `FarmerDashboard` Missing Listing Management and Analytics
- **Severity:** 🟡 **Medium**
- **Area:** `frontend/app/farmer/dashboard/page.tsx`
- **Steps to Reproduce:**
  1. Navigate to `http://localhost:3000/farmer/dashboard`.
- **Expected Behavior:** Farmer dashboard displays summary metrics (total active produce, low stock alerts, recent sales) and a table/grid of their own listings with quick Edit/Delete actions.
- **Actual Behavior:** Only displays a header and a single link button to `/farmer/add-produce`.
- **Likely Fix:** Fetch farmer listings via `GET /api/produce?farmerId=...` and provide stock adjustment controls.

---

### BUG-009 — Produce Update Endpoint Overrides Status on Quantity Updates
- **Severity:** 🟡 **Medium**
- **Area:** `backend/src/controllers/produce.controller.js`
- **Steps to Reproduce:**
  1. Have an `ARCHIVED` produce item.
  2. Send a `PATCH /api/produce/:id` updating only `quantity: 50` without passing `status`.
- **Expected Behavior:** Status remains `ARCHIVED` unless explicitly altered by the farmer.
- **Actual Behavior:** Controller executes `if (quantityWasUpdated && status === undefined) { updateData.status = 'AVAILABLE'; }`, inadvertently un-archiving the listing.
- **Likely Fix:** Only auto-set `status = 'AVAILABLE'` if the previous status was `OUT_OF_STOCK`, preserving `ARCHIVED` or `LOW_STOCK` states.

---

### BUG-010 — Navigation Header Missing Dynamic Authentication State
- **Severity:** 🟢 **Low**
- **Area:** `frontend/app/layout.tsx`
- **Steps to Reproduce:**
  1. Log in or view the navigation bar across any route.
- **Expected Behavior:** Navigation header shows the logged-in user's name/role and a "Sign Out" button when authenticated, or "Sign In" / "Register" when unauthenticated.
- **Actual Behavior:** Hardcoded static "Sign In" link is always displayed regardless of login status.
- **Likely Fix:** Implement an auth context / navbar state displaying user details and logout action.

---

## Action Plan & Priority Matrix

| Priority | Bug ID | Description | Impact |
| :--- | :--- | :--- | :--- |
| **P0** | BUG-001, BUG-002, BUG-006 | Complete Login & Register forms with API integration | Unblocks complete authenticated user flows |
| **P0** | BUG-003 | Fix `LOW_STOCK` availability check in `ProductCard.tsx` | Allows retailers to buy low-stock produce |
| **P1** | BUG-004 | Add route-level authentication guards | Prevents unauthorized portal access |
| **P1** | BUG-005 | Implement dynamic `/orders` history page | Allows retailers to track placed orders |
| **P2** | BUG-008 | Build full Farmer Dashboard inventory list & metrics | Enables farmer produce management |
| **P2** | BUG-009 | Refine produce update status transition logic | Prevents accidental unarchiving of listings |
| **P3** | BUG-010 | Add dynamic auth state to Navbar | Improves overall UX & session management |
