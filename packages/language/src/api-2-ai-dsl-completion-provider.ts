import path from 'node:path';
import type { CompletionParams, CompletionItem, Position } from 'vscode-languageserver';
import { CompletionItemKind, CompletionList, InsertTextFormat, TextEdit } from 'vscode-languageserver';
import type { CompletionProviderOptions } from 'langium/lsp';
import { DefaultCompletionProvider } from 'langium/lsp';
import type { AstNode, CstNode, LangiumDocument, LeafCstNode } from 'langium';
import { AstUtils, Cancellation, CstUtils, isLeafCstNode } from 'langium';
import { loadOpenApi, pathsForHttpMethod } from './openapi.js';
import { isModel, isOperation, type HttpMethod, type Operation } from './generated/ast.js';

const HTTP_METHOD_LEAVES = new Set<HttpMethod>(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', 'TRACE']);

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

/** Last quoted STRING leaf before the Operation block `{` (the path), skipping WS/comments in between. */
function pathStringLeafBeforeBrace(operation: Operation, brace: LeafCstNode): LeafCstNode | undefined {
    let best: LeafCstNode | undefined;
    for (const n of CstUtils.flattenCst(operation.$cstNode!)) {
        if (!isLeafCstNode(n)) {
            continue;
        }
        if (n.offset < brace.offset && isQuotedOperationPath(n, operation)) {
            if (!best || n.offset > best.offset) {
                best = n;
            }
        }
    }
    return best;
}

/** Leaf for the quoted path token, including when the caret sits on `{` or on whitespace between path and `{`. */
function resolveOperationPathStringLeaf(root: CstNode, operation: Operation, offset: number): LeafCstNode | undefined {
    const brace = openingBraceLeaf(operation.$cstNode);
    if (!brace) {
        return undefined;
    }
    const leafAt =
        CstUtils.findLeafNodeAtOffset(root, offset) ??
        CstUtils.findLeafNodeBeforeOffset(root, offset);
    if (leafAt && isLeafCstNode(leafAt) && isQuotedOperationPath(leafAt, operation)) {
        return leafAt;
    }
    if (offset > brace.offset) {
        return undefined;
    }
    return pathStringLeafBeforeBrace(operation, brace);
}

/** Keyword leaf for `operation.method` before the block `{` (path slot). */
function findHttpMethodKeywordLeaf(operation: Operation, brace: LeafCstNode | undefined): LeafCstNode | undefined {
    const limit = brace?.offset ?? Number.MAX_SAFE_INTEGER;
    let found: LeafCstNode | undefined;
    for (const n of CstUtils.flattenCst(operation.$cstNode!)) {
        if (!isLeafCstNode(n) || n.offset >= limit) {
            continue;
        }
        if (HTTP_METHOD_LEAVES.has(n.text as HttpMethod) && n.text === operation.method) {
            found = n;
        }
    }
    return found;
}

/** Cursor in the path slot after the verb and only whitespace, before `{`, when `path` is not set yet (incomplete parse). */
function cursorAwaitingQuotedPath(
    operation: Operation,
    brace: LeafCstNode | undefined,
    methodLeaf: LeafCstNode,
    offset: number,
    textDoc: LangiumDocument['textDocument'],
    position: Position
): boolean {
    if (typeof operation.path === 'string' && operation.path.trim().length > 0) {
        return false;
    }
    if (brace !== undefined && offset > brace.offset) {
        return false;
    }
    const methodEndExclusive = methodLeaf.offset + methodLeaf.text.length;
    if (offset < methodEndExclusive) {
        return false;
    }
    const between = textDoc.getText({
        start: textDoc.positionAt(methodEndExclusive),
        end: position
    });
    return /^\s*$/.test(between);
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
        const leafAt =
            CstUtils.findLeafNodeAtOffset(root, offset) ??
            CstUtils.findLeafNodeBeforeOffset(root, offset);
        if (!leafAt || !isLeafCstNode(leafAt)) {
            debugCompletion('buildOpenApiPathCompletionItems: no leaf at offset', offset);
            return [];
        }

        const operation = AstUtils.getContainerOfType(leafAt.astNode as AstNode, isOperation);
        if (!operation) {
            debugCompletion('buildOpenApiPathCompletionItems: not inside Operation', {
                leafPreview: leafAt.text.slice(0, 24)
            });
            return [];
        }

        const model = operation.$container;
        if (!isModel(model)) {
            debugCompletion('buildOpenApiPathCompletionItems: model missing');
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

        const brace = openingBraceLeaf(operation.$cstNode);
        const pathLeaf = resolveOperationPathStringLeaf(root, operation, offset);
        if (pathLeaf) {
            const quoteChar = pathLeaf.text.charAt(0);
            if (pathLeaf.text.length < 2) {
                debugCompletion('buildOpenApiPathCompletionItems: string literal too short');
                return [];
            }
            const innerStart = pathLeaf.offset + 1;
            const closingQuoteOffset = pathLeaf.offset + pathLeaf.text.length - 1;
            const prefixEndOffset = Math.min(offset, closingQuoteOffset);
            const typedPrefix = textDoc.getText({
                start: textDoc.positionAt(innerStart),
                end: textDoc.positionAt(prefixEndOffset)
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

            debugCompletion('buildOpenApiPathCompletionItems: replace path literal', {
                count: filtered.length,
                method: operation.method
            });

            return filtered.map(route => ({
                label: `${quoteChar}${route}${quoteChar}`,
                kind: CompletionItemKind.Value,
                detail: `${operation.method} OpenAPI`,
                insertTextFormat: InsertTextFormat.PlainText,
                sortText: '0',
                textEdit: TextEdit.replace(pathLeaf.range, `${quoteChar}${route}${quoteChar}`)
            }));
        }

        const methodLeaf = findHttpMethodKeywordLeaf(operation, brace);
        if (
            methodLeaf &&
            cursorAwaitingQuotedPath(operation, brace, methodLeaf, offset, textDoc, position) &&
            candidates.length > 0
        ) {
            debugCompletion('buildOpenApiPathCompletionItems: insert quoted path after method', {
                count: candidates.length,
                method: operation.method
            });
            const quoteChar = '"';
            return candidates.map(route => ({
                label: `${quoteChar}${route}${quoteChar}`,
                kind: CompletionItemKind.Value,
                detail: `${operation.method} OpenAPI`,
                insertTextFormat: InsertTextFormat.PlainText,
                sortText: '0',
                textEdit: TextEdit.insert(position, `${quoteChar}${route}${quoteChar}`)
            }));
        }

        debugCompletion('buildOpenApiPathCompletionItems: not operation path string', {
            leafPreview: leafAt.text.slice(0, 24),
            isOp: true,
            resolvedPathLeaf: false
        });
        return [];
    }
}
