import { createRemoteJWKSet, jwtVerify } from 'jose';

export type ModuleCredentials = {
    customerId?: string;
    role?: string;
    sub?: string;
};

export class BookingsCredentials implements ModuleCredentials {
    readonly customerId?: string;
    readonly role?: string;
    readonly sub?: string;

    constructor(init: ModuleCredentials) {
        this.customerId = init.customerId;
        this.role = init.role;
        this.sub = init.sub;
    }

    toString(): string {
        const parts: string[] = [];
        if (this.customerId !== undefined) {
            parts.push(`customerId=${this.customerId}`);
        }
        if (this.role !== undefined) {
            parts.push(`role=${this.role}`);
        }
        if (this.sub !== undefined) {
            parts.push(`sub=${this.sub}`);
        }
        return parts.join(' ') || '[bookings credentials]';
    }
}

export function toBookingsCredentials(data: ModuleCredentials | Record<string, unknown>): BookingsCredentials {
    const init: ModuleCredentials = {};
    for (const key of ['customerId', 'role', 'sub'] as const) {
        if (data[key] !== undefined) {
            init[key] = String(data[key]);
        }
    }
    return new BookingsCredentials(init);
}

export type VerifyCredentialInput = {
    inboundCredential: string;
};

export type VerifyCredentialResult = {
    upstreamCredential: string;
    credentials: BookingsCredentials;
};

const DEFAULT_HS256_SECRET = 'demo-bookings-secret';

function resolveIssuer(): string | undefined {
    const issuer = process.env.OAUTH_ISSUER?.trim() || process.env.BOOKINGS_OAUTH_IDP_OIDC_URL?.trim();
    return issuer ? issuer.replace(/\/$/, '') : undefined;
}

function resolveHs256Secret(): string {
    return process.env.BOOKINGS_API_JWT_SECRET?.trim() || DEFAULT_HS256_SECRET;
}

function jwtHeaderAlg(token: string): string | undefined {
    try {
        const [headerSeg] = token.split('.');
        if (!headerSeg) {
            return undefined;
        }
        let b64 = headerSeg.replace(/-/g, '+').replace(/_/g, '/');
        while (b64.length % 4 !== 0) {
            b64 += '=';
        }
        const header = JSON.parse(Buffer.from(b64, 'base64').toString('utf8')) as { alg?: string };
        return typeof header.alg === 'string' ? header.alg : undefined;
    } catch {
        return undefined;
    }
}

const jwksByIssuer = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function jwksForIssuer(issuer: string): ReturnType<typeof createRemoteJWKSet> {
    let jwks = jwksByIssuer.get(issuer);
    if (!jwks) {
        jwks = createRemoteJWKSet(new URL(`${issuer}/jwks`));
        jwksByIssuer.set(issuer, jwks);
    }
    return jwks;
}

function pickModuleCredentials(payload: Record<string, unknown>): ModuleCredentials {
    const data: ModuleCredentials = {};
    for (const key of ['customerId', 'role', 'sub'] as const) {
        if (payload[key] !== undefined) {
            data[key] = String(payload[key]);
        }
    }
    return data;
}

async function verifyOidcCredential(token: string, issuer: string): Promise<VerifyCredentialResult> {
    const verifyOptions: { issuer: string; audience?: string } = { issuer };
    const audience = process.env.OAUTH_AUDIENCE?.trim();
    if (audience) {
        verifyOptions.audience = audience;
    }
    const { payload } = await jwtVerify(token, jwksForIssuer(issuer), verifyOptions);
    const moduleCredentials = pickModuleCredentials(payload as Record<string, unknown>);
    return {
        upstreamCredential: token,
        credentials: toBookingsCredentials(moduleCredentials)
    };
}

async function verifyDemoHs256Credential(token: string): Promise<VerifyCredentialResult> {
    const secret = new TextEncoder().encode(resolveHs256Secret());
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });
    const moduleCredentials = pickModuleCredentials(payload as Record<string, unknown>);
    return {
        upstreamCredential: token,
        credentials: toBookingsCredentials(moduleCredentials)
    };
}

export async function verifyBookingsCredentials(input: VerifyCredentialInput): Promise<VerifyCredentialResult> {
    const token = input.inboundCredential.trim();
    if (!token) {
        throw new Error('Missing credential.');
    }
    const alg = jwtHeaderAlg(token);
    if (alg === 'HS256') {
        return verifyDemoHs256Credential(token);
    }
    const issuer = resolveIssuer();
    if (issuer) {
        return verifyOidcCredential(token, issuer);
    }
    if (alg === 'RS256') {
        throw new Error('Set OAUTH_ISSUER or BOOKINGS_OAUTH_IDP_OIDC_URL for bookings OIDC validation.');
    }
    return verifyDemoHs256Credential(token);
}

export { verifyBookingsCredentials as verifyCredential, toBookingsCredentials as toModuleCredentials };
