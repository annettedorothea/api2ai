import path from 'node:path';
import SwaggerParser from '@apidevtools/swagger-parser';

export type OpenApiSchema = {
    /** OpenAPI 3.0: string; 3.1 may use an array of primitive type strings. */
    type?: string | string[];
    description?: string;
    title?: string;
    enum?: unknown[];
    const?: unknown;
    default?: unknown;
    nullable?: boolean;
    format?: string;
    /** Numeric / string constraints (JSON Schema; passed through to MCP after dereference). */
    minimum?: number;
    maximum?: number;
    exclusiveMinimum?: number | boolean;
    exclusiveMaximum?: number | boolean;
    multipleOf?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    minItems?: number;
    maxItems?: number;
    uniqueItems?: boolean;
    minProperties?: number;
    maxProperties?: number;
    items?: OpenApiSchema;
    properties?: Record<string, OpenApiSchema | undefined>;
    required?: string[];
    oneOf?: OpenApiSchema[];
    anyOf?: OpenApiSchema[];
    allOf?: OpenApiSchema[];
    not?: OpenApiSchema;
    additionalProperties?: boolean | OpenApiSchema;
    example?: unknown;
    readOnly?: boolean;
    writeOnly?: boolean;
    deprecated?: boolean;
    discriminator?: unknown;
    $ref?: string;
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
    content?: Record<string, OpenApiMediaType | undefined>;
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
    contentType?: string;
    schema?: OpenApiSchema;
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

function mapExamples(
    examples: Record<string, OpenApiExample | unknown> | undefined
): Record<string, unknown> | undefined {
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

function mergeParameters(
    pathParams: OpenApiParameterObject[] | undefined,
    operationParams: OpenApiParameterObject[] | undefined
): OpenApiParameterObject[] {
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
    const [contentType, media] = jsonEntry ? ['application/json', jsonEntry] : (firstEntry ?? [undefined, undefined]);
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

function extractMediaForResponse(
    response: OpenApiResponse | undefined
): { contentType?: string; schema?: OpenApiSchema } | undefined {
    const content = response?.content ?? {};
    if (Object.keys(content).length === 0) {
        return undefined;
    }
    const jsonEntry = content['application/json'];
    const firstPair =
        jsonEntry !== undefined
            ? (['application/json', jsonEntry] as const)
            : (Object.entries(content)[0] as [string, OpenApiMediaType] | undefined);
    if (!firstPair) {
        return undefined;
    }
    const [contentType, media] = firstPair;
    return { contentType, schema: media?.schema };
}

function extractResponses(operation: OpenApiOperation): OpenApiResponseSummary[] {
    const responses = operation.responses ?? {};
    return Object.entries(responses)
        .map(([statusCode, raw]) => {
            const response = raw as OpenApiResponse | undefined;
            const media = extractMediaForResponse(response);
            return {
                statusCode,
                description: response?.description,
                contentType: media?.contentType,
                schema: media?.schema
            };
        })
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
                operations.set(
                    toLookupKey(normalizedMethod, routePath),
                    toOperationDetails(pathItem, value as OpenApiOperation)
                );
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

export function getEffectiveExplode(
    location: OpenApiParameterLocation,
    style: string | undefined,
    explode: boolean | undefined
): boolean {
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

/** Parameter names emitted into generated invoke/schema (path, query, header). */
export function openApiInvokeParameterNames(operation: OpenApiOperationDetails): Set<string> {
    const names = new Set<string>();
    for (const parameter of operation.parameters) {
        if (parameter.in === 'path' || parameter.in === 'query' || parameter.in === 'header') {
            names.add(parameter.name);
        }
    }
    return names;
}

export type UnknownOptionalParamWarning = {
    index: number;
    name: string;
    message: string;
};

/** DSL clientMayOmit names that do not match any invoke parameter on the OpenAPI operation. */
export function getUnknownClientMayOmitWarnings(
    clientMayOmit: readonly string[],
    openApiOperation: OpenApiOperationDetails,
    method: string,
    routePath: string
): UnknownOptionalParamWarning[] {
    if (!clientMayOmit.length) {
        return [];
    }
    const known = openApiInvokeParameterNames(openApiOperation);
    const warnings: UnknownOptionalParamWarning[] = [];
    clientMayOmit.forEach((raw, index) => {
        const name = raw.trim();
        if (name.length === 0) {
            return;
        }
        if (known.has(name)) {
            return;
        }
        warnings.push({
            index,
            name,
            message: `clientMayOmit entry "${name}" is not a path, query, or header parameter on ${method} ${routePath} in the OpenAPI spec (no effect on the generated tool schema).`
        });
    });
    return warnings;
}

/** DSL clientMayOmit names that refer to OpenAPI parameters already marked optional (unnecessary). */
export function getUnnecessaryClientMayOmitWarnings(
    clientMayOmit: readonly string[],
    openApiOperation: OpenApiOperationDetails,
    method: string,
    routePath: string
): UnknownOptionalParamWarning[] {
    if (!clientMayOmit.length) {
        return [];
    }
    const warnings: UnknownOptionalParamWarning[] = [];
    clientMayOmit.forEach((raw, index) => {
        const name = raw.trim();
        if (name.length === 0) {
            return;
        }
        const parameter = openApiOperation.parameters.find(
            (entry) => entry.name === name && (entry.in === 'path' || entry.in === 'query' || entry.in === 'header')
        );
        if (!parameter || parameter.required) {
            return;
        }
        warnings.push({
            index,
            name,
            message: `clientMayOmit entry "${name}" is already optional in OpenAPI on ${method} ${routePath} (no effect on the generated tool schema).`
        });
    });
    return warnings;
}

export type UnknownApiParamPatchWarning = {
    index: number;
    name: string;
    message: string;
};

/** DSL params patch keys that do not match any invoke parameter on the OpenAPI operation. */
export function getUnknownApiParamPatchWarnings(
    params: { entries?: Array<{ key: string }> } | undefined,
    openApiOperation: OpenApiOperationDetails,
    method: string,
    routePath: string
): UnknownApiParamPatchWarning[] {
    const entries = params?.entries ?? [];
    if (entries.length === 0) {
        return [];
    }
    const known = openApiInvokeParameterNames(openApiOperation);
    const warnings: UnknownApiParamPatchWarning[] = [];
    entries.forEach((entry, index) => {
        const name = entry.key.trim();
        if (name.length === 0 || known.has(name)) {
            return;
        }
        warnings.push({
            index,
            name,
            message: `params entry "${name}" is not a path, query, or header parameter on ${method} ${routePath} in the OpenAPI spec (no effect on the generated tool schema).`
        });
    });
    return warnings;
}

export function findOpenApiInvokeParameter(
    name: string,
    openApiOperation: OpenApiOperationDetails
): OpenApiParameterDetails | undefined {
    const trimmed = name.trim();
    return openApiOperation.parameters.find(
        (p) => p.name === trimmed && (p.in === 'path' || p.in === 'query' || p.in === 'header')
    );
}

/** DSL `body` text when OpenAPI operation has no requestBody. */
export function getDslBodyWithoutOpenApiRequestBodyWarning(
    dslBody: string | undefined,
    openApiOperation: OpenApiOperationDetails,
    method: string,
    routePath: string
): string | undefined {
    if (dslBody === undefined || dslBody.trim().length === 0) {
        return undefined;
    }
    if (openApiOperation.requestBody) {
        return undefined;
    }
    return `Operation ${method} ${routePath}: DSL \`body\` is set but OpenAPI has no requestBody for this operation (description appears in MCP tool text only).`;
}

/** Cookie parameters are not emitted into generated invoke/schema; fail validation so users do not rely on silent omission. */
export function getCookieParameterMessages(operation: OpenApiOperationDetails): string[] {
    const cookies = operation.parameters.filter((p) => p.in === 'cookie');
    if (cookies.length === 0) {
        return [];
    }
    const names = cookies.map((c) => c.name).join(', ');
    return [
        `cookie parameters are not supported in generated invoke (found: ${names}). Remove the operation from the DSL or drop cookie parameters in OpenAPI for this path.`
    ];
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
                messages.push(
                    `${label} uses style "${style}" in ${parameter.in}, which is not supported in MVP serialization.`
                );
            }
            if (explode && parameter.in === 'header') {
                messages.push(
                    `${label} uses explode=true for header parameter; MVP only supports simple scalar header serialization.`
                );
            }
        }
    }
    return messages;
}

function loadOpenApiNoCache(absolutePath: string): Promise<LoadedOpenApi> {
    return SwaggerParser.dereference(absolutePath).then((api) => {
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
