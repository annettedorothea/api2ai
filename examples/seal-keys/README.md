# Seal keys (local only)

Vollständige Anleitung (TMDB, GitHub, Versicherungs-API): [**examples/README.md**](../README.md#sealed-bearer-github-versicherungs-api-).

Generate a keypair (PEM files are **gitignored**):

```bash
node examples/scripts/seal-bearer-helper.mjs gen-keypair --out examples/seal-keys
```

Seal a PAT (uses the repo’s `examples/seal-keys/public.pem`). Pass the token on the CLI (**can land in shell history** — prefer `--stdin` when possible).

**npm:** the script lives in [`examples/package.json`](../package.json) (`seal:github-token`). The extra `--` is required so npm forwards `--pat` to Node. Without it, `npm run seal:github-token --pat TEST` turns into a stray `TEST` argument and fails with `Unknown arg`.

From the **repository root**:

```bash
npm run seal:github-token --prefix examples -- --pat ghp_yourPatHere
```

From **`examples/`**:

```bash
npm run seal:github-token -- --pat ghp_yourPatHere
```

Seal a customer-portal JWT: see [**examples/customer-portal/README.md**](../customer-portal/README.md) (`npm run seal:token`).

Pipe the token (no trailing newline in the secret is ideal):

```bash
printf '%s' 'ghp_yourPatHere' | node examples/scripts/seal-bearer-helper.mjs seal \
  --public-key examples/seal-keys/public.pem --stdin
```

Same without npm:

```bash
node examples/scripts/seal-bearer-helper.mjs seal \
  --public-key examples/seal-keys/public.pem --pat ghp_yourPatHere
```

Roundtrip check:

```bash
node examples/scripts/seal-bearer-helper.mjs verify --private-key examples/seal-keys/private.pem --blob "<paste-base64>"
```

For `bearerSealed`, you can set `privateKeyEnv` (for example `API2AI_SEAL_PRIVATE_KEY`) to either the full PEM text or a path such as `examples/seal-keys/private.pem`. The generated runtime resolves relative paths against `process.cwd()` and each parent directory (up to 12 levels), so the file is still found when the MCP host uses a subdirectory as cwd. Use an absolute path if your layout is unusual.

Never commit `private.pem` or real PATs.
