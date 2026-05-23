/**
 * Entry for esbuild → resources/mcp-serve-emitted.mjs (copied to generated/cli/mcp-serve.mjs).
 * Not invoked via cli.js — bundled standalone for end-user MCP hosts.
 */
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadLocalEnvFiles } from './env.js';
import { applyMcpHostEnvKeys } from './mcp-host-env.js';
import { runMcpServerFromImportedModule } from './mcp-server.js';
import { parseMcpServeArgv, validateHostConfigAtStartup } from './parse-host-args.js';

const { modulePath, hostConfig } = parseMcpServeArgv(process.argv.slice(2));

const moduleDir = path.dirname(path.resolve(modulePath));
const envDirs = [process.cwd(), moduleDir];
loadLocalEnvFiles(envDirs);
applyMcpHostEnvKeys(hostConfig, envDirs);

const imported = await import(pathToFileURL(path.resolve(modulePath)).href);
if (!imported || typeof imported !== 'object') {
    throw new Error(`Generated module "${modulePath}" did not export an object.`);
}
const requiresAuth = (imported as { requiresAuth?: unknown }).requiresAuth === true;
validateHostConfigAtStartup(hostConfig, requiresAuth);

const authPart = hostConfig.authEnv ? ` authEnv=${hostConfig.authEnv}` : '';
console.error(`[mcp] baseUrlEnv=${hostConfig.baseUrlEnv}${authPart} (host context refreshed each tool call)`);

await runMcpServerFromImportedModule(imported as Record<string, unknown>);
