#!/usr/bin/env node
/**
 * Smoke test banking token exchange pipeline (no secrets printed).
 */
import { mintCustomerToken } from '../oauth-idp/signing.mjs';
import { mintCustomerToken as mintBookingsToken } from '../bookings/jwt.mjs';

const bankingBase = process.env.BANKING_API_BASE_URL?.trim() || 'http://127.0.0.1:3858';
const idpExchange =
    process.env.BANKING_TOKEN_EXCHANGE_URL?.trim() || 'http://127.0.0.1:3860/portal/token-exchange';
const cakesBase = process.env.CAKES_API_BASE_URL?.trim() || 'http://127.0.0.1:3856';

function assertOk(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

async function main() {
    const idpToken = mintCustomerToken('alice', 'user', 3600, undefined, {
        token_use: 'idp',
        sub: 'alice'
    });

    const exchangeRes = await fetch(idpExchange, {
        method: 'POST',
        headers: { Authorization: `Bearer ${idpToken}` }
    });
    assertOk(exchangeRes.ok, `token exchange HTTP ${exchangeRes.status}`);
    const exchangeBody = await exchangeRes.json();
    const portalToken = String(exchangeBody.access_token ?? '').trim();
    assertOk(portalToken.length > 0, 'token exchange missing access_token');

    const accountsRes = await fetch(`${bankingBase}/accounts`, {
        headers: { Authorization: `Bearer ${portalToken}` }
    });
    assertOk(accountsRes.ok, `portal /accounts HTTP ${accountsRes.status}`);
    const accountsBody = await accountsRes.json();
    assertOk(accountsBody.customerId === 'alice', 'portal accounts customerId mismatch');
    assertOk(Array.isArray(accountsBody.accounts) && accountsBody.accounts.length >= 1, 'no accounts for alice');

    const idpAccountsRes = await fetch(`${bankingBase}/accounts`, {
        headers: { Authorization: `Bearer ${idpToken}` }
    });
    assertOk(idpAccountsRes.status === 401, `IdP token should be rejected, got HTTP ${idpAccountsRes.status}`);

    const adminIdp = mintCustomerToken('admin', 'admin', 3600, undefined, {
        token_use: 'idp',
        sub: 'admin'
    });
    const adminExchange = await fetch(idpExchange, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminIdp}` }
    });
    assertOk(adminExchange.ok, `admin token exchange HTTP ${adminExchange.status}`);
    const adminPortal = String((await adminExchange.json()).access_token ?? '').trim();
    const allRes = await fetch(`${bankingBase}/accounts/all`, {
        headers: { Authorization: `Bearer ${adminPortal}` }
    });
    assertOk(allRes.ok, `admin listAllAccounts HTTP ${allRes.status}`);

    const alicePortalExchange = await fetch(idpExchange, {
        method: 'POST',
        headers: { Authorization: `Bearer ${idpToken}` }
    });
    const alicePortal = String((await alicePortalExchange.json()).access_token ?? '').trim();
    const deniedRes = await fetch(`${bankingBase}/accounts/all`, {
        headers: { Authorization: `Bearer ${alicePortal}` }
    });
    assertOk(deniedRes.status === 403, `alice listAllAccounts should be 403, got ${deniedRes.status}`);

    const cakesToken = mintBookingsToken('alice', 'user');
    const cakesRes = await fetch(`${cakesBase}/cakes?limit=1`, {
        headers: { Authorization: `Bearer ${cakesToken}` }
    });
    assertOk(cakesRes.ok, `cakes regression HTTP ${cakesRes.status}`);

    console.log('[banking:smoke] ok — exchange, portal API, IdP rejection, admin/user gates, cakes regression');
}

main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[banking:smoke] failed:', message);
    process.exit(1);
});
