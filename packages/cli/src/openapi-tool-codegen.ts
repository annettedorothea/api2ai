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
    isToolAuthorizeEnabled,
    isToolPrepareEnabled,
    parseApiParamSpec
} from 'api-2-ai-dsl-language';
import { resolveModuleCredentialNames } from '@core2ai/core/codegen';

/** JSON-schema-like dict emitted into generated modules / MCP. */
export type JsonSchemaDict = Record<string, unknown>;

function isTruthyString(value: string | undefined): boolean {
    return value !== undefined && value.trim().length > 0;
}

function joinSections(sections: string[]): string {
    return sections.filter((s) => s.length > 0).join('\n\n');
}

function verifyCredentialsStubAuthPath(hostProduct: string, mcpModuleName: string | undefined): string {
    if (!mcpModuleName) {
        return `src/hooks/${hostProduct}/<module>/verify*Credentials.ts`;
    }
    const names = resolveModuleCredentialNames(`generated/${hostProduct}/tools/${mcpModuleName}.ts`);
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

/** Plan: 200 → 201 → other 2xx with application/json+schema → any 2xx. */
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
    return twoxx[0];
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
    const shape = topLevelShapeLine(resp.schema);
    if (shape) {
        lines.push(shape);
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

/** Flat parameter list for MCP tool description (path / query / header); complements nested inputSchema buckets. */
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
    for (const p of params) {
        const patch = patches.get(p.name);
        const description = pickEffectiveText(patch?.description, p.description);
        let line = `- ${p.name} (${p.in})`;
        if (description) {
            line += `: ${description}`;
        }
        const exampleText = patch?.example?.trim();
        if (exampleText && exampleText.length > 0) {
            line += ` (example: ${exampleText})`;
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
    mcpModuleName: string | undefined,
    hostProduct: 'api2ai' | 'db2ai'
): string {
    const sections: string[] = [];

    sections.push(`Intent:\n${operation.intent!.trim()}`);

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

    const parametersText = buildInvokeParameterDescriptionSection(operation, details);
    if (parametersText) {
        sections.push(`Parameters:\n${parametersText}`);
    }

    const requestBodyText = effectiveRequestBodyDescription(operation, details);
    if (requestBodyText) {
        sections.push(`Request body:\n${requestBodyText}`);
    }

    if (operation.example !== undefined && operation.example.trim().length > 0) {
        sections.push(`Example:\n${operation.example.trim()}`);
    }

    const responseText = effectiveResponse(operation, details);
    if (responseText) {
        sections.push(`Response:\n${responseText}`);
    }

    const toolName = operation.toolName?.trim();
    const toolFile = toolName ?? 'tool';
    const capitalize = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);
    const access = getAccessKind(operation);
    const hasAuthorize = isToolAuthorizeEnabled(operation);
    const hasPrepare = isToolPrepareEnabled(operation);
    const authPath = `src/hooks/${hostProduct}/${mcpModuleName ?? 'mcp'}/${toolFile}.ts`;
    const prefixNote =
        auth && auth.prefix !== undefined && String(auth.prefix).trim().length > 0
            ? ' (prefix applied to the secret)'
            : '';

    if (access === 'public' && !hasPrepare) {
        sections.push('Runtime: public endpoint — no credential required.');
    } else if (access === 'public' && hasPrepare) {
        sections.push(
            `Runtime: implement prepare${capitalize(toolFile)}Input in ${authPath} (types from this tools module; run build:generated for .js).`
        );
    } else if (access === 'protected' && auth) {
        const implParts: string[] = [];
        if (hasAuthorize) {
            implParts.push(`authorize${capitalize(toolFile)}`);
        }
        if (hasPrepare) {
            implParts.push(`prepare${capitalize(toolFile)}Input`);
        }
        const implNote =
            implParts.length > 0
                ? `implement ${implParts.join(' and ')} in ${authPath}; `
                : `implement ${verifyCredentialsStubAuthPath(hostProduct, mcpModuleName)}; `;
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
function parameterPropertySchema(p: OpenApiParameterDetails): JsonSchemaDict {
    const inner = openApiSchemaToJsonSchema(p.schema);
    const paramDesc = p.description?.trim();
    if (!paramDesc) {
        return inner;
    }
    if (typeof inner === 'object' && inner !== null && !Array.isArray(inner)) {
        return { ...inner, description: paramDesc };
    }
    return inner;
}

function objectSchemaFromKeyedProps(
    entries: Array<{ name: string; schema: JsonSchemaDict; required: boolean }>,
    description?: string
): JsonSchemaDict {
    const props: Record<string, JsonSchemaDict> = {};
    const required: string[] = [];
    for (const e of entries) {
        props[e.name] = e.schema;
        if (e.required) {
            required.push(e.name);
        }
    }
    const obj: JsonSchemaDict = {
        type: 'object',
        properties: props,
        required,
        additionalProperties: false
    };
    if (description) {
        obj.description = description;
    }
    return obj;
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
    const out: Record<string, { style: string; explode: boolean }> = {};
    for (const p of details.parameters) {
        if (p.in === 'query') {
            out[p.name] = effectiveQueryParamSerialization(p);
        }
    }
    return out;
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

/** Merge DSL param description/example patches onto OpenAPI-derived MCP input schema (structure unchanged). */
export function applyApiParamPatches(
    schema: JsonSchemaDict,
    operation: Operation,
    details: OpenApiOperationDetails
): JsonSchemaDict {
    const entries = operation.params?.entries ?? [];
    if (entries.length === 0) {
        return schema;
    }

    const locationByName = new Map<string, InvokeParamBucket>();
    for (const parameter of details.parameters) {
        const bucket = invokeParamBucket(parameter);
        if (bucket) {
            locationByName.set(parameter.name, bucket);
        }
    }

    const rootProps = { ...(schema.properties as Record<string, JsonSchemaDict>) };
    for (const entry of entries) {
        const bucket = locationByName.get(entry.key);
        if (!bucket) {
            continue;
        }
        const bucketSchema = rootProps[bucket];
        if (!bucketSchema || typeof bucketSchema !== 'object' || !bucketSchema.properties) {
            continue;
        }
        const props = { ...(bucketSchema.properties as Record<string, JsonSchemaDict>) };
        const existing = props[entry.key];
        if (!existing) {
            continue;
        }

        const parsed = parseApiParamSpec(entry.spec);
        let next = { ...existing };
        if (parsed.description !== undefined && parsed.description.trim().length > 0) {
            next = { ...next, description: parsed.description.trim() };
        }
        if (parsed.example !== undefined && parsed.example.trim().length > 0) {
            const coerced = coerceExampleFromSchemaType(parsed.example, next.type as string | string[] | undefined);
            if (coerced !== undefined) {
                next = { ...next, examples: [coerced] };
            }
        }
        props[entry.key] = next;
        rootProps[bucket] = { ...bucketSchema, properties: props };
    }

    return { ...schema, properties: rootProps };
}

/** Outer MCP tool input: pathParams | query | headers | body buckets. */
export function buildToolInputSchema(
    details: OpenApiOperationDetails,
    optionalParams?: readonly string[],
    operation?: Operation
): JsonSchemaDict {
    const { path, query, headers } = parametersByLocation(details.parameters);
    const optional = new Set((optionalParams ?? []).map((p) => p.trim()).filter((p) => p.length > 0));

    const pathEntries = path.map((p) => ({
        name: p.name,
        schema: parameterPropertySchema(p),
        required: !optional.has(p.name)
    }));
    const queryEntries = query.map((p) => ({
        name: p.name,
        schema: parameterPropertySchema(p),
        required: p.required && !optional.has(p.name)
    }));
    const headerEntries = headers.map((p) => ({
        name: p.name,
        schema: parameterPropertySchema(p),
        required: p.required && !optional.has(p.name)
    }));

    const rootProps: Record<string, JsonSchemaDict> = {};
    const rootRequired: string[] = [];

    if (pathEntries.length > 0) {
        rootProps.pathParams = objectSchemaFromKeyedProps(pathEntries, 'Path parameters from OpenAPI.');
        if (pathEntries.some((entry) => entry.required)) {
            rootRequired.push('pathParams');
        }
    } else {
        rootProps.pathParams = { type: 'object', additionalProperties: true, description: 'No path parameters.' };
    }

    if (queryEntries.length > 0) {
        rootProps.query = objectSchemaFromKeyedProps(queryEntries, 'Query parameters from OpenAPI.');
    } else {
        rootProps.query = { type: 'object', additionalProperties: true, description: 'Optional query overrides.' };
    }

    if (headerEntries.length > 0) {
        rootProps.headers = objectSchemaFromKeyedProps(headerEntries, 'Headers from OpenAPI (excluding Content-Type).');
    } else {
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
    return operation ? applyApiParamPatches(built, operation, details) : built;
}
