import type { ModuleCredentials } from './verifyBankingCredentials.js';

/** Admin-only gate for listCustomers (authorize: true in banking.api2ai). */
export function authorizeListCustomers(credentials: ModuleCredentials): void {
    const role = String(credentials.role ?? '').trim();
    if (role.length === 0) {
        throw new Error('Banking token missing role claim.');
    }
    if (role !== 'admin') {
        throw new Error(`Admin role required to list customers; token role is "${role}".`);
    }
}
