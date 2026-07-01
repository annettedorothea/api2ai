#!/usr/bin/env node
/**
 * Start one demo MCP host (optional) and open MCP Inspector (Streamable HTTP).
 *
 * Usage:
 *   node scripts/mcp-inspect.mjs <demo-name> [--no-start] [--with-deps]
 *
 * Examples:
 *   npm run mcp:inspect -- open-meteo
 *   npm run mcp:inspect -- todo --with-deps
 *   npm run mcp:inspect -- todo --no-start
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadProjectEnvLocal } from './generated/load-env-local.mjs';
import { requireEnvInt } from './generated/require-env.mjs';
import { buildHostLaunch, HTTP_DEMOS, HTTP_DEMO_NAMES } from './mcp-http-demos.mjs';
import { buildOAuthHostLaunch, OAUTH_HTTP_DEMOS, OAUTH_HTTP_DEMO_NAMES } from './mcp-oauth-demos.mjs';

const demosRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** @type {import('node:child_process').ChildProcess[]} */
const serviceChildren = [];

const ALL_DEMO_NAMES = [...HTTP_DEMO_NAMES, ...OAUTH_HTTP_DEMO_NAMES];

function usage() {
    console.error(`Usage: node scripts/mcp-inspect.mjs <${ALL_DEMO_NAMES.join('|')}> [--no-start] [--with-deps]`);
    process.exit(1);
}

function parseArgs(argv) {
    const positional = [];
    let noStart = false;
    let withDeps = false;
    for (const arg of argv) {
        if (arg === '--no-start') {
            noStart = true;
        } else if (arg === '--with-deps') {
            withDeps = true;
        } else if (arg.startsWith('-')) {
            console.error(`[mcp:inspect] unknown option: ${arg}`);
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
    return { demoName, noStart, withDeps };
}

function requireProjectEnv() {
    const envPath = path.join(demosRoot, '.env');
    if (!existsSync(envPath)) {
        console.error('[mcp:inspect] Missing .env in demo workspace.');
        process.exit(1);
    }
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

function startBackground(label, argv, extraEnv = {}) {
    const env = { ...process.env, ...extraEnv, LOG_SERVICE_PREFIX: label, LOG_LEVEL: 'debug' };
    const child = spawn(process.execPath, argv, {
        cwd: demosRoot,
        stdio: 'ignore',
        env
    });
    serviceChildren.push(child);
    console.log(`[mcp:inspect] ${label} started (pid ${child.pid ?? '?'})`);
    return child;
}

async function waitForTcpListen(port, { timeoutMs = 20_000, intervalMs = 200, label = `port ${port}` } = {}) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        try {
            const raw = spawnSync('lsof', ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN', '-t'], { encoding: 'utf8' });
            if (raw.status === 0 && raw.stdout.trim().length > 0) {
                return;
            }
        } catch {
            /* retry */
        }
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
    throw new Error(`Timed out waiting for TCP listener on ${label}`);
}

async function waitForHttpOk(url, { timeoutMs = 20_000, intervalMs = 200, label = url } = {}) {
    const deadline = Date.now() + timeoutMs;
    let lastError = 'unknown';
    while (Date.now() < deadline) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                return;
            }
            lastError = `HTTP ${response.status}`;
        } catch (error) {
            lastError = error instanceof Error ? error.message : String(error);
        }
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
    throw new Error(`Timed out waiting for ${label} (${lastError})`);
}

/**
 * @param {string} demoName
 */
async function startDeps(demoName) {
    if (demoName === 'todo') {
        const port = requireEnvInt('TODO_API_PORT');
        startBackground('todo-api', [path.join(demosRoot, 'todo-api', 'server.mjs')], {
            TODO_API_PORT: String(port)
        });
        await waitForTcpListen(port, { label: 'todo-api' });
        return;
    }

    if (demoName === 'bookings') {
        const bookingsPort = requireEnvInt('BOOKINGS_API_PORT');
        const idpPort = requireEnvInt('BOOKINGS_OAUTH_IDP_OIDC_PORT');
        const idpBaseUrl = `http://127.0.0.1:${idpPort}`;
        startBackground('bookings', [path.join(demosRoot, 'bookings', 'server.mjs')], {
            BOOKINGS_API_PORT: String(bookingsPort)
        });
        startBackground('oauth-idp-oidc', [path.join(demosRoot, 'oauth-idp', 'server.mjs')], {
            BOOKINGS_OAUTH_IDP_PORT: String(idpPort),
            OAUTH_IDP_SIGN_ALG: 'RS256'
        });
        await waitForTcpListen(bookingsPort, { label: 'bookings' });
        await waitForHttpOk(`${idpBaseUrl}/.well-known/openid-configuration`, {
            label: 'oauth-idp-oidc openid-configuration'
        });
        return;
    }

    if (demoName === 'cakes') {
        const cakesPort = requireEnvInt('CAKES_API_PORT');
        const idpPort = requireEnvInt('BOOKINGS_OAUTH_IDP_PORT');
        startBackground('cakes-api', [path.join(demosRoot, 'cakes-api', 'server.mjs')], {
            CAKES_API_PORT: String(cakesPort)
        });
        startBackground('oauth-idp', [path.join(demosRoot, 'oauth-idp', 'server.mjs')], {
            BOOKINGS_OAUTH_IDP_PORT: String(idpPort)
        });
        await waitForTcpListen(cakesPort, { label: 'cakes-api' });
        await waitForTcpListen(idpPort, { label: 'oauth-idp' });
        return;
    }

    if (demoName === 'banking') {
        const bankingPort = requireEnvInt('BANKING_API_PORT');
        const idpPort = requireEnvInt('ENTERPRISE_IDP_PORT');
        const idpBaseUrl = `http://127.0.0.1:${idpPort}`;
        startBackground('banking-api', [path.join(demosRoot, 'banking-api', 'server.mjs')], {
            BANKING_API_PORT: String(bankingPort)
        });
        startBackground('enterprise-idp', [path.join(demosRoot, 'oauth-idp', 'server.mjs')], {
            BOOKINGS_OAUTH_IDP_PORT: String(idpPort),
            OAUTH_IDP_SIGN_ALG: 'RS256'
        });
        await waitForTcpListen(bankingPort, { label: 'banking-api' });
        await waitForHttpOk(`${idpBaseUrl}/.well-known/openid-configuration`, {
            label: 'enterprise-idp openid-configuration'
        });
    }
}

function needsDeps(demoName) {
    return demoName === 'todo' || OAUTH_HTTP_DEMO_NAMES.includes(demoName);
}

/**
 * @param {string} demoName
 * @param {boolean} noStart
 * @param {boolean} withDeps
 */
async function ensureHostRunning(demoName, noStart, withDeps) {
    const mcpEntry = loadMcpJsonEntry(demoName);

    if (noStart) {
        console.log(`[mcp:inspect] --no-start: connecting to ${mcpEntry.url}`);
        return mcpEntry;
    }

    if (withDeps || needsDeps(demoName)) {
        if (!withDeps && needsDeps(demoName)) {
            console.log(`[mcp:inspect] ${demoName} needs mock APIs/IDP — starting dependencies (use --with-deps explicitly next time)`);
        }
        await startDeps(demoName);
    } else {
        console.log('[mcp:inspect] tip: use --with-deps when tool calls need mock APIs (todo, bookings, …)');
    }

    let port;
    let args;
    let hostEnv = {};
    let mcpUrl;

    if (HTTP_DEMOS[demoName]) {
        ({ port, args, mcpUrl, hostEnv } = buildHostLaunch(demoName, demosRoot, process.env));
        startBackground(`mcp-http:${demoName}`, args, hostEnv);
    } else {
        ({ port, args, mcpUrl } = buildOAuthHostLaunch(demoName, demosRoot, process.env));
        startBackground(`mcp-oauth:${demoName}`, args);
    }

    await waitForTcpListen(port, { label: mcpUrl });
    console.log(`[mcp:inspect] MCP host listening at ${mcpUrl}`);

    return { ...mcpEntry, url: mcpUrl };
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

function shutdownServices() {
    for (const child of serviceChildren) {
        if (child.exitCode === null && child.pid) {
            try {
                process.kill(child.pid, 'SIGTERM');
            } catch {
                /* already gone */
            }
        }
    }
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
    const { demoName, noStart, withDeps } = parseArgs(process.argv.slice(2));
    requireProjectEnv();

    const mcpEntry = await ensureHostRunning(demoName, noStart, withDeps);
    const inspectorArgs = buildInspectorArgs(mcpEntry);

    if (mcpEntry.oauth) {
        console.warn(
            '[mcp:inspect] OAuth demo: Inspector has no Cursor Sign-in — initialize/tool calls may fail with 401. Prefer Cursor for OAuth flows.'
        );
    }

    console.log(`[mcp:inspect] opening MCP Inspector → ${mcpEntry.url}`);
    if (Object.keys(mcpEntry.headers).length > 0) {
        console.log(`[mcp:inspect] headers: ${JSON.stringify(mcpEntry.headers)}`);
    }

    const onSignal = () => {
        shutdownServices();
        process.exit(130);
    };
    process.on('SIGINT', onSignal);
    process.on('SIGTERM', onSignal);

    try {
        const code = await runInspector(inspectorArgs);
        shutdownServices();
        process.exit(code);
    } catch (error) {
        shutdownServices();
        throw error;
    }
}

main().catch((error) => {
    shutdownServices();
    const message = error instanceof Error ? error.message : String(error);
    console.error('[mcp:inspect] failed:', message);
    process.exit(1);
});
