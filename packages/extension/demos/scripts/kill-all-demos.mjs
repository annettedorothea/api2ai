#!/usr/bin/env node
/**
 * Stop demo backends, OAuth IDP, and MCP HTTP/OAuth hosts (safe to re-run).
 */
import { copyFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadProjectEnvLocal } from './generated/load-env-local.mjs';

const demosRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function ensureEnvFromExample() {
    const examplePath = path.join(demosRoot, '.env.example');
    const targetPath = path.join(demosRoot, '.env.local');
    if (!existsSync(targetPath) && existsSync(examplePath)) {
        copyFileSync(examplePath, targetPath);
    }
}

function runNode(relativePath) {
    const result = spawnSync(process.execPath, [path.join(demosRoot, relativePath)], {
        cwd: demosRoot,
        stdio: 'inherit'
    });
    if (result.status !== 0) {
        process.exit(result.status ?? 1);
    }
}

loadProjectEnvLocal();
ensureEnvFromExample();
loadProjectEnvLocal();
console.log('[kill-all] stopping MCP hosts…');
runNode('./scripts/kill-mcp-hosts.mjs');
console.log('[kill-all] stopping OAuth IDP…');
runNode('./oauth-idp/kill-server.mjs');
runNode('./oauth-idp/kill-server-oidc.mjs');
runNode('./oauth-idp/kill-server-enterprise.mjs');
console.log('[kill-all] stopping banking-api…');
runNode('./banking-api/kill-server.mjs');
console.log('[kill-all] stopping cakes-api…');
runNode('./cakes-api/kill-server.mjs');
console.log('[kill-all] stopping bookings-api…');
runNode('./bookings-api/kill-server.mjs');
console.log('[kill-all] stopping todo-api…');
runNode('./todo-api/kill-server.mjs');
console.log('[kill-all] done.');
