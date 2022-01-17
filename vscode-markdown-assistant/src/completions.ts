import * as fs from 'fs';
import * as path from 'path';
import { CancellationToken, CompletionContext, CompletionItem, CompletionItemKind, CompletionItemProvider, CompletionList, DocumentSelector, Position, Range, SnippetString, TextDocument, workspace } from 'vscode';

let EXCLUDE_GLOB: string;

export const Document_Selector_Markdown: DocumentSelector = [
       { language: "markdown", scheme: "file" },
       { language: "markdown", scheme: "untitled" },
];

const customPlugins = [
    {label: '::include', insertText: new SnippetString(`\n::include{src="$1"}\n`)},
    {label: '::video(VidYard)', insertText: new SnippetString(`\n::video{src="$1" title="$2" type="vidyard"}\n`)},
    {label: '::video(Youtube)', insertText: new SnippetString(`\n::video{src="$1" title="$2" type="youtube"}\n`)},
    {label: '::video(Local)', insertText: new SnippetString(`\n::video{src="$1" title="$2" type="local"}\n`)},
    {label: ':::caution', insertText: new SnippetString(`\n:::caution\n$1\n:::\n`)},
    {label: ':::tip', insertText: new SnippetString(`\n:::tip\n$1\n:::\n`)},
    {label: ':::note', insertText: new SnippetString(`\n:::note\n$1\n:::\n`)},
    {label: ':::warning', insertText: new SnippetString(`\n:::warning\n$1\n:::\n`)},
    {label: '```sfdocs-code', insertText: new SnippetString('\n```sfdocs-code {"lang":"$1", "title": "$2", "src": "$3" }\n\n```\n')},
    {label: '```Codeblock```', insertText: new SnippetString('\n```\n$1\n```\n')},
    {label: '-definition', insertText: new SnippetString('\n- definition\n\n\t\t- : This is paragraph\n\n\t\t\t```\n\t\t\tWrite your code\n\t\t\t```\n\n\t\t\t![img_label](image_url)\n')}
];

export class MdCompletionItemProvider implements CompletionItemProvider {
    
    constructor(){
        // Pretend to support multi-workspacefolders
        let resource = null;
        if (workspace.workspaceFolders !== undefined && workspace.workspaceFolders.length > 0) {
            resource = workspace.workspaceFolders[0].uri;
        }

        let excludePatterns = ['**/node_modules', '**/bower_components', '**/*.code-search'];
        if (workspace.getConfiguration('completion', resource).get<boolean>('respectVscodeSearchExclude')) {
            const configExclude = workspace.getConfiguration('search', resource).get<object>('exclude');
            for (const key of Object.keys(configExclude!)) {
                //@ts-ignore
                if (configExclude[key] === true) {
                    excludePatterns.push(key);
                }
            }
        }

        excludePatterns = Array.from(new Set(excludePatterns));
        EXCLUDE_GLOB = '{' + excludePatterns.join(',') + '}';
    }

    async provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken, _context: CompletionContext): Promise<CompletionItem[] | CompletionList<CompletionItem> | undefined> {
        const lineTextBefore = document.lineAt(position.line).text.substring(0, position.character);
        const lineTextAfter = document.lineAt(position.line).text.substring(position.character);
        
        //file suggestions
        if (workspace.getWorkspaceFolder(document.uri) === undefined) {
            return [];
        }
        let typedDir: string;
        if (/!\[[^\]]*?\]\([^\)]*$/.test(lineTextBefore) || /<img [^>]*src="[^"]*$/.test(lineTextBefore)) {
            if (/!\[[^\]]*?\]\([^\)]*$/.test(lineTextBefore)) {
                typedDir = lineTextBefore.substr(lineTextBefore.lastIndexOf('](') + 2);
            } else {
                typedDir = lineTextBefore.substr(lineTextBefore.lastIndexOf('="') + 2);
            }
            const imageExtensions = ['png','jpg','jpeg','svg','gif','webp'];

            return getFileSuggestions(imageExtensions, document, typedDir);
        }else if(/\[[^\]]*?\]\([^\)]*$/.test(lineTextBefore) || /::include{src="/.test(lineTextBefore)){
            if(/\[[^\]]*?\]\([^\)]*$/.test(lineTextBefore)){
                typedDir = lineTextBefore.substr(lineTextBefore.lastIndexOf('](') + 2);
            }else{
                typedDir = lineTextBefore.substr(lineTextBefore.lastIndexOf('src') + 5);
            }
            
            return getFileSuggestions(['md'], document, typedDir);
        }else if(/::video{src="/.test(lineTextBefore) && /type="local"/.test(lineTextAfter)){
            typedDir = lineTextBefore.substr(lineTextBefore.lastIndexOf('src') + 5);
            
            return getFileSuggestions(['mp4','mov'], document, typedDir);
        }else if(/sfdocs-code {"lang":"java", "title": ".*", "src": "/.test(lineTextBefore)){
            typedDir = lineTextBefore.substr(lineTextBefore.lastIndexOf('src') + 7);
            
            return getFileSuggestions(['java'], document, typedDir);
        }else if(/sfdocs-code {"lang":"py", "title": ".*", "src": "/.test(lineTextBefore)
            || /sfdocs-code {"lang":"python", "title": ".*", "src": "/.test(lineTextBefore)){

            typedDir = lineTextBefore.substr(lineTextBefore.lastIndexOf('src') + 7);
            
            return getFileSuggestions(['py'], document, typedDir);
        }else if(/sfdocs-code {"lang":"text", "title": ".*", "src": "/.test(lineTextBefore)
            || /sfdocs-code {"lang":"txt", "title": ".*", "src": "/.test(lineTextBefore)){

            typedDir = lineTextBefore.substr(lineTextBefore.lastIndexOf('src') + 7);
            
            return getFileSuggestions(['txt'], document, typedDir);
        }else if(/sfdocs-code {"lang":"js", "title": ".*", "src": "/.test(lineTextBefore)
            || /sfdocs-code {"lang":"javascript", "title": ".*", "src": "/.test(lineTextBefore)){

            typedDir = lineTextBefore.substr(lineTextBefore.lastIndexOf('src') + 7);
            
            return getFileSuggestions(['js'], document, typedDir);
        }else if(/sfdocs-code {"lang":"markdown", "title": ".*", "src": "/.test(lineTextBefore)
            || /sfdocs-code {"lang":"md", "title": ".*", "src": "/.test(lineTextBefore)){

            typedDir = lineTextBefore.substr(lineTextBefore.lastIndexOf('src') + 7);
            
            return getFileSuggestions(['md'], document, typedDir);
        }else if(/sfdocs-code {"lang":"c", "title": ".*", "src": "/.test(lineTextBefore)
            || /sfdocs-code {"lang":"C", "title": ".*", "src": "/.test(lineTextBefore)){

            typedDir = lineTextBefore.substr(lineTextBefore.lastIndexOf('src') + 7);
            
            return getFileSuggestions(['c'], document, typedDir);
        }else if(/sfdocs-code {"lang":"apex", "title": ".*", "src": "/.test(lineTextBefore)){

        typedDir = lineTextBefore.substr(lineTextBefore.lastIndexOf('src') + 7);
        
        return getFileSuggestions(['apex'], document, typedDir);
        //custom plugin suggestions
        }else if(/(:)|(::)|(:::)|(`)|(``)|(-)|(```)$/.test(lineTextBefore)){
            let match = lineTextBefore.search(/(:)|(::)|(:::)|(`)|(``)|(-)|(```)|$/);
            let replaceRange: Range = new Range(position.line, match, position.line, position.character);
            return customPluginSuggestions(replaceRange);
        }
    }
}

function getFileSuggestions(extensions:string[], document:TextDocument, typedDir:string){
    const basePath = getBasepath(document, typedDir);
    const isRootedPath = typedDir.startsWith('/');

    return workspace.findFiles(`**/*.{${extensions.toString()}}`, EXCLUDE_GLOB).then(uris => {
        let items = uris.map(uri => {
            const label = path.relative(basePath, uri.fsPath).replace(/\\/g, '/');
            let item = new CompletionItem(label.replace(/ /g, '%20'), CompletionItemKind.File);
            
            item.sortText = label.replace(/\./g, '{');

            return item;
        });

        if (isRootedPath) {
            return items.filter(item => {
                const label:any = item.label;
                return !label.startsWith('..');
            });
        } else {
            return items;
        }
    });
}

function customPluginSuggestions(replaceRange: Range){
    return customPlugins.map(x => {
        const item = new CompletionItem(`${x.label}`);
        item.range = replaceRange;
        item.insertText = x.insertText;
        return item;
    });
}

function getBasepath(doc: TextDocument, dir: string): string {
    if (dir.includes('/')) {
        dir = dir.substr(0, dir.lastIndexOf('/') + 1);
    } else {
        dir = '';
    }
    //@ts-ignore
    let root = workspace.getWorkspaceFolder(doc.uri).uri.fsPath;
    const rootFolder = workspace.getConfiguration('completion', doc.uri).get<string>('root', '');
    if (rootFolder.length > 0 && fs.existsSync(path.join(root, rootFolder))) {
        root = path.join(root, rootFolder);
    }

    const basePath = path.join(
        dir.startsWith('/')
            ? root
            : path.dirname(doc.uri.fsPath),
        dir
    );

    return basePath;
}