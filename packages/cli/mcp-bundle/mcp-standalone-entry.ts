/**
 * Entry for esbuild → resources/mcp-serve-emitted.mjs (copied to generated/cli/mcp-serve.mjs).
 * Not invoked via cli.js — bundled standalone for end-user MCP hosts.
 */
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadLocalEnvFiles } from '../src/env.js';
import { runMcpServerFromGeneratedModule } from './mcp-server.js';
import { parseMcpServeArgv, validateHostConfigAtStartup } from './parse-host-args.js';

const { modulePath, hostConfig } = parseMcpServeArgv(process.argv.slice(2));

loadLocalEnvFiles([process.cwd(), path.dirname(path.resolve(modulePath))]);

const imported = await import(pathToFileURL(path.resolve(modulePath)).href);
const requiresAuth = (imported as { requiresAuth?: unknown }).requiresAuth === true;
const hostRuntime = validateHostConfigAtStartup(hostConfig, requiresAuth);

const authPart = hostConfig.authEnv ? ` authEnv=${hostConfig.authEnv}` : '';
console.error(`[mcp] baseUrlEnv=${hostConfig.baseUrlEnv}${authPart}`);

await runMcpServerFromGeneratedModule(modulePath, { hostRuntime });
