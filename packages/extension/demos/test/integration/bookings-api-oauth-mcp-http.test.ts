import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { ChildProcess } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {
    findFreePort,
    prepareBookingsApiGeneratedFixture,
    bookingsApiTmpRoot,
    startBookingsApiServer,
    stopBookingsApiProcess,
    waitForBookingsApi
} from '../support/bookings-api-fixture.js';
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

describe('bookings-api generated oauth-http-mcp-server (MCP OAuth HTTP)', () => {
    let bookingsApiProcess: ChildProcess | undefined;
    let idpProcess: ChildProcess | undefined;
    let oauthHostProcess: ChildProcess | undefined;
    let bookingsApiBaseUrl = '';
    let idpBaseUrl = '';
    let mcpUrl = '';
    let runRoot = '';
    let oauthHostPath = '';
    let accessToken = '';

    beforeAll(async () => {
        const apiPort = await findFreePort();
        const idpPort = await findFreePort();
        const mcpPort = await findFreePort();
        bookingsApiBaseUrl = `http://127.0.0.1:${apiPort}`;
        idpBaseUrl = `http://127.0.0.1:${idpPort}`;
        mcpUrl = `http://127.0.0.1:${mcpPort}/mcp`;

        bookingsApiProcess = await startBookingsApiServer(apiPort);
        await waitForBookingsApi(bookingsApiBaseUrl, bookingsApiProcess);

        idpProcess = startOAuthIdpServer('bookings-api/oauth-idp/server.mjs', idpPort, {
            BOOKINGS_API_OAUTH_IDP_PORT: String(idpPort)
        });
        await new Promise((r) => setTimeout(r, 300));
        accessToken = await fetchOAuthTokenFromIdp(idpBaseUrl, 'alice');

        runRoot = await fs.mkdtemp(path.join(bookingsApiTmpRoot, 'bookings-api-oauth-mcp-'));
        await prepareBookingsApiGeneratedFixture(runRoot);
        oauthHostPath = path.join(runRoot, 'generated/cli/oauth-http-mcp-server.js');
        await fs.mkdir(path.dirname(oauthHostPath), { recursive: true });
        await fs.copyFile(path.join(demosRoot, 'generated/cli/oauth-http-mcp-server.js'), oauthHostPath);

        const { spawn } = await import('node:child_process');
        oauthHostProcess = spawn(
            process.execPath,
            [
                oauthHostPath,
                path.join(runRoot, 'generated/tools/bookings-api-tools.js'),
                '--base-url-env',
                'BOOKINGS_API_BASE_URL',
                '--oauth-idp-url',
                idpBaseUrl,
                '--oauth-scope',
                'bookings-api',
                '--jwt-secret-env',
                'BOOKINGS_API_JWT_SECRET',
                '--port',
                String(mcpPort),
                '--path',
                '/mcp'
            ],
            {
                cwd: runRoot,
                env: {
                    ...process.env,
                    BOOKINGS_API_BASE_URL: bookingsApiBaseUrl,
                    BOOKINGS_API_JWT_SECRET: 'demo-bookings-api-secret'
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
        await stopBookingsApiProcess(bookingsApiProcess);
        if (runRoot) {
            await fs.rm(runRoot, { recursive: true, force: true });
        }
    });

    it('requires Bearer on initialize when module has protected/checked tools', async () => {
        const transport = new StreamableHTTPClientTransport(new URL(mcpUrl));
        const client = new Client({ name: 'oauth-http-test', version: '0.0.1' });
        await expect(client.connect(transport, { timeout: 30_000 })).rejects.toThrow();
    }, 30_000);

    it('lists tools and calls listBookings with OAuth Bearer', async () => {
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
        expect(tools.tools.map((t) => t.name)).toContain('listBookings');
        expect(tools.tools.map((t) => t.name)).toContain('listVacationRentals');

        const result = await client.callTool({ name: 'listBookings', arguments: {} }, undefined, {
            timeout: 30_000
        });
        expect(result.isError).not.toBe(true);
        await client.close();
    }, 60_000);
});

describe('bookings-api oauth-http-mcp-server (oidc JWKS validation)', () => {
    let bookingsApiProcess: ChildProcess | undefined;
    let idpProcess: ChildProcess | undefined;
    let oauthHostProcess: ChildProcess | undefined;
    let bookingsApiBaseUrl = '';
    let idpBaseUrl = '';
    let mcpUrl = '';
    let runRoot = '';
    let oauthHostPath = '';
    let accessToken = '';

    beforeAll(async () => {
        const apiPort = await findFreePort();
        const idpPort = await findFreePort();
        const mcpPort = await findFreePort();
        bookingsApiBaseUrl = `http://127.0.0.1:${apiPort}`;
        idpBaseUrl = `http://127.0.0.1:${idpPort}`;
        mcpUrl = `http://127.0.0.1:${mcpPort}/mcp`;

        bookingsApiProcess = await startBookingsApiServer(apiPort);
        await waitForBookingsApi(bookingsApiBaseUrl, bookingsApiProcess);

        idpProcess = startOAuthIdpServer('bookings-api/oauth-idp/server.mjs', idpPort, {
            BOOKINGS_API_OAUTH_IDP_PORT: String(idpPort),
            OAUTH_IDP_SIGN_ALG: 'RS256'
        });
        await new Promise((r) => setTimeout(r, 300));
        accessToken = await fetchOAuthTokenFromIdp(idpBaseUrl, 'alice');

        runRoot = await fs.mkdtemp(path.join(bookingsApiTmpRoot, 'bookings-api-oauth-mcp-oidc-'));
        await prepareBookingsApiGeneratedFixture(runRoot);
        oauthHostPath = path.join(runRoot, 'generated/cli/oauth-http-mcp-server.js');
        await fs.mkdir(path.dirname(oauthHostPath), { recursive: true });
        await fs.copyFile(path.join(demosRoot, 'generated/cli/oauth-http-mcp-server.js'), oauthHostPath);

        const { spawn } = await import('node:child_process');
        oauthHostProcess = spawn(
            process.execPath,
            [
                oauthHostPath,
                path.join(runRoot, 'generated/tools/bookings-api-tools.js'),
                '--base-url-env',
                'BOOKINGS_API_BASE_URL',
                '--oauth-idp-url',
                idpBaseUrl,
                '--oauth-scope',
                'bookings-api',
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
                    BOOKINGS_API_BASE_URL: bookingsApiBaseUrl,
                    BOOKINGS_API_JWT_SECRET: 'demo-bookings-api-secret'
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
        await stopBookingsApiProcess(bookingsApiProcess);
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
        expect(tools.tools.map((t) => t.name)).toContain('listBookings');
        await client.close();
    }, 60_000);
});
