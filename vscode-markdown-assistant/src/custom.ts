import {window, SnippetString, QuickPickItem} from "vscode";

export function insertVideo(type: string){
    let editor = window.activeTextEditor;
    return editor!.insertSnippet(new SnippetString(`\n::video{src="$1" title="$2" type="${type}"}\n`));
}

export function contentReuse(){
    let editor = window.activeTextEditor;
    return editor!.insertSnippet(new SnippetString(`\n::include{src="$1"}\n`));
}

export function enhancedCodeblock(){
    let editor = window.activeTextEditor;
    return editor!.insertSnippet(new SnippetString('\n```sfdocs-code {"lang":"$1", "title": "$2", "src": "$3" }\n\n```\n'));
}

export async function insertVideoShortcut(){
    let items: QuickPickItem[] = [];
    items.push({ label: 'VidYard'});
    items.push({ label: 'YouTube'});
    items.push({ label: 'Local'});  

    var videoType = await window.showQuickPick(items);
    let editor = window.activeTextEditor;
    if(videoType){
        return editor!.insertSnippet(new SnippetString(`\n::video{src="$1" title="$2" type="${videoType.label.toLowerCase()}"}\n`));
    }
}

export async function insertDefinitionList() {
    let editor = window.activeTextEditor;
    return editor!.insertSnippet(new SnippetString('\n- definition\n\n\t\t- : This is paragraph\n\n\t\t\t```\n\t\t\tWrite your code here. This code block does not render in VSCode Markdown Preview extension. We are working to resolve this issue.\n\t\t\t```\n\n\t\t\t![img_label](image_url)\n'));
}