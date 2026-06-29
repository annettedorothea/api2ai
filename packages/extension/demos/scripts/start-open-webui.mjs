#!/usr/bin/env node
/**
 * Start native Open WebUI (pip) for HTTP MCP demo testing.
 * Usage: npm run open-webui
 * Full stack: npm run start:open-webui
 */
import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadProjectEnvLocal } from './generated/load-env-local.mjs';
import { requireEnvInt } from './generated/require-env.mjs';
import { HTTP_START_DEMO_NAMES, HTTP_DEMOS } from './mcp-http-demos.mjs';
import { printOpenWebUiMcpHints } from './open-webui-mcp-hints.mjs';
import { printOpenWebUiInstallHint, resolveOpenWebUiLaunch } from './open-webui-launch.mjs';

const demosRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const secretPath = path.join(demosRoot, '.open-webui-secret');
const dataDir = path.join(demosRoot, '.open-webui-data');

function probeHttp(url) {
    const result = spawnSync('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', url], {
        encoding: 'utf8'
    });
    const code = result.stdout?.trim() ?? '';
    return code && code !== '000' ? code : undefined;
}

function readOrCreateSecret() {
    if (process.env.WEBUI_SECRET_KEY?.trim()) {
        return process.env.WEBUI_SECRET_KEY.trim();
    }
    if (existsSync(secretPath)) {
        const line = readFileSync(secretPath, 'utf8').trim();
        const match = line.match(/^WEBUI_SECRET_KEY=(.+)$/);
        if (match?.[1]) {
            return match[1];
        }
    }
    const secret = randomBytes(32).toString('hex');
    writeFileSync(secretPath, `WEBUI_SECRET_KEY=${secret}\n`, 'utf8');
    console.log(`[open-webui] Created ${path.basename(secretPath)} (gitignored).`);
    return secret;
}

function warnIfMcpHostsDown(env) {
    for (const name of HTTP_START_DEMO_NAMES) {
        const port = requireEnvInt(HTTP_DEMOS[name].portEnv, env);
        const code = probeHttp(`http://127.0.0.1:${port}/mcp`);
        if (!code) {
            console.warn(`[open-webui] MCP host "${name}" (:${port}) not reachable — run npm run start first.`);
        }
    }
}

async function waitForOpenWebUi(port, timeoutMs = 300_000) {
    const url = `http://127.0.0.1:${port}/`;
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
        const code = probeHttp(url);
        if (code === '200' || code === '302' || code === '307') {
            console.log(`[open-webui] Ready at ${url} (HTTP ${code}).`);
            return;
        }
        await new Promise((resolve) => setTimeout(resolve, 3000));
        process.stdout.write('.');
    }
    console.warn('');
    console.warn(`[open-webui] Still starting after ${timeoutMs / 1000}s — check the terminal or logs.`);
}

function main() {
    loadProjectEnvLocal();

    const openWebUiPort = Number(process.env.OPEN_WEBUI_PORT ?? '3000');
    const launch = resolveOpenWebUiLaunch(openWebUiPort);
    if (!launch) {
        printOpenWebUiInstallHint();
        process.exit(1);
    }

    const existing = probeHttp(`http://127.0.0.1:${openWebUiPort}/`);
    if (existing === '200' || existing === '302' || existing === '307') {
        console.log(`[open-webui] Already listening on port ${openWebUiPort}.`);
        printOpenWebUiMcpHints(openWebUiPort, process.env);
        return;
    }

    const secret = readOrCreateSecret();
    mkdirSync(dataDir, { recursive: true });

    const env = {
        ...process.env,
        WEBUI_SECRET_KEY: secret,
        DATA_DIR: dataDir,
        OPEN_WEBUI_PORT: String(openWebUiPort)
    };

    warnIfMcpHostsDown(env);

    console.log(`[open-webui] Starting native Open WebUI on port ${openWebUiPort}…`);
    console.log(`[open-webui] Data: ${dataDir}`);

    const child = spawn(launch.command, launch.args, {
        cwd: demosRoot,
        detached: true,
        stdio: 'ignore',
        env
    });
    child.unref();

    console.log('[open-webui] Waiting for UI (first pip install can take a minute)…');

    waitForOpenWebUi(openWebUiPort)
        .then(() => {
            printOpenWebUiMcpHints(openWebUiPort, env);
        })
        .catch((error) => {
            const message = error instanceof Error ? error.message : String(error);
            console.error('[open-webui] failed:', message);
            process.exit(1);
        });
}

main();
