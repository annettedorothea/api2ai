/**
 * MCP credential verification (write-once — implement verifyXquikCredentials).
 * Used by oauth-http gate and by invokeTool for protected tools (stdio/relay/OAuth).
 */
export type ModuleCredentials = Record<string, unknown>;

export class XquikCredentials implements ModuleCredentials {
    [key: string]: unknown;

    constructor(init: ModuleCredentials) {
        Object.assign(this, init);
    }

    toString(): string {
        return '[Xquik credentials]';
    }
}

export function toXquikCredentials(_data?: ModuleCredentials | Record<string, unknown>): XquikCredentials {
    return new XquikCredentials({});
}

export type VerifyCredentialInput = {
    inboundCredential: string;
};

export type VerifyCredentialResult = {
    upstreamCredential: string;
    credentials: XquikCredentials;
};

export async function verifyXquikCredentials(input: VerifyCredentialInput): Promise<VerifyCredentialResult> {
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
