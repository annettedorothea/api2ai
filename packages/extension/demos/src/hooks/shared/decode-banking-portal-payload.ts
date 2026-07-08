import { jwtVerify } from 'jose';

export type BankingPortalClaims = {
    customerId?: string;
    role?: string;
    permissions?: string[];
    token_use?: string;
};

const DEFAULT_HS256_SECRET = 'demo-banking-portal-secret';

function resolveHs256Secret(): string {
    return process.env.BANKING_API_JWT_SECRET?.trim() || DEFAULT_HS256_SECRET;
}

function pickClaims(payload: Record<string, unknown>): BankingPortalClaims {
    const claims: BankingPortalClaims = {};
    if (payload.customerId !== undefined) {
        claims.customerId = String(payload.customerId);
    }
    if (payload.role !== undefined) {
        claims.role = String(payload.role);
    }
    if (payload.token_use !== undefined) {
        claims.token_use = String(payload.token_use);
    }
    if (Array.isArray(payload.permissions)) {
        claims.permissions = payload.permissions.map((entry) => String(entry));
    }
    return claims;
}

/** Verify and decode a banking portal JWT from the raw MCP credential (no auth prefix). */
export async function decodeBankingPortalPayload(credential: string): Promise<BankingPortalClaims> {
    const token = credential.trim();
    if (!token) {
        throw new Error('Missing credential.');
    }
    const secret = new TextEncoder().encode(resolveHs256Secret());
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });
    return pickClaims(payload as Record<string, unknown>);
}
