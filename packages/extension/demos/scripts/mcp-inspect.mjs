#!/usr/bin/env node
/**
 * Open MCP Inspector for a demo HTTP host that is already running.
 *
 * Standard manual verify for generated HTTP MCP tools (alongside /test-all in Cursor).
 *
 * Prerequisite: `npm run start:all` (or `npm run start:mcp` + mocks/IdP as needed).
 *
 * Usage:
 *   npm run mcp:inspect -- <demo-name>
 *
 * Example:
 *   npm run mcp:inspect -- open-meteo
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ensureEnvFromExample } from './copy-env.mjs';
import { loadProjectEnvLocal } from '../generated/api2ai/scripts/load-env-local.mjs';
import {
    AUTH_BANNER,
    printAuthHeader,
    printOAuthBlock,
    runMcpInspect
} from '../generated/api2ai/scripts/mcp-inspect-lib.mjs';
import { HTTP_DEMOS, HTTP_DEMO_NAMES } from './mcp-http-demos.mjs';
import { buildOAuthHostLaunch, OAUTH_HTTP_DEMOS, OAUTH_HTTP_DEMO_NAMES } from './mcp-oauth-demos.mjs';

const demosRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ALL_DEMO_NAMES = [...HTTP_DEMO_NAMES, ...OAUTH_HTTP_DEMO_NAMES];

/**
 * @param {string} demoName
 * @param {NodeJS.ProcessEnv} env
 */
function printMcpInspectAuthHints(demoName, env = process.env) {
    console.log('');
    console.log(AUTH_BANNER);
    console.log(`  Demo: ${demoName}`);
    console.log('');

    const httpDemo = HTTP_DEMOS[demoName];
    const oauthDemo = OAUTH_HTTP_DEMOS[demoName];

    if (httpDemo && !httpDemo.authEnv && !httpDemo.authExpectedEnv && !httpDemo.mcpAuthHeaderEnv) {
        console.log('  Authentication: none (public HTTP host).');
        console.log('');
        return;
    }

    if (httpDemo?.authEnv && !httpDemo.mcpAuthHeaderEnv) {
        const envKey = httpDemo.authEnv;
        const hasSecret = Boolean(env[envKey]?.trim());
        console.log(`  Authentication: host relay — upstream credential from .env (${envKey}).`);
        console.log('  Inspector: no Custom Headers needed; ensure .env has a valid token before tool calls.');
        if (!hasSecret) {
            console.log(`  Warning: ${envKey} is empty — tool calls will fail until set.`);
        }
        console.log('');
        return;
    }

    if (demoName === 'xquik') {
        const headerName = env.XQUIK_MCP_AUTH_HEADER?.trim() || 'x-api-key';
        const apiKey = env.XQUIK_API_KEY?.trim();
        printAuthHeader(headerName, apiKey || '(set XQUIK_API_KEY in .env — optional for connect, required for tools)');
        console.log('');
        return;
    }

    if (demoName === 'todo') {
        printAuthHeader(env.TODO_MCP_AUTH_HEADER?.trim() || 'x-api-token', env.TODO_API_KEY?.trim() || 'demo-todo-api-key');
        console.log('  Must match TODO_API_KEY in .env and the mock todo-api.');
        console.log('');
        return;
    }

    if (demoName === 'bookings') {
        const oauthServerUrl = env.BOOKINGS_OAUTH_IDP_OIDC_URL?.trim() || 'http://127.0.0.1:3861';
        const { mcpUrl } = buildOAuthHostLaunch(demoName, demosRoot, env);
        printOAuthBlock({
            mcpUrl,
            oauthServerUrl,
            scope: oauthDemo?.oauthScope ?? 'bookings',
            bearerHint: `Run: node ${path.join(demosRoot, 'bookings/get-token.mjs')} alice`
        });
        return;
    }

    if (demoName === 'cakes') {
        const oauthServerUrl = env.BOOKINGS_OAUTH_IDP_URL?.trim() || 'http://127.0.0.1:3860';
        const { mcpUrl } = buildOAuthHostLaunch(demoName, demosRoot, env);
        printOAuthBlock({
            mcpUrl,
            oauthServerUrl,
            scope: oauthDemo?.oauthScope ?? 'cakes-api',
            bearerHint: `Run: node ${path.join(demosRoot, 'bookings/get-token.mjs')} alice`
        });
        return;
    }

    if (demoName === 'banking') {
        const oauthServerUrl = env.BANKING_OAUTH_IDP_URL?.trim() || 'http://127.0.0.1:3860';
        const { mcpUrl } = buildOAuthHostLaunch(demoName, demosRoot, env);
        printOAuthBlock({
            mcpUrl,
            oauthServerUrl,
            scope: oauthDemo?.oauthScope ?? 'banking',
            bearerHint: `Run: node ${path.join(demosRoot, 'banking/get-idp-token.mjs')} alice  (IdP JWT; host exchanges to portal)`
        });
        return;
    }

    console.log('  See .cursor/mcp.json and core2ai/docs/testing/mcp-inspector.md');
    console.log('');
}

runMcpInspect({
    demosRoot,
    demoNames: ALL_DEMO_NAMES,
    prepareEnv() {
        ensureEnvFromExample();
        loadProjectEnvLocal();
    },
    printAuthHints: printMcpInspectAuthHints
}).catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[mcp:inspect] failed:', message);
    process.exit(1);
});
