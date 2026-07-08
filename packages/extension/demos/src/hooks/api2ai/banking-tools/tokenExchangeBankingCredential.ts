import { loggingAdapter } from '../../../utils/logging-adapter.js';

/** OAuth IdP JWT → portal JWT via demo IdP token-exchange endpoint. */
export async function tokenExchangeBankingCredential(idpCredential: string): Promise<string> {
    const url = process.env.BANKING_TOKEN_EXCHANGE_URL?.trim() || 'http://127.0.0.1:3860/portal/token-exchange';
    const token = idpCredential.trim();
    if (!token) {
        loggingAdapter.error('Missing IdP credential for token exchange.');
        throw new Error('Missing IdP credential for token exchange.');
    }
    loggingAdapter.info(`Token exchange url: ${url}`);
    const response = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) {
        const body = await response.text().catch(() => '');
        loggingAdapter.error('Token exchange failed: ${response.status} ${body || response.statusText}');
        throw new Error(`Token exchange failed (HTTP ${response.status}): ${body || response.statusText}`);
    }
    const data = (await response.json()) as { access_token?: string };
    const portalToken = String(data.access_token ?? '').trim();
    if (!portalToken) {
        loggingAdapter.error('Token exchange response missing access_token.');
        throw new Error('Token exchange response missing access_token.');
    }
    loggingAdapter.info(`Token exchange successful`);
    return portalToken;
}

export { tokenExchangeBankingCredential as tokenExchange };
