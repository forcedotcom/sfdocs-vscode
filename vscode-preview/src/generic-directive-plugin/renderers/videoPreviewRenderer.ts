/**
 * This renderer is useful to convert
 *
 * ```sfdocs
 *   <video src="https://i.imgur.com/FUsyxR5.jpg" title="Video Preview">
 *   </video>
 *  ```
 * to something like the below
 *
 * <dx-card-video-preview img-src="https://i.imgur.com/FUsyxR5.jpg" title="Video Preview">
 * </dx-card-video-preview>
 *
 * @param metadata Contains all the information need to create a new DOM
 */

export default function transform(metadata: Map<string, string>) {
    const sourceUrl = metadata.get('sourceUrl');
    const title = metadata.get('title');

    if (sourceUrl && title) {
        const domResponse = new Map<string, string>();
        const updatedDom = `<dx-card-video-preview img-src='${sourceUrl}' title='${title}' datetime='2021-03-11T10:50:35.019Z'></dx-card-video-preview>`;
        domResponse.set('updatedDom', updatedDom);
        domResponse.set('nodeType', 'html');
        return domResponse;
    }
}
