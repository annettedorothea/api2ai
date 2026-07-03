import type { ModuleCredentials } from './verifyTestCredentials.js';
import type { InvokeOptions } from '../../../../generated/api2ai/tools/test-tools.js';

const MAX_LIMIT = 10;

function resolveLimitQuery(options: InvokeOptions): number {
    const raw = options.query?.limit;
    if (raw == null || String(raw).trim() === '') {
        return MAX_LIMIT;
    }
    const limit = Number(raw);
    if (!Number.isFinite(limit) || limit < 1) {
        throw new Error('limit must be a positive integer.');
    }
    if (limit > MAX_LIMIT) {
        throw new Error(`limit must not exceed ${MAX_LIMIT}.`);
    }
    return Math.floor(limit);
}

export function authorizeTestGetAdminSecrets(credentials: ModuleCredentials): void {
    const role = String(credentials.role ?? '').trim();
    if (role !== 'admin') {
        throw new Error(`Admin role required; got "${role || 'unknown'}".`);
    }
}

export function prepareTestGetAdminSecretsInput(
    options: InvokeOptions,
    credentials?: ModuleCredentials
): InvokeOptions {
    if (!credentials) {
        throw new Error('Prepare requires credentials.');
    }
    void credentials;
    const limit = resolveLimitQuery(options);
    return {
        ...options,
        query: { ...options.query, limit }
    };
}
