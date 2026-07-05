#!/usr/bin/env node
/**
 * Demo workspace setup: kill stale processes, env from .env.example (once), install, generate, compile,
 * start backends + MCP hosts.
 *
 * Default (npm run start): background — terminal free after setup.
 * Foreground (npm run start:foreground): logs in this terminal until Ctrl+C.
 */
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { ensureEnvFromExample } from './copy-env.mjs';
import { loadProjectEnvLocal } from './generated/load-env-local.mjs';
import { requireEnvInt } from './generated/require-env.mjs';
import { buildHostLaunch, HTTP_START_DEMO_NAMES } from './mcp-http-demos.mjs';
import { buildOAuthHostLaunch, OAUTH_HTTP_START_DEMO_NAMES } from './mcp-oauth-demos.mjs';
import { waitForForegroundServiceShutdown } from './foreground-lifecycle.mjs';
const demosRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const foreground =
    process.env.START_FOREGROUND === '1' ||
    process.env.START_FOREGROUND === 'true' ||
    process.env.START_FOREGROUND === 'yes';

/** Foreground children — stopped on Ctrl+C. */
/** @type {import('node:child_process').ChildProcess[]} */
const serviceChildren = [];

function runNpm(args) {
    const result = spawnSync('npm', args, { cwd: demosRoot, stdio: 'inherit', shell: process.platform === 'win32' });
    if (result.status !== 0) {
        process.exit(result.status ?? 1);
    }
}

function requireProjectEnv() {
    ensureEnvFromExample();
    loadProjectEnvLocal();
}

/** Short log prefix — display labels may include URL in parentheses. */
function logPrefix(label) {
    const m = label.match(/^(mcp-(?:http|oauth):[^\s(]+)/);
    if (m) {
        return m[1];
    }
    return label.split(/\s/)[0].trim();
}

function buildServiceEnv(label, extraEnv = {}) {
    const env = { ...process.env, ...extraEnv, LOG_SERVICE_PREFIX: logPrefix(label) };
    if (foreground) {
        env.LOG_LEVEL = 'debug';
    }
    return env;
}

function startService(label, argv, extraEnv = {}, logPort) {
    const env = buildServiceEnv(label, extraEnv);
    const portHint = logPort ? ` port ${logPort}` : '';
    if (foreground) {
        const child = spawn(process.execPath, argv, {
            cwd: demosRoot,
            stdio: 'inherit',
            env
        });
        serviceChildren.push(child);
        console.log(`[start] ${label} started in foreground${portHint}`);
        return;
    }
    const child = spawn(process.execPath, argv, {
        cwd: demosRoot,
        detached: true,
        stdio: 'ignore',
        env
    });
    child.unref();
    console.log(`[start] ${label} started in background${portHint}`);
}

function waitForShutdownSignal() {
    return waitForForegroundServiceShutdown({ label: 'start', serviceChildren, demosRoot });
}

async function waitForMcpHost(label, port, mcpUrl) {
    await waitForTcpListen(port, { label: mcpUrl });
    console.log(`[start] ${label} listening on port ${port}.`);
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

async function waitForTcpListen(port, { timeoutMs = 15_000, intervalMs = 200, label = `port ${port}` } = {}) {
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

async function waitForBackend(label, port) {
    await waitForTcpListen(port, { label });
    console.log(`[start] ${label} listening on port ${port}.`);
}

async function main() {
    requireProjectEnv();

    console.log('[start] stopping previous demo processes…');
    runNpm(['run', 'demo:kill-all']);

    runNpm(['install']);
    runNpm(['run', 'generate:all']);
    runNpm(['run', 'build:generated']);
    if (foreground) {
        console.log('[start] Foreground mode — LOG_LEVEL=debug for services, logs in this terminal.');
    }

    const bookingsPort = requireEnvInt('BOOKINGS_API_PORT');
    startService(
        'bookings',
        [path.join(demosRoot, 'bookings', 'server.mjs')],
        { BOOKINGS_API_PORT: String(bookingsPort) },
        bookingsPort
    );

    const todoPort = requireEnvInt('TODO_API_PORT');
    startService(
        'todo-api',
        [path.join(demosRoot, 'todo-api', 'server.mjs')],
        { TODO_API_PORT: String(todoPort) },
        todoPort
    );

    const cakesPort = requireEnvInt('CAKES_API_PORT');
    startService(
        'cakes-api',
        [path.join(demosRoot, 'cakes-api', 'server.mjs')],
        { CAKES_API_PORT: String(cakesPort) },
        cakesPort
    );

    const testApiPort = requireEnvInt('TEST_API_PORT');
    startService(
        'test-api',
        [path.join(demosRoot, 'test-api', 'server.mjs')],
        { TEST_API_PORT: String(testApiPort) },
        testApiPort
    );

    const idpPort = requireEnvInt('BOOKINGS_OAUTH_IDP_PORT');
    startService(
        'oauth-idp',
        [path.join(demosRoot, 'oauth-idp', 'server.mjs')],
        { BOOKINGS_OAUTH_IDP_PORT: String(idpPort) },
        idpPort
    );

    const idpOidcPort = requireEnvInt('BOOKINGS_OAUTH_IDP_OIDC_PORT');
    const idpOidcBaseUrl = `http://127.0.0.1:${idpOidcPort}`;
    startService(
        'oauth-idp-oidc',
        [path.join(demosRoot, 'oauth-idp', 'server.mjs')],
        { BOOKINGS_OAUTH_IDP_PORT: String(idpOidcPort), OAUTH_IDP_SIGN_ALG: 'RS256' },
        idpOidcPort
    );

    console.log('[start] waiting for mock API backends…');
    for (const [label, port] of [
        ['bookings', bookingsPort],
        ['todo-api', todoPort],
        ['cakes-api', cakesPort],
        ['test-api', testApiPort]
    ]) {
        await waitForBackend(label, port);
    }

    console.log(`[start] waiting for oauth-idp-oidc at ${idpOidcBaseUrl}…`);
    await waitForHttpOk(`${idpOidcBaseUrl}/.well-known/openid-configuration`, {
        label: 'oauth-idp-oidc openid-configuration'
    });

    await waitForTcpListen(idpPort, { label: `oauth-idp port ${idpPort}` });

    for (const name of HTTP_START_DEMO_NAMES) {
        const { port, args, mcpUrl, hostEnv } = buildHostLaunch(name, demosRoot, process.env);
        const label = `mcp-http:${name} (${mcpUrl})`;
        startService(label, args, hostEnv);
        await waitForMcpHost(label, port, mcpUrl);
    }

    for (const name of OAUTH_HTTP_START_DEMO_NAMES) {
        const { port, args, mcpUrl } = buildOAuthHostLaunch(name, demosRoot, process.env);
        const label = `mcp-oauth:${name} (${mcpUrl})`;
        startService(label, args);
        await waitForMcpHost(label, port, mcpUrl);
    }

    if (foreground) {
        console.log('[start] Setup done — services running. Cursor Settings → Tools & MCPs: enable servers, then reload MCP.');
        console.log('[start] Ctrl+C stops all demo processes started here.');
        await waitForShutdownSignal();
        return;
    }
    console.log('[start] Done. Demo services run in background (npm run demo:kill-all to stop).');
    console.log('[start] Cursor Settings → Tools & MCPs: enable servers, then reload MCP.');
    console.log('[start] Open WebUI + demos: npm run start:open-webui');
    console.log('[start] Live logs: npm run start:foreground');
}

main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[start] failed:', message);
    process.exit(1);
});
