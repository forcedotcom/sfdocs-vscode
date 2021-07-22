import { Position, Range, Selection, TextEditor, window, workspace, WorkspaceEdit } from 'vscode';

export function toggleBlockquote(){
    const editor = window.activeTextEditor;
    const selection = editor!.selection;
    const doc = editor!.document;
    const cursorPos = editor!.selection.active;
    let wsEdit = new WorkspaceEdit();
    let lineText: string;

    if(selection.isEmpty){
        lineText = doc.lineAt(cursorPos.line).text;
        if(/^>/.test(lineText)){
            let textIndex = lineText.substring(1).search(/\S/);
            wsEdit.delete(doc.uri, new Range(cursorPos.line, 0, cursorPos.line, textIndex+1));
        }else{
            wsEdit.insert(doc.uri, new Position(cursorPos.line, 0), '> ');
        }
    }else{
        for(let i=selection.start.line; i<=selection.end.line; i++){
            lineText = doc!.lineAt(i).text;
            if(/^>/.test(lineText)){
                let textIndex = lineText.substring(1).search(/\S/);
                wsEdit.delete(doc.uri, new Range(i, 0, i, textIndex+1));
            }else{
                wsEdit.insert(doc.uri, new Position(i, 0), '> ');
            }
        }
    }

    return workspace.applyEdit(wsEdit);
}

//functions to wrap using different patterns, eg. "* *", "_ _", "~ ~"
export function styleByWrapping(startPattern: string, endPattern?: string) {
    if (!endPattern) {
        endPattern = startPattern;
    }

    const editor = window.activeTextEditor;
    if(editor){
        let selections = editor.selections;

        let batchEdit = new WorkspaceEdit();
        let shifts: [Position, number][] = [];
        let newSelections: Selection[] = selections.slice();
        //const endPatternLen = endPattern?endPattern.length:startPattern.length;

        selections.forEach((selection, i) => {

            let cursorPos = selection.active;
            const shift = shifts.map(([pos, s]) => (selection.start.line === pos.line && selection.start.character >= pos.character) ? s : 0)
                .reduce((a, b) => a + b, 0);

            if (selection.isEmpty) {
                // No selected text
                let context = getContext(editor, cursorPos, startPattern, endPattern);
                if(context === `${startPattern}|text${endPattern}`){
                    return;
                }else if(context === `${startPattern}text|${endPattern}`){
                    let newCursorPos: Position;
                    if(startPattern!=="\n```\n"){
                        newCursorPos = cursorPos.with({ character: cursorPos.character + shift + endPattern!.length });
                    }else{
                        newCursorPos = new Position(cursorPos.line+1, 3);
                    }
                    newSelections[i] = new Selection(newCursorPos, newCursorPos);
                    return;
                }else if ( context === `${startPattern}|${endPattern}` 
                    || context === `|${startPattern}text${endPattern}`
                    || context === `${startPattern}text${endPattern}|`) {

                    let word: RegExp; 
                    if(startPattern === "**") {word = /\*\*.*\*\*/;}
                    else if(startPattern === "*") {word = /\*.*\*/;}
                    else if(startPattern === "\n```\n") {word = /```\n.*\n```/m;}
                    else {word = new RegExp(startPattern+'.*'+endPattern);}

                    let wordRange: Range;
                    if(startPattern === "\n```\n"){
                        if(context === `|${startPattern}text${endPattern}`){
                            let lastLineNum = cursorPos.line+1;
                            while(!editor.document.lineAt(lastLineNum).text.endsWith("```")){
                                lastLineNum++;
                            }
                            wordRange = new Range(cursorPos, new Position(lastLineNum, 3));
                        }else if(context === `${startPattern}text${endPattern}|`){
                            let startLineNum = cursorPos.line-1;
                            while(!editor.document.lineAt(startLineNum).text.endsWith("```")){
                                startLineNum--;
                            }
                            let startTextLine = editor.document.lineAt(startLineNum);
                            wordRange = new Range(new Position(startLineNum, startTextLine.text.search("```")), cursorPos);
                        }
                    }else{
                        wordRange = editor.document.getWordRangeAtPosition(cursorPos, word)!;
                    }
                    //wordRange = editor.document.getWordRangeAtPosition(cursorPos, word);
                    if (wordRange! === undefined) {
                        wordRange = selection;
                    }
                    
                    wrapRange(editor, batchEdit, shifts, newSelections, i, shift, cursorPos, wordRange, false, startPattern, endPattern);
                }else{
                    // Select word under cursor
                    let wordRange = editor.document.getWordRangeAtPosition(cursorPos, /\S+/);
                    if (wordRange === undefined) {
                        wordRange = selection;
                    }
                    // One special case: toggle strikethrough in task list
                    const currentTextLine = editor.document.lineAt(cursorPos.line);
                    if(currentTextLine !== null){
                        let newPosChar;
                        let match = currentTextLine.text.match(/^\s*[\*\+\-] (\[[ x]\] )? */g);
                        if(match){
                            newPosChar = match[0].length;
                        }else{
                            newPosChar = cursorPos.character;
                        }

                        if (startPattern === '~~' && /^\s*[\*\+\-] (\[[ x]\] )? */g.test(currentTextLine.text)) {
                            wordRange = currentTextLine.range.with(new Position(cursorPos.line, newPosChar));
                        }
                        wrapRange(editor, batchEdit, shifts, newSelections, i, shift, cursorPos, wordRange, false, startPattern, endPattern);
                    }
                }
            } else {
                // Text selected
                wrapRange(editor, batchEdit, shifts, newSelections, i, shift, cursorPos, selection, true, startPattern, endPattern);
            }
        });

        return workspace.applyEdit(batchEdit).then(() => {
            editor.selections = newSelections;
        });
    }
}


function getContext(editor: TextEditor, cursorPos: Position, startPattern: string, endPattern?: string): string {
    if (endPattern === undefined) {
        endPattern = startPattern;
    }

    let startPositionCharacter = cursorPos.character - startPattern.length;
    let endPositionCharacter = cursorPos.character + endPattern.length;

    if (startPositionCharacter < 0) {
        startPositionCharacter = 0;
    }

    let leftText = editor.document.getText(new Range(cursorPos.line, startPositionCharacter, cursorPos.line, cursorPos.character));
    let rightText = editor.document.getText(new Range(cursorPos.line, cursorPos.character, cursorPos.line, endPositionCharacter));

    if (rightText === endPattern) {
        if (leftText === startPattern) {
            return `${startPattern}|${endPattern}`;
        }else if(leftText.length===0 || /^\s$/.test(leftText.charAt(leftText.length-1))){
            return `|${startPattern}text${endPattern}`;
        }else{
            return `${startPattern}text|${endPattern}`;
        }
    }else if(leftText === endPattern && (rightText.length===0 || /^\s$/.test(rightText.charAt(0)))){
        return `${startPattern}text${endPattern}|`;
    }else if(leftText === startPattern){
        return `${startPattern}|text${endPattern}`;
    }else{
        //special case for codeblocks
        if(rightText === '```'){
            return "|\n```\ntext\n```\n";
        }else if(leftText === '```'){
            return "\n```\ntext\n```\n|";
        }else if(rightText===''){
            let nextLineRightText = editor.document.getText(new Range(cursorPos.line+1, 0, cursorPos.line+1, 3));
            if(startPattern==='```\n' && nextLineRightText === '```'){
                return `${startPattern}text|${endPattern}`;
            }
        }
    }
    
    return '|';
}


function wrapRange(editor: TextEditor, wsEdit: WorkspaceEdit, shifts: [Position, number][], newSelections: Selection[], i: number, shift: number, cursor: Position, range: Range, isSelected: boolean, startPtn: string, endPtn?: string) {
    if (endPtn === undefined) {
        endPtn = startPtn;
    }

    let text = editor.document.getText(range);
    const prevSelection = newSelections[i];
    const ptnLength = (startPtn + endPtn).length;

    let newCursorPos = cursor.with({ character: cursor.character + shift });
    let newSelection: Selection;
    if (isWrapped(text, startPtn, endPtn)) {
        // remove start/end patterns from range
        wsEdit.replace(editor.document.uri, range, text.substr(startPtn==='\n```\n'?startPtn.length-1:startPtn.length,
         startPtn==='\n```\n'?text.length - ptnLength + 2:text.length - ptnLength));

        shifts.push([range.end, -ptnLength]);

        // Fix cursor position
        if (!isSelected) {
            if (!range.isEmpty) { // means quick styling
                if (cursor.character === range.end.character) {
                    if(startPtn === "\n```\n"){
                        newCursorPos = cursor.with({ character: 0 });
                    }else{
                        newCursorPos = cursor.with({ character: cursor.character + shift - ptnLength });
                    }
                } else {
                    let newPos = cursor.character + shift - startPtn.length;
                    newCursorPos = cursor.with({ character: newPos<0?0:newPos});
                }
            } else { // means `**|**` -> `|`
                newCursorPos = cursor.with({ character: cursor.character + shift + startPtn.length });
            }
            newSelection = new Selection(newCursorPos, newCursorPos);
        } else {
            if(startPtn === "\n```\n"){
                let lastLineChar = editor.document.lineAt(prevSelection.end.line-1).range.end;
                newSelection = new Selection(
                    new Position(prevSelection.start.line+1, 0),
                    new Position(lastLineChar.line, lastLineChar.character)
                );
            }else{
                newSelection = new Selection(
                    prevSelection.start.with({ character: prevSelection.start.character + shift }),
                    prevSelection.end.with({ character: prevSelection.end.character + shift - ptnLength })
                );
            }
        }
    } else {
        // add start/end patterns around range
        wsEdit.replace(editor.document.uri, range, startPtn + text + endPtn);

        shifts.push([range.end, ptnLength]);

        // Fix cursor position
        if (!isSelected) {
            if (!range.isEmpty) { // means quick styling
                if (cursor.character === range.end.character) {
                    newCursorPos = cursor.with({ character: cursor.character + shift + ptnLength });
                } else {
                    newCursorPos = cursor.with({ character: cursor.character + shift + startPtn.length });
                }
            } else { // means `|` -> `**|**`
                if(startPtn.startsWith('\n')){
                    newCursorPos = cursor.with({line:cursor.line+2, character:0});
                }else{
                    newCursorPos = cursor.with({ character: cursor.character + shift + startPtn.length });
                }
            }
            newSelection = new Selection(newCursorPos, newCursorPos);
        }else {
            newSelection = new Selection(
                prevSelection.start.with({ character: prevSelection.start.character + shift }),
                prevSelection.end.with({ character: prevSelection.end.character + shift + ptnLength })
            );
        }
    }

    newSelections[i] = newSelection;
}


function isWrapped(text: string, startPattern: string, endPattern?: string): boolean {
    if (endPattern === undefined) {
        endPattern = startPattern;
    }
    return text.startsWith(startPattern.trim()) && text.endsWith(endPattern.trim());
}