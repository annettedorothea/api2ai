#!/usr/bin/env node

// packages/cli/mcp-bundle/mcp-standalone-entry.ts
import * as path3 from "node:path";
import { pathToFileURL as pathToFileURL2 } from "node:url";

// packages/cli/src/env.ts
import * as fs from "node:fs";
import * as path from "node:path";
var LOCAL_ENV_FILES = [".env", ".env.local"];
function stripOptionalQuotes(value) {
  if (value.length < 2) {
    return value;
  }
  const first = value.at(0);
  const last = value.at(-1);
  if (first === '"' && last === '"' || first === "'" && last === "'") {
    return value.slice(1, -1);
  }
  return value;
}
function parseEnvLine(line) {
  const trimmed = line.trim();
  if (trimmed.length === 0 || trimmed.startsWith("#")) {
    return void 0;
  }
  const assignment = trimmed.startsWith("export ") ? trimmed.slice("export ".length).trim() : trimmed;
  const separator = assignment.indexOf("=");
  if (separator <= 0) {
    return void 0;
  }
  const key = assignment.slice(0, separator).trim();
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
    return void 0;
  }
  const value = stripOptionalQuotes(assignment.slice(separator + 1).trim());
  return [key, value];
}
function ancestorDirectories(startDir) {
  const directories = [];
  let current = path.resolve(startDir);
  while (true) {
    directories.unshift(current);
    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }
  return directories;
}
function loadLocalEnvFiles(startDirs) {
  const protectedKeys = new Set(Object.keys(process.env));
  const loadedKeys = /* @__PURE__ */ new Set();
  const loadedFiles = [];
  const visitedFiles = /* @__PURE__ */ new Set();
  for (const startDir of startDirs) {
    for (const directory of ancestorDirectories(startDir)) {
      for (const fileName of LOCAL_ENV_FILES) {
        const filePath = path.join(directory, fileName);
        if (visitedFiles.has(filePath) || !fs.existsSync(filePath)) {
          continue;
        }
        visitedFiles.add(filePath);
        const content = fs.readFileSync(filePath, "utf-8");
        const overrideExisting = fileName === ".env.local";
        for (const line of content.split(/\r?\n/u)) {
          const parsed = parseEnvLine(line);
          if (!parsed) {
            continue;
          }
          const [key, value] = parsed;
          if (overrideExisting || !protectedKeys.has(key) || loadedKeys.has(key)) {
            process.env[key] = value;
            loadedKeys.add(key);
          }
        }
        loadedFiles.push(filePath);
      }
    }
  }
  return loadedFiles;
}

// packages/cli/mcp-bundle/mcp-server.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as path2 from "node:path";
import { pathToFileURL } from "node:url";
import * as z from "zod/v4";
var primitiveUnion = z.union([z.string(), z.number(), z.boolean()]);
function zodPicklist(strings) {
  if (strings.length === 0) {
    return z.never();
  }
  if (strings.length === 1) {
    return z.literal(strings[0]);
  }
  const literals = strings.map((v) => z.literal(v));
  return z.union(literals);
}
function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}
function zodNumericPicklist(values) {
  if (values.length === 0) {
    return z.never();
  }
  if (values.length === 1) {
    return z.literal(values[0]);
  }
  const literals = values.map((v) => z.literal(v));
  return z.union(literals);
}
function jsonSchemaToZod(schema) {
  if (schema === null || typeof schema !== "object") {
    return z.unknown();
  }
  const s = schema;
  if (Array.isArray(s.anyOf)) {
    const parts = s.anyOf.map((p) => jsonSchemaToZod(p));
    if (parts.length === 0) {
      return z.never();
    }
    if (parts.length === 1) {
      return parts[0];
    }
    return z.union(parts);
  }
  if (s.type === "object" && s.properties !== void 0 && typeof s.properties === "object" && !Array.isArray(s.properties)) {
    const props = s.properties;
    const required = new Set(Array.isArray(s.required) ? s.required.filter((x) => typeof x === "string") : []);
    const shape = {};
    for (const [key, propSchema] of Object.entries(props)) {
      let inner = jsonSchemaToZod(propSchema);
      if (!required.has(key)) {
        inner = inner.optional();
      }
      shape[key] = inner;
    }
    let obj = z.object(shape);
    if (s.additionalProperties === false) {
      obj = obj.strict();
    }
    return obj;
  }
  if (s.type === "array") {
    const items = jsonSchemaToZod(s.items);
    return z.array(items);
  }
  if (s.type === "string") {
    if (Array.isArray(s.enum) && s.enum.length >= 1 && s.enum.every((e) => typeof e === "string")) {
      return zodPicklist(s.enum);
    }
    return z.string();
  }
  if (s.type === "number" || s.type === "integer") {
    if (Array.isArray(s.enum) && s.enum.length >= 1 && s.enum.every(isFiniteNumber)) {
      return zodNumericPicklist(s.enum);
    }
    return z.number();
  }
  if (s.type === "boolean") {
    return z.boolean();
  }
  if (s.type === "object" && s.additionalProperties === true) {
    return z.record(z.string(), primitiveUnion);
  }
  if (s.type === "object" && typeof s.additionalProperties === "object" && s.additionalProperties !== null && !Array.isArray(s.additionalProperties)) {
    const valueType = jsonSchemaToZod(s.additionalProperties);
    return z.record(z.string(), valueType);
  }
  return z.unknown();
}
var queryValueUnion = z.union([primitiveUnion, z.array(primitiveUnion)]);
var fallbackInputSchema = z.object({
  pathParams: z.record(z.string(), primitiveUnion).optional(),
  query: z.record(z.string(), queryValueUnion).optional(),
  headers: z.record(z.string(), z.string()).optional(),
  body: z.unknown().optional()
});
function asLocalModulePath(modulePath2) {
  if (modulePath2.startsWith("file://")) {
    throw new Error("mcp-serve.mjs accepts local file paths only (no file:// URLs).");
  }
  return path2.resolve(modulePath2);
}
function readRuntimeModule(imported2) {
  const generatedTools = imported2.generatedTools;
  const invokeTool = imported2.invokeTool;
  if (!Array.isArray(generatedTools)) {
    throw new Error('Generated module must export "generatedTools" array.');
  }
  if (typeof invokeTool !== "function") {
    throw new Error('Generated module must export async "invokeTool" function.');
  }
  const inputSchemaByTool = imported2.inputSchemaByTool;
  return {
    generatedTools,
    invokeTool,
    inputSchemaByTool: inputSchemaByTool && typeof inputSchemaByTool === "object" && !Array.isArray(inputSchemaByTool) ? inputSchemaByTool : void 0
  };
}
async function importGeneratedModule(modulePath2) {
  const absolutePath = asLocalModulePath(modulePath2);
  const imported2 = await import(pathToFileURL(absolutePath).href);
  if (!imported2 || typeof imported2 !== "object") {
    throw new Error(`Generated module "${modulePath2}" did not export an object.`);
  }
  return readRuntimeModule(imported2);
}
async function importGeneratedModuleWithoutCache(modulePath2) {
  const absolutePath = asLocalModulePath(modulePath2);
  const moduleUrl = pathToFileURL(absolutePath);
  moduleUrl.searchParams.set("t", `${Date.now()}`);
  const imported2 = await import(moduleUrl.href);
  if (!imported2 || typeof imported2 !== "object") {
    throw new Error(`Generated module "${modulePath2}" did not export an object.`);
  }
  return readRuntimeModule(imported2);
}
async function runMcpServerFromGeneratedModule(modulePath2, options) {
  const generated = await importGeneratedModule(modulePath2);
  const loadModule = options.reloadModulePerRequest ? () => importGeneratedModuleWithoutCache(modulePath2) : () => importGeneratedModule(modulePath2);
  const server = new McpServer({
    name: "api2ai-generated-tools",
    version: "0.1.0"
  });
  const { baseUrl, credential } = options.hostRuntime;
  for (const tool of generated.generatedTools) {
    const rawSchema = generated.inputSchemaByTool?.[tool.toolName];
    const inputSchema = rawSchema !== void 0 ? jsonSchemaToZod(rawSchema) : fallbackInputSchema;
    server.registerTool(
      tool.toolName,
      {
        title: typeof tool.title === "string" && tool.title.length > 0 ? tool.title : void 0,
        description: tool.description,
        inputSchema
      },
      async (args) => {
        const a = args;
        const currentModule = await loadModule();
        const result = await currentModule.invokeTool(tool.toolName, {
          baseUrl,
          credential,
          pathParams: a.pathParams,
          query: a.query,
          headers: a.headers,
          body: a.body
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }
    );
  }
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// packages/cli/mcp-bundle/parse-host-args.ts
function parseMcpServeArgv(argv) {
  const positional = [];
  let baseUrlEnv;
  let authEnv;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--base-url-env") {
      baseUrlEnv = argv[++i];
      if (!baseUrlEnv) {
        throw new Error("Missing value after --base-url-env");
      }
      continue;
    }
    if (arg === "--auth-env") {
      authEnv = argv[++i];
      if (!authEnv) {
        throw new Error("Missing value after --auth-env");
      }
      continue;
    }
    if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    }
    positional.push(arg);
  }
  const modulePath2 = positional[0];
  if (!modulePath2) {
    throw new Error("Usage: node mcp-serve.mjs <path-to-*-tools.mjs> --base-url-env VAR [--auth-env VAR]");
  }
  if (!baseUrlEnv) {
    throw new Error("Required: --base-url-env <ENV_VAR_NAME>");
  }
  return {
    modulePath: modulePath2,
    hostConfig: {
      baseUrlEnv,
      authEnv
    }
  };
}
function validateHostConfigAtStartup(hostConfig2, requiresAuth2) {
  const baseUrl = process.env[hostConfig2.baseUrlEnv]?.trim();
  if (!baseUrl) {
    throw new Error(
      `Environment variable "${hostConfig2.baseUrlEnv}" is missing or empty (required by --base-url-env).`
    );
  }
  if (!requiresAuth2) {
    return { baseUrl };
  }
  if (!hostConfig2.authEnv) {
    throw new Error("Generated tools require auth; pass --auth-env <ENV_VAR_NAME> on the MCP host.");
  }
  const credential = process.env[hostConfig2.authEnv]?.trim();
  if (!credential) {
    throw new Error(
      `Environment variable "${hostConfig2.authEnv}" is missing or empty (required by --auth-env).`
    );
  }
  return { baseUrl, credential };
}

// packages/cli/mcp-bundle/mcp-standalone-entry.ts
var { modulePath, hostConfig } = parseMcpServeArgv(process.argv.slice(2));
loadLocalEnvFiles([process.cwd(), path3.dirname(path3.resolve(modulePath))]);
var imported = await import(pathToFileURL2(path3.resolve(modulePath)).href);
var requiresAuth = imported.requiresAuth === true;
var hostRuntime = validateHostConfigAtStartup(hostConfig, requiresAuth);
var authPart = hostConfig.authEnv ? ` authEnv=${hostConfig.authEnv}` : "";
console.error(`[mcp] baseUrlEnv=${hostConfig.baseUrlEnv}${authPart}`);
await runMcpServerFromGeneratedModule(modulePath, { hostRuntime });
