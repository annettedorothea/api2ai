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
        "example": "Get hourly temperature forecast for Offenburg, Germany"
    }
];

export const requiresAuth = false;

export const authConfig = undefined;

export const inputSchemaByTool = {
    "openMeteoForecast": {
        "type": "object",
        "properties": {
            "pathParams": {
                "type": "object",
                "additionalProperties": true,
                "description": "No path parameters."
            },
            "query": {
                "type": "object",
                "properties": {
                    "hourly": {
                        "type": "array",
                        "items": {
                            "enum": [
                                "temperature_2m",
                                "relative_humidity_2m",
                                "dew_point_2m",
                                "apparent_temperature",
                                "pressure_msl",
                                "cloud_cover",
                                "cloud_cover_low",
                                "cloud_cover_mid",
                                "cloud_cover_high",
                                "wind_speed_10m",
                                "wind_speed_80m",
                                "wind_speed_120m",
                                "wind_speed_180m",
                                "wind_direction_10m",
                                "wind_direction_80m",
                                "wind_direction_120m",
                                "wind_direction_180m",
                                "wind_gusts_10m",
                                "shortwave_radiation",
                                "direct_radiation",
                                "direct_normal_irradiance",
                                "diffuse_radiation",
                                "vapour_pressure_deficit",
                                "evapotranspiration",
                                "precipitation",
                                "weather_code",
                                "snow_height",
                                "freezing_level_height",
                                "soil_temperature_0cm",
                                "soil_temperature_6cm",
                                "soil_temperature_18cm",
                                "soil_temperature_54cm",
                                "soil_moisture_0_1cm",
                                "soil_moisture_1_3cm",
                                "soil_moisture_3_9cm",
                                "soil_moisture_9_27cm",
                                "soil_moisture_27_81cm"
                            ],
                            "type": "string"
                        }
                    },
                    "daily": {
                        "type": "array",
                        "items": {
                            "enum": [
                                "temperature_2m_max",
                                "temperature_2m_min",
                                "apparent_temperature_max",
                                "apparent_temperature_min",
                                "precipitation_sum",
                                "precipitation_hours",
                                "weather_code",
                                "sunrise",
                                "sunset",
                                "wind_speed_10m_max",
                                "wind_gusts_10m_max",
                                "wind_direction_10m_dominant",
                                "shortwave_radiation_sum",
                                "uv_index_max",
                                "uv_index_clear_sky_max",
                                "et0_fao_evapotranspiration"
                            ],
                            "type": "string"
                        }
                    },
                    "latitude": {
                        "format": "double",
                        "type": "number",
                        "description": "WGS84 coordinate"
                    },
                    "longitude": {
                        "format": "double",
                        "type": "number",
                        "description": "WGS84 coordinate"
                    },
                    "current_weather": {
                        "type": "boolean"
                    },
                    "temperature_unit": {
                        "default": "celsius",
                        "enum": [
                            "celsius",
                            "fahrenheit"
                        ],
                        "type": "string"
                    },
                    "wind_speed_unit": {
                        "default": "kmh",
                        "enum": [
                            "kmh",
                            "ms",
                            "mph",
                            "kn"
                        ],
                        "type": "string"
                    },
                    "timeformat": {
                        "default": "iso8601",
                        "enum": [
                            "iso8601",
                            "unixtime"
                        ],
                        "type": "string",
                        "description": "If format `unixtime` is selected, all time values are returned in UNIX epoch time in seconds. Please not that all time is then in GMT+0! For daily values with unix timestamp, please apply `utc_offset_seconds` again to get the correct date."
                    },
                    "timezone": {
                        "type": "string",
                        "description": "If `timezone` is set, all timestamps are returned as local-time and data is returned starting at 0:00 local-time. Any time zone name from the [time zone database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) is supported."
                    },
                    "past_days": {
                        "enum": [
                            1,
                            2
                        ],
                        "type": "integer",
                        "description": "If `past_days` is set, yesterdays or the day before yesterdays data are also returned."
                    }
                },
                "required": [
                    "latitude",
                    "longitude"
                ],
                "additionalProperties": false,
                "description": "Query parameters from OpenAPI."
            },
            "headers": {
                "type": "object",
                "additionalProperties": {
                    "type": "string"
                },
                "description": "Optional extra headers."
            },
            "body": {
                "type": "object",
                "description": "Request body JSON if applicable.",
                "additionalProperties": true
            }
        },
        "required": [],
        "additionalProperties": false,
        "description": "Arguments for invoking the generated HTTP wrapper."
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


export async function invokeTool(toolName, options = {}) {
    const tool = generatedTools.find((t) => t.toolName === toolName);
    if (!tool) {
        throw new Error('Unknown tool: ' + toolName);
    }

    if (!options.baseUrl || !String(options.baseUrl).trim()) {
        throw new Error('Missing baseUrl (MCP host must pass InvokeOptions.baseUrl from --base-url-env).');
    }
    const effectiveBaseUrl = String(options.baseUrl).trim();
    const normalizedBaseUrl = effectiveBaseUrl.endsWith('/') ? effectiveBaseUrl.slice(0, -1) : effectiveBaseUrl;
    let resolvedPath = tool.path;
    for (const [key, value] of Object.entries(options.pathParams ?? {})) {
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
            if (authConfig) {
                
            } else {
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
