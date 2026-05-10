import type { Auth, OpenApiOperationDetails, OpenApiParameterDetails, OpenApiSchema, Operation } from 'api-2-ai-dsl-language';

/** JSON-schema-like dict emitted into generated modules / MCP. */
export type JsonSchemaDict = Record<string, unknown>;

function isTruthyString(value: string | undefined): boolean {
    return value !== undefined && value.trim().length > 0;
}

function joinSections(sections: string[]): string {
    return sections.filter((s) => s.length > 0).join('\n\n');
}

export function buildMcpTitle(operation: Operation, details: OpenApiOperationDetails): string {
    if (operation.title !== undefined) {
        return operation.title;
    }
    if (operation.summary !== undefined) {
        return operation.summary;
    }
    if (isTruthyString(details.summary)) {
        return details.summary!.trim();
    }
    return details.operationId?.trim() ?? operation.toolName;
}

function effectiveLongDescription(operation: Operation, details: OpenApiOperationDetails): string | undefined {
    if (operation.description !== undefined) {
        return operation.description.trim().length === 0 ? undefined : operation.description.trim();
    }
    return isTruthyString(details.description) ? details.description!.trim() : undefined;
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
    const t = Array.isArray(s.type) ? s.type[0] : s.type;
    if (s.$ref || s.oneOf || s.allOf || s.anyOf) {
        return 'shape: opaque (composition or reference)';
    }
    if (t === 'array') {
        const it = s.items ? (typeof s.items.type === 'string' ? s.items.type : 'item') : 'item';
        return `type: array of ${it}`;
    }
    if (t === 'object' || (!t && s.properties)) {
        const keys = Object.keys(s.properties ?? {});
        return keys.length > 0 ? `properties (top-level): ${keys.sort().join(', ')}` : 'type: object (no inlined properties)';
    }
    return t ? `type: ${t}` : undefined;
}

function buildResponseParagraph(operation: Operation, details: OpenApiOperationDetails): string | undefined {
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

export function buildMcpDescription(operation: Operation, details: OpenApiOperationDetails, auth?: Auth): string {
    const sections: string[] = [];

    sections.push(`Intent:\n${operation.intent.trim()}`);

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

    if (operation.includeResponses) {
        sections.push(`Response:\n${buildResponseParagraph(operation, details)}`);
    }

    if (auth) {
        const prefixNote =
            auth.prefix !== undefined && String(auth.prefix).trim().length > 0 ? ' (prefix applied to the secret)' : '';
        sections.push(
            `Runtime auth: read API credential from environment variable ${auth.env}; send as ${auth.location} "${auth.name}"${prefixNote}.`
        );
    }

    return joinSections(sections);
}

function openApiPrimitiveToJsonSchema(schema: OpenApiSchema): JsonSchemaDict {
    const out: JsonSchemaDict = {};
    if (schema.description) {
        out.description = schema.description;
    }
    if (schema.format) {
        out.format = schema.format;
    }
    if (schema.default !== undefined) {
        out.default = schema.default;
    }
    if (schema.enum) {
        out.enum = schema.enum;
    }

    let typeKind = typeof schema.type === 'string' ? schema.type : schema.type?.[0];
    if (!typeKind) {
        if (schema.properties) {
            typeKind = 'object';
        } else if (schema.additionalProperties !== undefined || schema.items) {
            typeKind = schema.items ? 'array' : 'object';
        } else {
            typeKind = 'string';
        }
    }

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
            items: schema.items ? openApiSchemaToJsonSchema(schema.items as OpenApiSchema) : { type: 'string' }
        };
    } else if (typeKind === 'object') {
        const props = schema.properties ?? {};
        const required = schema.required ?? [];
        const nested: Record<string, JsonSchemaDict> = {};
        for (const [name, prop] of Object.entries(props)) {
            if (!prop) {
                continue;
            }
            nested[name] = openApiSchemaToJsonSchema(prop as OpenApiSchema);
        }
        inner = {
            ...out,
            type: 'object',
            properties: nested,
            required: [...required],
            additionalProperties:
                typeof schema.additionalProperties === 'boolean' ? schema.additionalProperties : schema.additionalProperties ? true : false
        };
    } else {
        inner = { ...out, type: 'string' };
    }

    if (!schema.nullable) {
        return inner;
    }
    return { anyOf: [inner, { type: 'null' }] };
}

/** Convert OpenAPI schema subset to JSON-schema-like dict for MCP inputSchema emission. */
function openApiSchemaToJsonSchema(schema: OpenApiSchema | undefined): JsonSchemaDict {
    if (!schema) {
        return { type: 'string', description: 'No schema in OpenAPI.' };
    }
    if (schema.$ref) {
        return {
            type: 'object',
            description: 'OpenAPI $ref — use free-form JSON object.',
            additionalProperties: true
        };
    }
    if (schema.oneOf || schema.allOf || schema.anyOf) {
        return {
            type: 'object',
            description: 'OpenAPI composite schema — use structured object if known.',
            additionalProperties: true
        };
    }
    return openApiPrimitiveToJsonSchema(schema);
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
    let typeKind = typeof schema.type === 'string' ? schema.type : schema.type?.[0];
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
export function buildQueryParamSerializationLookup(details: OpenApiOperationDetails): Record<string, { style: string; explode: boolean }> {
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
export function buildToolInputSchema(details: OpenApiOperationDetails): JsonSchemaDict {
    const { path, query, headers } = parametersByLocation(details.parameters);

    const pathEntries = path.map((p) => ({
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
