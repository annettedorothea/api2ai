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
    const block = createSharedInvokeBlock('{}', '{}', invokeParamBucketsLiteralBody, '{}', 'none', 'none', {
        checkToolAccess: false,
        prepareToolCall: false
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
        const block = createSharedInvokeBlock('{}', '{}', '{}', '{}', 'none', 'none', {
            checkToolAccess: false,
            prepareToolCall: false
        });
        expect(block).toContain('performToolHttpRequest');
        expect(block).toContain("init.method !== 'TRACE'");
        expect(block).toContain('await performToolHttpRequest(url');
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
        const block = createSharedInvokeBlock('{}', wireNames, buckets, '{}', 'none', 'none', {
            checkToolAccess: false,
            prepareToolCall: false
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
});
