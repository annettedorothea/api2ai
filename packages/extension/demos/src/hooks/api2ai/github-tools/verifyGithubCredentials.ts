export type ModuleCredentials = Record<string, unknown>;

export class GithubCredentials implements ModuleCredentials {
    [key: string]: unknown;

    toString(): string {
        return '[github relay]';
    }
}

export function toGithubCredentials(_data?: ModuleCredentials | Record<string, unknown>): GithubCredentials {
    return new GithubCredentials();
}

export type VerifyCredentialInput = {
    inboundCredential: string;
};

export type VerifyCredentialResult = {
    upstreamCredential: string;
    credentials: GithubCredentials;
};

/** Opaque PAT relay — upstream GitHub API validates the token. */
export async function verifyGithubCredentials(input: VerifyCredentialInput): Promise<VerifyCredentialResult> {
    const upstreamCredential = String(input.inboundCredential).trim();
    if (!upstreamCredential) {
        throw new Error('Missing inbound MCP credential for GitHub.');
    }
    return {
        upstreamCredential,
        credentials: toGithubCredentials()
    };
}

export { verifyGithubCredentials as verifyCredential, toGithubCredentials as toModuleCredentials };
