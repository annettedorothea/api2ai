import { readGeneratedToolModule } from '../support/generated-module.js';
import { asRecord, restoreEnv } from '@core2ai/core/test-helpers';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { ChildProcess } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
    findFreePort,
    mockApiTmpRoot,
    prepareMockApiGeneratedFixture,
    startMockApiServer,
    stopMockApiProcess,
    waitForMockApi
} from '../support/mock-api-fixture.js';

let mockApiProcess: ChildProcess | undefined;
let mockApiBaseUrl = '';

describe('mock API generated module direct invocation', () => {
    beforeAll(async () => {
        const port = await findFreePort();
        mockApiBaseUrl = `http://127.0.0.1:${port}`;
        mockApiProcess = await startMockApiServer(port);
        await waitForMockApi(mockApiBaseUrl, mockApiProcess);
    }, 15_000);

    afterAll(async () => {
        await stopMockApiProcess(mockApiProcess);
    });

    it('generates mock API tools and invokes public and authenticated calls', async () => {
        const runRoot = await fs.mkdtemp(path.join(mockApiTmpRoot, 'mock-api-direct-'));
        const fixtureRoot = path.join(runRoot, 'fixture');
        const baseUrlEnv = 'MCP_HOST_BASE_URL';
        const credentialEnv = 'MCP_HOST_CREDENTIAL';
        const previousBaseUrl = process.env[baseUrlEnv];
        const previousCredential = process.env[credentialEnv];

        try {
            const { generatedJsPath } = await prepareMockApiGeneratedFixture(fixtureRoot);
            const imported = await import(`${pathToFileURL(generatedJsPath).href}?t=${Date.now()}`);
            const generated = readGeneratedToolModule(imported as Record<string, unknown>);

            const loginResult = asRecord(
                await generated.invokeTool(
                    'login',
                    { pathParams: { customerId: 'alice' } },
                    { baseUrl: mockApiBaseUrl }
                )
            );
            const accessToken = loginResult.access_token;
            expect(accessToken).toBeTypeOf('string');

            process.env[baseUrlEnv] = mockApiBaseUrl;
            process.env[credentialEnv] = String(accessToken);
            generated.adapter.configureFromArgv(
                ['--base-url-env', baseUrlEnv, '--auth-env', credentialEnv],
                [fixtureRoot]
            );
            generated.adapter.validateAtStartup(generated.requiresAuth === true);

            const ordersResult = asRecord(
                await generated.invokeTool(
                    'listCustomerOrders',
                    { pathParams: { customerId: 'alice' } },
                    generated.adapter.resolveHostContext()
                )
            );
            expect(ordersResult.customerId).toBe('alice');
            expect(ordersResult.orders).toEqual([
                { orderId: 'ord-alice-1', product: 'Widget A', amount: 29.99 },
                { orderId: 'ord-alice-2', product: 'Widget B', amount: 49.5 }
            ]);
        } finally {
            restoreEnv(baseUrlEnv, previousBaseUrl);
            restoreEnv(credentialEnv, previousCredential);
            await fs.rm(runRoot, { recursive: true, force: true });
        }
    }, 30_000);
});
