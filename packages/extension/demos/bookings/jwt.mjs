// Sync with orders-demo/oauth-idp/jwt.mjs (db2ai) — ports/secrets differ per product.
import { createHmac, createPublicKey, createVerify } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_SECRET = 'demo-bookings-secret';

let rs256PublicKey;

export function jwtSecret() {
    return process.env.BOOKINGS_API_JWT_SECRET?.trim() || DEFAULT_SECRET;
}

function getRs256PublicKey() {
    if (!rs256PublicKey) {
        const pem = readFileSync(join(__dirname, '..', 'oauth-idp', 'demo-rsa-private.pem'), 'utf8');
        rs256PublicKey = createPublicKey(pem);
    }
    return rs256PublicKey;
}

function base64urlEncode(buf) {
    return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/u, '');
}

function base64urlDecodeJson(segment) {
    let b64 = segment.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4 !== 0) {
        b64 += '=';
    }
    return JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
}

function decodeSignature(sigSeg) {
    let b64 = sigSeg.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4 !== 0) {
        b64 += '=';
    }
    return Buffer.from(b64, 'base64');
}

function validatePayload(payloadSeg) {
    let payload;
    try {
        payload = base64urlDecodeJson(payloadSeg);
    } catch {
        return { ok: false, error: 'bad_payload' };
    }
    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.exp === 'number' && payload.exp < now) {
        return { ok: false, error: 'expired' };
    }
    return { ok: true, payload };
}

export function signJwt(payload, secret = jwtSecret()) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const headerSeg = base64urlEncode(Buffer.from(JSON.stringify(header)));
    const payloadSeg = base64urlEncode(Buffer.from(JSON.stringify(payload)));
    const signingInput = `${headerSeg}.${payloadSeg}`;
    const sig = createHmac('sha256', secret).update(signingInput).digest();
    return `${signingInput}.${base64urlEncode(sig)}`;
}

function verifyJwtHs256(headerSeg, payloadSeg, sigSeg, secret) {
    const signingInput = `${headerSeg}.${payloadSeg}`;
    const expected = createHmac('sha256', secret).update(signingInput).digest();
    let actual;
    try {
        actual = decodeSignature(sigSeg);
    } catch {
        return { ok: false, error: 'bad_signature' };
    }
    if (actual.length !== expected.length || !actual.equals(expected)) {
        return { ok: false, error: 'bad_signature' };
    }
    return validatePayload(payloadSeg);
}

function verifyJwtRs256(headerSeg, payloadSeg, sigSeg) {
    const signingInput = `${headerSeg}.${payloadSeg}`;
    const verifier = createVerify('RSA-SHA256');
    verifier.update(signingInput);
    verifier.end();
    let sig;
    try {
        sig = decodeSignature(sigSeg);
    } catch {
        return { ok: false, error: 'bad_signature' };
    }
    if (!verifier.verify(getRs256PublicKey(), sig)) {
        return { ok: false, error: 'bad_signature' };
    }
    return validatePayload(payloadSeg);
}

export function verifyJwt(token, secret = jwtSecret()) {
    const parts = String(token).trim().split('.');
    if (parts.length !== 3) {
        return { ok: false, error: 'invalid_format' };
    }
    const [headerSeg, payloadSeg, sigSeg] = parts;
    let header;
    try {
        header = base64urlDecodeJson(headerSeg);
    } catch {
        return { ok: false, error: 'invalid_format' };
    }
    if (header.alg === 'RS256') {
        return verifyJwtRs256(headerSeg, payloadSeg, sigSeg);
    }
    return verifyJwtHs256(headerSeg, payloadSeg, sigSeg, secret);
}

export function mintCustomerToken(customerId, role = 'user') {
    return signJwt({ customerId, role });
}
