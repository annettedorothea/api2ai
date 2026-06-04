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

### HTTP (`http-api2ai-mock-api`)

1. Backend: `npm run demo:mock-api` (port **3847**).
2. Host: `npm run demo:mcp-http:mock-api` (port **3850**).
3. Enable **`http-api2ai-mock-api`** only; reload MCP.
4. JWT via **`headers.x-api-token`** in `mcp.json` (demo **admin** token for local test). Replace with `node get-token.mjs <customerId>` when needed.

- **`login`** (`public`) — works without JWT
- **`listCustomerOrders`** (`checked`) — needs credential (stdio: env; HTTP: header in `mcp.json` or Cursor MCP UI)

Prompts: `api2ai login as alice` then `api2ai list my orders`.

---

#Col3:23
