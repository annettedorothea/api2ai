import { verifyJwt as verifyBookingsJwt, jwtSecret as bookingsJwtSecret } from '../bookings-api/jwt.mjs';

const DEFAULT_SECRET = 'demo-bookings-api-secret';

export function jwtSecret() {
    return (
        process.env.CAKES_API_JWT_SECRET?.trim() ||
        process.env.BOOKINGS_API_JWT_SECRET?.trim() ||
        DEFAULT_SECRET
    );
}

export function verifyJwt(token) {
    return verifyBookingsJwt(token, jwtSecret());
}
