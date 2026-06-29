export type ModuleCredentials = Record<string, unknown>;

export class XquikCredentials implements ModuleCredentials {
    [key: string]: unknown;

    toString(): string {
        return '[xquik api-key]';
    }
}

export function toXquikCredentials(_data?: ModuleCredentials | Record<string, unknown>): XquikCredentials {
    return new XquikCredentials();
}

export type VerifyCredentialInput = {
    inboundCredential: string;
};

export type VerifyCredentialResult = {
    upstreamCredential: string;
    credentials: XquikCredentials;
};

export async function verifyXquikCredentials(input: VerifyCredentialInput): Promise<VerifyCredentialResult> {
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
