export type ModuleCredentials = Record<string, unknown>;

export class CakesCredentials implements ModuleCredentials {
    [key: string]: unknown;

    toString(): string {
        return '[cakes relay]';
    }
}

export function toCakesCredentials(_data?: ModuleCredentials | Record<string, unknown>): CakesCredentials {
    return new CakesCredentials();
}

export type VerifyCredentialInput = {
    inboundCredential: string;
};

export type VerifyCredentialResult = {
    upstreamCredential: string;
    credentials: CakesCredentials;
};

/** Opaque IdP token — upstream cakes-api validates the JWT. */
export async function verifyCakesCredentials(input: VerifyCredentialInput): Promise<VerifyCredentialResult> {
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
