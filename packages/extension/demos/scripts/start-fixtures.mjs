#!/usr/bin/env node
/**
 * Start mock API backends and OAuth IdPs (no MCP hosts, no generate).
 *
 * Fixtures run detached (background); terminal returns when ports are ready.
 */
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
    demosRoot,
    prepareWorkspaceEnv,
    setStartLogTag,
    startLogTag,
    startService,
    waitForBackend,
    waitForHttpOk,
    waitForTcpListen
} from './start-shared.mjs';
import { requireEnvInt } from './generated/require-env.mjs';

/** @typedef {'bookings'|'todo-api'|'cakes-api'|'test-api'|'oauth-idp'|'oauth-idp-oidc'} FixtureName */

/** @type {FixtureName[]} */
export const ALL_FIXTURE_NAMES = ['bookings', 'todo-api', 'cakes-api', 'test-api', 'oauth-idp', 'oauth-idp-oidc'];

/**
 * @param {string} [logTag]
 * @param {FixtureName[]} [names]
 */
export async function startFixtures(logTag = 'start:fixtures', names = ALL_FIXTURE_NAMES) {
    setStartLogTag(logTag);
    const selected = new Set(names);

    /** @type {Array<[string, number]>} */
    const apiWaits = [];

    if (selected.has('bookings')) {
        const bookingsPort = requireEnvInt('BOOKINGS_API_PORT');
        startService(
            'bookings',
            [path.join(demosRoot, 'bookings', 'server.mjs')],
            { BOOKINGS_API_PORT: String(bookingsPort) },
            bookingsPort,
            { detached: true }
        );
        apiWaits.push(['bookings', bookingsPort]);
    }

    if (selected.has('todo-api')) {
        const todoPort = requireEnvInt('TODO_API_PORT');
        startService(
            'todo-api',
            [path.join(demosRoot, 'todo-api', 'server.mjs')],
            { TODO_API_PORT: String(todoPort) },
            todoPort,
            { detached: true }
        );
        apiWaits.push(['todo-api', todoPort]);
    }

    if (selected.has('cakes-api')) {
        const cakesPort = requireEnvInt('CAKES_API_PORT');
        startService(
            'cakes-api',
            [path.join(demosRoot, 'cakes-api', 'server.mjs')],
            { CAKES_API_PORT: String(cakesPort) },
            cakesPort,
            { detached: true }
        );
        apiWaits.push(['cakes-api', cakesPort]);
    }

    if (selected.has('test-api')) {
        const testApiPort = requireEnvInt('TEST_API_PORT');
        startService(
            'test-api',
            [path.join(demosRoot, 'test-api', 'server.mjs')],
            { TEST_API_PORT: String(testApiPort) },
            testApiPort,
            { detached: true }
        );
        apiWaits.push(['test-api', testApiPort]);
    }

    let idpPort;
    if (selected.has('oauth-idp')) {
        idpPort = requireEnvInt('BOOKINGS_OAUTH_IDP_PORT');
        startService(
            'oauth-idp',
            [path.join(demosRoot, 'oauth-idp', 'server.mjs')],
            { BOOKINGS_OAUTH_IDP_PORT: String(idpPort) },
            idpPort,
            { detached: true }
        );
    }

    let idpOidcPort;
    let idpOidcBaseUrl;
    if (selected.has('oauth-idp-oidc')) {
        idpOidcPort = requireEnvInt('BOOKINGS_OAUTH_IDP_OIDC_PORT');
        idpOidcBaseUrl = `http://127.0.0.1:${idpOidcPort}`;
        startService(
            'oauth-idp-oidc',
            [path.join(demosRoot, 'oauth-idp', 'server.mjs')],
            { BOOKINGS_OAUTH_IDP_PORT: String(idpOidcPort), OAUTH_IDP_SIGN_ALG: 'RS256' },
            idpOidcPort,
            { detached: true }
        );
    }

    if (apiWaits.length > 0) {
        console.log(`[${startLogTag}] waiting for mock API backends…`);
        for (const [label, port] of apiWaits) {
            await waitForBackend(label, port);
        }
    }

    if (idpOidcBaseUrl) {
        console.log(`[${startLogTag}] waiting for oauth-idp-oidc at ${idpOidcBaseUrl}…`);
        await waitForHttpOk(`${idpOidcBaseUrl}/.well-known/openid-configuration`, {
            label: 'oauth-idp-oidc openid-configuration'
        });
    }

    if (idpPort !== undefined) {
        await waitForTcpListen(idpPort, { label: `oauth-idp port ${idpPort}` });
    }
}

async function main() {
    prepareWorkspaceEnv();
    await startFixtures();
    console.log('[start:fixtures] fixtures ready.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
    main().catch((error) => {
        const message = error instanceof Error ? error.message : String(error);
        console.error('[start:fixtures] failed:', message);
        process.exit(1);
    });
}
