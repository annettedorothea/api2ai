/**
 * Generated from: ./examples/tmdb.api2ai
 * Referenced OpenAPI: ./openapi/tmdb.openapi.json
 */

export const baseUrl = "https://api.themoviedb.org";

export type GeneratedTool = {
    toolName: string;
    description: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'TRACE';
    path: string;
    example?: string;
};

type ToolDefinition = {
    method: GeneratedTool['method'];
    path: string;
    toolName: string;
    intent: string;
    example?: string;
};

const rawTools: ToolDefinition[] = [
    {
        "method": "GET",
        "path": "/3/search/movie",
        "toolName": "searchTmdbMovies",
        "intent": "search TMDB movies by title",
        "example": "Find movies named Dune"
    },
    {
        "method": "GET",
        "path": "/3/movie/popular",
        "toolName": "getPopularTmdbMovies",
        "intent": "retrieve currently popular TMDB movies",
        "example": "Show popular movies"
    },
    {
        "method": "GET",
        "path": "/3/movie/{movie_id}",
        "toolName": "getTmdbMovieDetails",
        "intent": "retrieve details for a TMDB movie by id",
        "example": "Get details for movie id 693134"
    },
    {
        "method": "GET",
        "path": "/3/movie/{movie_id}/credits",
        "toolName": "getTmdbMovieCredits",
        "intent": "retrieve cast and crew credits for a TMDB movie",
        "example": "Who played in movie id 693134?"
    },
    {
        "method": "GET",
        "path": "/3/discover/movie",
        "toolName": "discoverTmdbMovies",
        "intent": "discover TMDB movies using rich filters such as genre, year, and rating",
        "example": "Find highly rated science fiction movies from 2024"
    },
    {
        "method": "GET",
        "path": "/3/genre/movie/list",
        "toolName": "getTmdbMovieGenres",
        "intent": "retrieve TMDB movie genres for filtering and lookup",
        "example": "List available movie genres"
    },
    {
        "method": "GET",
        "path": "/3/trending/movie/{time_window}",
        "toolName": "getTmdbTrendingMovies",
        "intent": "retrieve trending TMDB movies for a selected time window",
        "example": "Show trending movies this week"
    },
    {
        "method": "GET",
        "path": "/3/movie/{movie_id}/videos",
        "toolName": "getTmdbMovieVideos",
        "intent": "retrieve videos such as trailers for a TMDB movie",
        "example": "Show trailers for movie id 693134"
    },
    {
        "method": "GET",
        "path": "/3/search/multi",
        "toolName": "searchTmdbMulti",
        "intent": "search TMDB across movies, tv shows, and people",
        "example": "Search TMDB for Dune across all media types"
    }
];

export const generatedTools: GeneratedTool[] = rawTools.map((tool) => ({
    toolName: tool.toolName,
    description: tool.example ? tool.intent + ' Example: ' + tool.example : tool.intent,
    method: tool.method,
    path: tool.path,
    example: tool.example
}));

export type InvokeOptions = {
    baseUrl?: string;
    pathParams?: Record<string, string | number | boolean>;
    query?: Record<string, string | number | boolean>;
    headers?: Record<string, string>;
    body?: unknown;
};

type AuthConfig = {
    location: 'header' | 'query';
    name: string;
    env: string;
    prefix?: string;
};

const authConfig: AuthConfig | undefined = {
    "location": "header",
    "name": "Authorization",
    "env": "TMDB_ACCESS_TOKEN",
    "prefix": "Bearer "
};

const defaultInputSchema = {
    pathParams: { type: 'object', additionalProperties: true },
    query: { type: 'object', additionalProperties: true },
    headers: { type: 'object', additionalProperties: true },
    body: {}
};

export const inputSchemaByTool = Object.fromEntries(generatedTools.map((tool) => [tool.toolName, defaultInputSchema]));

function resolveAuthValue(auth) {
    const secret = process.env[auth.env];
    if (!secret) {
        throw new Error('Missing required environment variable ' + auth.env + ' for API auth.');
    }
    return (auth.prefix ?? '') + secret;
}

export async function invokeTool(toolName, options = {}) {
    const tool = generatedTools.find(t => t.toolName === toolName);
    if (!tool) {
        throw new Error('Unknown tool: ' + toolName);
    }

    const effectiveBaseUrl = options.baseUrl ?? baseUrl;
    const normalizedBaseUrl = effectiveBaseUrl.endsWith('/') ? effectiveBaseUrl.slice(0, -1) : effectiveBaseUrl;
    let resolvedPath = tool.path;
    for (const [key, value] of Object.entries(options.pathParams ?? {})) {
        resolvedPath = resolvedPath.split('{'+ key +'}').join(encodeURIComponent(String(value)));
    }

    const url = new URL(normalizedBaseUrl + resolvedPath);
    if (options.query) {
        for (const [key, value] of Object.entries(options.query)) {
            if (value === undefined || value === null) {
                continue;
            }
            url.searchParams.set(key, String(value));
        }
    }
    const requestHeaders = {
        'content-type': 'application/json',
        ...(options.headers ?? {})
    };
    if (authConfig) {
        const authValue = resolveAuthValue(authConfig);
        if (authConfig.location === 'header') {
            requestHeaders[authConfig.name] = authValue;
        } else {
            url.searchParams.set(authConfig.name, authValue);
        }
    }

    const requestInit = {
        method: tool.method,
        headers: requestHeaders
    };

    if (options.body !== undefined && tool.method !== 'GET' && tool.method !== 'HEAD') {
        requestInit.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, requestInit);
    if (!response.ok) {
        throw new Error('HTTP ' + response.status + ' while invoking ' + tool.toolName);
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
        return response.json();
    }
    return response.text();
}
