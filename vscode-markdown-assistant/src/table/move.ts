import * as vscode from "vscode";
import * as markdowntable from './markdownTable';

export function moveRow(up:boolean, withFormat: boolean){
    const editor = vscode.window.activeTextEditor as vscode.TextEditor;
    const doc = editor.document;
    const cur_selection = editor.selection;
    const cursorPos = cur_selection.active;

    let startLine: number;
    let endLine: number;
    let rowLine:number = cur_selection.anchor.line;
    [startLine, endLine] = markdowntable.detectTableBoundaries();

    const table_selection = new vscode.Selection(
        new vscode.Position(startLine, 0),
        new vscode.Position(endLine, 10000));
    let table_text = doc.getText(table_selection);

    const mdt = new markdowntable.MarkdownTable();
    let tableData = mdt.stringToTableData(table_text);

    let rowNum: number = rowLine-startLine-2;
    if(up){
        if(rowNum>0){
            [tableData.cells[rowNum-1], tableData.cells[rowNum]] = [tableData.cells[rowNum], tableData.cells[rowNum-1]];
            table_text = mdt.tableDataToStr(tableData, withFormat);

            editor.edit(edit => {
                edit.replace(table_selection, table_text);
            });

            if(editor){
                let newCursorPos = cursorPos?.with({line:cursorPos.line-1, character:cursorPos.character});
                let newSelection = new vscode.Selection(newCursorPos!, newCursorPos!);
                editor.selection = newSelection;
            }
        }
    }else{
        if(rowNum<tableData.cells.length-1){
            [tableData.cells[rowNum+1], tableData.cells[rowNum]] = [tableData.cells[rowNum], tableData.cells[rowNum+1]];
            table_text = mdt.tableDataToStr(tableData, withFormat);

            editor.edit(edit => {
                edit.replace(table_selection, table_text);
            });

            if(editor){
                let newCursorPos = cursorPos?.with({line:cursorPos.line+1, character:cursorPos.character});
                let newSelection = new vscode.Selection(newCursorPos!, newCursorPos!);
                editor.selection = newSelection;
            }
        }
    }
}


export async function moveColumn(left:boolean, withFormat: boolean){
    const editor = vscode.window.activeTextEditor as vscode.TextEditor;
    const doc = editor.document;

    let startLine: number;
    let endLine: number;
    [startLine, endLine] = markdowntable.detectTableBoundaries();
    
    const table_selection = new vscode.Selection(
        new vscode.Position(startLine, 0),
        new vscode.Position(endLine, 10000));
    let table_text = doc.getText(table_selection);

    const mdt = new markdowntable.MarkdownTable();
    let tableData = mdt.stringToTableData(table_text);

    let columnNum: number = -1;
    columnNum = markdowntable.detectColNumber()[0];

    if(left){
        if(columnNum>0){
            [tableData.columns[columnNum-1], tableData.columns[columnNum]] = [tableData.columns[columnNum], tableData.columns[columnNum-1]];
            for(let i=0; i<tableData.cells.length; i++){
                [tableData.cells[i][columnNum-1], tableData.cells[i][columnNum]] = [tableData.cells[i][columnNum], tableData.cells[i][columnNum-1]];
            }
            table_text = mdt.tableDataToStr(tableData, withFormat);

            await editor.edit(edit => {
                edit.replace(table_selection, table_text);
            });
            vscode.commands.executeCommand('SFDocs.table.prevCell');
        }
    }else{
        if(columnNum<tableData.cells[0].length-1){
            [tableData.columns[columnNum+1], tableData.columns[columnNum]] = [tableData.columns[columnNum], tableData.columns[columnNum+1]];
            for(let i=0; i<tableData.cells.length; i++){
                [tableData.cells[i][columnNum+1], tableData.cells[i][columnNum]] = [tableData.cells[i][columnNum], tableData.cells[i][columnNum+1]];
            }
            table_text = mdt.tableDataToStr(tableData, withFormat);

            await editor.edit(edit => {
                edit.replace(table_selection, table_text);
            });
            vscode.commands.executeCommand('SFDocs.table.nextCell');
        }
    }
}