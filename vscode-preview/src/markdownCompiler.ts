import * as remark from 'remark';
import * as remark_directive from 'remark-directive';
import includePlugin from '@salesforcedevs/sfdocs-remark-include-plugin';
import videoPlugin from '@salesforcedevs/sfdocs-remark-video-plugin';
import internalReferencePlugin from '@salesforcedevs/sfdocs-remark-internal-reference-plugin';
import imageTransformerPlugin from '@salesforcedevs/sfdocs-image-transformer';
import sfdocsHeadingPlugin from '@salesforcedevs/sfdocs-remark-heading-plugin';
import sfdocsCodeBlockPlugin from '@salesforcedevs/sfdocs-remark-code-block-plugin';
import { defListPlugin } from '@salesforcedevs/sfdocs-remark-definition-list-plugin';
import * as remarkGfm from 'remark-gfm';
import * as remarkFrontmatter from 'remark-frontmatter';
import * as highlight from 'remark-highlight.js';
import renderCodeBlock from './generic-directive-plugin/renderers/codeBlockRenderer';
import renderCallout from './generic-directive-plugin/renderers/calloutRenderer';
import renderHeading from './generic-directive-plugin/renderers/anchorHeadingRenderer';
import renderSampleCodeContent from './generic-directive-plugin/renderers/sampleCodeContent';
import renderInclude from './generic-directive-plugin/renderers/includeRenderer';
import renderVideo from './generic-directive-plugin/renderers/videoRenderer';
import calloutPlugin from '@salesforcedevs/sfdocs-remark-callout-plugin';

export function markdownCompiler() {

    const includeDirPlugin = includePlugin({ renderInclude });
    return remark()
        .use(remarkGfm)
        .use(remarkFrontmatter, { type: 'yaml', marker: '-' } as any)
        .use(remark_directive)
        .use(includeDirPlugin)
        .use(internalReferencePlugin({}))
        .use(imageTransformerPlugin)
        .use(videoPlugin, { renderVideo })
        .use(defListPlugin)
        .use(sfdocsHeadingPlugin, { renderHeading })
        .use(sfdocsCodeBlockPlugin, { renderCodeBlock, renderSampleCodeContent })
        .use(calloutPlugin, { renderCallout })
        .use(highlight);
}

