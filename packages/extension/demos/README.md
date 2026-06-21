# api2ai MCP demos

> **Pre-release** — demo workspace for trying api2ai; not a stability guarantee for production.

**Prerequisite:** demo workspace created via **api2ai: Create demo workspace** (VSIX extension).

[`.cursor/mcp.json`](./.cursor/mcp.json) · `.api2ai` workspace root

## Quick start

**Goal:** geocode a city, then fetch a weather forecast via MCP (no API token).

1. Terminal in this folder:

```bash
npm run start
```

Runs `npm install`, `generate:all`, `build:generated`, and starts all mock APIs plus HTTP/OAuth MCP hosts in the background (first run may take a minute).

2. Cursor → **Settings → Tools & MCP** → enable the servers you want → **Reload MCP**

    All entries can stay on — HTTP hosts are already running. **`open-meteo-geocoding`** and **`open-meteo`** need no tokens for the prompt below. For **`github`** / **`tmdb`**, set tokens in **`.env.local`** (created from `.env.example` on first `start`). For **`bookings`**, **`cakes`**, **`banking`**: use Cursor Sign-in when you try those tools.

3. Chat (copy-paste — prefix **`api2ai`** activates the demo MCP rule):

```text
api2ai How will the weather be tomorrow in Berlin?
```

The agent should call **geocoding** first (Berlin → coordinates), then **open-meteo** for the forecast.

## What's next

| Step | Enable MCP server              | Setup                                           | Example prompt                             |
| ---- | ------------------------------ | ----------------------------------------------- | ------------------------------------------ |
| 1    | —                              | Edit **`open-meteo.api2ai`**, save              | Watch generate-on-save update `generated/` |
| 2    | `spaceflight-news`, `todo`     | already up after `npm run start`                | Latest space news headlines                |
| 3    | `github`, `tmdb`               | Tokens in **`.env.local`** (see `.env.example`) | GitHub user profile / movie search         |
| 4    | `bookings`, `cakes`, `banking` | Cursor Sign-in (hosts already running)          | See **All demos** for auth notes           |

## All demos

One MCP server per row — names match `.cursor/mcp.json`.

| MCP server             | DSL                  | Transport          | Port | Credential / prerequisites            |
| ---------------------- | -------------------- | ------------------ | ---- | ------------------------------------- |
| `open-meteo`           | open-meteo           | stdio              | —    | —                                     |
| `open-meteo-geocoding` | open-meteo-geocoding | stdio              | —    | —                                     |
| `github`               | github               | stdio              | —    | `GITHUB_TOKEN` in `.env.local`        |
| `tmdb`                 | tmdb                 | stdio              | —    | `TMDB_ACCESS_TOKEN` in `.env.local`   |
| `spaceflight-news`     | spaceflight-news     | HTTP (public)      | 3849 | `npm run start`                       |
| `todo`                 | todo                 | HTTP (passthrough) | 3853 | `npm run start`; header in `mcp.json` |
| `bookings`             | bookings             | HTTP (oauth)       | 3872 | `npm run start`; Cursor Sign-in       |
| `cakes`                | cakes                | HTTP (oauth)       | 3874 | `npm run start`; Cursor Sign-in       |
| `banking`              | banking              | HTTP (oauth)       | 3876 | `npm run start`; enterprise IdP flow  |

Protected/checked tools: implement `src/auth/api2ai/<tools-module>/verify*Credentials.ts` (write-once stub from generate).

## Scripts

| Command                    | Purpose                                           |
| -------------------------- | ------------------------------------------------- |
| `npm run start`            | All mock APIs + HTTP/OAuth MCP hosts (background) |
| `npm run start:foreground` | Same, logs in terminal until Ctrl+C               |
| `npm run demo:kill-all`    | Stop MCP hosts and mock APIs                      |

`start` does not overwrite `.env.local`. Reload MCP after `.api2ai`, `mcp.json`, or env changes.

## Chat prefix

Begin prompts with **`api2ai`** (e.g. `api2ai How will the weather…`) so the workspace rule applies and the agent uses only your configured MCP servers—not web search or other tools.

---

#Col3:23
