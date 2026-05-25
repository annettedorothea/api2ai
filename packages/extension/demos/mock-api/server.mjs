#!/usr/bin/env node
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { mintCustomerToken, verifyJwt } from './jwt.mjs';

const PORT = Number(process.env.MOCK_API_PORT) || 3847;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ordersByCustomer = JSON.parse(readFileSync(path.join(__dirname, 'data', 'orders.json'), 'utf8'));

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

function handleLogin(res, customerId) {
    if (!ordersByCustomer[customerId]) {
        sendJson(res, 404, { error: 'unknown_customer', customerId });
        return;
    }
    sendJson(res, 200, { access_token: mintCustomerToken(customerId) });
}

const server = createServer((req, res) => {
    const url = new URL(req.url ?? '/', `http://127.0.0.1:${PORT}`);
    const method = req.method ?? 'GET';

    const login = matchPath(url.pathname, '/login/{customerId}');
    if (login && (method === 'GET' || method === 'POST')) {
        handleLogin(res, login.customerId);
        return;
    }

    if (method !== 'GET') {
        sendJson(res, 405, { error: 'method_not_allowed' });
        return;
    }

    const orders = matchPath(url.pathname, '/orders/{customerId}');
    if (orders) {
        const token = parseBearer(req);
        if (!token) {
            sendJson(res, 401, { error: 'missing_bearer_token' });
            return;
        }
        const verified = verifyJwt(token);
        if (!verified.ok) {
            sendJson(res, 401, { error: 'invalid_token', reason: verified.error });
            return;
        }
        const claimCustomerId = verified.payload.customerId;
        if (String(claimCustomerId) !== String(orders.customerId)) {
            sendJson(res, 403, {
                error: 'customer_mismatch',
                pathCustomerId: orders.customerId,
                tokenCustomerId: claimCustomerId
            });
            return;
        }
        const list = ordersByCustomer[orders.customerId] ?? [];
        sendJson(res, 200, { customerId: orders.customerId, orders: list });
        return;
    }

    sendJson(res, 404, { error: 'not_found' });
});

server.listen(PORT, '127.0.0.1', () => {
    console.error(`[mock-api] listening on http://127.0.0.1:${PORT}`);
});
