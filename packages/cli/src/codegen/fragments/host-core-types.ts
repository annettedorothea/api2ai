/** api2ai host types embedded in generated MCP runtimes. */
export function hostCoreTypesFragment(): string {
    return `
/** Host context inside MCP server templates. Tool modules use ApiHostContext; this wider shape is shared across stdio/HTTP hosts. */
type ApiLikeHostContext = {
    baseUrl?: string;
    credential?: string;
};

type VerifyCredentialFn = (credential: string) => void | Promise<void>;

type TokenExchangeFn = (idpCredential: string) => Promise<string>;

type GeneratedHostModule = {
    generatedTools: Array<{ toolName: string; title?: string; description: string; access?: string }>;
    invokeTool: (
        toolName: string,
        args?: Record<string, unknown>,
        hostContext?: unknown
    ) => Promise<unknown>;
    inputZodByTool?: Record<string, unknown>;
    mcpServerName?: string;
    mcpServerVersion?: string;
    mcpBuildGeneratedAt?: string;
    requiresAuth: boolean;
    verifyCredential?: VerifyCredentialFn;
    tokenExchange?: TokenExchangeFn;
};`.trim();
}
