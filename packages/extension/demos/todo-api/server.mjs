#!/usr/bin/env node
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PORT = Number(process.env.TODO_API_PORT) || 3852;
const DEMO_API_KEY = process.env.TODO_API_KEY?.trim() || 'demo-todo-api-key';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const categories = JSON.parse(readFileSync(path.join(__dirname, 'data', 'categories.json'), 'utf8'));
const todos = JSON.parse(readFileSync(path.join(__dirname, 'data', 'todos.json'), 'utf8'));

function sendJson(res, status, body) {
    res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(body));
}

function readApiKey(req) {
    const direct = req.headers['x-api-key'];
    if (typeof direct === 'string' && direct.trim()) {
        return direct.trim();
    }
    return undefined;
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
    const apiKey = readApiKey(req);

    if (apiKey !== DEMO_API_KEY) {
        sendJson(res, 401, { error: 'invalid_api_key' });
        return;
    }

    if (method !== 'GET') {
        sendJson(res, 405, { error: 'method_not_allowed' });
        return;
    }

    if (url.pathname === '/categories') {
        sendJson(res, 200, { categories });
        return;
    }

    const byCategory = matchPath(url.pathname, '/categories/{categoryId}/todos');
    if (byCategory) {
        const categoryId = byCategory.categoryId;
        const category = categories.find((c) => c.id === categoryId);
        if (!category) {
            sendJson(res, 404, { error: 'category_not_found', categoryId });
            return;
        }
        const status = url.searchParams.get('status')?.trim();
        let list = todos.filter((t) => t.categoryId === categoryId);
        if (status) {
            list = list.filter((t) => t.status === status);
        }
        sendJson(res, 200, { categoryId, todos: list });
        return;
    }

    if (url.pathname === '/todos') {
        const status = url.searchParams.get('status')?.trim();
        const categoryId = url.searchParams.get('categoryId')?.trim();
        let list = todos;
        if (status) {
            list = list.filter((t) => t.status === status);
        }
        if (categoryId) {
            list = list.filter((t) => t.categoryId === categoryId);
        }
        sendJson(res, 200, { todos: list });
        return;
    }

    const one = matchPath(url.pathname, '/todos/{todoId}');
    if (one) {
        const todo = todos.find((t) => t.id === one.todoId);
        if (!todo) {
            sendJson(res, 404, { error: 'todo_not_found', todoId: one.todoId });
            return;
        }
        sendJson(res, 200, { todo });
        return;
    }

    sendJson(res, 404, { error: 'not_found' });
});

server.listen(PORT, '127.0.0.1', () => {
    console.error(`[todo-api] listening on http://127.0.0.1:${PORT} (x-api-key)`);
});
