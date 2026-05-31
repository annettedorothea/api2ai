# Plan: Generate in `packages/extension/demos` (standalone / VSIX)

Status: **Entwurf** — Umsetzung nach Abstimmung in Plan-Mode.

## Ziel

Der Demos-Ordner (auch als VSIX-Kopie ohne Monorepo) soll **ohne Pfad zu `packages/cli`** auskommen. Codegen läuft über die **in der Extension gebündelte CLI** (`out/embed-*/cli.cjs`), nicht über TypeScript-Imports aus dem Monorepo.

## Ist-Zustand (nach Revert)

| Thema | Stand |
|--------|--------|
| `@core2ai/core` in `demos/package.json` | `"0.0.5"` (kein GitHub-Pin); Lockfile verlinkt per npm auf `../../../../core2ai` wenn Sibling vorhanden |
| `scripts/generate.mjs` | Kein `../../cli`; Auflösung: `API2AI_CLI` / `DB2AI_CLI` → installierte Extension (`embed-*/cli.cjs`) |
| Tests | `run-demo-generate.ts` ruft `generate.mjs` auf; **Monorepo-`npm test`** braucht gesetztes CLI-Env oder installierte Extension |
| VSIX-Kopie | `createDemoWorkspace` kopiert ohne `node_modules` / `package-lock.json`; Nutzer: `npm install` + Extension installiert |
| `@core2ai/core` | Nur **devDependency** für Vitest-Helfer (`test-fixtures`); Runtime-`mcp-serve` ist generiert und ohne core2ai |
| Extension-VSIX | `embed-cli-bundle.mjs` bündelt CLI **inkl. core2ai/codegen** nach `out/embed-*` — getrennt von `demos/node_modules` |

## Problemstellung

1. **Monorepo-CI** (`npm test` im Repo): Ohne installierte VSIX und ohne `../../cli` in `generate.mjs` schlagen Integrationstests fehl, wenn `API2AI_CLI` / `DB2AI_CLI` nicht gesetzt ist.
2. **Lockfile**: `package-lock.json` mit `link: true` auf `../../../../core2ai` ist für lokale Entwicklung gewollt; nach `npm install` im kopierten Demo-Workspace (ohne Sibling) muss npm `@core2ai/core@0.0.5` aus Registry/Git anders auflösen — Verhalten klären (nur Tests, optional).
3. **Benennung „CLI“**: `generate.mjs` startet weiterhin ein **Subprocess** (`cli.cjs`); das ist keine Source-Abhängigkeit zu `packages/cli`, aber funktional „Codegen-Binary“.

## Vorschlag (Phasen)

### Phase A — Demos-Skripte (api2ai + db2ai, parallel)

- [ ] `generate.mjs` / `generate-all.mjs`: nur **Env-Var** + **installierte Extension** (bereits ohne Monorepo-Pfad).
- [ ] Optional: relativer Pfad zu `cli.cjs` **neben der Extension**, wenn Demos aus dem **installierten** Extension-Root laufen (nicht `packages/cli`) — nur falls Env + Extension-Scan nicht reichen.
- [ ] Fehlermeldungen und `demos/README.md`: klar „Extension installieren oder `*_CLI` setzen“.

### Phase B — Monorepo-Tests ohne CLI-Pfad in demos

- [ ] In `vitest.config.ts` oder Test-Setup: `process.env.API2AI_CLI` / `DB2AI_CLI` auf `packages/extension/out/embed-*/cli.cjs` setzen (nach `npm run build` in extension), **nicht** in `generate.mjs` hardcoden.
- [ ] Root-`npm test`: ggf. Extension `build:prepare` / embed vor Demo-Tests sicherstellen (Reihenfolge in `package.json` prüfen).
- [ ] db2ai/api2ai gleiche Strategie.

### Phase C — Lockfile / `@core2ai/core`

- [ ] `demos/package.json`: bei `"0.0.5"` Lockfile mit **link** zum Sibling `core2ai` beibehalten (kein `github:`-Pin).
- [ ] Dokumentieren: kopiertes Demo-Workspace → `npm install` löst core2ai für **Tests** auf (Registry oder manuell); VSIX-Runtime für Generate nutzt **Embed**, nicht `demos/node_modules/@core2ai/core`.

### Phase D — VSIX / `createDemoWorkspace`

- [ ] Prüfen, ob `demo-bundle-required.json` ausreicht; ggf. Hinweis in Extension-Command-Text: nach Kopie Extension + `npm install` + `generate:all`.
- [ ] Kein `packages/cli` in kopierten Dateien.

## Nicht-Ziele

- GitHub-Pin `github:annettedorothea/core2ai#…` in `demos/package.json`.
- `import` oder Pfad `../../../../cli` / `packages/cli` **innerhalb** von `demos/**`.

## Offene Fragen (Plan-Mode)

1. Soll Monorepo-CI die CLI **nur** über Env aus `packages/extension/out/embed-*` bekommen, oder zusätzlich ein kleines Root-Skript `scripts/resolve-embed-cli.mjs`?
2. Soll `@core2ai/core` in kopierten Demos aus npm Registry `0.0.5` kommen, wenn kein Sibling — oder Tests nur im Monorepo?
3. Extension `main.ts` enthält noch Monorepo-CLI-Fallback für **Editor-Commands** — bewusst außerhalb `demos/`; angleichen oder getrennt lassen?

## Bereits erledigt (diese Session)

- README `test/README.md`: api2ai + db2ai mit Hinweis auf `scripts/generate.mjs`.
- Revert GitHub-Pin; `generate.mjs` ohne `../../cli`.
- `package-lock.json` aus Git wiederhergestellt.
