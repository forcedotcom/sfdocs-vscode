import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as https from 'https';
import { exec } from 'child_process';
import { promisify } from 'util';

const CURSORRULES_FILENAME = '.cursorrules';
const CURSORRULES_TEMPLATE = 'cursorrules-template.txt';
const LAST_SETUP_KEY = 'sfdocs.cursorrules.lastSetup';
const CONTENT_VERSION_KEY = 'sfdocs.cursorrules.contentVersion';
const CURRENT_CONTENT_VERSION = '1.0.0';
const LAST_VERSION_CHECK_KEY = 'sfdocs.extension.lastVersionCheck';
const VERSION_CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;
const EXTENSION_ID = 'salesforce.sfdocs-vscode-extension-pack';

/**
 * Compares two semantic version strings
 * Returns: 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
function compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const part1 = parts1[i] || 0;
        const part2 = parts2[i] || 0;
        
        if (part1 > part2) {return 1;}
        if (part1 < part2) {return -1;}
    }
    
    return 0;
}

/**
 * Fetches the latest version from VS Code Marketplace
 */
async function fetchLatestVersion(): Promise<string | undefined> {
    return new Promise((resolve) => {
        const options = {
            hostname: 'marketplace.visualstudio.com',
            path: `/items?itemName=${EXTENSION_ID}`,
            method: 'GET',
            headers: {
                accept: 'application/json',
                userAgent: 'VSCode-Extension'
            }
        };

        https.get(options, (response) => {
            let data = '';
            
            response.on('data', (chunk) => {
                data += chunk;
            });
            
            response.on('end', () => {
                try {
                    const versionMatch = data.match(/"version"\s*:\s*"([^"]+)"/);
                    if (versionMatch && versionMatch[1]) {
                        resolve(versionMatch[1]);
                    } else {
                        resolve(undefined);
                    }
                } catch (error) {
                    console.error('Failed to parse marketplace response:', error);
                    resolve(undefined);
                }
            });
        }).on('error', (error) => {
            console.error('Failed to fetch latest version:', error);
            resolve(undefined);
        });
    });
}

/**
 * Checks if a new version of the extension is available
 */
async function checkForExtensionUpdate(context: vscode.ExtensionContext): Promise<void> {
    try {
        const extension = vscode.extensions.getExtension(EXTENSION_ID);
        if (!extension) {
            return;
        }

        const currentVersion = extension.packageJSON.version;
        const latestVersion = await fetchLatestVersion();

        if (!latestVersion) {
            console.log('Could not fetch latest version from marketplace');
            return;
        }

        await context.globalState.update(LAST_VERSION_CHECK_KEY, Date.now());

        if (compareVersions(latestVersion, currentVersion) > 0) {
            const answer = await vscode.window.showInformationMessage(
                `A new version of SFDocs Extension Pack is available (v${latestVersion}). Current version: v${currentVersion}`,
                'Update Now',
                'Release Notes',
                'Later'
            );

            if (answer === 'Update Now') {
                vscode.commands.executeCommand('workbench.extensions.installExtension', EXTENSION_ID);
                vscode.window.showInformationMessage(
                    'Opening extension in marketplace. Click "Update" to install the latest version.',
                    'OK'
                );
            } else if (answer === 'Release Notes') {
                vscode.env.openExternal(
                    vscode.Uri.parse(`https://marketplace.visualstudio.com/items/${EXTENSION_ID}/changelog`)
                );
            }
        } else {
            console.log(`Extension is up to date (v${currentVersion})`);
        }
    } catch (error) {
        console.error('Error checking for extension update:', error);
    }
}

/**
 * Checks if it's time to check for extension updates
 */
function shouldCheckForExtensionUpdate(context: vscode.ExtensionContext): boolean {
    const config = vscode.workspace.getConfiguration('sfdocs');
    const autoCheck = config.get<boolean>('autoCheckUpdates', true);
    
    if (!autoCheck) {
        return false;
    }

    const lastCheck = context.globalState.get<number>(LAST_VERSION_CHECK_KEY, 0);
    const now = Date.now();
    return (now - lastCheck) >= VERSION_CHECK_INTERVAL_MS;
}

/**
 * Gets the embedded .cursorrules template content
 */
function getEmbeddedTemplate(context: vscode.ExtensionContext): string | undefined {
    try {
        const templatePath = path.join(context.extensionPath, CURSORRULES_TEMPLATE);
        if (fs.existsSync(templatePath)) {
            return fs.readFileSync(templatePath, 'utf8');
        }
        return undefined;
    } catch (error) {
        console.error('Failed to read embedded template:', error);
        return undefined;
    }
}

/**
 * Checks if the current editor is Cursor (vs regular VS Code)
 */
function isCursorEditor(): boolean {
    const appName = vscode.env.appName.toLowerCase();
    const appRoot = ((vscode.env as Record<string, unknown>).appRoot as string) || '';
    
    return appName.includes('cursor') || appRoot.toLowerCase().includes('cursor');
}

/**
 * Checks if the workspace is a salesforcedocs repository (case-sensitive)
 * Uses git command to properly parse remote URLs
 * Only returns true if git is initialized AND has salesforcedocs remote
 */
async function isSalesforceDocsRepo(workspaceRoot: string): Promise<boolean> {
    try {
        const gitDir = path.join(workspaceRoot, '.git');
        
        if (!fs.existsSync(gitDir)) {
            return false;
        }
        
        const execAsync = promisify(exec);
        
        try {
            const { stdout } = await execAsync('git remote -v', { cwd: workspaceRoot });
            
            if (!stdout || stdout.trim().length === 0) {
                return false;
            }
            
            const hasSalesforceDocsRemote = stdout.split('\n').some((line: string) => {
                return line.includes('salesforcedocs/') && 
                       !line.includes('SalesforceDocs/');
            });
            
            return hasSalesforceDocsRemote;
            
        } catch (gitError) {
            return false;
        }
        
    } catch (error) {
        console.error('Failed to check git remotes:', error);
        return false;
    }
}

/**
 * Gets the workspace root path where .cursorrules should be placed
 */
function getWorkspaceRoot(): string | undefined {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        return undefined;
    }
    return workspaceFolders[0].uri.fsPath;
}

/**
 * Ensures .cursorrules is in .gitignore
 */
async function ensureGitIgnore(workspaceRoot: string): Promise<void> {
    const gitignorePath = path.join(workspaceRoot, '.gitignore');
    const cursorrulesEntry = '.cursorrules';
    
    try {
        let gitignoreContent = '';
        
        if (fs.existsSync(gitignorePath)) {
            gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
        }
        
        const lines = gitignoreContent.split('\n');
        const alreadyIgnored = lines.some(line => 
            line.trim() === cursorrulesEntry || 
            line.trim() === '/.cursorrules'
        );
        
        if (!alreadyIgnored) {
            const newContent = gitignoreContent.trim() 
                ? `${gitignoreContent.trim()}\n\n${cursorrulesEntry}\n`
                : `${cursorrulesEntry}\n`;
            
            fs.writeFileSync(gitignorePath, newContent, 'utf8');
            console.log('Added .cursorrules to .gitignore');
        }
    } catch (error) {
        console.error('Failed to update .gitignore:', error);
    }
}

/**
 * Sets up the .cursorrules file in the workspace from embedded template
 */
async function setupCursorRules(context: vscode.ExtensionContext, showNotification: boolean = true): Promise<boolean> {
    const workspaceRoot = getWorkspaceRoot();
    
    if (!workspaceRoot) {
        if (showNotification) {
            vscode.window.showWarningMessage('No workspace folder is open. Please open a folder to set up .cursorrules.');
        }
        return false;
    }

    const cursorRulesPath = path.join(workspaceRoot, CURSORRULES_FILENAME);
    
    try {
        const templateContent = getEmbeddedTemplate(context);
        
        if (!templateContent) {
            vscode.window.showErrorMessage('Failed to load .cursorrules template. The extension may not be installed correctly.');
            return false;
        }
        
        const lastVersion = context.globalState.get<string>(CONTENT_VERSION_KEY);
        
        if (fs.existsSync(cursorRulesPath)) {
            const existingContent = fs.readFileSync(cursorRulesPath, 'utf8');
            
            if (existingContent === templateContent && lastVersion === CURRENT_CONTENT_VERSION) {
                if (showNotification) {
                    vscode.window.showInformationMessage('.cursorrules is already up to date.');
                }
                return false;
            }
            
            const answer = await vscode.window.showInformationMessage(
                '.cursorrules file already exists. Do you want to update it with the latest version?',
                'Yes',
                'No',
                'View Changes'
            );
            
            if (answer === 'View Changes') {
                const tempPath = path.join(workspaceRoot, `.cursorrules.new`);
                fs.writeFileSync(tempPath, templateContent, 'utf8');
                
                const originalUri = vscode.Uri.file(cursorRulesPath);
                const newUri = vscode.Uri.file(tempPath);
                await vscode.commands.executeCommand('vscode.diff', originalUri, newUri, '.cursorrules: Current ↔ New');
                
                setTimeout(() => {
                    if (fs.existsSync(tempPath)) {
                        fs.unlinkSync(tempPath);
                    }
                }, 60000);
                
                return false;
            } else if (answer !== 'Yes') {
                return false;
            }
        }

        fs.writeFileSync(cursorRulesPath, templateContent, 'utf8');
        
        await ensureGitIgnore(workspaceRoot);
        
        await context.globalState.update(CONTENT_VERSION_KEY, CURRENT_CONTENT_VERSION);
        await context.globalState.update(LAST_SETUP_KEY, Date.now());

        if (showNotification) {
            vscode.window.showInformationMessage(
                `✓ .cursorrules file has been successfully set up in your workspace!`,
                'Open File'
            ).then((selection) => {
                if (selection === 'Open File') {
                    vscode.workspace.openTextDocument(cursorRulesPath).then((doc) => {
                        vscode.window.showTextDocument(doc);
                    });
                }
            });
        }

        return true;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Failed to set up .cursorrules: ${errorMessage}`);
        return false;
    }
}


/**
 * Checks and sets up .cursorrules if needed when workspace is opened
 */
async function checkAndSetupCursorRules(context: vscode.ExtensionContext): Promise<void> {
    if (!isCursorEditor()) {
        console.log('Not running in Cursor editor, skipping .cursorrules setup');
        return;
    }

    const workspaceRoot = getWorkspaceRoot();
    if (!workspaceRoot) {
        return;
    }

    const isSalesforceRepo = await isSalesforceDocsRepo(workspaceRoot);
    if (!isSalesforceRepo) {
        console.log('Not a salesforcedocs repository, skipping .cursorrules setup');
        return;
    }

    const cursorRulesPath = path.join(workspaceRoot, CURSORRULES_FILENAME);
    
    const config = vscode.workspace.getConfiguration('sfdocs');
    const autoSetup = config.get<boolean>('autoSetupCursorRules', false);
    
    if (!fs.existsSync(cursorRulesPath)) {
        if (autoSetup) {
            console.log('Auto-setting up .cursorrules (autoSetupCursorRules: true)');
            setTimeout(async () => {
                await setupCursorRules(context, false);
            }, 1000);
        } else {
            setTimeout(async () => {
                const answer = await vscode.window.showWarningMessage(
                    '⚠️ SFDocs Cursor AI rules are required for optimal documentation assistance. Set them up now?',
                    { modal: true },
                    'Yes, Set Up Now',
                    'Not Now',
                    'Never for this workspace'
                );
                
                if (answer === 'Yes, Set Up Now') {
                    await setupCursorRules(context, true);
                } else if (answer === 'Never for this workspace') {
                    const workspaceState = context.workspaceState;
                    await workspaceState.update('sfdocs.skipCursorRulesSetup', true);
                }
            }, 2000);
        }
    } else {
        const templateContent = getEmbeddedTemplate(context);
        if (templateContent) {
            const existingContent = fs.readFileSync(cursorRulesPath, 'utf8');
            const lastVersion = context.globalState.get<string>(CONTENT_VERSION_KEY);
            
            if (existingContent !== templateContent && lastVersion !== CURRENT_CONTENT_VERSION) {
                if (autoSetup) {
                    console.log('Auto-updating .cursorrules (autoSetupCursorRules: true)');
                    setTimeout(async () => {
                        await setupCursorRules(context, false);
                    }, 1000);
                } else {
                    setTimeout(async () => {
                        const answer = await vscode.window.showWarningMessage(
                            '⚠️ Updated SFDocs Cursor AI rules are available. Update now to get the latest improvements.',
                            { modal: true },
                            'Update Now',
                            'View Changes',
                            'Later'
                        );
                        
                        if (answer === 'Update Now') {
                            await setupCursorRules(context, true);
                        } else if (answer === 'View Changes') {
                            const tempPath = path.join(workspaceRoot, `.cursorrules.new`);
                            fs.writeFileSync(tempPath, templateContent, 'utf8');
                            
                            const originalUri = vscode.Uri.file(cursorRulesPath);
                            const newUri = vscode.Uri.file(tempPath);
                            await vscode.commands.executeCommand('vscode.diff', originalUri, newUri, '.cursorrules: Current ↔ New');
                            
                            setTimeout(() => {
                                if (fs.existsSync(tempPath)) {
                                    fs.unlinkSync(tempPath);
                                }
                            }, 60000);
                        }
                    }, 3000);
                }
            }
        }
    }
}

export function activate(context: vscode.ExtensionContext) {
    console.log('SFDocs Extension Pack is now active');
    
    if (isCursorEditor()) {
        console.log('Running in Cursor editor - Cursor AI rules management enabled');
    } else {
        console.log('Running in VS Code - Cursor AI rules management disabled');
    }

    const setupCommand = vscode.commands.registerCommand('sfdocs.setupCursorRules', async () => {
        if (!isCursorEditor()) {
            const answer = await vscode.window.showWarningMessage(
                'This feature is designed for Cursor editor. You appear to be using VS Code. Continue anyway?',
                'Yes',
                'No'
            );
            if (answer !== 'Yes') {
                return;
            }
        }
        await setupCursorRules(context, true);
    });

    const checkUpdateCommand = vscode.commands.registerCommand('sfdocs.checkForUpdates', async () => {
        vscode.window.showInformationMessage('Checking for SFDocs Extension Pack updates...');
        await checkForExtensionUpdate(context);
    });

    context.subscriptions.push(setupCommand, checkUpdateCommand);

    const skipSetup = context.workspaceState.get<boolean>('sfdocs.skipCursorRulesSetup', false);
    
    if (!skipSetup) {
        checkAndSetupCursorRules(context);
    }

    const workspaceFoldersChangeListener = vscode.workspace.onDidChangeWorkspaceFolders(() => {
        const skipSetupNow = context.workspaceState.get<boolean>('sfdocs.skipCursorRulesSetup', false);
        if (!skipSetupNow) {
            checkAndSetupCursorRules(context);
        }
    });

    context.subscriptions.push(workspaceFoldersChangeListener);

    if (shouldCheckForExtensionUpdate(context)) {
        setTimeout(() => {
            checkForExtensionUpdate(context);
        }, 5000);
    }
}

export function deactivate() {
    console.log('SFDocs Extension Pack is now deactivated');
}

