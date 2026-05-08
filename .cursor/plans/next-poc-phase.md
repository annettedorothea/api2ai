---
name: Next PoC Phase
overview: Stabilisiere den PoC mit einer besseren öffentlichen Test-API, verbessere die MCP-Tool-Schemas aus OpenAPI-Parametern und bereite Auth als bewusst getrennten nächsten Schritt vor.
todos:
  - id: api-eval
    content: Spaceflight News API, Tagesschau/bundesAPI, SWAPI, Open-Meteo und PetstoreAPI.com als Demo-API-Kandidaten evaluieren
    status: pending
  - id: api-migration
    content: Beispiel-DSL, OpenAPI-Spec, Smoke- und MCP-Scripts auf beste API migrieren
    status: pending
  - id: openapi-params
    content: OpenAPI-Parameter und RequestBodies in Loader-Metadaten aufnehmen
    status: pending
  - id: mcp-schemas
    content: Tool-spezifische MCP-Input-Schemas aus OpenAPI generieren
    status: pending
  - id: dsl-overrides
    content: Optionale DSL-Overrides für AI-freundliche Parameterbeschreibungen planen
    status: pending
  - id: code-review
    content: Code Review vor Auth-Erweiterungen durchführen
    status: pending
  - id: auth-v1
    content: Env-Token-basierte Authentifizierung als separaten nächsten Block planen
    status: pending
isProject: false
---

# Nächste Schritte: API, Tool-Schemas, Auth, Review

## Einschätzung
Der wichtigste nächste Schritt ist eine stabilere Demo-API. Petstore hat gezeigt, dass die Tool-Kette funktioniert, aber die öffentliche API ist instabil. Parallel sollten die generierten MCP-Tools bessere Parameter-Schemas bekommen, damit Agenten die Tools zuverlässiger verwenden können.

## 8-Stunden-PoC-Schnitt
Ein vernünftiger PoC in weniger als 8 Stunden ist realistisch, wenn der Scope bewusst klein bleibt:

- **2 MCP-Server**: empfohlen `api2ai-spaceflight-news` und `api2ai-open-meteo`; optional statt Open-Meteo `api2ai-tagesschau`.
- **2–3 Tools pro Server**: nur `GET`, nur `path`/`query`, keine Schreiboperationen.
- **Cursor-Agent-Demo**: Agent kann beide Server sehen und echte API-Daten abfragen.
- **README/Demo-Flow**: Setup, MCP-Aktivierung, Beispielprompts und bekannte Limitierungen dokumentieren.

Nicht in diesen 8-Stunden-Scope aufnehmen:

- Auth für private APIs.
- Permission-basiertes Tool-Filtering.
- Vollständige RequestBody-Generierung.
- Komplexe OpenAPI-Konstrukte wie tiefe `$ref`-Auflösung, `oneOf`, `allOf` oder verschachtelte Schemas.
- Perfekte DSL-Overrides für alle Parameter.

Empfohlener Zeitplan:

- **1h**: API-Auswahl finalisieren und Smoke-Tests für Spaceflight News + zweite API durchführen.
- **1.5h**: Beispiel-DSLs, OpenAPI-Specs, Scripts und MCP-Konfiguration für 2 Server anlegen.
- **2h**: `path`/`query`-Parameter aus OpenAPI extrahieren und MCP-Schemas verbessern.
- **1h**: Cursor-Agent-Demo testen und Beispielprompts dokumentieren.
- **1h**: README, Demo-Flow und Limitierungen bereinigen.
- **1h**: Code Review und kleine Fixes.
- **0.5h**: Commit/Push.

Die pragmatische Reihenfolge ist: erst bessere API + bessere `path`/`query`-Schemas, danach Auth separat planen.

## Empfehlung zur Test-API
1. **Spaceflight News API prüfen**
   - Vorteil: echte News-artige Daten, Raumfahrtartikel/Blogs/Reports, no-auth, OpenAPI-Dokumentation vorhanden.
   - Geeignete Demo-Tools: `getLatestArticles`, `searchArticles`, `getArticleById`.
   - Einschätzung: bester Kandidat, wenn der PoC eine Nachrichten-API zeigen soll.

2. **Tagesschau/bundesAPI prüfen**
   - Vorteil: echte deutschsprachige Nachrichten, OpenAPI-Spec im Repository `bundesAPI/tagesschau-api`.
   - Geeignete Demo-Tools: `getHomepage`, `getNews`, `searchNews`.
   - Einschränkung: Nutzung nur privat/nicht-kommerziell und laut Doku begrenzte Abrufe pro Stunde.
   - Einschätzung: sehr guter deutscher Demo-Kandidat, aber Nutzungsbedingungen beachten.

3. **SWAPI prüfen**
   - Vorteil: read-only, verständliche Daten, gute Agent-Demo-Fragen wie „Welcher Planet hat ID 1?“ oder „Welche Filme kennt Luke Skywalker?“.
   - Nachteil: keine offizielle OpenAPI-3-Spec in der Original-Doku.
   - Option: Community-Paket `swapi-typespec`, das `swapi.openapi.yaml` bereitstellt.

4. **Open-Meteo prüfen**
   - Vorteil: offizielle OpenAPI-3-Spec, no-auth, stabile echte Wetterdaten, viele gut typisierte Query-Parameter.
   - Nachteil: keine News-Demo.
   - Einschätzung: bester technischer Kandidat, um Tool-Parameter-Schemas aus OpenAPI zu testen.

5. **Fallback: PetstoreAPI.com prüfen**
   - Vorteil: moderne, stabile Demo-API mit OpenAPI 3.x und ohne Auth.
   - Nachteil: fachlich weniger schön als SWAPI.

Die Entscheidung sollte datengetrieben fallen: Kandidaten-Specs laden, 2–3 GET-Tools definieren, Smoke-Test gegen echte API ausführen, dann die stabilere und erklärbarere API als Default-Beispiel übernehmen.

## Tool-Parameter: OpenAPI vs DSL
Ich würde Parameter zuerst **aus OpenAPI generieren**:

- `path`/`query`/`header`/`requestBody` aus OpenAPI lesen.
- `required`, `type`, `description`, `enum`, `default`, `examples` soweit vorhanden übernehmen.
- Daraus ein konkreteres MCP/Zod-Input-Schema erzeugen.

Die DSL sollte nur ergänzen/überschreiben, was für AI-Nutzung wichtig ist:

```txt
GET "/people/{id}" {
  intent: "get a Star Wars person by id"
  toolName: "getPersonById"
  param id: "Numeric SWAPI person id"
}
```

Kurz: **OpenAPI ist Source of Truth**, DSL ist AI-Metadaten- und Override-Schicht.

## Auth-Einschätzung
Auth sollte in zwei getrennte Blöcke aufgeteilt werden:

1. **Token/Auth für private APIs**
   - kurzfristig sinnvoll und überschaubar.
   - DSL referenziert nur den Namen, z. B. `auth env "CUSTOMER_API_TOKEN"`.
   - Token selbst liegt in `.env` und wird nie committed.
   - Generator/MCP-Server setzt dann z. B. `Authorization: Bearer ...`.

2. **Tool-Filtering nach Permissions**
   - deutlich aufwändiger.
   - braucht Rollen/Scopes, User-Kontext und Entscheidung, ob Filtering zur Laufzeit oder beim Serverstart passiert.
   - Erst angehen, wenn Basic Auth + Tool-Schema-Qualität steht.

## Konkreter Plan
1. **API-Kandidaten evaluieren**
   - Spaceflight News API, Tagesschau/bundesAPI, SWAPI via `swapi-typespec`, Open-Meteo und PetstoreAPI.com vergleichen.
   - Kriterien: OpenAPI 3.x verfügbar, echte API stabil, no-auth, gute Demo-Fragen.

2. **Beispiel von Petstore auf beste API migrieren**
   - Neue `examples/*.api2ai` und OpenAPI-Spec ergänzen.
   - `test:smoke`, `test:mcp`, `.cursor/mcp.json` auf neue Beispiel-API umstellen.

3. **OpenAPI-Parameter extrahieren**
   - `packages/language/src/openapi.ts` erweitern, sodass Operationen Parameter und RequestBody enthalten.
   - Lookup bleibt `(method,path)`, liefert aber reichere Metadaten.

4. **MCP-Input-Schemas verbessern**
   - `packages/cli/src/mcp-server.ts` nicht mehr nur generische `pathParams/query/body` verwenden lassen.
   - Stattdessen Tool-spezifische Schemas mit Required-Feldern, Types und Beschreibungen erzeugen.

5. **DSL-Overrides für AI-Beschreibungen ergänzen**
   - Optionaler kleiner Grammar-Ausbau für Parameter-Beschreibungen.
   - Nur als Override, nicht als Ersatz für OpenAPI.

6. **Code Review durchführen**
   - Vor Auth nochmal Architektur, Fehlerbehandlung, Tests und Security-Basics prüfen.
   - Besonders: `openapi.ts`, `mcp-server.ts`, `runtime.ts`, Generator-Output.

7. **Auth v1 planen und implementieren**
   - Erst Env-Token-Flow.
   - Permission-basiertes Tool-Filtering danach separat planen.
