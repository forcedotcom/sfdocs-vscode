import * as vscode from "vscode";
import * as markdowntable from './markdownTable';

export async function pasteTable(withFormat: boolean){
    const text = await vscode.env.clipboard.readText();
    const editor = vscode.window.activeTextEditor;

    const mdt = new markdowntable.MarkdownTable();
    let tableData = mdt.tsvToTableData(text);

    //delete the empty rows
    for(let i=0; i<tableData.cells.length; i++){
        if(mdt.isEmptyRow(tableData, i)){
            mdt.deleteRow(tableData, i);
        }
    }
    //delete the empty columns
    for(let i=0; i<tableData.cells[0].length; i++){
        if(mdt.isEmptyColumn(tableData, i)){
            mdt.deleteColumn(tableData, i);
        }
    }
    const newTableStr = mdt.tableDataToStr(tableData, withFormat);

    if(editor){
        return vscode.commands.executeCommand("editor.action.insertSnippet", { "snippet":`${newTableStr}` });
    }
}