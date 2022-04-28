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

export async function insertDescriptionList() {
    let editor = window.activeTextEditor;
    return editor!.insertSnippet(new SnippetString('\n- First Term\n\n\t- : This text defines the first term.\n'));
}