import { markdownCompiler } from './markdownCompiler';
import * as vscode from 'vscode';
import * as path from 'path';
import * as u from 'unist-builder';
import * as html from 'remark-html';
import * as parse from 'remark-parse';
import * as visit from 'unist-util-visit';
import * as unified from 'unified';
import * as normalize from 'mdurl/encode';
import * as vfile from 'vfile';
import { VFile } from 'vfile';
import { SkinnyTextDocument } from './tableOfContentsProvider';
import { hash } from './util/hash';
import { all, wrap, listLoose, listItemLoose } from './util/mdast-util';

const UNICODE_NEWLINE_REGEX = /\u2028|\u2029/g;

class Token {
	private content: string;
	private startLine: number;
	private endLine: number;
	private type: string;
	private depth: number;

	public constructor(type, content, startLine, endLine, depth) {
		this.content = content;
		this.type = type;
		this.startLine = startLine;
		this.endLine = endLine;
		this.depth = depth;
	}

	public getContent() {
		return this.content;
	}

	public getStartLine() {
		return this.startLine;
	}

	public getEndLine() {
		return this.endLine;
	}

	public getType() {
		return this.type;
	}

	public getDepth() {
		return this.depth;
	}
}

class TokenCache {
	private cachedDocument?: {
		readonly uri: vscode.Uri;
		readonly version: number;
	};
	private tokens?: any;

	public tryGetCached(document: SkinnyTextDocument): any | undefined {
		if (this.cachedDocument
			&& this.cachedDocument.uri.toString() === document.uri.toString()
			&& this.cachedDocument.version === document.version
		) {
			return this.tokens;
		}
		return undefined;
	}

	public update(document: SkinnyTextDocument, tokens: any) {
		this.cachedDocument = {
			uri: document.uri,
			version: document.version
		};
		this.tokens = tokens;
	}

	public clean(): void {
		this.cachedDocument = undefined;
		this.tokens = undefined;
	}
}

export class MarkdownEngine {
	private md?: any;
	private _tokenCache = new TokenCache();

	private commonHandler: any = {
		heading: this.headerHandler,
		paragraph: this.paragraphHandler,
		blockquote: this.blockquoteHandler,
		listItem: this.listItemHandler,
		code: this.codeHandler,
		link: this.linkHandler,
		image: this.imageHandler
	}

	private async getEngine(): Promise<any> {
		if (!this.md) {
			this.md = markdownCompiler()
				.use(html, { handlers: this.commonHandler });
		}

		const md = await this.md!;
		return md;
	}

	private async tokenizeDocument(
		document: SkinnyTextDocument
	): Promise<any> {
		const cached = this._tokenCache.tryGetCached(document);
		if (cached) {
			return cached;
		}

		const tokens = await unified()
			.use(parse)
			.parse(document.getText());

		this._tokenCache.update(document, tokens);
		return tokens;
	}

	public async render(input: any | string): Promise<string> {
		const engine = await this.getEngine();

		const tokens = typeof input === 'string'
			? input
			: input.getText();
		const file: VFile = vfile({
			dirname: path.dirname(input.fileName),
			path: input.fileName,
			contents: tokens.replace(UNICODE_NEWLINE_REGEX, ''),
		});
		const prossesedDoc = await engine.process(file);
		return prossesedDoc.contents;
	}

	public async parse(document: SkinnyTextDocument, node?: string): Promise<Token[]> {
		const tree = await this.tokenizeDocument(document);
		const tokenList = [];
		if (node) {
			visit(tree, node, function (node: any) {
				let content = node.children[0].value;
				let start = node.position.start.line;
				let end = node.position.end.line;
				let depth = node.depth;
				tokenList.push(new Token(node.type, content, start, end, depth));
			});
		}
		return tokenList;
	}

	public cleanCache(): void {
		this._tokenCache.clean();
	}

	private blockquoteHandler(h: any, node: any) {
		if (node.data) {
			node.data.hProperties = { className: ['code-line'], dataLine: node.position.start.line - 1 }
		} else {
			node.data = {
				hProperties: { className: ['code-line'], dataLine: node.position.start.line - 1 }
			}
		};
		return h(node, 'blockquote', wrap(all(h, node), true));
	};

	private paragraphHandler(h: any, node: any) {
		if (node.data) {
			node.data.hProperties = { className: ['code-line'], dataLine: node.position.start.line - 1 }
		} else {
			node.data = {
				hProperties: { className: ['code-line'], dataLine: node.position.start.line - 1 }
			}
		};
		return h(node, 'p', all(h, node));
	};

	private listItemHandler(h: any, node: any, parent) {
		if (node.data) {
			node.data.hProperties = { className: ['code-line'], dataLine: node.position.start.line - 1 }
		} else {
			node.data = {
				hProperties: { className: ['code-line'], dataLine: node.position.start.line - 1 }
			}
		};
		var result = all(h, node)
		var head = result[0]
		var loose = parent ? listLoose(parent) : listItemLoose(node)
		var props: any = {}
		var wrapped = []
		var length
		var index
		var child

		if (typeof node.checked === 'boolean') {
			if (!head || head.tagName !== 'p') {
				head = h(null, 'p', [])
				result.unshift(head)
			}

			if (head.children.length !== 0) {
				head.children.unshift(u('text', ' '))
			}

			head.children.unshift(
				h(null, 'input', {
					type: 'checkbox',
					checked: node.checked,
					disabled: true
				})
			)

			// According to github-markdown-css, this class hides bullet.
			// See: <https://github.com/sindresorhus/github-markdown-css>.
			props.className = ['task-list-item', 'code-line']
		}

		length = result.length
		index = -1

		while (++index < length) {
			child = result[index]

			// Add eols before nodes, except if this is a loose, first paragraph.
			if (loose || index !== 0 || child.tagName !== 'p') {
				wrapped.push(u('text', '\n'))
			}

			if (child.tagName === 'p' && !loose) {
				wrapped = wrapped.concat(child.children)
			} else {
				wrapped.push(child)
			}
		}

		// Add a final eol.
		if (length && (loose || child.tagName !== 'p')) {
			wrapped.push(u('text', '\n'))
		}

		return h(node, 'li', props, wrapped)

	};

	private codeHandler(h: any, node: any) {
		var value = node.value ? node.value + '\n' : ''
		var lang = node.lang && node.lang.match(/^[^ \t]+(?=[ \t]|$)/)
		var props: any = {};
		if (node.data) {
			node.data.hProperties = {
				className: ['code-line', lang ? 'language-' + lang : ''], dataLine: node.position.start.line - 1
			}
		} else {
			node.data = {
				hProperties: { className: ['code-line', lang ? 'language-' + lang : ''], dataLine: node.position.start.line - 1 }
			}
		};
		return h(node.position, 'pre', [h(node, 'code', props, value)])
	};


	private linkHandler(h: any, node: any) {
		var props: any = { href: normalize(node.url), 'data-href': normalize(node.url) }

		if (node.title !== null && node.title !== undefined) {
			props.title = node.title;

			if (node.data) {
				node.data.hProperties = { className: ['code-line'], dataLine: node.position.start.line - 1, dataHref: props.href }
			} else {
				node.data = { hProperties: { className: ['code-line'], dataLine: node.position.start.line - 1, dataHref: props.href } }
			};
		}

		/**if (node.url.match(/\.(jpeg|jpg|gif|png)$/) != null) {

		}*/

		return h(node, 'a', props, all(h, node))
	};

	private headerHandler(h: any, node: any) {
		let title = node.children.reduce((acc: string, t: any) => acc + t.value, '');
		title = title + '-' + node.position.start.line
		let id = encodeURI(title.trim()
			.toLowerCase()
			.replace(/\s+/g, '-') // Replace whitespace with -
			.replace(/[\]\[\!\'\#\$\%\&\(\)\*\+\,\.\/\:\;\<\=\>\?\@\\\^\_\{\|\}\~\`。，、；：？！…—·ˉ¨‘’“”々～‖∶＂＇｀｜〃〔〕〈〉《》「」『』．〖〗【】（）［］｛｝]/g, '') // Remove known punctuators
			.replace(/^\-+/, '') // Remove leading -
			.replace(/\-+$/, '') // Remove trailing -
		);
		if (node.data) {
			node.data.hProperties = { id: id, className: ['code-line'], dataLine: node.position.start.line - 1 }
		} else {
			node.data = { hProperties: { id: id, className: ['code-line'], dataLine: node.position.start.line - 1 } }
		};
		return h(node, 'h' + node.depth, all(h, node));
	};

	private imageHandler(h: any, node: any) {
		var props: any = { href: normalize(node.url) }

		if (node.url !== null && node.url !== undefined) {
			props.title = node.title;
			const imgHash = hash(node.url);
			let hProperties = {
				id: `image-hash-${imgHash}`,
				dataLine: node.position.start.line,
				dataHref: props.href,
				src: props.href
			};
			if (node.data?.hProperties) {
				hProperties = { ...hProperties, ...node.data.hProperties }
			}
			if (node.data) {
				node.data.hProperties = hProperties;
			} else {
				node.data = {
					hProperties: hProperties,
				}
			}
		}

		return h(node, 'img', props)
	}
}