import { describe, expect, test } from 'vitest';
import ts from 'typescript';
import {
    HTTP_SUCCESS_BODY_MAX_BYTES,
    renderDecodeHttpSuccessHelpers
} from '../src/generator/decode-http-response-fragment.js';
import { createSharedInvokeBlock } from '../src/generator/invoke-render.js';

type DecodeHttpSuccessResponse = (response: Response, method: string, toolLabel: string) => Promise<unknown>;

function compileDecodeHttpSuccessResponse(): DecodeHttpSuccessResponse {
    const source = `${renderDecodeHttpSuccessHelpers()}
exports.decodeHttpSuccessResponse = decodeHttpSuccessResponse;
exports.HTTP_SUCCESS_BODY_MAX_BYTES = HTTP_SUCCESS_BODY_MAX_BYTES_DEFAULT;
`;
    const js = ts.transpileModule(source, {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
    }).outputText;
    const mod = {
        exports: {} as {
            decodeHttpSuccessResponse: DecodeHttpSuccessResponse;
            HTTP_SUCCESS_BODY_MAX_BYTES: number;
        }
    };
    new Function('exports', 'Buffer', 'process', js)(mod.exports, Buffer, process);
    return mod.exports.decodeHttpSuccessResponse;
}

describe('decodeHttpSuccessResponse', () => {
    const decode = compileDecodeHttpSuccessResponse();

    test('parses application/json', async () => {
        const response = new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { 'content-type': 'application/json' }
        });
        await expect(decode(response, 'GET', 't')).resolves.toEqual({ ok: true });
    });

    test('parses +json media types', async () => {
        const response = new Response(JSON.stringify({ title: 'problem' }), {
            status: 200,
            headers: { 'content-type': 'application/problem+json; charset=utf-8' }
        });
        await expect(decode(response, 'GET', 't')).resolves.toEqual({ title: 'problem' });
    });

    test('returns text for text/plain', async () => {
        const response = new Response('hello', {
            status: 200,
            headers: { 'content-type': 'text/plain' }
        });
        await expect(decode(response, 'GET', 't')).resolves.toBe('hello');
    });

    test('returns empty envelope for empty text/plain body', async () => {
        const response = new Response('', {
            status: 200,
            headers: { 'content-type': 'text/plain' }
        });
        await expect(decode(response, 'GET', 't')).resolves.toEqual({ kind: 'empty', status: 200 });
    });

    test('returns empty envelope for 204', async () => {
        const response = new Response(null, { status: 204 });
        await expect(decode(response, 'GET', 't')).resolves.toEqual({ kind: 'empty', status: 204 });
    });

    test('returns empty envelope for HEAD', async () => {
        const response = new Response(null, {
            status: 200,
            headers: { 'content-type': 'application/json' }
        });
        await expect(decode(response, 'HEAD', 't')).resolves.toEqual({ kind: 'empty', status: 200 });
    });

    test('returns binary envelope for application/pdf', async () => {
        const pdf = Buffer.from('%PDF-1.4\n%%EOF\n');
        const response = new Response(pdf, {
            status: 200,
            headers: {
                'content-type': 'application/pdf',
                'content-disposition': 'attachment; filename="todos.pdf"'
            }
        });
        await expect(decode(response, 'GET', 'exportTodosPdf')).resolves.toEqual({
            kind: 'binary',
            encoding: 'base64',
            contentType: 'application/pdf',
            filename: 'todos.pdf',
            byteLength: pdf.byteLength,
            data: pdf.toString('base64')
        });
    });

    test('hard-fails when Content-Length exceeds limit', async () => {
        const response = new Response('x', {
            status: 200,
            headers: {
                'content-type': 'text/plain',
                'content-length': String(HTTP_SUCCESS_BODY_MAX_BYTES + 1)
            }
        });
        await expect(decode(response, 'GET', 'big')).rejects.toThrow(/maximum allowed/);
    });

    test('invoke block wires decodeHttpSuccessResponse', () => {
        const block = createSharedInvokeBlock('{}', '{}', '{}', '{}', '{}', 'none', 'none', {
            checkToolAccess: false,
            prepareToolCall: false,
            afterToolCall: false
        });
        expect(block).toContain('decodeHttpSuccessResponse');
        expect(block).toContain("kind: 'binary'");
        expect(block).toContain('HTTP_SUCCESS_BODY_MAX_BYTES_DEFAULT');
        expect(block).toContain('TOOLFACTORY_HTTP_BODY_MAX_BYTES');
        expect(block).not.toContain('return response.text();\n}');
    });
});
