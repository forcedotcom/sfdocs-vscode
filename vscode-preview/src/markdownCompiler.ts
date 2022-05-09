import * as remark from 'remark';
import {
    genericDirective,
    internalReferencePlugin,
    remark_directive,
} from '@sfdocs-internal/generic-directive-plugin';
import { sfdocsCustomPlugin } from '@sfdocs-internal/sfdocs-directive-plugin';
import { defListPlugin } from '@sfdocs-internal/definition-list-plugin';
import * as remarkGfm from 'remark-gfm';
import * as remarkFrontmatter from 'remark-frontmatter';
import * as highlight from 'remark-highlight.js';
import sfdocsRenderFunctions from './generic-directive-plugin/sfdocsDefaultRenderers';
import genericRenderFunctions from './generic-directive-plugin/genericDefaultRenderers';

export function markdownCompiler() {

	const sfdocsPlugin = sfdocsCustomPlugin(sfdocsRenderFunctions());
    const genericPlugin = genericDirective(genericRenderFunctions());
    const definitionListPlugin = defListPlugin();
    return remark()
            .use(remarkGfm)
            .use(remarkFrontmatter, { type: 'yaml', marker: '-' } as any)
            .use(internalReferencePlugin({}))
            .use(remark_directive)
            .use(genericPlugin)
            .use(sfdocsPlugin)
            .use(definitionListPlugin)
            .use(highlight);
}

