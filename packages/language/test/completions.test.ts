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
        .filter(i => typeof i.detail === 'string' && i.detail.endsWith('OpenAPI'))
        .map(i => String(i.label));
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
        const header = `\nopenapi "./petstore-mini.openapi.yaml"\nbaseUrl "https://x"\n\nGET "`;
        const inner = `/pet`;
        const tail = `" {\n    intent: "x"\n    toolName: "t"\n}`;
        const content = header + inner + tail;
        // Caret inside path literal (at string end boundary, the lexer can attach the cursor to `"` outside the STRING leaf)
        const offset = header.length + Math.max(1, Math.floor(inner.length / 2));

        const list = await completionAt(content, offset);

        const labels = openApiPathLabels(list?.items ?? []);
        expect(labels.length).toBeGreaterThan(0);
        expect(labels.some(l => l.includes('/pet/{petId}'))).toBe(true);
    });

    test('filters POST routes by typed prefix', async () => {
        const header = `\nopenapi "./petstore-mini.openapi.yaml"\nbaseUrl "https://x"\n\nPOST "`;
        const inner = `/pe`;
        const tail = `" {\n    intent: "x"\n    toolName: "t"\n}`;
        const content = header + inner + tail;
        const offset = header.length + Math.max(1, inner.length - 1);

        const list = await completionAt(content, offset);

        const labels = openApiPathLabels(list?.items ?? []);
        expect(labels.length).toBeGreaterThan(0);
        expect(labels.every(l => l.includes('/pet'))).toBe(true);
    });
});
