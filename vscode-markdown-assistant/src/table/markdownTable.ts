import * as vscode  from "vscode";

class TableData {
    public aligns : [string, string][] ;
    public columns : string[];
    public cells: string [][];
    public leftovers : string[];
    public indent : string;

    constructor(_aligns: [string, string][], _columns : string[], _cells: string [][], _leftovers : string[], _indent : string){
        this.aligns = _aligns;
        this.columns = _columns;
        this.cells = _cells;
        this.leftovers = _leftovers;
        this.indent = _indent;
    }
};

export class MarkdownTable {
    public isEmptyRow(data:TableData, rowNum: number){
        for (let i = 0; i < data.cells[rowNum].length; i++) {
            if(/^\s$/.test(data.cells[rowNum][i]) || data.cells[rowNum][i].length===0){
                continue;
            }else{
                return false;
            }
        }

        return true;
    }

    public isEmptyColumn(data:TableData, colNum: number){
        for (let i = 0; i < data.cells.length; i++) {
            if(/^\s$/.test(data.cells[i][colNum]) || data.cells[i][colNum].length===0){
                continue;
            }else{
                return false;
            }
        }

        return true;
    }

    public deleteRow(data:TableData, rowNum: number){
        if(rowNum>=data.cells.length){
            return;
        }
        data.cells.splice(rowNum, 1);
    }

    public deleteColumn(data:TableData, colNum: number){
        if(colNum>=data.cells[0].length){
            return;
        }
        for (let i = 0; i < data.cells.length; i++) {
            data.cells[i].splice(colNum, 1);
        }
        data.columns.splice(colNum, 1);
    }

    public stringToTableData(tableText :string) :TableData {
        let lines = tableText.split(/\r\n|\n|\r/);
        
        let splitline = (linestr: string, datasNumMin :number, fillstr :string = '') => {
            linestr = linestr.trim();
            if (linestr.startsWith('|')) {
                linestr = linestr.slice(1);
            }
            if (linestr.endsWith('|')) {
                linestr = linestr.slice(0, -1);
            }
            let linedatas = linestr.split('|');

            let datas : string[] = new Array(datasNumMin).fill(fillstr);
            for (let i = 0; i < linedatas.length; i++) {
                datas[i] = linedatas[i];
            }
            return datas;
        };

        let getIndent = (linestr: string) => {
            if (linestr.trim().startsWith('|')) {
                let linedatas = linestr.split('|');
                return linedatas[0];
            }
            else {
                return '';
            }
        };

        let columns = splitline(lines[0], 0).map((v)=> v.trim());
        let columnNum = columns.length;
        let indent = getIndent(lines[0]);

        let aligns : [string, string][] = new Array();
        let aligndatas = splitline(lines[1], columnNum, '---').map((v)=> v.trim());
        for (let i = 0; i < columnNum; i++) {
            let celldata = aligndatas[i];
            aligns[i] = [celldata[0], celldata.slice(-1)];
        }

        let cells : string [][] = new Array();
        let leftovers : string[] = new Array();
        let cellrow = -1;
        for (let row = 2; row < lines.length; row++) {
            cellrow++;

            let linedatas = splitline(lines[row], columnNum);
            cells[cellrow] = linedatas.slice(0, columnNum).map((v)=> v.trim());

            leftovers[cellrow] = '';
            if (linedatas.length > columnNum)
            {
                let leftoverdatas = linedatas.slice(columnNum, linedatas.length);
                leftovers[cellrow] = leftoverdatas.join('|');
            }
        }
        
        return new TableData(aligns, columns, cells, leftovers, indent);
    }

    public tsvToTableData(srcText :string) : TableData {
        let lines = srcText.split(/\r\n|\n|\r/);
        let columns : string[] = new Array();
        let columntexts = lines[0].split('\t');
        let columnCount = columntexts.length;

        for (let i = 0; i < columnCount; i++) {
            columns[i] = columntexts[i].trim();
        }

        let cells: string [][] = new Array();
        let leftovers : string[] = new Array();
        for (let row = 1; row < lines.length; row++) {
            cells[row - 1] = new Array();
            for (let column = 0; column < columnCount; column++) {
                cells[row - 1][column] = ' ';
            }

            leftovers[row - 1] = '';

            let lineValues = lines[row].split('\t');

            for (let column = 0; column < lineValues.length; column++) {
                if(column >= columnCount){
                    leftovers[row - 1] += '\t' + lineValues[column];
                    continue;
                }
                cells[row - 1][column] = lineValues[column].trim();
            }
        }

        let aligns : [string, string][] = new Array();
        for (let column = 0; column < columnCount; column++) {
            aligns[column] = [':', '-'];
        }

        return new TableData(aligns, columns, cells, leftovers, '');
    }

    public tableDataToTableStr(data :TableData) : string {
        let tableString = "";

        tableString += data.indent;
        for (let i = 0; i < data.columns.length; i++) {
            tableString += '| ' + data.columns[i] + ' ';
        }
        tableString += '|\r\n';
        tableString += data.indent;
        for (let i = 0; i < data.columns.length; i++) {
            let [front, end] = data.aligns[i];
            tableString += '| ' + front + '-' + end + ' ';
        }
        tableString += '|\r\n';
        for (let row = 0; row < data.cells.length; row++) {
            tableString += data.indent;
            for (let i = 0; i < data.cells[row].length; i++) {
                tableString += '| ' + data.cells[row][i] + ' ';
            }
            tableString += '|';

            if (data.leftovers[row] !== '') {
                tableString += data.leftovers[row];
            }

            if (row+1 < data.cells.length) {
                tableString += '\r\n';
            }
        }

        return tableString;
    }

    public getLen(str :string) :number {
        let length = 0;
        for(let i=0; i<str.length; i++) {
            let chp = str.codePointAt(i);
            if (chp === undefined) {
                continue;
            }
            let chr = chp as number;
            if (this.doesUse0Space(chr)) {
                length += 0;
            }
            else if (this.doesUse3Spaces(chr)) {
                length += 3;
            }
            else if (this.doesUse2Spaces(chr)) {
                length += 2;
            }
            else {
                length += 1;
            }

            let chc = str.charCodeAt(i);
            if (chc >= 0xD800 && chc <= 0xDBFF) {
                i++;
            }
        }
        return length;
    };

    private doesUse0Space(charCode :number): boolean {
        if ((charCode === 0x02DE) || 
            (charCode >= 0x0300 && charCode <= 0x036F) ||
            (charCode >= 0x0483 && charCode <= 0x0487) ||
            (charCode >= 0x0590 && charCode <= 0x05CF) ) {
            return true;
        }
        return false;
    }

    private doesUse2Spaces(charCode :number): boolean {
        if ((charCode >= 0x2480 && charCode <= 0x24FF) ||
            (charCode >= 0x2600 && charCode <= 0x27FF) ||
            (charCode >= 0x2900 && charCode <= 0x2CFF) ||
            (charCode >= 0x2E00 && charCode <= 0xFF60) ||
            (charCode >= 0xFFA0) ) {
            return true;
        }
        return false;
    }

    private doesUse3Spaces(charCode :number): boolean {
        if (charCode >= 0x1F300 && charCode <= 0x1FBFF) {
            return true;
        }
        return false;
    }

    public tableDataToFormatTableStr(tableData :TableData) :string {
        let alignData = <boolean> vscode.workspace.getConfiguration('markdowntable').get('alignData');
        let alignHeader = <boolean> vscode.workspace.getConfiguration('markdowntable').get('alignColumnHeader');
        let columnNum = tableData.columns.length;

        let maxWidths : number[] = new Array();
        for (let i = 0; i < tableData.columns.length; i++) {
            let cellLength = this.getLen(tableData.columns[i].trim());
            maxWidths[i] = (3 > cellLength) ? 3 : cellLength;
        }

        for (let row = 0; row < tableData.cells.length; row++) {
            let cells = tableData.cells[row];
            for (let i = 0; i < cells.length; i++) {
                if (i > columnNum) { break; }
                let cellLength = this.getLen(cells[i].trim());
                maxWidths[i] = (maxWidths[i] > cellLength) ? maxWidths[i] : cellLength;
            }
        }

        let formatted : string[] = new Array();

        for (let row = 0; row < tableData.cells.length; row++) {
            formatted[row] = '';
            formatted[row] += tableData.indent;
            let cells = tableData.cells[row];
            for (let i = 0; i < columnNum; i++) {
                let celldata = '';
                if (i < cells.length) {
                    celldata = cells[i].trim();
                }
                let celldata_length = this.getLen(celldata);

                formatted[row] += '| ';
                if (alignData) {
                    let [front, end] = tableData.aligns[i];
                    if (front === ':' && end === ':') {
                        for(let n = 0; n < (maxWidths[i] - celldata_length) / 2 - 0.5; n++) {
                            formatted[row] += ' ';
                        }
                        formatted[row] += celldata;
                        for(let n = 0; n < (maxWidths[i] - celldata_length) / 2; n++) {
                            formatted[row] += ' ';
                        }
                    }
                    else if (front === '-' && end === ':') {
                        for(let n = 0; n < maxWidths[i] - celldata_length; n++) {
                            formatted[row] += ' ';
                        }
                        formatted[row] += celldata;
                    }
                    else {
                        formatted[row] += celldata;
                        for(let n = 0; n < maxWidths[i] - celldata_length; n++) {
                            formatted[row] += ' ';
                        }
                    }
                }
                else {
                    formatted[row] += celldata;
                    for(let n = celldata_length; n < maxWidths[i]; n++) {
                        formatted[row] += ' ';
                    }
                }
                formatted[row] += ' ';
            }
            formatted[row] += '|';

            if (tableData.leftovers[row].length > 0) {
                formatted[row] += tableData.leftovers[row];
            }
        }

        let columnHeader = '';
        columnHeader += tableData.indent;
        for (let i = 0; i < columnNum; i++) {
            let columnHeader_length = this.getLen(tableData.columns[i]);

            columnHeader += '| ';
            if (alignHeader) {
                let [front, end] = tableData.aligns[i];
                if (front === ':' && end === ':') {
                    for(let n = 0; n < (maxWidths[i] - columnHeader_length) / 2 - 0.5; n++) {
                        columnHeader += ' ';
                    }
                    columnHeader += tableData.columns[i];
                    for(let n = 0; n < (maxWidths[i] - columnHeader_length) / 2; n++) {
                        columnHeader += ' ';
                    }
                }
                else if (front === '-' && end === ':') {
                    for(let n = 0; n < maxWidths[i] - columnHeader_length; n++) {
                        columnHeader += ' ';
                    }
                    columnHeader += tableData.columns[i];
                }
                else {
                    columnHeader += tableData.columns[i];
                    for(let n = 0; n < maxWidths[i] - columnHeader_length; n++) {
                        columnHeader += ' ';
                    }
                }

            }
            else {
                columnHeader += tableData.columns[i];
                for(let n = columnHeader_length; n < maxWidths[i]; n++) {
                    columnHeader += ' ';
                }
            }
            columnHeader += ' ';
        }
        columnHeader += '|';


        let tablemark = '';
        tablemark += tableData.indent;
        for (let i = 0; i < columnNum; i++) {
            let [front, end] = tableData.aligns[i];
            tablemark += '| ' + front;

            for(let n = 1; n < maxWidths[i] - 1; n++) {
                tablemark += '-';
            }
            tablemark += end + ' ';
        }
        tablemark += '|';

        formatted.splice(0, 0, columnHeader);
        formatted.splice(1, 0, tablemark);

        return formatted.join('\r\n');
    }

    public tableDataToStr(tableData: TableData, withFormat: boolean): string{
        if(withFormat){
            return this.tableDataToFormatTableStr(tableData);
        }else{
            return this.tableDataToTableStr(tableData);
        }
    }

    public insertRow(tableData :TableData, insertAt :number) : TableData {
        let columns = tableData.columns;
        let aligns = tableData.aligns;
        let cells = tableData.cells;
        let leftovers = tableData.leftovers;
        let column_num = tableData.columns.length;
        let indent = tableData.indent;

        cells.splice(insertAt, 0, Array.from({length: column_num}, () => ''));
        leftovers.splice(insertAt, 0, '');
        
        return new TableData(aligns, columns, cells, leftovers, indent);
    }

    public insertColumn(tableData :TableData, insertAt :number, isLeft: boolean) : TableData {
        let columns = tableData.columns;
        let aligns = tableData.aligns;
        let cells = tableData.cells;
        let leftovers = tableData.leftovers;
        let column_num = tableData.columns.length;
        let indent = tableData.indent;

        columns.splice(insertAt, 0, '');
        aligns.splice(insertAt, 0, isLeft?aligns[insertAt]:aligns[insertAt-1]);
        for (let i = 0; i < cells.length; i++)
        {
            cells[i].splice(insertAt, 0, '');
        }

        return new TableData(aligns, columns, cells, leftovers, indent);
    }

    // return [line, character]
    public getPositionOfCell(tableText :string, cellRow :number, cellColumn :number) : [number, number] {
        let line = (cellRow <= 0) ? 0 : cellRow;
        let character = 0;

        let lines = tableText.split(/\r\n|\n|\r/);
        let linestr = lines[line];
        let column = -1;
        for (let n = 0; n < linestr.length; n++) {
            if (linestr[n] === '|') {
                column++;
            }

            if (column >= cellColumn) {
                character = n + 1;
                break;
            }

            character = n;
        }

        return [line, character];
    }

    // return [row, column]
    public getCellAtPosition(tableText :string, line :number, character :number) {
        let row = (line <= 0) ? 0 : line;

        let lines = tableText.split(/\r\n|\n|\r/);
        let linestr = lines[line];

        let column = -1;

        for (let n = 0; n < character; n++) {
            if (linestr[n] === '|') {
                column++;
            }
        }

        return [row, column];
    }
}


export function detectColNumber():[number, number]{
    const editor = vscode.window.activeTextEditor as vscode.TextEditor;
    const doc = editor.document;
    const cur_selection = editor.selection;
    const cur_line_text = doc.lineAt(cur_selection.start.line).text;
    let columnStart:number, columnEnd:number;
    //detect column number
    let columnCount: number = 0;
    for(let i=0; i<=cur_selection.end.character; i++){
        if(cur_line_text.charAt(i)==='|' && !(i===cur_selection.end.character)){
            columnCount++;
        }

        if(i===cur_selection.start.character){
            columnStart = columnCount-1;
        }
        if(i===cur_selection.end.character){
            columnEnd = columnCount-1;
        }
    }

    return [columnStart!, columnEnd!];
}


export function detectTableBoundaries():[number, number]{
    const editor = vscode.window.activeTextEditor as vscode.TextEditor;
    const doc = editor.document;
    const cur_selection = editor.selection;
    const currentLine = new vscode.Selection(
        new vscode.Position(cur_selection.active.line, 0),
        new vscode.Position(cur_selection.active.line, 10000));
    const currentLineText = doc.getText(currentLine);
    if (!currentLineText.trim().startsWith('|')) {
        return [-1, -1];
    }

    let startLine = cur_selection.anchor.line;
    let endLine = cur_selection.anchor.line;
    while (startLine - 1 >= 0) {
        const line_selection = new vscode.Selection(
            new vscode.Position(startLine - 1, 0),
            new vscode.Position(startLine - 1, 10000));

        const line_text = doc.getText(line_selection);
        if (!line_text.trim().startsWith('|')) {
            break;
        }
        startLine--;
    }
    while (endLine + 1 < doc.lineCount) {
        const line_selection = new vscode.Selection(
            new vscode.Position(endLine + 1, 0),
            new vscode.Position(endLine + 1, 10000));

        const line_text = doc.getText(line_selection);
        if (!line_text.trim().startsWith('|')) {
            break;
        }
        endLine++;
    }
    return [startLine, endLine];
}