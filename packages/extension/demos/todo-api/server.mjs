#!/usr/bin/env node
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { loggingAdapter } from '@toolfactory.dev/core/logging';

const PORT = Number(process.env.TODO_API_PORT) || 3852;
const DEMO_API_KEY = process.env.TODO_API_KEY?.trim() || 'demo-todo-api-key';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const categories = JSON.parse(readFileSync(path.join(__dirname, 'data', 'categories.json'), 'utf8'));
const seedTodos = JSON.parse(readFileSync(path.join(__dirname, 'data', 'todos.json'), 'utf8'));
/** In-memory store — seeded from JSON at startup, mutations are not persisted. */
const todos = structuredClone(seedTodos);

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

function nextTodoId() {
    let max = 0;
    for (const todo of todos) {
        const match = /^t-(\d+)$/.exec(todo.id);
        if (match) {
            max = Math.max(max, Number(match[1]));
        }
    }
    return `t-${max + 1}`;
}

function findCategory(categoryId) {
    return categories.find((c) => c.id === categoryId);
}

function validateStatus(status) {
    return status === undefined || status === 'open' || status === 'done';
}

const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', `http://127.0.0.1:${PORT}`);
    const method = req.method ?? 'GET';
    loggingAdapter.debug(`${method} ${url.pathname}`);
    const apiKey = readApiKey(req);

    if (apiKey !== DEMO_API_KEY) {
        loggingAdapter.warn('auth rejected', { error: 'invalid_api_key' });
        sendJson(res, 401, { error: 'invalid_api_key' });
        return;
    }

    if (method === 'GET' && url.pathname === '/categories') {
        loggingAdapter.debug('list categories', { count: categories.length });
        sendJson(res, 200, { categories });
        return;
    }

    const byCategory = matchPath(url.pathname, '/categories/{categoryId}/todos');
    if (method === 'GET' && byCategory) {
        const categoryId = byCategory.categoryId;
        const category = findCategory(categoryId);
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

    if (method === 'GET' && url.pathname === '/todos') {
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

    if (method === 'POST' && url.pathname === '/todos') {
        let body;
        try {
            body = await readJsonBody(req);
        } catch {
            loggingAdapter.warn('bad request', { error: 'invalid_json' });
            sendJson(res, 400, { error: 'invalid_json' });
            return;
        }
        if (!body || typeof body !== 'object') {
            sendJson(res, 400, { error: 'invalid_body' });
            return;
        }
        const title = typeof body.title === 'string' ? body.title.trim() : '';
        const categoryId = typeof body.categoryId === 'string' ? body.categoryId.trim() : '';
        const status = body.status ?? 'open';
        const dueDate = typeof body.dueDate === 'string' ? body.dueDate.trim() : undefined;
        if (!title || !categoryId) {
            sendJson(res, 400, { error: 'missing_fields', required: ['title', 'categoryId'] });
            return;
        }
        if (!validateStatus(status)) {
            sendJson(res, 400, { error: 'invalid_status', allowed: ['open', 'done'] });
            return;
        }
        if (!findCategory(categoryId)) {
            sendJson(res, 404, { error: 'category_not_found', categoryId });
            return;
        }
        const todo = { id: nextTodoId(), title, status, categoryId, ...(dueDate ? { dueDate } : {}) };
        todos.push(todo);
        loggingAdapter.debug('create todo', { todoId: todo.id });
        sendJson(res, 201, { todo });
        return;
    }

    const one = matchPath(url.pathname, '/todos/{todoId}');
    if (one) {
        const index = todos.findIndex((t) => t.id === one.todoId);
        if (index === -1) {
            loggingAdapter.warn('not found', { error: 'todo_not_found', todoId: one.todoId });
            sendJson(res, 404, { error: 'todo_not_found', todoId: one.todoId });
            return;
        }

        if (method === 'GET') {
            loggingAdapter.debug('get todo', { todoId: one.todoId });
            sendJson(res, 200, { todo: todos[index] });
            return;
        }

        if (method === 'PATCH') {
            let body;
            try {
                body = await readJsonBody(req);
            } catch {
                loggingAdapter.warn('bad request', { error: 'invalid_json' });
                sendJson(res, 400, { error: 'invalid_json' });
                return;
            }
            if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
                sendJson(res, 400, { error: 'empty_update' });
                return;
            }
            const current = todos[index];
            if (body.title !== undefined) {
                if (typeof body.title !== 'string' || !body.title.trim()) {
                    sendJson(res, 400, { error: 'invalid_title' });
                    return;
                }
                current.title = body.title.trim();
            }
            if (body.status !== undefined) {
                if (!validateStatus(body.status)) {
                    sendJson(res, 400, { error: 'invalid_status', allowed: ['open', 'done'] });
                    return;
                }
                current.status = body.status;
            }
            if (body.categoryId !== undefined) {
                if (typeof body.categoryId !== 'string' || !body.categoryId.trim()) {
                    sendJson(res, 400, { error: 'invalid_categoryId' });
                    return;
                }
                const categoryId = body.categoryId.trim();
                if (!findCategory(categoryId)) {
                    sendJson(res, 404, { error: 'category_not_found', categoryId });
                    return;
                }
                current.categoryId = categoryId;
            }
            if (body.dueDate !== undefined) {
                if (body.dueDate === null || body.dueDate === '') {
                    delete current.dueDate;
                } else if (typeof body.dueDate === 'string') {
                    current.dueDate = body.dueDate.trim();
                } else {
                    sendJson(res, 400, { error: 'invalid_dueDate' });
                    return;
                }
            }
            loggingAdapter.debug('update todo', { todoId: one.todoId });
            sendJson(res, 200, { todo: current });
            return;
        }

        if (method === 'DELETE') {
            todos.splice(index, 1);
            loggingAdapter.debug('delete todo', { todoId: one.todoId });
            sendJson(res, 200, { todoId: one.todoId, deleted: true });
            return;
        }
    }

    if (method !== 'GET') {
        loggingAdapter.warn('method not allowed', { method, path: url.pathname });
        sendJson(res, 405, { error: 'method_not_allowed' });
        return;
    }

    loggingAdapter.warn('not found', { method, path: url.pathname });
    sendJson(res, 404, { error: 'not_found' });
});

server.listen(PORT, '127.0.0.1', () => {
    loggingAdapter.info('listening', { url: `http://127.0.0.1:${PORT}`, auth: 'x-api-key' });
});
