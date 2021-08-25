/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { CommandManager } from './commandManager';
import * as commands from './commands/index';
import LinkProvider from './features/documentLinkProvider';
import { MarkdownContentProvider } from './features/previewContentProvider';
import { MarkdownPreviewManager } from './features/previewManager';
import { Logger } from './logger';
import { MarkdownEngine } from './markdownEngine';
import { getMarkdownExtensionContributions } from './markdownExtensions';
import { ContentSecurityPolicyArbiter, ExtensionContentSecurityPolicyArbiter, PreviewSecuritySelector } from './security';
import { telemetryService } from './telemetry';

function registerMarkdownLanguageFeatures(
): vscode.Disposable {
	const selector: vscode.DocumentSelector = { language: 'markdown', scheme: '*' };

	const charPattern = '(\\p{Alphabetic}|\\p{Number}|\\p{Nonspacing_Mark})';

	return vscode.Disposable.from(
		vscode.languages.setLanguageConfiguration('markdown', {
			wordPattern: new RegExp(`${charPattern}((${charPattern}|[_])?${charPattern})*`, 'ug'),
		}),
		vscode.languages.registerDocumentLinkProvider(selector, new LinkProvider()),
	);
}

function registerMarkdownCommands(
	previewManager: MarkdownPreviewManager,
	cspArbiter: ContentSecurityPolicyArbiter,
	engine: MarkdownEngine
): vscode.Disposable {
	const previewSecuritySelector = new PreviewSecuritySelector(cspArbiter, previewManager);

	const commandManager = new CommandManager();
	commandManager.register(new commands.ShowPreviewCommand(previewManager));
	commandManager.register(new commands.ShowPreviewToSideCommand(previewManager));
	commandManager.register(new commands.ShowLockedPreviewToSideCommand(previewManager));
	commandManager.register(new commands.ShowSourceCommand(previewManager));
	commandManager.register(new commands.RefreshPreviewCommand(previewManager, engine));
	commandManager.register(new commands.MoveCursorToPositionCommand());
	commandManager.register(new commands.ShowPreviewSecuritySelectorCommand(previewSecuritySelector, previewManager));
	commandManager.register(new commands.OpenDocumentLinkCommand(engine));
	commandManager.register(new commands.ToggleLockCommand(previewManager));
	return commandManager;
}

export async function activate(context: vscode.ExtensionContext) {
	const extensionHRStart = process.hrtime();
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { name, aiKey, version } = require(context.asAbsolutePath(
    './package.json'
  ));
  const machineId = vscode.env ? vscode.env.machineId : 'someValue.machineId';
  await telemetryService.initializeService(context, name, aiKey, version,machineId);
	vscode.commands.executeCommand('setContext', 'markdownPreviewFocus', false);

	const contributions = getMarkdownExtensionContributions(context);
	context.subscriptions.push(contributions);

	const cspArbiter = new ExtensionContentSecurityPolicyArbiter(context.globalState, context.workspaceState);
	const engine = new MarkdownEngine();
	const logger = new Logger();

	const contentProvider = new MarkdownContentProvider(engine, cspArbiter, contributions, logger);
	const previewManager = new MarkdownPreviewManager(contentProvider, logger, contributions, engine);
	context.subscriptions.push(previewManager);

	context.subscriptions.push(registerMarkdownLanguageFeatures());
	context.subscriptions.push(registerMarkdownCommands(previewManager, cspArbiter, engine));

	context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(() => {
		logger.updateConfiguration();
		previewManager.updateConfiguration();
	}));
	telemetryService.sendExtensionActivationEvent(extensionHRStart);
}

export function deactivate(): void {
	// Send metric data.
	telemetryService.sendExtensionDeactivationEvent();
	telemetryService.dispose();
  }

