export type VerifyCredentialInput = {
    inboundCredential: string;
};

export type VerifyCredentialResult = {
    upstreamCredential: string;
    sessionClaims?: Record<string, unknown>;
};

/** Opaque IdP token — upstream cakes-api validates the JWT. */
export async function verifyCredential(input: VerifyCredentialInput): Promise<VerifyCredentialResult> {
    const token = input.inboundCredential.trim();
    if (!token) {
        throw new Error('Missing OAuth Bearer token.');
    }
    return { upstreamCredential: token };
}
