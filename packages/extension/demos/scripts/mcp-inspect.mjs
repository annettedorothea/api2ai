#!/usr/bin/env node
/**
 * Open MCP Inspector for a demo HTTP host that is already running.
 *
 * Prerequisite: `npm run start:all` (or `npm run start:mcp` + mocks/IdP as needed).
 *
 * Usage:
 *   npm run mcp:inspect -- <demo-name>
 *
 * Example:
 *   npm run mcp:inspect -- open-meteo
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { ensureEnvFromExample } from './copy-env.mjs';
import { loadProjectEnvLocal } from './generated/load-env-local.mjs';
import { buildHostLaunch, HTTP_DEMOS, HTTP_DEMO_NAMES } from './mcp-http-demos.mjs';
import { buildOAuthHostLaunch, OAUTH_HTTP_DEMOS, OAUTH_HTTP_DEMO_NAMES } from './mcp-oauth-demos.mjs';

const demosRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const AUTH_BANNER = [
    '  ╭──────────────────────────────────────────────╮',
    '  │  MCP Inspector · Authentication              │',
    '  ╰──────────────────────────────────────────────╯'
].join('\n');

const INSPECTOR_REDIRECT_URL = 'http://localhost:6274/oauth/callback';
const DEMO_OAUTH_CLIENT_ID = 'mcp-demo-local';

const ALL_DEMO_NAMES = [...HTTP_DEMO_NAMES, ...OAUTH_HTTP_DEMO_NAMES];

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
        printAuthField('Missing:', needed);
        console.log('  (Inspector sets Redirect URL automatically — you cannot edit it in the UI.)');
        console.log('');
    }
}

/**
 * @param {string} label
 * @param {string} value
 */
function printAuthField(label, value) {
    const pad = ' '.repeat(Math.max(1, 16 - label.length));
    console.log(`     ${label}${pad}${value}`);
}

/**
 * @param {string} name
 * @param {string} value
 */
function printAuthHeader(name, value) {
    console.log('  Custom Headers — enable toggle, then set:');
    printAuthField('Name:', name);
    printAuthField('Value:', value);
}

/**
 * @param {{ mcpUrl: string, oauthServerUrl: string, scope: string, bearerHint: string, env?: NodeJS.ProcessEnv }} options
 */
function printOAuthBlock({ mcpUrl, oauthServerUrl, scope, bearerHint, env = process.env }) {
    console.log('  Recommended for Inspector — Custom Headers (skip OAuth UI):');
    console.log(`     ${bearerHint}`);
    printAuthField('Name:', 'Authorization');
    printAuthField('Value:', 'Bearer <token from command above>');
    console.log('');
    console.log('  Optional — OAuth 2.0 tab (browser CORS; IdP must be running):');
    printAuthField('Client ID:', DEMO_OAUTH_CLIENT_ID);
    printAuthField('Client Secret:', '(leave empty)');
    printAuthField('Server URL:', `${mcpUrl}  (Inspector connection — OAuth metadata served here)`);
    printAuthField('OAuth Server URL:', `${oauthServerUrl}  (IdP — token exchange; optional if auto-discovered)`);
    printAuthField('Scope:', scope);
    printAuthField('Redirect URL:', `${INSPECTOR_REDIRECT_URL}  (read-only in Inspector)`);
    warnIfInspectorRedirectMissing(env);
    console.log('  Note: do not use JWT secrets (e.g. BOOKINGS_API_JWT_SECRET) as Client ID.');
    console.log('');
}

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

function usage() {
    console.error(`Usage: npm run mcp:inspect -- <${ALL_DEMO_NAMES.join('|')}>`);
    console.error('Prerequisite: MCP host already running (npm run start:all or npm run start:mcp).');
    process.exit(1);
}

function parseDemoName(argv) {
    const positional = [];
    for (const arg of argv) {
        if (arg.startsWith('-')) {
            console.error(`[mcp:inspect] unknown option: ${arg} (start hosts with npm run start:all first)`);
            usage();
        } else {
            positional.push(arg);
        }
    }
    const demoName = positional[0]?.trim();
    if (!demoName || positional.length > 1) {
        usage();
    }
    if (!ALL_DEMO_NAMES.includes(demoName)) {
        console.error(`[mcp:inspect] unknown demo: ${demoName}`);
        usage();
    }
    return demoName;
}

function requireProjectEnv() {
    ensureEnvFromExample();
    loadProjectEnvLocal();
}

/**
 * @param {string} demoName
 * @returns {{ url: string, headers: Record<string, string>, oauth: boolean }}
 */
function loadMcpJsonEntry(demoName) {
    const configPath = path.join(demosRoot, '.cursor', 'mcp.json');
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    const server = config.mcpServers?.[demoName];
    if (!server?.url) {
        throw new Error(`No url for "${demoName}" in .cursor/mcp.json`);
    }
    return {
        url: server.url,
        headers: server.headers ?? {},
        oauth: Boolean(server.auth)
    };
}

function buildInspectorArgs(mcpEntry) {
    const args = [
        '-y',
        '@modelcontextprotocol/inspector',
        '--transport',
        'http',
        '--server-url',
        mcpEntry.url
    ];
    for (const [key, value] of Object.entries(mcpEntry.headers)) {
        args.push('--header', `${key}: ${value}`);
    }
    return args;
}

function runInspector(inspectorArgs) {
    return new Promise((resolve) => {
        const child = spawn('npx', inspectorArgs, {
            cwd: demosRoot,
            stdio: 'inherit',
            shell: process.platform === 'win32',
            env: process.env
        });
        child.on('exit', (code, signal) => {
            resolve(code ?? (signal ? 1 : 0));
        });
    });
}

async function main() {
    const demoName = parseDemoName(process.argv.slice(2));
    requireProjectEnv();

    const mcpEntry = loadMcpJsonEntry(demoName);
    console.log(`[mcp:inspect] connecting to ${mcpEntry.url}`);

    printMcpInspectAuthHints(demoName, process.env);

    console.log(`[mcp:inspect] opening MCP Inspector → ${mcpEntry.url}`);
    if (Object.keys(mcpEntry.headers).length > 0) {
        console.log(`[mcp:inspect] pre-filled headers (CLI): ${JSON.stringify(mcpEntry.headers)}`);
    }

    const code = await runInspector(buildInspectorArgs(mcpEntry));
    process.exit(code);
}

main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[mcp:inspect] failed:', message);
    process.exit(1);
});
