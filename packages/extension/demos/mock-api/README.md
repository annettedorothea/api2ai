# mock-api — local JWT demo server

Runs on **http://127.0.0.1:3847** (override with `MOCK_API_PORT`).

## Start

```bash
npm run demo:mock-api
```

Stop the server (frees port 3847):

```bash
npm run demo:mock-api:kill
```

## Get a token

```bash
node mock-api/get-token.mjs alice
```

Add to `.env.local`:

```env
MOCK_API_ACCESS_TOKEN=<paste token>
```

Demo customers: `alice`, `bob` (see `data/orders.json`).

## curl

```bash
curl -s -X POST "http://127.0.0.1:3847/login/alice"
curl -s -H "Authorization: Bearer <token>" "http://127.0.0.1:3847/orders/alice"
```

## MCP

### stdio (`stdio-api2ai-mock-api`)

After `npm run generate:mock-api-tools`, enable **`stdio-api2ai-mock-api`** in [`.cursor/mcp.json`](../.cursor/mcp.json) and reload MCP. Token in **`.env.local`** as `MOCK_API_ACCESS_TOKEN` (see above).

### HTTP stateless (`http-api2ai-mock-api`)

1. Backend: `npm run demo:mock-api` (port **3847**).
2. Host: `npm run demo:mcp-http:mock-api` (port **3850**).
3. Enable **`http-api2ai-mock-api`** only; reload MCP.
4. JWT via **`headers.x-api-token`** in `mcp.json` (demo **admin** token for local test). Replace with `node get-token.mjs <customerId>` when needed.

### OAuth HTTP (`oauth-api2ai-mock-api`) — Cursor login

1. Backend: `npm run demo:mock-api` (port **3847**).
2. IDP: `npm run demo:oauth-idp` (port **3860**, [`mock-api/oauth-idp/`](./oauth-idp/)).
3. Host: `npm run demo:mcp-oauth:mock-api` (port **3870**).
4. Enable **`oauth-api2ai-mock-api`** only; reload MCP → **401 on `initialize`** when protected/checked tools exist → Cursor starts OAuth when you enable/connect the server. Returning sessions reuse `Mcp-Session-Id` + cached Bearer. Do not open `http://127.0.0.1:3860/authorize` alone in the browser (no PKCE params).
5. Protected tool: `listCustomerOrders`. Public upstream tool `login` still exists for stdio/stateless; prefer OAuth on this server.

- **`login`** (`public`) — redundant for `oauth-api2ai-mock-api`; use OAuth instead
- **`listCustomerOrders`** (`checked`) — Bearer from Cursor after IDP login

Prompts after OAuth: `api2ai list my orders`.

### Cursor: Login / anderer User (bob)

Ein **401 allein öffnet oft keinen Browser** — Cursor startet OAuth intern (`MCP OAuth redirect to authorization` im Log), der Login läuft über die **MCP-UI**:

1. **Settings → MCP** (oder MCP-Liste) → Server `oauth-api2ai-mock-api…` → **Sign in** / **Needs login** / **Connect** anklicken (nicht nur Toggle an/aus).
2. Browser/Popup erlauben → IDP `http://127.0.0.1:3860` → **bob** wählen.
3. Flow muss bis `cursor://…/oauth/callback` durchlaufen; bei `Client error: Unauthorized` im Log ist der Callback **nicht** fertig — Schritt 1 wiederholen.
4. User wechseln: Server in `mcp.json` **umbenennen** (neuer Name = neues Token in Cursor) oder OAuth **trennen**, dann erneut anmelden.
5. Erwartung bob: nur **ord-bob-1**; alice: **ord-alice-1/2**.

`demo:oauth-idp` neu starten nach IDP-Änderungen; `demo:mcp-oauth:mock-api` nach Host-Codegen-Änderungen.

---

#Col3:23
