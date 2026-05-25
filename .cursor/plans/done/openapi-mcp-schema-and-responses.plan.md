---
name: OpenAPI-MCP Schema und Responses
overview: 'Review 1 (JSON-Schema-Metadaten für Parameter) und Review 6 (kompakte Response-/Fehlerinfos in der Tool-Beschreibung): OpenAPI → MCP, ohne unnötige DSL-Komplexität.'
todos:
    - id: schema-constraints-test
      content: 'Optional: Fixture-/Codegen-Test, dass minimum/maximum am Query-Param im generierten inputSchema erscheint (Keywords sind bereits in OpenApiSchema + copyOpenApiConstraintKeywords)'
      status: cancelled
    - id: response-errors
      content: 'Erledigt: Response-Abschnitt immer aus OpenAPI (2xx nach Priorität + kompakte 4xx/5xx/default, gekappt); kein DSL-Flag'
      status: completed
    - id: schema-ref-composition
      content: 'Optional: $ref/Komposition — dereferenzieren oder Validator-Warnung wenn Metadaten fehlen'
      status: cancelled
isProject: false
---

# Plan: Schema-Metadaten (Review 1) und Response-/Fehlerinfos (Review 6)

## Bezug zum abgeschlossenen PoC

Im Plan [agent-qualitaet-poc.plan.md](done/agent-qualitaet-poc.plan.md) war **Parameter-`description`** bereits: Merge in [`parameterPropertySchema`](packages/cli/src/openapi-tool-codegen.ts).

## Review 1 — Metadaten im JSON Schema

| Aspekt                                           | Stand                                                                                                                                                                                                          |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `description` (Param)                            | erledigt (Merge in [`parameterPropertySchema`](packages/cli/src/openapi-tool-codegen.ts))                                                                                                                      |
| `format`, `default`, `enum`, Constraint-Keywords | [`OpenApiSchema`](packages/language/src/openapi.ts) + [`copyOpenApiConstraintKeywords`](packages/cli/src/openapi-tool-codegen.ts) / [`openApiPrimitiveToJsonSchema`](packages/cli/src/openapi-tool-codegen.ts) |
| `$ref` / Komposition                             | weiterhin degradiert — optional verbessern oder warnen (Todo `schema-ref-composition`)                                                                                                                         |

**Optional:** dedizierter Test (Fixture), dass z. B. `minimum`/`maximum` aus der Spec im generierten `inputSchema` landen.

**Hinweis:** In älteren Beispielen kann ein Parameter trotz Spec ohne Grenzen erscheinen, wenn das Schema über **`$ref`** nicht aufgelöst wird oder komponiert ist — dann greift der Platzhalter-Pfad in [`openApiSchemaToJsonSchema`](packages/cli/src/openapi-tool-codegen.ts).

## Review 6 — Response- und Fehlerinformationen

**Kein DSL-Schalter** — [`buildMcpDescription`](packages/cli/src/openapi-tool-codegen.ts) enthält immer einen Abschnitt **`Response:`** aus OpenAPI:

- **Success:** [`pickSuccessResponseForSummary`](packages/cli/src/openapi-tool-codegen.ts) (200 → 201 → ...), Beschreibung, eine Zeile Top-Level-Shape ([`topLevelShapeLine`](packages/cli/src/openapi-tool-codegen.ts)).
- **Fehler:** kompakte Zeilen für dokumentierte **4xx**, **5xx** und **`default`** (Status + gekürzte `description`, feste Obergrenzen), ohne Response-Body-Schemas in der Tool-Beschreibung.

Runtime-Hinweise (401/403/429) im generierten `invokeTool` bleiben unverändert relevant.

## Abgrenzung

- Keine vollständigen Response-Schemas pro Tool im MCP-Listing.
- Token-schlanke `inputSchema`-Hülle und Enum-Kompaktierung: [openapi-mcp-token-footprint.plan.md](openapi-mcp-token-footprint.plan.md).
