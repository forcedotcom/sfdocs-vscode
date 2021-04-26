import * as remark from 'remark';
import {
    internalReferencePlugin,
    remark_directive,
} from '@sfdocs-internal/generic-directive-plugin';
import * as remarkGfm from 'remark-gfm';
import * as remarkFrontmatter from 'remark-frontmatter';
import admonitions from 'remark-admonitions';
import { genericContainerDirective } from './generic-directive-plugin/ContainerPlugins';
import { sfdocsCustomPlugin } from './generic-directive-plugin/sfdocsPlugins';
import * as highlight from 'remark-highlight.js';

export function markdownCompiler(currentFilePath: string) {

	const sfdocsPlugin = sfdocsCustomPlugin(currentFilePath);
    return remark()
            .use(remarkGfm)
            .use(remarkFrontmatter, { type: 'yaml', marker: '-' } as any)
            .use(sfdocsPlugin)
            .use(internalReferencePlugin({}))
            .use(highlight)
            .use(remark_directive)
            .use(admonitions)
            .use(genericContainerDirective(currentFilePath));
}