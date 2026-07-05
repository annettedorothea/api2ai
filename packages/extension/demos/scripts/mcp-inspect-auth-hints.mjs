/**
 * Copy-paste auth hints for MCP Inspector (Custom Headers / OAuth 2.0 UI).
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { HTTP_DEMOS } from './mcp-http-demos.mjs';
import { OAUTH_HTTP_DEMOS, buildOAuthHostLaunch } from './mcp-oauth-demos.mjs';

const demosRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const AUTH_BANNER = [
    '  ╭──────────────────────────────────────────────╮',
    '  │  MCP Inspector · Authentication              │',
    '  ╰──────────────────────────────────────────────╯'
].join('\n');

const INSPECTOR_REDIRECT_URL = 'http://localhost:6274/oauth/callback';
const DEMO_OAUTH_CLIENT_ID = 'mcp-demo-local';

/**
 * @param {NodeJS.ProcessEnv} env
 */
function warnIfInspectorRedirectMissing(env) {
    const rules = (env.OAUTH_IDP_REDIRECT_URIS ?? '')
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean);
    const needed = INSPECTOR_REDIRECT_URL;
    const allowed = rules.some((rule) => {
        if (rule.endsWith('*')) {
            return needed.startsWith(rule.slice(0, -1));
        }
        return rule === needed;
    });
    if (!allowed) {
        console.log('  Warning: add this to OAUTH_IDP_REDIRECT_URIS in .env, then restart IdP:');
        printField('Missing:', needed);
        console.log('  (Inspector sets Redirect URL automatically — you cannot edit it in the UI.)');
        console.log('');
    }
}

/**
 * @param {string} label
 * @param {string} value
 */
function printField(label, value) {
    const pad = ' '.repeat(Math.max(1, 16 - label.length));
    console.log(`     ${label}${pad}${value}`);
}

/**
 * @param {string} name
 * @param {string} value
 */
function printHeader(name, value) {
    console.log('  Custom Headers — enable toggle, then set:');
    printField('Name:', name);
    printField('Value:', value);
}

/**
 * @param {{ mcpUrl: string, oauthServerUrl: string, scope: string, bearerHint: string, env?: NodeJS.ProcessEnv }} options
 */
function printOAuthBlock({ mcpUrl, oauthServerUrl, scope, bearerHint, env = process.env }) {
    console.log('  Recommended for Inspector — Custom Headers (skip OAuth UI):');
    console.log(`     ${bearerHint}`);
    printField('Name:', 'Authorization');
    printField('Value:', 'Bearer <token from command above>');
    console.log('');
    console.log('  Optional — OAuth 2.0 tab (browser CORS; IdP must be running):');
    printField('Client ID:', DEMO_OAUTH_CLIENT_ID);
    printField('Client Secret:', '(leave empty)');
    printField('Server URL:', `${mcpUrl}  (Inspector connection — OAuth metadata served here)`);
    printField('OAuth Server URL:', `${oauthServerUrl}  (IdP — token exchange; optional if auto-discovered)`);
    printField('Scope:', scope);
    printField('Redirect URL:', `${INSPECTOR_REDIRECT_URL}  (read-only in Inspector)`);
    warnIfInspectorRedirectMissing(env);
    console.log('  Note: do not use JWT secrets (e.g. BOOKINGS_API_JWT_SECRET) as Client ID.');
    console.log('');
}

/**
 * @param {string} demoName
 * @param {NodeJS.ProcessEnv} env
 */
export function printMcpInspectAuthHints(demoName, env = process.env) {
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
        printHeader(headerName, apiKey || '(set XQUIK_API_KEY in .env — optional for connect, required for tools)');
        console.log('');
        return;
    }

    if (demoName === 'todo') {
        printHeader(env.TODO_MCP_AUTH_HEADER?.trim() || 'x-api-token', env.TODO_API_KEY?.trim() || 'demo-todo-api-key');
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

    console.log('  See .cursor/mcp.json and core2ai/docs/testing/mcp-inspector.md');
    console.log('');
}
