import * as vscode from "vscode";
import * as markdowntable from './markdownTable';

export function format(){
    const editor = vscode.window.activeTextEditor as vscode.TextEditor;
    const doc = editor.document;
    const cur_selection = editor.selection;
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
    [startLine, endLine] = markdowntable.detectTableBoundaries();

    const table_selection = new vscode.Selection(
        new vscode.Position(startLine, 0),
        new vscode.Position(endLine, 10000));
    let table_text = doc.getText(table_selection);

    const mdt = new markdowntable.MarkdownTable();
    let tableData = mdt.stringToTableData(table_text);
    if (tableData.aligns[0][0] === undefined) {
        return;
    }

    table_text = mdt.tableDataToFormatTableStr(tableData);

    editor.edit(edit => {
        edit.replace(table_selection, table_text);
    });
}


export function removeFormatting(){
    const editor = vscode.window.activeTextEditor as vscode.TextEditor;
    const doc = editor.document;
    const cur_selection = editor.selection;
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
    [startLine, endLine] = markdowntable.detectTableBoundaries();

    const table_selection = new vscode.Selection(
        new vscode.Position(startLine, 0),
        new vscode.Position(endLine, 10000));
    let table_text = doc.getText(table_selection);

    const mdt = new markdowntable.MarkdownTable();
    let tableData = mdt.stringToTableData(table_text);
    if (tableData.aligns[0][0] === undefined) {
        return;
    }

    table_text = mdt.tableDataToTableStr(tableData);

    editor.edit(edit => {
        edit.replace(table_selection, table_text);
    });
}