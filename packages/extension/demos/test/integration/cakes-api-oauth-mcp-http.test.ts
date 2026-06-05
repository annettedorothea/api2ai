import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { ChildProcess } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { findFreePort } from '../support/bookings-api-fixture.js';
import { fetchOAuthTokenFromIdp, startOAuthIdpServer, waitForOAuthIdp } from '../support/oauth-idp-fixture.js';
import { demosRoot, demosTmpRoot } from '../support/paths.js';

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

async function startCakesApiServer(port: number): Promise<ChildProcess> {
    const { spawn } = await import('node:child_process');
    return spawn(process.execPath, [path.join(demosRoot, 'cakes-api/server.mjs')], {
        cwd: demosRoot,
        env: { ...process.env, CAKES_API_PORT: String(port), CAKES_API_JWT_SECRET: 'demo-bookings-api-secret' },
        stdio: ['ignore', 'pipe', 'pipe']
    });
}

describe('cakes-api oauth-http-mcp-server (opaque validation)', () => {
    let cakesApiProcess: ChildProcess | undefined;
    let idpProcess: ChildProcess | undefined;
    let oauthHostProcess: ChildProcess | undefined;
    let cakesApiBaseUrl = '';
    let idpBaseUrl = '';
    let mcpUrl = '';
    let runRoot = '';
    let accessToken = '';

    beforeAll(async () => {
        const apiPort = await findFreePort();
        const idpPort = await findFreePort();
        const mcpPort = await findFreePort();
        cakesApiBaseUrl = `http://127.0.0.1:${apiPort}`;
        idpBaseUrl = `http://127.0.0.1:${idpPort}`;
        mcpUrl = `http://127.0.0.1:${mcpPort}/mcp`;

        cakesApiProcess = await startCakesApiServer(apiPort);
        await new Promise((r) => setTimeout(r, 300));

        idpProcess = startOAuthIdpServer('oauth-idp/server.mjs', idpPort, {
            BOOKINGS_OAUTH_IDP_PORT: String(idpPort)
        });
        await waitForOAuthIdp(idpBaseUrl, idpProcess);
        accessToken = await fetchOAuthTokenFromIdp(idpBaseUrl, 'alice');

        runRoot = await fs.mkdtemp(path.join(demosTmpRoot, 'cakes-api-oauth-mcp-'));
        const oauthHostPath = path.join(runRoot, 'oauth-http-mcp-server.js');
        await fs.mkdir(runRoot, { recursive: true });
        await fs.copyFile(path.join(demosRoot, 'generated/cli/oauth-http-mcp-server.js'), oauthHostPath);
        await fs.copyFile(path.join(demosRoot, 'generated/tools/cakes-tools.js'), path.join(runRoot, 'cakes-tools.js'));

        const { spawn } = await import('node:child_process');
        oauthHostProcess = spawn(
            process.execPath,
            [
                oauthHostPath,
                path.join(runRoot, 'cakes-tools.js'),
                '--base-url-env',
                'CAKES_API_BASE_URL',
                '--oauth-idp-url',
                idpBaseUrl,
                '--oauth-scope',
                'cakes-api',
                '--oauth-token-validation',
                'opaque',
                '--port',
                String(mcpPort),
                '--path',
                '/mcp'
            ],
            {
                cwd: runRoot,
                env: {
                    ...process.env,
                    CAKES_API_BASE_URL: cakesApiBaseUrl
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
        if (cakesApiProcess) {
            cakesApiProcess.kill();
        }
        if (runRoot) {
            await fs.rm(runRoot, { recursive: true, force: true });
        }
    });

    it('searchCakes finds Erdbeer recipes with opaque host and upstream JWT check', async () => {
        const transport = new StreamableHTTPClientTransport(new URL(mcpUrl), {
            requestInit: {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        });
        const client = new Client({ name: 'cakes-oauth-opaque-test', version: '0.0.1' });
        await client.connect(transport, { timeout: 30_000 });

        const tools = await client.listTools(undefined, { timeout: 30_000 });
        expect(tools.tools.map((t) => t.name)).toContain('searchCakes');

        const result = await client.callTool(
            { name: 'searchCakes', arguments: { query: { q: 'Erdbeer' } } },
            undefined,
            {
                timeout: 30_000
            }
        );
        expect(result.isError).not.toBe(true);
        await client.close();
    }, 60_000);
});
