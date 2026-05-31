import { spawn, type ChildProcess } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as net from 'node:net';
import * as path from 'node:path';
import { compileGeneratedForSmoke } from '../generated/index.js';
import { demosRoot, demosTmpRoot } from './paths.js';
import { runDemoGenerate } from './run-demo-generate.js';

export { demosRoot };
export const mockApiServerPath = path.join(demosRoot, 'mock-api/server.mjs');
export const sourceFixturePath = path.join(demosRoot, 'mock-api.api2ai');
export const openApiFixturePath = path.join(demosRoot, 'openapi/mock-api.openapi.yaml');
export const mockApiTmpRoot = demosTmpRoot;

export async function findFreePort(): Promise<number> {
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

export async function waitForMockApi(baseUrl: string, child: ChildProcess): Promise<void> {
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

export async function stopMockApiProcess(child: ChildProcess | undefined): Promise<void> {
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

export type MockApiGeneratedFixture = {
    fixtureRoot: string;
    generatedJsPath: string;
    mcpServePath: string;
};

export async function prepareMockApiGeneratedFixture(fixtureRoot: string): Promise<MockApiGeneratedFixture> {
    const generatedTsPath = path.join(fixtureRoot, 'generated/tools/mock-api-tools.ts');
    const generatedJsPath = path.join(fixtureRoot, 'generated/tools/mock-api-tools.js');
    const mcpServePath = path.join(fixtureRoot, 'generated/cli/mcp-serve.js');

    await fs.mkdir(path.join(fixtureRoot, 'openapi'), { recursive: true });
    await fs.copyFile(sourceFixturePath, path.join(fixtureRoot, 'mock-api.api2ai'));
    await fs.copyFile(openApiFixturePath, path.join(fixtureRoot, 'openapi/mock-api.openapi.yaml'));
    runDemoGenerate(path.join(fixtureRoot, 'mock-api.api2ai'), generatedTsPath);
    await fs.mkdir(path.join(fixtureRoot, 'src', 'auth'), { recursive: true });
    await fs.copyFile(
        path.join(demosRoot, 'src/auth/listCustomerOrders.ts'),
        path.join(fixtureRoot, 'src/auth/listCustomerOrders.ts')
    );
    compileGeneratedForSmoke(fixtureRoot);

    return { fixtureRoot, generatedJsPath, mcpServePath };
}

export async function startMockApiServer(port: number): Promise<ChildProcess> {
    return spawn(process.execPath, [mockApiServerPath], {
        env: {
            ...process.env,
            MOCK_API_PORT: String(port)
        },
        stdio: ['ignore', 'pipe', 'pipe']
    });
}
