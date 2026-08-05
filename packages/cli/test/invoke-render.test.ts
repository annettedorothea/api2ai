import { describe, expect, test } from 'vitest';
import ts from 'typescript';
import { createSharedInvokeBlock } from '../src/generator/invoke-render.js';

type InvokeOptions = {
    pathParams?: Record<string, string | number | boolean>;
    query?:
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>
        | string
        | number
        | boolean;
    headers?: Record<string, string>;
    body?: unknown;
    [key: string]: unknown;
};

type NormalizeInvokeOptions = (toolName: string, options: InvokeOptions) => InvokeOptions;

function compileNormalizeInvokeOptions(invokeParamBucketsLiteralBody: string): NormalizeInvokeOptions {
    const block = createSharedInvokeBlock('{}', '{}', '{}', '{}', invokeParamBucketsLiteralBody, 'none', 'none', {
        checkToolAccess: false,
        prepareToolCall: false,
        afterToolCall: false
    });
    const normalizeBlock = block.slice(0, block.indexOf('const queryParamSerializationByTool'));
    const js = ts.transpileModule(`${normalizeBlock}\nexports.normalizeInvokeOptions = normalizeInvokeOptions;`, {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
    }).outputText;
    const mod = { exports: {} as { normalizeInvokeOptions: NormalizeInvokeOptions } };
    new Function('exports', js)(mod.exports);
    return mod.exports.normalizeInvokeOptions;
}

const searchMovieBuckets = JSON.stringify({
    searchTmdbMovies: {
        pathParams: [],
        query: ['query', 'include_adult', 'language', 'primary_release_year', 'page', 'region', 'year']
    },
    getPopularTmdbMovies: {
        pathParams: [],
        query: ['language', 'page']
    }
});

describe('invoke-render', () => {
    test('emits TRACE fallback because fetch rejects that method', () => {
        const block = createSharedInvokeBlock('{}', '{}', '{}', '{}', '{}', 'none', 'none', {
            checkToolAccess: false,
            prepareToolCall: false,
            afterToolCall: false
        });
        expect(block).toContain('performToolHttpRequest');
        expect(block).toContain("init.method !== 'TRACE'");
        expect(block).toContain('await performToolHttpRequest(url');
        expect(block).not.toContain('coerceInvokeScalar');
        expect(block).not.toContain('invokeBodySchemaByTool');
    });

    test('normalizeInvokeOptions preserves string query values with leading zeros', () => {
        const buckets = JSON.stringify({
            getAccount: {
                pathParams: [],
                query: ['accountNumber'],
                headers: [],
                arrayQuery: []
            }
        });
        const normalizeInvokeOptions = compileNormalizeInvokeOptions(buckets);
        expect(normalizeInvokeOptions('getAccount', { accountNumber: '0815' })).toEqual({
            query: { accountNumber: '0815' }
        });
    });

    test('normalizeInvokeOptions passes body through unchanged', () => {
        const buckets = JSON.stringify({
            createItem: {
                pathParams: [],
                query: [],
                headers: [],
                arrayQuery: []
            }
        });
        const normalizeInvokeOptions = compileNormalizeInvokeOptions(buckets);
        const body = { accountNumber: '0815', title: 'Test' };
        expect(normalizeInvokeOptions('createItem', { body })).toEqual({ body });
    });

    test('normalizeInvokeOptions splits array query strings without coercing elements', () => {
        const buckets = JSON.stringify({
            listTags: {
                pathParams: [],
                query: ['tags'],
                headers: [],
                arrayQuery: ['tags']
            }
        });
        const normalizeInvokeOptions = compileNormalizeInvokeOptions(buckets);
        expect(normalizeInvokeOptions('listTags', { tags: '0815,0042' })).toEqual({
            query: { tags: ['0815', '0042'] }
        });
    });

    test('normalizeInvokeOptions treats scalar query as API param when bucket name collides', () => {
        const normalizeInvokeOptions = compileNormalizeInvokeOptions(searchMovieBuckets);

        expect(normalizeInvokeOptions('searchTmdbMovies', { query: 'Braveheart', page: 1 })).toEqual({
            query: { query: 'Braveheart', page: 1 }
        });
        expect(normalizeInvokeOptions('searchTmdbMovies', { query: 'Braveheart' })).toEqual({
            query: { query: 'Braveheart' }
        });
        expect(normalizeInvokeOptions('searchTmdbMovies', { query: { query: 'Braveheart', page: 1 } })).toEqual({
            query: { query: 'Braveheart', page: 1 }
        });
        expect(normalizeInvokeOptions('getPopularTmdbMovies', { page: 1 })).toEqual({
            query: { page: 1 }
        });
    });

    test('appendSerializedQueryParams maps MCP names to OpenAPI wire names', () => {
        const wireNames = JSON.stringify({
            discoverTmdbMovies: {
                vote_average_gte: 'vote_average.gte',
                vote_average_lte: 'vote_average.lte'
            }
        });
        const buckets = JSON.stringify({
            discoverTmdbMovies: {
                pathParams: [],
                query: ['vote_average_gte', 'vote_average_lte', 'page']
            }
        });
        const block = createSharedInvokeBlock('{}', wireNames, '{}', '{}', buckets, 'none', 'none', {
            checkToolAccess: false,
            prepareToolCall: false,
            afterToolCall: false
        });
        const helpersBlock = block.slice(
            block.indexOf('const queryParamSerializationByTool'),
            block.indexOf('async function performToolHttpRequest')
        );
        const js = ts.transpileModule(
            `type InvokeOptions = { query?: Record<string, string | number | boolean> };
${helpersBlock}
exports.appendSerializedQueryParams = appendSerializedQueryParams;`,
            { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }
        ).outputText;
        const mod = {
            exports: {} as {
                appendSerializedQueryParams: (
                    searchParams: URLSearchParams,
                    toolName: string,
                    query: Record<string, string | number | boolean> | undefined
                ) => void;
            }
        };
        new Function('exports', js)(mod.exports);
        const params = new URLSearchParams();
        mod.exports.appendSerializedQueryParams(params, 'discoverTmdbMovies', {
            vote_average_gte: 7,
            page: 1
        });
        expect(params.get('vote_average.gte')).toBe('7');
        expect(params.get('page')).toBe('1');
        expect(params.has('vote_average_gte')).toBe(false);
    });

    test('path substitution maps MCP names to dotted OpenAPI wire names', () => {
        const pathWireNames = JSON.stringify({
            testGetAccount: {
                account_id: 'account.id'
            }
        });
        const block = createSharedInvokeBlock('{}', '{}', pathWireNames, '{}', '{}', 'none', 'none', {
            checkToolAccess: false,
            prepareToolCall: false,
            afterToolCall: false
        });
        expect(block).toContain('pathParamWireNamesByTool');
        expect(block).toContain('pathWireNames[key] ?? key');
        const helpersBlock = block.slice(
            block.indexOf('const pathParamWireNamesByTool'),
            block.indexOf('function appendSerializedQueryParams')
        );
        const js = ts.transpileModule(
            `${helpersBlock}
function buildUrl(
    baseUrl: string,
    toolName: string,
    toolPath: string,
    pathParams: Record<string, string | number | boolean>
): URL {
    const pathWireNames: Record<string, string> = (pathParamWireNamesByTool as Record<string, Record<string, string>>)[toolName] ?? {};
    let resolvedPath = toolPath;
    for (const [key, value] of Object.entries(pathParams)) {
        const wireKey = pathWireNames[key] ?? key;
        resolvedPath = resolvedPath.split('{' + wireKey + '}').join(encodeURIComponent(String(value)));
    }
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return new URL(normalizedBaseUrl + resolvedPath);
}
exports.buildUrl = buildUrl;`,
            { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }
        ).outputText;
        const mod = {
            exports: {} as {
                buildUrl: (
                    baseUrl: string,
                    toolName: string,
                    toolPath: string,
                    pathParams: Record<string, string | number | boolean>
                ) => URL;
            }
        };
        new Function('exports', js)(mod.exports);
        const url = mod.exports.buildUrl('http://127.0.0.1:3857', 'testGetAccount', '/accounts/{account.id}', {
            account_id: 'acc-42'
        });
        expect(url.pathname).toBe('/accounts/acc-42');
    });

    test('requestHeaders maps MCP header names to OpenAPI wire names', () => {
        const headerWireNames = JSON.stringify({
            testGetWithHeader: {
                X_Trace_Id: 'X-Trace-Id'
            }
        });
        const block = createSharedInvokeBlock('{}', '{}', '{}', headerWireNames, '{}', 'none', 'none', {
            checkToolAccess: false,
            prepareToolCall: false,
            afterToolCall: false
        });
        expect(block).toContain('headerParamWireNamesByTool');
        expect(block).toContain('headerWireNames[key] ?? key');
        const helpersBlock = block.slice(
            block.indexOf('const headerParamWireNamesByTool'),
            block.indexOf('function appendSerializedQueryParams')
        );
        const js = ts.transpileModule(
            `${helpersBlock}
function buildHeaders(toolName: string, headers: Record<string, string>): Record<string, string> {
    const headerWireNames: Record<string, string> = (headerParamWireNamesByTool as Record<string, Record<string, string>>)[toolName] ?? {};
    const requestHeaders: Record<string, string> = {
        'content-type': 'application/json'
    };
    for (const [key, value] of Object.entries(headers)) {
        const wireKey = headerWireNames[key] ?? key;
        requestHeaders[wireKey] = value;
    }
    return requestHeaders;
}
exports.buildHeaders = buildHeaders;`,
            { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }
        ).outputText;
        const mod = {
            exports: {} as {
                buildHeaders: (toolName: string, headers: Record<string, string>) => Record<string, string>;
            }
        };
        new Function('exports', js)(mod.exports);
        const headers = mod.exports.buildHeaders('testGetWithHeader', { X_Trace_Id: 'trace-99' });
        expect(headers['X-Trace-Id']).toBe('trace-99');
        expect(headers['X_Trace_Id']).toBeUndefined();
    });
});
