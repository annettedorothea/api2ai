#!/usr/bin/env node
/**
 * Stop mock API backends and OAuth IdPs (MCP hosts are left running).
 */
import { prepareWorkspaceEnv, runNode } from './start-shared.mjs';

prepareWorkspaceEnv();
console.log('[kill-fixtures] stopping OAuth IDP…');
runNode('./oauth-idp/kill-server.mjs');
runNode('./oauth-idp/kill-server-oidc.mjs');
console.log('[kill-fixtures] stopping cakes-api…');
runNode('./cakes-api/kill-server.mjs');
console.log('[kill-fixtures] stopping bookings…');
runNode('./bookings/kill-server.mjs');
console.log('[kill-fixtures] stopping todo-api…');
runNode('./todo-api/kill-server.mjs');
console.log('[kill-fixtures] stopping test-api…');
runNode('./test-api/kill-server.mjs');
console.log('[kill-fixtures] stopping banking-api…');
runNode('./banking-api/kill-server.mjs');
console.log('[kill-fixtures] done.');
