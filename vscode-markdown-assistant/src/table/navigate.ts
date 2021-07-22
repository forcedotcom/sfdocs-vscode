import * as vscode from "vscode";
import { onTabKey } from "../keyBehaviour";
import * as markdowntable from './markdownTable';

export function navigateNextCell(withFormat:boolean){
    const editor = vscode.window.activeTextEditor as vscode.TextEditor;
    const doc = editor.document;
    const cur_selection = editor.selection;
    const currentLine = new vscode.Selection(
        new vscode.Position(cur_selection.active.line, 0),
        new vscode.Position(cur_selection.active.line, 10000));
    const currentLineText = doc.getText(currentLine);
    if (!currentLineText.trim().startsWith('|')) {
        onTabKey();
        return;
    }

    let startLine: number;
    let endLine: number;
    [startLine, endLine] = markdowntable.detectTableBoundaries();

    const table_selection = new vscode.Selection(
        new vscode.Position(startLine, 0),
        new vscode.Position(endLine, 10000));
    let table_text = doc.getText(table_selection);


    const mdt = new markdowntable.MarkdownTable();

    const [prevline, prevcharacter] = [cur_selection.active.line - startLine, cur_selection.active.character];
    const [prevRow, prevColumn] = mdt.getCellAtPosition(table_text, prevline, prevcharacter);

    let tableData = mdt.stringToTableData(table_text);
    if (tableData.aligns[0][0] === undefined) {
        return;
    }

    const isNextRow = (prevColumn + 1 >= tableData.columns.length);

    if (withFormat) {
        table_text = mdt.tableDataToFormatTableStr(tableData);
    }
    else {
        if (currentLineText.split('|').length < tableData.columns.length + 2) {
            let table_text_lines = table_text.split(/\r\n|\n|\r/);
            const cursorRow = cur_selection.active.line - startLine;
            table_text_lines[cursorRow] += '|';
            table_text = table_text_lines.join('\r\n');
        }
    }

    editor.edit(edit => {
        edit.replace(table_selection, table_text);
    });

    let newSelection: vscode.Selection;

    try{
        const newColumn = (isNextRow === true) ? 0 : prevColumn + 1;
        const newRow = (isNextRow === true) ? prevRow + 1 : prevRow;
        const [newline, newcharacter] = mdt.getPositionOfCell(table_text, newRow, newColumn);
        const newPosition = new vscode.Position(
            table_selection.start.line + newline,
            table_selection.start.character + newcharacter + 1);
        newSelection = new vscode.Selection(newPosition, newPosition);
    }catch(err){
        const newPosition = new vscode.Position(editor.selection.active.line+2,0);
        newSelection = new vscode.Selection(newPosition, newPosition);
    }

    editor.selection = newSelection;
};


export function navigatePrevCell(withFormat: boolean){
    const editor = vscode.window.activeTextEditor as vscode.TextEditor;
    const doc = editor.document;
    const cur_selection = editor.selection;
    const currentLine = doc.getText(new vscode.Selection(
        new vscode.Position(cur_selection.active.line, 0),
        new vscode.Position(cur_selection.active.line, 10000)));
    if (!currentLine.trim().startsWith('|')) {
        onTabKey("shift");
        return;
    }

    let startLine: number;
    let endLine: number;
    [startLine, endLine] = markdowntable.detectTableBoundaries();
    
    const table_selection = new vscode.Selection(
        new vscode.Position(startLine, 0),
        new vscode.Position(endLine, 10000));
    let table_text = doc.getText(table_selection);

    const mdt = new markdowntable.MarkdownTable();

    const [prevline, prevcharacter] = [cur_selection.active.line - startLine, cur_selection.active.character];
    const [prevRow, prevColumn] = mdt.getCellAtPosition(table_text, prevline, prevcharacter);

    if (prevColumn <= 0 && prevRow <= 0) {
        return;
    }

    let tableData = mdt.stringToTableData(table_text);
    if (tableData.aligns[0][0] === undefined) {
        return;
    }

    if(withFormat){
        table_text = mdt.tableDataToFormatTableStr(tableData);
        editor.edit(edit => {
            edit.replace(table_selection, table_text);
        });
    }

    const newColumn = (prevColumn > 0) ? prevColumn - 1 : tableData.columns.length - 1;
    const newRow = (prevColumn > 0) ? prevRow : prevRow -1;
    const [newline, newcharacter] = mdt.getPositionOfCell(table_text, newRow, newColumn);
    let newPosition = new vscode.Position(
        table_selection.start.line + newline,
        table_selection.start.character + newcharacter);
    if( doc.getText(new vscode.Selection(
        table_selection.start.line + newline, table_selection.start.character + newcharacter, 
        table_selection.start.line + newline, table_selection.start.character + newcharacter + 1)) === ' ') {
            newPosition = new vscode.Position(
                table_selection.start.line + newline,
                table_selection.start.character + newcharacter + 1);
        }
    const newSelection = new vscode.Selection(newPosition, newPosition);

    editor.selection = newSelection;
};