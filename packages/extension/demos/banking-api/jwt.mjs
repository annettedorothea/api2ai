import { verifyJwt as verifyBookingsJwt } from '../bookings/jwt.mjs';

const DEFAULT_SECRET = 'demo-banking-portal-secret';

export function jwtSecret() {
    return process.env.BANKING_API_JWT_SECRET?.trim() || DEFAULT_SECRET;
}

export function verifyPortalJwt(token) {
    const verified = verifyBookingsJwt(token, jwtSecret());
    if (!verified.ok) {
        return verified;
    }
    const tokenUse = String(verified.payload?.token_use ?? '').trim();
    if (tokenUse !== 'portal') {
        return { ok: false, error: 'not_portal_token' };
    }
    return verified;
}
