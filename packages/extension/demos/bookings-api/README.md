# bookings-api

Local JWT API for **Ferienwohnungen** (port **3847**). OAuth via [`oauth-idp/`](./oauth-idp/) + MCP **`bookings-api-oauth`**.

```bash
npm run demo:bookings-api
node bookings-api/get-token.mjs alice   # dev JWT only
```

**Endpoints**

- `GET /vacation-rentals` — admin: units + who booked when; user: occupied/free periods only.
- `GET /bookings/{customerId}` — checked tool `listBookings` (my stays; admin any customer).
