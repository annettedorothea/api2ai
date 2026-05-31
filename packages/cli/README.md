# CLI (`api-2-ai-dsl-cli`)

**`parse`**, **`validate`**, and **`generate`** for `.api2ai` files (repo root, after build):

```bash
npx api-2-ai-dsl-cli parse <file.api2ai>
npx api-2-ai-dsl-cli validate <file.api2ai>
npx api-2-ai-dsl-cli generate <source.api2ai> <dest-tools.ts>
```

`validate` and `generate` fail on DSL errors (`@core2ai/core/codegen`).

## Source

- [`src/main.ts`](./src/main.ts) — Commander
- [`src/generator/`](./src/generator/) — codegen
- [`test/`](./test/) — unit tests

---

#Col3:23
