import type { InvokeOptions, CheckedHostContext } from '../../../generated/tools/banking-tools.js';

export function checkListAccountsParameters(options: InvokeOptions, host: CheckedHostContext): InvokeOptions {
    const jwt = host.jwt;
    if (!jwt || typeof jwt !== 'object') {
        throw new Error('listAccounts requires JWT claims in host context (from credential transform).');
    }
    const jwtCustomer = String(jwt.customerId ?? '').trim();
    if (jwtCustomer.length === 0) {
        throw new Error('Credential transform claims missing customerId.');
    }
    const role = String(jwt.role ?? '').trim();
    if (role.length === 0) {
        throw new Error('Credential transform claims missing role.');
    }

    let customerId = options.pathParams?.customerId;
    if (customerId == null || String(customerId).trim() === '') {
        customerId = jwtCustomer;
    }
    const normalized = String(customerId).trim();
    if (role === 'user' && normalized !== jwtCustomer) {
        throw new Error(`customerId "${normalized}" does not match token claim "${jwtCustomer}".`);
    }
    if (role !== 'user' && role !== 'admin') {
        throw new Error(`Unsupported role "${role}".`);
    }

    return {
        ...options,
        pathParams: { ...options.pathParams, customerId: normalized }
    };
}
