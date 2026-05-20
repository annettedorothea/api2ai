# examples — Setup, Secrets und Demo-Prompts

Dieser Ordner ist der **Cursor-Workspace** für MCP-Demos: `.cursor/mcp.json` (lokal aus `mcp.json.example`), `.api2ai`-Dateien, generierte Tools und lokale Secrets.

Ausführliche Repo-Checkliste: [README.md](../README.md#getting-started-checkliste) im Repository-Root.

---

## Setup-Checkliste (neuer Rechner)

- **Node.js 20+** (`node -v`)
- Repository klonen
- Im **Repository-Root:**
  ```bash
  npm install
  npm run langium:generate
  npm run build
  ```
- **In `examples/`** (MCP-Runtime-Abhängigkeiten):
  ```bash
  cd examples
  npm install
  ```
- **MCP-Konfig:** `cp .cursor/mcp.json.example .cursor/mcp.json` (Datei ist gitignored, pro Rechner/Projekt)
- **Secrets** (siehe unten): TMDB optional, Seal-Keys für `bearerSealed` (GitHub, interne/BFF-APIs, …)
- **Cursor:** Ordner `examples` als Workspace öffnen (nicht nur Repo-Root — sonst fehlt `.cursor/mcp.json`)
- **MCP:** Einstellungen → Tools & MCP → Server `api2ai-`* aktivieren
- **Test:** Chat mit `api2ai wie ist das Wetter in Berlin` (Open-Meteo, kein Token nötig)
- Nach Änderung an `.api2ai`: `npm run generate:…` im Root, dann MCP-Server neu laden (`Developer: Reload Window` oder MCP-Refresh)

Generierte Dateien unter `generated/` liegen im Git — Regenerieren nur nötig, wenn ihr die DSL ändert.

---

## MCP-Konfiguration (`mcp.json.example` → `mcp.json`)

`[mcp.json.example](.cursor/mcp.json.example)` liegt im Git (öffentliche Demo-Server). Die aktive Datei `[.cursor/mcp.json](.cursor/mcp.json)` ist **gitignored** — umgebungs- und projektabhängig (welche APIs du anbindest).

**Ersteinrichtung** (im Ordner `examples/`):

```bash
cp .cursor/mcp.json.example .cursor/mcp.json
```

Nach einer **neuen** `.api2ai`-Datei oder nach Umbenennung den passenden MCP-Server in **deiner lokalen** `.cursor/mcp.json` **manuell** ergänzen oder anpassen. Die Extension pflegt diese Datei **noch nicht** automatisch (geplant: Sync nach Generate).

Vorlage pro Datei `meine-api.api2ai` (Server-ID = `api2ai-` + Dateiname ohne Endung):

```json
"api2ai-meine-api": {
  "command": "node",
  "args": [
    "./generated/cli/mcp-serve.mjs",
    "./generated/tools/meine-api-tools.mjs"
  ]
}
```

Danach MCP neu laden (`Developer: Reload Window` oder MCP-Refresh in den Einstellungen).

**Extension für Kollegen (ohne Monorepo):** VSIX bauen, verteilen und installieren — siehe [README.md](../README.md#extension-vsix--bauen-und-verteilen) (Artefakt: `packages/extension/vscode-api2ai-<version>.vsix`).

---

## TMDB API-Key (`bearerEnv`)

TMDB nutzt `**auth bearerEnv`** — der Token liegt in einer Umgebungsvariable, nicht als sealed Blob.

1. API-Key bei [TMDB](https://www.themoviedb.org/settings/api) erstellen (Bearer / API Read Access Token).
2. Datei `**examples/.env.local**` anlegen (ist **gitignored**):
  ```env
   TMDB_ACCESS_TOKEN=eyJhbGciOiJIUzI1NiJ9...
  ```
3. MCP-Server `api2ai-tmdb` in Cursor aktivieren.
4. Test-Prompt: `api2ai suche Filme mit dem Titel Dune`

`examples/.env` enthält nur Platzhalter — echte Keys nie committen.

---

## Sealed Bearer (GitHub, interne APIs, …)

Für APIs mit `**auth bearerSealed**` kommt das Geheimnis **verschlüsselt** pro Tool-Aufruf als `sealedCredential` (Format **A2S1**). Der MCP-Prozess entschlüsselt mit einem **lokalen Private Key** — das Klartext-Token steht nicht im Repo und nicht dauerhaft in der MCP-Konfiguration.

Details zum Binärformat: [scripts/seal-bearer-wire-format.md](scripts/seal-bearer-wire-format.md).

### 1. Keypair erzeugen (einmal pro Rechner)

Im Repository-Root oder unter `examples/`:

```bash
node examples/scripts/seal-bearer-helper.mjs gen-keypair --out examples/seal-keys
```

Erzeugt `public.pem` und `private.pem` unter `examples/seal-keys/` — **beide sind gitignored**.

### 2. Private Key für MCP bekannt machen

In `**examples/.env.local`** (ergänzen):

```env
API2AI_SEAL_PRIVATE_KEY=examples/seal-keys/private.pem
```

(`examples/.env` dokumentiert dieselbe Variable mit einem relativen Pfad — der Wert kann im Repo stehen, die PEM-Dateien nicht.)

### 3. Access Token versiegeln

**Nur den Token-String** versiegeln (ohne Wort `Bearer` — das setzt die DSL per `prefix: "Bearer "`).

**GitHub PAT** (npm-Helfer):

```bash
cd examples
npm run seal:github-token -- --pat ghp_deinPat
```

**Beliebiges Bearer-Token** (z. B. Staging-Token einer internen oder BFF-API):

```bash
cd examples
npm run seal:token -- --pat DEIN_STAGING_ACCESS_TOKEN
```

Oder ohne Shell-History (empfohlen):

```bash
printf '%s' 'DEIN_STAGING_ACCESS_TOKEN' | node examples/scripts/seal-bearer-helper.mjs seal \
  --public-key examples/seal-keys/public.pem --stdin
```

Ausgabe: eine **Base64-Zeile** (A2S1-Blob). In eine Datei speichern, z. B. `my-api-sealed-token.txt` oder `github-sealed-token.txt` — Dateien `*-sealed-token.txt` sind **gitignored**.

Optional Verifikation:

```bash
node examples/scripts/seal-bearer-helper.mjs verify \
  --private-key examples/seal-keys/private.pem \
  --blob "<Base64-Zeile>"
```

### 4. In Cursor / Agent nutzen

- MCP-Tool-Aufruf mit Parameter `**sealedCredential**`: Inhalt der Base64-Zeile.
- Demo-Prompt (GitHub): siehe unten — Token aus `@github-sealed-token.txt` referenzieren.
- Für eine interne API: dasselbe Muster nach Anlegen der `.api2ai` und Eintrag in **deiner lokalen** `.cursor/mcp.json`.

### 5. DSL-Beispiel (`bearerSealed`)

Wie in [github.api2ai](github.api2ai):

```txt
auth bearerSealed {
    in: header
    name: "Authorization"
    prefix: "Bearer "
    privateKeyEnv: "API2AI_SEAL_PRIVATE_KEY"
}
```

---

## Eigene API / BFF anbinden (lokal, nicht im Repo)

**BFF** (*Backend for Frontend*): ein schlanker Backend-Dienst, den nur eure App/Agenten ansprechen — oft mit UI-tauglichen Endpunkten statt der vollen Kern-API.

Voraussetzungen: OpenAPI (oder minimale YAML) zur Ziel-API, Staging-**Access Token**, ggf. VPN/Netz vom Arbeits-Rechner.

1. **OpenAPI** lokal ablegen, z. B. `examples/openapi/my-api.openapi.yaml` (gitignored oder außerhalb des Repos).
2. `**.api2ai`** lokal anlegen, z. B. `examples/my-api.api2ai`:
  - `baseUrl` auf Staging/Dev
  - `auth bearerSealed { … }` wie oben (oder `bearerEnv`, falls passend)
  - **3–5 GET-Operationen** kuratieren (`toolName`, `intent`, `example`)
3. **Generieren** (Repository-Root), Script in `package.json` optional:
  ```bash
   node ./packages/cli/bin/cli.js generate ./examples/my-api.api2ai ./examples/generated/tools/my-api-tools.ts
  ```
4. **MCP** in **deiner lokalen** `[.cursor/mcp.json](.cursor/mcp.json)` ergänzen (siehe Vorlage im Abschnitt MCP-Konfiguration).
5. **Token versiegeln** (Abschnitt Sealed Bearer), Blob z. B. in `my-api-sealed-token.txt`.
6. Cursor: Workspace `examples`, MCP reload, Test mit `api2ai …` und `sealedCredential` / Datei-Referenz.

Ohne OpenAPI zuerst: minimale Spec nur für die Demo-Endpunkte schreiben (Pfade mit Staging per `curl` abgleichen).

Optional in der `.api2ai` nach `baseUrl`: `**insecureEnv`** (ohne Wert) — deaktiviert TLS-Zertifikatsprüfung nur für lokales Dev (selbstsigniert/mkcert). In Produktion weglassen.

**Projekt-spezifische APIs** (z. B. Kundenportal): OpenAPI, DSL, generierte Tools und Demo-Prompts **nicht** im Repo — lokale Anleitung unter `[examples/customer-portal/README.md](customer-portal/README.md)` (gitignored; vom Team beziehen oder selbst anlegen). MCP-Eintrag nur in der lokalen `mcp.json`.

---

## MCP-Server in diesem Workspace


| Server                        | Auth           | Token nötig?                       |
| ----------------------------- | -------------- | ---------------------------------- |
| `api2ai-open-meteo`           | —              | nein                               |
| `api2ai-open-meteo-geocoding` | —              | nein                               |
| `api2ai-spaceflight-news`     | —              | nein                               |
| `api2ai-tmdb`                 | `bearerEnv`    | ja, `TMDB_ACCESS_TOKEN`            |
| `api2ai-github`               | `bearerSealed` | ja, Seal-Keys + `sealedCredential` |


---

## Demo-Prompts (`api2ai`-Prefix)

Alle Prompts mit `**api2ai`** beginnen — dann greift `[.cursor/rules/mcp-api2ai-only.mdc](.cursor/rules/mcp-api2ai-only.mdc)` (nur api2ai-MCPs, kein Web-Fallback).

### Wetter (absichtlich mehrdeutiger Ort)

- `api2ai wie ist das aktuelle Wetter in Ortenberg`
- `api2ai gib mir die Wettervorhersage fuer Ortenberg fuer die naechsten 3 Tage`
- `api2ai es gibt mehrere Orte namens Ortenberg, zeig mir die moeglichen Treffer und nimm danach den in Baden-Wuerttemberg`

### Spaceflight

- `api2ai was ist die naechste SpaceX Mission`
- `api2ai zeig mir die naechsten 5 Spaceflight-Starts`

### Wetter + Spaceflight

- `api2ai Wann ist der naechste SpaceX Start und könnte er durch das Wetter gefährdet sein?`

### Movies (TMDB-Key nötig)

- `api2ai suche Filme mit dem Titel Dune`
- `api2ai Was war der teuerste Film, der 2025 rauskam?`
- `api2ai Gib mir 3 Top Sci-Fi Filme aus 2024!`

### GitHub (sealed Token nötig)

- `api2ai nimm token aus @github-sealed-token.txt und gib mir die user infos und meine repos`

### Architektur (Präsentation)

Siehe [docs/architecture-sketches.md](../docs/architecture-sketches.md).