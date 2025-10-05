import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as https from 'https';

const CURSORRULES_FILENAME = '.cursorrules';
const CURSORRULES_TEMPLATE = 'cursorrules-template.txt';
const LAST_SETUP_KEY = 'sfdocs.cursorrules.lastSetup';
const CONTENT_VERSION_KEY = 'sfdocs.cursorrules.contentVersion';
const CURRENT_CONTENT_VERSION = '1.0.0'; // Increment this when template content changes
const LAST_VERSION_CHECK_KEY = 'sfdocs.extension.lastVersionCheck';
const VERSION_CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
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
                'Accept': 'application/json',
                'User-Agent': 'VSCode-Extension'
            }
        };

        https.get(options, (response) => {
            let data = '';
            
            response.on('data', (chunk) => {
                data += chunk;
            });
            
            response.on('end', () => {
                try {
                    // Try to extract version from the marketplace page
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

        // Update last check time
        await context.globalState.update(LAST_VERSION_CHECK_KEY, Date.now());

        if (compareVersions(latestVersion, currentVersion) > 0) {
            const answer = await vscode.window.showInformationMessage(
                `A new version of SFDocs Extension Pack is available (v${latestVersion}). Current version: v${currentVersion}`,
                'Update Now',
                'Release Notes',
                'Later'
            );

            if (answer === 'Update Now') {
                // Open the extension in marketplace for update
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
 * Calculate a simple hash of the content for change detection
 */
function simpleHash(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
}

/**
 * Gets the workspace root path where .cursorrules should be placed
 */
function getWorkspaceRoot(): string | undefined {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        return undefined;
    }
    // Use the first workspace folder
    return workspaceFolders[0].uri.fsPath;
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
        // Get the embedded template content
        const templateContent = getEmbeddedTemplate(context);
        
        if (!templateContent) {
            vscode.window.showErrorMessage('Failed to load .cursorrules template. The extension may not be installed correctly.');
            return false;
        }
        
        const lastVersion = context.globalState.get<string>(CONTENT_VERSION_KEY);
        
        // Check if file exists
        if (fs.existsSync(cursorRulesPath)) {
            const existingContent = fs.readFileSync(cursorRulesPath, 'utf8');
            
            // Check if content is identical
            if (existingContent === templateContent && lastVersion === CURRENT_CONTENT_VERSION) {
                if (showNotification) {
                    vscode.window.showInformationMessage('.cursorrules is already up to date.');
                }
                return false;
            }
            
            // Ask user if they want to update
            const answer = await vscode.window.showInformationMessage(
                '.cursorrules file already exists. Do you want to update it with the latest version?',
                'Yes',
                'No',
                'View Changes'
            );
            
            if (answer === 'View Changes') {
                // Create a temp file with new content for comparison
                const tempPath = path.join(workspaceRoot, `.cursorrules.new`);
                fs.writeFileSync(tempPath, templateContent, 'utf8');
                
                // Open diff view
                const originalUri = vscode.Uri.file(cursorRulesPath);
                const newUri = vscode.Uri.file(tempPath);
                await vscode.commands.executeCommand('vscode.diff', originalUri, newUri, '.cursorrules: Current ↔ New');
                
                // Clean up temp file after a delay
                setTimeout(() => {
                    if (fs.existsSync(tempPath)) {
                        fs.unlinkSync(tempPath);
                    }
                }, 60000); // 1 minute
                
                return false;
            } else if (answer !== 'Yes') {
                return false;
            }
        }

        // Write the file
        fs.writeFileSync(cursorRulesPath, templateContent, 'utf8');
        
        // Update version and setup time
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


export function activate(context: vscode.ExtensionContext) {
    console.log('SFDocs Extension Pack is now active');

    // Register command to set up .cursorrules
    const setupCommand = vscode.commands.registerCommand('sfdocs.setupCursorRules', async () => {
        await setupCursorRules(context, true);
    });

    // Register command to manually check for extension updates
    const checkUpdateCommand = vscode.commands.registerCommand('sfdocs.checkForUpdates', async () => {
        vscode.window.showInformationMessage('Checking for SFDocs Extension Pack updates...');
        await checkForExtensionUpdate(context);
    });

    context.subscriptions.push(setupCommand, checkUpdateCommand);

    // Auto-setup on first workspace open (only if file doesn't exist)
    const workspaceRoot = getWorkspaceRoot();
    if (workspaceRoot) {
        const cursorRulesPath = path.join(workspaceRoot, CURSORRULES_FILENAME);
        const lastSetup = context.globalState.get<number>(LAST_SETUP_KEY, 0);
        
        // If file doesn't exist and we haven't set up before, offer to set up
        if (!fs.existsSync(cursorRulesPath) && lastSetup === 0) {
            setTimeout(async () => {
                const answer = await vscode.window.showInformationMessage(
                    'Would you like to set up SFDocs Cursor AI rules for this workspace?',
                    'Yes',
                    'Not Now'
                );
                
                if (answer === 'Yes') {
                    await setupCursorRules(context, true);
                }
            }, 2000); // 2 seconds delay after activation
        }
    }

    // Check for extension updates (in background)
    if (shouldCheckForExtensionUpdate(context)) {
        setTimeout(() => {
            checkForExtensionUpdate(context);
        }, 5000); // 5 seconds delay after activation
    }
}

export function deactivate() {
    console.log('SFDocs Extension Pack is now deactivated');
}

