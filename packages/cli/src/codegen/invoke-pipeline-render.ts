import {
    missingCredentialErrorSnippet,
    renderCheckToolAccessBlock,
    renderPrepareToolCallBlock,
    renderVerifyCredentialBlock
} from '@toolfactory.dev/core/codegen';
import type { InvokePipelineTier, HookStubMaps } from '@toolfactory.dev/core/codegen';
import { urlAndHeadersPreambleFragment } from './fragments/url-preamble.js';

function renderInvokeCredentialPipeline(hasVerifyCredential: boolean): string {
    const verifyBlock = renderVerifyCredentialBlock(hasVerifyCredential, 'credential');
    return `
    let authCredential: string | undefined = host.credential?.trim()
        ? String(host.credential).trim()
        : undefined;

    if (tool.access === 'protected') {
        const inbound = host.credential;
        if (!inbound || !String(inbound).trim()) {${missingCredentialErrorSnippet()}
        }
        const credential = String(inbound).trim();${verifyBlock}
        authCredential = credential;
    }${urlAndHeadersPreambleFragment()}`;
}

/** Emits auth / hook preamble inside generated api2ai invokeTool. */
export function renderInvokePipeline(
    tier: InvokePipelineTier,
    hasVerifyCredential: boolean,
    stubMaps: HookStubMaps,
    includeAuthCredential = true
): string {
    if (tier === 'credential') {
        return renderInvokeCredentialPipeline(hasVerifyCredential);
    }
    if (tier !== 'full') {
        throw new Error('renderInvokePipeline: tier must be credential or full');
    }

    const verifyBlock = renderVerifyCredentialBlock(hasVerifyCredential, 'credential');
    const checkToolAccessBlock = renderCheckToolAccessBlock(stubMaps, 'tool');
    const prepareBlock = renderPrepareToolCallBlock(stubMaps, 'tool');
    const authCredentialDecl = includeAuthCredential
        ? `\n    let authCredential: string | undefined = credential;`
        : '';
    const authCredentialAssign = includeAuthCredential ? `\n        authCredential = credential;` : '';

    return `
    let credential: string | undefined = host.credential?.trim()
        ? String(host.credential).trim()
        : undefined;${authCredentialDecl}

    if (tool.access === 'protected') {
        const inbound = host.credential;
        if (!inbound || !String(inbound).trim()) {${missingCredentialErrorSnippet()}
        }
        credential = String(inbound).trim();${verifyBlock}${checkToolAccessBlock}${authCredentialAssign}
    }${prepareBlock}${urlAndHeadersPreambleFragment()}`;
}

export type { InvokePipelineTier, HookStubMaps };
