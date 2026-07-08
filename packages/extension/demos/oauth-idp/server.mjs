#!/usr/bin/env node
/**
 * Mini OAuth 2.1 authorization server for MCP demos (bookings, cakes).
 * Sync logic with db2ai orders-demo/oauth-idp/server.mjs — ports/secrets differ.
 */
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';
import { getJwksDocument, mintCustomerToken, verifyJwt } from './jwt.mjs';
import { signJwt } from '../bookings/jwt.mjs';
import {
    renderAuthorizeConsentPage,
    renderAuthorizeHelpPage,
    sendHtml
} from './idp-pages.mjs';
import { loggingAdapter } from '../src/utils/logging-adapter.js';

const PORT = Number(process.env.BOOKINGS_OAUTH_IDP_PORT) || 3860;
const CLIENT_ID = 'mcp-demo-local';
const DEFAULT_CURSOR_REDIRECT = 'cursor://anysphere.cursor-mcp/oauth/callback';

function parseCommaSeparatedEnv(name) {
    const raw = process.env[name]?.trim();
    if (!raw) {
        return [];
    }
    return raw
        .split(',')
        .map((part) => part.trim())
        .filter((part) => part.length > 0);
}

function loadAllowedRedirectRules() {
    const fromEnv = parseCommaSeparatedEnv('OAUTH_IDP_REDIRECT_URIS');
    if (fromEnv.length > 0) {
        return fromEnv;
    }
    return [DEFAULT_CURSOR_REDIRECT];
}

const REDIRECT_RULES = loadAllowedRedirectRules();

function isAllowedRedirectUri(redirectUri) {
    for (const rule of REDIRECT_RULES) {
        if (rule.endsWith('*')) {
            if (redirectUri.startsWith(rule.slice(0, -1))) {
                return true;
            }
            continue;
        }
        if (redirectUri === rule) {
            return true;
        }
    }
    return false;
}

/** Exact URIs only — wildcards are not valid in OAuth client metadata. */
function registeredRedirectUris() {
    return REDIRECT_RULES.filter((rule) => !rule.endsWith('*'));
}

/**
 * Browser CORS for demo IdP. Set MCP_HTTP_CORS_ORIGIN for a fixed origin; otherwise reflect Origin when present.
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 * @param {NodeJS.ProcessEnv} [env]
 */
function applyMcpHttpCors(req, res, env = process.env) {
    const configured = env.MCP_HTTP_CORS_ORIGIN?.trim();
    if (configured) {
        res.setHeader('Access-Control-Allow-Origin', configured);
    } else {
        const origin = req.headers.origin;
        if (typeof origin === 'string' && origin.length > 0) {
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Vary', 'Origin');
        }
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'content-type, authorization');
}
const DEMO_USERS = [
    { customerId: 'alice', role: 'user' },
    { customerId: 'bob', role: 'user' },
    { customerId: 'admin', role: 'admin' }
];

/** @type {Map<string, { customerId: string; role: string; redirectUri: string; codeChallenge: string; expiresAt: number; scope: string }>} */
const pendingCodes = new Map();

function sendJson(res, status, body) {
    res.writeHead(status, { 'content-type': 'application/json' });
    res.end(JSON.stringify(body));
}

function readFormBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        req.on('data', (c) => chunks.push(c));
        req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
        req.on('error', reject);
    });
}

function parseFormUrlEncoded(text) {
    const out = new Map();
    for (const part of text.split('&')) {
        if (!part) {
            continue;
        }
        const [k, v = ''] = part.split('=');
        out.set(decodeURIComponent(k.replace(/\+/g, ' ')), decodeURIComponent(v.replace(/\+/g, ' ')));
    }
    return out;
}

function sha256Base64Url(value) {
    return createHash('sha256').update(value).digest('base64url');
}

function verifyPkce(codeVerifier, codeChallenge) {
    if (!codeVerifier || !codeChallenge) {
        return false;
    }
    if (codeChallenge.includes('.')) {
        return false;
    }
    const expected = sha256Base64Url(codeVerifier);
    try {
        const a = Buffer.from(expected);
        const b = Buffer.from(codeChallenge);
        return a.length === b.length && timingSafeEqual(a, b);
    } catch {
        return expected === codeChallenge;
    }
}

function issuerUrl(req) {
    const configured = process.env.OAUTH_IDP_ISSUER_URL?.trim();
    if (configured) {
        return configured.replace(/\/$/, '');
    }
    const host = req.headers?.host;
    if (typeof host === 'string' && host.length > 0) {
        return `http://${host}`;
    }
    return `http://127.0.0.1:${PORT}`;
}

function openIdConfigurationDocument(base) {
    return {
        issuer: base,
        authorization_endpoint: `${base}/authorize`,
        token_endpoint: `${base}/token`,
        jwks_uri: `${base}/jwks`,
        registration_endpoint: `${base}/register`,
        response_types_supported: ['code'],
        grant_types_supported: ['authorization_code', 'refresh_token'],
        code_challenge_methods_supported: ['S256'],
        token_endpoint_auth_methods_supported: ['none']
    };
}

function handleMetadata(req, res) {
    const base = issuerUrl(req);
    sendJson(res, 200, openIdConfigurationDocument(base));
}

function sendAuthorizeHelpPage(res) {
    sendHtml(
        res,
        renderAuthorizeHelpPage(
            'Use <strong>Cursor MCP OAuth</strong> on <code>bookings</code> or <code>cakes</code> (<code>npm run start</code>).'
        )
    );
}

function handleAuthorize(req, res, url) {
    const clientId = url.searchParams.get('client_id') ?? '';
    const redirectUri = url.searchParams.get('redirect_uri') ?? '';
    const state = url.searchParams.get('state') ?? '';
    const codeChallenge = url.searchParams.get('code_challenge') ?? '';
    const responseType = url.searchParams.get('response_type') ?? '';

    if (responseType !== 'code') {
        if (!responseType && !clientId && !redirectUri && !codeChallenge) {
            loggingAdapter.debug('authorize help page');
            sendAuthorizeHelpPage(res);
            return;
        }
        loggingAdapter.warn('authorize rejected', { error: 'unsupported_response_type', detail: responseType || '(missing)' });
        sendJson(res, 400, { error: 'unsupported_response_type', detail: responseType || '(missing)' });
        return;
    }
    if (clientId !== CLIENT_ID) {
        loggingAdapter.warn('authorize rejected', { error: 'invalid_client', clientId });
        sendJson(res, 400, { error: 'invalid_client' });
        return;
    }
    if (!isAllowedRedirectUri(redirectUri)) {
        loggingAdapter.warn('authorize rejected', { error: 'invalid_redirect_uri', redirectUri });
        sendJson(res, 400, { error: 'invalid_redirect_uri', detail: redirectUri });
        return;
    }
    if (!codeChallenge) {
        loggingAdapter.warn('authorize rejected', { error: 'invalid_request', detail: 'code_challenge required' });
        sendJson(res, 400, { error: 'invalid_request', detail: 'code_challenge required' });
        return;
    }

    const pick = url.searchParams.get('customerId');
    if (!pick) {
        loggingAdapter.debug('authorize consent page', { clientId, state: state || undefined });
        const users = DEMO_USERS.map((u) => ({
            customerId: u.customerId,
            role: u.role,
            href: `${url.pathname}?${new URLSearchParams({
                ...Object.fromEntries(url.searchParams),
                customerId: u.customerId
            }).toString()}`
        }));
        sendHtml(res, renderAuthorizeConsentPage(users));
        return;
    }

    const user = DEMO_USERS.find((u) => u.customerId === pick);
    if (!user) {
        loggingAdapter.warn('authorize rejected', { error: 'unknown_user', customerId: pick });
        sendJson(res, 404, { error: 'unknown_user' });
        return;
    }

    const code = randomBytes(24).toString('hex');
    const scope = url.searchParams.get('scope') ?? '';
    pendingCodes.set(code, {
        customerId: user.customerId,
        role: user.role,
        redirectUri,
        codeChallenge,
        expiresAt: Date.now() + 5 * 60_000,
        scope
    });

    const redirect = new URL(redirectUri);
    redirect.searchParams.set('code', code);
    if (state) {
        redirect.searchParams.set('state', state);
    }
    loggingAdapter.info('authorize code issued', { customerId: user.customerId, role: user.role });
    res.writeHead(302, { Location: redirect.toString() });
    res.end();
}

async function handleToken(req, res) {
    const raw = await readFormBody(req);
    const form = parseFormUrlEncoded(raw);
    const grantType = form.get('grant_type');
    if (grantType !== 'authorization_code') {
        loggingAdapter.warn('token rejected', { error: 'unsupported_grant_type', grantType });
        sendJson(res, 400, { error: 'unsupported_grant_type' });
        return;
    }
    const code = form.get('code') ?? '';
    const redirectUri = form.get('redirect_uri') ?? '';
    const clientId = form.get('client_id') ?? '';
    const codeVerifier = form.get('code_verifier') ?? '';

    if (clientId !== CLIENT_ID) {
        loggingAdapter.warn('token rejected', { error: 'invalid_client', clientId });
        sendJson(res, 400, { error: 'invalid_client' });
        return;
    }
    const pending = pendingCodes.get(code);
    if (!pending || pending.expiresAt < Date.now()) {
        pendingCodes.delete(code);
        loggingAdapter.warn('token rejected', { error: 'invalid_grant', detail: 'code missing or expired' });
        sendJson(res, 400, { error: 'invalid_grant' });
        return;
    }
    if (redirectUri !== pending.redirectUri) {
        loggingAdapter.warn('token rejected', { error: 'invalid_grant', detail: 'redirect_uri mismatch' });
        sendJson(res, 400, { error: 'invalid_grant', detail: 'redirect_uri mismatch' });
        return;
    }
    if (!verifyPkce(codeVerifier, pending.codeChallenge)) {
        loggingAdapter.warn('token rejected', { error: 'invalid_grant', detail: 'pkce verification failed' });
        sendJson(res, 400, { error: 'invalid_grant', detail: 'pkce verification failed' });
        return;
    }
    pendingCodes.delete(code);

    const scope = pending.scope ?? '';
    const isBanking = scope.split(/\s+/).filter((part) => part.length > 0).includes('banking');
    const issuer = issuerUrl(req);
    const accessToken = isBanking
        ? mintCustomerToken(pending.customerId, pending.role, 3600, issuer, {
              token_use: 'idp',
              sub: pending.customerId
          })
        : mintCustomerToken(pending.customerId, pending.role, 3600, issuer);
    loggingAdapter.info('access token issued', {
        customerId: pending.customerId,
        role: pending.role,
        expiresIn: 3600,
        scope: scope || undefined,
        tokenUse: isBanking ? 'idp' : 'api'
    });
    sendJson(res, 200, {
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 3600
    });
}

function portalJwtSecret() {
    return (
        process.env.BANKING_API_JWT_SECRET?.trim() ||
        process.env.BOOKINGS_API_JWT_SECRET?.trim() ||
        'demo-banking-portal-secret'
    );
}

function permissionsForRole(role) {
    if (role === 'admin') {
        return ['banking:read', 'banking:admin'];
    }
    return ['banking:read'];
}

function mintPortalToken(customerId, role) {
    const now = Math.floor(Date.now() / 1000);
    return signJwt(
        {
            customerId: String(customerId),
            role: String(role),
            permissions: permissionsForRole(role),
            token_use: 'portal',
            iat: now,
            exp: now + 3600
        },
        portalJwtSecret()
    );
}

function parseBearer(req) {
    const h = req.headers.authorization;
    if (!h || !h.startsWith('Bearer ')) {
        return undefined;
    }
    return h.slice('Bearer '.length).trim();
}

async function handlePortalTokenExchange(req, res) {
    const idpToken = parseBearer(req);
    if (!idpToken) {
        loggingAdapter.warn('portal token-exchange rejected', { error: 'missing_bearer_token' });
        sendJson(res, 401, { error: 'missing_bearer_token' });
        return;
    }
    const verified = verifyJwt(idpToken);
    if (!verified.ok) {
        loggingAdapter.warn('portal token-exchange rejected', { error: 'invalid_idp_token', reason: verified.error });
        sendJson(res, 401, { error: 'invalid_idp_token', reason: verified.error });
        return;
    }
    const tokenUse = String(verified.payload?.token_use ?? '').trim();
    if (tokenUse !== 'idp') {
        loggingAdapter.warn('portal token-exchange rejected', { error: 'not_idp_token' });
        sendJson(res, 400, { error: 'not_idp_token' });
        return;
    }
    const customerId = String(verified.payload?.customerId ?? '').trim();
    const role = String(verified.payload?.role ?? 'user').trim();
    if (!customerId) {
        sendJson(res, 400, { error: 'missing_customer_id' });
        return;
    }
    const portalToken = mintPortalToken(customerId, role);
    loggingAdapter.info('portal access token issued', { customerId, role });
    sendJson(res, 200, {
        access_token: portalToken,
        token_type: 'Bearer',
        expires_in: 3600
    });
}

const server = createServer(async (req, res) => {
    applyMcpHttpCors(req, res);
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const url = new URL(req.url ?? '/', issuerUrl(req));
    loggingAdapter.debug(`${req.method ?? 'GET'} ${url.pathname}`);

    if (
        (url.pathname === '/.well-known/oauth-authorization-server' ||
            url.pathname === '/.well-known/openid-configuration') &&
        req.method === 'GET'
    ) {
        handleMetadata(req, res);
        return;
    }
    if (url.pathname === '/jwks' && req.method === 'GET') {
        sendJson(res, 200, getJwksDocument());
        return;
    }
    if (url.pathname === '/authorize' && req.method === 'GET') {
        handleAuthorize(req, res, url);
        return;
    }
    if (url.pathname === '/token' && req.method === 'POST') {
        await handleToken(req, res);
        return;
    }
    if (url.pathname === '/portal/token-exchange' && req.method === 'POST') {
        await handlePortalTokenExchange(req, res);
        return;
    }
    if (url.pathname === '/register' && req.method === 'POST') {
        sendJson(res, 201, {
            client_id: CLIENT_ID,
            client_id_issued_at: Math.floor(Date.now() / 1000),
            redirect_uris: registeredRedirectUris(),
            grant_types: ['authorization_code', 'refresh_token'],
            response_types: ['code'],
            token_endpoint_auth_method: 'none'
        });
        return;
    }

    sendJson(res, 404, { error: 'not_found' });
});

server.listen(PORT, '127.0.0.1', () => {
    loggingAdapter.info('listening', {
        url: `http://127.0.0.1:${PORT}`,
        clientId: CLIENT_ID,
        redirectRules: REDIRECT_RULES
    });
});
