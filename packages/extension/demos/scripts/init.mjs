#!/usr/bin/env node
/**
 * Demo workspace setup: kill stale processes, env from example (once), install, generate, compile,
 * start backends + MCP hosts.
 *
 * Default (npm run init): background — terminal free after setup.
 * Foreground (npm run init:foreground): logs in this terminal until Ctrl+C.
 */
import { copyFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadDemoEnvLocal } from './load-env-local.mjs';
import { buildHostLaunch, HTTP_DEMOS, HTTP_INIT_DEMO_NAMES } from './mcp-http-demos.mjs';
import { buildOAuthHostLaunch, OAUTH_HTTP_DEMOS, OAUTH_HTTP_INIT_DEMO_NAMES } from './mcp-oauth-demos.mjs';
const demosRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const foreground =
    process.env.INIT_FOREGROUND === '1' ||
    process.env.INIT_FOREGROUND === 'true' ||
    process.env.INIT_FOREGROUND === 'yes';

/** Foreground children — stopped on Ctrl+C. */
/** @type {import('node:child_process').ChildProcess[]} */
const serviceChildren = [];

function runNpm(args) {
    const result = spawnSync('npm', args, { cwd: demosRoot, stdio: 'inherit', shell: process.platform === 'win32' });
    if (result.status !== 0) {
        process.exit(result.status ?? 1);
    }
}

function ensureEnvFromExample(exampleName, targetName) {
    const examplePath = path.join(demosRoot, exampleName);
    const targetPath = path.join(demosRoot, targetName);
    if (existsSync(targetPath)) {
        console.log(`[init] ${targetName} already exists — not overwritten.`);
        return false;
    }
    if (!existsSync(examplePath)) {
        console.warn(`[init] ${exampleName} missing — skip env copy.`);
        return false;
    }
    copyFileSync(examplePath, targetPath);
    console.log(`[init] Created ${targetName} from ${exampleName} — edit tokens as needed.`);
    return true;
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
    try {
        const env = buildServiceEnv(label, extraEnv);
        const portHint = logPort ? ` port ${logPort}` : '';
        if (foreground) {
            const child = spawn(process.execPath, argv, {
                cwd: demosRoot,
                stdio: 'inherit',
                env
            });
            serviceChildren.push(child);
            console.log(`[init] ${label} started in foreground${portHint}`);
            return;
        }
        const child = spawn(process.execPath, argv, {
            cwd: demosRoot,
            detached: true,
            stdio: 'ignore',
            env
        });
        child.unref();
        console.log(`[init] ${label} started in background${portHint}`);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`[init] Could not start ${label}: ${message}`);
    }
}

function waitForShutdownSignal() {
    return new Promise((resolve) => {
        const shutdown = (signal) => {
            console.log(`[init] ${signal} — stopping demo services…`);
            for (const child of serviceChildren) {
                if (child.pid) {
                    try {
                        process.kill(child.pid, 'SIGTERM');
                    } catch {
                        /* already exited */
                    }
                }
            }
            resolve();
        };
        process.once('SIGINT', () => shutdown('SIGINT'));
        process.once('SIGTERM', () => shutdown('SIGTERM'));
    });
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

async function waitForMcpHost(label, port, mcpUrl, logHint) {
    try {
        await waitForTcpListen(port, { label: mcpUrl });
        console.log(`[init] ${label} listening on port ${port}.`);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`[init] ${message} (${logHint})`);
    }
}

async function main() {
    console.log('[init] stopping previous demo processes…');
    runNpm(['run', 'demo:kill-all']);

    loadDemoEnvLocal();
    const createdEnv = ensureEnvFromExample('.env.example', '.env.local');
    if (createdEnv) {
        loadDemoEnvLocal();
    }

    runNpm(['install']);
    runNpm(['run', 'generate:all']);
    runNpm(['run', 'build:generated']);
    if (foreground) {
        console.log('[init] Foreground mode — LOG_LEVEL=debug for services, logs in this terminal.');
    }

    const bookingsPort = Number(process.env.BOOKINGS_API_PORT) || 3847;
    startService(
        'bookings-api',
        [path.join(demosRoot, 'bookings-api', 'server.mjs')],
        { BOOKINGS_API_PORT: String(bookingsPort) },
        bookingsPort
    );

    const todoPort = Number(process.env.TODO_API_PORT) || 3852;
    startService(
        'todo-api',
        [path.join(demosRoot, 'todo-api', 'server.mjs')],
        { TODO_API_PORT: String(todoPort) },
        todoPort
    );

    const cakesPort = Number(process.env.CAKES_API_PORT) || 3856;
    startService(
        'cakes-api',
        [path.join(demosRoot, 'cakes-api', 'server.mjs')],
        { CAKES_API_PORT: String(cakesPort) },
        cakesPort
    );

    const idpPort = Number(process.env.BOOKINGS_OAUTH_IDP_PORT) || 3860;
    startService(
        'oauth-idp',
        [path.join(demosRoot, 'oauth-idp', 'server.mjs')],
        { BOOKINGS_OAUTH_IDP_PORT: String(idpPort) },
        idpPort
    );

    const idpOidcPort = Number(process.env.BOOKINGS_OAUTH_IDP_OIDC_PORT) || 3861;
    const idpOidcBaseUrl = `http://127.0.0.1:${idpOidcPort}`;
    startService(
        'oauth-idp-oidc',
        [path.join(demosRoot, 'oauth-idp', 'server.mjs')],
        { BOOKINGS_OAUTH_IDP_PORT: String(idpOidcPort), OAUTH_IDP_SIGN_ALG: 'RS256' },
        idpOidcPort
    );

    console.log('[init] waiting for mock API backends…');
    for (const [label, port] of [
        ['bookings-api', bookingsPort],
        ['todo-api', todoPort],
        ['cakes-api', cakesPort]
    ]) {
        try {
            await waitForTcpListen(port, { label });
            console.log(`[init] ${label} listening on port ${port}.`);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn(`[init] ${message}`);
        }
    }

    console.log(`[init] waiting for oauth-idp-oidc at ${idpOidcBaseUrl}…`);
    try {
        await waitForHttpOk(`${idpOidcBaseUrl}/.well-known/openid-configuration`, {
            label: 'oauth-idp-oidc openid-configuration'
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`[init] ${message} — bookings-oauth MCP may fail JWKS startup.`);
    }

    try {
        await waitForTcpListen(idpPort, { label: `oauth-idp port ${idpPort}` });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`[init] ${message} — cakes OAuth MCP may fail if IdP is not ready.`);
    }

    for (const name of HTTP_INIT_DEMO_NAMES) {
        const demo = HTTP_DEMOS[name];
        const { port, args, mcpUrl } = buildHostLaunch(name, demosRoot, process.env);
        const label = `mcp-http:${name} (${mcpUrl})`;
        if (demo.baseUrlEnv && demo.prerequisite && !process.env[demo.baseUrlEnv]?.trim()) {
            console.warn(`[init] ${demo.baseUrlEnv} is missing — ${label} may exit before listening.`);
        }
        if (demo.authExpectedEnv && !process.env[demo.authExpectedEnv]?.trim()) {
            console.warn(`[init] ${demo.authExpectedEnv} is missing — ${label} may fail static auth validation.`);
        }
        startService(label, args);
        const logHint = demo.prerequisite ?? `set ${demo.baseUrlEnv ?? 'base URL env'}`;
        await waitForMcpHost(label, port, mcpUrl, logHint);
    }

    for (const name of OAUTH_HTTP_INIT_DEMO_NAMES) {
        const demo = OAUTH_HTTP_DEMOS[name];
        const { port, args, mcpUrl } = buildOAuthHostLaunch(name, demosRoot, process.env);
        const label = `mcp-oauth:${name} (${mcpUrl})`;
        if (demo.baseUrlEnv && !process.env[demo.baseUrlEnv]?.trim()) {
            console.warn(
                `[init] ${demo.baseUrlEnv} is missing — ${label} will exit before listening. Copy .env.example → .env.local.`
            );
        }
        startService(label, args);
        await waitForMcpHost(label, port, mcpUrl, demo.prerequisite ?? `missing ${demo.baseUrlEnv}, IdP, or backend`);
    }

    if (foreground) {
        console.log('[init] Setup done — services running. Cursor Settings → Tools & MCPs: enable servers, then reload MCP.');
        console.log('[init] Ctrl+C stops all demo processes started here.');
        await waitForShutdownSignal();
        return;
    }
    console.log('[init] Done. Demo services run in background (npm run demo:kill-all to stop).');
    console.log('[init] Cursor Settings → Tools & MCPs: enable servers, then reload MCP.');
    console.log('[init] Live logs: npm run init:foreground');
}

main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[init] failed:', message);
    process.exit(1);
});
