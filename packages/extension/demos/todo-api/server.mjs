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

function pdfEscape(text) {
    return String(text).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function truncatePdfText(text, maxChars) {
    const s = String(text);
    if (s.length <= maxChars) {
        return s;
    }
    return `${s.slice(0, Math.max(0, maxChars - 3))}...`;
}

function categoryLabel(categoryId) {
    return findCategory(categoryId)?.name ?? categoryId ?? '-';
}

function formatExportDate(date = new Date()) {
    return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

/**
 * Demo PDF layout: header bar, title, summary, column headers, one row per todo.
 * Hand-written PDF operators (no layout library) — ASCII-safe Helvetica text.
 */
function buildTodosPdf(list) {
    const openCount = list.filter((t) => t.status === 'open').length;
    const doneCount = list.filter((t) => t.status === 'done').length;
    const exported = formatExportDate();
    const marginLeft = 48;
    const pageWidth = 612;
    const pageHeight = 792;
    const contentWidth = pageWidth - marginLeft * 2;
    const rowHeight = 28;
    const bottomMargin = 56;
    const headerBottom = 700;

    const ops = [];
    // Soft page wash
    ops.push('0.97 0.97 0.96 rg');
    ops.push(`0 0 ${pageWidth} ${pageHeight} re`);
    ops.push('f');
    // Header bar
    ops.push('0.12 0.25 0.42 rg');
    ops.push(`0 ${headerBottom} ${pageWidth} ${pageHeight - headerBottom} re`);
    ops.push('f');
    // Accent stripe under header
    ops.push('0.23 0.51 0.86 rg');
    ops.push(`0 ${headerBottom - 4} ${pageWidth} 4 re`);
    ops.push('f');

    ops.push('BT');
    // Title (white on header)
    ops.push('1 1 1 rg');
    ops.push(`/F2 22 Tf`);
    ops.push(`${marginLeft} 748 Td`);
    ops.push(`(${pdfEscape('Todo List')}) Tj`);
    ops.push('0 -18 Td');
    ops.push('/F1 10 Tf');
    ops.push('0.75 0.84 0.95 rg');
    ops.push(`(${pdfEscape(`Exported ${exported}  |  ${list.length} item${list.length === 1 ? '' : 's'}`)}) Tj`);
    ops.push('ET');

    // Summary chips area
    let y = headerBottom - 36;
    ops.push('BT');
    ops.push('0.25 0.3 0.38 rg');
    ops.push(`/F1 10 Tf`);
    ops.push(`${marginLeft} ${y} Td`);
    ops.push(`(${pdfEscape(`Open: ${openCount}    Done: ${doneCount}`)}) Tj`);
    ops.push('ET');

    // Column header background
    y -= 22;
    ops.push('0.90 0.92 0.95 rg');
    ops.push(`${marginLeft} ${y - 6} ${contentWidth} 20 re`);
    ops.push('f');

    const colStatus = marginLeft + 8;
    const colTitle = marginLeft + 70;
    const colCategory = marginLeft + 320;
    const colDue = marginLeft + 430;

    ops.push('BT');
    ops.push('0.35 0.4 0.48 rg');
    ops.push('/F2 9 Tf');
    ops.push(`${colStatus} ${y} Td`);
    ops.push('(STATUS) Tj');
    ops.push(`${colTitle - colStatus} 0 Td`);
    ops.push('(TITLE) Tj');
    ops.push(`${colCategory - colTitle} 0 Td`);
    ops.push('(CATEGORY) Tj');
    ops.push(`${colDue - colCategory} 0 Td`);
    ops.push('(DUE) Tj');
    ops.push('ET');

    y -= 10;
    if (list.length === 0) {
        ops.push('BT');
        ops.push('0.45 0.48 0.52 rg');
        ops.push('/F1 11 Tf');
        ops.push(`${marginLeft} ${y - 28} Td`);
        ops.push('(No todos match this export.) Tj');
        ops.push('ET');
    } else {
        let rowIndex = 0;
        for (const todo of list) {
            y -= rowHeight;
            if (y < bottomMargin) {
                ops.push('BT');
                ops.push('0.45 0.48 0.52 rg');
                ops.push('/F1 9 Tf');
                ops.push(`${marginLeft} ${bottomMargin - 16} Td`);
                const remaining = list.length - rowIndex;
                ops.push(`(${pdfEscape(`...and ${remaining} more (export truncated to one page)`)}) Tj`);
                ops.push('ET');
                break;
            }
            // Alternating row wash
            if (rowIndex % 2 === 0) {
                ops.push('0.94 0.95 0.97 rg');
                ops.push(`${marginLeft} ${y - 8} ${contentWidth} ${rowHeight} re`);
                ops.push('f');
            }
            // Status pill
            const isDone = todo.status === 'done';
            if (isDone) {
                ops.push('0.85 0.93 0.87 rg');
            } else {
                ops.push('0.89 0.93 0.98 rg');
            }
            ops.push(`${colStatus - 4} ${y - 4} 48 14 re`);
            ops.push('f');

            const statusLabel = isDone ? 'DONE' : 'OPEN';
            const title = truncatePdfText(todo.title || '', 42);
            const category = truncatePdfText(categoryLabel(todo.categoryId), 12);
            const due = todo.dueDate ? truncatePdfText(todo.dueDate, 12) : '-';

            ops.push('BT');
            ops.push('/F2 8 Tf');
            if (isDone) {
                ops.push('0.16 0.5 0.3 rg');
            } else {
                ops.push('0.15 0.35 0.65 rg');
            }
            ops.push(`${colStatus} ${y} Td`);
            ops.push(`(${pdfEscape(statusLabel)}) Tj`);

            ops.push('/F1 10 Tf');
            ops.push('0.15 0.18 0.22 rg');
            ops.push(`${colTitle - colStatus} 0 Td`);
            ops.push(`(${pdfEscape(title)}) Tj`);

            ops.push('0.4 0.45 0.5 rg');
            ops.push(`${colCategory - colTitle} 0 Td`);
            ops.push(`(${pdfEscape(category)}) Tj`);

            ops.push(`${colDue - colCategory} 0 Td`);
            ops.push(`(${pdfEscape(due)}) Tj`);
            ops.push('ET');

            rowIndex += 1;
        }
    }

    // Footer
    ops.push('0.85 0.87 0.9 rg');
    ops.push(`${marginLeft} 40 ${contentWidth} 0.5 re`);
    ops.push('f');
    ops.push('BT');
    ops.push('0.55 0.58 0.62 rg');
    ops.push('/F1 8 Tf');
    ops.push(`${marginLeft} 28 Td`);
    ops.push(`(${pdfEscape('Generated by Todo API demo  |  toolfactory')}) Tj`);
    ops.push('ET');

    const stream = ops.join('\n');
    const objects = [];
    objects.push('1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n');
    objects.push('2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n');
    objects.push(
        '3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources<< /Font<< /F1 5 0 R /F2 6 0 R >> >> >>endobj\n'
    );
    objects.push(`4 0 obj<< /Length ${Buffer.byteLength(stream, 'utf8')} >>stream\n${stream}\nendstream\nendobj\n`);
    objects.push('5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\n');
    objects.push('6 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>endobj\n');
    let pdf = '%PDF-1.4\n';
    const offsets = [0];
    for (const obj of objects) {
        offsets.push(Buffer.byteLength(pdf, 'utf8'));
        pdf += obj;
    }
    const xrefStart = Buffer.byteLength(pdf, 'utf8');
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += '0000000000 65535 f \n';
    for (let i = 1; i < offsets.length; i++) {
        pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
    }
    pdf += `trailer<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
    return Buffer.from(pdf, 'utf8');
}

function filterTodos(url) {
    const status = url.searchParams.get('status')?.trim();
    const categoryId = url.searchParams.get('categoryId')?.trim();
    let list = todos;
    if (status) {
        list = list.filter((t) => t.status === status);
    }
    if (categoryId) {
        list = list.filter((t) => t.categoryId === categoryId);
    }
    return { list, status, categoryId };
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
        const { list, status, categoryId } = filterTodos(url);
        loggingAdapter.debug('list todos', { status: status || undefined, categoryId: categoryId || undefined, count: list.length });
        sendJson(res, 200, { todos: list });
        return;
    }

    if (method === 'GET' && url.pathname === '/todos/export.pdf') {
        const { list, status, categoryId } = filterTodos(url);
        const pdf = buildTodosPdf(list);
        loggingAdapter.debug('export todos pdf', {
            status: status || undefined,
            categoryId: categoryId || undefined,
            count: list.length,
            bytes: pdf.byteLength
        });
        res.writeHead(200, {
            'content-type': 'application/pdf',
            'content-disposition': 'attachment; filename="todos.pdf"',
            'content-length': String(pdf.byteLength)
        });
        res.end(pdf);
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
