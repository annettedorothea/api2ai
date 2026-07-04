export class XquikCredentials {
    constructor(init) {
        Object.assign(this, init);
    }
    toString() {
        return '[Xquik credentials]';
    }
}
export function toXquikCredentials(_data) {
    return new XquikCredentials({});
}
export async function verifyXquikCredentials(input) {
    const expected = process.env.XQUIK_API_KEY?.trim();
    if (!expected) {
        throw new Error('XQUIK_API_KEY is not set.');
    }
    const inbound = String(input.inboundCredential).trim();
    if (inbound !== expected) {
        throw new Error('Invalid MCP API key for xquik demo.');
    }
    return {
        upstreamCredential: inbound,
        credentials: toXquikCredentials()
    };
}
export { verifyXquikCredentials as verifyCredential, toXquikCredentials as toModuleCredentials };
