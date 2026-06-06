#!/usr/bin/env node
/**
 * Demo workspace setup: kill stale processes, env from example (once), install, generate, compile, start backends + MCP hosts.
 */
import { copyFileSync, existsSync, mkdirSync, openSync } from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadDemoEnvLocal } from './load-env-local.mjs';
import { buildHostLaunch, HTTP_DEMOS, HTTP_INIT_DEMO_NAMES } from './mcp-http-demos.mjs';
import { buildOAuthHostLaunch, OAUTH_HTTP_DEMOS, OAUTH_HTTP_INIT_DEMO_NAMES } from './mcp-oauth-demos.mjs';

const demosRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const initLogDir = path.join(demosRoot, 'tmp', 'init-logs');

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

function logFileName(label) {
    return `${label.replace(/[^a-zA-Z0-9._-]+/g, '_')}.log`;
}

function detachedLogFd(label) {
    mkdirSync(initLogDir, { recursive: true });
    return openSync(path.join(initLogDir, logFileName(label)), 'a');
}

function startDetached(label, scriptPath, extraEnv = {}, logPort) {
    try {
        const logFd = detachedLogFd(label);
        const child = spawn(process.execPath, [scriptPath], {
            cwd: demosRoot,
            detached: true,
            stdio: ['ignore', logFd, logFd],
            env: { ...process.env, ...extraEnv }
        });
        child.unref();
        const portHint = logPort ? ` port ${logPort}` : '';
        console.log(`[init] ${label} started in background${portHint} (log: tmp/init-logs/${logFileName(label)}).`);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`[init] Could not start ${label}: ${message}`);
    }
}

function startNodeArgsDetached(label, args) {
    try {
        const logFd = detachedLogFd(label);
        const child = spawn(process.execPath, args, {
            cwd: demosRoot,
            detached: true,
            stdio: ['ignore', logFd, logFd],
            env: process.env
        });
        child.unref();
        console.log(`[init] ${label} started in background (log: tmp/init-logs/${logFileName(label)}).`);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`[init] Could not start ${label}: ${message}`);
    }
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
        console.warn(`[init] ${message} — check tmp/init-logs/${logFileName(label)}.log (${logHint}).`);
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

    const bookingsPort = Number(process.env.BOOKINGS_API_PORT) || 3847;
    startDetached(
        'bookings-api',
        path.join(demosRoot, 'bookings-api', 'server.mjs'),
        { BOOKINGS_API_PORT: String(bookingsPort) },
        bookingsPort
    );

    const todoPort = Number(process.env.TODO_API_PORT) || 3852;
    startDetached('todo-api', path.join(demosRoot, 'todo-api', 'server.mjs'), { TODO_API_PORT: String(todoPort) }, todoPort);

    const cakesPort = Number(process.env.CAKES_API_PORT) || 3856;
    startDetached(
        'cakes-api',
        path.join(demosRoot, 'cakes-api', 'server.mjs'),
        { CAKES_API_PORT: String(cakesPort) },
        cakesPort
    );

    const idpPort = Number(process.env.BOOKINGS_OAUTH_IDP_PORT) || 3860;
    startDetached(
        'oauth-idp',
        path.join(demosRoot, 'oauth-idp', 'server.mjs'),
        { BOOKINGS_OAUTH_IDP_PORT: String(idpPort) },
        idpPort
    );

    const idpOidcPort = Number(process.env.BOOKINGS_OAUTH_IDP_OIDC_PORT) || 3861;
    const idpOidcBaseUrl = `http://127.0.0.1:${idpOidcPort}`;
    startDetached(
        'oauth-idp-oidc',
        path.join(demosRoot, 'oauth-idp', 'server.mjs'),
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
            console.warn(`[init] ${message} — check tmp/init-logs/${logFileName(label)}.log`);
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
        startNodeArgsDetached(label, args);
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
        startNodeArgsDetached(label, args);
        await waitForMcpHost(label, port, mcpUrl, demo.prerequisite ?? `missing ${demo.baseUrlEnv}, IdP, or backend`);
    }

    console.log('[init] Done. Cursor Settings → Tools & MCPs: enable servers, then reload MCP.');
}

main().catch((error) => {
    console.error('[init] failed:', error instanceof Error ? error.message : error);
    process.exit(1);
});
