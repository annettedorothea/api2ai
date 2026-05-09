---
name: OpenAPI Parameteranreicherung
overview: Erweitert die MCP-Toolerzeugung so, dass OpenAPI-Parameter und Request-Body semantisch im Tool-Schema sichtbar sind und beim Aufruf strikt berücksichtigt werden (required, Typen, Enums, Beschreibungen, Beispiele).
todos:
  - id: extend-openapi-model
    content: OperationDetails in openapi.ts einführen (summary/description/tags/operationId, Parameter, RequestBody, examples, required, schema-Auszüge)
    status: completed
  - id: wire-runtime-operation-details
    content: RuntimeOperation/getOperations so erweitern, dass OpenAPI-Details pro DSL-Operation verfügbar sind
    status: pending
  - id: generate-typed-zod-inputschema
    content: mcp-server.ts auf OpenAPI-basierte, typisierte inputSchema-Generierung umstellen (inkl. default/enum/format)
    status: pending
  - id: enforce-runtime-parameter-handling
    content: invoke/buildToolUrl auf required-/Typ-/Serialisierungsregeln gemäß Details ausrichten (inkl. style/explode MVP für query/path)
    status: pending
  - id: enrich-tool-selection-metadata
    content: Tool-Description mit summary/description/tags/operationId, Parameterhinweisen und Response-Kurzinfos anreichern
    status: pending
  - id: security-and-advanced-schema-phase2
    content: "Phase 2 planen/umsetzen: securitySchemes/security, oneOf/anyOf/allOf, additionalProperties, nicht-JSON Content-Types"
    status: pending
  - id: add-cli-tests
    content: CLI-Tests/Fixures für Tool-Auswahl-Schema und Tool-Aufruf-Validierung ergänzen
    status: pending
  - id: add-dsl-validation-for-unsupported-style
    content: Unsupported style/explode-Varianten im Language-Validator als DSL-Diagnostic (error/warning) an der betroffenen Operation markieren
    status: pending
  - id: verify-build-and-tests
    content: langium:generate + build + relevante Tests ausführen
    status: pending
isProject: false
---

# OpenAPI-Parameter in Tool-Auswahl und Tool-Aufruf anreichern

## Zielbild

Die generierten MCP-Tools sollen OpenAPI-Informationen so spiegeln, dass:
- **bei der Tool-Auswahl** (Schema/Description) die Parameter fachlich verständlich sind,
- **beim Tool-Aufruf** (Args-Verarbeitung) required/Typen konsistent berücksichtigt werden.

Zusätzlich werden OpenAPI-Metadaten genutzt, die die Modellentscheidung nachweislich verbessern: `summary`, `description`, `tags`, `operationId`, Parameter- und Body-Examples, Enums/Constraints sowie Response-Kurzinfos.

## Aktueller Stand (relevante Stellen)

- Die Tool-Definition ist derzeit generisch in [packages/cli/src/mcp-server.ts](/Users/annette/Documents/Projekte/api2ai/api2ai/packages/cli/src/mcp-server.ts): `pathParams/query/headers` als `record`, `body` als `z.unknown()`.
- Laufzeitdaten pro Operation sind minimal in [packages/cli/src/runtime.ts](/Users/annette/Documents/Projekte/api2ai/api2ai/packages/cli/src/runtime.ts) (`toolName/method/path/intent/example`).
- OpenAPI-Laden/Lookup existiert im Sprachpaket in [packages/language/src/openapi.ts](/Users/annette/Documents/Projekte/api2ai/api2ai/packages/language/src/openapi.ts), enthält aber noch keine Parameter-/Schema-Extraktion.

## Umsetzungsstrategie (priorisiert)

1. **MVP: OpenAPI-Metadatenmodell erweitern**
- In [packages/language/src/openapi.ts](/Users/annette/Documents/Projekte/api2ai/api2ai/packages/language/src/openapi.ts) pro Operation strukturierte Metadaten erfassen:
  - Auswahl-relevante Felder (`summary`, `description`, `tags`, `operationId`)
  - Parameter (`in`, `name`, `required`, `description`, `schema`, `example/examples`)
  - RequestBody (`required`, content type, schema, description, examples)
  - Response-Kurzinfos (`status code` + kurze Beschreibung), optional als kompakte Liste.
- Lookup-Key (`METHOD path`) beibehalten, aber Werttyp von „nur operationId“ auf „OperationDetails“ erweitern.

2. **MVP: Runtime-Operation um OpenAPI-Infos ergänzen**
- In [packages/cli/src/runtime.ts](/Users/annette/Documents/Projekte/api2ai/api2ai/packages/cli/src/runtime.ts) `RuntimeOperation` um extrahierte Parameter-/Body-Metadaten erweitern.
- `getOperations(model, openApiDetails)` so aufsetzen, dass jede DSL-Operation ihre OpenAPI-Details injiziert bekommt.
- Für Aufruflogik vorbereiten: klare Trennung `path/query/header/body` inkl. required-check-Basis.

3. **MVP: MCP inputSchema aus OpenAPI ableiten**
- In [packages/cli/src/mcp-server.ts](/Users/annette/Documents/Projekte/api2ai/api2ai/packages/cli/src/mcp-server.ts):
  - `z.object({...})` pro Parametergruppe statt pauschaler `record`-Schemas erzeugen.
  - Typmapping OpenAPI -> Zod (string/number/integer/boolean/array/object, enum, default, format-Basis, nullable soweit möglich).
  - Required-Felder als Pflichtfelder modellieren; optionale als optional.
  - Request-Body anhand Schema abbilden (mindestens JSON-Fall), sonst kontrollierter Fallback.
  - Description anreichern: Intent + summary/description/tags/operationId + parameterbezogene Hinweise + example(s) + Response-Kurzinfo.

4. **MVP: Tool-Aufruf robust gegen Schemaanforderungen machen**
- In [packages/cli/src/runtime.ts](/Users/annette/Documents/Projekte/api2ai/api2ai/packages/cli/src/runtime.ts):
  - serialisierungskonsistent mit Schema (z. B. query-Arrays/booleans),
  - `style`/`explode` für häufige Fälle (`query`, `path`) berücksichtigen,
  - klare Fehlermeldungen bei fehlenden required path/query/header/body-Werten,
  - Header/Body-Verhalten methodenspezifisch sauber halten.

5. **MVP: Tests für Auswahl + Aufruf ergänzen**
- Neue/erweiterte Tests im CLI-Paket (z. B. `packages/cli/test/...`):
  - Tool-Schema enthält summary/description/tags/operationId + Parameter-Descriptions/Required/Enums/defaults,
  - Body-Schema ist nicht mehr `unknown`,
  - Aufruf validiert required korrekt,
  - Aufruf serialisiert query/path in den unterstützten `style`/`explode`-Fällen korrekt,
  - Fehlertexte nachvollziehbar.
- Fixtures mit repräsentativen Parametern (path+query+header+body+enum+examples).

6. **MVP: Unsupported style/explode früh im DSL validieren**
- In [packages/language/src/api-2-ai-dsl-validator.ts](/Users/annette/Documents/Projekte/api2ai/api2ai/packages/language/src/api-2-ai-dsl-validator.ts) pro referenzierter Operation prüfen, ob die verwendeten Parameter-Serialisierungen im MVP unterstützt sind.
- Bei nicht unterstützten Varianten (z. B. `deepObject`, `matrix`, `label`, komplexe header/cookie-Formen) ein **Diagnostic direkt auf die betroffene Operation** erzeugen (`error`/`warning` je nach Risiko).
- Für MVP explizit festlegen: **`in: path` mit Objektwerten wird nicht unterstützt** und als Diagnostic markiert (statt impliziter/uneinheitlicher Serialisierung).
- CLI-Runtime behält zusätzlich Guard-Fehler bei, aber primäres Feedback ist die DSL-Fehlermarkierung im Editor.

7. **Phase 2 (nach MVP): Advanced OpenAPI**
- Security-Metadaten nutzen (`securitySchemes`/`security`) für explizite Auth-Hinweise und optionale Header-Vorgaben.
- Komplexe Schemaformen (`oneOf`/`anyOf`/`allOf`, `additionalProperties`) schrittweise unterstützen.
- Nicht-JSON Content-Types (`application/x-www-form-urlencoded`, `multipart/form-data`) gezielt ergänzen.

8. **Build/Verifikation**
- Nach Umsetzung im Root: `npm run langium:generate && npm run build`.
- Relevante Testläufe (CLI + ggf. Sprache) durchführen und auf grün bringen.

## Technische Leitplanken

- Priorität auf OpenAPI 3.x (`application/json` zuerst), mit dokumentiertem Fallback für nicht unterstützte Content-Types.
- Bei unvollständigen Schemas degradieren statt brechen: sichere Defaults + klare Warn-/Fehltexte.
- API-2-AI DSL bleibt unverändert; die Anreicherung passiert im OpenAPI-Parsing + CLI/MCP-Schicht.
