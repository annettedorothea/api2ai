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
    hasAuthorize: boolean;
    hasValidate: boolean;
};

export const generatedTools: GeneratedTool[] = [
    {
        toolName: 'openMeteoForecast',
        title: '7 day weather forecast for coordinates',
        description:
            'Intent:\nretrieve hourly weather forecast for coordinates\n\nAPI:\n- Fetch up to 7 days of weather forecast for fixed WGS84 coordinates (query: latitude, longitude).\n        - Supports hourly and daily aggregates; request only the variables needed (e.g. temperature_2m, precipitation_sum, weather_code).\n        - Prefer small hourly/daily arrays to keep MCP responses compact and agent-focused.\n        - Optional: timezone (e.g. Europe/Berlin), temperature_unit, wind_speed_unit, current_weather for nowcast.\n        - Resolve place names to coordinates first via openMeteoGeocodeSearch (api2ai-open-meteo-geocoding), then call this tool.\n        - Public endpoint; no API key. OpenAPI operation text is overridden here for clearer agent guidance.\n\nMeta:\ntags: Weather Forecast APIs\n\nParameters:\n- current_weather (query)\n- daily (query)\n- hourly (query)\n- latitude (query): WGS84 coordinate\n- longitude (query): WGS84 coordinate\n- past_days (query): If `past_days` is set, yesterdays or the day before yesterdays data are also returned.\n- temperature_unit (query)\n- timeformat (query): If format `unixtime` is selected, all time values are returned in UNIX epoch time in seconds. Please not that all time is then in GMT+0! For daily values with unix timestamp, please apply `utc_offset_seconds` again to get the correct date.\n- timezone (query): If `timezone` is set, all timestamps are returned as local-time and data is returned starting at 0:00 local-time. Any time zone name from the [time zone database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) is supported.\n- wind_speed_unit (query)\n\nExample:\nGet hourly temperature forecast for Offenburg, Germany\n\nResponse:\nHTTP 200\nOK\nproperties (top-level): current_weather, daily, daily_units, elevation, generationtime_ms, hourly, hourly_units, latitude, longitude, utc_offset_seconds\nDocumented errors:\nHTTP 400 — Bad Request\n\nRuntime: public endpoint — no credential required.',
        method: 'GET',
        path: '/v1/forecast',
        access: 'public',
        hasAuthorize: false,
        hasValidate: false
    }
];

export type InvokeOptions = {
    /** MCP tool arguments only (host context is supplied by stdio-mcp-server / http-mcp-server). */
    pathParams?: Record<string, string | number | boolean>;
    query?: Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
    headers?: Record<string, string>;
    body?: unknown;
};

export type ApiHostContext = {
    baseUrl: string;
    credential?: string;
    upstreamCredential?: string;
    credentials?: unknown;
};

export const requiresAuth = false;

export const mcpServerName = 'open-meteo-tools';
export const mcpServerVersion = '0.4.1';

export const inputZodByTool = {
    openMeteoForecast: z
        .object({
            pathParams: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .describe('No path parameters.')
                .optional(),
            query: z
                .object({
                    hourly: z
                        .array(
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
                        )
                        .optional(),
                    daily: z
                        .array(
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
                        )
                        .optional(),
                    latitude: z.number().describe('WGS84 coordinate'),
                    longitude: z.number().describe('WGS84 coordinate'),
                    current_weather: z.boolean().optional(),
                    temperature_unit: z.union([z.literal('celsius'), z.literal('fahrenheit')]).optional(),
                    wind_speed_unit: z
                        .union([z.literal('kmh'), z.literal('ms'), z.literal('mph'), z.literal('kn')])
                        .optional(),
                    timeformat: z
                        .union([z.literal('iso8601'), z.literal('unixtime')])
                        .describe(
                            'If format `unixtime` is selected, all time values are returned in UNIX epoch time in seconds. Please not that all time is then in GMT+0! For daily values with unix timestamp, please apply `utc_offset_seconds` again to get the correct date.'
                        )
                        .optional(),
                    timezone: z
                        .string()
                        .describe(
                            'If `timezone` is set, all timestamps are returned as local-time and data is returned starting at 0:00 local-time. Any time zone name from the [time zone database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) is supported.'
                        )
                        .optional(),
                    past_days: z
                        .union([z.literal(1), z.literal(2)])
                        .describe(
                            'If `past_days` is set, yesterdays or the day before yesterdays data are also returned.'
                        )
                        .optional()
                })
                .strict()
                .describe('Query parameters from OpenAPI.')
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
    for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null) {
            continue;
        }
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
                    searchParams.append(key, p);
                }
            } else {
                searchParams.set(key, parts.join(','));
            }
            continue;
        }
        searchParams.set(key, String(value));
    }
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

    if (hostContext === undefined) {
        throw new Error('invokeTool requires hostContext from the MCP host (stdio-mcp-server or http-mcp-server).');
    }
    const host = hostContext as ApiHostContext;
    const { baseUrl } = host;
    const optionsResolved = options;
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const pathParams = { ...(optionsResolved.pathParams ?? {}) };
    let resolvedPath = tool.path;
    for (const [key, value] of Object.entries(pathParams)) {
        resolvedPath = resolvedPath.split('{' + key + '}').join(encodeURIComponent(String(value)));
    }

    const url = new URL(normalizedBaseUrl + resolvedPath);
    appendSerializedQueryParams(url.searchParams, tool.toolName, optionsResolved.query);
    const requestHeaders: Record<string, string> = {
        'content-type': 'application/json',
        ...(optionsResolved.headers ?? {})
    };

    const requestInit: Record<string, unknown> = {
        method: tool.method,
        headers: requestHeaders
    };

    if (optionsResolved.body !== undefined && tool.method !== 'GET' && tool.method !== 'HEAD') {
        requestInit.body = JSON.stringify(optionsResolved.body);
    }

    const response = await fetch(url, requestInit as RequestInit);
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
