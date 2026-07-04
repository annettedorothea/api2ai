import path from 'node:path';
import { EmptyFileSystem, type LangiumDocument } from 'langium';
import { parseHelper, type ParseHelperOptions } from 'langium/test';
import { describe, expect, test, beforeAll } from 'vitest';
import type { CompletionParams } from 'vscode-languageserver';
import { createApi2AiDslServices } from '../src/api-2-ai-dsl-module.js';
import type { Model } from '../src/generated/ast.js';

let parse: ReturnType<typeof parseHelper<Model>>;
let sharedServices: ReturnType<typeof createApi2AiDslServices>;
const fixtureDir = path.join(process.cwd(), 'test/fixtures');
let completionCase = 0;

beforeAll(async () => {
    sharedServices = createApi2AiDslServices(EmptyFileSystem);
    parse = parseHelper<Model>(sharedServices.Api2AiDsl);
});

function openApiPathLabels(items: Array<{ detail?: unknown; label: unknown }>): string[] {
    return items
        .filter((i) => typeof i.detail === 'string' && i.detail.endsWith('OpenAPI'))
        .map((i) => String(i.label));
}

function sortedKeywordLabels(
    items: Array<{ kind?: unknown; label: unknown; sortText?: string | undefined }>
): string[] {
    return items
        .filter((item) => typeof item.label === 'string' && typeof item.sortText === 'string')
        .sort((a, b) => String(a.sortText).localeCompare(String(b.sortText)))
        .map((item) => String(item.label));
}

async function completionAt(content: string, offset: number) {
    completionCase += 1;
    const documentUri = path.join(fixtureDir, `completion-case-${completionCase}.api2ai`);
    const options: ParseHelperOptions = { validation: false, documentUri };
    const document = (await parse(content, options)) as LangiumDocument<Model>;
    if (!document.uri.fsPath) {
        throw new Error(`Expected file URI fsPath, got ${document.uri.toString()}`);
    }
    const position = document.textDocument.positionAt(offset);
    const params = { position, textDocument: { uri: document.uri.toString() } } satisfies CompletionParams;
    const completionProvider = sharedServices.Api2AiDsl.lsp.CompletionProvider!;
    return completionProvider.getCompletion(document as LangiumDocument, params);
}

describe('Completion for operation path', () => {
    test('lists OpenAPI routes for GET', async () => {
        const header = `\nopenapi "./langium-test-mini.openapi.yaml"\n\nGET "`;
        const inner = `/pet`;
        const tail = `" {\n    toolName: t\n    intent: "x"\n    access: public\n}`;
        const content = header + inner + tail;
        const offset = header.length + Math.max(1, Math.floor(inner.length / 2));

        const list = await completionAt(content, offset);

        const labels = openApiPathLabels(list?.items ?? []);
        expect(labels.length).toBeGreaterThan(0);
        expect(labels.some((l) => l.includes('/pet/{petId}'))).toBe(true);
    });

    test('filters POST routes by typed prefix', async () => {
        const header = `\nopenapi "./langium-test-mini.openapi.yaml"\n\nPOST "`;
        const inner = `/pe`;
        const tail = `" {\n    toolName: t\n    intent: "x"\n    access: public\n}`;
        const content = header + inner + tail;
        const offset = header.length + Math.max(1, inner.length - 1);

        const list = await completionAt(content, offset);

        const labels = openApiPathLabels(list?.items ?? []);
        expect(labels.length).toBeGreaterThan(0);
        expect(labels.every((l) => l.includes('/pet'))).toBe(true);
    });

    test('inserts quoted paths after GET when path is not parsed yet (Ctrl+Space after verb)', async () => {
        const header = `\nopenapi "./langium-test-mini.openapi.yaml"\n\nGET `;
        const content = header;
        const offset = content.length;

        const list = await completionAt(content, offset);

        const labels = openApiPathLabels(list?.items ?? []);
        expect(labels.length).toBeGreaterThan(0);
        expect(labels.some((l) => l.includes('/pet/{petId}'))).toBe(true);
        const first = list?.items?.find((i) => typeof i.label === 'string' && String(i.label).includes('/pet'));
        expect(first && 'textEdit' in first && first.textEdit && 'newText' in first.textEdit).toBe(true);
        if (first && 'textEdit' in first && first.textEdit && 'newText' in first.textEdit) {
            expect(String(first.textEdit.newText).startsWith('"')).toBe(true);
        }
    });

    test('lists routes for an unfinished path literal before the operation can parse', async () => {
        const content = `\nopenapi "./langium-test-mini.openapi.yaml"\n\nGET "/pe`;
        const list = await completionAt(content, content.length);

        const labels = openApiPathLabels(list?.items ?? []);
        expect(labels.length).toBeGreaterThan(0);
        expect(labels.some((label) => label.includes('/pet/{petId}'))).toBe(true);
    });

    test('lists routes when caret is on the Operation opening brace after the path', async () => {
        const header = `\nopenapi "./langium-test-mini.openapi.yaml"\n\nGET "/pe" `;
        const braceAndBody = `{\n    toolName: t\n    intent: "x"\n    access: public\n}`;
        const content = header + braceAndBody;
        const offset = content.indexOf('{');

        const list = await completionAt(content, offset);

        const labels = openApiPathLabels(list?.items ?? []);
        expect(labels.length).toBeGreaterThan(0);
        expect(labels.some((l) => l.includes('/pet/{petId}'))).toBe(true);
    });

    test('suggests auth location header or query after in colon', async () => {
        const marker = '/*caret*/';
        const content = `\nopenapi "./langium-test-mini.openapi.yaml"\nauth {\n    in: ${marker}\n}\nGET "/pet/{petId}" {\n    toolName: t\n    intent: "x"\n    access: public\n}`;
        const list = await completionAt(content.replace(marker, ''), content.indexOf(marker));
        const labels = (list?.items ?? []).map((item) => String(item.label));
        expect(labels).toContain('header');
        expect(labels).toContain('query');
    });
});

describe('Completion for block keywords', () => {
    test('sorts auth keywords in canonical order', async () => {
        const marker = '/*caret*/';
        const content = `\nopenapi "./langium-test-mini.openapi.yaml"\nauth {\n    ${marker}\n}\nGET "/pet/{petId}" {\n    toolName: t\n    intent: "x"\n    access: public\n}`;
        const list = await completionAt(content.replace(marker, ''), content.indexOf(marker));

        expect(
            sortedKeywordLabels(list?.items ?? []).filter((label) => ['in', 'name', 'prefix'].includes(label))
        ).toEqual(['in', 'name', 'prefix']);
    });

    test('sorts auth keywords even when the block is incomplete', async () => {
        const marker = '/*caret*/';
        const content = `\nopenapi "./langium-test-mini.openapi.yaml"\nauth {\n    name: "Authorization"\n    ${marker}`;
        const list = await completionAt(content.replace(marker, ''), content.indexOf(marker));

        expect(
            sortedKeywordLabels(list?.items ?? []).filter((label) => ['in', 'name', 'prefix'].includes(label))
        ).toEqual(['in', 'prefix']);
    });

    test('sorts operation keywords in canonical order', async () => {
        const marker = '/*caret*/';
        const content = `\nopenapi "./langium-test-mini.openapi.yaml"\nGET "/pet/{petId}" {\n    ${marker}\n    access: public\n}`;
        const list = await completionAt(content.replace(marker, ''), content.indexOf(marker));

        expect(
            sortedKeywordLabels(list?.items ?? []).filter((label) =>
                [
                    'toolName',
                    'access',
                    'hooks',
                    'intent',
                    'summary',
                    'description',
                    'example',
                    'params',
                    'body',
                    'response'
                ].includes(label)
            )
        ).toEqual([
            'toolName',
            'access',
            'hooks',
            'intent',
            'summary',
            'description',
            'example',
            'params',
            'body',
            'response'
        ]);
    });

    test('sorts operation keywords before the block is complete', async () => {
        const marker = '/*caret*/';
        const content = `\nopenapi "./langium-test-mini.openapi.yaml"\nGET "/pet/{petId}" {\n    ${marker}`;
        const list = await completionAt(content.replace(marker, ''), content.indexOf(marker));

        expect(
            sortedKeywordLabels(list?.items ?? []).filter((label) =>
                [
                    'toolName',
                    'access',
                    'hooks',
                    'intent',
                    'summary',
                    'description',
                    'example',
                    'params',
                    'body',
                    'response'
                ].includes(label)
            )
        ).toEqual([
            'toolName',
            'access',
            'hooks',
            'intent',
            'summary',
            'description',
            'example',
            'params',
            'body',
            'response'
        ]);
    });

    test('suggests access kinds after access colon', async () => {
        const marker = '/*caret*/';
        const content = `\nopenapi "./langium-test-mini.openapi.yaml"\nGET "/pet/{petId}" {\n    toolName: getPetById\n    access: ${marker}\n    intent: "get one pet"\n}`;
        const list = await completionAt(content.replace(marker, ''), content.indexOf(marker));
        const labels = (list?.items ?? []).map((item) => String(item.label));
        expect(labels).toEqual(expect.arrayContaining(['public', 'protected']));
    });

    test('suggests clientMayOmit inside prepareToolCall block', async () => {
        const marker = '/*caret*/';
        const content = `\nopenapi "./langium-test-mini.openapi.yaml"\nGET "/pet/{petId}" {\n    toolName: getPetById\n    access: public\n    hooks: {\n        prepareToolCall: {\n            ${marker}\n        }\n    }\n    intent: "get one pet"\n}`;
        const list = await completionAt(content.replace(marker, ''), content.indexOf(marker));
        const labels = (list?.items ?? []).map((item) => String(item.label));
        expect(labels).toContain('clientMayOmit');
    });

    test('suggests required OpenAPI params inside clientMayOmit list', async () => {
        const marker = '/*caret*/';
        const content = `\nopenapi "./langium-test-mini.openapi.yaml"\nGET "/pet/{petId}" {\n    toolName: getPetById\n    access: public\n    hooks: {\n        prepareToolCall: {\n            clientMayOmit: [${marker}]\n        }\n    }\n    intent: "get one pet"\n}`;
        const list = await completionAt(content.replace(marker, ''), content.indexOf(marker));
        const labels = (list?.items ?? []).map((item) => String(item.label));
        expect(labels).toContain('petId');
    });

    test('suggests required OpenAPI params for empty clientMayOmit list slot', async () => {
        const marker = '/*caret*/';
        const content = `\nopenapi "./langium-test-mini.openapi.yaml"\nGET "/pet/{petId}" {\n    toolName: getPetById\n    access: public\n    hooks: {\n        prepareToolCall: {\n            clientMayOmit: [${marker}]\n        }\n    }\n    intent: "get one pet"\n}`;
        const list = await completionAt(content.replace(marker, ''), content.indexOf(marker));
        const labels = (list?.items ?? []).map((item) => String(item.label));
        expect(labels).toContain('petId');
    });

    test('suggests required OpenAPI params when editing existing clientMayOmit value', async () => {
        const marker = '/*caret*/';
        const content = `\nopenapi "./langium-test-mini.openapi.yaml"\nGET "/pet/{petId}" {\n    toolName: getPetById\n    access: public\n    hooks: {\n        prepareToolCall: {\n            clientMayOmit: [pet${marker}]\n        }\n    }\n    intent: "get one pet"\n}`;
        const list = await completionAt(content.replace(marker, ''), content.indexOf(marker));
        const labels = (list?.items ?? []).map((item) => String(item.label));
        expect(labels).toContain('petId');
    });
});
