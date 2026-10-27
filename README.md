# 🚀 Orbit — Space Travel Booking (GitHub Pages)

Frontend-only lab project demonstrating **Singleton** and **Adapter** patterns.

- Singleton → `js/OrbitManager.js` (one manager for users, sessions, trips, bookings; proof shown on dashboard)
- Adapter → `js/PaymentAdapter.js` (wraps a mock legacy gateway; no real payments)
- `js/backend.js` routes UI calls to those classes. Data is stored in browser localStorage.

## Deploy on GitHub Pages
Repo → Settings → Pages → Source: *Deploy from a branch* → `main` / `(root)` → Save.
Site: https://<username>.github.io/<repo>/

Test a failed payment with a card ending `0000`.
