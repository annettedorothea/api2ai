---
name: Example APIs Umstellung
overview: Petstore wird als Demo durch Spaceflight News ersetzt, Open-Meteo wird als zweites Beispiel ergänzt und als Standard für Smoke-/MCP-Tests verwendet. Dabei können Demo-Args für Tests hart im Script hinterlegt werden statt separater petstore-args-Datei.
todos:
  - id: replace-examples-spaceflight
    content: Petstore-Beispieldateien in examples durch Spaceflight-News-Dateien ersetzen
    status: pending
  - id: add-open-meteo-example
    content: Zweites Beispiel open-meteo.* unter examples hinzufügen
    status: pending
  - id: update-readme-and-mcp-config
    content: README und .cursor/mcp.json auf neue Beispiel-Dateien umstellen
    status: pending
  - id: switch-tests-to-open-meteo
    content: Smoke-/MCP-Testpfade auf open-meteo umstellen und petstore-smoke-args ablösen (Default-Args im Script)
    status: pending
  - id: verify-build
    content: Langium generate + build ausführen und Beispiel-DSLs validieren
    status: pending
isProject: false
---

# Petstore durch Spaceflight News ersetzen + Open-Meteo hinzufügen

## Empfehlung zur Benennung

Ich empfehle den von dir gewählten Prefix **`open-meteo.*`** (kurz, klar, konsistent mit API-Name). Das ist für `examples/` besser lesbar als `api2ai-open-meteo.*`.

## Zielumfang (aktualisiert)

- **In Scope**: `examples/`, Doku/Setup-Dateien und Test-Ausführungspfade.
- **Ebenfalls In Scope**: Open-Meteo als Standard für Smoke-/MCP-Demo.
- **Args-Datei**: `petstore-smoke-args.json` wird nicht fortgeführt; Defaults können hart codiert werden.

## Geplante Änderungen

1. **Examples auf Spaceflight News umstellen**
- Bestehende Petstore-Dateien unter [examples](file:///Users/annette/Documents/Projekte/api2ai/api2ai/examples) ersetzen durch Spaceflight-News-Demo:
  - `spaceflight-news.openapi.yaml`
  - `spaceflight-news.api2ai`
  - `spaceflight-news-smoke-args.json`
  - optional `generated/spaceflight-news-tools.ts` (je nach bestehendem Workflow)
- Die `.api2ai`-Operationen auf sinnvolle, öffentliche Endpunkte der Spaceflight-News-API ausrichten.

2. **Zweites Beispiel für Open-Meteo ergänzen**
- Neues Paar unter [examples](file:///Users/annette/Documents/Projekte/api2ai/api2ai/examples):
  - `open-meteo.openapi.yaml`
  - `open-meteo.api2ai`
  - **keine separate Smoke-Args-Datei nötig**, da Default-Args im Test-/CLI-Pfad hinterlegt werden können.
- Endpunkte so wählen, dass Query-Parameter gut demonstriert werden (z. B. geocoding/forecast).

3. **Doku auf neue Beispiele anpassen**
- [README.md](file:///Users/annette/Documents/Projekte/api2ai/api2ai/README.md):
  - Petstore-Anleitungen/Beispiele auf Spaceflight News umstellen.
  - Open-Meteo als zweites Demo-Beispiel ergänzen.
  - MCP- und Smoke-Beispiele auf die neuen Dateinamen verweisen.
- [.cursor/mcp.json](file:///Users/annette/Documents/Projekte/api2ai/api2ai/.cursor/mcp.json):
  - Servername/Dateipfad von Petstore auf Spaceflight News umstellen.

4. **Smoke-/MCP-Demo auf Open-Meteo als Standard umstellen**
- In [package.json](file:///Users/annette/Documents/Projekte/api2ai/api2ai/package.json) die relevanten Demo-Skripte so anpassen, dass Open-Meteo als Standardbeispiel genutzt wird.
- Falls für Smoke-Tests Eingaben nötig sind, diese als **harte Default-Args im Script/CLI-Pfad** hinterlegen (statt externer `petstore-smoke-args.json`).
- README entsprechend synchronisieren, damit Befehle ohne Zusatzdatei reproduzierbar sind.

5. **Verifikation**
- Validieren, dass beide `.api2ai`-Dateien gegen ihre OpenAPI 3.x Specs fehlerfrei sind.
- Danach wie Projektregel: `npm run langium:generate && npm run build`.
- Kurzcheck, dass MCP-Config mit neuem Beispielpfad startet.

## Optionaler Folge-Schritt (separat)

- Root-Skripte auf neutrale, API-unabhängige Namen harmonisieren (`generate:demo-tools`, `test:smoke:default`, `test:mcp:default`) und ggf. zusätzliche API-spezifische Varianten ergänzen.
