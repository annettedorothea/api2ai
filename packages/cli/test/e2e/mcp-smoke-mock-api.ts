import { runMcpStdioSmoke } from '@core2ai/mcp-host';
import { spawn, type ChildProcess } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as net from 'node:net';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateAction } from '../../src/generate-command.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliRoot = path.resolve(__dirname, '../../..');
const workspaceRoot = path.resolve(cliRoot, '../..');
const demosRoot = path.join(workspaceRoot, 'packages/extension/demos');
const mockApiServerPath = path.join(demosRoot, 'mock-api/server.mjs');
const sourceFixturePath = path.join(demosRoot, 'mock-api.api2ai');
const openApiFixturePath = path.join(demosRoot, 'openapi/mock-api.openapi.yaml');
const tmpRoot = path.join(cliRoot, 'tmp');

let mockApiProcess: ChildProcess | undefined;

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
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error(`Expected object JSON response, got ${typeof value}.`);
    }
    return value as Record<string, unknown>;
}

export async function runMockApiMcpSmoke(): Promise<void> {
    const port = await findFreePort();
    const mockApiBaseUrl = `http://127.0.0.1:${port}`;
    const runRoot = await fs.mkdtemp(path.join(tmpRoot, 'mock-api-mcp-'));
    const fixtureRoot = path.join(runRoot, 'fixture');
    const generatedTsPath = path.join(runRoot, 'generated/tools/mock-api-tools.ts');
    const generatedJsPath = path.join(runRoot, 'generated/tools/mock-api-tools.mjs');
    const mcpServePath = path.join(runRoot, 'generated/cli/mcp-serve.mjs');
    const baseUrlEnv = 'MOCK_API_BASE_URL';
    const credentialEnv = 'MOCK_API_ACCESS_TOKEN';

    try {
        mockApiProcess = spawn(process.execPath, [mockApiServerPath], {
            env: {
                ...process.env,
                MOCK_API_PORT: String(port)
            },
            stdio: ['ignore', 'pipe', 'pipe']
        });
        await waitForMockApi(mockApiBaseUrl, mockApiProcess);

        await fs.mkdir(path.join(fixtureRoot, 'openapi'), { recursive: true });
        await fs.copyFile(sourceFixturePath, path.join(fixtureRoot, 'mock-api.api2ai'));
        await fs.copyFile(openApiFixturePath, path.join(fixtureRoot, 'openapi/mock-api.openapi.yaml'));
        await generateAction(path.join(fixtureRoot, 'mock-api.api2ai'), generatedTsPath);

        const smoke = await runMcpStdioSmoke({
            mcpServePath,
            generatedModulePath: generatedJsPath,
            toolName: 'login',
            toolArgs: {
                pathParams: {
                    customerId: 'alice'
                }
            },
            hostArgs: ['--base-url-env', baseUrlEnv, '--auth-env', credentialEnv],
            cwd: runRoot,
            env: {
                [baseUrlEnv]: mockApiBaseUrl,
                [credentialEnv]: 'unused-for-public-login'
            }
        });

        const response = asRecord(smoke.responseJson);
        if (typeof response.access_token !== 'string' || response.access_token.length === 0) {
            throw new Error('MCP mock API login did not return access_token.');
        }
        console.log(`MCP mock API smoke passed. Tools: ${smoke.toolNames.join(', ')}`);
    } finally {
        await stopMockApi();
        await fs.rm(runRoot, { recursive: true, force: true });
    }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    runMockApiMcpSmoke().catch((error) => {
        console.error(error instanceof Error ? error.stack : String(error));
        process.exit(1);
    });
}
