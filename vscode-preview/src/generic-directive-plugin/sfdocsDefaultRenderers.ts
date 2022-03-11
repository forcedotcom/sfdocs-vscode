import renderCodeBlock from './renderers/codeBlockRenderer';
import renderVideo from './renderers/videoPreviewRenderer';
import renderBanner from './renderers/bannerRenderer';
import renderCallout from './renderers/calloutRenderer';
import renderSampleCodeContent from './renderers/sampleCodeContent';
import type { RenderFunction } from '@sfdocs-internal/types';

/**
 * These are default rendering functions which will be used in tandem with the lwr based themes.
 * These are mainly focused with apihub for now - uses dx/doc components and lwc.
 * Add any new function as per the needs.
 */
export default function sfdocsRenderFunctions(): { [key: string]: RenderFunction } {
    return {
        renderVideo,
        renderBanner,
        renderCodeBlock,
        renderCallout,
        renderSampleCodeContent
    };
}
