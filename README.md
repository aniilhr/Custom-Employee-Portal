# Custom Employee Portal with Zoho One Integration

A custom-built employee portal with its own authentication and Role-Based Access
Control (RBAC), integrating with Zoho One so each employee only sees and can launch
the Zoho applications their role is authorized for — without ever needing individual
Zoho credentials.

| Role    | Zoho App     | Purpose                                  |
|---------|--------------|-------------------------------------------|
| HR      | Zoho People  | HR management functions                   |
| Sales   | Zoho CRM     | Sales and customer relationship management |
| Support | Zoho Desk    | Support ticketing and case management      |
| Finance | Zoho Books   | Financial and accounting operations        |
| Admin   | All of the above | Full portal + user/role management     |

## Architecture

- **Frontend:** React (Vite) — login, role-aware dashboard, admin panel
- **Backend:** Node.js / Express — JWT auth, RBAC middleware, Zoho OAuth proxy layer
- **Database:** SQLite via Sequelize for the demo (swap `dialect` for `postgres`/`mysql` in `backend/src/config/db.js` for production)
- **Tables:** Users, Roles, Permissions, UserRoles (join), RolePermissions (join), AuditLogs

```
custom-employee-portal/
├── backend/
│   ├── src/
│   │   ├── config/        # DB connection, Zoho app → role map
│   │   ├── controllers/   # auth, admin, zoho route handlers
│   │   ├── middlewares/   # JWT verification, RBAC guards, error handler
│   │   ├── models/        # Sequelize models + associations
│   │   ├── routes/        # Express routers
│   │   └── services/      # Zoho token service, JWT signing, audit logging
│   ├── .env.example
│   └── server.js
└── frontend/
    └── src/
        ├── components/    # Navbar, ProtectedRoute
        ├── pages/         # Login, Dashboard, AdminPanel
        ├── services/      # axios API client
        └── utils/         # client-side session helpers
```

## 1. Prerequisites

- Node.js 18+
- A free Zoho One trial account (for the Zoho API credentials)

## 2. Get Zoho API credentials

1. Sign up for a free Zoho One trial: https://www.zoho.com/one/
2. Go to the [Zoho API Console](https://api-console.zoho.com/) and register a **Server-based Application**.
3. Note the generated `Client ID` and `Client Secret`.
4. Generate a refresh token for the scopes you need (e.g. `ZohoPeople.employee.ALL`,
   `ZohoCRM.modules.ALL`, `ZohoDesk.tickets.ALL`, `ZohoBooks.fullaccess.all`) — Zoho's
   [self-client flow](https://www.zoho.com/accounts/protocol/oauth/self-client/self-client-authorization.html)
   is the fastest way to do this for a single backend service account.

## 3. Backend setup

```bash
cd backend
cp .env.example .env
# edit .env: set JWT_SECRET, ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN, etc.
npm install
npm run seed     # creates database.sqlite, seeds Roles/Permissions and 5 demo users
npm run dev       # starts the API on http://localhost:5000
```

Demo accounts created by `npm run seed`:

| Email                 | Password       | Role    |
|------------------------|----------------|---------|
| admin@company.com      | (set in .env)  | Admin   |
| hr@company.com         | Password@123   | HR      |
| sales@company.com      | Password@123   | Sales   |
| support@company.com    | Password@123   | Support |
| finance@company.com    | Password@123   | Finance |

## 4. Frontend setup

```bash
cd frontend
npm install
npm run dev       # starts the app on http://localhost:5173 (proxies /api to :5000)
```

Open http://localhost:5173, sign in with any demo account above, and you'll land on
a dashboard showing only the Zoho app(s) that role is authorized for. Sign in as
`admin@company.com` to reach the **Admin** tab for user/role management and audit logs.

## 5. How RBAC is enforced

- Every login issues a JWT containing the user's `roles` and derived `permissions`.
- `middlewares/auth.js` verifies the JWT on every protected request.
- `middlewares/rbac.js` (`requireRole`, `requirePermission`) gates specific routes —
  e.g. all `/api/admin/*` routes require the `Admin` role.
- `GET /api/zoho/apps` returns only the Zoho apps mapped to the caller's role(s).
- `POST /api/zoho/launch/:appKey` re-validates the role server-side before returning
  a launch URL — the frontend hiding a button is a UX nicety, not the security boundary.

## 6. How Zoho integration works

- The backend holds a **single Zoho One service-account** refresh token (`.env`,
  never shipped to the browser).
- `services/zohoService.js` exchanges that refresh token for a short-lived access
  token, caches it in memory, and refreshes it automatically before it expires.
- Employees never see or handle Zoho credentials — they only ever talk to the
  portal's own JWT-protected API, which proxies to Zoho on their behalf.

## 7. Security notes for production

- Replace SQLite with Postgres/MySQL and add migrations.
- Store the Zoho refresh token in a secrets manager (not plain `.env`) in production.
- Enforce HTTPS everywhere and set secure/httpOnly cookies if you move off
  Authorization-header JWTs.
- Add rate limiting and account lockout to `/api/auth/login`.
- Add token/session revocation (e.g. short-lived JWT + refresh token rotation).
