import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { ChildProcess } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {
    findFreePort,
    mockApiTmpRoot,
    prepareMockApiGeneratedFixture,
    startMockApiServer,
    stopMockApiProcess,
    waitForMockApi
} from '../support/mock-api-fixture.js';
import { fetchOAuthTokenFromIdp, startOAuthIdpServer } from '../support/oauth-idp-fixture.js';
import { demosRoot } from '../support/paths.js';

async function waitForMcpHttp(mcpUrl: string, child: ChildProcess | undefined): Promise<void> {
    const deadline = Date.now() + 15_000;
    let lastError: unknown;
    while (Date.now() < deadline) {
        if (child?.exitCode !== null && child?.exitCode !== undefined) {
            throw new Error(`OAuth MCP host exited with code ${child.exitCode}`);
        }
        try {
            const response = await fetch(mcpUrl, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: '{}'
            });
            if (response.status < 500) {
                return;
            }
            lastError = new Error(`HTTP ${response.status}`);
        } catch (error) {
            lastError = error;
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error(
        `OAuth MCP host not ready at ${mcpUrl}: ${lastError instanceof Error ? lastError.message : String(lastError)}`
    );
}

describe('mock-api generated oauth-http-mcp-server (MCP OAuth HTTP)', () => {
    let mockApiProcess: ChildProcess | undefined;
    let idpProcess: ChildProcess | undefined;
    let oauthHostProcess: ChildProcess | undefined;
    let mockApiBaseUrl = '';
    let idpBaseUrl = '';
    let mcpUrl = '';
    let runRoot = '';
    let oauthHostPath = '';
    let accessToken = '';

    beforeAll(async () => {
        const mockPort = await findFreePort();
        const idpPort = await findFreePort();
        const mcpPort = await findFreePort();
        mockApiBaseUrl = `http://127.0.0.1:${mockPort}`;
        idpBaseUrl = `http://127.0.0.1:${idpPort}`;
        mcpUrl = `http://127.0.0.1:${mcpPort}/mcp`;

        mockApiProcess = await startMockApiServer(mockPort);
        await waitForMockApi(mockApiBaseUrl, mockApiProcess);

        idpProcess = startOAuthIdpServer('mock-api/oauth-idp/server.mjs', idpPort, {
            MOCK_API_OAUTH_IDP_PORT: String(idpPort)
        });
        await new Promise((r) => setTimeout(r, 300));
        accessToken = await fetchOAuthTokenFromIdp(idpBaseUrl, 'alice');

        runRoot = await fs.mkdtemp(path.join(mockApiTmpRoot, 'mock-api-oauth-mcp-'));
        await prepareMockApiGeneratedFixture(runRoot);
        oauthHostPath = path.join(runRoot, 'generated/cli/oauth-http-mcp-server.js');
        await fs.mkdir(path.dirname(oauthHostPath), { recursive: true });
        await fs.copyFile(path.join(demosRoot, 'generated/cli/oauth-http-mcp-server.js'), oauthHostPath);

        const { spawn } = await import('node:child_process');
        oauthHostProcess = spawn(
            process.execPath,
            [
                oauthHostPath,
                path.join(runRoot, 'generated/tools/mock-api-tools.js'),
                '--base-url-env',
                'MOCK_API_BASE_URL',
                '--oauth-idp-url',
                idpBaseUrl,
                '--jwt-secret-env',
                'MOCK_API_JWT_SECRET',
                '--port',
                String(mcpPort),
                '--path',
                '/mcp'
            ],
            {
                cwd: runRoot,
                env: {
                    ...process.env,
                    MOCK_API_BASE_URL: mockApiBaseUrl,
                    MOCK_API_JWT_SECRET: 'demo-mock-api-secret'
                },
                stdio: ['ignore', 'pipe', 'pipe']
            }
        );
        await waitForMcpHttp(mcpUrl, oauthHostProcess);
    }, 60_000);

    afterAll(async () => {
        if (oauthHostProcess) {
            oauthHostProcess.kill();
        }
        if (idpProcess) {
            idpProcess.kill();
        }
        await stopMockApiProcess(mockApiProcess);
        if (runRoot) {
            await fs.rm(runRoot, { recursive: true, force: true });
        }
    });

    it('requires Bearer on initialize when module has protected/checked tools', async () => {
        const transport = new StreamableHTTPClientTransport(new URL(mcpUrl));
        const client = new Client({ name: 'oauth-http-test', version: '0.0.1' });
        await expect(client.connect(transport, { timeout: 30_000 })).rejects.toThrow();
    }, 30_000);

    it('lists tools and calls listCustomerOrders with OAuth Bearer', async () => {
        const transport = new StreamableHTTPClientTransport(new URL(mcpUrl), {
            requestInit: {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        });
        const client = new Client({ name: 'oauth-http-test', version: '0.0.1' });
        await client.connect(transport, { timeout: 30_000 });

        const tools = await client.listTools(undefined, { timeout: 30_000 });
        expect(tools.tools.map((t) => t.name)).toContain('listCustomerOrders');

        const result = await client.callTool({ name: 'listCustomerOrders', arguments: {} }, undefined, {
            timeout: 30_000
        });
        expect(result.isError).not.toBe(true);
        await client.close();
    }, 60_000);
});
