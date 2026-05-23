#!/usr/bin/env node

// packages/cli/mcp-bundle/mcp-standalone-entry.ts
import * as path2 from "node:path";
import { pathToFileURL } from "node:url";

// packages/cli/mcp-bundle/env.ts
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

// packages/cli/mcp-bundle/mcp-host-env.ts
var MCP_HOST_BASE_URL_ENV_KEY = "API2AI_MCP_BASE_URL_ENV_KEY";
var MCP_HOST_AUTH_ENV_KEY = "API2AI_MCP_AUTH_ENV_KEY";
var MCP_HOST_ENV_DIRS = "API2AI_MCP_ENV_DIRS";
function applyMcpHostEnvKeys(hostConfig2, envDirs2) {
  process.env[MCP_HOST_BASE_URL_ENV_KEY] = hostConfig2.baseUrlEnv;
  if (hostConfig2.authEnv) {
    process.env[MCP_HOST_AUTH_ENV_KEY] = hostConfig2.authEnv;
  } else {
    delete process.env[MCP_HOST_AUTH_ENV_KEY];
  }
  if (envDirs2.length > 0) {
    process.env[MCP_HOST_ENV_DIRS] = JSON.stringify(envDirs2);
  } else {
    delete process.env[MCP_HOST_ENV_DIRS];
  }
}

// packages/cli/mcp-bundle/mcp-server.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
function requireMcpServerIdentity(generated) {
  const name = generated.mcpServerName?.trim();
  const version = generated.mcpServerVersion?.trim();
  if (!name) {
    throw new Error('Generated module must export "mcpServerName". Regenerate tool code.');
  }
  if (!version) {
    throw new Error('Generated module must export "mcpServerVersion". Regenerate tool code.');
  }
  return { name, version };
}
function requireInputZodSchema(inputZodByTool, toolName) {
  if (!inputZodByTool) {
    throw new Error('Generated module must export "inputZodByTool". Regenerate tool code.');
  }
  const schema = inputZodByTool[toolName];
  if (!schema) {
    throw new Error(
      `Generated module inputZodByTool has no schema for tool "${toolName}". Regenerate tool code.`
    );
  }
  return schema;
}
function readRuntimeModule(imported2) {
  const generatedTools = imported2.generatedTools;
  const invokeTool = imported2.invokeTool;
  const resolveHostContext = imported2.resolveHostContext;
  if (!Array.isArray(generatedTools)) {
    throw new Error('Generated module must export "generatedTools" array.');
  }
  if (typeof invokeTool !== "function") {
    throw new Error('Generated module must export async "invokeTool" function.');
  }
  if (typeof resolveHostContext !== "function") {
    throw new Error('Generated module must export "resolveHostContext". Regenerate tool code.');
  }
  const inputZodByTool = imported2.inputZodByTool;
  const mcpServerName = imported2.mcpServerName;
  const mcpServerVersion = imported2.mcpServerVersion;
  return {
    generatedTools,
    resolveHostContext,
    invokeTool,
    inputZodByTool: inputZodByTool && typeof inputZodByTool === "object" && !Array.isArray(inputZodByTool) ? inputZodByTool : void 0,
    mcpServerName: typeof mcpServerName === "string" ? mcpServerName : void 0,
    mcpServerVersion: typeof mcpServerVersion === "string" ? mcpServerVersion : void 0
  };
}
function reloadEnvFilesForDev() {
  const raw = process.env[MCP_HOST_ENV_DIRS];
  if (!raw?.trim()) {
    return;
  }
  try {
    const dirs = JSON.parse(raw);
    if (Array.isArray(dirs) && dirs.every((d) => typeof d === "string")) {
      loadLocalEnvFiles(dirs);
    }
  } catch {
  }
}
async function runMcpServerFromImportedModule(imported2) {
  const generated = readRuntimeModule(imported2);
  const { name, version } = requireMcpServerIdentity(generated);
  const server = new McpServer({ name, version });
  for (const tool of generated.generatedTools) {
    const inputSchema = requireInputZodSchema(generated.inputZodByTool, tool.toolName);
    server.registerTool(
      tool.toolName,
      {
        title: typeof tool.title === "string" && tool.title.length > 0 ? tool.title : void 0,
        description: tool.description,
        inputSchema
      },
      async (args) => {
        reloadEnvFilesForDev();
        const hostContext = generated.resolveHostContext();
        const result = await generated.invokeTool(
          tool.toolName,
          args ?? {},
          hostContext
        );
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
    return;
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
}

// packages/cli/mcp-bundle/mcp-standalone-entry.ts
var { modulePath, hostConfig } = parseMcpServeArgv(process.argv.slice(2));
var moduleDir = path2.dirname(path2.resolve(modulePath));
var envDirs = [process.cwd(), moduleDir];
loadLocalEnvFiles(envDirs);
applyMcpHostEnvKeys(hostConfig, envDirs);
var imported = await import(pathToFileURL(path2.resolve(modulePath)).href);
if (!imported || typeof imported !== "object") {
  throw new Error(`Generated module "${modulePath}" did not export an object.`);
}
var requiresAuth = imported.requiresAuth === true;
validateHostConfigAtStartup(hostConfig, requiresAuth);
var authPart = hostConfig.authEnv ? ` authEnv=${hostConfig.authEnv}` : "";
console.error(`[mcp] baseUrlEnv=${hostConfig.baseUrlEnv}${authPart} (host context refreshed each tool call)`);
await runMcpServerFromImportedModule(imported);
