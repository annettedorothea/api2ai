---
name: MCP Tool-Schemas aus OpenAPI
overview: Pro DSL-Operation tool-spezifische MCP-Input-Schemas (und konsistente Aufruf-Serialisierung) aus den bereits geladenen OpenAPI-Metadaten erzeugen statt generischer pathParams/query/body-Objekte.
todos:
    - id: wire-runtime-openapi
      content: OpenAPI-OperationDetails pro DSL-Operation in Runtime/Generator-Pipeline verfügbar machen (RuntimeOperation + getOperations)
      status: pending
    - id: emit-json-schema-per-tool
      content: Im Generator pro Tool ein JSON-Schema (path/query/header/body) aus OpenAPI ableiten und in generated module exportieren
      status: pending
    - id: mcp-register-per-tool-zod
      content: mcp-server pro Tool mit abgeleitetem inputSchema registrieren (Zod aus Schema oder shared Mapper)
      status: pending
    - id: invoke-align-openapi
      content: invokeTool/URL-Bau an required, Typen und MVP style/explode für path/query ausrichten; klare Fehler bei fehlenden Pflichtfeldern
      status: pending
    - id: enrich-descriptions
      content: Tool-Beschreibungen mit summary/description/tags/operationId und Parameter-Kurzinfos optional anreichern
      status: pending
    - id: cli-tests-schemas
      content: CLI-Tests mit Fixture-Spec – erwartetes inputSchema und Smoke-Aufruf mit typischen Open-Meteo/Spaceflight-Parametern
      status: pending
    - id: verify-build
      content: npm run langium:generate && npm run build und relevante Tests grün
      status: pending
isProject: false
---

# MCP: Tool-Eingabe-Schemas aus OpenAPI

## Ziel

Heute sehen alle generierten Tools im MCP-Client **dieselbe grobe Form**: lose `pathParams`, `query`, `headers`, `body`. Die OpenAPI-Spec liefert bereits strukturierte [OpenApiOperationDetails](../packages/language/src/openapi.ts) (Parameter inkl. `required`, `schema`, Beschreibungen, RequestBody). Diese Information soll **bis zum MCP-Tool sichtbar** werden und beim Aufruf **konsistent** mit der Spec gehandhabt werden.

## Nicht im ersten Schritt (Phase 2)

Wie im älteren Archivplan [done/openapi_parameteranreicherung_1ea8b3d2.plan.md](done/openapi_parameteranreicherung_1ea8b3d2.plan.md) skizziert, aber bewusst später: `oneOf`/`allOf`, tiefe `$ref`-Graphs, nicht-JSON Bodies, `securitySchemes`-Vollintegration, DSL-Validator für exotische `style`/`explode`. Dieser Plan fokussiert **MVP: GET-lastig, path + query (+ einfache header), JSON-Body wenn nötig**.

## Relevante Dateien

- OpenAPI-Laden: [packages/language/src/openapi.ts](../packages/language/src/openapi.ts)
- Operationen aus Modell: [packages/cli/src/runtime.ts](../packages/cli/src/runtime.ts) (und Aufrufpfad `getOperations`)
- Generator-Ausgabe: [packages/cli/src/generator.ts](../packages/cli/src/generator.ts) (aktuell einheitliches `defaultInputSchema`)
- MCP-Registrierung: [packages/cli/src/mcp-server.ts](../packages/cli/src/mcp-server.ts)

## Umsetzungsschritte

1. **Runtime-Anbindung**  
   Beim Auflösen jeder DSL-`GET`/…-Operation die passenden `OpenApiOperationDetails` aus dem bereits geladenen Lookup an die interne Tool-Repräsentation hängen (gleicher Key wie Validator/Generator: Methode + path template).

2. **Schema-Erzeugung im Generator**  
   Aus `parameters` je `in` gruppierte Properties mit `required`-Arrays bauen; einfaches OpenAPI-Schema → JSON-Schema-Subset (Typ, enum, default, nullable, format wo sinnvoll). Pro Tool `inputSchemaByTool[toolName]` als **stabiles JSON-Objekt** in das generierte Modul schreiben (MCP/SDK-kompatibel).

3. **MCP-Schicht**  
   Pro registriertem Tool `inputSchema` aus dem Import des generierten Moduls setzen; Validierung erfolgt wie heute über Zod, aber aus dem pro-Tool-Schema abgeleitet (ein kleiner Mapper OpenAPI-artiger Constraints → Zod oder direktes JSON Schema wenn der MCP-Stack das erlaubt).

4. **invokeTool**  
   Pflicht-parameter prüfen; Query-Serialisierung für gängige Fälle (`form`, explode true/false) MVP-tauglich; bei Nicht-Unterstützung lieber klaren Fehler als falsche Requests.

5. **Tests**  
   Mindestens ein Test: für eine Mini-Spec erwarten wir konkrete Property-Namen im Tool-Schema; optional Integration gegen `examples/generated/` nach Regenerate.

## Abgrenzung zum PoC

Der abgeschlossene PoC zeigt End-to-End mit generischen Schemas. Dieser Plan ist der **Qualitätssprung für Agent-Zuverlässigkeit** ohne neue Demo-APIs zu erzwingen; Open-Meteo eignet sich gut als Regression-Beispiel (viele Query-Parameter).
