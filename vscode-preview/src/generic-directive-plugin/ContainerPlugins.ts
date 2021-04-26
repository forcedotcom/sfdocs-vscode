import * as visit from 'unist-util-visit';
import { markdownCompiler } from '../markdownCompiler';
import { Transformer } from 'unified';
import { Node } from 'hast';
import * as path from 'path';
import * as fs from 'fs';
import * as html from 'remark-html';
import { transformToVideo } from './renderers/videoRenderer';
import { calloutTransform } from './renderers/calloutRenderer';
import { VFile } from 'vfile';
import * as toHtml from 'hast-util-to-html';
import * as mdastToHast from 'mdast-util-to-hast';
import { createLogger } from '@sfdocs-internal/logger';
import vfile = require('vfile');
import h = require('hastscript');

const logger = createLogger({ label: 'generic-directive-plugin' });
// This is the process instance to locally render included file.
let processor;
function genericContainerDirective(currentFilePath) {
    return function genDirPlugin(): Transformer {
        processor = this;
        return function transformer(tree: Node, file: VFile): void {
            visit(
                tree,
                ['textDirective', 'leafDirective', 'containerDirective'],
                function (node: Node, i: any, parent: { children: any[] }) {
                    const data = node.data || (node.data = {});
                    const hast = h(node.name as any, node.attributes as any);

                    if (
                        hast.tagName &&
                        (hast.tagName === 'note' ||
                            hast.tagName === 'tip' ||
                            hast.tagName === 'warning' ||
                            hast.tagName === 'important' ||
                            hast.tagName === 'caution')
                    ) {
                        const metadata = new Map();
                        const tagName = hast.tagName;
                        metadata.set('calloutType', tagName);
                        const inputDom = toHtml(mdastToHast(node));
                        let title = 'Note';
                        if (tagName == 'tip') {
                            title = 'Tip'; // These should come from lables per L10n.
                        } else if (tagName == 'warning') {
                            title = 'Warning';
                        } else if (tagName == 'important') {
                            title = 'Important';
                        } else if (tagName == 'caution') {
                            title = 'Caution';
                        }

                        metadata.set('inputDom', inputDom);
                        metadata.set('calloutTitle', title);

                        const renderedDomInfo = calloutTransform(metadata);
                        if (renderedDomInfo && renderedDomInfo.size !== 0) {
                            const updatedDom = renderedDomInfo.get('outputDom');
                            const updatedNode = [{ type: 'html', value: updatedDom }];
                            parent.children.splice(i, 1, ...updatedNode);
                        }
                    } else if (hast.tagName === 'include' && node.attributes) {
                        const filename = path.resolve(
                            currentFilePath ? currentFilePath.split('/guides/')[0] : '',
                            'shared',
                            node.attributes['src'],
                        );
                        try {
                            if (fs.existsSync(filename)) {
                                const content = fs.readFileSync(filename);
                                const includeFile: VFile = vfile({
                                    path: filename,
                                    contents: content,
                                });
                                const root = markdownCompiler(currentFilePath).use(html).processSync(includeFile);
                                const outputDom = `<div class="include-container code-line" data-line=${node.position.start.line - 1} data-name="codeBlock">
                                        <div class="dx-text-heading-7 include-heading">${node.attributes['src']}</div>
                                            ${root.contents}
                                    </div>`;
                                const updatedNode = [{ type: 'html', value: outputDom }];
                                parent.children.splice(i, 1, ...updatedNode);
                            } else file.fail(`File not found ${path.resolve(filename)}`, node);
                        } catch (err) {
                            // Ignore catching as we are catching the error in file.fail statement above.
                            logger.error('File not found! ' + filename);
                            return true;
                        }
                    } else if (hast.tagName === 'video' && node.attributes) {

                        const sourceUrl = node.attributes['src'];
                        const title = node.attributes['title'];
                        const type = node.attributes['type'];
                        const alt = node.attributes['alt'];

                        const metadata = new Map();
                        metadata.set('sourceUrl', sourceUrl);
                        metadata.set('title', title);
                        metadata.set('type', type);
                        metadata.set('alt', alt);

                        const renderedDomInfo = transformToVideo(metadata);
                        if (renderedDomInfo && renderedDomInfo.size !== 0) {
                            const updatedDom = renderedDomInfo.get('outputDom');
                            const updatedNode = [{ type: 'html', value: updatedDom }];
                            parent.children.splice(i, 1, ...updatedNode);
                        }
                    } else {
                        logger.error(
                            `This is unimplemented directive tag ${hast.tagName} - ignored!`,
                        );
                        data.hName = hast.tagName;
                        data.hProperties = hast.properties;
                    }
                },
            );
        };
    };
}

export { genericContainerDirective};
