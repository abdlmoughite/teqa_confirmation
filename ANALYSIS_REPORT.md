# TEQA Confirmation - Analysis Report

Date: 2026-05-02

## 1. Workspace Inventory

Frontend: `teqa_confirmation`

- Stack: React CRA, JavaScript, Tailwind CSS, axios, react-router-dom, framer-motion, lucide-react.
- Entrypoints: `src/index.js`, `src/App.js`, `src/pages/AppConfirmation.jsx`.
- API layer: `src/api/auth.js`, `src/api/authConfig.js`.
- Contexts: `AuthContext`, `LanguageContext`, `ThemeContext`, `ToastContext`.
- Guards/RBAC: `src/guards/RequirePermission.jsx`, `src/config/permissions.js`, `src/router/PrivateRoute.jsx`.
- Layout: `src/compnent/Saidbar.jsx`, `src/compnent/Topbar.jsx`.
- Main pages/modules:
  - Dashboard: `src/compnent/dashboard/Dashboard.jsx`
  - Orders cockpit: `src/pages/OrdersPage.jsx`
  - Offers CRUD: `src/compnent/offers/*`
  - Collaborations: `src/compnent/collaborations/*`
  - Messaging: `src/compnent/messaging/MessagingCenter.jsx`
  - Commissions: `src/compnent/commissions/*`
  - Wallet: `src/compnent/wallet/*`
  - Invoices: `src/compnent/invoices/*`
  - Profile/settings/team: `src/pages/ProfilePage.jsx`, `src/pages/SettingsPage.jsx`, `src/pages/TeamUsersPage.jsx`
- Styles: `src/index.css`, `src/styles/tokens.css`, `tailwind.config.js`, `SKILL.md`.

Backends:

- Auth backend: `backend/auth_teqa_connect`
- Marketplace backend: `backend/marketplace_service`

## 2. Backend APIs

### Auth service base

Configured as `/auth/`.

- `POST register/`: create Store, Agency Owner, Agency Agent or Admin account.
- `POST login/`: login and set JWT cookies.
- `POST logout/`: logout and clear cookies.
- `POST check-email/`: email availability.
- `POST check-username/`: username availability.
- `POST check-store-name/`: store name availability.
- `POST check-agency-name/`: agency name availability.
- `POST password/reset/`: request reset email.
- `POST password/reset/confirm/`: confirm password reset.
- `GET auth-check/`: validate authenticated session.
- `GET user/me/`: current user payload, including role, parent/child flags and permissions.
- `PATCH user/profile/`: update profile fields supported by backend serializer.
- `PATCH user/language/`: persist language in DB.
- `GET permissions/catalog/`: permission catalog for team assignment.
- `GET user/children/`: list direct child accounts.
- `POST user/children/create/`: create child account.
- `PATCH user/children/<uuid>/status/`: update child active/status/permissions.
- `PATCH admin/users/<uuid>/status/`: admin-only user status update.
- `GET/POST register/delivery/`: deliveryman list/create.
- `POST pre-inscription/`, `GET pre-inscription/list/`: pre-registration workflow.

### Marketplace service base

Configured as `http://127.0.0.1:8000/` in dev.

- `GET health/`: service health.
- `GET api/core/dashboard/stats/`: dashboard KPIs scoped by authenticated role.
- `GET api/core/me/capabilities/`: current role, permissions, owner profile references.

Offers: `api/offers/`

- `GET /`, `POST /`, `GET/PATCH/PUT/DELETE /<id>/`
- `GET marketplace/`: active marketplace offers.
- `GET mine/`: offers owned by current provider.
- `GET stats/`: provider offer counts.
- Filters supported by backend include status/provider/search-like query parameters where implemented.

Collaborations: `api/collaborations/collaborations/`

- `GET /`, `POST /`, `GET/PATCH/PUT/DELETE /<id>/`
- `POST <id>/respond/`: accept/reject/counter workflow.
- `POST <id>/deactivate/`, `POST <id>/activate/`
- `GET summary/`: collaboration summary counts.
- `GET <id>/thread/`: full thread/tree items for parent/counter chain.
- Filters: status, offer, source/order assignment fields where supported.

Wallets: `api/wallets/`

- `wallets/`: CRUD wallets.
- `GET wallets/summary/`: wallet summary.
- `POST wallets/<id>/add-balance/`: add balance.
- `wallet-transfers/`: CRUD transfers.
- `GET wallet-transfers/my-transactions/`: scoped transactions.
- `GET wallet-transfers/stats/`: transfer stats.

Commissions: `api/commissions/`

- `GET commissions/`, `GET commissions/<id>/`
- `GET commissions/stats/`: commission totals by status.
- `GET commissions/<id>/payment-attempts/`: payment attempt history.
- `GET wallet-transactions/`: wallet transaction traces.
- `GET webhook-events/`: webhook traces.
- `POST webhooks/commission/`: integration webhook ingest.

Invoices: `api/invoices/invoices/`

- `GET /`, `GET /<id>/`
- `POST pay-commission/`
- `GET my-stats/`
- `GET <id>/download-pdf/`
- `GET export/`
- `GET <id>/transfer-details/`
- `GET by-order/<order_id>/`

Messaging: `api/messaging/`

- `GET/POST conversations/`, `GET/PATCH/PUT/DELETE conversations/<id>/`
- `GET conversations/<id>/messages/`
- `GET conversations/stats/`
- `GET conversations/unread/`
- `POST conversations/<id>/send-message/`
- `POST conversations/<id>/inject-collaboration/`
- `POST conversations/<id>/mark-read/`
- `POST conversations/<id>/archive/`
- `POST conversations/<id>/reopen/`
- `GET messages/`, `GET messages/<id>/` read-only.

## 3. Data Models

Auth:

- `User`: UUID, email, username, role (`STORE`, `AGENCY_OWNER`, `AGENCY_AGENT`, `ADMIN`), language (`fr`, `en`, `ar`), status, parent, permissions.
- `Store`: store owner profile.
- `Agency`: agency owner profile.
- `Agent`: agency agent profile, optionally linked to agency.
- `Deliveryman`: simple delivery profile.
- `PreInscrAgConfirmation`: pre-registration for confirmation partners.

Marketplace:

- `MarketplaceOffer`: provider type/id, title, description, price, currency, status.
- `Collaboration`: store/provider negotiation tree with parent/root, offer, price, status, acceptance flags, assignment sources.
- `Conversation`: two participants, offer/collaboration links, status, last message data.
- `Message`: conversation message, sender, body, type, metadata, read status.
- `Commission`: order commission totals and payment status.
- `PaymentAttempt`: success/failed payment traces with error code and balances.
- `WalletTransaction`: commission-linked transaction trace.
- `Wallet`: owner wallet and balance.
- `WalletTransfer`: transfer/debit/credit records.
- `Invoice`: commission invoices and invoice payment metadata.

## 4. Roles And Permissions

Roles surfaced by backend:

- `STORE`: store owner.
- `AGENCY_OWNER`: agency account.
- `AGENCY_AGENT`: agent account.
- `ADMIN`, plus marketplace-compatible `SAAS`/`SUPERADMIN` in some modules.
- Child/sub-account: any `User` with `parent_id`, same role family but restricted by assigned `permissions`.

Permission catalog includes dashboard, offers, orders, collaborations, wallets, commissions, wallet transactions, invoices, messaging, profile, settings and team permissions. Full access is `*`.

Frontend currently supports RBAC through `AuthContext`, `RequirePermission`, route permission groups and dynamic sidebar visibility. Child accounts are hidden from team management and receive explicit route/action restrictions.

## 5. UI Implemented Vs Missing

Already implemented or partially implemented:

- Protected app shell with sidebar/topbar.
- RBAC route guards.
- Toast context.
- Dashboard stats from marketplace API.
- Offers CRUD and marketplace/mine endpoints.
- Collaborations list, details, respond/activate/deactivate and thread endpoint.
- Messaging conversations, unread filter, send, archive/reopen, mark-read.
- Commissions list, stats and payment attempt modal.
- Wallets, transfers, invoices.
- Profile update and language field.
- Child-user creation/list/status/permissions.

Missing or incomplete:

- Full TEQA design tokens from the current `SKILL.md` were not installed as `globals.css`.
- Several components still use old Tailwind colors/classes directly instead of shared TEQA primitives.
- Dark mode keys are inconsistent (`theme` vs `teqa-theme`).
- Language persistence exists but should use stable local key `teqa-lang`, toast failure feedback and immediate `html lang/dir`.
- Collab history needs clearer parent-to-child timeline UI.
- Messaging style needs consistent conversation item, unread badge, bubble and input CSS classes.
- Commission page needs stronger summary card and clearer payment attempts history.
- Profile lacks the richer profile header/tabs requested. Backend does not expose profile stats, password update or avatar upload endpoints.
- Child users list is table-first, not card-first. Backend has no child detail/stats/delete endpoints.
- Orders APIs are not present in the analyzed backends, so the Orders page must remain a local cockpit/TODO until an order service endpoint exists.

## 6. Implementation Plan

1. Add `src/styles/globals.css` with TEQA tokens and import it before app styles.
2. Merge `tailwind.config.js` to current TEQA indigo tokens.
3. Add reusable loading primitives: skeleton, spinner and page loader.
4. Normalize theme and language contexts to `teqa-theme` and `teqa-lang`, with DB language sync and toast errors.
5. Add dark mode toggle component and expose it in Topbar/sidebar.
6. Harden `authConfig.js`: dev-friendly URLs, env-based token only, no hardcoded production JWT.
7. Add TEQA CSS classes for timeline, messaging, commissions, profile and child cards.
8. Update collaboration details history to timeline from `GET collaborations/<id>/thread/`.
9. Update messaging markup to use the modern conversation/item/bubble/input classes.
10. Upgrade commissions summary and payment attempt history using existing stats + `payment-attempts`.
11. Upgrade profile UI with backend-supported fields only; add TODO comments for password/avatar/stats.
12. Upgrade child users to cards plus invite form using existing create/list/status/catalog APIs.
13. Run production build and correct regressions.

## 7. API TODOs

These features are requested by product but are not supported by the analyzed backend yet:

- `GET /profile/stats`
- `PUT /profile/password`
- `POST /profile/avatar`
- `GET /users/children/:id`
- `DELETE /users/children/:id`
- `GET /users/children/:id/stats`
- Order CRUD/status/note/reassign/export endpoints in this workspace.
- Commission withdrawal endpoints such as `request-withdrawal` and `payment-methods`.
- Real-time WebSocket presence/online status for messaging.

