import { readGeneratedModule } from '@core2ai/core/mcp-host';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { spawn, type ChildProcess } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as net from 'node:net';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { generateAction } from '../../src/generate-command.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, '../../../..');
const cliRoot = path.resolve(__dirname, '../..');
const demosRoot = path.join(workspaceRoot, 'packages/extension/demos');
const mockApiServerPath = path.join(demosRoot, 'mock-api/server.mjs');
const sourceFixturePath = path.join(demosRoot, 'mock-api.api2ai');
const openApiFixturePath = path.join(demosRoot, 'openapi/mock-api.openapi.yaml');
const tmpRoot = path.join(cliRoot, 'tmp');

let mockApiProcess: ChildProcess | undefined;
let mockApiBaseUrl = '';

async function findFreePort(): Promise<number> {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.once('error', reject);
        server.listen(0, '127.0.0.1', () => {
            const address = server.address();
            if (!address || typeof address === 'string') {
                server.close(() => reject(new Error('Unable to allocate a free local port.')));
                return;
            }
            const port = address.port;
            server.close(() => resolve(port));
        });
    });
}

async function waitForMockApi(baseUrl: string, child: ChildProcess): Promise<void> {
    const deadline = Date.now() + 10_000;
    let lastError: unknown;
    while (Date.now() < deadline) {
        if (child.exitCode !== null) {
            throw new Error(`Mock API exited before startup with code ${child.exitCode}.`);
        }
        try {
            const response = await fetch(`${baseUrl}/login/alice`, { method: 'POST' });
            if (response.ok) {
                return;
            }
            lastError = new Error(`HTTP ${response.status}`);
        } catch (error) {
            lastError = error;
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error(`Mock API did not start in time: ${lastError instanceof Error ? lastError.message : lastError}`);
}

async function stopMockApi(): Promise<void> {
    const child = mockApiProcess;
    if (!child || child.exitCode !== null) {
        return;
    }
    await new Promise<void>((resolve) => {
        const timeout = setTimeout(resolve, 1_000);
        child.once('close', () => {
            clearTimeout(timeout);
            resolve();
        });
        child.kill();
    });
}

function asRecord(value: unknown): Record<string, unknown> {
    expect(value).toBeTypeOf('object');
    expect(value).not.toBeNull();
    return value as Record<string, unknown>;
}

function restoreEnv(name: string, previousValue: string | undefined): void {
    if (previousValue === undefined) {
        delete process.env[name];
        return;
    }
    process.env[name] = previousValue;
}

describe('mock API generated module direct invocation', () => {
    beforeAll(async () => {
        const port = await findFreePort();
        mockApiBaseUrl = `http://127.0.0.1:${port}`;
        mockApiProcess = spawn(process.execPath, [mockApiServerPath], {
            env: {
                ...process.env,
                MOCK_API_PORT: String(port)
            },
            stdio: ['ignore', 'pipe', 'pipe']
        });
        await waitForMockApi(mockApiBaseUrl, mockApiProcess);
    }, 15_000);

    afterAll(async () => {
        await stopMockApi();
    });

    it('generates mock API tools and invokes public and authenticated calls', async () => {
        const runRoot = await fs.mkdtemp(path.join(tmpRoot, 'mock-api-direct-'));
        const fixtureRoot = path.join(runRoot, 'fixture');
        const generatedTsPath = path.join(runRoot, 'generated/tools/mock-api-tools.ts');
        const generatedJsPath = path.join(runRoot, 'generated/tools/mock-api-tools.mjs');
        const baseUrlEnv = 'MCP_HOST_BASE_URL';
        const credentialEnv = 'MCP_HOST_CREDENTIAL';
        const previousBaseUrl = process.env[baseUrlEnv];
        const previousCredential = process.env[credentialEnv];

        try {
            await fs.mkdir(path.join(fixtureRoot, 'openapi'), { recursive: true });
            await fs.copyFile(sourceFixturePath, path.join(fixtureRoot, 'mock-api.api2ai'));
            await fs.copyFile(openApiFixturePath, path.join(fixtureRoot, 'openapi/mock-api.openapi.yaml'));

            await generateAction(path.join(fixtureRoot, 'mock-api.api2ai'), generatedTsPath);
            const imported = await import(`${pathToFileURL(generatedJsPath).href}?t=${Date.now()}`);
            const generated = readGeneratedModule(imported as Record<string, unknown>);

            const loginResult = asRecord(
                await generated.invokeTool(
                    'login',
                    { pathParams: { customerId: 'alice' } },
                    { baseUrl: mockApiBaseUrl }
                )
            );
            const accessToken = loginResult.access_token;
            expect(accessToken).toBeTypeOf('string');

            process.env[baseUrlEnv] = mockApiBaseUrl;
            process.env[credentialEnv] = String(accessToken);
            generated.adapter.configureFromArgv(
                ['--base-url-env', baseUrlEnv, '--auth-env', credentialEnv],
                [fixtureRoot]
            );
            generated.adapter.validateAtStartup(generated.requiresAuth === true);

            const ordersResult = asRecord(
                await generated.invokeTool('listCustomerOrders', {}, generated.adapter.resolveHostContext())
            );
            expect(ordersResult.customerId).toBe('alice');
            expect(ordersResult.orders).toEqual([
                { orderId: 'ord-alice-1', product: 'Widget A', amount: 29.99 },
                { orderId: 'ord-alice-2', product: 'Widget B', amount: 49.5 }
            ]);
        } finally {
            restoreEnv(baseUrlEnv, previousBaseUrl);
            restoreEnv(credentialEnv, previousCredential);
            await fs.rm(runRoot, { recursive: true, force: true });
        }
    }, 30_000);
});
