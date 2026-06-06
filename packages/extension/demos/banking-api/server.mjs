#!/usr/bin/env node
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { loggingAdapter } from '../src/utils/logging-adapter.js';

const PORT = Number(process.env.BANKING_API_PORT) || 3858;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { accounts, transactions } = JSON.parse(readFileSync(path.join(__dirname, 'data', 'accounts.json'), 'utf8'));

/** Demo opaque tokens minted by src/auth/banking-tools/credentialTransform.ts (demo-api-{customerId}). */
const DEMO_API_TOKENS = new Map([
    ['demo-api-alice', { customerId: 'alice', role: 'user', active: true }],
    ['demo-api-bob', { customerId: 'bob', role: 'user', active: true }],
    ['demo-api-admin', { customerId: 'admin', role: 'admin', active: true }]
]);

function sendJson(res, status, body) {
    res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(body));
}

function parseBearer(req) {
    const h = req.headers.authorization;
    if (!h || !h.startsWith('Bearer ')) {
        return undefined;
    }
    return h.slice('Bearer '.length).trim();
}

function isJwtFormat(token) {
    return String(token).trim().split('.').length === 3;
}

function matchPath(pathname, pattern) {
    const patternParts = pattern.split('/').filter(Boolean);
    const pathParts = pathname.split('/').filter(Boolean);
    if (patternParts.length !== pathParts.length) {
        return undefined;
    }
    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
        const pp = patternParts[i];
        const vp = pathParts[i];
        if (pp.startsWith('{') && pp.endsWith('}')) {
            params[pp.slice(1, -1)] = decodeURIComponent(vp);
        } else if (pp !== vp) {
            return undefined;
        }
    }
    return params;
}

function validateDemoApiToken(token) {
    const entry = DEMO_API_TOKENS.get(token);
    if (!entry?.active) {
        return { active: false };
    }
    return entry;
}

function requireApiToken(req, res) {
    const token = parseBearer(req);
    if (!token) {
        loggingAdapter.warn('auth rejected', { error: 'missing_bearer_token' });
        sendJson(res, 401, { error: 'missing_bearer_token' });
        return undefined;
    }
    if (isJwtFormat(token)) {
        loggingAdapter.warn('auth rejected', { error: 'invalid_token_type' });
        sendJson(res, 401, {
            error: 'invalid_token_type',
            reason: 'IdP JWT not accepted — use opaque API token from credential transform module'
        });
        return undefined;
    }
    const validated = validateDemoApiToken(token);
    if (!validated.active) {
        loggingAdapter.warn('auth rejected', { error: 'invalid_token', tokenPrefix: token.slice(0, 12) });
        sendJson(res, 401, { error: 'invalid_token' });
        return undefined;
    }
    return validated;
}

const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', `http://127.0.0.1:${PORT}`);
    if (req.method !== 'GET') {
        sendJson(res, 405, { error: 'method_not_allowed' });
        return;
    }

    const accountsParams = matchPath(url.pathname, '/accounts/{customerId}');
    if (accountsParams) {
        const auth = requireApiToken(req, res);
        if (!auth) {
            return;
        }
        const customerId = accountsParams.customerId;
        const list = accounts.filter((a) => a.customerId === customerId);
        sendJson(res, 200, { customerId, role: auth.role, accounts: list });
        return;
    }

    const txParams = matchPath(url.pathname, '/accounts/{accountId}/transactions');
    if (txParams) {
        const auth = requireApiToken(req, res);
        if (!auth) {
            return;
        }
        const accountId = txParams.accountId;
        const account = accounts.find((a) => a.accountId === accountId);
        if (!account) {
            sendJson(res, 404, { error: 'account_not_found' });
            return;
        }
        sendJson(res, 200, {
            accountId,
            customerId: account.customerId,
            transactions: transactions[accountId] ?? []
        });
        return;
    }

    sendJson(res, 404, { error: 'not_found' });
});

server.listen(PORT, '127.0.0.1', () => {
    loggingAdapter.info('banking-api listening', { port: PORT });
});
