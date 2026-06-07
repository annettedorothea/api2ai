# api2ai MCP demos

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

## Demos

One MCP server per row — names match `.cursor/mcp.json`.

| MCP server             | DSL                  | Transport | Auth              | Port | Credential / Prerequisites                                 |
| ---------------------- | -------------------- | --------- | ----------------- | ---- | ---------------------------------------------------------- |
| `open-meteo`           | open-meteo           | stdio     | —                 | —    | —                                                          |
| `open-meteo-geocoding` | open-meteo-geocoding | stdio     | —                 | —    | —                                                          |
| `github`               | github               | stdio     | opaque            | —    | `GITHUB_TOKEN` in `.env.local`                             |
| `tmdb`                 | tmdb                 | stdio     | opaque            | —    | `TMDB_ACCESS_TOKEN` in `.env.local`                        |
| `spaceflight-news`     | spaceflight-news     | HTTP      | —                 | 3849 | `start` starts host                                        |
| `todo`                 | todo                 | HTTP      | static            | 3853 | `start` starts host; API key in `mcp.json` `x-api-token`   |
| `bookings-oauth`       | bookings-api         | OAuth     | oidc              | 3872 | `start` starts IdP + host; Cursor Sign-in (RS256 :3861)    |
| `cakes`                | cakes                | OAuth     | opaque            | 3874 | `start` starts IdP + API + host; Cursor Sign-in (:3860)    |
| `banking-oauth`        | banking              | OAuth     | opaque + exchange | 3876 | `start` starts enterprise IdP (:3862) + API (:3858) + host |

---

#Col3:23
