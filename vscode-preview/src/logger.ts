/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { lazy } from './util/lazy';

enum Trace {
	Off,
	Verbose
}

namespace Trace {
	export function fromString(value: unknown): Trace {
		if (typeof value !== 'string') {
			return Trace.Off;
		}
		value = value.toLowerCase();
		switch (value) {
			case 'off':
				return Trace.Off;
			case 'verbose':
				return Trace.Verbose;
			default:
				return Trace.Off;
		}
	}
}


function isString(value: any): value is string {
	return Object.prototype.toString.call(value) === '[object String]';
}

export class Logger {
	private trace?: Trace;

	private readonly outputChannel = lazy(() => vscode.window.createOutputChannel('SFDocs Preview'));

	constructor() {
		this.updateConfiguration();
	}

	public log(message: string, data?: any): void {
		if (this.trace === Trace.Verbose) {
			this.appendLine(`[Log - ${this.now()}] ${message}`);
			if (data) {
				this.appendLine(Logger.data2String(data));
			}
		}
	}


	private now(): string {
		const now = new Date();
		return padLeft(now.getUTCHours() + '', 2, '0')
			+ ':' + padLeft(now.getMinutes() + '', 2, '0')
			+ ':' + padLeft(now.getUTCSeconds() + '', 2, '0') + '.' + now.getMilliseconds();
	}

	public updateConfiguration() {
		this.trace = this.readTrace();
	}

	private appendLine(value: string) {
		return this.outputChannel.value.appendLine(value);
	}

	private readTrace(): Trace {
		const config = vscode.workspace.getConfiguration();
		// Prefer SFDocs.trace, then markdown.trace. Only accept real strings: workspace/user
		// settings can store the wrong type, and `a ?? b` keeps a non-nullish non-string.
		for (const key of ['SFDocs.trace', 'markdown.trace'] as const) {
			const v = config.get(key);
			if (typeof v === 'string') {
				return Trace.fromString(v);
			}
		}
		return Trace.Off;
	}

	private static data2String(data: any): string {
		if (data instanceof Error) {
			if (isString(data.stack)) {
				return data.stack;
			}
			return (data as Error).message;
		}
		if (isString(data)) {
			return data;
		}
		return JSON.stringify(data, undefined, 2);
	}
}

function padLeft(s: string, n: number, pad = ' ') {
	return pad.repeat(Math.max(0, n - s.length)) + s;
}
