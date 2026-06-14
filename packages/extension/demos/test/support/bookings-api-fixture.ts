import { spawn, type ChildProcess } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as net from 'node:net';
import * as path from 'node:path';
import { compileGeneratedForSmoke } from '../generated/index.js';
import { demosRoot, demosTmpRoot } from './paths.js';
import { runDemoGenerate } from './run-demo-generate.js';

export { demosRoot };
export const bookingsApiServerPath = path.join(demosRoot, 'bookings-api/server.mjs');
export const sourceFixturePath = path.join(demosRoot, 'bookings-api.api2ai');
export const openApiFixturePath = path.join(demosRoot, 'openapi/bookings-api.openapi.yaml');
export const bookingsApiTmpRoot = demosTmpRoot;

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

export async function waitForBookingsApi(baseUrl: string, child: ChildProcess): Promise<void> {
    const deadline = Date.now() + 10_000;
    let lastError: unknown;
    while (Date.now() < deadline) {
        if (child.exitCode !== null) {
            throw new Error(`bookings-api exited before startup with code ${child.exitCode}.`);
        }
        try {
            const response = await fetch(`${baseUrl}/vacation-rentals`);
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
        `bookings-api did not start in time: ${lastError instanceof Error ? lastError.message : lastError}`
    );
}

export async function stopBookingsApiProcess(child: ChildProcess | undefined): Promise<void> {
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

export type BookingsApiGeneratedFixture = {
    fixtureRoot: string;
    generatedJsPath: string;
    stdioMcpServerPath: string;
};

export async function copyLoggingAdapterStub(targetRoot: string): Promise<void> {
    await fs.mkdir(path.join(targetRoot, 'src', 'utils'), { recursive: true });
    for (const ext of ['ts', 'js'] as const) {
        await fs.copyFile(
            path.join(demosRoot, 'src', 'utils', `logging-adapter.${ext}`),
            path.join(targetRoot, 'src', 'utils', `logging-adapter.${ext}`)
        );
    }
}

export async function prepareBookingsApiGeneratedFixture(
    fixtureRoot: string,
    bookingsApiBaseUrl = process.env.BOOKINGS_API_BASE_URL ?? 'http://127.0.0.1:3847'
): Promise<BookingsApiGeneratedFixture> {
    const generatedTsPath = path.join(fixtureRoot, 'generated/tools/bookings-api-tools.ts');
    const generatedJsPath = path.join(fixtureRoot, 'generated/tools/bookings-api-tools.js');
    const stdioMcpServerPath = path.join(fixtureRoot, 'generated/cli/stdio-mcp-server.js');

    await fs.mkdir(path.join(fixtureRoot, 'openapi'), { recursive: true });
    await fs.copyFile(sourceFixturePath, path.join(fixtureRoot, 'bookings-api.api2ai'));
    await fs.copyFile(openApiFixturePath, path.join(fixtureRoot, 'openapi/bookings-api.openapi.yaml'));
    runDemoGenerate(path.join(fixtureRoot, 'bookings-api.api2ai'), generatedTsPath);
    await copyLoggingAdapterStub(fixtureRoot);
    await fs.writeFile(path.join(fixtureRoot, '.env.local'), `BOOKINGS_API_BASE_URL=${bookingsApiBaseUrl}\n`, 'utf8');
    await fs.mkdir(path.join(fixtureRoot, 'src', 'auth', 'bookings-api-tools'), { recursive: true });
    await fs.copyFile(
        path.join(demosRoot, 'src/auth/bookings-api-tools/listBookings.ts'),
        path.join(fixtureRoot, 'src/auth/bookings-api-tools/listBookings.ts')
    );
    await fs.copyFile(
        path.join(demosRoot, 'src/auth/bookings-api-tools/verifyCredential.ts'),
        path.join(fixtureRoot, 'src/auth/bookings-api-tools/verifyCredential.ts')
    );
    compileGeneratedForSmoke(fixtureRoot);

    return { fixtureRoot, generatedJsPath, stdioMcpServerPath };
}

export async function startBookingsApiServer(port: number): Promise<ChildProcess> {
    return spawn(process.execPath, [bookingsApiServerPath], {
        env: {
            ...process.env,
            BOOKINGS_API_PORT: String(port),
            BOOKINGS_API_JWT_SECRET: process.env.BOOKINGS_API_JWT_SECRET ?? 'demo-bookings-api-secret'
        },
        stdio: ['ignore', 'pipe', 'pipe']
    });
}
