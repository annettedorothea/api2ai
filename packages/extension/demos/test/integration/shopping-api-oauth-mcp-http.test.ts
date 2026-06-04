import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { ChildProcess } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {
    findFreePort,
    prepareShoppingApiGeneratedFixture,
    shoppingApiTmpRoot,
    startShoppingApiServer,
    stopShoppingApiProcess,
    waitForShoppingApi
} from '../support/shopping-api-fixture.js';
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

describe('shopping-api generated oauth-http-mcp-server (MCP OAuth HTTP)', () => {
    let shoppingApiProcess: ChildProcess | undefined;
    let idpProcess: ChildProcess | undefined;
    let oauthHostProcess: ChildProcess | undefined;
    let shoppingApiBaseUrl = '';
    let idpBaseUrl = '';
    let mcpUrl = '';
    let runRoot = '';
    let oauthHostPath = '';
    let accessToken = '';

    beforeAll(async () => {
        const apiPort = await findFreePort();
        const idpPort = await findFreePort();
        const mcpPort = await findFreePort();
        shoppingApiBaseUrl = `http://127.0.0.1:${apiPort}`;
        idpBaseUrl = `http://127.0.0.1:${idpPort}`;
        mcpUrl = `http://127.0.0.1:${mcpPort}/mcp`;

        shoppingApiProcess = await startShoppingApiServer(apiPort);
        await waitForShoppingApi(shoppingApiBaseUrl, shoppingApiProcess);

        idpProcess = startOAuthIdpServer('shopping-api/oauth-idp/server.mjs', idpPort, {
            SHOPPING_API_OAUTH_IDP_PORT: String(idpPort)
        });
        await new Promise((r) => setTimeout(r, 300));
        accessToken = await fetchOAuthTokenFromIdp(idpBaseUrl, 'alice');

        runRoot = await fs.mkdtemp(path.join(shoppingApiTmpRoot, 'shopping-api-oauth-mcp-'));
        await prepareShoppingApiGeneratedFixture(runRoot);
        oauthHostPath = path.join(runRoot, 'generated/cli/oauth-http-mcp-server.js');
        await fs.mkdir(path.dirname(oauthHostPath), { recursive: true });
        await fs.copyFile(path.join(demosRoot, 'generated/cli/oauth-http-mcp-server.js'), oauthHostPath);

        const { spawn } = await import('node:child_process');
        oauthHostProcess = spawn(
            process.execPath,
            [
                oauthHostPath,
                path.join(runRoot, 'generated/tools/shopping-api-tools.js'),
                '--base-url-env',
                'SHOPPING_API_BASE_URL',
                '--oauth-idp-url',
                idpBaseUrl,
                '--oauth-scope',
                'shopping-api',
                '--jwt-secret-env',
                'SHOPPING_API_JWT_SECRET',
                '--port',
                String(mcpPort),
                '--path',
                '/mcp'
            ],
            {
                cwd: runRoot,
                env: {
                    ...process.env,
                    SHOPPING_API_BASE_URL: shoppingApiBaseUrl,
                    SHOPPING_API_JWT_SECRET: 'demo-shopping-api-secret'
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
        await stopShoppingApiProcess(shoppingApiProcess);
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

describe('shopping-api oauth-http-mcp-server (oidc JWKS validation)', () => {
    let shoppingApiProcess: ChildProcess | undefined;
    let idpProcess: ChildProcess | undefined;
    let oauthHostProcess: ChildProcess | undefined;
    let shoppingApiBaseUrl = '';
    let idpBaseUrl = '';
    let mcpUrl = '';
    let runRoot = '';
    let oauthHostPath = '';
    let accessToken = '';

    beforeAll(async () => {
        const apiPort = await findFreePort();
        const idpPort = await findFreePort();
        const mcpPort = await findFreePort();
        shoppingApiBaseUrl = `http://127.0.0.1:${apiPort}`;
        idpBaseUrl = `http://127.0.0.1:${idpPort}`;
        mcpUrl = `http://127.0.0.1:${mcpPort}/mcp`;

        shoppingApiProcess = await startShoppingApiServer(apiPort);
        await waitForShoppingApi(shoppingApiBaseUrl, shoppingApiProcess);

        idpProcess = startOAuthIdpServer('shopping-api/oauth-idp/server.mjs', idpPort, {
            SHOPPING_API_OAUTH_IDP_PORT: String(idpPort),
            OAUTH_IDP_SIGN_ALG: 'RS256'
        });
        await new Promise((r) => setTimeout(r, 300));
        accessToken = await fetchOAuthTokenFromIdp(idpBaseUrl, 'alice');

        runRoot = await fs.mkdtemp(path.join(shoppingApiTmpRoot, 'shopping-api-oauth-mcp-oidc-'));
        await prepareShoppingApiGeneratedFixture(runRoot);
        oauthHostPath = path.join(runRoot, 'generated/cli/oauth-http-mcp-server.js');
        await fs.mkdir(path.dirname(oauthHostPath), { recursive: true });
        await fs.copyFile(path.join(demosRoot, 'generated/cli/oauth-http-mcp-server.js'), oauthHostPath);

        const { spawn } = await import('node:child_process');
        oauthHostProcess = spawn(
            process.execPath,
            [
                oauthHostPath,
                path.join(runRoot, 'generated/tools/shopping-api-tools.js'),
                '--base-url-env',
                'SHOPPING_API_BASE_URL',
                '--oauth-idp-url',
                idpBaseUrl,
                '--oauth-scope',
                'shopping-api',
                '--oauth-token-validation',
                'oidc',
                '--oauth-issuer',
                idpBaseUrl,
                '--port',
                String(mcpPort),
                '--path',
                '/mcp'
            ],
            {
                cwd: runRoot,
                env: {
                    ...process.env,
                    SHOPPING_API_BASE_URL: shoppingApiBaseUrl,
                    SHOPPING_API_JWT_SECRET: 'demo-shopping-api-secret'
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
        await stopShoppingApiProcess(shoppingApiProcess);
        if (runRoot) {
            await fs.rm(runRoot, { recursive: true, force: true });
        }
    });

    it('connects with RS256 Bearer when MCP host uses oidc JWKS validation', async () => {
        const transport = new StreamableHTTPClientTransport(new URL(mcpUrl), {
            requestInit: {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        });
        const client = new Client({ name: 'oauth-http-oidc-test', version: '0.0.1' });
        await client.connect(transport, { timeout: 30_000 });
        const tools = await client.listTools(undefined, { timeout: 30_000 });
        expect(tools.tools.map((t) => t.name)).toContain('listCustomerOrders');
        await client.close();
    }, 60_000);
});
