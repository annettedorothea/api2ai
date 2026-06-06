#!/usr/bin/env node
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { verifyJwt } from './jwt.mjs';
import { loggingAdapter } from '../src/utils/logging-adapter.js';

const PORT = Number(process.env.CAKES_API_PORT) || 3856;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { cakes } = JSON.parse(readFileSync(path.join(__dirname, 'data', 'cakes.json'), 'utf8'));

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

function requireAuth(req, res) {
    const token = parseBearer(req);
    if (!token) {
        loggingAdapter.warn('auth rejected', { error: 'missing_bearer_token' });
        sendJson(res, 401, { error: 'missing_bearer_token' });
        return undefined;
    }
    const verified = verifyJwt(token);
    if (!verified.ok) {
        loggingAdapter.warn('auth rejected', { error: 'invalid_token', reason: verified.error });
        sendJson(res, 401, { error: 'invalid_token', reason: verified.error });
        return undefined;
    }
    return verified.payload;
}

function normalizeQuery(value) {
    return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function cakeMatchesQuery(cake, query) {
    if (!query) {
        return true;
    }
    const haystack = [cake.title, ...(cake.keywords ?? [])].join(' ').toLowerCase();
    return haystack.includes(query);
}

const server = createServer((req, res) => {
    const url = new URL(req.url ?? '/', `http://127.0.0.1:${PORT}`);
    const method = req.method ?? 'GET';
    loggingAdapter.debug(`${method} ${url.pathname}`);

    if (method !== 'GET') {
        loggingAdapter.warn('method not allowed', { method, path: url.pathname });
        sendJson(res, 405, { error: 'method_not_allowed' });
        return;
    }

    if (url.pathname === '/cakes') {
        if (!requireAuth(req, res)) {
            return;
        }
        const query = normalizeQuery(url.searchParams.get('q'));
        const results = cakes.filter((cake) => cakeMatchesQuery(cake, query));
        loggingAdapter.debug('search cakes', { query: url.searchParams.get('q') ?? '', count: results.length });
        sendJson(res, 200, { query: url.searchParams.get('q') ?? '', count: results.length, cakes: results });
        return;
    }

    const cakeParams = matchPath(url.pathname, '/cakes/{cakeId}');
    if (cakeParams) {
        if (!requireAuth(req, res)) {
            return;
        }
        const cake = cakes.find((entry) => entry.id === cakeParams.cakeId);
        if (!cake) {
            loggingAdapter.warn('not found', { error: 'cake_not_found', cakeId: cakeParams.cakeId });
            sendJson(res, 404, { error: 'cake_not_found', cakeId: cakeParams.cakeId });
            return;
        }
        loggingAdapter.debug('get cake', { cakeId: cakeParams.cakeId });
        sendJson(res, 200, { cake });
        return;
    }

    loggingAdapter.warn('not found', { method, path: url.pathname });
    sendJson(res, 404, { error: 'not_found' });
});

server.listen(PORT, '127.0.0.1', () => {
    loggingAdapter.info('listening', { url: `http://127.0.0.1:${PORT}`, auth: 'Bearer JWT' });
});
