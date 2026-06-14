#!/usr/bin/env node
/**
 * Start relay HTTP MCP hosts used by start / mcp.json (public: spaceflight-news; passthrough: todo).
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadDemoEnvLocal } from './load-env-local.mjs';
import { buildHostLaunch, HTTP_START_DEMO_NAMES } from './mcp-http-demos.mjs';

const demosRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function startDetached(name, args, port, mcpUrl, mcpAuthHeader, hostEnv) {
    const child = spawn(process.execPath, args, {
        cwd: demosRoot,
        detached: true,
        stdio: 'ignore',
        env: { ...process.env, ...hostEnv }
    });
    child.unref();
    console.log(
        `[mcp-http:all] ${name} started http://127.0.0.1:${port}/mcp (${mcpUrl}, ${mcpAuthHeader}, pid ${child.pid ?? '?'})`
    );
}

function main() {
    loadDemoEnvLocal();

    for (const name of HTTP_START_DEMO_NAMES) {
        const { port, args, mcpUrl, mcpAuthHeader, hostEnv } = buildHostLaunch(name, demosRoot, process.env);
        startDetached(name, args, port, mcpUrl, mcpAuthHeader, hostEnv);
    }

    console.log(`[mcp-http:all] started ${HTTP_START_DEMO_NAMES.length} hosts — stop: npm run demo:mcp-http:kill`);
    console.warn('[mcp-http:all] todo-api MCP host needs todo-api backend (start or npm run demo:todo-api).');
}

main();
