import type { LanguageClientOptions, ServerOptions } from 'vscode-languageclient/node.js';
import * as vscode from 'vscode';
import * as path from 'node:path';
import { cpSync, existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { LanguageClient, TransportKind } from 'vscode-languageclient/node.js';

let client: LanguageClient;
const generateByFileQueue = new Map<string, Promise<void>>();

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

const DEMO_COPY_SKIP_DIRS = new Set(['node_modules', 'generated', 'tmp']);
const DEMO_COPY_SKIP_FILES = new Set(['package-lock.json', '.env', '.env.local']);

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
            `api2ai: Demo workspace created in ${targetDir}. Run npm install, then npm run generate:all (or save .api2ai files).`,
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
    const parsed = path.parse(sourcePath);
    const destinationPath = path.join(parsed.dir, 'generated', 'tools', `${parsed.name}-tools.ts`);
    const spawn = resolveCliSpawn(context);
    if (!spawn) {
        void vscode.window.showWarningMessage('api2ai: CLI entry not found, skipped generate.');
        return;
    }
    const env = spawn.embedHome?.length ? { ...process.env, API2AI_EMBED_HOME: spawn.embedHome } : process.env;
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
    })
        .then(() => {
            if (reportSuccess) {
                void vscode.window.showInformationMessage(`api2ai: generated tools for ${path.basename(sourcePath)}.`);
            }
        })
        .catch((error) => {
            const message = error instanceof Error ? error.message.trim() : String(error);
            void vscode.window.showErrorMessage(`api2ai: generate failed for ${path.basename(sourcePath)}: ${message}`);
        });
}

function resolveCliSpawn(context: vscode.ExtensionContext): CliSpawn | undefined {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (workspaceFolder) {
        const monorepoNested = path.resolve(workspaceFolder, 'packages', 'cli', 'bin', 'cli.js');
        if (existsSync(monorepoNested)) {
            return { scriptPath: monorepoNested };
        }
        const parentPackages = path.resolve(workspaceFolder, '..', 'packages', 'cli', 'bin', 'cli.js');
        if (existsSync(parentPackages)) {
            return { scriptPath: parentPackages };
        }
        const demosMonorepoCli = path.resolve(workspaceFolder, '../../cli/bin/cli.js');
        if (existsSync(demosMonorepoCli)) {
            return { scriptPath: demosMonorepoCli };
        }
    }

    const bundledCliPath = context.asAbsolutePath(path.join('out', 'embed-api2ai', 'cli.cjs'));
    if (existsSync(bundledCliPath)) {
        return {
            scriptPath: bundledCliPath,
            embedHome: context.asAbsolutePath(path.join('out', 'embed-api2ai'))
        };
    }

    const extensionRelativeCandidate = path.resolve(context.extensionPath, '..', 'cli', 'bin', 'cli.js');
    if (existsSync(extensionRelativeCandidate)) {
        return { scriptPath: extensionRelativeCandidate };
    }
    return undefined;
}
