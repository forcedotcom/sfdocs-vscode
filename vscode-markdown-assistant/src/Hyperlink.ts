import { commands, env, ExtensionContext, Position, Range, Selection, SnippetString, TextDocument, TextEditor, window, workspace, WorkspaceEdit } from 'vscode';

//functions for pasting hyperlink
export async function paste() {
    const editor = window.activeTextEditor;
    if(editor){
        const selection = editor.selection;
        if (selection.isSingleLine && !singleLinkRegex.test(editor.document.getText(selection)) && !relativePath.test(editor.document.getText(selection))){
            const text = await env.clipboard.readText();
            if (singleLinkRegex.test(text) || relativePath.test(text)) {
                return commands.executeCommand("editor.action.insertSnippet", { "snippet": `[$TM_SELECTED_TEXT$0](${text})` });
            }else{
                return commands.executeCommand("editor.action.insertSnippet", { "snippet": `[$TM_SELECTED_TEXT$0]($1)` });
            }
        }
    }
}

const singleLinkRegex: RegExp = createLinkRegex();
const relativePath: RegExp = /\/?([^\/]+\/)*[^\/]+\.md/;

function createLinkRegex(): RegExp {
    // unicode letters range(must not be a raw string)
    const ul = '\\u00a1-\\uffff';
    // IP patterns
    const IPV4_REG = '(?:25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)){3}';
    const IPV6_REG = '\\[[0-9a-f:\\.]+\\]';  // simple regex (in django it is validated additionally)


    // Host patterns
    const HOSTNAME_REG = '[a-z' + ul + '0-9](?:[a-z' + ul + '0-9-]{0,61}[a-z' + ul + '0-9])?';
    // Max length for domain name labels is 63 characters per RFC 1034 sec. 3.1
    const DOMAIN_REG = '(?:\\.(?!-)[a-z' + ul + '0-9-]{1,63}(?<!-))*';

    const TLD_REG = ''
        + '\\.'                               // dot
        + '(?!-)'                             // can't start with a dash
        + '(?:[a-z' + ul + '-]{2,63}'         // domain label
        + '|xn--[a-z0-9]{1,59})'              // or punycode label
        + '(?<!-)'                            // can't end with a dash
        + '\\.?'                              // may have a trailing dot
        ;

    const HOST_REG = '(' + HOSTNAME_REG + DOMAIN_REG + TLD_REG + '|localhost)';
    const pattern = ''
        + '^(?:[a-z0-9\\.\\-\\+]*)://'  // scheme is not validated (in django it is validated additionally)
        + '(?:[^\\s:@/]+(?::[^\\s:@/]*)?@)?'  // user: pass authentication
        + '(?:' + IPV4_REG + '|' + IPV6_REG + '|' + HOST_REG + ')'
        + '(?::\\d{2,5})?'  // port
        + '(?:[/?#][^\\s]*)?'  // resource path
        + '$' // end of string
        ;

    return new RegExp(pattern, 'i');
}