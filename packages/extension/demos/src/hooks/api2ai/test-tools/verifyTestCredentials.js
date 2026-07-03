export class TestCredentials {
    constructor(init = {}) {
        this.role = init.role;
    }
    toString() {
        return this.role ? `[test api-key role=${this.role}]` : '[test api-key]';
    }
}
export function toTestCredentials(data) {
    const role = data?.role !== undefined ? String(data.role) : 'admin';
    return new TestCredentials({ role });
}
export async function verifyTestCredentials(input) {
    const expected = process.env.TEST_API_KEY?.trim() || 'demo-test-api-key';
    const inbound = String(input.inboundCredential).trim();
    if (inbound !== expected) {
        throw new Error('Invalid MCP API key for test harness demo.');
    }
    return {
        upstreamCredential: inbound,
        credentials: toTestCredentials({ role: 'admin' })
    };
}
export { verifyTestCredentials as verifyCredential, toTestCredentials as toModuleCredentials };
