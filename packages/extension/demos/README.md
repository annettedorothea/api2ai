# api2ai MCP demos

Workspace: `.api2ai` · MCP config: [`.cursor/mcp.json`](./.cursor/mcp.json)

## Quick start

- [ ] `npm install`
- [ ] `npm run init`
- [ ] Optional: `GITHUB_TOKEN`, `TMDB_ACCESS_TOKEN` in `.env.local` (stdio opaque)
- [ ] Open this folder as Cursor workspace root
- [ ] Cursor Settings → Tools & MCPs: enable needed servers
- [ ] Reload MCP after `.env.local`, `mcp.json`, or tool changes in `.api2ai` (add, edit, remove)

`npm run demo:kill-all` · `init` does not overwrite `.env.local`

## Demos

One MCP server per row — names match `.cursor/mcp.json`.

| MCP server             | DSL                  | Transport | Auth   | Port | Credential / Prerequisites                              |
| ---------------------- | -------------------- | --------- | ------ | ---- | ------------------------------------------------------- |
| `open-meteo`           | open-meteo           | stdio     | —      | —    | —                                                       |
| `open-meteo-geocoding` | open-meteo-geocoding | stdio     | —      | —    | —                                                       |
| `github`               | github               | stdio     | opaque | —    | `GITHUB_TOKEN` in `.env.local`                          |
| `tmdb`                 | tmdb                 | stdio     | opaque | —    | `TMDB_ACCESS_TOKEN` in `.env.local`                     |
| `spaceflight-news`     | spaceflight-news     | HTTP      | —      | 3849 | `init` starts host                                      |
| `todo`                 | todo                 | HTTP      | static | 3853 | `init` starts host; API key in `mcp.json` `x-api-token` |
| `bookings-oauth`       | bookings-api         | OAuth     | oidc   | 3872 | `init` starts IdP + host; Cursor Sign-in (RS256 :3861)  |
| `cakes`                | cakes                | OAuth     | opaque | 3874 | `init` starts IdP + API + host; Cursor Sign-in (:3860)  |

---

#Col3:23
