export type InvokeOptions = {
    pathParams?: Record<string, string | number | boolean>;
    query?: Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
    headers?: Record<string, string>;
    body?: unknown;
};

export type RestrictedHostContext = {
    credential: string;
    jwt?: Record<string, unknown>;
};
