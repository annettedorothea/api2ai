export class CakesCredentials {
    toString() {
        return '[cakes relay]';
    }
}
export function toCakesCredentials(_data) {
    return new CakesCredentials();
}
/** Opaque IdP token — upstream cakes-api validates the JWT. */
export async function verifyCakesCredentials(input) {
    const token = input.inboundCredential.trim();
    if (!token) {
        throw new Error('Missing OAuth Bearer token.');
    }
    return {
        upstreamCredential: token,
        credentials: toCakesCredentials()
    };
}
export { verifyCakesCredentials as verifyCredential, toCakesCredentials as toModuleCredentials };
