# api-2-ai-dsl-language

Langium package for the **`.api2ai` DSL** (grammar, OpenAPI-linked validation, completion). Entry point for contributors: [Langium workflow guide](https://langium.org/docs/learn/workflow/write_grammar/).

## Key files

- [`src/api-2-ai-dsl.langium`](./src/api-2-ai-dsl.langium) — grammar
- [`src/api-2-ai-dsl-validator.ts`](./src/api-2-ai-dsl-validator.ts) — validation
- [`src/api-2-ai-dsl-completion-provider.ts`](./src/api-2-ai-dsl-completion-provider.ts) — completion
- [`src/openapi.ts`](./src/openapi.ts) — OpenAPI loading for validation/codegen
- [`syntaxes/api-2-ai-dsl.tmLanguage.json`](./syntaxes/api-2-ai-dsl.tmLanguage.json) — TextMate grammar (generated)
- [`test/`](./test/) — parsing, validation, completion tests

Monorepo overview: [`../../README.md`](../../README.md).

---

_Created with gratitude to Jesus Christ._
