import type { InvokeOptions, CheckedHostContext } from '../../../../generated/api2ai/tools/banking-tools.js';

export function checkListAccountsParameters(options: InvokeOptions, host: CheckedHostContext): InvokeOptions {
    const claims = host.sessionClaims;
    if (!claims || typeof claims !== 'object') {
        throw new Error('listAccounts requires sessionClaims from verifyCredential.');
    }
    const jwtCustomer = String(claims.customerId ?? '').trim();
    if (jwtCustomer.length === 0) {
        throw new Error('Credential transform claims missing customerId.');
    }
    const role = String(claims.role ?? '').trim();
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
