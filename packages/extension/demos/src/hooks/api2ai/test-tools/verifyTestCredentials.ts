export type ModuleCredentials = {
    role?: string;
};

export class TestCredentials implements ModuleCredentials {
    [key: string]: unknown;

    readonly role?: string;

    constructor(init: ModuleCredentials = {}) {
        this.role = init.role;
    }

    toString(): string {
        return this.role ? `[test api-key role=${this.role}]` : '[test api-key]';
    }
}

export function toTestCredentials(data?: ModuleCredentials | Record<string, unknown>): TestCredentials {
    const role = data?.role !== undefined ? String(data.role) : 'admin';
    return new TestCredentials({ role });
}

export type VerifyCredentialInput = {
    inboundCredential: string;
};

export type VerifyCredentialResult = {
    upstreamCredential: string;
    credentials: TestCredentials;
};

export async function verifyTestCredentials(input: VerifyCredentialInput): Promise<VerifyCredentialResult> {
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
