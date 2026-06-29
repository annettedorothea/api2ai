export class XquikCredentials {
    toString() {
        return '[xquik api-key]';
    }
}
export function toXquikCredentials(_data) {
    return new XquikCredentials();
}
export async function verifyXquikCredentials(input) {
    const upstreamCredential = String(input.inboundCredential).trim();
    if (!upstreamCredential) {
        throw new Error('Missing inbound MCP credential for Xquik.');
    }
    return {
        upstreamCredential,
        credentials: toXquikCredentials()
    };
}
export { verifyXquikCredentials as verifyCredential, toXquikCredentials as toModuleCredentials };
