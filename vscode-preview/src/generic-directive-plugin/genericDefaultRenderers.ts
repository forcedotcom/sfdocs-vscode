import renderCallout from './renderers/calloutRenderer';
import renderVideo from './renderers/videoRenderer';
import renderInclude from './renderers/includeRenderer';

/**
 * These are default rendering functions which will be used in tandem with the lwr based themes.
 * These are mainly focused with apihub for now - uses dx/doc components and lwc.
 * Add any new function as per the needs.
 */
export default function genericRenderFunctions() {
    return {
        renderCallout,
        renderVideo,
        renderInclude,
    };
}
