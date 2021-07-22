import * as vscode from "vscode";
import * as markdowntable from './markdownTable';

export function copyColumn(){
    const editor = vscode.window.activeTextEditor as vscode.TextEditor;
    const doc = editor.document;
    const cur_selection = editor.selection;
    const currentLine = new vscode.Selection(
        new vscode.Position(cur_selection.active.line, 0),
        new vscode.Position(cur_selection.active.line, 10000));
    const currentLineText = doc.getText(currentLine);
    if (!currentLineText.trim().startsWith('|')) {
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
    let tableData = mdt.stringToTableData(table_text);
    if (tableData.aligns[0][0] === undefined) {
        return;
    }

    let colNum:number = markdowntable.detectColNumber()[0];
    let columnStr: string = '| ' + tableData.columns[colNum] + ' |' + '\r\n';
    let [front, end] = tableData.aligns[colNum];
    columnStr += '| ' + front + '-' + end + ' |' + '\r\n';
    for(let i=0; i<tableData.cells.length; i++){
        columnStr += '| ' + tableData.cells[i][colNum] + ' |' + '\r\n';
    }

    vscode.env.clipboard.writeText(columnStr);
}

export async function pasteColumn(toLeft:boolean, withFormat: boolean){
    //constructing a table of the copied
    const mdt = new markdowntable.MarkdownTable();
    const text = await vscode.env.clipboard.readText();
    let colTableData = mdt.stringToTableData(text);
    //constructing the table to insert in
    const editor = vscode.window.activeTextEditor as vscode.TextEditor;
    const doc = editor.document;
    const cur_selection = editor.selection;
    const currentLine = new vscode.Selection(
        new vscode.Position(cur_selection.active.line, 0),
        new vscode.Position(cur_selection.active.line, 10000));
    const currentLineText = doc.getText(currentLine);
    if (!currentLineText.trim().startsWith('|')) {
        return;
    }

    let startLine: number;
    let endLine: number;
    [startLine, endLine] = markdowntable.detectTableBoundaries();
    
    
    const table_selection = new vscode.Selection(
        new vscode.Position(startLine, 0),
        new vscode.Position(endLine, 10000));
    let table_text = doc.getText(table_selection);

    let tableData = mdt.stringToTableData(table_text);
    if (tableData.aligns[0][0] === undefined) {
        return;
    }

    let colNum:number = markdowntable.detectColNumber()[0];
    if(toLeft){
        tableData.columns.splice(colNum, 0, colTableData.columns[0]);
        tableData.aligns.splice(colNum, 0, colTableData.aligns[0]);
        for(let i=0; i<tableData.cells.length; i++){
            tableData.cells[i].splice(colNum, 0, colTableData.cells[i][0]);
        }
        table_text = mdt.tableDataToStr(tableData, withFormat);

        await editor.edit(edit => {
            edit.replace(table_selection, table_text);
        });

        if(colNum===0){
            const newPosition: vscode.Position = cur_selection.start.with({character:2});
            const newSelection = new vscode.Selection(newPosition, newPosition);
        
            editor.selection = newSelection;
        }
    }else{
        tableData.columns.splice(colNum+1, 0, colTableData.columns[0]);
        tableData.aligns.splice(colNum+1, 0, colTableData.aligns[0]);
        for(let i=0; i<tableData.cells.length; i++){
            tableData.cells[i].splice(colNum+1, 0, colTableData.cells[i][0]);
        }
        table_text = mdt.tableDataToStr(tableData, withFormat);

        await editor.edit(edit => {
            edit.replace(table_selection, table_text);
        });
        vscode.commands.executeCommand('sfdocs.table.nextCell');
    }
}