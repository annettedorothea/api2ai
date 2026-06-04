import { execSync } from 'node:child_process';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { ChildProcess } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { withMcpStdioSession } from '../generated/index.js';
import {
    demosRoot,
    findFreePort,
    prepareShoppingApiGeneratedFixture,
    shoppingApiTmpRoot,
    startShoppingApiServer,
    stopShoppingApiProcess,
    waitForShoppingApi
} from '../support/shopping-api-fixture.js';

const baseUrlEnv = 'SHOPPING_API_BASE_URL';
const hostArgs = ['--base-url-env', baseUrlEnv, '--auth-env', 'SHOPPING_API_ACCESS_TOKEN'];

describe('shopping-api generated stdio-mcp-server (MCP stdio)', () => {
    let shoppingApiProcess: ChildProcess | undefined;
    let shoppingApiBaseUrl = '';
    let runRoot = '';
    let fixtureRoot = '';
    let stdioMcpServerPath = '';
    let generatedJsPath = '';
    let accessToken = '';

    beforeAll(async () => {
        const port = await findFreePort();
        shoppingApiBaseUrl = `http://127.0.0.1:${port}`;
        shoppingApiProcess = await startShoppingApiServer(port);
        await waitForShoppingApi(shoppingApiBaseUrl, shoppingApiProcess);
        accessToken = execSync(`node ${path.join(demosRoot, 'shopping-api/get-token.mjs')} alice`, {
            encoding: 'utf8'
        }).trim();

        runRoot = await fs.mkdtemp(path.join(shoppingApiTmpRoot, 'shopping-api-mcp-'));
        fixtureRoot = path.join(runRoot, 'fixture');
        await fs.mkdir(fixtureRoot, { recursive: true });

        const fixture = await prepareShoppingApiGeneratedFixture(fixtureRoot);
        stdioMcpServerPath = fixture.stdioMcpServerPath;
        generatedJsPath = fixture.generatedJsPath;
    }, 30_000);

    afterAll(async () => {
        await stopShoppingApiProcess(shoppingApiProcess);
        if (runRoot) {
            await fs.rm(runRoot, { recursive: true, force: true });
        }
    });

    function mcpConnectOptions() {
        return {
            stdioMcpServerPath,
            generatedModulePath: generatedJsPath,
            hostArgs,
            cwd: fixtureRoot,
            env: {
                [baseUrlEnv]: shoppingApiBaseUrl,
                SHOPPING_API_ACCESS_TOKEN: accessToken
            }
        };
    }

    it('lists tools via MCP stdio (listTools)', async () => {
        await withMcpStdioSession(mcpConnectOptions(), async (session) => {
            const toolNames = await session.listToolNames();
            expect(toolNames).toContain('listCustomerOrders');
            expect(toolNames).not.toContain('login');
        });
    });

    it('calls listCustomerOrders via MCP stdio (callTool)', async () => {
        await withMcpStdioSession(mcpConnectOptions(), async (session) => {
            const response = await session.callTool('listCustomerOrders', {
                pathParams: { customerId: 'alice' }
            });
            expect(response).toMatchObject({
                customerId: 'alice',
                orders: expect.any(Array)
            });
        });
    });
});
