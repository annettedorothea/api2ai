import type {
    Auth,
    OpenApiOperationDetails,
    OpenApiParameterDetails,
    OpenApiSchema,
    Operation
} from 'api-2-ai-dsl-language';
import {
    coerceExampleFromSchemaType,
    getAccessKind,
    isAfterToolCallEnabled,
    isCheckToolAccessEnabled,
    isPrepareToolCallEnabled,
    listHookParamEntries,
    parseApiParamSpec
} from 'api-2-ai-dsl-language';
import {
    enrichJsonSchemaPropertyDescription,
    formatMcpParameterDescriptionLine,
    resolveModuleVerifyCredentialNames
} from '@toolfactory.dev/core/codegen';
import {
    buildParamWireMaps,
    sanitizeWireParamNamesInText,
    toMcpParamName,
    type ParamWireMaps
} from './mcp-param-names.js';
import { isBinaryHttpSuccessResponse } from './generator/http-response-body-kind.js';

/** JSON-schema-like dict emitted into generated modules / MCP. */
export type JsonSchemaDict = Record<string, unknown>;

function isTruthyString(value: string | undefined): boolean {
    return value !== undefined && value.trim().length > 0;
}

function joinSections(sections: string[]): string {
    return sections.filter((s) => s.length > 0).join('\n\n');
}

function verifyCredentialStubAuthPath(hostProduct: string, mcpModuleName: string | undefined): string {
    if (!mcpModuleName) {
        return `src/hooks/${hostProduct}/<module>/verify*Credential.ts`;
    }
    const names = resolveModuleVerifyCredentialNames(`generated/${hostProduct}/tools/${mcpModuleName}.ts`);
    return `src/hooks/${hostProduct}/${mcpModuleName}/${names.fileBase}.ts`;
}

/**
 * MCP tool title: derived from `summary` with a consistent fallback chain.
 * Order: DSL `summary` → OpenAPI `summary` → OpenAPI `operationId` → `toolName`.
 * Empty / whitespace-only values fall through to the next step.
 *
 * Pre-condition: `operation` has passed validation, so `toolName` is present.
 */
export function buildMcpTitle(operation: Operation, details: OpenApiOperationDetails): string {
    if (isTruthyString(operation.summary)) {
        return operation.summary!.trim();
    }
    if (isTruthyString(details.summary)) {
        return details.summary!.trim();
    }
    if (isTruthyString(details.operationId)) {
        return details.operationId!.trim();
    }
    return operation.toolName!.trim();
}

/**
 * Override rule: any DSL value (including `""`) wins over OpenAPI. OpenAPI text
 * is only used when the DSL field is unset (`undefined`). An explicit empty
 * string therefore resolves to "no text" (e.g. suppresses the `API:` section).
 */
function pickEffectiveText(dslValue: string | undefined, openApiValue: string | undefined): string | undefined {
    if (dslValue !== undefined) {
        const trimmed = dslValue.trim();
        return trimmed.length === 0 ? undefined : trimmed;
    }
    const apiTrimmed = openApiValue?.trim();
    return apiTrimmed && apiTrimmed.length > 0 ? apiTrimmed : undefined;
}

function effectiveLongDescription(operation: Operation, details: OpenApiOperationDetails): string | undefined {
    return pickEffectiveText(operation.description, details.description);
}

function effectiveRequestBodyDescription(operation: Operation, details: OpenApiOperationDetails): string | undefined {
    return pickEffectiveText(operation.body, details.requestBody?.description);
}

/** DSL `response` replaces OpenAPI block when set; empty string suppresses the section. */
export function effectiveResponse(operation: Operation, details: OpenApiOperationDetails): string | undefined {
    if (operation.response !== undefined) {
        const trimmed = operation.response.trim();
        return trimmed.length > 0 ? trimmed : undefined;
    }
    return buildResponseSection(details);
}

function parseStatusCodeNumeric(statusCode: string): number | undefined {
    if (statusCode === 'default') {
        return undefined;
    }
    const n = Number.parseInt(statusCode, 10);
    return Number.isNaN(n) ? undefined : n;
}

function responseIsSuccess2xx(summary: { statusCode: string }): boolean {
    const n = parseStatusCodeNumeric(summary.statusCode);
    return n !== undefined && n >= 200 && n < 300;
}

function responseIsDocumentedError(summary: { statusCode: string }): boolean {
    if (summary.statusCode === 'default') {
        return true;
    }
    const n = parseStatusCodeNumeric(summary.statusCode);
    return n !== undefined && n >= 400;
}

const MAX_DOCUMENTED_ERROR_LINES = 8;
const MAX_ERROR_DESCRIPTION_CHARS = 80;

function truncateOneLine(text: string, maxChars: number): string {
    if (text.length <= maxChars) {
        return text;
    }
    return text.slice(0, Math.max(0, maxChars - 1)) + '…';
}

/** Compact 4xx/5xx/default lines from OpenAPI (status + truncated description); no response body schemas. */
function buildDocumentedErrorLines(details: OpenApiOperationDetails): string[] {
    const errors = details.responses.filter(responseIsDocumentedError);
    errors.sort((a, b) => {
        const aDef = a.statusCode === 'default';
        const bDef = b.statusCode === 'default';
        if (aDef && bDef) {
            return 0;
        }
        if (aDef) {
            return 1;
        }
        if (bDef) {
            return -1;
        }
        const na = parseStatusCodeNumeric(a.statusCode) ?? 0;
        const nb = parseStatusCodeNumeric(b.statusCode) ?? 0;
        return na - nb;
    });
    const lines: string[] = [];
    for (const r of errors.slice(0, MAX_DOCUMENTED_ERROR_LINES)) {
        const label = r.statusCode === 'default' ? 'default' : `HTTP ${r.statusCode}`;
        if (isTruthyString(r.description)) {
            lines.push(`${label} — ${truncateOneLine(r.description!.trim(), MAX_ERROR_DESCRIPTION_CHARS)}`);
        } else {
            lines.push(label);
        }
    }
    return lines;
}

/** Plan: 200 → 201 → other 2xx with application/json+schema → any 2xx with schema → any 2xx with contentType → any 2xx. */
function pickSuccessResponseForSummary(details: OpenApiOperationDetails): (typeof details.responses)[0] | undefined {
    const twoxx = details.responses.filter(responseIsSuccess2xx);
    if (twoxx.length === 0) {
        return undefined;
    }
    const s200 = twoxx.find((r) => parseStatusCodeNumeric(r.statusCode) === 200);
    if (s200) {
        return s200;
    }
    const s201 = twoxx.find((r) => parseStatusCodeNumeric(r.statusCode) === 201);
    if (s201) {
        return s201;
    }
    const withJsonSchema = twoxx.find((r) => r.contentType === 'application/json' && r.schema);
    if (withJsonSchema) {
        return withJsonSchema;
    }
    const withSchema = twoxx.find((r) => r.schema);
    if (withSchema) {
        return withSchema;
    }
    const withContentType = twoxx.find((r) => isTruthyString(r.contentType));
    if (withContentType) {
        return withContentType;
    }
    return twoxx[0];
}

function isBinaryResponseSchema(schema: OpenApiSchema | undefined, contentType: string | undefined): boolean {
    return isBinaryHttpSuccessResponse(schema?.format, contentType);
}

function topLevelShapeLine(schema: OpenApiSchema | undefined): string | undefined {
    if (!schema) {
        return undefined;
    }
    const s = schema;
    const t = schemaTypeFirst(s);
    if (s.$ref || s.oneOf || s.allOf || s.anyOf) {
        return 'shape: opaque (composition or reference)';
    }
    if (t === 'array') {
        const it = s.items ? (schemaTypeFirst(s.items) ?? 'item') : 'item';
        return `type: array of ${it}`;
    }
    if (t === 'object' || (!t && s.properties)) {
        const keys = Object.keys(s.properties ?? {});
        return keys.length > 0
            ? `properties (top-level): ${keys.sort().join(', ')}`
            : 'type: object (no inlined properties)';
    }
    if (s.format === 'binary' || s.format === 'byte') {
        return `type: ${t ?? 'string'} (format: ${s.format})`;
    }
    return t ? `type: ${t}` : undefined;
}

function buildSuccessResponseParagraph(details: OpenApiOperationDetails): string {
    const resp = pickSuccessResponseForSummary(details);
    if (!resp) {
        return '(no 2xx response in OpenAPI)';
    }
    const lines: string[] = [`HTTP ${resp.statusCode}`];
    if (isTruthyString(resp.description)) {
        lines.push(resp.description!.trim());
    }
    if (isTruthyString(resp.contentType)) {
        lines.push(`content-type: ${resp.contentType}`);
    }
    const shape = topLevelShapeLine(resp.schema);
    if (shape) {
        lines.push(shape);
    }
    if (isBinaryResponseSchema(resp.schema, resp.contentType)) {
        lines.push(
            'Binary body is returned as a Base64 envelope: { kind: "binary", encoding: "base64", contentType, filename?, byteLength, data }. Non-JSON/non-textual content-types use this envelope. Bodies over 5 MiB fail (override with TOOLFACTORY_HTTP_BODY_MAX_BYTES).'
        );
    }
    return lines.join('\n');
}

/** Success (2xx) summary plus capped documented error responses from OpenAPI. */
function buildResponseSection(details: OpenApiOperationDetails): string {
    const success = buildSuccessResponseParagraph(details);
    const errLines = buildDocumentedErrorLines(details);
    if (errLines.length === 0) {
        return success;
    }
    return [success, 'Documented errors:', ...errLines].join('\n');
}

const INVOKE_PARAMETER_LOCATION_ORDER: Record<string, number> = {
    path: 0,
    query: 1,
    header: 2
};

function compareInvokeParameters(a: OpenApiParameterDetails, b: OpenApiParameterDetails): number {
    const oa = INVOKE_PARAMETER_LOCATION_ORDER[a.in] ?? 9;
    const ob = INVOKE_PARAMETER_LOCATION_ORDER[b.in] ?? 9;
    if (oa !== ob) {
        return oa - ob;
    }
    return a.name.localeCompare(b.name);
}

function dslParamPatchesByName(operation: Operation): Map<string, ReturnType<typeof parseApiParamSpec>> {
    const map = new Map<string, ReturnType<typeof parseApiParamSpec>>();
    for (const entry of operation.params?.entries ?? []) {
        map.set(entry.key, parseApiParamSpec(entry.spec));
    }
    return map;
}

/** Rewrite legacy nested pathParams/query wording in DSL text for flat MCP tool arguments. */
export function flattenLegacyInvokeDescription(text: string): string {
    return text
        .replace(/pathParams\.([A-Za-z_][A-Za-z0-9_]*)/g, '$1')
        .replace(/query\.([A-Za-z_][A-Za-z0-9_]*)/g, '$1')
        .replace(/pathParams:\s*(\{[^}]+\})/g, '$1')
        .replace(/query:\s*(\{[^}]+\})/g, '$1')
        .replace(/path param pathParams\.([A-Za-z_][A-Za-z0-9_]*)/gi, 'path parameter $1')
        .replace(/as pathParams\.([A-Za-z_][A-Za-z0-9_]*)/gi, 'as flat argument $1');
}

/** Hint for LLM callers: OpenAPI params are flat tool args, not pathParams/query buckets. */
export function buildFlatCallShapeSection(operation: Operation, details: OpenApiOperationDetails): string | undefined {
    const hookNames = listHookParamEntries(operation).map((e) => e.name);
    const buckets = buildInvokeParamBuckets(details, hookNames);
    const flatArgs = [...buckets.pathParams, ...buckets.query, ...buckets.headers, ...buckets.hookParams];
    const hasBody = Boolean(details.requestBody?.schema);
    if (flatArgs.length === 0 && !hasBody) {
        return undefined;
    }
    const parts: string[] = [];
    if (flatArgs.length > 0) {
        parts.push(`pass ${flatArgs.join(', ')} as top-level tool arguments`);
    }
    if (buckets.hookParams.length > 0) {
        parts.push(`hookParams (${buckets.hookParams.join(', ')}) are MCP-only and are not sent on the HTTP request`);
    }
    if (hasBody) {
        parts.push('send the request payload in the `body` property');
    }
    return `${parts.join('; ')}. Do not nest path or query parameters under pathParams or query.`;
}

/** Flat parameter list for MCP tool description (path / query / header); matches flat MCP inputSchema properties. */
export function buildInvokeParameterDescriptionSection(
    operation: Operation,
    details: OpenApiOperationDetails
): string | undefined {
    const patches = dslParamPatchesByName(operation);
    const params = details.parameters
        .filter((p) => p.in === 'path' || p.in === 'query' || p.in === 'header')
        .sort(compareInvokeParameters);
    if (params.length === 0) {
        return undefined;
    }

    const lines: string[] = [];
    const { wireToMcp } = invokeParamWireMaps(details);
    for (const p of params) {
        const patch = patches.get(p.name);
        const propSchema = parameterPropertySchema(p, wireToMcp);
        let schemaForEnrich: JsonSchemaDict = { ...propSchema };
        const description = pickEffectiveText(patch?.description, p.description);
        if (description) {
            schemaForEnrich = {
                ...schemaForEnrich,
                description: sanitizeWireParamNamesInText(flattenLegacyInvokeDescription(description), wireToMcp)
            };
        }
        const exampleText = patch?.example?.trim();
        if (exampleText && exampleText.length > 0) {
            const coerced = coerceExampleFromSchemaType(exampleText, propSchema.type as string | string[] | undefined);
            schemaForEnrich = {
                ...schemaForEnrich,
                examples: [coerced ?? exampleText]
            };
        }
        const mcpName = wireToMcp[p.name] ?? toMcpParamName(p.name);
        const enriched = formatMcpParameterDescriptionLine(
            typeof schemaForEnrich.description === 'string' ? schemaForEnrich.description : undefined,
            schemaForEnrich
        );
        let line = `- ${mcpName} (${p.in})`;
        if (enriched) {
            line += `: ${enriched}`;
        }
        lines.push(line);
    }
    return lines.join('\n');
}

/** Pre-condition: `operation` has passed validation, so `intent` is present. */
export function buildMcpDescription(
    operation: Operation,
    details: OpenApiOperationDetails,
    auth: Auth | undefined,
    mcpModuleName: string | undefined
): string {
    const sections: string[] = [];

    sections.push(`Intent:\n${flattenLegacyInvokeDescription(operation.intent!.trim())}`);

    const callShape = buildFlatCallShapeSection(operation, details);
    if (callShape) {
        sections.push(`MCP arguments:\n${callShape}`);
    }

    const apiText = effectiveLongDescription(operation, details);
    if (apiText) {
        sections.push(`API:\n${apiText}`);
    }

    const metaParts: string[] = [];
    if (details.tags.length > 0) {
        metaParts.push(`tags: ${details.tags.join(', ')}`);
    }
    if (isTruthyString(details.operationId)) {
        metaParts.push(`operationId: ${details.operationId!.trim()}`);
    }
    if (metaParts.length > 0) {
        sections.push(`Meta:\n${metaParts.join(' | ')}`);
    }

    const requestBodyText = effectiveRequestBodyDescription(operation, details);
    if (requestBodyText) {
        sections.push(`Request body:\n${requestBodyText}`);
    }

    if (operation.example !== undefined && operation.example.trim().length > 0) {
        sections.push(`Example:\n${flattenLegacyInvokeDescription(operation.example.trim())}`);
    }

    const responseText = effectiveResponse(operation, details);
    if (responseText) {
        sections.push(`Response:\n${responseText}`);
    }

    const toolName = operation.toolName?.trim();
    const toolFile = toolName ?? 'tool';
    const capitalize = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);
    const access = getAccessKind(operation);
    const hasCheckToolAccess = isCheckToolAccessEnabled(operation);
    const hasPrepareToolCall = isPrepareToolCallEnabled(operation);
    const hasAfterToolCall = isAfterToolCallEnabled(operation);
    const hookDir = `src/hooks/api2ai/${mcpModuleName ?? 'mcp'}`;
    const checkHookPath = `${hookDir}/checkToolAccessFor${capitalize(toolFile)}.ts`;
    const prepareHookPath = `${hookDir}/prepareToolCallFor${capitalize(toolFile)}.ts`;
    const afterHookPath = `${hookDir}/afterToolCallFor${capitalize(toolFile)}.ts`;
    const prefixNote =
        auth && auth.prefix !== undefined && String(auth.prefix).trim().length > 0
            ? ' (prefix applied to the secret)'
            : '';

    if (access === 'public' && !hasPrepareToolCall && !hasAfterToolCall) {
        sections.push('Runtime: public endpoint — no credential required.');
    } else if (access === 'public' && (hasPrepareToolCall || hasAfterToolCall)) {
        const implParts: string[] = [];
        if (hasPrepareToolCall) {
            implParts.push(`prepareToolCallFor${capitalize(toolFile)} in ${prepareHookPath}`);
        }
        if (hasAfterToolCall) {
            implParts.push(`afterToolCallFor${capitalize(toolFile)} in ${afterHookPath}`);
        }
        sections.push(
            `Runtime: implement ${implParts.join(' and ')} (types from this tools module; run build:generated for .js).`
        );
    } else if (access === 'protected' && auth) {
        const implParts: string[] = [];
        if (hasCheckToolAccess) {
            implParts.push(`checkToolAccessFor${capitalize(toolFile)} in ${checkHookPath}`);
        }
        if (hasPrepareToolCall) {
            implParts.push(`prepareToolCallFor${capitalize(toolFile)} in ${prepareHookPath}`);
        }
        if (hasAfterToolCall) {
            implParts.push(`afterToolCallFor${capitalize(toolFile)} in ${afterHookPath}`);
        }
        const implNote =
            implParts.length > 0
                ? `implement ${implParts.join(' and ')}; `
                : `implement ${verifyCredentialStubAuthPath('api2ai', mcpModuleName)}; `;
        sections.push(
            `Runtime: protected — ${implNote}credential sent as ${auth.location} "${auth.name}"${prefixNote}.`
        );
    } else if (auth) {
        sections.push(
            `Runtime auth: MCP host injects the API credential via --auth-env; send as ${auth.location} "${auth.name}"${prefixNote}.`
        );
    }

    return joinSections(sections);
}

/** Stops infinite recursion when the same schema object appears again on the path (cyclic graph after dereference). */
const CIRCULAR_SCHEMA_PLACEHOLDER: JsonSchemaDict = {
    type: 'object',
    description:
        'Circular schema in OpenAPI (same object reached twice while building JSON Schema). Use a JSON object consistent with the API docs.',
    additionalProperties: true
};

/** Remaining `$ref` after load (e.g. circular external refs) — cannot inline without the resolved document. */
function unresolvedRefPlaceholder(ref: string): JsonSchemaDict {
    return {
        type: 'object',
        description: `OpenAPI $ref "${ref}" was not fully inlined — use a free-form JSON object if needed.`,
        additionalProperties: true
    };
}

/** Copy validation / annotation keywords from a dereferenced OpenAPI schema object onto the emitted JSON Schema. */
function copyOpenApiConstraintKeywords(schema: OpenApiSchema, target: JsonSchemaDict): void {
    const scalarKeys = [
        'description',
        'title',
        'format',
        'default',
        'enum',
        'const',
        'example',
        'minimum',
        'maximum',
        'exclusiveMinimum',
        'exclusiveMaximum',
        'multipleOf',
        'minLength',
        'maxLength',
        'pattern',
        'minItems',
        'maxItems',
        'uniqueItems',
        'minProperties',
        'maxProperties',
        'readOnly',
        'writeOnly',
        'deprecated',
        'discriminator'
    ] as const;
    for (const key of scalarKeys) {
        const value = schema[key as keyof OpenApiSchema];
        if (value !== undefined) {
            target[key] = value as unknown;
        }
    }
    const rec = schema as Record<string, unknown>;
    for (const key of Object.keys(rec)) {
        if (key.startsWith('x-') && rec[key] !== undefined) {
            target[key] = rec[key];
        }
    }
}

function schemaTypeFirst(schema: OpenApiSchema): string | undefined {
    const t = schema.type;
    if (typeof t === 'string') {
        return t;
    }
    if (Array.isArray(t) && t.length > 0 && typeof t[0] === 'string') {
        return t[0];
    }
    return undefined;
}

function openApiPrimitiveToJsonSchema(schema: OpenApiSchema, pathStack: OpenApiSchema[]): JsonSchemaDict {
    const out: JsonSchemaDict = {};
    copyOpenApiConstraintKeywords(schema, out);

    let typeKind = schemaTypeFirst(schema);
    if (!typeKind) {
        if (schema.properties) {
            typeKind = 'object';
        } else if (schema.additionalProperties !== undefined || schema.items) {
            typeKind = schema.items ? 'array' : 'object';
        } else {
            typeKind = 'string';
        }
    }

    const nextStack = [...pathStack, schema];

    let inner: JsonSchemaDict;
    if (typeKind === 'integer') {
        inner = { ...out, type: 'integer' };
    } else if (typeKind === 'number') {
        inner = { ...out, type: 'number' };
    } else if (typeKind === 'boolean') {
        inner = { ...out, type: 'boolean' };
    } else if (typeKind === 'array') {
        inner = {
            ...out,
            type: 'array',
            items: schema.items
                ? openApiSchemaToJsonSchema(schema.items as OpenApiSchema, nextStack)
                : { type: 'string' }
        };
    } else if (typeKind === 'object') {
        const props = schema.properties ?? {};
        const required = schema.required ?? [];
        const nested: Record<string, JsonSchemaDict> = {};
        for (const [name, prop] of Object.entries(props)) {
            if (!prop) {
                continue;
            }
            nested[name] = openApiSchemaToJsonSchema(prop as OpenApiSchema, nextStack);
        }
        let additionalProperties: boolean | JsonSchemaDict = false;
        if (typeof schema.additionalProperties === 'boolean') {
            additionalProperties = schema.additionalProperties;
        } else if (schema.additionalProperties) {
            additionalProperties = openApiSchemaToJsonSchema(schema.additionalProperties as OpenApiSchema, nextStack);
        }
        inner = {
            ...out,
            type: 'object',
            properties: nested,
            required: [...required],
            additionalProperties
        };
    } else {
        inner = { ...out, type: 'string' };
    }

    if (schema.not) {
        inner.not = openApiSchemaToJsonSchema(schema.not, nextStack);
    }

    if (!schema.nullable) {
        return inner;
    }
    return { anyOf: [inner, { type: 'null' }] };
}

/** Convert OpenAPI schema subset to JSON-schema-like dict for MCP inputSchema emission. */
function openApiSchemaToJsonSchema(schema: OpenApiSchema | undefined, pathStack: OpenApiSchema[] = []): JsonSchemaDict {
    if (!schema) {
        return { type: 'string', description: 'No schema in OpenAPI.' };
    }
    if (pathStack.includes(schema)) {
        return { ...CIRCULAR_SCHEMA_PLACEHOLDER };
    }
    if (schema.$ref) {
        return unresolvedRefPlaceholder(schema.$ref);
    }

    const hasComposition =
        (schema.oneOf !== undefined && schema.oneOf.length > 0) ||
        (schema.anyOf !== undefined && schema.anyOf.length > 0) ||
        (schema.allOf !== undefined && schema.allOf.length > 0);

    if (hasComposition) {
        const nextStack = [...pathStack, schema];
        const composed: JsonSchemaDict = {};
        copyOpenApiConstraintKeywords(schema, composed);
        if (schema.oneOf?.length) {
            composed.oneOf = schema.oneOf.map((branch) => openApiSchemaToJsonSchema(branch, nextStack));
        }
        if (schema.anyOf?.length) {
            composed.anyOf = schema.anyOf.map((branch) => openApiSchemaToJsonSchema(branch, nextStack));
        }
        if (schema.allOf?.length) {
            composed.allOf = schema.allOf.map((branch) => openApiSchemaToJsonSchema(branch, nextStack));
        }
        if (schema.not) {
            composed.not = openApiSchemaToJsonSchema(schema.not, nextStack);
        }
        if (!schema.nullable) {
            return composed;
        }
        return { anyOf: [composed, { type: 'null' }] };
    }

    return openApiPrimitiveToJsonSchema(schema, pathStack);
}

/** Merge OpenAPI Parameter `description` onto the JSON schema for MCP (parameter text wins over inline schema description). */
function parameterPropertySchema(p: OpenApiParameterDetails, wireToMcp: Record<string, string>): JsonSchemaDict {
    const inner = openApiSchemaToJsonSchema(p.schema);
    const paramDesc = p.description?.trim();
    if (!paramDesc) {
        return inner;
    }
    const flatDesc = sanitizeWireParamNamesInText(flattenLegacyInvokeDescription(paramDesc), wireToMcp);
    if (typeof inner === 'object' && inner !== null && !Array.isArray(inner)) {
        return { ...inner, description: flatDesc };
    }
    return inner;
}

function parameterSchemaKind(schema: OpenApiSchema | undefined): 'array' | 'object' | 'primitive' {
    if (!schema) {
        return 'primitive';
    }
    if (schema.$ref || schema.oneOf || schema.allOf || schema.anyOf) {
        return 'primitive';
    }
    let typeKind = schemaTypeFirst(schema);
    if (!typeKind) {
        if (schema.properties) {
            typeKind = 'object';
        } else if (schema.items) {
            typeKind = 'array';
        } else {
            typeKind = undefined;
        }
    }
    if (typeKind === 'array') {
        return 'array';
    }
    if (typeKind === 'object') {
        return 'object';
    }
    return 'primitive';
}

/**
 * OpenAPI 3 query defaults: style `form`; `explode` defaults to true for primitives and arrays,
 * false for objects (when `explode` is omitted on the parameter).
 */
export function effectiveQueryParamSerialization(p: OpenApiParameterDetails): { style: string; explode: boolean } {
    const style = p.style !== undefined && String(p.style).trim().length > 0 ? String(p.style) : 'form';
    if (p.explode !== undefined) {
        return { style, explode: p.explode };
    }
    const kind = parameterSchemaKind(p.schema);
    return { style, explode: kind !== 'object' };
}

/** Per query parameter: how array values should join (form + explode false → comma, else repeated keys). */
export function buildQueryParamSerializationLookup(
    details: OpenApiOperationDetails
): Record<string, { style: string; explode: boolean }> {
    const { wireToMcp } = invokeParamWireMaps(details);
    const out: Record<string, { style: string; explode: boolean }> = {};
    for (const p of details.parameters) {
        if (p.in === 'query') {
            const mcpKey = wireToMcp[p.name] ?? toMcpParamName(p.name);
            out[mcpKey] = effectiveQueryParamSerialization(p);
        }
    }
    return out;
}

function invokeParamWireNames(details: OpenApiOperationDetails): string[] {
    return details.parameters
        .filter((p) => p.in === 'path' || p.in === 'query' || p.in === 'header')
        .map((p) => p.name);
}

function invokeParamWireMaps(details: OpenApiOperationDetails): ParamWireMaps {
    return buildParamWireMaps(invokeParamWireNames(details));
}

/** Per query parameter: MCP name → OpenAPI wire name (only when they differ). */
export function buildQueryParamWireNamesLookup(details: OpenApiOperationDetails): Record<string, string> {
    const queryWireNames = details.parameters.filter((p) => p.in === 'query').map((p) => p.name);
    return buildParamWireMaps(queryWireNames).mcpToWire;
}

/** Per path parameter: MCP name → OpenAPI wire name (only when they differ). */
export function buildPathParamWireNamesLookup(details: OpenApiOperationDetails): Record<string, string> {
    const pathWireNames = details.parameters.filter((p) => p.in === 'path').map((p) => p.name);
    return buildParamWireMaps(pathWireNames).mcpToWire;
}

/** Per header parameter: MCP name → OpenAPI wire name (only when they differ). */
export function buildHeaderParamWireNamesLookup(details: OpenApiOperationDetails): Record<string, string> {
    const headerWireNames = details.parameters.filter((p) => p.in === 'header').map((p) => p.name);
    return buildParamWireMaps(headerWireNames).mcpToWire;
}

function parametersByLocation(parameters: OpenApiParameterDetails[]): {
    path: OpenApiParameterDetails[];
    query: OpenApiParameterDetails[];
    headers: OpenApiParameterDetails[];
} {
    const path: OpenApiParameterDetails[] = [];
    const query: OpenApiParameterDetails[] = [];
    const headers: OpenApiParameterDetails[] = [];
    for (const p of parameters) {
        if (p.in === 'path') {
            path.push(p);
        } else if (p.in === 'query') {
            query.push(p);
        } else if (p.in === 'header') {
            headers.push(p);
        }
    }
    return { path, query, headers };
}

type InvokeParamBucket = 'pathParams' | 'query' | 'headers';

function invokeParamBucket(parameter: OpenApiParameterDetails): InvokeParamBucket | undefined {
    if (parameter.in === 'path') {
        return 'pathParams';
    }
    if (parameter.in === 'query') {
        return 'query';
    }
    if (parameter.in === 'header') {
        return 'headers';
    }
    return undefined;
}

/** Merge DSL param description/example patches onto OpenAPI-derived flat MCP input schema. */
export function applyApiParamPatches(
    schema: JsonSchemaDict,
    operation: Operation,
    details: OpenApiOperationDetails
): JsonSchemaDict {
    const entries = operation.params?.entries ?? [];
    if (entries.length === 0) {
        return schema;
    }

    const knownParamNames = new Set(
        details.parameters
            .map((parameter) => invokeParamBucket(parameter) && parameter.name)
            .filter((name): name is string => typeof name === 'string')
    );
    const { wireToMcp } = invokeParamWireMaps(details);

    const rootProps = { ...(schema.properties as Record<string, JsonSchemaDict>) };
    for (const entry of entries) {
        if (!knownParamNames.has(entry.key)) {
            continue;
        }
        const mcpKey = wireToMcp[entry.key] ?? entry.key;
        const existing = rootProps[mcpKey];
        if (!existing || typeof existing !== 'object') {
            continue;
        }

        const parsed = parseApiParamSpec(entry.spec);
        let next = { ...existing };
        if (parsed.description !== undefined && parsed.description.trim().length > 0) {
            next = {
                ...next,
                description: sanitizeWireParamNamesInText(
                    flattenLegacyInvokeDescription(parsed.description.trim()),
                    wireToMcp
                )
            };
        }
        if (parsed.example !== undefined && parsed.example.trim().length > 0) {
            const coerced = coerceExampleFromSchemaType(parsed.example, next.type as string | string[] | undefined);
            if (coerced !== undefined) {
                next = { ...next, examples: [coerced] };
            }
        }
        rootProps[mcpKey] = next;
    }

    return { ...schema, properties: rootProps };
}

export type InvokeParamBuckets = {
    pathParams: string[];
    query: string[];
    headers: string[];
    /** Query parameter names with OpenAPI `array` schema (LLM may pass a single string). */
    arrayQuery: string[];
    /** MCP-only hook param names (never sent on HTTP). */
    hookParams: string[];
};

/** OpenAPI parameter names grouped for invokeTool normalization (flat MCP args → nested InvokeOptions). */
export function buildInvokeParamBuckets(
    details: OpenApiOperationDetails,
    hookParamNames: readonly string[] = []
): InvokeParamBuckets {
    const { path, query, headers } = parametersByLocation(details.parameters);
    const { wireToMcp } = invokeParamWireMaps(details);
    const arrayQuery = query
        .filter((p) => parameterSchemaKind(p.schema) === 'array')
        .map((p) => wireToMcp[p.name] ?? toMcpParamName(p.name));
    return {
        pathParams: path.map((p) => wireToMcp[p.name] ?? toMcpParamName(p.name)),
        query: query.map((p) => wireToMcp[p.name] ?? toMcpParamName(p.name)),
        headers: headers.map((p) => wireToMcp[p.name] ?? toMcpParamName(p.name)),
        arrayQuery,
        hookParams: [...hookParamNames]
    };
}

function hookParamTypeToJsonSchema(paramType: string): JsonSchemaDict {
    switch (paramType) {
        case 'integer':
            return { type: 'integer' };
        case 'number':
            return { type: 'number' };
        case 'boolean':
            return { type: 'boolean' };
        case 'array':
            return { type: 'array', items: { type: 'string' } };
        default:
            return { type: 'string' };
    }
}

function mergeHookParamsIntoSchema(schema: JsonSchemaDict, operation: Operation | undefined): JsonSchemaDict {
    const entries = operation ? listHookParamEntries(operation) : [];
    if (entries.length === 0) {
        return schema;
    }
    const properties = schema.properties;
    if (!properties || typeof properties !== 'object' || Array.isArray(properties)) {
        return schema;
    }
    const rootProps = { ...(properties as Record<string, JsonSchemaDict>) };
    for (const entry of entries) {
        if (rootProps[entry.name]) {
            throw new Error(
                `hookParams entry "${entry.name}" collides with an existing MCP input property (OpenAPI or reserved).`
            );
        }
        let prop: JsonSchemaDict = hookParamTypeToJsonSchema(entry.paramType);
        if (entry.description?.trim()) {
            prop = { ...prop, description: entry.description.trim() };
        }
        if (entry.example?.trim()) {
            const coerced = coerceExampleFromSchemaType(entry.example, entry.paramType);
            if (coerced !== undefined) {
                prop = { ...prop, examples: [coerced] };
            }
        }
        rootProps[entry.name] = prop;
    }
    return { ...schema, properties: rootProps };
}

/** Enrich flat OpenAPI param descriptions with `(type: …)` and `(example: …)` for MCP tool callers. */
function enrichFlatParamPropertyDescriptions(schema: JsonSchemaDict): JsonSchemaDict {
    const properties = schema.properties;
    if (!properties || typeof properties !== 'object' || Array.isArray(properties)) {
        return schema;
    }
    const rootProps = { ...(properties as Record<string, JsonSchemaDict>) };
    for (const [key, prop] of Object.entries(rootProps)) {
        if (key === 'body' || key === 'headers') {
            continue;
        }
        if (!prop || typeof prop !== 'object' || Array.isArray(prop)) {
            continue;
        }
        const enriched = enrichJsonSchemaPropertyDescription(
            typeof prop.description === 'string' ? prop.description : undefined,
            prop
        );
        if (enriched) {
            rootProps[key] = { ...prop, description: enriched };
        }
    }
    return { ...schema, properties: rootProps };
}

/** Flat MCP tool input: OpenAPI path/query/header params at root; optional body and extra headers. */
export function buildToolInputSchema(
    details: OpenApiOperationDetails,
    optionalParams?: readonly string[],
    operation?: Operation
): JsonSchemaDict {
    const { path, query, headers } = parametersByLocation(details.parameters);
    const { wireToMcp } = invokeParamWireMaps(details);
    const optional = new Set((optionalParams ?? []).map((p) => p.trim()).filter((p) => p.length > 0));

    const pathEntries = path.map((p) => ({
        name: wireToMcp[p.name] ?? toMcpParamName(p.name),
        schema: parameterPropertySchema(p, wireToMcp),
        required: !optional.has(p.name)
    }));
    const queryEntries = query.map((p) => ({
        name: wireToMcp[p.name] ?? toMcpParamName(p.name),
        schema: parameterPropertySchema(p, wireToMcp),
        required: p.required && !optional.has(p.name)
    }));
    const headerEntries = headers.map((p) => ({
        name: wireToMcp[p.name] ?? toMcpParamName(p.name),
        schema: parameterPropertySchema(p, wireToMcp),
        required: p.required && !optional.has(p.name)
    }));

    const rootProps: Record<string, JsonSchemaDict> = {};
    const rootRequired: string[] = [];

    for (const entry of [...pathEntries, ...queryEntries, ...headerEntries]) {
        rootProps[entry.name] = entry.schema;
        if (entry.required) {
            rootRequired.push(entry.name);
        }
    }

    if (headerEntries.length === 0) {
        rootProps.headers = {
            type: 'object',
            additionalProperties: { type: 'string' },
            description: 'Optional extra headers.'
        };
    }

    const bodyDescription = operation
        ? effectiveRequestBodyDescription(operation, details)
        : pickEffectiveText(undefined, details.requestBody?.description);
    const bodyDetails = details.requestBody;
    if (bodyDetails?.schema) {
        rootProps.body = openApiSchemaToJsonSchema(bodyDetails.schema);
        if (bodyDescription) {
            rootProps.body = { ...rootProps.body, description: bodyDescription };
        }
        if (bodyDetails.required) {
            rootRequired.push('body');
        }
    } else {
        rootProps.body = {
            type: 'object',
            description: bodyDescription ?? 'Request body JSON if applicable.',
            additionalProperties: true
        };
    }

    const built = {
        type: 'object',
        properties: rootProps,
        required: rootRequired,
        additionalProperties: false,
        description: 'Arguments for invoking the generated HTTP wrapper.'
    } satisfies JsonSchemaDict;
    const patched = operation ? applyApiParamPatches(built, operation, details) : built;
    const withHooks = mergeHookParamsIntoSchema(patched, operation);
    return enrichFlatParamPropertyDescriptions(withHooks);
}
