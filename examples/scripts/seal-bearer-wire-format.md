# Wire format `A2S1` (sealed bearer / PAT)

Binary blob, then **Base64** (single line) for `sealedCredential` in tool calls.

| Offset | Length | Content |
|--------|--------|---------|
| 0 | 4 | Magic ASCII `A2S1` |
| 4 | 2 | Big-endian **uint16** `rsaLen` — length of RSA ciphertext |
| 6 | `rsaLen` | RSA-2048 **OAEP SHA-256** ciphertext of the **32-byte AES-256 key** |
| 6+rsaLen | 12 | AES-GCM IV |
| rest | variable | AES-256-GCM ciphertext of UTF-8 plaintext **concatenated with** 16-byte **auth tag** |

- Plaintext after decrypt: raw secret string (e.g. GitHub PAT **without** the word `Bearer`; DSL `prefix: "Bearer "` adds it when building the header).
- **Encrypt:** [seal-bearer-helper.mjs](seal-bearer-helper.mjs) `seal`
- **Decrypt:** generiertes `invokeTool` (`unsealA2S1`); byte-kompatibel mit [seal-bearer-helper.mjs](seal-bearer-helper.mjs) `seal` / `verify`.

## Key material

- **RSA 2048**, public **SPKI PEM**, private **PKCS8 PEM** (`gen-keypair`).

## Security note

This is transport packaging, not a substitute for short-lived tokens or API-side authorization.
