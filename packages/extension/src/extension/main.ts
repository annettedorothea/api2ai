import type { LanguageClientOptions, ServerOptions } from 'vscode-languageclient/node.js';
import * as vscode from 'vscode';
import { DiagnosticSeverity } from 'vscode';
import * as path from 'node:path';
import { cpSync, existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { LanguageClient, TransportKind } from 'vscode-languageclient/node.js';
import demoBundleRequired from '../../demo-bundle-required.json' with { type: 'json' };
import { runBuildGenerated } from './build-generated.js';

const PRODUCT_LABEL = 'api2ai';
const HOST_PRODUCT = 'api2ai' as const;

let client: LanguageClient;
const generateByFileQueue = new Map<string, Promise<void>>();
const DIAGNOSTICS_WAIT_MS = 1500;

function waitForLanguageDiagnostics(uri: vscode.Uri): Promise<void> {
    return new Promise((resolve) => {
        let settled = false;
        const finish = () => {
            if (settled) {
                return;
            }
            settled = true;
            dispose.dispose();
            clearTimeout(timer);
            resolve();
        };
        const dispose = vscode.languages.onDidChangeDiagnostics((event) => {
            if (event.uris.some((changedUri) => changedUri.toString() === uri.toString())) {
                finish();
            }
        });
        const timer = setTimeout(finish, DIAGNOSTICS_WAIT_MS);
    });
}

function isValidationBlockedGenerateFailure(message: string): boolean {
    return (
        /Cannot generate/i.test(message) ||
        /validation error/i.test(message) ||
        /There are validation errors/i.test(message) ||
        /fix parser errors/i.test(message)
    );
}

function reportGenerateFailure(
    productLabel: 'api2ai' | 'db2ai',
    sourcePath: string,
    message: string,
    reportSuccess: boolean
): void {
    const baseName = path.basename(sourcePath);
    if (isValidationBlockedGenerateFailure(message)) {
        if (reportSuccess) {
            void vscode.window.showWarningMessage(
                `${productLabel}: generation skipped — fix validation errors in ${baseName} first.`
            );
        }
        return;
    }
    if (reportSuccess) {
        void vscode.window.showErrorMessage(`${productLabel}: generate failed for ${baseName}: ${message}`);
    }
}

// This function is called when the extension is activated.
export async function activate(context: vscode.ExtensionContext): Promise<void> {
    client = await startLanguageClient(context);
    registerGenerateOnSave(context);
    registerGenerateCommand(context);
    registerCreateDemoWorkspaceCommand(context);
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
    const debugOptions = {
        execArgv: [
            '--nolazy',
            `--inspect${process.env.DEBUG_BREAK ? '-brk' : ''}=${process.env.DEBUG_SOCKET || '6009'}`
        ]
    };

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
    const client = new LanguageClient('api-2-ai-dsl', 'api2ai-dsl', serverOptions, clientOptions);

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
            .then(async () => {
                await waitForLanguageDiagnostics(vscode.Uri.file(sourcePath));
                await generateForSourceFile(context, sourcePath);
            })
            .finally(() => {
                if (generateByFileQueue.get(sourcePath) === next) {
                    generateByFileQueue.delete(sourcePath);
                }
            });
        generateByFileQueue.set(sourcePath, next);
    });
    context.subscriptions.push(disposable);
}

const DEMO_COPY_SKIP_DIRS = new Set(['node_modules', 'tmp']);
const DEMO_COPY_SKIP_FILES = new Set(['package-lock.json', '.env.local']);
const DEMO_BUNDLE_REQUIRED: readonly string[] = demoBundleRequired;

function registerCreateDemoWorkspaceCommand(context: vscode.ExtensionContext): void {
    const disposable = vscode.commands.registerCommand('api2ai.createDemoWorkspace', async () => {
        const targetUri = await pickDemoWorkspaceTarget();
        if (!targetUri) {
            return;
        }
        const targetDir = targetUri.fsPath;
        if (existsSync(path.join(targetDir, 'package.json'))) {
            const overwrite = await vscode.window.showWarningMessage(
                'api2ai: Target folder already contains package.json. Overwrite demo files?',
                { modal: true },
                'Overwrite'
            );
            if (overwrite !== 'Overwrite') {
                return;
            }
        }
        const sourceDir = context.asAbsolutePath('demos');
        if (!existsSync(sourceDir)) {
            void vscode.window.showErrorMessage(
                'api2ai: Bundled demos folder missing. Reinstall the extension or rebuild the VSIX.'
            );
            return;
        }
        const missingBundled = DEMO_BUNDLE_REQUIRED.filter((relative) => !existsSync(path.join(sourceDir, relative)));
        if (missingBundled.length > 0) {
            void vscode.window.showErrorMessage(
                `api2ai: Bundled demo workspace is incomplete (missing ${missingBundled.join(', ')}). Reinstall the extension or rebuild the VSIX.`
            );
            return;
        }
        try {
            cpSync(sourceDir, targetDir, {
                recursive: true,
                filter: (src) => shouldCopyDemoPath(sourceDir, src)
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            void vscode.window.showErrorMessage(`api2ai: Failed to create demo workspace: ${message}`);
            return;
        }
        const openFolder = 'Open folder';
        const choice = await vscode.window.showInformationMessage(
            `api2ai: Demo workspace ready in ${targetDir}. Open README.md to test your first MCP server.`,
            openFolder
        );
        if (choice === openFolder) {
            await vscode.commands.executeCommand('vscode.openFolder', targetUri, { forceNewWindow: false });
        }
    });
    context.subscriptions.push(disposable);
}

async function pickDemoWorkspaceTarget(): Promise<vscode.Uri | undefined> {
    const picked = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: 'Create demo workspace here'
    });
    if (picked?.[0]) {
        return picked[0];
    }
    const folder = vscode.workspace.workspaceFolders?.[0];
    if (folder && !existsSync(path.join(folder.uri.fsPath, 'package.json'))) {
        const useWorkspace = await vscode.window.showQuickPick([{ label: 'Use current workspace folder', folder }], {
            placeHolder: 'No folder selected — use open workspace?'
        });
        if (useWorkspace) {
            return useWorkspace.folder.uri;
        }
    }
    return undefined;
}

function shouldCopyDemoPath(sourceDir: string, src: string): boolean {
    const relative = path.relative(sourceDir, src);
    if (!relative || relative === '') {
        return true;
    }
    const parts = relative.split(path.sep);
    // Skip compiled MCP tools at demos/generated/, not utility scripts under scripts/generated/.
    if (parts[0] === 'generated') {
        return false;
    }
    if (parts.some((part) => DEMO_COPY_SKIP_DIRS.has(part))) {
        return false;
    }
    const base = parts[parts.length - 1];
    if (base && DEMO_COPY_SKIP_FILES.has(base)) {
        return false;
    }
    return true;
}

function registerGenerateCommand(context: vscode.ExtensionContext): void {
    const disposable = vscode.commands.registerCommand('api2ai.generateTools', async () => {
        const editor = vscode.window.activeTextEditor;
        const doc = editor?.document;
        if (!doc || doc.languageId !== 'api-2-ai-dsl') {
            void vscode.window.showWarningMessage(
                'api2ai: Open and focus an .api2ai file (api-2-ai-dsl) to generate tool code.'
            );
            return;
        }
        await generateForSourceFile(context, doc.uri.fsPath, { reportSuccess: true });
    });
    context.subscriptions.push(disposable);
}

type CliSpawn = {
    scriptPath: string;
    embedHome?: string;
};

async function generateForSourceFile(
    context: vscode.ExtensionContext,
    sourcePath: string,
    options?: { reportSuccess?: boolean }
): Promise<void> {
    const reportSuccess = options?.reportSuccess === true;
    const sourceUri = vscode.Uri.file(sourcePath);
    const blockingErrors = vscode.languages
        .getDiagnostics(sourceUri)
        .filter((diagnostic) => diagnostic.severity === DiagnosticSeverity.Error);
    if (blockingErrors.length > 0) {
        if (reportSuccess) {
            void vscode.window.showWarningMessage(
                `api2ai: generation skipped — fix ${blockingErrors.length} error(s) in ${path.basename(sourcePath)} first.`
            );
        }
        return;
    }

    const parsed = path.parse(sourcePath);
    const destinationPath = path.join(parsed.dir, 'generated', HOST_PRODUCT, 'tools', `${parsed.name}-tools.ts`);
    const spawn = resolveCliSpawn(context);
    if (!spawn) {
        void vscode.window.showWarningMessage(
            'api2ai: CLI not found — run npm run build in the api2ai repo (embed under packages/extension/out), install the VSIX, or set API2AI_CLI.'
        );
        return;
    }
    const env = spawn.embedHome?.length ? { ...process.env, API2AI_EMBED_HOME: spawn.embedHome } : process.env;
    try {
        await new Promise<void>((resolve, reject) => {
            execFile(
                process.execPath,
                [spawn.scriptPath, 'generate', sourcePath, destinationPath],
                { env },
                (error, stdout, stderr) => {
                    if (error) {
                        const details = stderr || stdout || error.message;
                        reject(new Error(details));
                        return;
                    }
                    resolve();
                }
            );
        });
        const compiled = await runBuildGenerated(PRODUCT_LABEL, sourcePath);
        if (reportSuccess) {
            const baseName = path.basename(sourcePath);
            const suffix = compiled.ok ? ' and compiled' : '';
            void vscode.window.showInformationMessage(`${PRODUCT_LABEL}: generated${suffix} tools for ${baseName}.`);
        }
    } catch (error) {
        const message = error instanceof Error ? error.message.trim() : String(error);
        reportGenerateFailure(PRODUCT_LABEL, sourcePath, message, reportSuccess);
    }
}

function resolveCliSpawn(context: vscode.ExtensionContext): CliSpawn | undefined {
    const envCli = process.env.API2AI_CLI;
    if (envCli && existsSync(envCli)) {
        const embedHome = path.basename(path.dirname(envCli)) === 'embed-api2ai' ? path.dirname(envCli) : undefined;
        return { scriptPath: envCli, embedHome };
    }

    const bundledCliPath = context.asAbsolutePath(path.join('out', 'embed-api2ai', 'cli.cjs'));
    if (existsSync(bundledCliPath)) {
        return {
            scriptPath: bundledCliPath,
            embedHome: context.asAbsolutePath(path.join('out', 'embed-api2ai'))
        };
    }

    return undefined;
}
