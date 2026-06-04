import { execSync } from 'node:child_process';
import { asRecord, credentialWithOptionalJwt, readGeneratedToolModule, restoreEnv } from '../generated/index.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { ChildProcess } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
    demosRoot,
    findFreePort,
    prepareShoppingApiGeneratedFixture,
    shoppingApiTmpRoot,
    startShoppingApiServer,
    stopShoppingApiProcess,
    waitForShoppingApi
} from '../support/shopping-api-fixture.js';

let shoppingApiProcess: ChildProcess | undefined;
let shoppingApiBaseUrl = '';

describe('shopping-api generated module direct invocation', () => {
    beforeAll(async () => {
        const port = await findFreePort();
        shoppingApiBaseUrl = `http://127.0.0.1:${port}`;
        shoppingApiProcess = await startShoppingApiServer(port);
        await waitForShoppingApi(shoppingApiBaseUrl, shoppingApiProcess);
    }, 15_000);

    afterAll(async () => {
        await stopShoppingApiProcess(shoppingApiProcess);
    });

    it('invokes listCustomerOrders with a minted JWT', async () => {
        const runRoot = await fs.mkdtemp(path.join(shoppingApiTmpRoot, 'shopping-api-direct-'));
        const fixtureRoot = path.join(runRoot, 'fixture');
        const baseUrlEnv = 'MCP_HOST_BASE_URL';
        const credentialEnv = 'MCP_HOST_CREDENTIAL';
        const previousBaseUrl = process.env[baseUrlEnv];
        const previousCredential = process.env[credentialEnv];

        try {
            const { generatedJsPath } = await prepareShoppingApiGeneratedFixture(fixtureRoot);
            const imported = await import(`${pathToFileURL(generatedJsPath).href}?t=${Date.now()}`);
            const generated = readGeneratedToolModule(imported as Record<string, unknown>);

            const accessToken = execSync(`node ${path.join(demosRoot, 'shopping-api/get-token.mjs')} alice`, {
                encoding: 'utf8'
            }).trim();
            expect(accessToken.length).toBeGreaterThan(20);

            process.env[baseUrlEnv] = shoppingApiBaseUrl;
            process.env[credentialEnv] = accessToken;

            const ordersResult = asRecord(
                await generated.invokeTool(
                    'listCustomerOrders',
                    { pathParams: { customerId: 'alice' } },
                    { baseUrl: shoppingApiBaseUrl, ...credentialWithOptionalJwt(accessToken) }
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
