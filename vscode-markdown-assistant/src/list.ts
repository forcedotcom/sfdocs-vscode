import { workspace, window, WorkspaceEdit, TextDocument, Range, Position, TextEditor} from "vscode";

export function toggleBulletList() {
    const editor = window.activeTextEditor;
    const doc = editor!.document;
    let batchEdit = new WorkspaceEdit();

    editor?.selections.forEach(selection => {
        if (selection.isEmpty) {
            toggleBulletListSingleLine(doc, selection.active.line, batchEdit);
        } else {
            for (let i = selection.start.line; i <= selection.end.line; i++) {
                toggleBulletListSingleLine(doc, i, batchEdit);
            }
        }
    });

    return workspace.applyEdit(batchEdit).then(() => fixMarker());
}


export function toggleNumberList() {
    const editor = window.activeTextEditor;
    const doc = editor!.document;
    let batchEdit = new WorkspaceEdit();

    editor?.selections.forEach(selection => {
        if (selection.isEmpty) {
            toggleNumberListSingleLine(doc, selection.active.line, 1, batchEdit);
        } else {
            let itemNumber: number = 1;
            for (let i = selection.start.line; i <= selection.end.line; i++) {
                toggleNumberListSingleLine(doc, i, itemNumber, batchEdit);
                itemNumber++;
            }
        }
    });

    return workspace.applyEdit(batchEdit).then(() => fixMarker());
}

export function toggleCheckList() {
    const editor = window.activeTextEditor;
    const doc = editor!.document;
    let batchEdit = new WorkspaceEdit();

    editor?.selections.forEach(selection => {
        if (selection.isEmpty) {
            toggleCheckListSingleLine(doc, selection.active.line, batchEdit);
        } else {
            for (let i = selection.start.line; i <= selection.end.line; i++) {
                toggleCheckListSingleLine(doc, i, batchEdit);
            }
        }
    });

    return workspace.applyEdit(batchEdit).then(() => fixMarker());
}

export function toggleBlockquoteSingleLine(doc: TextDocument, line: number, wsEdit: WorkspaceEdit) {
    const lineText = doc.lineAt(line).text;
    const indentation = lineText.trim().length === 0 ? lineText.length : lineText.indexOf(lineText.trim());
    const lineTextContent = lineText.substr(indentation);

    if (lineTextContent.startsWith("- ") || lineTextContent.startsWith("+ ") || lineTextContent.startsWith("* ")) {
        wsEdit.replace(doc.uri, new Range(line, indentation, line, indentation + 2), "1. ");
    }else if (/^\d+\. /.test(lineTextContent)) {
        const lenOfDigits = /^(\d+)\./.exec(lineText.trim())![1].length;
        wsEdit.delete(doc.uri, new Range(line, indentation, line, indentation + lenOfDigits + 2));
    }else if(/^\d+\) /.test(lineTextContent)){
        const lenOfDigits = /^(\d+)\)/.exec(lineText.trim())![1].length;
        wsEdit.delete(doc.uri, new Range(line, indentation, line, indentation + lenOfDigits + 2));
    }else {
        wsEdit.insert(doc.uri, new Position(line, indentation), "1. ");
    }
}

export function checkTaskList() {
    // - Look into selections for lines that could be checked/unchecked.
    // - The first matching line dictates the new state for all further lines.
    //   - I.e. if the first line is unchecked, only other unchecked lines will
    //     be considered, and vice versa.
    let editor = window.activeTextEditor;
    const uncheckedRegex = /^(\s*([-+*]|[0-9]+[.)]) +\[) \]/;
    const checkedRegex = /^(\s*([-+*]|[0-9]+[.)]) +\[)x\]/;
    let toBeToggled: Position[] = []; // all spots that have an "[x]" resp. "[ ]" which should be toggled
    let newState: boolean | undefined = undefined; // true = "x", false = " ", undefined = no matching lines

    // go through all touched lines of all selections.
    for (const selection of editor!.selections) {
        for (let i = selection.start.line; i <= selection.end.line; i++) {
            const line = editor!.document.lineAt(i);
            const lineStart = line.range.start;

            if (!selection.isSingleLine && (selection.start.isEqual(line.range.end) || selection.end.isEqual(line.range.start))) {
                continue;
            }

            let matches: RegExpExecArray;
            if (
                (matches = uncheckedRegex.exec(line.text)!)
                && newState !== false
            ) {
                toBeToggled.push(lineStart.with({ character: matches[1].length }));
                newState = true;
            } else if (
                (matches = checkedRegex.exec(line.text)!)
                && newState !== true
            ) {
                toBeToggled.push(lineStart.with({ character: matches[1].length }));
                newState = false;
            }
        }
    }

    if (newState !== undefined) {
        const newChar = newState ? 'x' : ' ';
        return editor!.edit(editBuilder => {
            for (const pos of toBeToggled) {
                let range = new Range(pos, pos.with({ character: pos.character + 1 }));
                editBuilder.replace(range, newChar);
            }
        });
    }
}


function toggleBulletListSingleLine(doc: TextDocument, line: number, wsEdit: WorkspaceEdit) {
    const lineText = doc.lineAt(line).text;
    const indentation = lineText.trim().length === 0 ? lineText.length : lineText.indexOf(lineText.trim());
    const lineTextContent = lineText.substr(indentation);

    if(lineTextContent.startsWith("* ") || lineTextContent.startsWith("- ") || lineTextContent.startsWith("+ ")){
        wsEdit.delete(doc.uri, new Range(line, indentation, line, indentation + 2));
    }else if(/^\d+\. /.test(lineTextContent)){
        const lenOfDigits = /^(\d+)\./.exec(lineText.trim())![1].length;
        wsEdit.replace(doc.uri, new Range(line, indentation, line, indentation + lenOfDigits + 2), "- ");
    }else if(/^\d+\) /.test(lineTextContent)){
        const lenOfDigits = /^(\d+)\)/.exec(lineText.trim())![1].length;
        wsEdit.replace(doc.uri, new Range(line, indentation, line, indentation + lenOfDigits + 2), "- ");
    } else {
        wsEdit.insert(doc.uri, new Position(line, indentation), "- ");
    }
}


function toggleNumberListSingleLine(doc: TextDocument, line: number, itemNumber: number, wsEdit: WorkspaceEdit) {
    const lineText = doc.lineAt(line).text;
    const indentation = lineText.trim().length === 0 ? lineText.length : lineText.indexOf(lineText.trim());
    const lineTextContent = lineText.substr(indentation);

    if (lineTextContent.startsWith("- ") || lineTextContent.startsWith("+ ") || lineTextContent.startsWith("* ")) {
        wsEdit.replace(doc.uri, new Range(line, indentation, line, indentation + 2), `${itemNumber}. `);
    }else if (/^\d+\. /.test(lineTextContent)) {
        const lenOfDigits = /^(\d+)\./.exec(lineText.trim())![1].length;
        wsEdit.delete(doc.uri, new Range(line, indentation, line, indentation + lenOfDigits + 2));
    }else if(/^\d+\) /.test(lineTextContent)){
        const lenOfDigits = /^(\d+)\)/.exec(lineText.trim())![1].length;
        wsEdit.delete(doc.uri, new Range(line, indentation, line, indentation + lenOfDigits + 2));
    }else {
        wsEdit.insert(doc.uri, new Position(line, indentation), `${itemNumber}. `);
    }
}


function toggleCheckListSingleLine(doc: TextDocument, line: number, wsEdit: WorkspaceEdit) {
    const lineText = doc.lineAt(line).text;
    const indentation = lineText.trim().length === 0 ? lineText.length : lineText.indexOf(lineText.trim());
    const lineTextContent = lineText.substr(indentation);

    if(/^(- |\+ |\* |\d+\. )\s*\[ \]\s+/.test(lineTextContent)){
        let startTextChar:number = 0;
        let endBracketChar:number = -1;
        let bracketsEncountered: boolean = false;
        for(let i=0; i<lineTextContent.length; i++){
            if(!bracketsEncountered){
                if(lineTextContent.charAt(i)===']'){
                    bracketsEncountered = true;
                    endBracketChar = i;
                }
            }else{
                if(/^\s+$/.test(lineTextContent.charAt(i)) === false){
                    break;
                }
            }
            startTextChar++;
        }
        wsEdit.delete(doc.uri, new Range(line, indentation + endBracketChar - 2, line, indentation + startTextChar));
    }else{
        if (lineTextContent.startsWith("- ") || lineTextContent.startsWith("+ ") || lineTextContent.startsWith("* ")) {
            wsEdit.insert(doc.uri, new Position(line, indentation + 2), "[ ] ");
        }else if (/^\d+\. /.test(lineTextContent)) {
            const lenOfDigits = /^(\d+)\./.exec(lineText.trim())![1].length;
            wsEdit.insert(doc.uri, new Position(line, indentation + lenOfDigits + 2), "[ ] ");
        }else if(/^\d+\) /.test(lineTextContent)){
            const lenOfDigits = /^(\d+)\)/.exec(lineText.trim())![1].length;
            wsEdit.insert(doc.uri, new Position(line, indentation + lenOfDigits + 2), "[ ] ");
        }else {
            wsEdit.insert(doc.uri, new Position(line, indentation), "- [ ] ");
        }
    }
}


//@ts-ignore
export function fixMarker(line?: number) {
    if (!workspace.getConfiguration('SFDocs.markdownAssistant.orderedList').get<boolean>('autoRenumber')) { return; };
    if (workspace.getConfiguration('SFDocs.markdownAssistant.orderedList').get<string>('marker') === 'one') { return; };

    let editor = window.activeTextEditor;
    if (line === undefined) {
        // Use either the first line containing an ordered list marker within the selection or the active line
        line = findNextMarkerLineNumber();
        if (line === undefined || line > editor!.selection.end.line) {
            line = editor!.selection.active.line;
        }
    }
    if (line < 0 || editor!.document.lineCount <= line) {
        return;
    }

    let currentLineText = editor!.document.lineAt(line).text;
    let matches;
    if ((matches = /^(\s*)([0-9]+)([.)])( +)/.exec(currentLineText)) !== null) { // ordered list
        let leadingSpace = matches[1];
        let marker = matches[2];
        let delimiter = matches[3];
        let trailingSpace = matches[4];
        let fixedMarker = lookUpwardForMarker(editor!, line, leadingSpace.length);
        let listIndent = marker.length + delimiter.length + trailingSpace.length;
        let fixedMarkerString = String(fixedMarker);

        return editor!.edit(
            editBuilder => {
                if (marker === fixedMarkerString) {
                    return;
                }
                // Add enough trailing spaces so that the text is still aligned at the same indentation level as it was previously, but always keep at least one space
                fixedMarkerString += delimiter + " ".repeat(Math.max(1, listIndent - (fixedMarkerString + delimiter).length));

                editBuilder.replace(new Range(line!, leadingSpace.length, line!, leadingSpace.length + listIndent), fixedMarkerString);
            },
            { undoStopBefore: false, undoStopAfter: false }
        ).then(() => {
            let nextLine = line! + 1;
            let indentString = " ".repeat(listIndent);
            while (editor!.document.lineCount > nextLine) {
                const nextLineText = editor!.document.lineAt(nextLine).text;
                if (/^\s*[0-9]+[.)] +/.test(nextLineText)) {
                    return fixMarker(nextLine);
                } else if (/^\s*$/.test(nextLineText)) {
                    nextLine++;
                } else if (listIndent <= 4 && !nextLineText.startsWith(indentString)) {
                    return;
                } else {
                    nextLine++;
                }
            }
        });
    }
}


export function findNextMarkerLineNumber(line?: number): number {
    let editor = window.activeTextEditor;
    if (line === undefined) {
        // Use start.line instead of active.line so that we can find the first
        // marker following either the cursor or the entire selected range
        line = editor!.selection.start.line;
    }
    while (line < editor!.document.lineCount) {
        const lineText = editor!.document.lineAt(line).text;

        if (lineText.startsWith('#')) {
            // Don't go searching past any headings
            return -1;
        }

        if (/^\s*[0-9]+[.)] +/.exec(lineText) !== null) {
            return line;
        }
        line++;
    }
    return undefined!;
}


function lookUpwardForMarker(editor: TextEditor, line: number, currentIndentation: number): number {
    while (--line >= 0) {
        const lineText = editor.document.lineAt(line).text;
        let matches;
        if ((matches = /^(\s*)(([0-9]+)[.)] +)/.exec(lineText)) !== null) {
            let leadingSpace: string = matches[1];
            let marker = matches[3];
            if (leadingSpace.length === currentIndentation) {
                return Number(marker) + 1;
            } else if (
                (!leadingSpace.includes('\t') && leadingSpace.length + matches[2].length <= currentIndentation)
                || leadingSpace.includes('\t') && leadingSpace.length + 1 <= currentIndentation
            ) {
                return 1;
            }
        } else if ((matches = /^(\s*)\S/.exec(lineText)) !== null) {
            if (matches[1].length <= currentIndentation) {
                break;
            }
        }
    }
    return 1;
}