import type { Model } from 'api-2-ai-dsl-language';

export type RuntimeOperation = {
    toolName: string;
    method: string;
    path: string;
    intent: string;
    example?: string;
};

export type InvokeArgs = {
    pathParams?: Record<string, string | number | boolean>;
    query?: Record<string, string | number | boolean>;
    headers?: Record<string, string>;
    body?: unknown;
};

export function getOperations(model: Model): RuntimeOperation[] {
    return model.operations.map(operation => ({
        toolName: operation.toolName,
        method: operation.method,
        path: operation.path,
        intent: operation.intent,
        example: operation.example
    }));
}

function buildPathWithParams(routePath: string, pathParams?: Record<string, string | number | boolean>): string {
    if (!pathParams) {
        return routePath;
    }
    let result = routePath;
    for (const [key, value] of Object.entries(pathParams)) {
        result = result.split(`{${key}}`).join(encodeURIComponent(String(value)));
    }
    return result;
}

export function buildToolUrl(baseUrl: string, routePath: string, args: InvokeArgs): URL {
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const resolvedPath = buildPathWithParams(routePath, args.pathParams);
    const url = new URL(normalizedBaseUrl + resolvedPath);
    if (args.query) {
        for (const [key, value] of Object.entries(args.query)) {
            url.searchParams.set(key, String(value));
        }
    }
    return url;
}

export async function invokeOperation(baseUrl: string, operation: RuntimeOperation, args: InvokeArgs): Promise<unknown> {
    const url = buildToolUrl(baseUrl, operation.path, args);
    const requestInit: RequestInit = {
        method: operation.method,
        headers: {
            'content-type': 'application/json',
            ...(args.headers ?? {})
        }
    };

    if (args.body !== undefined && operation.method !== 'GET' && operation.method !== 'HEAD') {
        requestInit.body = JSON.stringify(args.body);
    }

    const response = await fetch(url, requestInit);
    const contentType = response.headers.get('content-type') ?? '';
    const responseBody = contentType.includes('application/json')
        ? await response.json()
        : await response.text();

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody)}`);
    }

    return responseBody;
}
