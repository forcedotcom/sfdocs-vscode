import { workspace, window, WorkspaceEdit, Range, Position, TextEditor, commands} from "vscode";
import { fixMarker, findNextMarkerLineNumber } from "./list";


export function onEnterKey(modifier?: string){
    let editor = window.activeTextEditor;
    let cursorPos: Position = editor!.selection.active;
    let line = editor!.document.lineAt(cursorPos.line);
    let textBeforeCursor = line.text.substr(0, cursorPos.character);
    let textAfterCursor = line.text.substr(cursorPos.character);
    let lineBreakPos = cursorPos;

    if(modifier==='shift'){
        return commands.executeCommand('type', { source: 'keyboard', text: '\n' });
    }else{
        let matches:RegExpExecArray | null;
        if (/^([-+*]|[0-9]+[.)])( +\[[ x]\])?$/.test(textBeforeCursor.trim()) && textAfterCursor.trim().length === 0){
            return editor!.edit(editBuilder => {
                editBuilder.delete(line.range);
                editBuilder.insert(line.range.end, '\n');
            }).then(() => {
                editor!.revealRange(editor!.selection);
            }).then(() => fixMarker(findNextMarkerLineNumber()));
        }else if ((matches = /^(\s*[-+*] +(\[[ x]\] +)?)/.exec(textBeforeCursor)) !== null) {
            // Unordered list
            return editor!.edit(editBuilder => {
                editBuilder.insert(lineBreakPos, `\n${matches![1].replace('[x]', '[ ]')}`);
            }).then(() => { editor!.revealRange(editor!.selection) });
        } else if ((matches = /^(\s*)([0-9]+)([.)])( +)((\[[ x]\] +)?)/.exec(textBeforeCursor)) !== null) {
            // Ordered list
            let config = workspace.getConfiguration('SFDocs.markdownAssistant.orderedList').get<string>('marker');
            let marker = '1';
            let leadingSpace = matches[1];
            let previousMarker = matches[2];
            let delimiter = matches[3];
            let trailingSpace = matches[4];
            let gfmCheckbox = matches[5].replace('[x]', '[ ]');
            let textIndent = (previousMarker + delimiter + trailingSpace).length;
            if (config === 'ordered') {
                marker = String(Number(previousMarker) + 1);
            }
            // Add enough trailing spaces so that the text is aligned with the previous list item, but always keep at least one space
            trailingSpace = " ".repeat(Math.max(1, textIndent - (marker + delimiter).length));
    
            const toBeAdded = leadingSpace + marker + delimiter + trailingSpace + gfmCheckbox;
            return editor!.edit(
                editBuilder => {
                    editBuilder.insert(lineBreakPos, `\n${toBeAdded}`);
                },
                { undoStopBefore: true, undoStopAfter: false }
            ).then(() => fixMarker()).then(() => { editor!.revealRange(editor!.selection) });
        }else {
            return commands.executeCommand('type', { source: 'keyboard', text: '\n' });
        }
    }
}


export function onBackspaceKey() {
    let editor = window.activeTextEditor;
    let cursor = editor!.selection.active;
    let document = editor!.document;
    let textBeforeCursor = document.lineAt(cursor.line).text.substr(0, cursor.character);

    if (!editor!.selection.isEmpty) {
        return commands.executeCommand('deleteLeft').then(() => fixMarker(findNextMarkerLineNumber()));
    } else if (/^\s+([-+*]|[0-9]+[.)]) $/.test(textBeforeCursor)) {
        // e.g. textBeforeCursor === `  - `, `   1. `
        return outdent(editor).then(() => fixMarker());
    } else if (/^([-+*]|[0-9]+[.)]) $/.test(textBeforeCursor)) {
        // e.g. textBeforeCursor === `- `, `1. `
        return editor!.edit(editBuilder => {
            editBuilder.replace(new Range(cursor.with({ character: 0 }), cursor), ' '.repeat(textBeforeCursor.length))
        }).then(() => fixMarker(findNextMarkerLineNumber()));
    } else if (/^\s*([-+*]|[0-9]+[.)]) +(\[[ x]\] )$/.test(textBeforeCursor)) {
        // e.g. textBeforeCursor === `- [ ]`, `1. [x]`, `  - [x]`
        return deleteRange(editor!, new Range(cursor.with({ character: textBeforeCursor.length - 4 }), cursor)).then(() => fixMarker(findNextMarkerLineNumber()));
    } else {
        return commands.executeCommand('deleteLeft');
    }
}

export function onTabKey(modifiers?: string) {
    let editor = window.activeTextEditor;
    let cursorPos = editor!.selection.start;
    let lineText = editor!.document.lineAt(cursorPos.line).text;

    let match = /^\s*([-+*]|[0-9]+[.)]) +(\[[ x]\] +)?/.exec(lineText);

    if (match && (
            modifiers === 'shift'
            || !editor!.selection.isEmpty
            || editor!.selection.isEmpty && cursorPos.character <= match[0].length)) {
        if (modifiers === 'shift') {
            return outdent(editor).then(() => fixMarker());
        } else {
            return indent(editor).then(() => fixMarker());
        }
    }else{
        if (modifiers === 'shift') {
            return commands.executeCommand('editor.action.outdentLines');
        }else if (window!.activeTextEditor!.selection.isEmpty
            && workspace.getConfiguration('emmet').get<boolean>('triggerExpansionOnTab')){
            return commands.executeCommand('editor.emmet.action.expandAbbreviation');
        }else{
            return commands.executeCommand('tab');
        }
    }
}

function deleteRange(editor: TextEditor, range: Range): Thenable<boolean> {
    return editor.edit(
        editBuilder => {
            editBuilder.delete(range);
        },
        // We will enable undoStop after fixing markers
        { undoStopBefore: true, undoStopAfter: false }
    );
}

function outdent(editor?: TextEditor) {
    if (!editor) {
        editor = window.activeTextEditor;
    }

    if (workspace.getConfiguration("SFDocs.list", editor!.document.uri).get<string>("indentationSize") === "adaptive") {
        try {
            const selection = editor!.selection;
            const indentationSize = tryDetermineIndentationSize(editor!, selection.start.line, editor!.document.lineAt(selection.start.line).firstNonWhitespaceCharacterIndex);
            let edit = new WorkspaceEdit()
            for (let i = selection.start.line; i <= selection.end.line; i++) {
                if (i === selection.end.line && !selection.isEmpty && selection.end.character === 0) {
                    break;
                }
                const lineText = editor!.document.lineAt(i).text;
                let maxOutdentSize: number;
                if (lineText.trim().length === 0) {
                    maxOutdentSize = lineText.length;
                } else {
                    maxOutdentSize = editor!.document.lineAt(i).firstNonWhitespaceCharacterIndex;
                }
                if (maxOutdentSize > 0) {
                    edit.delete(editor!.document.uri, new Range(i, 0, i, Math.min(indentationSize, maxOutdentSize)));
                }
            }
            return workspace.applyEdit(edit);
        } catch (error) { }
    }

    return commands.executeCommand('editor.action.outdentLines');
}

function tryDetermineIndentationSize(editor: TextEditor, line: number, currentIndentation: number) {
    while (--line >= 0) {
        const lineText = editor.document.lineAt(line).text;
        let matches;
        if ((matches = /^(\s*)(([-+*]|[0-9]+[.)]) +)(\[[ x]\] +)?/.exec(lineText)) !== null) {
            if (matches[1].length <= currentIndentation) {
                return matches[2].length;
            }
        }
    }
    throw "No previous Markdown list item";
}

function indent(editor?: TextEditor) {
    if (!editor) {
        editor = window.activeTextEditor;
    }

    if (workspace.getConfiguration("SFDocs.list", editor!.document.uri).get<string>("indentationSize") === "adaptive") {
        try {
            const selection = editor!.selection;
            const indentationSize = tryDetermineIndentationSize(editor!, selection.start.line, editor!.document.lineAt(selection.start.line).firstNonWhitespaceCharacterIndex);
            let edit = new WorkspaceEdit()
            for (let i = selection.start.line; i <= selection.end.line; i++) {
                if (i === selection.end.line && !selection.isEmpty && selection.end.character === 0) {
                    break;
                }
                if (editor!.document.lineAt(i).text.length !== 0) {
                    edit.insert(editor!.document.uri, new Position(i, 0), ' '.repeat(indentationSize));
                }
            }
            return workspace.applyEdit(edit);
        } catch (error) { }
    }

    return commands.executeCommand('editor.action.indentLines');
}