/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import * as arrays from './util/arrays';
import { Disposable } from './util/dispose';

const resolveExtensionResource = (extension: vscode.Extension<any>, resourcePath: string): vscode.Uri => {
	return vscode.Uri.joinPath(extension.extensionUri, resourcePath);
};

const resolveExtensionResources = (extension: vscode.Extension<any>, resourcePaths: unknown): vscode.Uri[] => {
	const result: vscode.Uri[] = [];
	if (Array.isArray(resourcePaths)) {
		for (const resource of resourcePaths) {
			try {
				result.push(resolveExtensionResource(extension, resource));
			} catch (e) {
				// noop
			}
		}
	}
	return result;
};

export interface MarkdownContributions {
	readonly previewScripts: ReadonlyArray<vscode.Uri>;
	readonly previewStyles: ReadonlyArray<vscode.Uri>;
	readonly previewResourceRoots: ReadonlyArray<vscode.Uri>;
}

export namespace MarkdownContributions {
	export const Empty: MarkdownContributions = {
		previewScripts: [],
		previewStyles: [],
		previewResourceRoots: []
	};

	export function merge(a: MarkdownContributions, b: MarkdownContributions): MarkdownContributions {
		return {
			previewScripts: [...a.previewScripts, ...b.previewScripts],
			previewStyles: [...a.previewStyles, ...b.previewStyles],
			previewResourceRoots: [...a.previewResourceRoots, ...b.previewResourceRoots]
		};
	}

	function uriEqual(a: vscode.Uri, b: vscode.Uri): boolean {
		return a.toString() === b.toString();
	}

	export function equal(a: MarkdownContributions, b: MarkdownContributions): boolean {
		return arrays.equals(a.previewScripts, b.previewScripts, uriEqual)
			&& arrays.equals(a.previewStyles, b.previewStyles, uriEqual)
			&& arrays.equals(a.previewResourceRoots, b.previewResourceRoots, uriEqual);
	}

	export function fromExtension(
		extension: vscode.Extension<any>
	): MarkdownContributions {
		const contributions = extension.packageJSON && extension.packageJSON.contributes;
		if (!contributions) {
			return MarkdownContributions.Empty;
		}

		const previewStyles = getContributedStyles(contributions, extension);
		const previewScripts = getContributedScripts(contributions, extension);
		const previewResourceRoots = previewStyles.length || previewScripts.length ? [extension.extensionUri] : [];

		return {
			previewScripts,
			previewStyles,
			previewResourceRoots
		};
	}

	function getContributedScripts(
		contributes: any,
		extension: vscode.Extension<any>
	) {
		return resolveExtensionResources(extension, contributes['salesforcedocs.previewScripts']);
	}

	function getContributedStyles(
		contributes: any,
		extension: vscode.Extension<any>
	) {
		const config = vscode.workspace.getConfiguration('salesforcedocs');
		const stylePreset = config.get<string>('preview.style.preset', 'SalesforceDocs');
		switch (stylePreset) {
			case 'SalesforceDocs':
				return resolveExtensionResources(extension, contributes['salesforcedocs.previewStyles']);
			default:
				return resolveExtensionResources(extension, contributes['markdown.default.previewStyles']);
		}
	}
}

export interface MarkdownContributionProvider {
	readonly extensionUri: vscode.Uri;

	readonly contributions: MarkdownContributions;
	readonly onContributionsChanged: vscode.Event<this>;

	dispose(): void;
}

class VSCodeExtensionMarkdownContributionProvider extends Disposable implements MarkdownContributionProvider {
	private _contributions?: MarkdownContributions;

	public constructor(
		private readonly _extensionContext: vscode.ExtensionContext,
	) {
		super();

		vscode.workspace.onDidChangeConfiguration(event => {
			let affected = event.affectsConfiguration("salesforcedocs.preview.style.preset");
			if (affected) {
				this.updateContributions();
			}
		})

		vscode.extensions.onDidChange(() => {
			this.updateContributions();
		}, undefined, this._disposables);
	}

	private updateContributions() {
		const currentContributions = this.getCurrentContributions();
		const existingContributions = this._contributions || MarkdownContributions.Empty;
		if (!MarkdownContributions.equal(existingContributions, currentContributions)) {
			this._contributions = currentContributions;
			this._onContributionsChanged.fire(this);
		}
	}

	public get extensionUri() { return this._extensionContext.extensionUri; }

	private readonly _onContributionsChanged = this._register(new vscode.EventEmitter<this>());
	public readonly onContributionsChanged = this._onContributionsChanged.event;

	public get contributions(): MarkdownContributions {
		if (!this._contributions) {
			this._contributions = this.getCurrentContributions();
		}
		return this._contributions;
	}

	private getCurrentContributions(): MarkdownContributions {
		return vscode.extensions.all
			.map(MarkdownContributions.fromExtension)
			.reduce(MarkdownContributions.merge, MarkdownContributions.Empty);
	}
}

export function getMarkdownExtensionContributions(context: vscode.ExtensionContext): MarkdownContributionProvider {
	return new VSCodeExtensionMarkdownContributionProvider(context);
}
