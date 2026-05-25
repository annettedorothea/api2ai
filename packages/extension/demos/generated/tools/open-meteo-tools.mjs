/**
 * Generated from: open-meteo.api2ai
 * Referenced OpenAPI: ./openapi/open-meteo.openapi.yaml
 */

export const insecureTls = false;

export const generatedTools = [
    {
        "toolName": "openMeteoForecast",
        "title": "7 day weather forecast for coordinates",
        "description": "Intent:\nretrieve hourly weather forecast for coordinates\n\nAPI:\nUse this tool to get a 7 day weather forecast (hourly and daily) for specific WGS84 coordinates. Prefer small sets of hourly/daily variables to keep responses compact and focused on what the agent needs.\n\nMeta:\ntags: Weather Forecast APIs\n\nExample:\nGet hourly temperature forecast for Offenburg, Germany\n\nResponse:\nHTTP 200\nOK\nproperties (top-level): current_weather, daily, daily_units, elevation, generationtime_ms, hourly, hourly_units, latitude, longitude, utc_offset_seconds\nDocumented errors:\nHTTP 400 — Bad Request",
        "method": "GET",
        "path": "/v1/forecast",
        "example": "Get hourly temperature forecast for Offenburg, Germany",
        "public": false
    }
];

export const requiresAuth = false;

export const authConfig = undefined;

export const mcpServerName = "open-meteo-tools";
export const mcpServerVersion = "0.0.1";

import * as z from 'zod/v4';

const __core2aiPrimitiveUnion = z.union([z.string(), z.number(), z.boolean()]);

export const inputZodByTool = {
    "openMeteoForecast": z.object({ "pathParams": z.record(z.string(), __core2aiPrimitiveUnion).describe("No path parameters.").optional(), "query": z.object({ "hourly": z.array(z.union([z.literal("temperature_2m"), z.literal("relative_humidity_2m"), z.literal("dew_point_2m"), z.literal("apparent_temperature"), z.literal("pressure_msl"), z.literal("cloud_cover"), z.literal("cloud_cover_low"), z.literal("cloud_cover_mid"), z.literal("cloud_cover_high"), z.literal("wind_speed_10m"), z.literal("wind_speed_80m"), z.literal("wind_speed_120m"), z.literal("wind_speed_180m"), z.literal("wind_direction_10m"), z.literal("wind_direction_80m"), z.literal("wind_direction_120m"), z.literal("wind_direction_180m"), z.literal("wind_gusts_10m"), z.literal("shortwave_radiation"), z.literal("direct_radiation"), z.literal("direct_normal_irradiance"), z.literal("diffuse_radiation"), z.literal("vapour_pressure_deficit"), z.literal("evapotranspiration"), z.literal("precipitation"), z.literal("weather_code"), z.literal("snow_height"), z.literal("freezing_level_height"), z.literal("soil_temperature_0cm"), z.literal("soil_temperature_6cm"), z.literal("soil_temperature_18cm"), z.literal("soil_temperature_54cm"), z.literal("soil_moisture_0_1cm"), z.literal("soil_moisture_1_3cm"), z.literal("soil_moisture_3_9cm"), z.literal("soil_moisture_9_27cm"), z.literal("soil_moisture_27_81cm")])).optional(), "daily": z.array(z.union([z.literal("temperature_2m_max"), z.literal("temperature_2m_min"), z.literal("apparent_temperature_max"), z.literal("apparent_temperature_min"), z.literal("precipitation_sum"), z.literal("precipitation_hours"), z.literal("weather_code"), z.literal("sunrise"), z.literal("sunset"), z.literal("wind_speed_10m_max"), z.literal("wind_gusts_10m_max"), z.literal("wind_direction_10m_dominant"), z.literal("shortwave_radiation_sum"), z.literal("uv_index_max"), z.literal("uv_index_clear_sky_max"), z.literal("et0_fao_evapotranspiration")])).optional(), "latitude": z.number().describe("WGS84 coordinate"), "longitude": z.number().describe("WGS84 coordinate"), "current_weather": z.boolean().optional(), "temperature_unit": z.union([z.literal("celsius"), z.literal("fahrenheit")]).optional(), "wind_speed_unit": z.union([z.literal("kmh"), z.literal("ms"), z.literal("mph"), z.literal("kn")]).optional(), "timeformat": z.union([z.literal("iso8601"), z.literal("unixtime")]).describe("If format `unixtime` is selected, all time values are returned in UNIX epoch time in seconds. Please not that all time is then in GMT+0! For daily values with unix timestamp, please apply `utc_offset_seconds` again to get the correct date.").optional(), "timezone": z.string().describe("If `timezone` is set, all timestamps are returned as local-time and data is returned starting at 0:00 local-time. Any time zone name from the [time zone database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) is supported.").optional(), "past_days": z.union([z.literal(1), z.literal(2)]).describe("If `past_days` is set, yesterdays or the day before yesterdays data are also returned.").optional() }).strict().describe("Query parameters from OpenAPI.").optional(), "headers": z.record(z.string(), z.string()).describe("Optional extra headers.").optional(), "body": z.record(z.string(), __core2aiPrimitiveUnion).describe("Request body JSON if applicable.").optional() }).strict().describe("Arguments for invoking the generated HTTP wrapper.")
};

const META_BASE_URL_ENV_KEY = 'MCP_HOST_BASE_URL_ENV_KEY';
const META_AUTH_ENV_KEY = 'MCP_HOST_AUTH_ENV_KEY';
const META_ENV_DIRS = 'MCP_HOST_ENV_DIRS';

function applyHostEnvKeys(hostConfig, envDirs) {
    process.env[META_BASE_URL_ENV_KEY] = hostConfig.baseUrlEnv;
    if (hostConfig.authEnv) {
        process.env[META_AUTH_ENV_KEY] = hostConfig.authEnv;
    } else {
        delete process.env[META_AUTH_ENV_KEY];
    }
    if (envDirs.length > 0) {
        process.env[META_ENV_DIRS] = JSON.stringify(envDirs);
    } else {
        delete process.env[META_ENV_DIRS];
    }
}

function decodeJwtPayloadUnsafe(token) {
    const parts = String(token).trim().split('.');
    if (parts.length !== 3) {
        throw new Error('credential is not a JWT (expected three dot-separated segments).');
    }
    let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4 !== 0) {
        b64 += '=';
    }
    return JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
}

export const mcpHostAdapter = {
    configureFromArgv(argv, envDirs) {
        let baseUrlEnv;
        let authEnv;
        for (let i = 0; i < argv.length; i++) {
            const arg = argv[i];
            if (arg === '--base-url-env') {
                baseUrlEnv = argv[++i];
                if (!baseUrlEnv) {
                    throw new Error('Missing value after --base-url-env');
                }
                continue;
            }
            if (arg === '--auth-env') {
                authEnv = argv[++i];
                if (!authEnv) {
                    throw new Error('Missing value after --auth-env');
                }
                continue;
            }
            if (arg.startsWith('-')) {
                throw new Error('Unknown option: ' + arg);
            }
            throw new Error('Unexpected positional argument: ' + arg);
        }
        if (!baseUrlEnv) {
            throw new Error('Required: --base-url-env <ENV_VAR_NAME>');
        }
        applyHostEnvKeys({ baseUrlEnv, authEnv }, envDirs);
    },

    validateAtStartup(requiresAuth) {
        const baseUrlEnvName = process.env[META_BASE_URL_ENV_KEY]?.trim();
        if (!baseUrlEnvName) {
            throw new Error('Host base URL env key is not configured.');
        }
        const baseUrl = process.env[baseUrlEnvName]?.trim();
        if (!baseUrl) {
            throw new Error(
                'Environment variable "' + baseUrlEnvName + '" is missing or empty (required by --base-url-env).'
            );
        }
        if (!requiresAuth) {
            return;
        }
        const authEnvName = process.env[META_AUTH_ENV_KEY]?.trim();
        if (!authEnvName) {
            throw new Error('Generated tools require auth; pass --auth-env <ENV_VAR_NAME> on the MCP host.');
        }
        const credential = process.env[authEnvName]?.trim();
        if (!credential) {
            throw new Error(
                'Environment variable "' + authEnvName + '" is missing or empty (required by --auth-env).'
            );
        }
    },

    resolveHostContext() {
        const baseUrlKey = process.env[META_BASE_URL_ENV_KEY]?.trim();
        const baseUrl = baseUrlKey ? process.env[baseUrlKey]?.trim() : undefined;
        if (!baseUrl) {
            throw new Error(
                'Missing host base URL. Pass --base-url-env on mcp-serve.mjs and set the variable (or use smoke-generated).'
            );
        }

        const authKey = process.env[META_AUTH_ENV_KEY]?.trim();
        let credential = authKey ? process.env[authKey]?.trim() : undefined;
        credential = credential || undefined;

        let jwt;
        if (credential) {
            const segments = String(credential).trim().split('.');
            if (segments.length === 3) {
                try {
                    jwt = decodeJwtPayloadUnsafe(credential);
                } catch {
                    jwt = undefined;
                }
            }
        }

        return { baseUrl, credential, jwt };
    },

    envDirsForReload() {
        const raw = process.env[META_ENV_DIRS];
        if (!raw?.trim()) {
            return [];
        }
        try {
            const dirs = JSON.parse(raw);
            if (Array.isArray(dirs) && dirs.every((d) => typeof d === 'string')) {
                return dirs;
            }
        } catch {
            // ignore malformed config
        }
        return [];
    }
};

export const queryParamSerializationByTool = {
    "openMeteoForecast": {
        "hourly": {
            "style": "form",
            "explode": false
        },
        "daily": {
            "style": "form",
            "explode": true
        },
        "latitude": {
            "style": "form",
            "explode": true
        },
        "longitude": {
            "style": "form",
            "explode": true
        },
        "current_weather": {
            "style": "form",
            "explode": true
        },
        "temperature_unit": {
            "style": "form",
            "explode": true
        },
        "wind_speed_unit": {
            "style": "form",
            "explode": true
        },
        "timeformat": {
            "style": "form",
            "explode": true
        },
        "timezone": {
            "style": "form",
            "explode": true
        },
        "past_days": {
            "style": "form",
            "explode": true
        }
    }
};

function appendSerializedQueryParams(searchParams, toolName, query) {
    if (!query) {
        return;
    }
    const hintsByParam = queryParamSerializationByTool[toolName] ?? {};
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
            const parts = [];
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


export async function invokeTool(toolName, options = {}, hostContext) {
    const tool = generatedTools.find((t) => t.toolName === toolName);
    if (!tool) {
        throw new Error('Unknown tool: ' + toolName);
    }

    const host = hostContext ?? mcpHostAdapter.resolveHostContext();
    const { baseUrl, credential, jwt } = host;
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const pathParams = !tool.public && authConfig?.fromJwt
        ? resolvePathParamsWithFromJwt(authConfig, options.pathParams, jwt)
        : { ...(options.pathParams ?? {}) };
    let resolvedPath = tool.path;
    for (const [key, value] of Object.entries(pathParams)) {
        resolvedPath = resolvedPath.split('{' + key + '}').join(encodeURIComponent(String(value)));
    }

    const url = new URL(normalizedBaseUrl + resolvedPath);
    appendSerializedQueryParams(url.searchParams, tool.toolName, options.query);
    const requestHeaders = {
        'content-type': 'application/json',
        ...(options.headers ?? {})
    };

    const requestInit = {
        method: tool.method,
        headers: requestHeaders
    };

    if (options.body !== undefined && tool.method !== 'GET' && tool.method !== 'HEAD') {
        requestInit.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, requestInit);
    if (!response.ok) {
        const retryAfter = response.headers.get('retry-after');
        let bodySnippet = '';
        try {
            const t = await response.text();
            bodySnippet = t.length > 512 ? t.slice(0, 512) + '...' : t;
        } catch {
            bodySnippet = '';
        }
        let msg = 'HTTP ' + response.status + ' while invoking ' + tool.toolName + '.';
        if (response.status === 401) {
            msg += ' Unauthorized.';
            if (authConfig && !tool.public) {
                
            } else if (!tool.public) {
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
        throw new Error(msg);
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
        return response.json();
    }
    return response.text();
}
