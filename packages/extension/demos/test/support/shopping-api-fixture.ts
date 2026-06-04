import { spawn, type ChildProcess } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as net from 'node:net';
import * as path from 'node:path';
import { compileGeneratedForSmoke } from '../generated/index.js';
import { demosRoot, demosTmpRoot } from './paths.js';
import { runDemoGenerate } from './run-demo-generate.js';

export { demosRoot };
export const shoppingApiServerPath = path.join(demosRoot, 'shopping-api/server.mjs');
export const sourceFixturePath = path.join(demosRoot, 'shopping-api.api2ai');
export const openApiFixturePath = path.join(demosRoot, 'openapi/shopping-api.openapi.yaml');
export const shoppingApiTmpRoot = demosTmpRoot;

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

export async function waitForShoppingApi(baseUrl: string, child: ChildProcess): Promise<void> {
    const deadline = Date.now() + 10_000;
    let lastError: unknown;
    while (Date.now() < deadline) {
        if (child.exitCode !== null) {
            throw new Error(`shopping-api exited before startup with code ${child.exitCode}.`);
        }
        try {
            const response = await fetch(`${baseUrl}/orders/admin`);
            if (response.status === 401) {
                return;
            }
            lastError = new Error(`HTTP ${response.status}`);
        } catch (error) {
            lastError = error;
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error(
        `shopping-api did not start in time: ${lastError instanceof Error ? lastError.message : lastError}`
    );
}

export async function stopShoppingApiProcess(child: ChildProcess | undefined): Promise<void> {
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

export type ShoppingApiGeneratedFixture = {
    fixtureRoot: string;
    generatedJsPath: string;
    stdioMcpServerPath: string;
};

export async function prepareShoppingApiGeneratedFixture(fixtureRoot: string): Promise<ShoppingApiGeneratedFixture> {
    const generatedTsPath = path.join(fixtureRoot, 'generated/tools/shopping-api-tools.ts');
    const generatedJsPath = path.join(fixtureRoot, 'generated/tools/shopping-api-tools.js');
    const stdioMcpServerPath = path.join(fixtureRoot, 'generated/cli/stdio-mcp-server.js');

    await fs.mkdir(path.join(fixtureRoot, 'openapi'), { recursive: true });
    await fs.copyFile(sourceFixturePath, path.join(fixtureRoot, 'shopping-api.api2ai'));
    await fs.copyFile(openApiFixturePath, path.join(fixtureRoot, 'openapi/shopping-api.openapi.yaml'));
    runDemoGenerate(path.join(fixtureRoot, 'shopping-api.api2ai'), generatedTsPath);
    await fs.mkdir(path.join(fixtureRoot, 'src', 'auth'), { recursive: true });
    await fs.copyFile(
        path.join(demosRoot, 'src/auth/listCustomerOrders.ts'),
        path.join(fixtureRoot, 'src/auth/listCustomerOrders.ts')
    );
    compileGeneratedForSmoke(fixtureRoot);

    return { fixtureRoot, generatedJsPath, stdioMcpServerPath };
}

export async function startShoppingApiServer(port: number): Promise<ChildProcess> {
    return spawn(process.execPath, [shoppingApiServerPath], {
        env: {
            ...process.env,
            SHOPPING_API_PORT: String(port),
            SHOPPING_API_JWT_SECRET: process.env.SHOPPING_API_JWT_SECRET ?? 'demo-shopping-api-secret'
        },
        stdio: ['ignore', 'pipe', 'pipe']
    });
}
