# bookings

Local JWT API for **Ferienwohnungen** (port **3847**). Accepts **HS256** (`get-token.mjs`) and **RS256** (OAuth IdP :3861 for `bookings`). OAuth login via shared [`oauth-idp/`](../oauth-idp/) (also used by `cakes`).

```bash
npm run start
node bookings/get-token.mjs alice   # dev JWT only
```

**Endpoints**

- `GET /vacation-rentals` — admin: units + who booked when; user: occupied/free periods only.
- `GET /bookings/{customerId}` — checked tool `listBookings` (my stays; admin any customer).
