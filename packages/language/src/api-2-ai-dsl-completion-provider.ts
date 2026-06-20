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
const HTTP_METHODS = [...HTTP_METHOD_LEAVES];
const CANONICAL_KEYWORD_SORT: Record<string, string> = {
    in: '0100',
    name: '0101',
    prefix: '0102',
    toolName: '0200',
    access: '0201',
    intent: '0202',
    summary: '0203',
    description: '0204',
    example: '0205',
    params: '0206',
    body: '0207',
    response: '0208',
    optionalParams: '0300',
    public: '0210',
    protected: '0211',
    checked: '0212'
};
const ACCESS_KIND_INSERT: Record<string, string> = {
    public: 'public',
    protected: 'protected',
    checked: 'checked {\n    optionalParams: [$1]\n}'
};
const CHECKED_BODY_KEYWORD_INSERT: Record<string, string> = {
    optionalParams: 'optionalParams: [$1]$0'
};
const AUTH_KEYWORD_INSERT: Record<string, string> = {
    in: 'in: $1$0',
    name: 'name: "$1"$0',
    prefix: 'prefix: "$1"$0'
};
const OPERATION_KEYWORD_INSERT: Record<string, string> = {
    toolName: 'toolName: $1$0',
    access: 'access: public$0',
    intent: 'intent: "$1"$0',
    summary: 'summary: "$1"$0',
    description: 'description: "$1"$0',
    example: 'example: "$1"$0',
    params: 'params: {\n    page: {\n        description: "$1"\n        optional: false\n    }\n}$0',
    body: 'body: "$1"$0',
    response: 'response: "$1"$0'
};

function debugCompletion(message: string, data?: unknown): void {
    if (process.env.API2AI_DSL_DEBUG_COMPLETION === '1') {
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
    const leafAt = CstUtils.findLeafNodeAtOffset(root, offset) ?? CstUtils.findLeafNodeBeforeOffset(root, offset);
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

function lineStartOffset(text: string, offset: number): number {
    return text.lastIndexOf('\n', Math.max(0, offset - 1)) + 1;
}

function currentLineUntilOffset(text: string, offset: number): { line: string; lineStart: number } {
    const lineStart = lineStartOffset(text, offset);
    return { line: text.slice(lineStart, offset), lineStart };
}

function textHasUnclosedString(value: string): boolean {
    let quote: '"' | "'" | undefined;
    let escaped = false;
    for (const char of value) {
        if (escaped) {
            escaped = false;
            continue;
        }
        if (char === '\\') {
            escaped = true;
            continue;
        }
        if (quote) {
            if (char === quote) {
                quote = undefined;
            }
            continue;
        }
        if (char === '"' || char === "'") {
            quote = char;
        }
    }
    return quote !== undefined;
}

function currentWordRange(
    text: string,
    offset: number,
    textDoc: LangiumDocument['textDocument']
): {
    prefix: string;
    range: ReturnType<typeof TextEdit.replace>['range'];
} {
    const { line } = currentLineUntilOffset(text, offset);
    const prefix = /[A-Za-z]*$/.exec(line)?.[0] ?? '';
    const startOffset = offset - prefix.length;
    return {
        prefix,
        range: {
            start: textDoc.positionAt(startOffset),
            end: textDoc.positionAt(offset)
        }
    };
}

type IncompleteBlockContext = {
    kind: 'auth' | 'operation';
    openBraceOffset: number;
};

function findLastIncompleteBlockContext(text: string, offset: number): IncompleteBlockContext | undefined {
    const before = text.slice(0, offset);
    const candidates: IncompleteBlockContext[] = [];
    const authRegex = /\bauth\s*\{/g;
    const operationRegex = new RegExp(`\\b(?:${HTTP_METHODS.join('|')})\\s+["'][^"']*["']\\s*\\{`, 'g');

    for (const match of before.matchAll(authRegex)) {
        const openBraceOffset = (match.index ?? 0) + match[0].lastIndexOf('{');
        candidates.push({ kind: 'auth', openBraceOffset });
    }
    for (const match of before.matchAll(operationRegex)) {
        const openBraceOffset = (match.index ?? 0) + match[0].lastIndexOf('{');
        candidates.push({ kind: 'operation', openBraceOffset });
    }

    candidates.sort((a, b) => b.openBraceOffset - a.openBraceOffset);
    return candidates.find((candidate) => !text.slice(candidate.openBraceOffset + 1, offset).includes('}'));
}

function usedBlockKeywords(blockText: string, keys: readonly string[]): Set<string> {
    const used = new Set<string>();
    const pattern = new RegExp(`\\b(${keys.join('|')})\\b\\s*:`, 'g');
    for (const match of blockText.matchAll(pattern)) {
        used.add(match[1]);
    }
    return used;
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
        const incompletePathItems = await this.buildIncompleteOpenApiPathCompletionItems(document, params.position);
        debugCompletion('getCompletion incompletePathItems count', incompletePathItems.length);
        if (incompletePathItems.length > 0) {
            return CompletionList.create(this.deduplicateItems(incompletePathItems), false);
        }

        const pathItems = await this.buildOpenApiPathCompletionItems(document, params.position);
        debugCompletion('getCompletion pathItems count', pathItems.length);
        if (pathItems.length > 0) {
            return CompletionList.create(this.deduplicateItems(pathItems), false);
        }
        const accessKindItems = this.buildAccessKindCompletionItems(document, params.position);
        debugCompletion('getCompletion accessKindItems count', accessKindItems.length);
        if (accessKindItems.length > 0) {
            return CompletionList.create(this.deduplicateItems(accessKindItems), false);
        }
        const checkedBodyItems = this.buildCheckedAccessBodyKeywordCompletionItems(document, params.position);
        debugCompletion('getCompletion checkedBodyItems count', checkedBodyItems.length);
        if (checkedBodyItems.length > 0) {
            return CompletionList.create(this.deduplicateItems(checkedBodyItems), false);
        }
        const optionalParamItems = await this.buildOptionalParamCompletionItems(document, params.position);
        debugCompletion('getCompletion optionalParamItems count', optionalParamItems.length);
        if (optionalParamItems.length > 0) {
            return CompletionList.create(this.deduplicateItems(optionalParamItems), false);
        }
        const keywordItems = this.buildIncompleteBlockKeywordCompletionItems(document, params.position);
        debugCompletion('getCompletion keywordItems count', keywordItems.length);
        if (keywordItems.length > 0) {
            return CompletionList.create(this.deduplicateItems(keywordItems), false);
        }

        const fallback = await super.getCompletion(document, params, cancelToken);
        debugCompletion('getCompletion fallback item count', fallback?.items?.length ?? 0);
        return this.withCanonicalKeywordSort(fallback);
    }

    private withCanonicalKeywordSort(completions: CompletionList | undefined): CompletionList | undefined {
        if (!completions) {
            return undefined;
        }
        return CompletionList.create(
            completions.items.map((item) => {
                if (item.kind !== CompletionItemKind.Keyword || typeof item.label !== 'string') {
                    return item;
                }
                const sortText = CANONICAL_KEYWORD_SORT[item.label];
                return sortText ? { ...item, sortText } : item;
            }),
            completions.isIncomplete
        );
    }

    private async buildIncompleteOpenApiPathCompletionItems(
        document: LangiumDocument,
        position: Position
    ): Promise<CompletionItem[]> {
        const model = document.parseResult.value;
        if (!isModel(model) || !document.uri.fsPath) {
            return [];
        }

        const textDoc = document.textDocument;
        const text = textDoc.getText();
        const offset = textDoc.offsetAt(position);
        const { line, lineStart } = currentLineUntilOffset(text, offset);
        const methodPattern = HTTP_METHODS.join('|');
        const match = new RegExp(`^\\s*(${methodPattern})\\s+(?:(["'])([^"']*)?)?$`).exec(line);
        if (!match) {
            return [];
        }

        let loaded;
        try {
            loaded = await loadOpenApi(model.openapi, path.dirname(document.uri.fsPath));
        } catch {
            return [];
        }

        const method = match[1] as HttpMethod;
        const quote = match[2] ?? '"';
        const typedPrefix = match[3] ?? '';
        const candidates = pathsForHttpMethod(loaded.operations, method);
        const filtered =
            typedPrefix.length > 0 ? candidates.filter((candidate) => candidate.startsWith(typedPrefix)) : candidates;
        const quoteIndex = line.search(/["']/);
        const replaceStart = quoteIndex >= 0 ? lineStart + quoteIndex : offset;
        const range = {
            start: textDoc.positionAt(replaceStart),
            end: position
        };

        return filtered.map((route) => ({
            label: `${quote}${route}${quote}`,
            kind: CompletionItemKind.Value,
            detail: `${method} OpenAPI`,
            insertTextFormat: InsertTextFormat.PlainText,
            sortText: '0',
            textEdit: TextEdit.replace(range, `${quote}${route}${quote}`)
        }));
    }

    private buildIncompleteBlockKeywordCompletionItems(
        document: LangiumDocument,
        position: Position
    ): CompletionItem[] {
        const textDoc = document.textDocument;
        const text = textDoc.getText();
        const offset = textDoc.offsetAt(position);
        const { line } = currentLineUntilOffset(text, offset);
        if (textHasUnclosedString(line)) {
            return [];
        }

        const context = findLastIncompleteBlockContext(text, offset);
        if (!context) {
            return [];
        }

        const keys = context.kind === 'auth' ? Object.keys(AUTH_KEYWORD_INSERT) : Object.keys(OPERATION_KEYWORD_INSERT);
        const inserts = context.kind === 'auth' ? AUTH_KEYWORD_INSERT : OPERATION_KEYWORD_INSERT;
        const blockText = text.slice(context.openBraceOffset + 1, offset);
        const used = usedBlockKeywords(blockText, keys);
        const { prefix, range } = currentWordRange(text, offset, textDoc);
        const candidates = keys.filter((key) => !used.has(key) && key.startsWith(prefix));

        return candidates.map((key) => ({
            label: key,
            kind: CompletionItemKind.Keyword,
            detail: context.kind === 'auth' ? 'Auth block property' : 'Operation block property',
            insertTextFormat: InsertTextFormat.Snippet,
            sortText: CANONICAL_KEYWORD_SORT[key],
            insertText: inserts[key],
            textEdit: TextEdit.replace(range, inserts[key])
        }));
    }

    private buildAccessKindCompletionItems(document: LangiumDocument, position: Position): CompletionItem[] {
        const textDoc = document.textDocument;
        const text = textDoc.getText();
        const offset = textDoc.offsetAt(position);
        const { line } = currentLineUntilOffset(text, offset);
        if (textHasUnclosedString(line)) {
            return [];
        }
        const match = /^\s*access\s*:\s*(\w*)$/.exec(line);
        if (!match) {
            return [];
        }
        const typedPrefix = match[1] ?? '';
        const { prefix, range } = currentWordRange(text, offset, textDoc);
        const effectivePrefix = typedPrefix.length > 0 ? typedPrefix : prefix;
        const keys = Object.keys(ACCESS_KIND_INSERT).filter((key) => key.startsWith(effectivePrefix));
        if (keys.length === 0) {
            return [];
        }
        return keys.map((key) => ({
            label: key,
            kind: CompletionItemKind.EnumMember,
            detail: 'Access level',
            insertTextFormat: key === 'checked' ? InsertTextFormat.Snippet : InsertTextFormat.PlainText,
            sortText: CANONICAL_KEYWORD_SORT[key],
            insertText: ACCESS_KIND_INSERT[key],
            textEdit: TextEdit.replace(range, ACCESS_KIND_INSERT[key])
        }));
    }

    private buildCheckedAccessBodyKeywordCompletionItems(
        document: LangiumDocument,
        position: Position
    ): CompletionItem[] {
        const textDoc = document.textDocument;
        const text = textDoc.getText();
        const offset = textDoc.offsetAt(position);
        const { line } = currentLineUntilOffset(text, offset);
        if (textHasUnclosedString(line)) {
            return [];
        }
        const root = document.parseResult.value?.$cstNode;
        if (!root) {
            return [];
        }
        const leafAt = CstUtils.findLeafNodeAtOffset(root, offset) ?? CstUtils.findLeafNodeBeforeOffset(root, offset);
        const operation = leafAt ? AstUtils.getContainerOfType(leafAt.astNode as AstNode, isOperation) : undefined;
        if (!operation) {
            return [];
        }
        const operationStart = operation.$cstNode?.offset ?? 0;
        const beforeCursor = text.slice(operationStart, offset);
        const checkedBlockMatch = /access\s*:\s*checked\s*\{[^}]*$/.exec(beforeCursor);
        if (!checkedBlockMatch) {
            return [];
        }
        const openBraceOffset = beforeCursor.lastIndexOf('{');
        if (openBraceOffset < 0) {
            return [];
        }
        const blockText = beforeCursor.slice(openBraceOffset + 1);
        if (/\boptionalParams\b\s*:/.test(blockText)) {
            return [];
        }
        const { prefix, range } = currentWordRange(text, offset, textDoc);
        if (prefix.length > 0 && !'optionalParams'.startsWith(prefix)) {
            return [];
        }
        const insert = CHECKED_BODY_KEYWORD_INSERT.optionalParams;
        return [
            {
                label: 'optionalParams',
                kind: CompletionItemKind.Keyword,
                detail: 'OpenAPI parameters optional in the tool schema',
                insertTextFormat: InsertTextFormat.Snippet,
                sortText: CANONICAL_KEYWORD_SORT.optionalParams,
                insertText: insert,
                textEdit: TextEdit.replace(range, insert)
            }
        ];
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
        const leafAt = CstUtils.findLeafNodeAtOffset(root, offset) ?? CstUtils.findLeafNodeBeforeOffset(root, offset);
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
            let filtered = typedPrefix.length === 0 ? candidates : candidates.filter((p) => p.startsWith(typedPrefix));
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

            return filtered.map((route) => ({
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
            return candidates.map((route) => ({
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

    private async buildOptionalParamCompletionItems(
        document: LangiumDocument,
        position: Position
    ): Promise<CompletionItem[]> {
        const root = document.parseResult.value?.$cstNode;
        if (!root) {
            return [];
        }
        const textDoc = document.textDocument;
        const offset = textDoc.offsetAt(position);
        const leafAt = CstUtils.findLeafNodeAtOffset(root, offset) ?? CstUtils.findLeafNodeBeforeOffset(root, offset);
        if (!leafAt || !isLeafCstNode(leafAt)) {
            return [];
        }
        const operation = AstUtils.getContainerOfType(leafAt.astNode as AstNode, isOperation);
        if (!operation) {
            return [];
        }
        const model = operation.$container;
        if (!isModel(model) || !document.uri.fsPath) {
            return [];
        }
        const operationStart = operation.$cstNode?.offset ?? 0;
        const beforeCursor = textDoc.getText({
            start: textDoc.positionAt(operationStart),
            end: position
        });
        if (!/optionalParams\s*:\s*\[[^\]]*$/m.test(beforeCursor)) {
            return [];
        }

        let openApiRequiredNames: string[] = [];
        try {
            const loaded = await loadOpenApi(model.openapi, path.dirname(document.uri.fsPath));
            const key = `${operation.method} ${operation.path}`;
            const details = loaded.operations.get(key);
            if (details) {
                openApiRequiredNames = details.parameters.filter((p) => p.required).map((p) => p.name);
            }
        } catch {
            return [];
        }
        const { line } = currentLineUntilOffset(textDoc.getText(), offset);
        const idPrefixMatch = /(?:\[\s*|,\s*)([a-zA-Z_][a-zA-Z0-9_]*)$/.exec(line);
        const listPositionMatch = /(?:\[\s*|,\s*)$/.test(line);
        if (!idPrefixMatch && !listPositionMatch) {
            return [];
        }
        const typedPrefix = idPrefixMatch?.[1] ?? '';
        const candidates = [...new Set(openApiRequiredNames)]
            .filter((name) => name.startsWith(typedPrefix))
            .sort((a, b) => a.localeCompare(b));
        if (candidates.length === 0) {
            return [];
        }
        const replaceStart = idPrefixMatch ? offset - typedPrefix.length : offset;
        const range = {
            start: textDoc.positionAt(replaceStart),
            end: position
        };
        return candidates.map((name) => ({
            label: name,
            kind: CompletionItemKind.Value,
            detail: 'Required OpenAPI parameter',
            insertTextFormat: InsertTextFormat.PlainText,
            textEdit: TextEdit.replace(range, name)
        }));
    }
}
