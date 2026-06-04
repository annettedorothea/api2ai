import { execSync } from 'node:child_process';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { ChildProcess } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { withMcpStdioSession } from '../generated/index.js';
import {
    demosRoot,
    findFreePort,
    prepareBookingsApiGeneratedFixture,
    bookingsApiTmpRoot,
    startBookingsApiServer,
    stopBookingsApiProcess,
    waitForBookingsApi
} from '../support/bookings-api-fixture.js';

const baseUrlEnv = 'BOOKINGS_API_BASE_URL';
const hostArgs = ['--base-url-env', baseUrlEnv, '--auth-env', 'BOOKINGS_API_ACCESS_TOKEN'];

describe('bookings-api generated stdio-mcp-server (MCP stdio)', () => {
    let bookingsApiProcess: ChildProcess | undefined;
    let bookingsApiBaseUrl = '';
    let runRoot = '';
    let fixtureRoot = '';
    let stdioMcpServerPath = '';
    let generatedJsPath = '';
    let accessToken = '';

    beforeAll(async () => {
        const port = await findFreePort();
        bookingsApiBaseUrl = `http://127.0.0.1:${port}`;
        bookingsApiProcess = await startBookingsApiServer(port);
        await waitForBookingsApi(bookingsApiBaseUrl, bookingsApiProcess);
        accessToken = execSync(`node ${path.join(demosRoot, 'bookings-api/get-token.mjs')} alice`, {
            encoding: 'utf8'
        }).trim();

        runRoot = await fs.mkdtemp(path.join(bookingsApiTmpRoot, 'bookings-api-mcp-'));
        fixtureRoot = path.join(runRoot, 'fixture');
        await fs.mkdir(fixtureRoot, { recursive: true });

        const fixture = await prepareBookingsApiGeneratedFixture(fixtureRoot);
        stdioMcpServerPath = fixture.stdioMcpServerPath;
        generatedJsPath = fixture.generatedJsPath;
    }, 30_000);

    afterAll(async () => {
        await stopBookingsApiProcess(bookingsApiProcess);
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
                [baseUrlEnv]: bookingsApiBaseUrl,
                BOOKINGS_API_ACCESS_TOKEN: accessToken
            }
        };
    }

    it('lists tools via MCP stdio (listTools)', async () => {
        await withMcpStdioSession(mcpConnectOptions(), async (session) => {
            const toolNames = await session.listToolNames();
            expect(toolNames).toContain('listBookings');
            expect(toolNames).toContain('listVacationRentals');
        });
    });

    it('calls listBookings via MCP stdio (callTool)', async () => {
        await withMcpStdioSession(mcpConnectOptions(), async (session) => {
            const response = await session.callTool('listBookings', {
                pathParams: { customerId: 'alice' }
            });
            expect(response).toMatchObject({
                customerId: 'alice',
                bookings: expect.any(Array)
            });
        });
    });
});
