import * as vscode from "vscode";
import * as markdowntable from './markdownTable';

export function deleteRows(withFormat: boolean){
    const editor = vscode.window.activeTextEditor as vscode.TextEditor;
    const doc = editor.document;
    const cur_selection = editor.selection;
    const selectionStartLine = cur_selection.start.line;
    const selectionEndLine = cur_selection.end.line;

    let startLine: number;
    let endLine: number;
    [startLine, endLine] = markdowntable.detectTableBoundaries();

    const table_selection = new vscode.Selection(
        new vscode.Position(startLine, 0),
        new vscode.Position(endLine, 10000));
    let table_text = doc.getText(table_selection);

    const mdt = new markdowntable.MarkdownTable();
    let tableData = mdt.stringToTableData(table_text);

    const deleteRowStart = selectionStartLine-startLine-2;
    const deleteRowEnd = selectionEndLine-startLine-2;
    for(let i=deleteRowStart; i<=deleteRowEnd; i++){
        mdt.deleteRow(tableData, deleteRowStart);
    }

    table_text = mdt.tableDataToStr(tableData, withFormat);
    editor.edit(edit => {
        edit.replace(table_selection, table_text);
    });
}


export async function deleteColumns(withFormat: boolean){
    const editor = vscode.window.activeTextEditor as vscode.TextEditor;
    const doc = editor.document;
    const cur_selection = editor.selection;
    let deleteColumnStart:number, deleteColumnEnd:number;
    //detect column number
    [deleteColumnStart, deleteColumnEnd] = markdowntable.detectColNumber();

    let startLine: number;
    let endLine: number;
    [startLine, endLine] = markdowntable.detectTableBoundaries();
    
    const table_selection = new vscode.Selection(
        new vscode.Position(startLine, 0),
        new vscode.Position(endLine, 10000));
    let table_text = doc.getText(table_selection);

    const mdt = new markdowntable.MarkdownTable();
    let tableData = mdt.stringToTableData(table_text);

    for(let i=deleteColumnStart!; i<=deleteColumnEnd!; i++){
        mdt.deleteColumn(tableData, deleteColumnStart!);
    }

    table_text = mdt.tableDataToStr(tableData, withFormat);
    await editor.edit(edit => {
        edit.replace(table_selection, table_text);
    });
    vscode.commands.executeCommand('SFDocs.table.prevCell');
}