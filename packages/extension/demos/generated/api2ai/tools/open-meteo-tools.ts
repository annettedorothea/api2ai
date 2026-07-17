/**
 * Generated from: open-meteo.api2ai
 * Referenced OpenAPI: ./openapi/open-meteo.openapi.yaml
 */
import { loggingAdapter } from '../../../src/utils/logging-adapter.js';
import * as z from 'zod/v4';

export type GeneratedTool = {
    toolName: string;
    title: string;
    description: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'TRACE';
    path: string;
    access: 'public' | 'protected';
    hasCheckToolAccess: boolean;
    hasPrepareToolCall: boolean;
};

export const generatedTools: GeneratedTool[] = [
    {
        toolName: 'openMeteoForecast',
        title: '7 day weather forecast for coordinates',
        description:
            'Intent:\nretrieve hourly weather forecast for coordinates\n\nMCP arguments:\npass hourly, daily, latitude, longitude, current_weather, temperature_unit, wind_speed_unit, timeformat, timezone, past_days as top-level tool arguments. Do not nest path or query parameters under pathParams or query.\n\nAPI:\n- Fetch up to 7 days of weather forecast for fixed WGS84 coordinates (query: latitude, longitude).\n        - Supports hourly and daily aggregates; request only the variables needed (e.g. temperature_2m, precipitation_sum, weather_code).\n        - Prefer small hourly/daily arrays to keep MCP responses compact and agent-focused.\n        - Optional: timezone (e.g. Europe/Berlin), temperature_unit, wind_speed_unit, current_weather for nowcast.\n        - Resolve place names to coordinates first via openMeteoGeocodeSearch (api2ai-open-meteo-geocoding), then call this tool.\n        - Public endpoint; no API key. OpenAPI operation text is overridden here for clearer agent guidance.\n\nMeta:\ntags: Weather Forecast APIs\n\nParameters:\n- current_weather (query): (type: boolean)\n- daily (query): (type: array of string)\n- hourly (query): (type: array of string)\n- latitude (query): WGS84 coordinate (type: number)\n- longitude (query): WGS84 coordinate (type: number)\n- past_days (query): If `past_days` is set, yesterdays or the day before yesterdays data are also returned. (type: integer)\n- temperature_unit (query): (type: string)\n- timeformat (query): If format `unixtime` is selected, all time values are returned in UNIX epoch time in seconds. Please not that all time is then in GMT+0! For daily values with unix timestamp, please apply `utc_offset_seconds` again to get the correct date. (type: string)\n- timezone (query): If `timezone` is set, all timestamps are returned as local-time and data is returned starting at 0:00 local-time. Any time zone name from the [time zone database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) is supported. (type: string)\n- wind_speed_unit (query): (type: string)\n\nExample:\nGet hourly temperature forecast for Offenburg, Germany\n\nResponse:\nHTTP 200\nOK\nproperties (top-level): current_weather, daily, daily_units, elevation, generationtime_ms, hourly, hourly_units, latitude, longitude, utc_offset_seconds\nDocumented errors:\nHTTP 400 — Bad Request\n\nRuntime: public endpoint — no credential required.',
        method: 'GET',
        path: '/v1/forecast',
        access: 'public',
        hasCheckToolAccess: false,
        hasPrepareToolCall: false
    }
];

export type InvokeOptions = {
    /** MCP tool arguments only (host context is supplied by the MCP host in servers/*). */
    pathParams?: Record<string, string | number | boolean>;
    query?: Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
    headers?: Record<string, string>;
    body?: unknown;
};

export type ApiHostContext = {
    baseUrl: string;
    credential?: string;
};

export const requiresAuth = false;

export const mcpServerName = 'open-meteo-tools';
export const mcpServerVersion = '1.0.1';

export { mcpBuildGeneratedAt } from '../mcp-build-generated-at.js';

export const inputZodByTool = {
    openMeteoForecast: z
        .object({
            hourly: z
                .union([
                    z.array(
                        z.union([
                            z.literal('temperature_2m'),
                            z.literal('relative_humidity_2m'),
                            z.literal('dew_point_2m'),
                            z.literal('apparent_temperature'),
                            z.literal('pressure_msl'),
                            z.literal('cloud_cover'),
                            z.literal('cloud_cover_low'),
                            z.literal('cloud_cover_mid'),
                            z.literal('cloud_cover_high'),
                            z.literal('wind_speed_10m'),
                            z.literal('wind_speed_80m'),
                            z.literal('wind_speed_120m'),
                            z.literal('wind_speed_180m'),
                            z.literal('wind_direction_10m'),
                            z.literal('wind_direction_80m'),
                            z.literal('wind_direction_120m'),
                            z.literal('wind_direction_180m'),
                            z.literal('wind_gusts_10m'),
                            z.literal('shortwave_radiation'),
                            z.literal('direct_radiation'),
                            z.literal('direct_normal_irradiance'),
                            z.literal('diffuse_radiation'),
                            z.literal('vapour_pressure_deficit'),
                            z.literal('evapotranspiration'),
                            z.literal('precipitation'),
                            z.literal('weather_code'),
                            z.literal('snow_height'),
                            z.literal('freezing_level_height'),
                            z.literal('soil_temperature_0cm'),
                            z.literal('soil_temperature_6cm'),
                            z.literal('soil_temperature_18cm'),
                            z.literal('soil_temperature_54cm'),
                            z.literal('soil_moisture_0_1cm'),
                            z.literal('soil_moisture_1_3cm'),
                            z.literal('soil_moisture_3_9cm'),
                            z.literal('soil_moisture_9_27cm'),
                            z.literal('soil_moisture_27_81cm')
                        ])
                    ),
                    z.string()
                ])
                .optional(),
            daily: z
                .union([
                    z.array(
                        z.union([
                            z.literal('temperature_2m_max'),
                            z.literal('temperature_2m_min'),
                            z.literal('apparent_temperature_max'),
                            z.literal('apparent_temperature_min'),
                            z.literal('precipitation_sum'),
                            z.literal('precipitation_hours'),
                            z.literal('weather_code'),
                            z.literal('sunrise'),
                            z.literal('sunset'),
                            z.literal('wind_speed_10m_max'),
                            z.literal('wind_gusts_10m_max'),
                            z.literal('wind_direction_10m_dominant'),
                            z.literal('shortwave_radiation_sum'),
                            z.literal('uv_index_max'),
                            z.literal('uv_index_clear_sky_max'),
                            z.literal('et0_fao_evapotranspiration')
                        ])
                    ),
                    z.string()
                ])
                .optional(),
            latitude: z.number().describe('WGS84 coordinate (type: number)'),
            longitude: z.number().describe('WGS84 coordinate (type: number)'),
            current_weather: z.boolean().optional(),
            temperature_unit: z.union([z.literal('celsius'), z.literal('fahrenheit')]).optional(),
            wind_speed_unit: z.union([z.literal('kmh'), z.literal('ms'), z.literal('mph'), z.literal('kn')]).optional(),
            timeformat: z
                .union([z.literal('iso8601'), z.literal('unixtime')])
                .describe(
                    'If format `unixtime` is selected, all time values are returned in UNIX epoch time in seconds. Please not that all time is then in GMT+0! For daily values with unix timestamp, please apply `utc_offset_seconds` again to get the correct date. (type: string)'
                )
                .optional(),
            timezone: z
                .string()
                .describe(
                    'If `timezone` is set, all timestamps are returned as local-time and data is returned starting at 0:00 local-time. Any time zone name from the [time zone database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) is supported. (type: string)'
                )
                .optional(),
            past_days: z
                .union([z.literal(1), z.literal(2)])
                .describe(
                    'If `past_days` is set, yesterdays or the day before yesterdays data are also returned. (type: integer)'
                )
                .optional(),
            headers: z.record(z.string(), z.string()).describe('Optional extra headers.').optional(),
            body: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('Request body JSON if applicable.')
                .optional()
        })
        .strict()
        .describe('Arguments for invoking the generated HTTP wrapper.')
};

const invokeParamBucketsByTool = {
    openMeteoForecast: {
        pathParams: [],
        query: [
            'hourly',
            'daily',
            'latitude',
            'longitude',
            'current_weather',
            'temperature_unit',
            'wind_speed_unit',
            'timeformat',
            'timezone',
            'past_days'
        ],
        headers: [],
        arrayQuery: ['hourly', 'daily']
    }
};

function splitInvokeQueryArrayValue(value: string): ReadonlyArray<string | number | boolean> {
    return value
        .split(',')
        .map((part) => part.trim())
        .filter((part) => part.length > 0);
}

function prepareQueryBucket(toolName: string, bucket: InvokeOptions['query']): InvokeOptions['query'] {
    if (!bucket) {
        return undefined;
    }
    const arrayQueryKeys = new Set(
        (invokeParamBucketsByTool as Record<string, { arrayQuery?: string[] }>)[toolName]?.arrayQuery ?? []
    );
    const out: Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>> = {};
    for (const [key, value] of Object.entries(bucket)) {
        if (value === undefined || value === null) {
            continue;
        }
        if (arrayQueryKeys.has(key) && typeof value === 'string') {
            out[key] = splitInvokeQueryArrayValue(value);
            continue;
        }
        out[key] = value as string | number | boolean | ReadonlyArray<string | number | boolean>;
    }
    return Object.keys(out).length > 0 ? out : undefined;
}

function omitNullishPathParams(
    bucket: Record<string, string | number | boolean> | undefined
): Record<string, string | number | boolean> | undefined {
    if (!bucket) {
        return undefined;
    }
    const out: Record<string, string | number | boolean> = {};
    for (const [key, value] of Object.entries(bucket)) {
        if (value === undefined || value === null) {
            continue;
        }
        out[key] = value;
    }
    return Object.keys(out).length > 0 ? out : undefined;
}

function isInvokeQueryBucketValue(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeInvokeOptions(toolName: string, options: InvokeOptions): InvokeOptions {
    const buckets = (
        invokeParamBucketsByTool as Record<
            string,
            { pathParams?: string[]; query?: string[]; headers?: string[]; arrayQuery?: string[] }
        >
    )[toolName];
    if (!buckets) {
        return options;
    }
    const pathKeys = buckets.pathParams ?? [];
    const queryKeys = buckets.query ?? [];
    const headerKeys = buckets.headers ?? [];
    const arrayQueryKeys = new Set(buckets.arrayQuery ?? []);
    const knownFlatKeys = new Set([...pathKeys, ...queryKeys, ...headerKeys]);
    const hasTopLevelFlatParam = Object.keys(options).some((key) => {
        if (key === 'body' || key === 'pathParams' || key === 'headers') {
            return false;
        }
        if (key === 'query') {
            return queryKeys.includes('query') && !isInvokeQueryBucketValue(options.query);
        }
        return knownFlatKeys.has(key);
    });
    if (!hasTopLevelFlatParam) {
        return {
            ...options,
            pathParams: omitNullishPathParams(options.pathParams),
            query: prepareQueryBucket(toolName, isInvokeQueryBucketValue(options.query) ? options.query : undefined)
        };
    }

    const pathParams: Record<string, string | number | boolean> = { ...(options.pathParams ?? {}) };
    const query: Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>> =
        isInvokeQueryBucketValue(options.query)
            ? {
                  ...(options.query as Record<
                      string,
                      string | number | boolean | ReadonlyArray<string | number | boolean>
                  >)
              }
            : {};
    const headers: Record<string, string> =
        options.headers && typeof options.headers === 'object' ? { ...options.headers } : {};

    for (const [key, value] of Object.entries(options)) {
        if (value === undefined || value === null) {
            continue;
        }
        if (key === 'body' || key === 'pathParams') {
            continue;
        }
        if (key === 'query') {
            if (queryKeys.includes('query') && !isInvokeQueryBucketValue(value)) {
                if (arrayQueryKeys.has(key) && typeof value === 'string') {
                    query[key] = splitInvokeQueryArrayValue(value);
                } else {
                    query[key] = value as string | number | boolean | ReadonlyArray<string | number | boolean>;
                }
            }
            continue;
        }
        if (key === 'headers') {
            if (headerKeys.length === 0 && typeof value === 'object' && !Array.isArray(value)) {
                Object.assign(headers, value as Record<string, string>);
            }
            continue;
        }
        if (pathKeys.includes(key)) {
            pathParams[key] = value as string | number | boolean;
        } else if (queryKeys.includes(key)) {
            if (arrayQueryKeys.has(key) && typeof value === 'string') {
                query[key] = splitInvokeQueryArrayValue(value);
            } else {
                query[key] = value as string | number | boolean | ReadonlyArray<string | number | boolean>;
            }
        } else if (headerKeys.includes(key)) {
            headers[key] = String(value);
        }
    }

    return {
        pathParams: omitNullishPathParams(pathParams),
        query: prepareQueryBucket(toolName, query),
        headers: Object.keys(headers).length > 0 ? headers : undefined,
        body: options.body
    };
}
const queryParamSerializationByTool = {
    openMeteoForecast: {
        hourly: {
            style: 'form',
            explode: false
        },
        daily: {
            style: 'form',
            explode: true
        },
        latitude: {
            style: 'form',
            explode: true
        },
        longitude: {
            style: 'form',
            explode: true
        },
        current_weather: {
            style: 'form',
            explode: true
        },
        temperature_unit: {
            style: 'form',
            explode: true
        },
        wind_speed_unit: {
            style: 'form',
            explode: true
        },
        timeformat: {
            style: 'form',
            explode: true
        },
        timezone: {
            style: 'form',
            explode: true
        },
        past_days: {
            style: 'form',
            explode: true
        }
    }
};
const queryParamWireNamesByTool = {
    openMeteoForecast: {}
};
const pathParamWireNamesByTool = {
    openMeteoForecast: {}
};
const headerParamWireNamesByTool = {
    openMeteoForecast: {}
};

function appendSerializedQueryParams(
    searchParams: URLSearchParams,
    toolName: string,
    query: InvokeOptions['query']
): void {
    if (!query) {
        return;
    }
    const hintsByParam: Record<string, { style?: string; explode?: boolean }> =
        (queryParamSerializationByTool as Record<string, Record<string, { style?: string; explode?: boolean }>>)[
            toolName
        ] ?? {};
    const wireNames: Record<string, string> =
        (queryParamWireNamesByTool as Record<string, Record<string, string>>)[toolName] ?? {};
    for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null) {
            continue;
        }
        const wireKey = wireNames[key] ?? key;
        if (Array.isArray(value)) {
            const hint = hintsByParam[key];
            const style = hint && hint.style ? hint.style : 'form';
            const explode = hint && typeof hint.explode === 'boolean' ? hint.explode : true;
            if (style !== 'form') {
                throw new Error(
                    'invokeTool: query array param "' +
                        key +
                        '" uses OpenAPI style "' +
                        style +
                        '"; only style "form" is supported for arrays.'
                );
            }
            const parts: string[] = [];
            for (const element of value) {
                if (element === undefined || element === null) {
                    continue;
                }
                parts.push(String(element));
            }
            if (parts.length === 0) {
                continue;
            }
            if (explode) {
                for (const p of parts) {
                    searchParams.append(wireKey, p);
                }
            } else {
                searchParams.set(wireKey, parts.join(','));
            }
            continue;
        }
        searchParams.set(wireKey, String(value));
    }
}

async function performToolHttpRequest(
    url: URL,
    init: { method: string; headers: Record<string, string>; body?: string }
): Promise<Response> {
    if (init.method !== 'TRACE') {
        return fetch(url, init as RequestInit);
    }
    const client = url.protocol === 'https:' ? await import('node:https') : await import('node:http');
    return new Promise((resolve, reject) => {
        const req = client.request(
            {
                protocol: url.protocol,
                hostname: url.hostname,
                port: url.port || undefined,
                path: url.pathname + url.search,
                method: 'TRACE',
                headers: init.headers
            },
            (res) => {
                const chunks: Buffer[] = [];
                res.on('data', (chunk: Buffer) => chunks.push(chunk));
                res.on('end', () => {
                    const responseHeaders = new Headers();
                    for (const [name, value] of Object.entries(res.headers)) {
                        if (value === undefined) {
                            continue;
                        }
                        if (Array.isArray(value)) {
                            for (const entry of value) {
                                responseHeaders.append(name, entry);
                            }
                        } else {
                            responseHeaders.set(name, value);
                        }
                    }
                    resolve(
                        new Response(Buffer.concat(chunks), {
                            status: res.statusCode ?? 500,
                            headers: responseHeaders
                        })
                    );
                });
            }
        );
        req.on('error', reject);
        if (init.body) {
            req.write(init.body);
        }
        req.end();
    });
}

export async function invokeTool(
    toolName: string,
    options: InvokeOptions = {},
    hostContext?: ApiHostContext
): Promise<unknown> {
    const tool = generatedTools.find((t) => t.toolName === toolName);
    if (!tool) {
        throw new Error('Unknown tool: ' + toolName);
    }
    loggingAdapter.debug('invokeTool', { toolName, method: tool.method, path: tool.path });
    const optionsResolved = normalizeInvokeOptions(toolName, options);

    if (hostContext === undefined) {
        throw new Error('invokeTool requires hostContext from the MCP host (servers/*-mcp-server).');
    }
    const host = hostContext as ApiHostContext;
    const { baseUrl } = host;
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const pathParams = { ...(optionsResolved.pathParams ?? {}) };
    const pathWireNames: Record<string, string> =
        (pathParamWireNamesByTool as Record<string, Record<string, string>>)[tool.toolName] ?? {};
    let resolvedPath = tool.path;
    for (const [key, value] of Object.entries(pathParams)) {
        const wireKey = pathWireNames[key] ?? key;
        resolvedPath = resolvedPath.split('{' + wireKey + '}').join(encodeURIComponent(String(value)));
    }

    const url = new URL(normalizedBaseUrl + resolvedPath);
    appendSerializedQueryParams(url.searchParams, tool.toolName, optionsResolved.query);
    const headerWireNames: Record<string, string> =
        (headerParamWireNamesByTool as Record<string, Record<string, string>>)[tool.toolName] ?? {};
    const requestHeaders: Record<string, string> = {
        'content-type': 'application/json'
    };
    if (optionsResolved.headers) {
        for (const [key, value] of Object.entries(optionsResolved.headers)) {
            const wireKey = headerWireNames[key] ?? key;
            requestHeaders[wireKey] = value;
        }
    }

    const requestInit: Record<string, unknown> = {
        method: tool.method,
        headers: requestHeaders
    };

    if (optionsResolved.body !== undefined && tool.method !== 'GET' && tool.method !== 'HEAD') {
        requestInit.body = JSON.stringify(optionsResolved.body);
    }

    const response = await performToolHttpRequest(url, {
        method: tool.method,
        headers: requestHeaders as Record<string, string>,
        body: typeof requestInit.body === 'string' ? requestInit.body : undefined
    });
    if (!response.ok) {
        const retryAfter = response.headers.get('retry-after');
        let bodySnippet = '';
        try {
            const t = await response.text();
            bodySnippet = t.length > 512 ? t.slice(0, 512) + '...' : t;
        } catch {
            /* ignore unreadable error body */
        }
        let msg = 'HTTP ' + response.status + ' while invoking ' + tool.toolName + '.';
        if (response.status === 401) {
            msg += ' Unauthorized.';
            if (tool.access === 'protected') {
                msg += ' The API may require authentication.';
            }
        } else if (response.status === 403) {
            msg += ' Forbidden: insufficient permission for this request.';
        } else if (response.status === 429) {
            msg += ' Too Many Requests (rate limited).';
            if (retryAfter) {
                msg += ' Retry-After: ' + retryAfter + ' (seconds or HTTP-date per server).';
            } else {
                msg += ' Wait before retrying.';
            }
        }
        if (bodySnippet) {
            msg += ' Response body: ' + bodySnippet;
        }
        loggingAdapter.error(msg, { toolName: tool.toolName, status: response.status });
        throw new Error(msg);
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
        return response.json();
    }
    return response.text();
}
