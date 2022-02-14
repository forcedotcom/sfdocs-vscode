/**
 * Function to support mock rendering the remote source code content needs to b feteched into the code block
 */ 
export default function renderMockCodeContent(nodeMetadata:  Map<string, string>): Map<string, string>{
    const args: any = nodeMetadata.get('node');
    if (args && args.lang === 'sfdocs-code') {
        if(args.meta && args.meta.indexOf("src") > 0){
            args["value"] = `Your code content will be visible here. Currenly we don't support fetching remote content in VSCode`;
        }
    }
    return nodeMetadata
}