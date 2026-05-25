import type {
    Auth,
    OpenApiOperationDetails,
    OpenApiParameterDetails,
    OpenApiSchema,
    Operation
} from 'api-2-ai-dsl-language';

/** JSON-schema-like dict emitted into generated modules / MCP. */
export type JsonSchemaDict = Record<string, unknown>;

function isTruthyString(value: string | undefined): boolean {
    return value !== undefined && value.trim().length > 0;
}

function joinSections(sections: string[]): string {
    return sections.filter((s) => s.length > 0).join('\n\n');
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

/** Pre-condition: `operation` has passed validation, so `intent` is present. */
export function buildMcpDescription(
    operation: Operation,
    details: OpenApiOperationDetails,
    auth?: Auth,
    insecureEnv?: boolean
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

    const rb = details.requestBody;
    if (rb && isTruthyString(rb.description)) {
        sections.push(`Request body:\n${rb.description!.trim()}`);
    }

    if (operation.example !== undefined && operation.example.trim().length > 0) {
        sections.push(`Example:\n${operation.example.trim()}`);
    }

    sections.push(`Response:\n${buildResponseSection(details)}`);

    if (operation.public === true) {
        sections.push('Runtime: public endpoint — no Authorization header or MCP credential required.');
    } else if (auth) {
        const prefixNote =
            auth.prefix !== undefined && String(auth.prefix).trim().length > 0 ? ' (prefix applied to the secret)' : '';
        const fromJwtNote =
            auth.fromJwt !== undefined && auth.fromJwt.trim().length > 0
                ? ` Path parameter "${auth.fromJwt.trim()}" is derived from that JWT claim; do not pass it in tool arguments.`
                : '';
        sections.push(
            `Runtime auth: MCP host injects the API credential via --auth-env; send as ${auth.location} "${auth.name}"${prefixNote}.${fromJwtNote}`
        );
    }

    if (insecureEnv) {
        sections.push(
            'TLS: generated client disables TLS certificate verification (insecureEnv in .api2ai). Use only for local/dev endpoints with self-signed certificates.'
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

/** Outer MCP tool input: pathParams | query | headers | body buckets. */
export function buildToolInputSchema(details: OpenApiOperationDetails, jwtBoundPathParam?: string): JsonSchemaDict {
    const { path, query, headers } = parametersByLocation(details.parameters);

    const pathEntries = path
        .filter((p) => jwtBoundPathParam === undefined || p.name !== jwtBoundPathParam)
        .map((p) => ({
            name: p.name,
            schema: parameterPropertySchema(p),
            required: true
        }));
    const queryEntries = query.map((p) => ({
        name: p.name,
        schema: parameterPropertySchema(p),
        required: p.required
    }));
    const headerEntries = headers.map((p) => ({
        name: p.name,
        schema: parameterPropertySchema(p),
        required: p.required
    }));

    const rootProps: Record<string, JsonSchemaDict> = {};
    const rootRequired: string[] = [];

    if (pathEntries.length > 0) {
        rootProps.pathParams = objectSchemaFromKeyedProps(pathEntries, 'Path parameters from OpenAPI.');
        rootRequired.push('pathParams');
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

    const bodyDetails = details.requestBody;
    if (bodyDetails?.schema) {
        rootProps.body = openApiSchemaToJsonSchema(bodyDetails.schema);
        if (bodyDetails.required) {
            rootRequired.push('body');
        }
    } else {
        rootProps.body = {
            type: 'object',
            description: 'Request body JSON if applicable.',
            additionalProperties: true
        };
    }

    return {
        type: 'object',
        properties: rootProps,
        required: rootRequired,
        additionalProperties: false,
        description: 'Arguments for invoking the generated HTTP wrapper.'
    };
}
