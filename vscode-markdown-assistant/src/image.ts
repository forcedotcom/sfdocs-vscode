import { window, commands, env } from "vscode";

export async function imagePaste() {
    const editor = window.activeTextEditor;
    if(editor){
        const selection = editor.selection;
        if (selection.isSingleLine && !relativePath.test(editor.document.getText(selection))) {
            const text = await env.clipboard.readText();
            if (relativePath.test(text)) {
                return commands.executeCommand("editor.action.insertSnippet", { "snippet": `![$TM_SELECTED_TEXT$0](${text})` });
            }else{
                return commands.executeCommand("editor.action.insertSnippet", { "snippet": `![$TM_SELECTED_TEXT$0]($1)` });
            }
        }
    }
}

export async function insertEnhancedImage() {
    const editor = window.activeTextEditor;
    if(editor){
        const selection = editor.selection;
        if (selection.isSingleLine && !relativePath.test(editor.document.getText(selection))) {
            const text = await env.clipboard.readText();
            const titleJson=`'{"class": "$2", "title": "$3"}'`;
            if (relativePath.test(text)) {
                return commands.executeCommand("editor.action.insertSnippet", { "snippet": `![$TM_SELECTED_TEXT$0](${text} ${titleJson})` });
            }else{
                return commands.executeCommand("editor.action.insertSnippet", { "snippet": `![$TM_SELECTED_TEXT$0]($1 ${titleJson})` });
            }
        }
    }
}

const relativePath: RegExp = /\/?([^\/]+\/)*[^\/]+\.(png|jpg|jpeg|svg|gif|webp)$/;