export type VerifyCredentialInput = {
    inboundCredential: string;
};

export type VerifyCredentialResult = {
    upstreamCredential: string;
    sessionClaims?: Record<string, unknown>;
};

export async function verifyCredential(input: VerifyCredentialInput): Promise<VerifyCredentialResult> {
    const expected = process.env.TODO_API_KEY?.trim();
    if (!expected) {
        throw new Error('TODO_API_KEY is not set (expected MCP x-api-token value).');
    }
    const inbound = String(input.inboundCredential).trim();
    if (inbound !== expected) {
        throw new Error('Invalid MCP API key for todo demo.');
    }
    return { upstreamCredential: inbound };
}
