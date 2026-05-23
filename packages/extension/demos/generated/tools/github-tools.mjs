/**
 * Generated from: github.api2ai
 * Referenced OpenAPI: ./openapi/github-user-min.openapi.yaml
 */

export const insecureTls = false;

export const generatedTools = [
    {
        "toolName": "getGitHubAuthenticatedUser",
        "title": "Get the authenticated user",
        "description": "Intent:\nreturn the GitHub user profile for the authenticated PAT; use to confirm which account the token represents before calling repo-scoped tools\n\nAPI:\nRequires a user PAT with at least read:user (classic) or equivalent fine-grained scope.\n\nMeta:\noperationId: get-authenticated-user\n\nExample:\nNo path or query parameters\n\nResponse:\nHTTP 200\nOK\ntype: object (no inlined properties)\nDocumented errors:\nHTTP 401 — Unauthorized\nHTTP 403 — Forbidden (rate limit or insufficient token scope)\n\nRuntime auth: MCP host injects the API credential via --auth-env; send as header \"Authorization\" (prefix applied to the secret).",
        "method": "GET",
        "path": "/user",
        "example": "No path or query parameters"
    },
    {
        "toolName": "listGitHubUserRepos",
        "title": "List repositories for the authenticated user",
        "description": "Intent:\nlist repositories the authenticated PAT can access; use to find owner/repo and to debug 404 on GET /repos/{owner}/{repo}\n\nAPI:\nLists repositories the authenticated user has **direct** access to (your own repos, collaborations, org repos the token can see).\n\n**Classic PAT:** use scope `repo` if you need private repositories; without it, private repos may be omitted or single-repo `GET /repos/{owner}/{repo}` can return **404** (GitHub hides existence of private repos you cannot read).\n\n**Fine-grained PAT:** grant **Repository permissions** (e.g. Metadata read) on each repository or via organization/team rules; missing scope often surfaces as **404** on `GET /repos/{owner}/{repo}`, not 403.\n\nPrefer this endpoint to discover `owner`/`repo` names before calling `GET /repos/{owner}/{repo}`.\n\nMeta:\noperationId: list-repositories-for-the-authenticated-user\n\nExample:\nFirst page, 10 per page: query per_page=10 page=1\n\nResponse:\nHTTP 200\nOK — array of repository objects\ntype: array of object\nDocumented errors:\nHTTP 401 — Unauthorized\nHTTP 403 — Forbidden (rate limit or insufficient token)\n\nRuntime auth: MCP host injects the API credential via --auth-env; send as header \"Authorization\" (prefix applied to the secret).",
        "method": "GET",
        "path": "/user/repos",
        "example": "First page, 10 per page: query per_page=10 page=1"
    },
    {
        "toolName": "getGitHubRepository",
        "title": "Get a repository",
        "description": "Intent:\nfetch GitHub repository metadata when the PAT can read the repo\n\nAPI:\nReturns metadata for one repository.\n\n**404 on private repos:** GitHub often returns **404 Not Found** (not 403) when the repo is private and the token **cannot** read it, or when `owner`/`repo` is wrong — this avoids leaking whether a private repo exists.\n\nIf you are sure the PAT should have access: verify the token in the MCP host (`--auth-env` / `GITHUB_TOKEN`), PAT type (classic `repo` vs fine-grained repo access), exact `owner`/`repo` spelling, and try `GET /user/repos` to confirm the repo appears in the list for this token.\n\nMeta:\noperationId: get-a-repository\n\nExample:\nGet public repo octocat/Hello-World\n\nResponse:\nHTTP 200\nOK\ntype: object (no inlined properties)\nDocumented errors:\nHTTP 404 — Not Found (e.g. private repo or no access)\n\nRuntime auth: MCP host injects the API credential via --auth-env; send as header \"Authorization\" (prefix applied to the secret).",
        "method": "GET",
        "path": "/repos/{owner}/{repo}",
        "example": "Get public repo octocat/Hello-World"
    }
];

export const requiresAuth = true;

export const authConfig = {
    "location": "header",
    "name": "Authorization",
    "prefix": "Bearer "
};

export const inputSchemaByTool = {
    "getGitHubAuthenticatedUser": {
        "type": "object",
        "properties": {
            "pathParams": {
                "type": "object",
                "additionalProperties": true,
                "description": "No path parameters."
            },
            "query": {
                "type": "object",
                "additionalProperties": true,
                "description": "Optional query overrides."
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
    },
    "listGitHubUserRepos": {
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
                    "type": {
                        "default": "all",
                        "enum": [
                            "all",
                            "owner",
                            "member"
                        ],
                        "type": "string",
                        "description": "`all` (default), `owner` (repos owned by user), or `member` (repos user is member of but does not own)."
                    },
                    "per_page": {
                        "default": 30,
                        "minimum": 1,
                        "maximum": 100,
                        "type": "integer",
                        "description": "Results per page (max 100)."
                    },
                    "page": {
                        "default": 1,
                        "minimum": 1,
                        "type": "integer",
                        "description": "Page number of results."
                    }
                },
                "required": [],
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
    },
    "getGitHubRepository": {
        "type": "object",
        "properties": {
            "pathParams": {
                "type": "object",
                "properties": {
                    "owner": {
                        "type": "string"
                    },
                    "repo": {
                        "type": "string"
                    }
                },
                "required": [
                    "owner",
                    "repo"
                ],
                "additionalProperties": false,
                "description": "Path parameters from OpenAPI."
            },
            "query": {
                "type": "object",
                "additionalProperties": true,
                "description": "Optional query overrides."
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
        "required": [
            "pathParams"
        ],
        "additionalProperties": false,
        "description": "Arguments for invoking the generated HTTP wrapper."
    }
};

export const queryParamSerializationByTool = {
    "getGitHubAuthenticatedUser": {},
    "listGitHubUserRepos": {
        "type": {
            "style": "form",
            "explode": true
        },
        "per_page": {
            "style": "form",
            "explode": true
        },
        "page": {
            "style": "form",
            "explode": true
        }
    },
    "getGitHubRepository": {}
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

function resolveAuthSecret(authConfig, options) {
    const secret = options?.credential;
    if (!secret || !String(secret).trim()) {
        throw new Error('Missing API credential (MCP host must pass InvokeOptions.credential from --auth-env).');
    }
    return (authConfig.prefix ?? '') + String(secret).trim();
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
    if (authConfig) {
        const authValue = resolveAuthSecret(authConfig, options);
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
                msg +=
                    ' Check MCP host --auth-env and the configured environment variable (' +
                    authConfig.location +
                    ' ' +
                    authConfig.name +
                    ').';
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
