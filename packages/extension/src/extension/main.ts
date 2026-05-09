import type { LanguageClientOptions, ServerOptions } from 'vscode-languageclient/node.js';
import * as vscode from 'vscode';
import * as path from 'node:path';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { LanguageClient, TransportKind } from 'vscode-languageclient/node.js';

let client: LanguageClient;
const generateByFileQueue = new Map<string, Promise<void>>();

// This function is called when the extension is activated.
export async function activate(context: vscode.ExtensionContext): Promise<void> {
    client = await startLanguageClient(context);
    registerGenerateOnSave(context);
}

// This function is called when the extension is deactivated.
export function deactivate(): Thenable<void> | undefined {
    if (client) {
        return client.stop();
    }
    return undefined;
}

async function startLanguageClient(context: vscode.ExtensionContext): Promise<LanguageClient> {
    const serverModule = context.asAbsolutePath(path.join('out', 'language', 'main.cjs'));
    // The debug options for the server
    // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging.
    // By setting `process.env.DEBUG_BREAK` to a truthy value, the language server will wait until a debugger is attached.
    const debugOptions = { execArgv: ['--nolazy', `--inspect${process.env.DEBUG_BREAK ? '-brk' : ''}=${process.env.DEBUG_SOCKET || '6009'}`] };

    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    const serverOptions: ServerOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
    };

    // Options to control the language client
    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: '*', language: 'api-2-ai-dsl' }]
    };

    // Create the language client and start the client.
    const client = new LanguageClient(
        'api-2-ai-dsl',
        'api2ai-dsl',
        serverOptions,
        clientOptions
    );

    // Start the client. This will also launch the server
    await client.start();
    return client;
}

function registerGenerateOnSave(context: vscode.ExtensionContext): void {
    const disposable = vscode.workspace.onDidSaveTextDocument((document) => {
        if (document.languageId !== 'api-2-ai-dsl') {
            return;
        }
        const sourcePath = document.uri.fsPath;
        const queued = generateByFileQueue.get(sourcePath) ?? Promise.resolve();
        const next = queued
            .catch(() => undefined)
            .then(async () => generateForSourceFile(context, sourcePath))
            .finally(() => {
                if (generateByFileQueue.get(sourcePath) === next) {
                    generateByFileQueue.delete(sourcePath);
                }
            });
        generateByFileQueue.set(sourcePath, next);
    });
    context.subscriptions.push(disposable);
}

async function generateForSourceFile(context: vscode.ExtensionContext, sourcePath: string): Promise<void> {
    const parsed = path.parse(sourcePath);
    const destinationPath = path.join(parsed.dir, 'generated', `${parsed.name}-tools.ts`);
    const cliPath = resolveCliPath(context);
    if (!cliPath) {
        void vscode.window.showWarningMessage('api2ai: CLI entry not found, skipped auto-generate on save.');
        return;
    }
    await new Promise<void>((resolve, reject) => {
        execFile(
            process.execPath,
            [cliPath, 'generate', sourcePath, destinationPath],
            (error, stdout, stderr) => {
                if (error) {
                    const details = stderr || stdout || error.message;
                    reject(new Error(details));
                    return;
                }
                resolve();
            }
        );
    }).catch((error) => {
        const message = error instanceof Error ? error.message.trim() : String(error);
        void vscode.window.showErrorMessage(`api2ai: auto-generate failed for ${path.basename(sourcePath)}: ${message}`);
    });
}

function resolveCliPath(context: vscode.ExtensionContext): string | undefined {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (workspaceFolder) {
        const workspaceRootCandidate = path.resolve(workspaceFolder, '..', 'packages', 'cli', 'bin', 'cli.js');
        if (existsSync(workspaceRootCandidate)) {
            return workspaceRootCandidate;
        }
        const nestedCandidate = path.resolve(workspaceFolder, 'packages', 'cli', 'bin', 'cli.js');
        if (existsSync(nestedCandidate)) {
            return nestedCandidate;
        }
    }

    const extensionRelativeCandidate = path.resolve(context.extensionPath, '..', 'cli', 'bin', 'cli.js');
    if (existsSync(extensionRelativeCandidate)) {
        return extensionRelativeCandidate;
    }
    return undefined;
}
