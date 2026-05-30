/**
 * Generated JS module (types live in the sibling .ts file).
 */
import { resolveCredentialAndOptionalJwt } from '@core2ai/core/mcp-host';


export const insecureTls = false;

export const generatedTools = [
    {
        "toolName": "getGitHubAuthenticatedUser",
        "title": "Get the authenticated user",
        "description": "Intent:\nreturn the GitHub user profile for the authenticated PAT; use to confirm which account the token represents before calling repo-scoped tools\n\nAPI:\nRequires a user PAT with at least read:user (classic) or equivalent fine-grained scope.\n\nMeta:\noperationId: get-authenticated-user\n\nExample:\nNo path or query parameters\n\nResponse:\nHTTP 200\nOK\ntype: object (no inlined properties)\nDocumented errors:\nHTTP 401 — Unauthorized\nHTTP 403 — Forbidden (rate limit or insufficient token scope)\n\nRuntime auth: MCP host injects the API credential via --auth-env; send as header \"Authorization\" (prefix applied to the secret).",
        "method": "GET",
        "path": "/user",
        "example": "No path or query parameters",
        "access": "protected"
    },
    {
        "toolName": "listGitHubUserRepos",
        "title": "List repositories for the authenticated user",
        "description": "Intent:\nlist repositories the authenticated PAT can access; use to find owner/repo and to debug 404 on GET /repos/{owner}/{repo}\n\nAPI:\nLists repositories the authenticated user has **direct** access to (your own repos, collaborations, org repos the token can see).\n\n**Classic PAT:** use scope `repo` if you need private repositories; without it, private repos may be omitted or single-repo `GET /repos/{owner}/{repo}` can return **404** (GitHub hides existence of private repos you cannot read).\n\n**Fine-grained PAT:** grant **Repository permissions** (e.g. Metadata read) on each repository or via organization/team rules; missing scope often surfaces as **404** on `GET /repos/{owner}/{repo}`, not 403.\n\nPrefer this endpoint to discover `owner`/`repo` names before calling `GET /repos/{owner}/{repo}`.\n\nMeta:\noperationId: list-repositories-for-the-authenticated-user\n\nExample:\nFirst page, 10 per page: query per_page=10 page=1\n\nResponse:\nHTTP 200\nOK — array of repository objects\ntype: array of object\nDocumented errors:\nHTTP 401 — Unauthorized\nHTTP 403 — Forbidden (rate limit or insufficient token)\n\nRuntime auth: MCP host injects the API credential via --auth-env; send as header \"Authorization\" (prefix applied to the secret).",
        "method": "GET",
        "path": "/user/repos",
        "example": "First page, 10 per page: query per_page=10 page=1",
        "access": "protected"
    },
    {
        "toolName": "getGitHubRepository",
        "title": "Get a repository",
        "description": "Intent:\nfetch GitHub repository metadata when the PAT can read the repo\n\nAPI:\nReturns metadata for one repository.\n\n**404 on private repos:** GitHub often returns **404 Not Found** (not 403) when the repo is private and the token **cannot** read it, or when `owner`/`repo` is wrong — this avoids leaking whether a private repo exists.\n\nIf you are sure the PAT should have access: verify the token in the MCP host (`--auth-env` / `GITHUB_TOKEN`), PAT type (classic `repo` vs fine-grained repo access), exact `owner`/`repo` spelling, and try `GET /user/repos` to confirm the repo appears in the list for this token.\n\nMeta:\noperationId: get-a-repository\n\nExample:\nGet public repo octocat/Hello-World\n\nResponse:\nHTTP 200\nOK\ntype: object (no inlined properties)\nDocumented errors:\nHTTP 404 — Not Found (e.g. private repo or no access)\n\nRuntime auth: MCP host injects the API credential via --auth-env; send as header \"Authorization\" (prefix applied to the secret).",
        "method": "GET",
        "path": "/repos/{owner}/{repo}",
        "example": "Get public repo octocat/Hello-World",
        "access": "protected"
    }
];

export const requiresAuth = true;

export const authConfig = {
    "location": "header",
    "name": "Authorization",
    "prefix": "Bearer "
};

export const mcpServerName = "github-tools";
export const mcpServerVersion = "0.0.3";

import * as z from 'zod/v4';

export const inputZodByTool = {
    "getGitHubAuthenticatedUser": z.object({ "pathParams": z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).describe("No path parameters.").optional(), "query": z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).describe("Optional query overrides.").optional(), "headers": z.record(z.string(), z.string()).describe("Optional extra headers.").optional(), "body": z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).describe("Request body JSON if applicable.").optional() }).strict().describe("Arguments for invoking the generated HTTP wrapper."),
    "listGitHubUserRepos": z.object({ "pathParams": z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).describe("No path parameters.").optional(), "query": z.object({ "type": z.union([z.literal("all"), z.literal("owner"), z.literal("member")]).describe("`all` (default), `owner` (repos owned by user), or `member` (repos user is member of but does not own).").optional(), "per_page": z.number().describe("Results per page (max 100).").optional(), "page": z.number().describe("Page number of results.").optional() }).strict().describe("Query parameters from OpenAPI.").optional(), "headers": z.record(z.string(), z.string()).describe("Optional extra headers.").optional(), "body": z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).describe("Request body JSON if applicable.").optional() }).strict().describe("Arguments for invoking the generated HTTP wrapper."),
    "getGitHubRepository": z.object({ "pathParams": z.object({ "owner": z.string(), "repo": z.string() }).strict().describe("Path parameters from OpenAPI."), "query": z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).describe("Optional query overrides.").optional(), "headers": z.record(z.string(), z.string()).describe("Optional extra headers.").optional(), "body": z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).describe("Request body JSON if applicable.").optional() }).strict().describe("Arguments for invoking the generated HTTP wrapper.")
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
        const { credential, jwt } = resolveCredentialAndOptionalJwt(authKey);
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

function resolveAuthSecret(authConfig, credential) {
    if (!credential || !String(credential).trim()) {
        throw new Error('Missing host credential (MCP host --auth-env).');
    }
    return (authConfig.prefix ?? '') + String(credential).trim();
}

export async function invokeTool(toolName, options = {}, hostContext) {
    const tool = generatedTools.find((t) => t.toolName === toolName);
    if (!tool) {
        throw new Error('Unknown tool: ' + toolName);
    }

    const host = hostContext ?? mcpHostAdapter.resolveHostContext();
    const { baseUrl, credential } = host;
    if (tool.access !== 'public') {
        if (!credential || !String(credential).trim()) {
            throw new Error(
                'Missing host credential. Pass --auth-env on mcp-serve.mjs and set the variable (re-read on every tool call).'
            );
        }
    }
    const optionsResolved = options;
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const pathParams = { ...(optionsResolved.pathParams ?? {}) };
    let resolvedPath = tool.path;
    for (const [key, value] of Object.entries(pathParams)) {
        resolvedPath = resolvedPath.split('{' + key + '}').join(encodeURIComponent(String(value)));
    }

    const url = new URL(normalizedBaseUrl + resolvedPath);
    appendSerializedQueryParams(url.searchParams, tool.toolName, optionsResolved.query);
    const requestHeaders = {
        'content-type': 'application/json',
        ...(optionsResolved.headers ?? {})
    };
    if (authConfig && tool.access !== 'public') {
        const authValue = resolveAuthSecret(authConfig, credential);
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

    if (optionsResolved.body !== undefined && tool.method !== 'GET' && tool.method !== 'HEAD') {
        requestInit.body = JSON.stringify(optionsResolved.body);
    }

    const response = await fetch(url, requestInit);
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
            if (authConfig && tool.access !== 'public') {
                msg +=
                    ' Check MCP host --auth-env (' +
                    authConfig.location +
                    ' ' +
                    authConfig.name +
                    ').';
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
