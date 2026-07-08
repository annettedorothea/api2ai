#!/usr/bin/env node
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { verifyPortalJwt } from './jwt.mjs';
import { loggingAdapter } from '../src/utils/logging-adapter.js';

const PORT = Number(process.env.BANKING_API_PORT) || 3858;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { accounts } = JSON.parse(readFileSync(path.join(__dirname, 'data', 'accounts.json'), 'utf8'));

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

function requirePortalAuth(req, res) {
    const token = parseBearer(req);
    if (!token) {
        loggingAdapter.warn('auth rejected', { error: 'missing_bearer_token' });
        sendJson(res, 401, { error: 'missing_bearer_token' });
        return undefined;
    }
    const verified = verifyPortalJwt(token);
    if (!verified.ok) {
        loggingAdapter.warn('auth rejected', { error: 'invalid_token', reason: verified.error });
        sendJson(res, 401, { error: 'invalid_token', reason: verified.error });
        return undefined;
    }
    return verified.payload;
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

const server = createServer((req, res) => {
    const url = new URL(req.url ?? '/', `http://127.0.0.1:${PORT}`);
    const method = req.method ?? 'GET';
    loggingAdapter.debug(`${method} ${url.pathname}`);

    if (method !== 'GET') {
        sendJson(res, 405, { error: 'method_not_allowed' });
        return;
    }

    if (url.pathname === '/accounts') {
        const payload = requirePortalAuth(req, res);
        if (!payload) {
            return;
        }
        const customerId = String(payload.customerId ?? '').trim();
        const results = accounts.filter((entry) => entry.customerId === customerId);
        sendJson(res, 200, {
            customerId,
            accounts: results.map(({ accountId, label, currency }) => ({ accountId, label, currency }))
        });
        return;
    }

    const balanceParams = matchPath(url.pathname, '/accounts/{accountId}/balance');
    if (balanceParams) {
        const payload = requirePortalAuth(req, res);
        if (!payload) {
            return;
        }
        const role = String(payload.role ?? '').trim();
        const customerId = String(payload.customerId ?? '').trim();
        const account = accounts.find((entry) => entry.accountId === balanceParams.accountId);
        if (!account) {
            sendJson(res, 404, { error: 'account_not_found', accountId: balanceParams.accountId });
            return;
        }
        if (role !== 'admin' && account.customerId !== customerId) {
            sendJson(res, 403, { error: 'forbidden_account', accountId: balanceParams.accountId });
            return;
        }
        sendJson(res, 200, {
            accountId: account.accountId,
            balance: account.balance,
            currency: account.currency
        });
        return;
    }

    if (url.pathname === '/accounts/all') {
        const payload = requirePortalAuth(req, res);
        if (!payload) {
            return;
        }
        const role = String(payload.role ?? '').trim();
        if (role !== 'admin') {
            sendJson(res, 403, { error: 'admin_required' });
            return;
        }
        sendJson(res, 200, {
            role,
            accounts: accounts.map(({ accountId, customerId, label, currency, balance }) => ({
                accountId,
                customerId,
                label,
                currency,
                balance
            }))
        });
        return;
    }

    sendJson(res, 404, { error: 'not_found' });
});

server.listen(PORT, '127.0.0.1', () => {
    loggingAdapter.info('listening', { url: `http://127.0.0.1:${PORT}`, auth: 'Bearer portal JWT' });
});
