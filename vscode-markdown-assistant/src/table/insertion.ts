import * as vscode from "vscode";
import * as markdowntable from './markdownTable';


export function insertRow(withFormat: boolean){
    const editor = vscode.window.activeTextEditor as vscode.TextEditor;
    const doc = editor.document;
    const cur_selection = editor.selection;
    const cursorPos = cur_selection.active;
    const currentLine = new vscode.Selection(
        new vscode.Position(cur_selection.active.line, 0),
        new vscode.Position(cur_selection.active.line, 10000));
    const currentLineText = doc.getText(currentLine);
    if (!currentLineText.trim().startsWith('|')) {
        vscode.commands.executeCommand('tab');
        return;
    }

    let startLine: number;
    let endLine = cur_selection.anchor.line;
    startLine = markdowntable.detectTableBoundaries()[0];
    if(startLine===endLine){
        let nextLine:string = doc.lineAt(endLine+1).text;
        if(/^\|\s*:?-+:?\s*\|/.test(nextLine)){
            endLine++;
        }else{
            return;
        }
    }
    
    const table_selection = new vscode.Selection(
        new vscode.Position(startLine, 0),
        new vscode.Position(endLine, 10000));
    let table_text = doc.getText(table_selection);

    const mdt = new markdowntable.MarkdownTable();
    let tableData = mdt.stringToTableData(table_text);
    if (tableData.aligns[0][0] === undefined) {
        return;
    }

    tableData = mdt.insertRow(tableData, tableData.cells.length);
    table_text = mdt.tableDataToStr(tableData, withFormat);
    

    editor.edit(edit => {
        edit.replace(table_selection, table_text);
    });

    if(editor){
        let newCursorPos = cursorPos?.with({line:endLine+1, character:1});
        let newSelection = new vscode.Selection(newCursorPos!, newCursorPos!);
        editor.selection = newSelection;
    }
}


export function insertColumn(isLeft: boolean, withFormat: boolean){
    const editor = vscode.window.activeTextEditor as vscode.TextEditor;
    const doc = editor.document;
    const cur_selection = editor.selection;
    if (!editor.selection.isEmpty) {
        vscode.window.showErrorMessage('Table: Insert command doesn\'t allowed range selection.');
        return;
    }

    let startLine: number;
    let endLine: number;
    [startLine, endLine] = markdowntable.detectTableBoundaries();
    
    const table_selection = new vscode.Selection(
        new vscode.Position(startLine, 0),
        new vscode.Position(endLine, 10000));
    const table_text = doc.getText(table_selection);

    const mdt = new markdowntable.MarkdownTable();

    const [prevline, prevcharacter] = [cur_selection.active.line - startLine, cur_selection.active.character];
    const [prevRow, prevColumn] = mdt.getCellAtPosition(table_text, prevline, prevcharacter);

    const insertPosition = isLeft ? prevColumn : prevColumn + 1;

    const tableData = mdt.stringToTableData(table_text);
    const newTableData = mdt.insertColumn(tableData, insertPosition, isLeft);
    const newTableText = mdt.tableDataToStr(newTableData, withFormat);

    editor.edit(edit => {
        edit.replace(table_selection, newTableText);
    });

    const newColumn = insertPosition;
    const [newline, newcharacter] = mdt.getPositionOfCell(newTableText, prevRow, newColumn);
    const newPosition = new vscode.Position(
        table_selection.start.line + newline,
        table_selection.start.character + newcharacter + 1);
    const newSelection = new vscode.Selection(newPosition, newPosition);

    editor.selection = newSelection;
};
