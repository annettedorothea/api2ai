import path from 'node:path';
import SwaggerParser from '@apidevtools/swagger-parser';

type OpenApiOperation = {
    operationId?: string;
};

type OpenApiPathItem = Record<string, OpenApiOperation | unknown> & {
    $ref?: string;
};

type OpenApiDocument = {
    openapi?: string;
    paths?: Record<string, OpenApiPathItem | undefined>;
};

export type OperationLookup = Map<string, OpenApiOperation>;

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
                operations.set(toLookupKey(normalizedMethod, routePath), value as OpenApiOperation);
            }
        }
    }
    return operations;
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
