#!/usr/bin/env node
/**
 * Stop demo backends, OAuth IDP, and MCP HTTP/OAuth hosts (safe to re-run).
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadProjectEnvLocal } from './generated/load-env-local.mjs';

const demosRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

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
console.log('[kill-all] stopping MCP hosts…');
runNode('./scripts/kill-mcp-hosts.mjs');
console.log('[kill-all] stopping OAuth IDP…');
runNode('./oauth-idp/kill-server.mjs');
runNode('./oauth-idp/kill-server-oidc.mjs');
console.log('[kill-all] stopping cakes-api…');
runNode('./cakes-api/kill-server.mjs');
console.log('[kill-all] stopping bookings…');
runNode('./bookings/kill-server.mjs');
console.log('[kill-all] stopping todo-api…');
runNode('./todo-api/kill-server.mjs');
console.log('[kill-all] stopping test-api…');
runNode('./test-api/kill-server.mjs');
console.log('[kill-all] done.');
