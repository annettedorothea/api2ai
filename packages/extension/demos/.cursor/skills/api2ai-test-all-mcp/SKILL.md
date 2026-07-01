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

Hook `.cursor/hooks/before-submit-test-all.sh` prueft bei Kurzformen, ob `.cursor/mcp.json` und der Skill vorhanden sind.

## Voraussetzungen

- Demos-Workspace-Root mit `.cursor/mcp.json`
- `npm run start` (alle HTTP-MCP-Hosts + Mock-APIs laufen im Hintergrund)
- Alle benoetigten MCP-Server in Cursor aktiviert
- Keine `.env`-Dateien lesen oder aendern (siehe `api2ai-env-auth-policy`)

## Geltende Regeln

- **Schema-only:** Parameter nur aus MCP-Tool-Descriptors (JSON Schema + Beispiele in `description`). Kein Repo-/OpenAPI-Wissen.
- **Nur konfigurierte Server:** Eintraege in `.cursor/mcp.json` (`open-meteo`, `open-meteo-geocoding`, `github`, `tmdb`, `spaceflight-news`, `todo`, `bookings`, `cakes`, `banking`).
- **Kein Workaround bei Fehlern:** Kein CLI, kein direkter HTTP, kein Retry mit anderen Credentials.
- **Ausnahme zu „ein Aufruf“:** Bei diesem Skill genau **ein Aufruf pro Tool** — insgesamt alle Tools aller Server. Fehler pro Tool dokumentieren, mit naechstem Tool fortfahren (Server komplett down: Rest des Servers ueberspringen, Fehler melden).

## Ablauf

### 1. Server und Tools entdecken

1. `.cursor/mcp.json` lesen → Liste der `serverName`-Werte.
2. Pro Server alle Tool-Descriptors unter `mcps/<cursor-server-id>/tools/*.json` lesen (Schema vor jedem Aufruf).

### 2. Parameter

- Pflichtfelder aus Schema; fehlen Beispiele → kleinste sinnvolle Werte (`limit: 5`, `page: 1`, Koordinaten aus Schema-Beispielen).
- **Read-Tools zuerst** (parallel pro Server moeglich).
- **Write-Tools:** create → update (ID aus Response) → delete (gleiche ID). Praefix `MCPTEST` in Namen/Text.
- **todo:** geschuetzte Tools mit Header aus `mcp.json` (`x-api-token`); keine anderen Keys probieren.
- **bookings / cakes / banking:** Cursor OAuth Sign-in; bei `401`/`403` dokumentieren, nicht umgehen.
- **github / tmdb:** ohne gueltiges Token in `.env` erwartbar `401` — als Auth-Fehler melden, nicht workarounden.

### 3. Aufrufe

- MCP-Server-Name im Audit = `serverName` aus `mcp.json`, nicht der Cursor-`serverIdentifier`.
- Pro Tool: Intent aus Descriptor als Audit-Ueberschrift (Deutsch, sinngemaess).

### 4. Ergebnisbericht

Kurz fuer den Nutzer:

```markdown
## Ergebnis: X/Y Tools erfolgreich

| Server | Tools | Status |
|--------|-------|--------|
| open-meteo | 2 | ✅ / ❌ |

### Auffaelligkeiten
- …
```

- Leere Listen = OK, wenn kein Fehler.
- Schreib-Tests: temporaere Datensaetze wieder loeschen; verbleibende Test-Objekte erwaehnen.

### 5. Audit

Vollstaendiger `Audit`-Abschnitt gemaess `mcp-api2ai-only.mdc` — pro Tool eine `###`-Ueberschrift mit MCP-Server, MCP-Tool, Params, Antwort (gekuerzt bei grossen payloads).

## Checkliste

```
- [ ] mcp.json gelesen
- [ ] Alle Tool-Schemas gelesen
- [ ] Read-Tools aller Server aufgerufen
- [ ] Write-Tools (create/update/delete) getestet
- [ ] Zusammenfassungstabelle
- [ ] Audit
```
