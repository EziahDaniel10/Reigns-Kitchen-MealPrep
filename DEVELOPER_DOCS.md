# Reigns Kitchen — Full Developer Documentation

> **Purpose:** This document gives a developer everything needed to understand, rebuild, or extend the Reigns Kitchen platform from scratch.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Monorepo Structure](#2-monorepo-structure)
3. [Technology Stack](#3-technology-stack)
4. [Environment Variables & Secrets](#4-environment-variables--secrets)
5. [Database Schema](#5-database-schema)
6. [API Server — Routes Reference](#6-api-server--routes-reference)
7. [Frontend — Pages & Components](#7-frontend--pages--components)
8. [Business Logic](#8-business-logic)
9. [Notifications System](#9-notifications-system)
10. [Admin Panel](#10-admin-panel)
11. [Authentication & Roles](#11-authentication--roles)
12. [Menu & Pricing Data](#12-menu--pricing-data)
13. [Running Locally](#13-running-locally)
14. [Deployment](#14-deployment)
15. [Key Customisation Points](#15-key-customisation-points)

---

## 1. Project Overview

**Reigns Kitchen** is a chef-crafted meal-prep ordering platform for Chef April Winston. Customers browse a weekly menu, add meals to a cart, enter their details, pay via Square, and receive WhatsApp + email confirmation. The owner and staff manage orders, enquiries, coupons, and staff accounts through a built-in admin panel at `/admin`.

**Core customer flow:**
1. Browse the weekly menu by category.
2. Add individual meals or family pans to the cart.
3. Choose delivery or pickup.
4. Enter contact details → delivery address is geocoded for distance-based fee calculation.
5. Apply an optional coupon code.
6. Pay via Square card form (embedded web SDK).
7. Receive confirmation email + WhatsApp notification is sent to the owner.

---

## 2. Monorepo Structure

The project is a **pnpm workspace monorepo** managed on Node.js 24.

```
/
├── artifacts/
│   ├── api-server/           # Express 5 REST API
│   └── reigns-kitchen/       # React + Vite frontend
├── lib/
│   ├── db/                   # Drizzle ORM schema + PostgreSQL client
│   ├── api-spec/             # OpenAPI 3.1 spec (openapi.yaml) + Orval codegen config
│   ├── api-client-react/     # Orval-generated React Query hooks
│   └── api-zod/              # Orval-generated Zod schemas
├── scripts/                  # One-off utility scripts
├── pnpm-workspace.yaml
├── tsconfig.json             # Root TypeScript solution file (composite libs only)
└── tsconfig.base.json        # Shared strict TS defaults
```

### Package names

| Directory | Package name |
|---|---|
| `artifacts/api-server` | `@workspace/api-server` |
| `artifacts/reigns-kitchen` | `@workspace/reigns-kitchen` |
| `lib/db` | `@workspace/db` |
| `lib/api-spec` | `@workspace/api-spec` |
| `lib/api-client-react` | `@workspace/api-client-react` |
| `lib/api-zod` | `@workspace/api-zod` |

---

## 3. Technology Stack

### Backend (`artifacts/api-server`)
| Concern | Library |
|---|---|
| HTTP server | Express 5 |
| Database ORM | Drizzle ORM |
| Database | PostgreSQL (Replit managed) |
| Payments | Square SDK (`square` v44) |
| Email | Resend SDK (`resend` v6) |
| WhatsApp notifications | CallMeBot API (HTTP) |
| Auth (hashing) | Node.js built-in `crypto` — PBKDF2-SHA512, 10 000 iterations |
| Runtime | `tsx` in dev, esbuild CJS bundle in production |
| Geocoding | Nominatim (OpenStreetMap) — no API key required |

### Frontend (`artifacts/reigns-kitchen`)
| Concern | Library |
|---|---|
| Framework | React 18 + Vite |
| Routing | `wouter` |
| Styling | Tailwind CSS v4 |
| State (cart) | Zustand |
| Animations | Framer Motion |
| Component library | shadcn/ui (Radix UI primitives) |
| Date picker | `react-day-picker` + `date-fns` |
| Data fetching | `@tanstack/react-query` |
| TypeScript | `~5.9` |

---

## 4. Environment Variables & Secrets

All secrets are set as Replit secrets. None should be committed to source control.

### Required for API server

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string. Provided automatically by Replit. |
| `ADMIN_PASSWORD` | Owner password used to log into `/admin`. The raw password is used as a bearer token for backwards compatibility. |
| `SQUARE_ACCESS_TOKEN` | Square Production access token for charging cards. |
| `SQUARE_LOCATION_ID` | Square location ID associated with the payment account. |
| `RESEND_API_KEY` | Resend email API key. |
| `RESEND_FROM_EMAIL` | "From" address used in outgoing emails (e.g. `catering@reignskitchen.com`). Defaults to `onboarding@resend.dev` if not set. |
| `OWNER_EMAIL` | Email address where new-order and new-enquiry notifications are sent. |
| `CALLMEBOT_PHONE_1` | WhatsApp phone number (digits only, no `+`) for the first notification recipient. |
| `CALLMEBOT_APIKEY_1` | CallMeBot API key for `CALLMEBOT_PHONE_1`. |
| `CALLMEBOT_PHONE_2` | (Optional) Second WhatsApp recipient phone number. |
| `CALLMEBOT_APIKEY_2` | (Optional) CallMeBot API key for `CALLMEBOT_PHONE_2`. |
| `SESSION_SECRET` | Used internally; available but not currently referenced in code. |

### Optional overrides

| Variable | Description | Default |
|---|---|---|
| `KITCHEN_LAT` | Latitude of the kitchen (for delivery distance calculation). | `38.9072` (central DC) |
| `KITCHEN_LNG` | Longitude of the kitchen. | `-77.0369` (central DC) |
| `PORT` | Port for each service; injected automatically by Replit workflows. | — |
| `BASE_PATH` | URL prefix for the frontend; injected automatically by Replit workflows. | — |

---

## 5. Database Schema

Tables are created automatically when the API server starts via `src/lib/setup.ts` using `CREATE TABLE IF NOT EXISTS`. The same schema is also defined as Drizzle ORM models in `lib/db/src/schema/`.

### `orders`

| Column | Type | Notes |
|---|---|---|
| `id` | `SERIAL PK` | |
| `order_number` | `TEXT UNIQUE` | Format: `RK-YYYYMMDD-NNN` |
| `customer_name` | `TEXT NOT NULL` | |
| `customer_phone` | `TEXT NOT NULL` | |
| `customer_email` | `TEXT` | Optional |
| `delivery_type` | `TEXT NOT NULL` | `"delivery"` or `"Pickup"` |
| `delivery_address` | `TEXT` | Delivery only |
| `delivery_date` | `TEXT` | ISO string |
| `delivery_window` | `TEXT` | E.g. `"12pm – 3pm"` |
| `allergies` | `TEXT` | |
| `note` | `TEXT` | Customer note |
| `items` | `JSONB` | Array of `{ name, qty, price }` |
| `subtotal` | `NUMERIC(10,2)` | Meals total before fees |
| `delivery_fee` | `NUMERIC(10,2)` | Distance-based fee, `0` for pickup |
| `tax` | `NUMERIC(10,2)` | 6% of subtotal |
| `discount_amount` | `NUMERIC(10,2)` | Coupon discount applied |
| `coupon_code` | `TEXT` | Coupon used, if any |
| `total` | `NUMERIC(10,2)` | `subtotal + fee + tax − discount` |
| `payment_id` | `TEXT` | Square payment ID |
| `status` | `TEXT` | `confirmed` \| `preparing` \| `ready` \| `delivered` \| `cancelled` |
| `created_at` | `TIMESTAMP` | Default `NOW()` |

### `contact_enquiries`

| Column | Type | Notes |
|---|---|---|
| `id` | `SERIAL PK` | |
| `name` | `TEXT NOT NULL` | |
| `email` | `TEXT` | |
| `phone` | `TEXT` | |
| `message` | `TEXT NOT NULL` | |
| `status` | `TEXT` | `new` \| `read` \| `replied` |
| `reply_text` | `TEXT` | Text of admin reply sent |
| `created_at` | `TIMESTAMP` | |

### `coupons`

| Column | Type | Notes |
|---|---|---|
| `id` | `SERIAL PK` | |
| `code` | `TEXT UNIQUE` | Always stored uppercase |
| `description` | `TEXT` | |
| `discount_type` | `TEXT NOT NULL` | `"percentage"` or `"fixed"` |
| `discount_value` | `NUMERIC(10,2)` | Percent value (e.g. `20`) or dollar amount |
| `min_order_amount` | `NUMERIC(10,2)` | Minimum subtotal to use this coupon |
| `max_uses` | `INTEGER` | Null = unlimited |
| `uses` | `INTEGER` | Incremented on each successful order |
| `expires_at` | `TIMESTAMP` | Null = no expiry |
| `active` | `BOOLEAN` | Default `true` |
| `created_at` | `TIMESTAMP` | |

### `staff`

| Column | Type | Notes |
|---|---|---|
| `id` | `SERIAL PK` | |
| `name` | `TEXT NOT NULL` | Display name |
| `username` | `TEXT UNIQUE` | Lowercased on write |
| `email` | `TEXT` | |
| `password_hash` | `TEXT NOT NULL` | PBKDF2 hex |
| `password_salt` | `TEXT NOT NULL` | 16 random bytes, hex |
| `role` | `TEXT` | `"manager"` or `"support"` |
| `active` | `BOOLEAN` | Soft-delete via `active = false` |
| `created_at` | `TIMESTAMP` | |

### `admin_sessions`

| Column | Type | Notes |
|---|---|---|
| `id` | `TEXT PK` | 32 random bytes, hex — used as bearer token |
| `staff_id` | `INTEGER NOT NULL` | FK → `staff.id` |
| `role` | `TEXT NOT NULL` | Role at time of login |
| `name` | `TEXT NOT NULL` | Name at time of login |
| `expires_at` | `TIMESTAMP NOT NULL` | 7 days from creation |
| `created_at` | `TIMESTAMP` | |

---

## 6. API Server — Routes Reference

Base path: `/api`  
Server file: `artifacts/api-server/src/`

All routes return JSON of the form `{ success: true, ... }` or `{ success: false, error: "..." }`.

---

### Health

#### `GET /api/health`
Returns server status. No auth required.

```json
{ "status": "ok" }
```

---

### Orders

#### `POST /api/send-order`

Place a new order. Charges Square, sends WhatsApp notifications, sends emails, and persists the order to the database.

**Body:**
```ts
{
  customerName: string;        // required
  customerPhone: string;       // required
  customerEmail?: string;
  deliveryType: string;        // "delivery" or "Pickup"
  deliveryAddress?: string;
  deliveryDate?: string;
  deliveryWindow?: string;
  deliveryFee?: number;        // calculated by /delivery-fee endpoint
  tax?: number;
  allergies?: string;
  note?: string;
  items: Array<{ name: string; qty: number; price: number }>; // required
  total: string;
  paymentToken?: string;       // Square web SDK tokenized card
  totalCents?: number;         // amount to charge in cents
  couponCode?: string;
  discountAmount?: number;
}
```

**Response:**
```json
{
  "success": true,
  "orderNumber": "RK-20260818-042",
  "paymentId": "sq_payment_id"
}
```

**Errors:**
- `400` — missing required fields
- `402` — Square payment declined (card error)
- `500` — WhatsApp dispatch failed or server error

**Side effects:**
1. Charges the Square payment token.
2. Sends WhatsApp message to all configured `CALLMEBOT_PHONE_*` recipients.
3. Sends order notification email to `OWNER_EMAIL`.
4. Sends order confirmation email to customer (if email provided).
5. Inserts row into `orders`.
6. Increments `coupons.uses` if a coupon was applied.

---

### Delivery Fee

#### `GET /api/delivery-fee?address=<address>`

Geocodes the address using Nominatim (OpenStreetMap) and calculates the delivery fee based on straight-line (Haversine) distance from the kitchen.

**Query params:**
- `address` — full street address as a string (e.g. `"1428 U Street NW Washington DC"`)

**Response (in range):**
```json
{ "success": true, "outOfRange": false, "distanceMiles": 2.4, "fee": 12 }
```

**Response (out of range):**
```json
{ "success": true, "outOfRange": true, "distanceMiles": 40.1 }
```

**Response (address not found):**
```json
{ "success": false, "error": "Address not found. Please enter a complete street address." }
```

**Fee tiers:**

| Distance | Fee |
|---|---|
| 0 – 3 miles | $12 |
| 3 – 5 miles | $18 |
| 5 – 8 miles | $25 |
| 8 – 12 miles | $35 |
| 12 – 15 miles | $45 |
| > 15 miles | Out of range — contact for quote |

Kitchen coordinates default to central Washington, DC (`38.9072, -77.0369`). Override via `KITCHEN_LAT` / `KITCHEN_LNG` env vars.

---

### Coupons (public)

#### `POST /api/validate-coupon`

Validates a coupon code against the database. Does **not** consume a use — uses are incremented only when an order is placed.

**Body:**
```json
{ "code": "SUMMER20", "subtotal": 89.95 }
```

**Success response:**
```json
{
  "success": true,
  "coupon": {
    "code": "SUMMER20",
    "description": "Summer promo",
    "discountType": "percentage",
    "discountValue": 20,
    "discountAmount": 17.99
  }
}
```

**Validation checks (in order):**
1. Code exists in database.
2. `active = true`.
3. Not expired (`expires_at` < now).
4. Uses < `max_uses` (if a limit is set).
5. Subtotal ≥ `min_order_amount` (if set).

---

### Contact

#### `POST /api/contact`

Submits a customer enquiry. Saves to database and emails `OWNER_EMAIL`.

**Body:**
```json
{ "name": "Jane", "email": "jane@example.com", "phone": "2028001234", "message": "Do you cater events?" }
```

**Response:**
```json
{ "success": true, "id": 7 }
```

---

### Admin — Auth

All admin routes are prefixed `/api/admin/`. Routes below `/auth/` are public; all others require `Authorization: Bearer <token>`.

#### `POST /api/admin/auth/login`

**Owner login** (no username or username = `"admin"`):
```json
{ "password": "your-ADMIN_PASSWORD-value" }
```
Returns `{ "success": true, "token": "<password>", "role": "owner", "name": "Admin" }`.
The owner token is literally the `ADMIN_PASSWORD` value used as a bearer token.

**Staff login:**
```json
{ "username": "jane", "password": "janessecurepassword" }
```
Returns `{ "success": true, "token": "<64-byte-hex-session-id>", "role": "manager", "name": "Jane" }`.
Session expires after 7 days.

#### `POST /api/admin/auth/logout`
Requires auth. Deletes the session token from `admin_sessions` (for staff; no-op for owner password tokens).

#### `GET /api/admin/auth/me`
Requires auth. Returns `{ "success": true, "user": { "role": "...", "name": "..." } }`.

---

### Admin — Orders

#### `GET /api/admin/orders`
Returns all orders newest-first.

#### `PATCH /api/admin/orders/:id`
Update order status. Requires role: `owner`, `manager`, or `support`.

**Body:** `{ "status": "preparing" }` — valid values: `confirmed`, `preparing`, `ready`, `delivered`, `cancelled`.

---

### Admin — Enquiries

#### `GET /api/admin/enquiries`
Returns all contact enquiries newest-first.

#### `PATCH /api/admin/enquiries/:id`
Update enquiry status: `new`, `read`, or `replied`.

#### `POST /api/admin/enquiries/:id/reply`
Send an email reply to the customer. Updates status to `replied` and saves reply text.

**Body:** `{ "replyText": "Hi Jane, we do cater events…" }`

---

### Admin — Coupons

Requires role: `owner` or `manager` for create/update/delete. All roles can list.

#### `GET /api/admin/coupons`
#### `POST /api/admin/coupons`

**Body:**
```json
{
  "code": "GRAND10",
  "description": "Grand opening discount",
  "discountType": "percentage",
  "discountValue": 10,
  "minOrderAmount": 50,
  "maxUses": 100,
  "expiresAt": "2026-12-31",
  "active": true
}
```

#### `PATCH /api/admin/coupons/:id`
Same fields as create (all optional). `code` is immutable after creation.

#### `DELETE /api/admin/coupons/:id`
Hard-deletes the coupon.

---

### Admin — Staff

Owner-only endpoints.

#### `GET /api/admin/staff`
Returns all staff (password hash/salt excluded).

#### `POST /api/admin/staff`
Create a staff account.

**Body:**
```json
{
  "name": "Jane Smith",
  "username": "jane",
  "email": "jane@example.com",
  "password": "securepassword",
  "role": "manager"
}
```
Valid roles: `"manager"`, `"support"`.

#### `PATCH /api/admin/staff/:id`
Update name, email, password, role, or active flag. Pass only fields to change.

#### `DELETE /api/admin/staff/:id`
Soft-deletes by setting `active = false` and purges all their active sessions.

---

## 7. Frontend — Pages & Components

Entry: `artifacts/reigns-kitchen/src/`

### Pages

| Route | File | Purpose |
|---|---|---|
| `/` | `pages/home.tsx` | Menu browsing, cart, ordering |
| `/about` | `pages/about.tsx` | About Chef April Winston |
| `/admin` | `pages/admin.tsx` | Admin panel (login-gated) |
| `*` | `pages/not-found.tsx` | 404 fallback |

### Key Components

| Component | File | Purpose |
|---|---|---|
| `Navbar` | `components/Navbar.tsx` | Top navigation bar with cart icon |
| `Hero` | `components/Hero.tsx` | Landing hero section |
| `PromoBanner` | `components/PromoBanner.tsx` | Scrolling promo banner strip |
| `InfoBar` | `components/InfoBar.tsx` | Delivery/pickup info strip |
| `CategoryNav` | `components/CategoryNav.tsx` | Horizontal category tabs |
| `MealCard` | `components/MealCard.tsx` | Individual meal card with add-to-cart |
| `FamilyBanner` | `components/FamilyBanner.tsx` | Family meals promotional section |
| `CartSidebar` | `components/CartSidebar.tsx` | Full cart + checkout flow (slide-out) |
| `Header` | `components/Header.tsx` | Site header |
| `Footer` | `components/Footer.tsx` | Site footer |

### Cart & Checkout Flow (`CartSidebar.tsx`)

The cart sidebar is a multi-screen flow implemented in one file. Screens are managed via `useState`:

```
cart  →  checkout  →  payment  →  success / error
```

**`cart` screen:** Lists items, delivery/pickup toggle, subtotal, and a "Proceed to Checkout" button.

**`checkout` screen (`CheckoutForm`):** Collects:
- Customer name, phone, email.
- For delivery: full address (validated via `/api/delivery-fee`), preferred date (calendar picker), delivery window (dropdown).
- Optional allergies / special note.
- Optional coupon code (validated live against `/api/validate-coupon`).

Address validation flow:
1. On "Continue to Payment", the address is sent to `/api/delivery-fee`.
2. If `outOfRange: true`, a message is shown prompting contact for a custom quote; checkout is blocked.
3. If `success: true`, the fee is stored in state and the customer proceeds to payment.

**`payment` screen (`PaymentScreen`):** Embeds the Square Web Payments SDK card form loaded from `https://web.squarecdn.com/v1/square.js`. On submit, the card is tokenized via `card.tokenize()` and the token is sent with the order body to `/api/send-order`.

**`success` screen:** Shows order number and confirmation message.

**`error` screen:** Shows error with a retry option.

### State Management

| Store | File | Manages |
|---|---|---|
| `useCart` | `store/use-cart.ts` | Cart items, quantities, bundle progress |
| `useUI` | `store/use-ui.ts` | Contact modal open/close state |

`useCart` is Zustand in-memory only (no persistence). Cart is cleared after successful order submission.

### Bundle Progress Logic

Bundles available: 5 meals ($70), 10 meals ($135). Base price per standard meal: $14.99.

The `getBundleProgress()` helper in `use-cart.ts`:
- Counts non-family meals only for the bundle threshold.
- Minimum order requirement: 4 non-family meals (or 1+ family-only cart).
- Bundle discounts are applied on the frontend display; the server does not enforce bundle pricing — it receives the final per-item prices chosen by the user.

---

## 8. Business Logic

### Pricing Summary

| Category | Per-meal price |
|---|---|
| Standard Meals | $14.99 |
| Signature Meals | $17.99 (+$3 in bundles) |
| Chef's Featured | $32.99 (no bundle pricing) |
| Breakfast Plates | $12.99 – $17.99 |
| Parfaits | $8.99 |
| Family Meals (serves 3–4) | $54.99 |

### Tax
6% applied on the meal subtotal (`subtotal × 0.06`). Calculated on both frontend (display) and backend (email/WhatsApp message).

### Delivery Fees
Distance-based. See Section 6 → Delivery Fee route for tiers. Delivery is always on Fridays.

### Order Number Format
`RK-YYYYMMDD-NNN` where `NNN` is a zero-padded 3-digit random number. Generated server-side at order submission time.

### Square Integration
- SDK loaded: `<script src="https://web.squarecdn.com/v1/square.js"></script>` in `index.html`.
- Environment: **Production** (`SquareEnvironment.Production`).
- Flow: frontend tokenizes card → sends `paymentToken` + `totalCents` → server creates payment via `client.payments.create()`.
- Idempotency key: `${orderNumber}-${Date.now()}`.

---

## 9. Notifications System

### WhatsApp (CallMeBot)

Supports multiple recipients. Configured via numbered env var pairs:
- `CALLMEBOT_PHONE_1` + `CALLMEBOT_APIKEY_1`
- `CALLMEBOT_PHONE_2` + `CALLMEBOT_APIKEY_2`
- (continues incrementally until a pair is missing)

Phone numbers must be digits only (no `+` prefix), e.g. `2348106032846`.

The WhatsApp message is a plain-text formatted block with order details, items, totals, and Square payment ID.

### Email (Resend)

Two emails are sent per order:
1. **Owner notification** — HTML email with full order details, payment confirmation, allergy warnings.
2. **Customer confirmation** — HTML email with order number, itemised receipt, delivery/pickup details.

For enquiries, one email is sent to `OWNER_EMAIL` with the contact form contents.

Admin staff can reply to enquiries directly from the admin panel; this sends an HTML email to the customer via Resend, including the original message thread.

From address: controlled by `RESEND_FROM_EMAIL`. Must be a verified domain/address in Resend.

---

## 10. Admin Panel

URL: `/admin`  
File: `artifacts/reigns-kitchen/src/pages/admin.tsx`

The admin panel is a fully client-side React SPA. It stores the auth token in `localStorage` under key `rk_admin_token`. On page load it calls `/api/admin/auth/me` to verify the stored token — if invalid, it shows the login form.

### Tabs

| Tab | Access | Functionality |
|---|---|---|
| **Orders** | All roles | View all orders (newest first), expand for full detail, update status |
| **Enquiries** | All roles | View contact form submissions, update status, reply via email |
| **Coupons** | Owner + Manager | Create/edit/deactivate/delete coupon codes |
| **Staff** | Owner only | Create/edit/deactivate staff accounts |

The **Staff** tab only appears in the sidebar for users with role `"owner"`.

### Order Status Flow
`confirmed` → `preparing` → `ready` → `delivered`  
Can also be set to `cancelled` at any stage.

---

## 11. Authentication & Roles

### Owner Login
- No username required (or username = `"admin"`).
- Password is compared directly against `ADMIN_PASSWORD` env var.
- The raw password is used as the bearer token (for backwards compatibility).
- Role: `owner` — full access to everything.

### Staff Login
- Requires username + password.
- Password verified with PBKDF2-SHA512 (salt from `staff.password_salt`).
- A 64-byte hex session ID is created, stored in `admin_sessions`, expires after 7 days.
- Role: `manager` or `support`.

### Role Permissions

| Action | owner | manager | support |
|---|---|---|---|
| View orders | ✅ | ✅ | ✅ |
| Update order status | ✅ | ✅ | ✅ |
| View enquiries | ✅ | ✅ | ✅ |
| Reply to enquiries | ✅ | ✅ | ✅ |
| Manage coupons | ✅ | ✅ | ❌ |
| View staff | ✅ | ❌ | ❌ |
| Create/edit/delete staff | ✅ | ❌ | ❌ |

---

## 12. Menu & Pricing Data

All menu content lives in a single file:  
`artifacts/reigns-kitchen/src/data/menu.ts`

The `CONFIG` object is the **single source of truth** for:
- Brand name, contact details, taglines.
- Bundle options and pricing.
- All meal categories and individual menu items.
- Order deadlines and delivery notes.

To update the menu, edit `menu.ts` — no backend changes required. Items follow this shape:

```ts
{
  id: string;           // unique kebab-case ID, used as cart key
  name: string;
  description: string;
  price: number;        // per-item price in USD
  tag: string | null;   // e.g. "Signature", "Chef's Featured", "Serves 3-4"
}
```

Categories have an `isFamily` flag (affects minimum order logic) and `isFeatured` flag (excludes from bundle pricing in the UI).

---

## 13. Running Locally

### Prerequisites
- Node.js 24
- pnpm (latest)
- PostgreSQL database URL (set `DATABASE_URL`)

### Setup

```bash
# Install all workspace dependencies
pnpm install

# Set required environment variables in Replit Secrets or .env
# DATABASE_URL, ADMIN_PASSWORD, SQUARE_ACCESS_TOKEN, SQUARE_LOCATION_ID,
# RESEND_API_KEY, RESEND_FROM_EMAIL, OWNER_EMAIL,
# CALLMEBOT_PHONE_1, CALLMEBOT_APIKEY_1

# Push schema to database (dev only — no migration files)
pnpm --filter @workspace/db run push

# Run the API server
pnpm --filter @workspace/api-server run dev

# Run the frontend (in a separate terminal)
pnpm --filter @workspace/reigns-kitchen run dev
```

The frontend dev server proxies `/api/*` to `http://localhost:8080` (see `vite.config.ts`).

> **Note:** The API server auto-runs `setupDatabase()` on startup, which issues `CREATE TABLE IF NOT EXISTS` for all tables. It is safe to call repeatedly.

### Codegen (if OpenAPI spec changes)

```bash
pnpm --filter @workspace/api-spec run codegen
```

This regenerates `lib/api-client-react/src/generated/` and `lib/api-zod/src/generated/`.

---

## 14. Deployment

The project deploys on Replit. The platform manages separate dev and production PostgreSQL databases.

**Production note:** The API server runs `setupDatabase()` on every startup, which creates any missing tables in the production database. This is the migration strategy — no separate migration step is needed.

### Production build commands

| Service | Build command |
|---|---|
| Frontend | `pnpm --filter @workspace/reigns-kitchen run build` (Vite → `dist/public/`) |
| API server | `pnpm --filter @workspace/api-server run build` (esbuild → `dist/index.cjs`) |

### Routing
A reverse proxy routes traffic by path prefix defined in each artifact's `artifact.toml`:
- `/` → frontend (static files served from `dist/public/`)
- `/api` → API server (port 8080)

---

## 15. Key Customisation Points

| What to change | Where |
|---|---|
| Kitchen location (delivery distance origin) | `KITCHEN_LAT` / `KITCHEN_LNG` env vars |
| Delivery fee tiers | `artifacts/api-server/src/routes/delivery.ts` → `TIERS` array |
| Max delivery distance | Same file → `MAX_MILES` constant |
| Menu items / categories | `artifacts/reigns-kitchen/src/data/menu.ts` → `CONFIG.categories` |
| Bundle options and pricing | `CONFIG.bundles` and `CONFIG.pricePerMeal` in `menu.ts` |
| Tax rate | Search for `TAX_RATE = 0.06` in `CartSidebar.tsx` and `0.06` in `order.ts` |
| Promo banner text | `CONFIG.promoBanner` in `menu.ts` |
| Brand/contact info | `CONFIG.brand`, `CONFIG.whatsappNumber`, `CONFIG.contactEmail`, etc. in `menu.ts` |
| Order deadline message | `CONFIG.orderDeadline` in `menu.ts` |
| Square environment (sandbox vs production) | `getSquareClient()` in `artifacts/api-server/src/routes/order.ts` |
| Session TTL | `SESSION_TTL_HOURS` in `artifacts/api-server/src/lib/auth.ts` (default: 7 days) |
| Email templates (owner + customer) | `buildOwnerEmailHtml()` and `buildCustomerEmailHtml()` in `order.ts` |
| WhatsApp message format | `formatOrderMessage()` in `order.ts` |
| Google Analytics | `index.html` — `gtag` script block with measurement ID `G-BLYJ0VBVMG` |

---

*Generated August 2026. Covers the full Reigns Kitchen platform as built.*
