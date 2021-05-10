/**
 * Converts ::include {src="test_file.md"}
 * 
 * to
 * 
 * <div class="include-container code-line" data-line="2" data-name="includeBlock">
 *      <div class="dx-text-heading-7 include-heading">test_include.md</div>
 *      <h2>Include file</h2>
 *      <p>shared content</p>
 * s</div>`,
        
 * @param metadata 
 * @returns 
 */
export default function renderInclude(metadata: Map<string, string>): Map<string, string> {
    const root: any = metadata.get('root');
    const node: any = metadata.get('node');
    const domResponse = new Map<string, string>();
    const { children } = root;
    const outputDom = `<div class="include-container code-line" data-line=${node.position.start.line} data-name="includeBlock">\n<div class="dx-text-heading-7 include-heading">${node.attributes['src']}</div>\n${root}\n</div>`;
    domResponse.set('outputDom', outputDom);
    return domResponse;
}