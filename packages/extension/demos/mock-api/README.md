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

After `npm run generate:mock-api-tools`, enable `api2ai-mock-api` in `.cursor/mcp.json` and reload MCP.

- **`login`** (`public`) — `pathParams.customerId` → returns `access_token` (no Bearer required)
- **`listCustomerOrders`** — no `customerId` in schema; taken from JWT via `fromJwt` (set token in `.env.local` first)

Prompts: `api2ai login as alice` then `api2ai list my orders`.
