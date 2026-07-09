export function describeUpstreamEnvFieldFragment(): string {
    return `
function describeUpstreamEnvField(
    _generated: GeneratedHostModule,
    hostConfig: { baseUrlEnvKey?: string }
): { label: string; value: string } | undefined {
    const key = hostConfig.baseUrlEnvKey?.trim();
    if (!key) {
        return undefined;
    }
    const set = Boolean(process.env[key]?.trim());
    return { label: 'Upstream:', value: key + (set ? '' : ' (unset)') };
}`.trim();
}

/** api2ai has no connectionEnv on GeneratedHostModule. */
export function startupBannerConnectionEnvNotePrefixFragment(): string {
    return '';
}
