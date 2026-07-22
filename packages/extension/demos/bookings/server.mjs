#!/usr/bin/env node
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { verifyJwt } from './jwt.mjs';
import { loggingAdapter } from '@toolfactory.dev/core/logging';

const PORT = Number(process.env.BOOKINGS_API_PORT) || 3847;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { units, bookings, season } = JSON.parse(readFileSync(path.join(__dirname, 'data', 'rentals.json'), 'utf8'));

function sendJson(res, status, body) {
    res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(body));
}

function parseBearer(req) {
    const h = req.headers.authorization;
    if (!h || !h.startsWith('Bearer ')) {
        return undefined;
    }
    return h.slice('Bearer '.length).trim();
}

function matchPath(pathname, pattern) {
    const patternParts = pattern.split('/').filter(Boolean);
    const pathParts = pathname.split('/').filter(Boolean);
    if (patternParts.length !== pathParts.length) {
        return undefined;
    }
    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
        const pp = patternParts[i];
        const vp = pathParts[i];
        if (pp.startsWith('{') && pp.endsWith('}')) {
            params[pp.slice(1, -1)] = decodeURIComponent(vp);
        } else if (pp !== vp) {
            return undefined;
        }
    }
    return params;
} 

function requireAuth(req, res) {
    const token = parseBearer(req);
    if (!token) {
        loggingAdapter.warn('auth rejected', { error: 'missing_bearer_token' });
        sendJson(res, 401, { error: 'missing_bearer_token' });
        return undefined;
    }
    const verified = verifyJwt(token);
    if (!verified.ok) {
        loggingAdapter.warn('auth rejected', { error: 'invalid_token', reason: verified.error });
        sendJson(res, 401, { error: 'invalid_token', reason: verified.error });
        return undefined;
    }
    return verified.payload;
}

/** @param {{ checkIn: string, checkOut: string }[]} unitBookings */
function buildAvailabilityPeriods(unitBookings, rangeFrom, rangeTo) {
    const sorted = [...unitBookings].sort((a, b) => a.checkIn.localeCompare(b.checkIn));
    const periods = [];
    let cursor = rangeFrom;
    for (const booking of sorted) {
        if (booking.checkOut <= cursor) {
            continue;
        }
        if (booking.checkIn > cursor) {
            periods.push({ from: cursor, to: booking.checkIn, status: 'free' });
        }
        const occupiedFrom = booking.checkIn > cursor ? booking.checkIn : cursor;
        periods.push({ from: occupiedFrom, to: booking.checkOut, status: 'occupied' });
        cursor = booking.checkOut > cursor ? booking.checkOut : cursor;
    }
    if (cursor < rangeTo) {
        periods.push({ from: cursor, to: rangeTo, status: 'free' });
    }
    return periods;
}

function parseLimit(url) {
    const raw = url.searchParams.get('limit');
    if (raw == null || raw.trim() === '') {
        return 10;
    }
    const limit = Number.parseInt(raw, 10);
    if (!Number.isFinite(limit) || limit < 1) {
        return undefined;
    }
    return Math.min(limit, 10);
}

function listVacationRentalsPublic(limit) {
    const rangeFrom = season.from;
    const rangeTo = season.to;
    return units.slice(0, limit).map((unit) => {
        const unitBookings = bookings.filter((b) => b.unitId === unit.unitId);
        return {
            ...unit,
            periods: buildAvailabilityPeriods(unitBookings, rangeFrom, rangeTo)
        };
    });
}

function listAllBookings(limit) {
    return bookings.slice(0, limit).map(({ bookingId, customerId, unitId, checkIn, checkOut }) => ({
        bookingId,
        customerId,
        unitId,
        checkIn,
        checkOut
    }));
}

function listBookingsForCustomer(customerId) {
    return bookings
        .filter((b) => b.customerId === customerId)
        .map(({ bookingId, unitId, checkIn, checkOut }) => ({ bookingId, unitId, checkIn, checkOut }));
}

const server = createServer((req, res) => {
    const url = new URL(req.url ?? '/', `http://127.0.0.1:${PORT}`);
    const method = req.method ?? 'GET';
    loggingAdapter.debug(`${method} ${url.pathname}`);

    if (method !== 'GET') {
        loggingAdapter.warn('method not allowed', { method, path: url.pathname });
        sendJson(res, 405, { error: 'method_not_allowed' });
        return;
    }

    if (url.pathname === '/vacation-rentals') {
        const limit = parseLimit(url);
        if (limit === undefined) {
            sendJson(res, 400, { error: 'invalid_limit' });
            return;
        }
        const unitList = listVacationRentalsPublic(limit);
        loggingAdapter.debug('vacation-rentals', { public: true, limit, unitCount: unitList.length });
        sendJson(res, 200, { limit, units: unitList });
        return;
    }

    if (url.pathname === '/bookings') {
        const payload = requireAuth(req, res);
        if (!payload) {
            return;
        }
        const role = String(payload.role ?? '');
        if (role !== 'admin') {
            loggingAdapter.warn('forbidden', { error: 'admin_required', role: role || 'user' });
            sendJson(res, 403, { error: 'admin_required', role: role || 'user' });
            return;
        }
        const limit = parseLimit(url);
        if (limit === undefined) {
            sendJson(res, 400, { error: 'invalid_limit' });
            return;
        }
        const allBookings = listAllBookings(limit);
        loggingAdapter.debug('list all bookings', { role, limit, count: allBookings.length });
        sendJson(res, 200, { role, limit, bookings: allBookings });
        return;
    }

    const bookingPath = matchPath(url.pathname, '/bookings/{customerId}');
    if (bookingPath) {
        const payload = requireAuth(req, res);
        if (!payload) {
            return;
        }
        const claimCustomerId = payload.customerId;
        const role = String(payload.role ?? '');
        if (role !== 'admin' && String(claimCustomerId) !== String(bookingPath.customerId)) {
            loggingAdapter.warn('forbidden', {
                error: 'customer_mismatch',
                pathCustomerId: bookingPath.customerId,
                tokenCustomerId: claimCustomerId,
                tokenRole: role || 'user'
            });
            sendJson(res, 403, {
                error: 'customer_mismatch',
                pathCustomerId: bookingPath.customerId,
                tokenCustomerId: claimCustomerId,
                tokenRole: role || 'user'
            });
            return;
        }
        const customerBookings = listBookingsForCustomer(bookingPath.customerId);
        loggingAdapter.debug('list bookings', {
            customerId: bookingPath.customerId,
            count: customerBookings.length,
            role: role || 'user'
        });
        sendJson(res, 200, {
            customerId: bookingPath.customerId,
            bookings: customerBookings
        });
        return;
    }

    loggingAdapter.warn('not found', { method, path: url.pathname });
    sendJson(res, 404, { error: 'not_found' });
});

server.listen(PORT, '127.0.0.1', () => {
    loggingAdapter.info('listening', { url: `http://127.0.0.1:${PORT}`, auth: 'Bearer JWT' });
});
