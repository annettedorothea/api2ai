import { createDecipheriv, privateDecrypt } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Generated from: github.api2ai
 * Referenced OpenAPI: ./openapi/github-user-min.openapi.yaml
 */

export const baseUrl = "https://api.github.com";

export const generatedTools = [
    {
        "toolName": "getGitHubAuthenticatedUser",
        "title": "Get the authenticated user",
        "description": "Intent:\nreturn the GitHub user profile for the authenticated PAT; use to confirm which account the token represents before calling repo-scoped tools\n\nAPI:\nRequires a user PAT with at least read:user (classic) or equivalent fine-grained scope.\n\nMeta:\noperationId: get-authenticated-user\n\nExample:\nNo path or query parameters — only sealedCredential\n\nResponse:\nHTTP 200\nOK\ntype: object (no inlined properties)\nDocumented errors:\nHTTP 401 — Unauthorized\nHTTP 403 — Forbidden (rate limit or insufficient token scope)\n\nRuntime auth: bearerSealed — decrypt tool argument sealedCredential (base64 A2S1 blob) with the private key: read inline PEM from environment variable API2AI_SEAL_PRIVATE_KEY, or if the value does not start with -----BEGIN, treat it as a filesystem path to a PEM file (relative paths are resolved from process.cwd() and parent directories); send as header \"Authorization\" (prefix applied to the secret). Seal secrets with examples/scripts/seal-bearer-helper.mjs.",
        "method": "GET",
        "path": "/user",
        "example": "No path or query parameters — only sealedCredential"
    },
    {
        "toolName": "listGitHubUserRepos",
        "title": "List repositories for the authenticated user",
        "description": "Intent:\nlist repositories the authenticated PAT can access; use to find owner/repo and to debug 404 on GET /repos/{owner}/{repo}\n\nAPI:\nLists repositories the authenticated user has **direct** access to (your own repos, collaborations, org repos the token can see).\n\n**Classic PAT:** use scope `repo` if you need private repositories; without it, private repos may be omitted or single-repo `GET /repos/{owner}/{repo}` can return **404** (GitHub hides existence of private repos you cannot read).\n\n**Fine-grained PAT:** grant **Repository permissions** (e.g. Metadata read) on each repository or via organization/team rules; missing scope often surfaces as **404** on `GET /repos/{owner}/{repo}`, not 403.\n\nPrefer this endpoint to discover `owner`/`repo` names before calling `GET /repos/{owner}/{repo}`.\n\nMeta:\noperationId: list-repositories-for-the-authenticated-user\n\nExample:\nFirst page, 10 per page: query per_page=10 page=1\n\nResponse:\nHTTP 200\nOK — array of repository objects\ntype: array of object\nDocumented errors:\nHTTP 401 — Unauthorized\nHTTP 403 — Forbidden (rate limit or insufficient token)\n\nRuntime auth: bearerSealed — decrypt tool argument sealedCredential (base64 A2S1 blob) with the private key: read inline PEM from environment variable API2AI_SEAL_PRIVATE_KEY, or if the value does not start with -----BEGIN, treat it as a filesystem path to a PEM file (relative paths are resolved from process.cwd() and parent directories); send as header \"Authorization\" (prefix applied to the secret). Seal secrets with examples/scripts/seal-bearer-helper.mjs.",
        "method": "GET",
        "path": "/user/repos",
        "example": "First page, 10 per page: query per_page=10 page=1"
    },
    {
        "toolName": "getGitHubRepository",
        "title": "Get a repository",
        "description": "Intent:\nfetch GitHub repository metadata when the PAT can read the repo\n\nAPI:\nReturns metadata for one repository.\n\n**404 on private repos:** GitHub often returns **404 Not Found** (not 403) when the repo is private and the token **cannot** read it, or when `owner`/`repo` is wrong — this avoids leaking whether a private repo exists.\n\nIf you are sure the PAT should have access: verify **sealed credential matches this MCP’s public key**, PAT type (classic `repo` vs fine-grained repo access), exact `owner`/`repo` spelling, and try `GET /user/repos` to confirm the repo appears in the list for this token.\n\nMeta:\noperationId: get-a-repository\n\nExample:\nGet public repo octocat/Hello-World\n\nResponse:\nHTTP 200\nOK\ntype: object (no inlined properties)\nDocumented errors:\nHTTP 404 — Not Found (e.g. private repo or no access)\n\nRuntime auth: bearerSealed — decrypt tool argument sealedCredential (base64 A2S1 blob) with the private key: read inline PEM from environment variable API2AI_SEAL_PRIVATE_KEY, or if the value does not start with -----BEGIN, treat it as a filesystem path to a PEM file (relative paths are resolved from process.cwd() and parent directories); send as header \"Authorization\" (prefix applied to the secret). Seal secrets with examples/scripts/seal-bearer-helper.mjs.",
        "method": "GET",
        "path": "/repos/{owner}/{repo}",
        "example": "Get public repo octocat/Hello-World"
    }
];

const authConfig = {
    "kind": "bearerSealed",
    "location": "header",
    "name": "Authorization",
    "privateKeyEnv": "API2AI_SEAL_PRIVATE_KEY",
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
            },
            "sealedCredential": {
                "type": "string",
                "description": "Base64 A2S1 sealed credential (RSA-OAEP SHA-256 + AES-256-GCM). Generate with: node examples/scripts/seal-bearer-helper.mjs seal --public-key <public.pem> --pat <token> (or --stdin)"
            }
        },
        "required": [
            "sealedCredential"
        ],
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
            },
            "sealedCredential": {
                "type": "string",
                "description": "Base64 A2S1 sealed credential (RSA-OAEP SHA-256 + AES-256-GCM). Generate with: node examples/scripts/seal-bearer-helper.mjs seal --public-key <public.pem> --pat <token> (or --stdin)"
            }
        },
        "required": [
            "sealedCredential"
        ],
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
            },
            "sealedCredential": {
                "type": "string",
                "description": "Base64 A2S1 sealed credential (RSA-OAEP SHA-256 + AES-256-GCM). Generate with: node examples/scripts/seal-bearer-helper.mjs seal --public-key <public.pem> --pat <token> (or --stdin)"
            }
        },
        "required": [
            "pathParams",
            "sealedCredential"
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

function unsealA2S1(b64, privateKeyPem) {
    const blob = Buffer.from(String(b64).trim(), 'base64');
    const MAGIC = Buffer.from('A2S1', 'ascii');
    if (blob.length < MAGIC.length + 2 + 12 + 16) {
        throw new Error('sealedCredential blob too short');
    }
    if (!blob.subarray(0, MAGIC.length).equals(MAGIC)) {
        throw new Error('sealedCredential: bad magic (expected A2S1 wire format)');
    }
    let o = MAGIC.length;
    const rsaLen = blob.readUInt16BE(o);
    o += 2;
    const rsaCipher = blob.subarray(o, o + rsaLen);
    o += rsaLen;
    const iv = blob.subarray(o, o + 12);
    o += 12;
    const aesPayload = blob.subarray(o);
    const tag = aesPayload.subarray(aesPayload.length - 16);
    const enc = aesPayload.subarray(0, aesPayload.length - 16);
    const aesKey = privateDecrypt({ key: privateKeyPem, padding: 4, oaepHash: 'sha256' }, rsaCipher);
    const decipher = createDecipheriv('aes-256-gcm', aesKey, iv, { authTagLength: 16 });
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
}

function loadPrivateKeyPem(privateKeyEnv) {
    const raw = process.env[privateKeyEnv];
    if (!raw || !String(raw).trim()) {
        throw new Error('Missing private key PEM in environment variable ' + privateKeyEnv + ' for bearerSealed auth.');
    }
    const trimmed = String(raw).trim();
    if (trimmed.startsWith('-----BEGIN')) {
        return trimmed;
    }
    const rel = trimmed.replace(/^\.\/+/, '');
    const candidates = [];
    const seen = new Set();
    function add(p) {
        const resolved = path.resolve(p);
        if (!seen.has(resolved)) {
            seen.add(resolved);
            candidates.push(resolved);
        }
    }
    add(trimmed);
    let dir = process.cwd();
    for (let i = 0; i < 12; i++) {
        add(path.join(dir, rel));
        const up = path.dirname(dir);
        if (up === dir) {
            break;
        }
        dir = up;
    }
    let lastErr;
    for (const p of candidates) {
        try {
            return readFileSync(p, 'utf8').trim();
        } catch (e) {
            lastErr = e;
        }
    }
    const msg = lastErr instanceof Error ? lastErr.message : String(lastErr);
    throw new Error(
        'Failed to read private key from path in environment variable ' +
            privateKeyEnv +
            ' (expected inline PEM starting with -----BEGIN, an absolute path, or a path relative to cwd / parent directories up to the workspace root): ' +
            msg
    );
}

function resolveAuthSecret(authConfig, options) {
    const b64 = options?.sealedCredential;
    if (!b64 || typeof b64 !== 'string' || !String(b64).trim()) {
        throw new Error('InvokeOptions.sealedCredential (base64) is required for bearerSealed auth.');
    }
    const token = unsealA2S1(b64, loadPrivateKeyPem(authConfig.privateKeyEnv));
    return (authConfig.prefix ?? '') + token;
}

export async function invokeTool(toolName, options = {}) {
    const tool = generatedTools.find((t) => t.toolName === toolName);
    if (!tool) {
        throw new Error('Unknown tool: ' + toolName);
    }

    const effectiveBaseUrl = options.baseUrl ?? baseUrl;
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
                    ' Check environment variable ' +
                    authConfig.privateKeyEnv +
                    ' (inline PEM or path to a .pem file) and pass sealedCredential (base64) on invoke.';
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
