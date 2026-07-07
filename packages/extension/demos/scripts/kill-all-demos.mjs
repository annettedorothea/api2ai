#!/usr/bin/env node
/**
 * Stop demo fixtures and MCP hosts (safe to re-run).
 */
import { runNode } from './start-shared.mjs';
import { loadProjectEnvLocal } from './generated/load-env-local.mjs';

loadProjectEnvLocal();
console.log('[kill-all] stopping MCP hosts…');
runNode('./scripts/kill-mcp-hosts.mjs');
console.log('[kill-all] stopping fixtures…');
runNode('./scripts/kill-fixtures.mjs');
console.log('[kill-all] done.');
