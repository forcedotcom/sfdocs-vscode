/**
 * This renderer is useful to convert 
 * 
    ## Anchor Component
    to
     <h2 id="AnchorComponent">Anchor Component</doc-heading>
 * 
 * @param metadata Contains all the information need to create a new DOM
 */

export default function transform(metadata: Map<string, string>): Map<string, string> {
    if (!metadata || !metadata.size) return null;
    const headingTitle = metadata.get('title');
    const { slug } = JSON.parse(metadata.get('sluggifyNode'));
    const domResponse = new Map<string, string>();
    const outputDom = `<h2 id="${slug}">${headingTitle}</h2>`;
    domResponse.set('outputDom', outputDom);
    return domResponse;
}
