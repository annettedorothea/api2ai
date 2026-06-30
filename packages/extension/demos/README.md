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

    All entries need `npm run start` (HTTP hosts). **`open-meteo-geocoding`** and **`open-meteo`** need no tokens for the prompt below. For **`github`** / **`tmdb`**, set tokens in **`.env.local`** (created from `.env.example` on first `start`). For **`bookings`**, **`cakes`**, **`banking`**: use Cursor Sign-in when you try those tools.

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
| `open-meteo`           | open-meteo           | HTTP (public)      | 3850 | `npm run start`                       |
| `open-meteo-geocoding` | open-meteo-geocoding | HTTP (public)      | 3851 | `npm run start`                       |
| `github`               | github               | HTTP (passthrough) | 3854 | `npm run start`; `GITHUB_TOKEN`       |
| `tmdb`                 | tmdb                 | HTTP (passthrough) | 3855 | `npm run start`; `TMDB_ACCESS_TOKEN`  |
| `spaceflight-news`     | spaceflight-news     | HTTP (public)      | 3849 | `npm run start`                       |
| `todo`                 | todo                 | HTTP (passthrough) | 3853 | `npm run start`; header in `mcp.json` |
| `bookings`             | bookings             | HTTP (oauth)       | 3872 | `npm run start`; Cursor Sign-in       |
| `cakes`                | cakes                | HTTP (oauth)       | 3874 | `npm run start`; Cursor Sign-in       |
| `banking`              | banking              | HTTP (oauth)       | 3876 | `npm run start`; enterprise IdP flow  |

Protected/checked tools: implement `src/auth/api2ai/<tools-module>/verify*Credentials.ts` (write-once stub from generate).

## Open WebUI (native)

Test HTTP MCP demos in [Open WebUI](https://docs.openwebui.com/features/extensibility/mcp/) on the host (**no Docker**). Same MCP URLs as Cursor (`127.0.0.1`). The **`api2ai`** chat prefix does not apply here.

Open WebUI is **not** part of the api2ai repo — only npm helper scripts live here. Install the app **once globally** on your Mac; db2ai demos use the same UI and data (`~/.open-webui-data`).

**Architecture:** One Open WebUI process on port `3000` talks to MCP hosts on `127.0.0.1:38xx` / `48xx` (native, not in Docker). You can start demos from api2ai or db2ai; whichever runs `npm run open-webui` first starts the UI (if the port is free). The second workspace only prints MCP hints for **its** servers. Add MCP servers from both projects manually in Admin → External Tools.

### 1. Install Open WebUI (once, globally)

You need **Python 3.11+** — macOS often ships 3.9.x only.

```bash
python3 --version   # must be ≥ 3.11
pipx install open-webui
open-webui --help   # new shell if command not found
```

Alternative: `python3 -m pip install --user open-webui`. Optional local fallback: `.open-webui-venv/` in this folder (gitignored).

Data and secret default to `~/.open-webui-data` and `~/.open-webui-secret`. Override with `OPEN_WEBUI_DATA_DIR` / `OPEN_WEBUI_SECRET_PATH`. If npm cannot find `open-webui`, set `OPEN_WEBUI_COMMAND` in `.env.local` (see `.env.example`).

**Migrate from an older local setup:** remove obsolete folders in this directory if present: `.open-webui-venv/`, `.open-webui-data/`, `.open-webui-secret` (global paths above replace them).

### 2. Start

```bash
npm run start:open-webui    # demos + UI
# or: npm run start && npm run open-webui
```

UI: `http://127.0.0.1:3000` · Stop UI started by npm: `npm run open-webui:down` (uses `~/.open-webui.pid`)

If Open WebUI is **already listening** on `OPEN_WEBUI_PORT`, `npm run open-webui` leaves it running and prints MCP setup hints only (no kill/restart).

`npm run demo:kill-all` stops mock APIs and, by default, Open WebUI. Set `OPEN_WEBUI_SKIP_KILL=1` in `.env.local` to keep the UI running while tearing down demos.

After `npm run start`, the terminal prints copy-paste values for External Tools.

### 3. Configure (three steps)

**A — External Tools (Admin)**  
Admin Settings → External Tools → **MCP (Streamable HTTP)**. Add servers from the `npm run open-webui` output (`spaceflight-news`, `todo`, …).

- **Public / header auth:** URL (+ headers for `todo`) — no login.
- **OAuth** (`bookings`, `cakes`, `banking`): see below. **Verify Connection** in Admin does not need an LLM.

**B — LLM (Admin)**  
Admin → Connections → add a model with **Function Calling = Native** (required for tool calls).

| Provider           | Setup                                                                                                                | Notes                                                                                                                                                            |
| ------------------ | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Groq** (free)    | OpenAI connection · URL `https://api.groq.com/openai/v1` · API key from [console.groq.com](https://console.groq.com) | Good default for demos. MCP adds many tokens — prefer **`llama-4-scout`** over large models (`qwen3-32b` hits TPM limits quickly). Enable **one tool** per test. |
| **Ollama** (local) | URL `http://127.0.0.1:11434`                                                                                         | No API limits; [ollama.com](https://ollama.com)                                                                                                                  |
| **OpenAI API**     | URL `https://api.openai.com/v1` · `sk-…` key                                                                         | Pay-per-use (~$0.15/$0.60 per 1M tokens for GPT-4o mini). **ChatGPT Plus is separate** — no API key included.                                                    |

**C — Chat**  
Tools from Admin are **not** auto-enabled. Per chat: in the message toolbar, **Integrations** (four-diamond grid icon beside **+** — not the plus button) → **Tools** → tick the server(s). If the list is empty, **reload the page** once or twice after saving External Tools in Admin. For OAuth tools, complete the browser login (`alice` / `bob` / `admin`). Do not set OAuth tools as model defaults — enable per chat only.

Example prompt after enabling `bookings` as `alice`: _“Show my bookings.”_

### OAuth demos in Open WebUI

Add Open WebUI callbacks to **`.env.local`**, then restart demos:

```bash
OAUTH_IDP_REDIRECT_URIS=cursor://anysphere.cursor-mcp/oauth/callback,http://localhost:3000/oauth/clients/mcp:*,http://127.0.0.1:3000/oauth/clients/mcp:*
```

```bash
npm run demo:kill-all && npm run start
```

| Demo       | MCP URL                     | OAuth Server URL        |
| ---------- | --------------------------- | ----------------------- |
| `bookings` | `http://127.0.0.1:3872/mcp` | `http://127.0.0.1:3861` |
| `cakes`    | `http://127.0.0.1:3874/mcp` | `http://127.0.0.1:3860` |
| `banking`  | `http://127.0.0.1:3876/mcp` | `http://127.0.0.1:3862` |

Auth: **OAuth 2.1 (Static)** · Client ID `mcp-demo-local` · Client Secret `demo` (placeholder — IdP is a public client) · **Register Client** → Save.

### Troubleshooting

| Symptom                                       | Fix                                                                   |
| --------------------------------------------- | --------------------------------------------------------------------- |
| `Open WebUI is not installed`                 | `pipx install open-webui` or set `OPEN_WEBUI_COMMAND` in `.env.local` |
| Tools in Admin but not in chat                | **Integrations** (diamond icon beside **+**) → **Tools** per chat     |
| Tools missing under Integrations → Tools      | Reload page; confirm Admin save + `npm run start`                     |
| Groq `Request too large` / TPM limit          | Smaller model (`llama-4-scout`), fewer tools, new chat                |
| `OAuth client registration is still invalid…` | Add `OAUTH_IDP_REDIRECT_URIS` above, restart demos                    |
| OAuth tool fails mid-chat                     | Enable per chat (not as model default); re-login if token expired     |

More detail: [`oauth-idp/README.md`](./oauth-idp/README.md)

## Scripts

| Command                    | Purpose                                                                   |
| -------------------------- | ------------------------------------------------------------------------- |
| `npm run start`            | All mock APIs + HTTP/OAuth MCP hosts (background)                         |
| `npm run start:foreground` | Same, logs in terminal until Ctrl+C                                       |
| `npm run start:open-webui` | `start` then native Open WebUI + MCP setup hints                          |
| `npm run open-webui`       | Open WebUI only (expects `npm run start` already)                         |
| `npm run open-webui:down`  | Stop Open WebUI started via npm (`~/.open-webui.pid`; keeps data)         |
| `npm run demo:kill-all`    | Stop MCP hosts and mock APIs (Open WebUI unless `OPEN_WEBUI_SKIP_KILL=1`) |

`start` does not overwrite `.env.local`. Reload MCP after `.api2ai`, `mcp.json`, or env changes.

## Chat prefix

Begin prompts with **`api2ai`** (e.g. `api2ai How will the weather…`) so the workspace rule applies and the agent uses only your configured MCP servers—not web search or other tools.

---

#Col3:23
