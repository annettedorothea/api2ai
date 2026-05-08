# Workspace overview

Depending on the selection during the project generation you will have one or more packages contained in the packages directory.
Please check the specific projects here:

- [packages/language](./packages/language/README.md) This package is always available and contains the language definition.
- [packages/cli](./packages/cli/README.md) *Optional* Is only available if you chose to use the command-line interface.
- [packages/extension](./packages/extension/langium-quickstart.md) *Optional* Contains the VSCode extension if you chose to create it.

## What's in the folder?

Some file are contained in the root directory as well.

- [package.json](./package.json) - The manifest file the main workspace package
- [tsconfig.json](./tsconfig.json) - The base TypeScript compiler configuration
- [tsconfig.build.json](./package.json) - Configuration used to build the complete source code.
- [.gitignore](.gitignore) - Files ignored by git

## Preview the DSL extension

Use this workflow to launch the generated VSCode/Cursor extension in an Extension Development Host.

1. Open this folder as workspace root: `api2ai/api2ai`
   - Important: this is required so `.vscode/launch.json` and the `Run Extension` configuration are detected.
2. Install and build:
   - `npm install`
   - `npm run langium:generate`
   - `npm run build`
3. Start the preview:
   - Press `F5` or use `Run` -> `Start Debugging`
   - Select `Run Extension`
4. In the new Extension Development Host window, create a file with extension `.api2ai`, for example:
   - `demo.api2ai`
   - content:
     ```txt
     openapi "./examples/petstore.openapi.yaml"
     baseUrl "https://petstore3.swagger.io/api/v3"

     GET "/pet/{petId}" {
       intent: "get one pet"
       toolName: "getPetById"
     }
     ```

### Recommended development loop

- `npm run langium:watch` (regenerate AST/grammar artifacts on grammar changes)
- `npm run watch` (rebuild TypeScript on source changes)
- In the Extension Development Host, press `Cmd+Shift+P` and run `Developer: Reload Window` after changes.

## Live API tool testing modes

The DSL contains both API references:

- `openapi`: local OpenAPI 3.x spec used for validation.
- `baseUrl`: live API base URL used when invoking tools.

Example:

```txt
openapi "./petstore.openapi.yaml"
baseUrl "https://petstore3.swagger.io/api/v3"
```

Two test modes are available from the root `package.json`.

To refresh the generated TypeScript output after changing `examples/petstore.api2ai`, run:

```bash
npm run generate:petstore-tools
```

The smoke and MCP test modes parse the DSL file directly. The generated file is useful to inspect the TypeScript output that would be shipped or embedded elsewhere.

### Mode A: Smoke test without MCP

Runs one generated tool call directly against the live API. This is the fastest way to check whether the DSL, OpenAPI validation, URL construction, and HTTP call work.

```bash
npm run test:smoke
```

The script calls `getPetById` from `examples/petstore.api2ai` with arguments from `examples/petstore-smoke-args.json`:

```json
{"pathParams":{"petId":1}}
```

### Mode B: Real MCP server (stdio)

Starts an MCP server over stdio and exposes all tools from the DSL. Use this when you want Cursor or another MCP client/agent to discover and call the generated tools.

```bash
npm run test:mcp
```

### Connect Cursor to the MCP server

The project contains `.cursor/mcp.json`, so Cursor can discover the `api2ai-petstore` MCP server automatically.

The configured server starts:

```bash
node /Users/annette/Documents/Projekte/api2ai/api2ai/packages/cli/bin/cli.js \
  mcp-serve \
  /Users/annette/Documents/Projekte/api2ai/api2ai/examples/petstore.api2ai
```

To load or refresh the MCP server in Cursor:

1. Press `Cmd+Shift+P`.
2. Search for `MCP`.
3. Run the available MCP refresh/restart command, or enable `api2ai-petstore` in the MCP server list.
4. If the server list does not update, press `Cmd+Shift+P` and run `Developer: Reload Window`.

When connected, Cursor should show three enabled tools:

- `findPetsByStatus`
- `getPetById`
- `upsertPet`

After connecting, ask the agent to use one of the DSL tools, for example `getPetById` with path parameter `petId=1`.

## Alternative demo API: SWAPI

SWAPI is a better conceptual demo API than Petstore because it is read-only, public, and has clear resources such as people, planets, films, species, vehicles, and starships.

For this PoC, the important requirement is an OpenAPI 3.x document. The original SWAPI docs do not provide an official OpenAPI spec, but the community package `swapi-typespec` provides a generated OpenAPI 3 spec at `./node_modules/swapi-typespec/swapi.openapi.yaml`. That makes SWAPI a good next candidate once we replace the Petstore example.
