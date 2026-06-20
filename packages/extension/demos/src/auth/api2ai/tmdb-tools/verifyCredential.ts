export type VerifyCredentialInput = {
    inboundCredential: string;
};

export type VerifyCredentialResult = {
    upstreamCredential: string;
    sessionClaims?: Record<string, unknown>;
};

/** Opaque access-token relay — upstream TMDB API validates the token. */
export async function verifyCredential(input: VerifyCredentialInput): Promise<VerifyCredentialResult> {
    const upstreamCredential = String(input.inboundCredential).trim();
    if (!upstreamCredential) {
        throw new Error('Missing inbound MCP credential for TMDB.');
    }
    return { upstreamCredential };
}
