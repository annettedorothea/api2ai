import path from 'node:path';
import SwaggerParser from '@apidevtools/swagger-parser';

export type OpenApiSchema = {
    type?: string;
    description?: string;
    enum?: unknown[];
    default?: unknown;
    nullable?: boolean;
    format?: string;
    items?: OpenApiSchema;
    properties?: Record<string, OpenApiSchema | undefined>;
    required?: string[];
    oneOf?: OpenApiSchema[];
    anyOf?: OpenApiSchema[];
    allOf?: OpenApiSchema[];
    additionalProperties?: boolean | OpenApiSchema;
    example?: unknown;
};

type OpenApiExample = {
    summary?: string;
    description?: string;
    value?: unknown;
};

type OpenApiParameterObject = {
    name?: string;
    in?: OpenApiParameterLocation;
    required?: boolean;
    description?: string;
    deprecated?: boolean;
    style?: string;
    explode?: boolean;
    schema?: OpenApiSchema;
    example?: unknown;
    examples?: Record<string, OpenApiExample | unknown>;
};

type OpenApiRequestBody = {
    description?: string;
    required?: boolean;
    content?: Record<string, OpenApiMediaType | undefined>;
};

type OpenApiMediaType = {
    schema?: OpenApiSchema;
    example?: unknown;
    examples?: Record<string, OpenApiExample | unknown>;
};

type OpenApiResponse = {
    description?: string;
};

export type OpenApiParameterLocation = 'path' | 'query' | 'header' | 'cookie';

export type OpenApiOperation = {
    operationId?: string;
    summary?: string;
    description?: string;
    tags?: string[];
    parameters?: OpenApiParameterObject[];
    requestBody?: OpenApiRequestBody;
    responses?: Record<string, OpenApiResponse | undefined>;
};

type OpenApiPathItem = Record<string, OpenApiOperation | unknown> & {
    $ref?: string;
    parameters?: OpenApiParameterObject[];
};

type OpenApiDocument = {
    openapi?: string;
    paths?: Record<string, OpenApiPathItem | undefined>;
};

export type OperationLookup = Map<string, OpenApiOperationDetails>;

export type OpenApiParameterDetails = {
    name: string;
    in: OpenApiParameterLocation;
    required: boolean;
    description?: string;
    deprecated?: boolean;
    style?: string;
    explode?: boolean;
    schema?: OpenApiSchema;
    example?: unknown;
    examples?: Record<string, unknown>;
};

export type OpenApiRequestBodyDetails = {
    description?: string;
    required: boolean;
    contentType?: string;
    schema?: OpenApiSchema;
    example?: unknown;
    examples?: Record<string, unknown>;
};

export type OpenApiResponseSummary = {
    statusCode: string;
    description?: string;
};

export type OpenApiOperationDetails = {
    operationId?: string;
    summary?: string;
    description?: string;
    tags: string[];
    parameters: OpenApiParameterDetails[];
    requestBody?: OpenApiRequestBodyDetails;
    responses: OpenApiResponseSummary[];
};

export type LoadedOpenApi = {
    version: string;
    operations: OperationLookup;
};

const openApiCache = new Map<string, Promise<LoadedOpenApi>>();

function toLookupKey(method: string, routePath: string): string {
    return `${method.toUpperCase()} ${routePath}`;
}

export function makeOperationLookupKey(method: string, routePath: string): string {
    return toLookupKey(method, routePath);
}

/** All OpenAPI paths that support the given HTTP method (normalized case). Sorted for stable completions. */
export function pathsForHttpMethod(operations: OperationLookup, method: string): string[] {
    const prefix = `${method.toUpperCase()} `;
    const paths = new Set<string>();
    for (const key of operations.keys()) {
        if (!key.startsWith(prefix)) {
            continue;
        }
        paths.add(key.slice(prefix.length));
    }
    return [...paths].sort((a, b) => a.localeCompare(b));
}

function mapExamples(examples: Record<string, OpenApiExample | unknown> | undefined): Record<string, unknown> | undefined {
    if (!examples) {
        return undefined;
    }
    const mapped: Record<string, unknown> = {};
    for (const [name, value] of Object.entries(examples)) {
        if (value && typeof value === 'object' && 'value' in value) {
            mapped[name] = (value as OpenApiExample).value;
        } else {
            mapped[name] = value;
        }
    }
    return Object.keys(mapped).length > 0 ? mapped : undefined;
}

function mergeParameters(pathParams: OpenApiParameterObject[] | undefined, operationParams: OpenApiParameterObject[] | undefined): OpenApiParameterObject[] {
    const merged = new Map<string, OpenApiParameterObject>();
    for (const candidate of pathParams ?? []) {
        if (!candidate?.name || !candidate.in) {
            continue;
        }
        merged.set(`${candidate.in}:${candidate.name}`, candidate);
    }
    for (const candidate of operationParams ?? []) {
        if (!candidate?.name || !candidate.in) {
            continue;
        }
        merged.set(`${candidate.in}:${candidate.name}`, candidate);
    }
    return [...merged.values()];
}

function extractRequestBodyDetails(operation: OpenApiOperation): OpenApiRequestBodyDetails | undefined {
    const requestBody = operation.requestBody;
    if (!requestBody) {
        return undefined;
    }
    const content = requestBody.content ?? {};
    const jsonEntry = content['application/json'];
    const firstEntry = Object.entries(content)[0];
    const [contentType, media] = jsonEntry
        ? ['application/json', jsonEntry]
        : firstEntry ?? [undefined, undefined];
    if (!media) {
        return {
            description: requestBody.description,
            required: !!requestBody.required
        };
    }
    return {
        description: requestBody.description,
        required: !!requestBody.required,
        contentType,
        schema: media.schema,
        example: media.example,
        examples: mapExamples(media.examples)
    };
}

function extractResponses(operation: OpenApiOperation): OpenApiResponseSummary[] {
    const responses = operation.responses ?? {};
    return Object.entries(responses)
        .map(([statusCode, response]) => ({
            statusCode,
            description: response?.description
        }))
        .sort((a, b) => a.statusCode.localeCompare(b.statusCode));
}

function toParameterDetails(parameter: OpenApiParameterObject): OpenApiParameterDetails | undefined {
    if (!parameter.name || !parameter.in) {
        return undefined;
    }
    return {
        name: parameter.name,
        in: parameter.in,
        required: parameter.in === 'path' ? true : !!parameter.required,
        description: parameter.description,
        deprecated: parameter.deprecated,
        style: parameter.style,
        explode: parameter.explode,
        schema: parameter.schema,
        example: parameter.example,
        examples: mapExamples(parameter.examples)
    };
}

function toOperationDetails(pathItem: OpenApiPathItem, operation: OpenApiOperation): OpenApiOperationDetails {
    const parameters = mergeParameters(pathItem.parameters, operation.parameters)
        .map(toParameterDetails)
        .filter((entry): entry is OpenApiParameterDetails => !!entry);
    return {
        operationId: operation.operationId,
        summary: operation.summary,
        description: operation.description,
        tags: operation.tags ?? [],
        parameters,
        requestBody: extractRequestBodyDetails(operation),
        responses: extractResponses(operation)
    };
}

function buildOperationLookup(spec: OpenApiDocument): OperationLookup {
    const operations: OperationLookup = new Map();
    if (!spec.paths) {
        return operations;
    }

    for (const [routePath, pathItem] of Object.entries(spec.paths)) {
        if (!pathItem || typeof pathItem !== 'object') {
            continue;
        }
        for (const [method, value] of Object.entries(pathItem)) {
            const normalizedMethod = method.toUpperCase();
            if (normalizedMethod === '$REF') {
                continue;
            }
            if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', 'TRACE'].includes(normalizedMethod)) {
                continue;
            }
            if (value && typeof value === 'object') {
                operations.set(toLookupKey(normalizedMethod, routePath), toOperationDetails(pathItem, value as OpenApiOperation));
            }
        }
    }
    return operations;
}

export function getEffectiveStyle(location: OpenApiParameterLocation, style: string | undefined): string {
    if (style) {
        return style;
    }
    return location === 'query' || location === 'cookie' ? 'form' : 'simple';
}

export function getEffectiveExplode(location: OpenApiParameterLocation, style: string | undefined, explode: boolean | undefined): boolean {
    if (explode !== undefined) {
        return explode;
    }
    return getEffectiveStyle(location, style) === 'form';
}

function schemaKind(schema: OpenApiSchema | undefined): 'primitive' | 'array' | 'object' {
    const explicit = schema?.type;
    if (explicit === 'array') {
        return 'array';
    }
    if (explicit === 'object' || schema?.properties || schema?.additionalProperties) {
        return 'object';
    }
    return 'primitive';
}

export function getUnsupportedSerializationMessages(operation: OpenApiOperationDetails): string[] {
    const messages: string[] = [];
    for (const parameter of operation.parameters) {
        const style = getEffectiveStyle(parameter.in, parameter.style);
        const explode = getEffectiveExplode(parameter.in, parameter.style, parameter.explode);
        const kind = schemaKind(parameter.schema);
        const label = `${parameter.in}:${parameter.name}`;
        if (parameter.in === 'query') {
            if (style !== 'form') {
                messages.push(`${label} uses style "${style}", but MVP supports query style "form" only.`);
                continue;
            }
            continue;
        }
        if (parameter.in === 'path') {
            if (style !== 'simple') {
                messages.push(`${label} uses style "${style}", but MVP supports path style "simple" only.`);
                continue;
            }
            if (kind === 'object') {
                messages.push(`${label} is an object path parameter, which is not supported in MVP serialization.`);
                continue;
            }
            continue;
        }
        if (parameter.in === 'header' || parameter.in === 'cookie') {
            if (kind === 'object' || kind === 'array') {
                messages.push(`${label} is ${kind} typed (${parameter.in}) and not supported in MVP serialization.`);
            }
            if (style !== 'simple' && style !== 'form') {
                messages.push(`${label} uses style "${style}" in ${parameter.in}, which is not supported in MVP serialization.`);
            }
            if (explode && parameter.in === 'header') {
                messages.push(`${label} uses explode=true for header parameter; MVP only supports simple scalar header serialization.`);
            }
        }
    }
    return messages;
}

function loadOpenApiNoCache(absolutePath: string): Promise<LoadedOpenApi> {
    return SwaggerParser.validate(absolutePath).then((api) => {
        const spec = api as OpenApiDocument;
        const version = spec.openapi;
        if (!version || !version.startsWith('3.')) {
            throw new Error(`Only OpenAPI 3.x is supported. Received version "${version ?? 'unknown'}".`);
        }
        return {
            version,
            operations: buildOperationLookup(spec)
        };
    });
}

export async function loadOpenApi(openApiReference: string, baseDir: string): Promise<LoadedOpenApi> {
    const absolutePath = path.resolve(baseDir, openApiReference);
    let cached = openApiCache.get(absolutePath);
    if (!cached) {
        cached = loadOpenApiNoCache(absolutePath);
        openApiCache.set(absolutePath, cached);
    }
    return cached;
}
