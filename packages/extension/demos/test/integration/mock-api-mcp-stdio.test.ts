import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { ChildProcess } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { withMcpStdioSession } from '../support/mcp-stdio-smoke.js';
import {
    findFreePort,
    mockApiTmpRoot,
    prepareMockApiGeneratedFixture,
    startMockApiServer,
    stopMockApiProcess,
    waitForMockApi
} from '../support/mock-api-fixture.js';

const baseUrlEnv = 'MOCK_API_BASE_URL';
const hostArgs = ['--base-url-env', baseUrlEnv, '--auth-env', 'MOCK_API_ACCESS_TOKEN'];

describe('mock API generated mcp-serve (MCP stdio)', () => {
    let mockApiProcess: ChildProcess | undefined;
    let mockApiBaseUrl = '';
    let runRoot = '';
    let fixtureRoot = '';
    let mcpServePath = '';
    let generatedJsPath = '';

    beforeAll(async () => {
        const port = await findFreePort();
        mockApiBaseUrl = `http://127.0.0.1:${port}`;
        mockApiProcess = await startMockApiServer(port);
        await waitForMockApi(mockApiBaseUrl, mockApiProcess);

        runRoot = await fs.mkdtemp(path.join(mockApiTmpRoot, 'mock-api-mcp-'));
        fixtureRoot = path.join(runRoot, 'fixture');
        await fs.mkdir(fixtureRoot, { recursive: true });

        const fixture = await prepareMockApiGeneratedFixture(fixtureRoot);
        mcpServePath = fixture.mcpServePath;
        generatedJsPath = fixture.generatedJsPath;
    }, 30_000);

    afterAll(async () => {
        await stopMockApiProcess(mockApiProcess);
        if (runRoot) {
            await fs.rm(runRoot, { recursive: true, force: true });
        }
    });

    function mcpConnectOptions() {
        return {
            mcpServePath,
            generatedModulePath: generatedJsPath,
            hostArgs,
            cwd: fixtureRoot,
            env: {
                [baseUrlEnv]: mockApiBaseUrl
            }
        };
    }

    it('lists tools via MCP stdio (listTools)', async () => {
        await withMcpStdioSession(mcpConnectOptions(), async (session) => {
            const toolNames = await session.listToolNames();
            expect(toolNames).toContain('login');
            expect(toolNames).toContain('listCustomerOrders');
        });
    });

    it('calls login via MCP stdio (callTool)', async () => {
        await withMcpStdioSession(mcpConnectOptions(), async (session) => {
            const response = await session.callTool('login', {
                pathParams: {
                    customerId: 'alice'
                }
            });
            expect(response).toMatchObject({
                access_token: expect.any(String)
            });
        });
    });
});
