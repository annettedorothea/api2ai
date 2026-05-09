import path from 'node:path';
import type { CompletionParams, CompletionItem, Position } from 'vscode-languageserver';
import { CompletionItemKind, CompletionList, InsertTextFormat, TextEdit } from 'vscode-languageserver';
import type { CompletionProviderOptions } from 'langium/lsp';
import { DefaultCompletionProvider } from 'langium/lsp';
import type { AstNode, CstNode, LangiumDocument, LeafCstNode } from 'langium';
import { AstUtils, Cancellation, CstUtils, isLeafCstNode } from 'langium';
import { loadOpenApi, pathsForHttpMethod } from './openapi.js';
import { isModel, isOperation, type Operation } from './generated/ast.js';

function debugCompletion(message: string, data?: unknown): void {
    if (process.env.API2AI_DSL_DEBUG_COMPLETION === '1') {
        // eslint-disable-next-line no-console
        console.log(`[api2ai-dsl completion] ${message}`, data !== undefined ? data : '');
    }
}

/** First `{` of the Operation rule encloses intent/toolName/etc.; path is always before it (Langium CST uses RuleCall, not Assignment, on STRING leaves). */
function openingBraceLeaf(operationCst: CstNode | undefined): LeafCstNode | undefined {
    if (!operationCst) {
        return undefined;
    }
    for (const n of CstUtils.flattenCst(operationCst)) {
        if (isLeafCstNode(n) && n.text === '{') {
            return n;
        }
    }
    return undefined;
}

function isQuotedOperationPath(leaf: LeafCstNode, operation: Operation): boolean {
    const q = leaf.text.charAt(0);
    if (q !== '"' && q !== "'") {
        return false;
    }
    const brace = openingBraceLeaf(operation.$cstNode);
    return !!brace && leaf.offset < brace.offset;
}

export class Api2AiDslCompletionProvider extends DefaultCompletionProvider {
    override readonly completionOptions: CompletionProviderOptions = {
        triggerCharacters: ['/']
    };

    override async getCompletion(
        document: LangiumDocument,
        params: CompletionParams,
        cancelToken?: Cancellation.CancellationToken
    ): Promise<CompletionList | undefined> {
        const pathItems = await this.buildOpenApiPathCompletionItems(document, params.position);
        debugCompletion('getCompletion pathItems count', pathItems.length);
        if (pathItems.length > 0) {
            return CompletionList.create(this.deduplicateItems(pathItems), false);
        }
        const fallback = await super.getCompletion(document, params, cancelToken);
        debugCompletion('getCompletion fallback item count', fallback?.items?.length ?? 0);
        return fallback;
    }

    private async buildOpenApiPathCompletionItems(
        document: LangiumDocument,
        position: Position
    ): Promise<CompletionItem[]> {
        const root = document.parseResult.value?.$cstNode;
        if (!root) {
            debugCompletion('buildOpenApiPathCompletionItems: no CST root');
            return [];
        }
        const textDoc = document.textDocument;
        const offset = textDoc.offsetAt(position);
        const leaf =
            CstUtils.findLeafNodeAtOffset(root, offset) ??
            CstUtils.findLeafNodeBeforeOffset(root, offset);
        if (!leaf || !isLeafCstNode(leaf)) {
            debugCompletion('buildOpenApiPathCompletionItems: no leaf at offset', offset);
            return [];
        }

        const operation = AstUtils.getContainerOfType(leaf.astNode as AstNode, isOperation);
        if (!operation || !isQuotedOperationPath(leaf, operation)) {
            debugCompletion('buildOpenApiPathCompletionItems: not operation path string', {
                leafPreview: leaf.text.slice(0, 24),
                isOp: !!operation,
                pathLike: operation ? isQuotedOperationPath(leaf, operation) : false
            });
            return [];
        }
        const model = operation.$container;
        if (!isModel(model)) {
            debugCompletion('buildOpenApiPathCompletionItems: model missing');
            return [];
        }

        const quoteChar = leaf.text.charAt(0);
        if (leaf.text.length < 2) {
            debugCompletion('buildOpenApiPathCompletionItems: string literal too short');
            return [];
        }

        const docPath = document.uri.fsPath;
        if (!docPath) {
            debugCompletion('buildOpenApiPathCompletionItems: document.uri has no fsPath', document.uri.toString());
            return [];
        }
        let loaded;
        try {
            loaded = await loadOpenApi(model.openapi, path.dirname(docPath));
        } catch (err) {
            debugCompletion('buildOpenApiPathCompletionItems: loadOpenApi failed', String(err));
            return [];
        }

        const candidates = pathsForHttpMethod(loaded.operations, operation.method);
        const innerStart = leaf.offset + 1;
        const typedPrefix = textDoc.getText({
            start: textDoc.positionAt(innerStart),
            end: position
        });
        let filtered =
            typedPrefix.length === 0 ? candidates : candidates.filter(p => p.startsWith(typedPrefix));
        if (filtered.length === 0 && candidates.length > 0) {
            debugCompletion('buildOpenApiPathCompletionItems: prefix matched nothing, showing all paths', {
                typedPrefix,
                method: operation.method
            });
            filtered = candidates;
        }

        debugCompletion('buildOpenApiPathCompletionItems: returning', {
            count: filtered.length,
            method: operation.method
        });

        return filtered.map(route => ({
            label: `${quoteChar}${route}${quoteChar}`,
            kind: CompletionItemKind.Value,
            detail: `${operation.method} OpenAPI`,
            insertTextFormat: InsertTextFormat.PlainText,
            sortText: '0',
            textEdit: TextEdit.replace(leaf.range, `${quoteChar}${route}${quoteChar}`)
        }));
    }
}
