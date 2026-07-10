#!/usr/bin/env node
/**
 * Stop demo fixtures and MCP hosts (safe to re-run).
 */
import { prepareWorkspaceEnv, runNode } from './start-shared.mjs';

prepareWorkspaceEnv();
console.log('[kill-all] stopping MCP hosts…');
runNode('./scripts/kill-mcp-hosts.mjs');
console.log('[kill-all] stopping fixtures…');
runNode('./scripts/kill-fixtures.mjs');
console.log('[kill-all] done.');
