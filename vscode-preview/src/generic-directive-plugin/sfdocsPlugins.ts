import { Transformer } from 'unified';
import * as visit from 'unist-util-visit';
import defaultRenderers from './defaultRenderers';
import { VFile } from 'vfile';
import * as fetch from 'sync-fetch';
import * as path from 'path';
import * as fs from 'fs';
// FYI - All remark plugins
//https://github.com/remarkjs/remark/blob/HEAD/doc/plugins.md#list-of-plugins

import { parse } from 'node-html-parser';

const escapeHTML = (str: string): string =>
    str.replace(
        /[&<>'"]/g,
        (tag) =>
            ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;',
            }[tag]),
    );

function fetchFile(metadata: any, currentFilePath: string) {
    if (metadata.src && metadata.src.indexOf('http') > -1) {
        try {
            const htmlContent = fetch(metadata.src, {});
            if (htmlContent && htmlContent.status == '200') {
                return htmlContent.text();
            }
            return undefined;
        } catch (error) {
            //console.log(error);
        }
    } else {
        // assume it to be internal file from samples folder.
        try {
            const codeFilePath = path.resolve(currentFilePath ? path.dirname(currentFilePath) : '', metadata.src);
            const codeContent = fs.readFileSync(codeFilePath, 'utf8');
            return codeContent;
        } catch (error) {
            //console.log(error);
        }
    }
}

export function sfdocsCustomPlugin(currentFilePath: string) {
    return function sfdocsPlugin(): Transformer {
        return function transformer(tree: any, file: VFile): void {
            visit(tree, ['code'], function (node: any) {
                const domElement = parse(node.value);
                const renderFunctions = defaultRenderers();
                if (node.lang !== 'sfdocs' && node.lang !== 'sfdocs-code') {
                    const meta = JSON.parse(node.meta);
                    const renderCodeBlockFn = renderFunctions['renderCodeBlock'];
                    if (renderFunctions && renderCodeBlockFn) {
                        const metadata = new Map();
                        metadata.set('urlEncodedText', escapeHTML(domElement.innerHTML));
                        metadata.set(
                            'lang',
                            meta && meta['lang'] && node.lang ? node.lang && meta['lang'] : 'text',
                        );
                        metadata.set('title', meta && meta['title'] ? meta['title'] : '');
                        metadata.set('src', meta && meta['src'] ? meta['src'] : '');
                        const renderedDomInfo = renderCodeBlockFn(metadata);
                        if (renderedDomInfo && renderedDomInfo.size !== 0) {
                            node.type = renderedDomInfo.get('nodeType');
                            node.value = renderedDomInfo.get('updatedDom');
                            node.lang = renderedDomInfo.get('nodeLang');
                        }
                    }
                    return;
                }
                if (!renderFunctions) {
                    return;
                }
                if (node.lang === 'sfdocs') {
                    if (domElement.firstChild && domElement.firstChild['tagName'] === 'VIDEO') {
                        if (domElement.firstChild['attributes']) {
                            const sourceUrl = domElement.firstChild['attributes'].src;
                            const title = domElement.firstChild['attributes'].title;
                            const renderVideoFn = renderFunctions['renderVideo'];
                            if (renderVideoFn) {
                                const metadata = new Map();
                                metadata.set('sourceUrl', sourceUrl);
                                metadata.set('title', title);
                                const renderedDomInfo = renderVideoFn(metadata);
                                if (renderedDomInfo && renderedDomInfo.size !== 0) {
                                    node.type = renderedDomInfo.get('nodeType');
                                    node.value = renderedDomInfo.get('updatedDom');
                                }
                            }
                        }
                    } else if (
                        domElement.firstChild &&
                        domElement.firstChild['tagName'] === 'BANNER'
                    ) {
                        if (domElement.firstChild['attributes']) {
                            const imageUrl = domElement.firstChild['attributes'].img;
                            const title = domElement.firstChild['attributes'].title;
                            const renderBannerFn = renderFunctions['renderBanner'];
                            if (renderBannerFn) {
                                const metadata = new Map();
                                metadata.set('imageUrl', imageUrl);
                                metadata.set('title', title);
                                const renderedDomInfo = renderBannerFn(metadata);
                                if (renderedDomInfo && renderedDomInfo.size !== 0) {
                                    node.type = renderedDomInfo.get('nodeType');
                                    node.value = renderedDomInfo.get('updatedDom');
                                }
                            }
                        }
                    }
                } else if (node.lang === 'sfdocs-code' && !domElement.firstChild) {
                    const meta = JSON.parse(node.meta);
                    const renderCodeBlockFn = renderFunctions['renderCodeBlock'];
                    if (renderFunctions && renderCodeBlockFn) {
                        if (meta) {
                            const codeContent = fetchFile(meta, currentFilePath);
                            if (codeContent) {
                                const metadata = new Map();
                                metadata.set('urlEncodedText', escapeHTML(codeContent));
                                metadata.set('lang', meta && meta['lang'] ? meta['lang'] : 'text');
                                metadata.set('title', meta && meta['title'] ? meta['title'] : '');
                                metadata.set('src', meta && meta['src'] ? meta['src'] : '');

                                const renderedDomInfo = renderCodeBlockFn(metadata);
                                if (renderedDomInfo && renderedDomInfo.size !== 0) {
                                    node.type = renderedDomInfo.get('nodeType');
                                    (node.value = renderedDomInfo.get('updatedDom')),
                                        (node.lang = renderedDomInfo.get('nodeLang'));
                                }
                            } else {
                                node.type = 'html';
                                file.message(`Mentioned  'src' file not available`, node);
                            }
                        }
                    }
                } else if (node.lang === 'sfdocs-code' && domElement.firstChild) {
                    const meta = JSON.parse(node.meta);
                    const renderCodeBlockFn = renderFunctions['renderCodeBlock'];
                    if (renderFunctions && renderCodeBlockFn && domElement.text) {
                        const metadata = new Map();
                        metadata.set('urlEncodedText', escapeHTML(domElement.innerHTML));
                        metadata.set('lang', meta && meta['lang'] ? meta['lang'] : 'text');
                        metadata.set('title', meta && meta['title'] ? meta['title'] : '');
                        metadata.set('src', meta && meta['src'] ? meta['src'] : '');

                        const renderedDomInfo = renderCodeBlockFn(metadata);
                        if (renderedDomInfo && renderedDomInfo.size !== 0) {
                            node.type = renderedDomInfo.get('nodeType');
                            node.value = renderedDomInfo.get('updatedDom');
                            node.lang = renderedDomInfo.get('nodeLang');
                        }
                    }
                }
            });
        };
    };
}
