---
name: api2ai-test-all-mcp
description: >-
    Smoke-test every MCP tool on every server configured in .cursor/mcp.json.
    Use when the user writes api2ai /test:all, api2ai test:all, api2ai teste alle
    tools, or asks to test all MCP servers or all api2ai demo tools.
disable-model-invocation: true
---

# api2ai — alle MCP-Tools testen

## Trigger

Nutzer schreibt z. B.:

- **`/test-all`** (Slash-Command in Cursor: `.cursor/commands/test-all.md`)
- `api2ai /test:all` / `/test:all` / `api2ai test:all`
- `api2ai teste alle tools` / `… aller mcp server`

Hook `.cursor/hooks/before-submit-test-all.sh` prueft bei Kurzformen, ob `.cursor/mcp.json`, der Skill vorhanden sind und HTTP-MCP-Ports lauschen (`scripts/check-mcp-ready.mjs`).

## Voraussetzungen

- Demos-Workspace-Root mit `.cursor/mcp.json`
- `npm run start:all` oder `npm run start:mcp` (foreground — **MCP-Banner fuer HTTP-Server in diesem Terminal**)
- Fixtures/Mock-APIs laufen (`start:all` oder `start:fixtures`)
- Alle benoetigten MCP-Server in Cursor aktiviert (inkl. **`test`** — stdio, nicht HTTP)
- Keine `.env`-Dateien lesen oder aendern (siehe `api2ai-env-auth-policy`)

## Vertrauensmodell (kurz)

| Was | Quelle | Sicher? |
|-----|--------|---------|
| **Tool-Aufrufe** | Live MCP `tools/call` in Cursor | **Ja** — nicht der `mcps/`-Cache |
| **Parameter-Schema** | `mcps/.../tools/*.json` | Nur fuer Argumente — **nicht** fuer Build |
| **Build (HTTP)** | `start:mcp`/`start:all`-Terminal (Banner pro Server) | **Ja** — gleicher Prozess wie der Host |
| **Build (`test` stdio)** | Kein Banner im Start-Terminal | In Zusammenfassung vermerken; nach Codegen MCP togglen |

**Nicht** fuer Build: `serverInfo.version` (Agent sieht Initialize nicht), Cursor Settings-Tooltip, `mcps/`-Cache-Descriptions.

## Geltende Regeln

- **Schema-only:** Parameter nur aus MCP-Tool-Descriptors (JSON Schema + Beispiele in `description`). Kein Repo-/OpenAPI-Wissen.
- **Nur konfigurierte Server:** Eintraege in `.cursor/mcp.json` (`open-meteo`, `open-meteo-geocoding`, `github`, `tmdb`, `xquik`, `spaceflight-news`, `todo`, `bookings`, `cakes`, `banking`, `test`).
- **Kein Workaround bei Fehlern:** Kein CLI, kein direkter HTTP, kein Retry mit anderen Credentials.
- **Kein Ersatz-Transport:** Wenn MCP-Tool-Aufrufe in dieser Session nicht verfuegbar sind → **sofort abbrechen** (Schritt 0). Nicht HTTP/curl/WebFetch zu URLs aus `mcp.json`, nicht `scripts/mcp-inspect.mjs`, nicht `generated/**`.
- **Ausnahme zu „ein Aufruf“:** Bei diesem Skill genau **ein Aufruf pro Tool** — insgesamt alle Tools aller Server. Fehler pro Tool dokumentieren, mit naechstem Tool fortfahren (Server komplett down: Rest des Servers ueberspringen, Fehler melden).

## Ablauf

### 0. Vorbedingung — MCP in Cursor (Pflicht)

**Sofort abbrechen**, wenn du fuer Server aus `.cursor/mcp.json` **keine MCP-Tool-Aufrufe** in dieser Session ausfuehren kannst — z. B. Cursor fragt, MCP-Server zu aktivieren, es stehen keine MCP-Tools bereit, oder du waerest gezwungen, stattdessen Shell/HTTP zu nutzen.

**Verboten als Workaround (auch teilweise):**

- Direkter HTTP/curl/WebFetch zu `url`-Einträgen aus `.cursor/mcp.json`
- `scripts/mcp-inspect.mjs` oder andere MCP-Protokoll-Skripte
- `invokeTool` / CLI / Import aus `generated/**`
- Tool-Schemas aus `mcps/*/tools/*.json` **allein** als „Test“ verkaufen — Lesen der Descriptors ist nur Vorbereitung fuer echte MCP-Aufrufe

**Abbruch-Meldung** (kurz, keine weiteren Schritte):

```markdown
## test-all abgebrochen

MCP-Server sind in Cursor nicht aktiviert oder nicht verbunden. `/test-all` laeuft nur ueber **MCP-Tool-Aufrufe** in dieser Session — kein direkter HTTP an die MCP-Hosts.

**Bitte:** Cursor Settings → MCP → alle Server aus `.cursor/mcp.json` aktivieren, ggf. MCP neu laden, dann `/test-all` erneut.
```

Der Hook prueft Ports und Dateien — **nicht**, ob Cursor die MCP-Server eingeschaltet hat.

### 1. Build-Referenz (einmal pro Server)

**HTTP-Server:** Aus dem **Foreground-Terminal** von `npm run start:mcp` oder `npm run start:all` die Banner-Zeilen `Version:` und `Build:` pro Server lesen und kombinieren:

`1.0.0-rc.2 · 2026-07-09 07:45 (UTC+2)`

**`test` (stdio):** Kein Banner im `start:mcp`-Terminal — in der Zusammenfassung `Build (stdio): nach Codegen MCP toggeln; kein Terminal-Banner` oder, falls sichtbar, Build aus Cursor-MCP-Status — **nicht** aus `mcps/`-Cache.

- **Nicht** aus Repo, `generated/**`, `mcps/`-Cache oder `serverInfo.version`.
- Fehlt Terminal/Banner fuer HTTP → `Build unbekannt (Terminal fehlt — start:mcp neu?)`.

### 2. Server und Tools entdecken

1. `.cursor/mcp.json` lesen → Liste der `serverName`-Werte.
2. Pro Server Tool-Descriptors unter `mcps/<cursor-server-id>/tools/*.json` lesen — **nur** fuer Parameter/Schema vor jedem Aufruf.

### 3. Parameter

- Pflichtfelder aus Schema; fehlen Beispiele → kleinste sinnvolle Werte (`limit: 5`, `page: 1`, Koordinaten aus Schema-Beispielen).
- **Read-Tools zuerst** (parallel pro Server moeglich).
- **Write-Tools:** create → update (ID aus Response) → delete (gleiche ID). Praefix `MCPTEST` in Namen/Text.
- **todo:** geschuetzte Tools mit Header aus `mcp.json` (`x-api-token`); keine anderen Keys probieren.
- **bookings / cakes:** Cursor OAuth Sign-in; bei `401`/`403` dokumentieren, nicht umgehen.
- **github / tmdb:** ohne gueltiges Token in `.env` erwartbar `401` — als Auth-Fehler melden, nicht workarounden.
- **test:** stdio-Host — `TEST_API_KEY` aus `.env` via `--auth-env`; Mock-API `test-api` muss laufen. **`testGetAccount`:** `account_id: acc-42` — normaler Tool-Lauf.

### 4. Aufrufe

- Pro Tool: **ein live MCP-Aufruf**; Ergebnis in **Zusammenfassung** (Abschnitt 5) und **kompaktem Audit** (Abschnitt 6).
- **Kein** voller Audit mit `###`-Block und Roh-JSON pro Tool.

### 5. Ergebnisbericht

```markdown
## Ergebnis: X/Y Tools erfolgreich

| Server | Build (Terminal) | Tools | Status |
|--------|------------------|-------|--------|
| open-meteo | 1.0.0-rc.2 · 2026-07-09 07:45 … | 2 | ✅ / ❌ |
| test | (stdio — siehe Schritt 1) | 12 | ✅ / ❌ |

- **Build (Terminal):** HTTP aus Schritt 1; `test` stdio separat.

### Auffaelligkeiten
- …
```

- Leere Listen = OK, wenn kein Fehler.
- Schreib-Tests: temporaere Datensaetze wieder loeschen; verbleibende Test-Objekte erwaehnen.

### 6. Audit (kompakt)

Eine Zeile **pro MCP-Aufruf** — **ohne** Build-Spalte:

```markdown
## Audit (kompakt)

| Server | Tool | Status | Notiz |
|--------|------|--------|-------|
| test | testPing | ✅ | ok: true |
| open-meteo | openMeteoForecast | ✅ | HTTP 200 |
| github | searchRepos | ❌ | 401 |
```

- **Server:** `serverName` aus `.cursor/mcp.json` (nicht Cursor-`serverIdentifier`).
- **Tool:** technischer Toolname.
- **Status:** ✅ Erfolg / ❌ Fehler / ⏭️ uebersprungen (Server down).
- **Notiz:** **eine Zeile** — Fehlermeldung, `rowCount`, `ok`, oder „leer OK“; **kein** vollstaendiges JSON.
- Sortierung: Server (wie in `mcp.json`), dann Aufrufreihenfolge.

**Kein** zusaetzlicher Voll-Audit (`###` + Bullet-Listen + Rohantwort). Ausnahme zu `mcp-api2ai-only.mdc` nur fuer `/test-all`.

## Checkliste

```
- [ ] Schritt 0: MCP-Tools in Cursor verfuegbar (sonst Abbruch)
- [ ] Schritt 1: Build (Terminal) pro HTTP-Server; test stdio vermerkt
- [ ] mcp.json gelesen
- [ ] Alle Tool-Schemas gelesen (nur Parameter)
- [ ] Read-Tools aller Server aufgerufen (live MCP)
- [ ] Write-Tools (create/update/delete) getestet
- [ ] Zusammenfassungstabelle + kompakter Audit
```
