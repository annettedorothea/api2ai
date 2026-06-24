export type ModuleCredentials = Record<string, unknown>;

export class TmdbCredentials implements ModuleCredentials {
    [key: string]: unknown;

    toString(): string {
        return '[tmdb relay]';
    }
}

export function toTmdbCredentials(_data?: ModuleCredentials | Record<string, unknown>): TmdbCredentials {
    return new TmdbCredentials();
}

export type VerifyCredentialInput = {
    inboundCredential: string;
};

export type VerifyCredentialResult = {
    upstreamCredential: string;
    credentials: TmdbCredentials;
};

/** Opaque access-token relay — upstream TMDB API validates the token. */
export async function verifyTmdbCredentials(input: VerifyCredentialInput): Promise<VerifyCredentialResult> {
    const upstreamCredential = String(input.inboundCredential).trim();
    if (!upstreamCredential) {
        throw new Error('Missing inbound MCP credential for TMDB.');
    }
    return {
        upstreamCredential,
        credentials: toTmdbCredentials()
    };
}

export { verifyTmdbCredentials as verifyCredential, toTmdbCredentials as toModuleCredentials };
