#!/usr/bin/env node
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { loggingAdapter } from '../src/utils/logging-adapter.js';

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
    loggingAdapter.debug(`${method} ${url.pathname}`);
    const apiKey = readApiKey(req);

    if (apiKey !== DEMO_API_KEY) {
        loggingAdapter.warn('auth rejected', { error: 'invalid_api_key' });
        sendJson(res, 401, { error: 'invalid_api_key' });
        return;
    }

    if (method !== 'GET') {
        loggingAdapter.warn('method not allowed', { method, path: url.pathname });
        sendJson(res, 405, { error: 'method_not_allowed' });
        return;
    }

    if (url.pathname === '/categories') {
        loggingAdapter.debug('list categories', { count: categories.length });
        sendJson(res, 200, { categories });
        return;
    }

    const byCategory = matchPath(url.pathname, '/categories/{categoryId}/todos');
    if (byCategory) {
        const categoryId = byCategory.categoryId;
        const category = categories.find((c) => c.id === categoryId);
        if (!category) {
            loggingAdapter.warn('not found', { error: 'category_not_found', categoryId });
            sendJson(res, 404, { error: 'category_not_found', categoryId });
            return;
        }
        const status = url.searchParams.get('status')?.trim();
        let list = todos.filter((t) => t.categoryId === categoryId);
        if (status) {
            list = list.filter((t) => t.status === status);
        }
        loggingAdapter.debug('list todos by category', { categoryId, status: status || undefined, count: list.length });
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
        loggingAdapter.debug('list todos', { status: status || undefined, categoryId: categoryId || undefined, count: list.length });
        sendJson(res, 200, { todos: list });
        return;
    }

    const one = matchPath(url.pathname, '/todos/{todoId}');
    if (one) {
        const todo = todos.find((t) => t.id === one.todoId);
        if (!todo) {
            loggingAdapter.warn('not found', { error: 'todo_not_found', todoId: one.todoId });
            sendJson(res, 404, { error: 'todo_not_found', todoId: one.todoId });
            return;
        }
        loggingAdapter.debug('get todo', { todoId: one.todoId });
        sendJson(res, 200, { todo });
        return;
    }

    loggingAdapter.warn('not found', { method, path: url.pathname });
    sendJson(res, 404, { error: 'not_found' });
});

server.listen(PORT, '127.0.0.1', () => {
    loggingAdapter.info('listening', { url: `http://127.0.0.1:${PORT}`, auth: 'x-api-key' });
});
