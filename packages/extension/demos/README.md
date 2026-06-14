# api2ai MCP demos

> **Pre-release** — demo workspace for trying api2ai; not a stability guarantee for production.

[`.cursor/mcp.json`](./.cursor/mcp.json) · `.api2ai` workspace root

```bash
npm install && npm run start           # stdio + HTTP + OAuth (background)
npm run start:foreground               # … Ctrl+C stops services started here
```

- Optional: `GITHUB_TOKEN`, `TMDB_ACCESS_TOKEN` in `.env.local` (stdio opaque)
- Open this folder as Cursor workspace root
- Cursor Settings → Tools & MCPs: enable needed servers
- Reload MCP after `.env.local`, `mcp.json`, or `.api2ai` changes

`npm run demo:kill-all` · `start` does not overwrite `.env.local`

Protected/checked tools: implement `src/auth/<module>/verifyCredential.ts` (write-once stub from generate).

## Demos

One MCP server per row — names match `.cursor/mcp.json`.

| MCP server             | DSL                  | Transport          | Port | Credential / prerequisites                                                                       |
| ---------------------- | -------------------- | ------------------ | ---- | ------------------------------------------------------------------------------------------------ |
| `open-meteo`           | open-meteo           | stdio              | —    | —                                                                                                |
| `open-meteo-geocoding` | open-meteo-geocoding | stdio              | —    | —                                                                                                |
| `github`               | github               | stdio              | —    | `GITHUB_TOKEN` in `.env.local`; PAT relay in `verifyCredential`                                  |
| `tmdb`                 | tmdb                 | stdio              | —    | `TMDB_ACCESS_TOKEN` in `.env.local`                                                              |
| `spaceflight-news`     | spaceflight-news     | HTTP (public)      | 3849 | `start` starts host                                                                              |
| `todo`                 | todo                 | HTTP (passthrough) | 3853 | `start` starts host; `x-api-token` in `mcp.json`; `TODO_API_KEY` checked in `verifyCredential`   |
| `bookings-oauth`       | bookings-api         | HTTP (oauth)       | 3872 | `start` starts IdP (:3861) + host; Cursor Sign-in; OIDC in `verifyCredential`                    |
| `cakes`                | cakes                | HTTP (oauth)       | 3874 | `start` starts IdP (:3860) + API + host; Cursor Sign-in; JWT in `verifyCredential`               |
| `banking-oauth`        | banking              | HTTP (oauth)       | 3876 | `start` starts enterprise IdP (:3862) + API (:3858) + host; token exchange in `verifyCredential` |

---

#Col3:23
