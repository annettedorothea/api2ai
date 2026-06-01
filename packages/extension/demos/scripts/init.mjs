#!/usr/bin/env node
/**
 * Demo workspace setup: env from example, install, generate, compile, mock-api (background).
 */
import { copyFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const demosRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

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
        return;
    }
    if (!existsSync(examplePath)) {
        console.warn(`[init] ${exampleName} missing — skip env copy.`);
        return;
    }
    copyFileSync(examplePath, targetPath);
    console.log(`[init] Created ${targetName} from ${exampleName} — edit tokens as needed.`);
}

function startMockApiDetached() {
    const port = Number(process.env.MOCK_API_PORT) || 3847;
    const serverPath = path.join(demosRoot, 'mock-api', 'server.mjs');
    try {
        const child = spawn(process.execPath, [serverPath], {
            cwd: demosRoot,
            detached: true,
            stdio: 'ignore',
            env: { ...process.env, MOCK_API_PORT: String(port) },
        });
        child.unref();
        console.log(`[init] mock-api started in background on port ${port} (stop: npm run demo:mock-api:kill).`);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`[init] Could not start mock-api: ${message}`);
    }
}

ensureEnvFromExample('.env.example', '.env.local');
runNpm(['install']);
runNpm(['run', 'generate:all']);
runNpm(['run', 'build:generated']);
startMockApiDetached();
console.log('[init] Done. Enable MCP servers in Cursor, then reload MCP after DSL or env changes.');
