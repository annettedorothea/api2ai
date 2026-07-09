/** Generated invokeTool preamble: normalize URL, resolve path/query, build request headers (no auth). */
export function urlAndHeadersPreambleFragment(): string {
    return `
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const pathParams = { ...(optionsResolved.pathParams ?? {}) };
    const pathWireNames: Record<string, string> = (pathParamWireNamesByTool as Record<string, Record<string, string>>)[tool.toolName] ?? {};
    let resolvedPath = tool.path;
    for (const [key, value] of Object.entries(pathParams)) {
        const wireKey = pathWireNames[key] ?? key;
        resolvedPath = resolvedPath.split('{' + wireKey + '}').join(encodeURIComponent(String(value)));
    }

    const url = new URL(normalizedBaseUrl + resolvedPath);
    appendSerializedQueryParams(url.searchParams, tool.toolName, optionsResolved.query);
    const headerWireNames: Record<string, string> = (headerParamWireNamesByTool as Record<string, Record<string, string>>)[tool.toolName] ?? {};
    const requestHeaders: Record<string, string> = {
        'content-type': 'application/json'
    };
    if (optionsResolved.headers) {
        for (const [key, value] of Object.entries(optionsResolved.headers)) {
            const wireKey = headerWireNames[key] ?? key;
            requestHeaders[wireKey] = value;
        }
    }`;
}
