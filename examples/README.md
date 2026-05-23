# examples — Setup, Secrets und Demo-Prompts

Dieser Ordner ist der **Cursor-Workspace** für MCP-Demos: [`.cursor/mcp.json`](.cursor/mcp.json) (im Git, nur Base-URLs), `.api2ai`-Dateien, generierte Tools und lokale Secrets in `.env.local`.

Ausführliche Repo-Checkliste: [README.md](../README.md#getting-started-checkliste) im Repository-Root.

---

## Setup-Checkliste (neuer Rechner)

- **Node.js 20+** (`node -v`)
- Repository klonen
- Im **Repository-Root:**
  ```bash
  npm install
  npm run langium:generate
  npm run build
  ```
- **In `examples/`** (MCP-Runtime-Abhängigkeiten):
  ```bash
  cd examples
  npm install
  ```
- **MCP-Konfig:** [`.cursor/mcp.json`](.cursor/mcp.json) liegt im Git; Tokens nur in `.env.local`
- **Secrets** (siehe unten): TMDB/GitHub in `mcp.json` `env` oder `.env.local`
- **Cursor:** Ordner `examples` als Workspace öffnen (nicht nur Repo-Root — sonst fehlt `.cursor/mcp.json`)
- **MCP:** Einstellungen → Tools & MCP → Server `api2ai-`* aktivieren
- **Test:** Chat mit `api2ai wie ist das Wetter in Berlin` (Open-Meteo, kein Token nötig)
- Nach Änderung an `.api2ai`: `npm run generate:…` im Root, dann MCP-Server neu laden (`Developer: Reload Window` oder MCP-Refresh)

Generierte Dateien unter `generated/` liegen im Git — Regenerieren nur nötig, wenn ihr die DSL ändert.

---

## MCP-Konfiguration (`.cursor/mcp.json`)

[`mcp.json`](.cursor/mcp.json) liegt im Git: Demo-Server, Base-URLs und CLI-Flags (`--base-url-env`, `--auth-env`). **Keine API-Tokens** in dieser Datei — die kommen aus `examples/.env.local` (gitignored).

Nach einer **neuen** `.api2ai`-Datei den passenden MCP-Server in `.cursor/mcp.json` **manuell** ergänzen. Die Extension pflegt diese Datei **noch nicht** automatisch (geplant: Sync nach Generate).

Vorlage pro Datei `meine-api.api2ai` (Server-ID = `api2ai-` + Dateiname ohne Endung):

```json
"api2ai-meine-api": {
  "command": "node",
  "args": [
    "./generated/cli/mcp-serve.mjs",
    "./generated/tools/meine-api-tools.mjs",
    "--base-url-env", "MY_API_BASE_URL",
    "--auth-env", "MY_API_TOKEN"
  ],
  "env": {
    "MY_API_BASE_URL": "https://api.example.com",
    "MY_API_TOKEN": "set-locally"
  }
}
```

Danach MCP neu laden (`Developer: Reload Window` oder MCP-Refresh in den Einstellungen).

**Extension für Kollegen (ohne Monorepo):** VSIX bauen, verteilen und installieren — siehe [README.md](../README.md#extension-vsix--bauen-und-verteilen) (Artefakt: `packages/extension/vscode-api2ai-<version>.vsix`).

---

## Secrets (TMDB, GitHub, …)

Die DSL beschreibt nur **Header-Form** (`auth { in, name, prefix? }`). Base-URL und Token kommen vom MCP-Host — siehe [`mcp.json`](.cursor/mcp.json).

**TMDB**

1. API-Key bei [TMDB](https://www.themoviedb.org/settings/api) (Bearer / API Read Access Token).
2. **Token** in `examples/.env.local` (gitignored):
   ```env
   TMDB_ACCESS_TOKEN=eyJhbGciOiJIUzI1NiJ9...
   ```
   In `.cursor/mcp.json` reicht `TMDB_BASE_URL` unter `env`; `--auth-env TMDB_ACCESS_TOKEN` liest den Wert aus `.env.local` (überschreibt Platzhalter in `mcp.json`/`examples/.env`).
3. MCP-Server aktivieren, Test: `api2ai suche Filme mit dem Titel Dune`

**GitHub PAT:** `GITHUB_BASE_URL` + `GITHUB_TOKEN` in `env` für `api2ai-github` (wie in der Vorlage).

Echte Keys nie committen. Der Agent sieht **kein** Credential-Feld in den MCP-Tool-Schemas — nur der Host injiziert es pro Aufruf.

---

## Eigene API / BFF anbinden (lokal, nicht im Repo)

**BFF** (*Backend for Frontend*): ein schlanker Backend-Dienst, den nur eure App/Agenten ansprechen — oft mit UI-tauglichen Endpunkten statt der vollen Kern-API.

Voraussetzungen: OpenAPI (oder minimale YAML) zur Ziel-API, Staging-**Access Token**, ggf. VPN/Netz vom Arbeits-Rechner.

1. **OpenAPI** lokal ablegen, z. B. `examples/openapi/my-api.openapi.yaml` (gitignored oder außerhalb des Repos).
2. `**.api2ai`** lokal anlegen, z. B. `examples/my-api.api2ai`:
  - optional `auth { in: header name: "Authorization" prefix: "Bearer " }`
  - **3–5 GET-Operationen** kuratieren (`toolName`, `intent`, `example`)
3. **Generieren** (Repository-Root), Script in `package.json` optional:
  ```bash
   node ./packages/cli/bin/cli.js generate ./examples/my-api.api2ai ./examples/generated/tools/my-api-tools.ts
  ```
4. **MCP** in **deiner lokalen** `[.cursor/mcp.json](.cursor/mcp.json)` ergänzen (`--base-url-env`, `--auth-env`, `env` — siehe Vorlage).
5. Cursor: Workspace `examples`, MCP reload, Test mit `api2ai …`.

Ohne OpenAPI zuerst: minimale Spec nur für die Demo-Endpunkte schreiben (Pfade mit Staging per `curl` abgleichen).

Optional in der `.api2ai`: `**insecureEnv`** (ohne Wert) — deaktiviert TLS-Zertifikatsprüfung nur für lokales Dev (selbstsigniert/mkcert). In Produktion weglassen.

**Projekt-spezifische APIs** (z. B. Kundenportal): OpenAPI, DSL, generierte Tools und Demo-Prompts **nicht** im Repo — lokale Anleitung unter `[examples/customer-portal/README.md](customer-portal/README.md)` (gitignored; vom Team beziehen oder selbst anlegen). MCP-Eintrag nur in der lokalen `mcp.json`.

---

## MCP-Server in diesem Workspace


| Server                        | Auth (DSL) | Host `env` (Beispiel)                          |
| ----------------------------- | ---------- | ---------------------------------------------- |
| `api2ai-open-meteo`           | —          | `OPEN_METEO_BASE_URL`                          |
| `api2ai-open-meteo-geocoding` | —          | `OPEN_METEO_GEOCODING_BASE_URL`                |
| `api2ai-spaceflight-news`     | —          | `SPACEFLIGHT_NEWS_BASE_URL`                    |
| `api2ai-tmdb`                 | ja         | `TMDB_BASE_URL`, `TMDB_ACCESS_TOKEN`           |
| `api2ai-github`               | ja         | `GITHUB_BASE_URL`, `GITHUB_TOKEN`              |


---

## Demo-Prompts (`api2ai`-Prefix)

Alle Prompts mit `**api2ai`** beginnen — dann greift `[.cursor/rules/mcp-api2ai-only.mdc](.cursor/rules/mcp-api2ai-only.mdc)` (nur api2ai-MCPs, kein Web-Fallback).

### Wetter (absichtlich mehrdeutiger Ort)

- `api2ai wie ist das aktuelle Wetter in Ortenberg`
- `api2ai gib mir die Wettervorhersage fuer Ortenberg fuer die naechsten 3 Tage`
- `api2ai es gibt mehrere Orte namens Ortenberg, zeig mir die moeglichen Treffer und nimm danach den in Baden-Wuerttemberg`

### Spaceflight

- `api2ai was ist die naechste SpaceX Mission`
- `api2ai zeig mir die naechsten 5 Spaceflight-Starts`

### Wetter + Spaceflight

- `api2ai Wann ist der naechste SpaceX Start und könnte er durch das Wetter gefährdet sein?`

### Movies (TMDB-Key nötig)

- `api2ai suche Filme mit dem Titel Dune`
- `api2ai Was war der teuerste Film, der 2025 rauskam?`
- `api2ai Gib mir 3 Top Sci-Fi Filme aus 2024!`

### GitHub (`GITHUB_TOKEN` in `mcp.json` nötig)

- `api2ai gib mir die user infos und meine repos`

### Architektur (Präsentation)

Siehe [docs/architecture-sketches.md](../docs/architecture-sketches.md).