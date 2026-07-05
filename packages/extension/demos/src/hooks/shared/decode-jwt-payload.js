import { createRemoteJWKSet, jwtVerify } from 'jose';
const DEFAULT_HS256_SECRET = 'demo-bookings-secret';
function resolveIssuer() {
    const issuer = process.env.OAUTH_ISSUER?.trim() || process.env.BOOKINGS_OAUTH_IDP_OIDC_URL?.trim();
    return issuer ? issuer.replace(/\/$/, '') : undefined;
}
function resolveHs256Secret() {
    return process.env.BOOKINGS_API_JWT_SECRET?.trim() || DEFAULT_HS256_SECRET;
}
function jwtHeaderAlg(token) {
    try {
        const [headerSeg] = token.split('.');
        if (!headerSeg) {
            return undefined;
        }
        let b64 = headerSeg.replace(/-/g, '+').replace(/_/g, '/');
        while (b64.length % 4 !== 0) {
            b64 += '=';
        }
        const header = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
        return typeof header.alg === 'string' ? header.alg : undefined;
    }
    catch {
        return undefined;
    }
}
const jwksByIssuer = new Map();
function jwksForIssuer(issuer) {
    let jwks = jwksByIssuer.get(issuer);
    if (!jwks) {
        jwks = createRemoteJWKSet(new URL(`${issuer}/jwks`));
        jwksByIssuer.set(issuer, jwks);
    }
    return jwks;
}
function pickJwtClaims(payload) {
    const data = {};
    for (const key of ['customerId', 'role', 'sub']) {
        if (payload[key] !== undefined) {
            data[key] = String(payload[key]);
        }
    }
    return data;
}
/** Verify and decode a bookings demo JWT from the raw MCP credential (no auth prefix). */
export async function decodeJwtPayload(credential) {
    const token = credential.trim();
    if (!token) {
        throw new Error('Missing credential.');
    }
    const alg = jwtHeaderAlg(token);
    if (alg === 'HS256') {
        const secret = new TextEncoder().encode(resolveHs256Secret());
        const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });
        return pickJwtClaims(payload);
    }
    const issuer = resolveIssuer();
    if (issuer) {
        const verifyOptions = { issuer };
        const audience = process.env.OAUTH_AUDIENCE?.trim();
        if (audience) {
            verifyOptions.audience = audience;
        }
        const { payload } = await jwtVerify(token, jwksForIssuer(issuer), verifyOptions);
        return pickJwtClaims(payload);
    }
    if (alg === 'RS256') {
        throw new Error('Set OAUTH_ISSUER or BOOKINGS_OAUTH_IDP_OIDC_URL for bookings OIDC validation.');
    }
    const secret = new TextEncoder().encode(resolveHs256Secret());
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });
    return pickJwtClaims(payload);
}
