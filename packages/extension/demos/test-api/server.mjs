#!/usr/bin/env node
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { loggingAdapter } from '../src/utils/logging-adapter.js';

const PORT = Number(process.env.TEST_API_PORT) || 3857;
const DEMO_API_KEY = process.env.TEST_API_KEY?.trim() || 'demo-test-api-key';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {Map<string, { id: string, name: string, note?: string }>} */
const resources = new Map([['res-1', { id: 'res-1', name: 'seed', note: 'seed' }]]);

function sendJson(res, status, body) {
    res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(body));
}

function sendEmpty(res, status, headers = {}) {
    res.writeHead(status, headers);
    res.end();
}

function readApiKey(url) {
    return url.searchParams.get('api_key')?.trim() || undefined;
}

function requireApiKey(req, res, url) {
    const key = readApiKey(url);
    if (!key || key !== DEMO_API_KEY) {
        sendJson(res, 401, { error: 'unauthorized' });
        return false;
    }
    return true;
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

function readJsonBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        req.on('data', (chunk) => chunks.push(chunk));
        req.on('end', () => {
            const raw = Buffer.concat(chunks).toString('utf8').trim();
            if (!raw) {
                resolve(undefined);
                return;
            }
            try {
                resolve(JSON.parse(raw));
            } catch {
                reject(new Error('invalid_json'));
            }
        });
        req.on('error', reject);
    });
}

function nextResourceId() {
    let max = 0;
    for (const id of resources.keys()) {
        const match = /^res-(\d+)$/.exec(id);
        if (match) {
            max = Math.max(max, Number(match[1]));
        }
    }
    return `res-${max + 1}`;
}

function parseTags(url) {
    const tags = url.searchParams.getAll('tags');
    if (tags.length > 0) {
        return tags;
    }
    const single = url.searchParams.get('tags');
    return single ? [single] : [];
}

const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', `http://127.0.0.1:${PORT}`);
    const method = (req.method ?? 'GET').toUpperCase();
    const pathname = url.pathname;

    try {
        if (method === 'GET' && pathname === '/ping') {
            sendJson(res, 200, { ok: true });
            return;
        }

        if (method === 'GET' && pathname === '/protected/status') {
            if (!requireApiKey(req, res, url)) {
                return;
            }
            sendJson(res, 200, { status: 'ok' });
            return;
        }

        const itemParams = matchPath(pathname, '/items/{itemId}');
        if (method === 'GET' && itemParams) {
            sendJson(res, 200, { itemId: itemParams.itemId });
            return;
        }

        if (method === 'GET' && pathname === '/items') {
            const tag = url.searchParams.get('tag');
            if (!tag) {
                sendJson(res, 400, { error: 'tag_required' });
                return;
            }
            const status = url.searchParams.get('status');
            sendJson(res, 200, { items: [tag, status ?? 'any'] });
            return;
        }

        if (method === 'GET' && pathname === '/items/search') {
            sendJson(res, 200, { tags: parseTags(url) });
            return;
        }

        if (method === 'GET' && pathname === '/items/with-header') {
            const traceId = req.headers['x-trace-id'];
            if (typeof traceId !== 'string' || !traceId.trim()) {
                sendJson(res, 400, { error: 'missing_trace_header' });
                return;
            }
            sendJson(res, 200, { traceId: traceId.trim() });
            return;
        }

        if (method === 'POST' && pathname === '/resources') {
            const body = await readJsonBody(req);
            const name = body?.name;
            if (typeof name !== 'string' || !name.trim()) {
                sendJson(res, 400, { error: 'invalid_name' });
                return;
            }
            const id = nextResourceId();
            const resource = { id, name: name.trim(), note: typeof body?.note === 'string' ? body.note : undefined };
            resources.set(id, resource);
            sendJson(res, 201, resource);
            return;
        }

        const resourceParams = matchPath(pathname, '/resources/{resourceId}');
        if (resourceParams) {
            const { resourceId } = resourceParams;
            if (method === 'PUT') {
                const body = await readJsonBody(req);
                const name = body?.name;
                if (typeof name !== 'string' || !name.trim()) {
                    sendJson(res, 400, { error: 'invalid_name' });
                    return;
                }
                const updated = { id: resourceId, name: name.trim(), note: resources.get(resourceId)?.note };
                resources.set(resourceId, updated);
                sendJson(res, 200, { resourceId, name: updated.name });
                return;
            }
            if (method === 'PATCH') {
                const body = await readJsonBody(req);
                const existing = resources.get(resourceId) ?? { id: resourceId, name: 'unknown' };
                const note = typeof body?.note === 'string' ? body.note : existing.note;
                const updated = { ...existing, note };
                resources.set(resourceId, updated);
                sendJson(res, 200, updated);
                return;
            }
            if (method === 'DELETE') {
                resources.delete(resourceId);
                sendEmpty(res, 204);
                return;
            }
        }

        if (method === 'HEAD' && pathname === '/probe') {
            sendEmpty(res, 200);
            return;
        }

        if (method === 'OPTIONS' && pathname === '/probe') {
            sendEmpty(res, 204, { Allow: 'GET, HEAD, OPTIONS' });
            return;
        }

        if (method === 'TRACE' && pathname === '/trace') {
            sendJson(res, 200, { traced: true, path: pathname });
            return;
        }

        if (method === 'POST' && pathname === '/composed/one-of') {
            const body = await readJsonBody(req);
            sendJson(res, 200, { received: body });
            return;
        }

        if (method === 'POST' && pathname === '/composed/any-of') {
            const body = await readJsonBody(req);
            sendJson(res, 200, { received: body });
            return;
        }

        if (method === 'POST' && pathname === '/composed/all-of') {
            const body = await readJsonBody(req);
            sendJson(res, 200, { received: body });
            return;
        }

        if (method === 'POST' && pathname === '/echo/ref-body') {
            const body = await readJsonBody(req);
            sendJson(res, 200, { echoed: body });
            return;
        }

        if (method === 'GET' && pathname === '/admin/secrets') {
            if (!requireApiKey(req, res, url)) {
                return;
            }
            const limit = Number(url.searchParams.get('limit') ?? '10');
            const count = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 10) : 10;
            sendJson(res, 200, { secrets: Array.from({ length: count }, (_, i) => `secret-${i + 1}`) });
            return;
        }

        if (method === 'GET' && pathname === '/prepared/public') {
            const limit = Number(url.searchParams.get('limit') ?? '10');
            const count = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 10) : 10;
            sendJson(res, 200, { items: Array.from({ length: count }, (_, i) => `item-${i + 1}`) });
            return;
        }

        sendJson(res, 404, { error: 'not_found' });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        sendJson(res, 500, { error: message });
    }
});

server.listen(PORT, '127.0.0.1', () => {
    loggingAdapter.info(`test-api listening on http://127.0.0.1:${PORT}`);
});
