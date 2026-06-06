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

async function startBankingApiServer(port: number): Promise<ChildProcess> {
    const { spawn } = await import('node:child_process');
    return spawn(process.execPath, [path.join(demosRoot, 'banking-api/server.mjs')], {
        cwd: demosRoot,
        env: {
            ...process.env,
            BANKING_API_PORT: String(port)
        },
        stdio: ['ignore', 'pipe', 'pipe']
    });
}

describe('banking-api oauth-http-mcp-server (opaque + credential-transform-module)', () => {
    let bankingApiProcess: ChildProcess | undefined;
    let idpProcess: ChildProcess | undefined;
    let oauthHostProcess: ChildProcess | undefined;
    let bankingApiBaseUrl = '';
    let idpBaseUrl = '';
    let mcpUrl = '';
    let runRoot = '';
    let accessToken = '';

    beforeAll(async () => {
        const apiPort = await findFreePort();
        const idpPort = await findFreePort();
        const mcpPort = await findFreePort();
        bankingApiBaseUrl = `http://127.0.0.1:${apiPort}`;
        idpBaseUrl = `http://127.0.0.1:${idpPort}`;
        mcpUrl = `http://127.0.0.1:${mcpPort}/mcp`;

        bankingApiProcess = await startBankingApiServer(apiPort);
        await new Promise((r) => setTimeout(r, 300));

        idpProcess = startOAuthIdpServer('oauth-idp/server.mjs', idpPort, {
            BOOKINGS_OAUTH_IDP_PORT: String(idpPort),
            OAUTH_IDP_SIGN_ALG: 'RS256'
        });
        await waitForOAuthIdp(idpBaseUrl, idpProcess);
        accessToken = await fetchOAuthTokenFromIdp(idpBaseUrl, 'alice');

        runRoot = await fs.mkdtemp(path.join(demosTmpRoot, 'banking-api-oauth-mcp-'));
        const oauthHostPath = path.join(runRoot, 'oauth-http-mcp-server.js');
        await fs.mkdir(runRoot, { recursive: true });
        await fs.copyFile(path.join(demosRoot, 'generated/cli/oauth-http-mcp-server.js'), oauthHostPath);
        await fs.copyFile(
            path.join(demosRoot, 'generated/tools/banking-tools.js'),
            path.join(runRoot, 'banking-tools.js')
        );
        await fs.writeFile(path.join(runRoot, '.env.local'), `BANKING_API_BASE_URL=${bankingApiBaseUrl}\n`, 'utf8');

        const { spawn } = await import('node:child_process');
        oauthHostProcess = spawn(
            process.execPath,
            [
                oauthHostPath,
                path.join(runRoot, 'banking-tools.js'),
                '--base-url-env',
                'BANKING_API_BASE_URL',
                '--oauth-idp-url',
                idpBaseUrl,
                '--oauth-scope',
                'banking-api',
                '--oauth-token-validation',
                'opaque',
                '--credential-transform-module',
                path.join(demosRoot, 'src/auth/banking-tools/credentialTransform.js'),
                '--port',
                String(mcpPort),
                '--path',
                '/mcp'
            ],
            {
                cwd: runRoot,
                env: {
                    ...process.env,
                    BANKING_API_BASE_URL: bankingApiBaseUrl
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
        if (bankingApiProcess) {
            bankingApiProcess.kill();
        }
        if (runRoot) {
            await fs.rm(runRoot, { recursive: true, force: true });
        }
    });

    it('rejects IdP JWT sent directly to banking-api', async () => {
        const response = await fetch(`${bankingApiBaseUrl}/accounts/alice`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        expect(response.status).toBe(401);
        const body = (await response.json()) as { error?: string };
        expect(body.error).toBe('invalid_token_type');
    });

    it('listAccounts returns alice accounts after token exchange', async () => {
        const transport = new StreamableHTTPClientTransport(new URL(mcpUrl), {
            requestInit: {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        });
        const client = new Client({ name: 'banking-oauth-exchange-test', version: '0.0.1' });
        await client.connect(transport, { timeout: 30_000 });

        const tools = await client.listTools(undefined, { timeout: 30_000 });
        expect(tools.tools.map((t) => t.name)).toContain('listAccounts');

        const result = await client.callTool({ name: 'listAccounts', arguments: {} }, undefined, {
            timeout: 30_000
        });
        expect(result.isError).not.toBe(true);
        const content = Array.isArray(result.content) ? result.content : [];
        const textBlock = content.find((block) => block && typeof block === 'object' && 'text' in block) as
            | { text?: string }
            | undefined;
        expect(textBlock?.text).toBeTypeOf('string');
        const parsed = JSON.parse(textBlock!.text!) as { customerId?: string; accounts?: unknown[] };
        expect(parsed.customerId).toBe('alice');
        expect(Array.isArray(parsed.accounts)).toBe(true);
        expect(parsed.accounts?.length).toBeGreaterThan(0);
        await client.close();
    }, 60_000);

    it('listTransactions returns entries for acc-alice-checking', async () => {
        const transport = new StreamableHTTPClientTransport(new URL(mcpUrl), {
            requestInit: {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        });
        const client = new Client({ name: 'banking-oauth-tx-test', version: '0.0.1' });
        await client.connect(transport, { timeout: 30_000 });

        const result = await client.callTool(
            {
                name: 'listTransactions',
                arguments: { pathParams: { accountId: 'acc-alice-checking' } }
            },
            undefined,
            { timeout: 30_000 }
        );
        expect(result.isError).not.toBe(true);
        await client.close();
    }, 60_000);
});
