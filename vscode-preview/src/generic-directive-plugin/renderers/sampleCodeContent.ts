/**
 * Function to support mock rendering the remote source code content needs to b feteched into the code block
 */
export default function renderSampleCodeContent(nodeMetadata: Map<string, string>): Map<string, string> {
    const args: any = nodeMetadata.get('node');
    const metadata = JSON.parse(args.meta);
    if (args && args.lang === 'sfdocs-code') {
        if (args.meta && !args['value'] && metadata['src'] &&
        metadata['src'].indexOf('http') >= 0) {
            args["value"] = `sfdocs-code code content appears here. We don't support the preview of remote content in this extension.`;
        }
    }
    return nodeMetadata
}