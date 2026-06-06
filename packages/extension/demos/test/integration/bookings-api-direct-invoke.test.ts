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
    prepareBookingsApiGeneratedFixture,
    bookingsApiTmpRoot,
    startBookingsApiServer,
    stopBookingsApiProcess,
    waitForBookingsApi
} from '../support/bookings-api-fixture.js';

let bookingsApiProcess: ChildProcess | undefined;
let bookingsApiBaseUrl = '';

describe('bookings-api generated module direct invocation', () => {
    beforeAll(async () => {
        const port = await findFreePort();
        bookingsApiBaseUrl = `http://127.0.0.1:${port}`;
        bookingsApiProcess = await startBookingsApiServer(port);
        await waitForBookingsApi(bookingsApiBaseUrl, bookingsApiProcess);
    }, 15_000);

    afterAll(async () => {
        await stopBookingsApiProcess(bookingsApiProcess);
    });

    it('invokes listBookings with a minted JWT', async () => {
        const runRoot = await fs.mkdtemp(path.join(bookingsApiTmpRoot, 'bookings-api-direct-'));
        const fixtureRoot = path.join(runRoot, 'fixture');
        const baseUrlEnv = 'MCP_HOST_BASE_URL';
        const credentialEnv = 'MCP_HOST_CREDENTIAL';
        const previousBaseUrl = process.env[baseUrlEnv];
        const previousCredential = process.env[credentialEnv];

        try {
            const { generatedJsPath } = await prepareBookingsApiGeneratedFixture(fixtureRoot, bookingsApiBaseUrl);
            const imported = await import(`${pathToFileURL(generatedJsPath).href}?t=${Date.now()}`);
            const generated = readGeneratedToolModule(imported as Record<string, unknown>);

            const accessToken = execSync(`node ${path.join(demosRoot, 'bookings-api/get-token.mjs')} alice`, {
                encoding: 'utf8'
            }).trim();
            expect(accessToken.length).toBeGreaterThan(20);

            process.env[baseUrlEnv] = bookingsApiBaseUrl;
            process.env[credentialEnv] = accessToken;

            const bookingsResult = asRecord(
                await generated.invokeTool(
                    'listBookings',
                    { pathParams: { customerId: 'alice' } },
                    { baseUrl: bookingsApiBaseUrl, ...credentialWithOptionalJwt(accessToken) }
                )
            );
            expect(bookingsResult.customerId).toBe('alice');
            expect(bookingsResult.bookings).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ unitId: 'seeblick-loft', checkIn: '2026-07-01' }),
                    expect.objectContaining({ unitId: 'almhuette-garmisch', checkIn: '2026-05-20' })
                ])
            );
        } finally {
            restoreEnv(baseUrlEnv, previousBaseUrl);
            restoreEnv(credentialEnv, previousCredential);
            await fs.rm(runRoot, { recursive: true, force: true });
        }
    }, 30_000);

    it('invokes listVacationRentals as user without guest names in periods', async () => {
        const runRoot = await fs.mkdtemp(path.join(bookingsApiTmpRoot, 'bookings-api-direct-vr-'));
        const fixtureRoot = path.join(runRoot, 'fixture');

        try {
            const { generatedJsPath } = await prepareBookingsApiGeneratedFixture(fixtureRoot, bookingsApiBaseUrl);
            const imported = await import(`${pathToFileURL(generatedJsPath).href}?t=${Date.now()}`);
            const generated = readGeneratedToolModule(imported as Record<string, unknown>);

            const accessToken = execSync(`node ${path.join(demosRoot, 'bookings-api/get-token.mjs')} alice`, {
                encoding: 'utf8'
            }).trim();

            const rentals = asRecord(
                await generated.invokeTool(
                    'listVacationRentals',
                    {},
                    { baseUrl: bookingsApiBaseUrl, ...credentialWithOptionalJwt(accessToken) }
                )
            );
            expect(rentals.role).toBe('user');
            const units = rentals.units as Record<string, unknown>[];
            expect(units.length).toBeGreaterThan(0);
            const first = units[0];
            expect(first.periods).toBeInstanceOf(Array);
            expect(first.bookings).toBeUndefined();
            const periods = first.periods as Record<string, unknown>[];
            expect(periods.some((p) => p.status === 'occupied')).toBe(true);
        } finally {
            await fs.rm(runRoot, { recursive: true, force: true });
        }
    }, 30_000);
});
