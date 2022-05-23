import { Selection, env} from 'vscode';
import * as assert from 'assert';
import * as tableGenerator from '../../../table/generator';
import {testCommand, resetConfiguration, updateConfiguration} from "../utils";

suite("Table", function () {

    suiteTeardown(async () => {
        await resetConfiguration();
    });

    test("parseInputCorrectInputFormat", function() {
        var expected_valid : boolean = true;
        var expected_columns = "3";
        var expected_rows = "3";
        var result = tableGenerator.parseInput("3,3");
        assert.equal( expected_valid, result.valid);
        assert.equal( expected_rows, result.rows);
        assert.equal( expected_columns, result.columns);
    });

    test("parseInputWrongInputFormat", () => {
        var expected_valid : boolean = true;
        var expected_columns = "3";
        var expected_rows = "3";
        var result = tableGenerator.parseInput("3,b");
        assert.notEqual( expected_valid, result.valid);
        assert.notEqual( expected_rows, result.rows);
        assert.notEqual( expected_columns, result.columns);
        
    });

    test("generateString3,3,center", () => {
        
        var expected_string = "|       |       |       |" + '\n' +    
                            "| :---: | :---: | :---: |" + '\n' +
                            "|       |       |       |" + '\n' +
                            "|       |       |       |" + '\n' +
                            "|       |       |       |" + '\n' + '\n' ;
        var result_string = tableGenerator.generateString("3", "3", "center");
        assert.equal( expected_string, result_string );
        
    });

    test("Tables: Next Cell", () => {
        return testCommand('SFDocs.table.nextCell',
            [
                "|       |       |       |" ,    
                "| :---: | :---: | :---: |" ,
                "|       |       |       |" ,
                "|       |       |       |" ,
                "|       |       |       |" + '\n'
            ],
            new Selection(0, 1, 0, 1),
            [
                '|     |     |     |',
                '| :-: | :-: | :-: |',
                '|     |     |     |',
                '|     |     |     |',
                '|     |     |     |' + '\n'
            ],
            new Selection(0, 8, 0, 8));
    });

    test("Tables: Next Cell, without formating", async () => {
        await updateConfiguration({ config: [["SFDocs.markdownAssistant.table.autoFormat", false]] });
        await testCommand('SFDocs.table.nextCell',
            [
                "|       |       |       |" ,    
                "| :---: | :---: | :---: |" ,
                "|       |       |       |" ,
                "|       |       |       |" ,
                "|       |       |       |" + '\n'
            ],
            new Selection(0, 1, 0, 1),
            [
                "|       |       |       |" ,    
                "| :---: | :---: | :---: |" ,
                "|       |       |       |" ,
                "|       |       |       |" ,
                "|       |       |       |" + '\n'
            ],
            new Selection(0, 10, 0, 10));
        await resetConfiguration();
    });

    test("Tables: Previous Cell", () => {
        return testCommand('SFDocs.table.prevCell',
            [
                "|       |       |       |" ,    
                "| :---: | :---: | :---: |" ,
                "|       |       |       |" ,
                "|       |       |       |" ,
                "|       |       |       |" + '\n'
            ],
            new Selection(0, 10, 0, 10),
            [
                '|     |     |     |',
                '| :-: | :-: | :-: |',
                '|     |     |     |',
                '|     |     |     |',
                '|     |     |     |' + '\n'
            ],
            new Selection(0, 2, 0, 2));
    });

    test("Tables: Previous Cell, without formating", async () => {
        await updateConfiguration({ config: [["SFDocs.markdownAssistant.table.autoFormat", false]] });
        await testCommand('SFDocs.table.prevCell',
            [
                "|       |       |       |" ,    
                "| :---: | :---: | :---: |" ,
                "|       |       |       |" ,
                "|       |       |       |" ,
                "|       |       |       |" + '\n'
            ],
            new Selection(0, 10, 0, 10),
            [
                "|       |       |       |" ,    
                "| :---: | :---: | :---: |" ,
                "|       |       |       |" ,
                "|       |       |       |" ,
                "|       |       |       |" + '\n'
            ],
            new Selection(0, 2, 0, 2));
        await resetConfiguration();
    });

    test("Tables: Insert Row", async() => {
        await resetConfiguration();
        return testCommand('SFDocs.table.insertRow',
            [
                "|       |       |       |" ,    
                "| :---: | :---: | :---: |" ,
                "|       |       |       |" ,
                "|       |       |       |" ,
                "|       |       |       |" + '\n'
            ],
            new Selection(0, 1, 0, 1),
            [
                '|     |     |     |',
                '| :-: | :-: | :-: |',
                '|     |     |     |',
                "|       |       |       |" ,
                "|       |       |       |" ,
                "|       |       |       |" + '\n'
            ],
            new Selection(2, 1, 2, 1));
    });

    test("Tables: Insert Row, without formating", async () => {
        await updateConfiguration({ config: [["SFDocs.markdownAssistant.table.autoFormat", false]] });
        await testCommand('SFDocs.table.insertRow',
        [
            "|       |       |       |" ,    
            "| :---: | :---: | :---: |" ,
            "|       |       |       |" ,
            "|       |       |       |" ,
            "|       |       |       |" + '\n'
        ],
        new Selection(0, 1, 0, 1),
        [
            '|  |  |  |',
            '| :-: | :-: | :-: |',
            '|  |  |  |',
            "|       |       |       |" ,
            "|       |       |       |" ,
            "|       |       |       |" + '\n'
        ],
        new Selection(2, 1, 2, 1));
        await resetConfiguration();
    });

    test("Tables: Move Column Right", async() => {
        await resetConfiguration();
        return testCommand('SFDocs.table.moveColumnRight',
            [
                "|   A   |   B   |   C   |" ,    
                "| :---: | :---: | :---: |" ,
                "|       |       |       |" ,
                "|       |       |       |" ,
                "|       |       |       |" + '\n'
            ],
            new Selection(0, 11, 0, 11),
            [
                '| A   | C   | B   |',
                '| :-: | :-: | :-: |',
                '|     |     |     |',
                '|     |     |     |',
                '|     |     |     |' + '\n'
            ],
            new Selection(0, 14, 0, 14));
    });

    test("Tables: Move Column Right, without formating", async () => {
        await updateConfiguration({ config: [["SFDocs.markdownAssistant.table.autoFormat", false]] });
        await testCommand('SFDocs.table.moveColumnRight',
        [
            "|   A   |   B   |   C   |" ,    
            "| :---: | :---: | :---: |" ,
            "|       |       |       |" ,
            "|       |       |       |" ,
            "|       |       |       |" + '\n'
        ],
        new Selection(0, 11, 0, 11),
        [
            '| A | C | B |',
            '| :-: | :-: | :-: |',
            '|  |  |  |',
            '|  |  |  |',
            '|  |  |  |' + '\n'
        ],
        new Selection(1, 2, 1, 2));
        await resetConfiguration();
    });

    test("Tables: Move Column Left", async() => {
        await resetConfiguration();
        return testCommand('SFDocs.table.moveColumnLeft',
            [
                "|   A   |   B   |   C   |" ,    
                "| :---: | :---: | :---: |" ,
                "|       |       |       |" ,
                "|       |       |       |" ,
                "|       |       |       |" + '\n'
            ],
            new Selection(0, 11, 0, 11),
            [
                '| B   | A   | C   |',
                '| :-: | :-: | :-: |',
                '|     |     |     |',
                '|     |     |     |',
                '|     |     |     |' + '\n'
            ],
            new Selection(0, 2, 0, 2));
    });

    test("Tables: Move Column Left, without formating", async () => {
        await updateConfiguration({ config: [["SFDocs.markdownAssistant.table.autoFormat", false]] });
        await testCommand('SFDocs.table.moveColumnLeft',
        [
            "|   A   |   B   |   C   |" ,    
            "| :---: | :---: | :---: |" ,
            "|       |       |       |" ,
            "|       |       |       |" ,
            "|       |       |       |" + '\n'
        ],
        new Selection(0, 11, 0, 11),
        [
            '| B | A | C |',
            '| :-: | :-: | :-: |',
            '|  |  |  |',
            '|  |  |  |',
            '|  |  |  |' + '\n'
        ],
        new Selection(0, 6, 0, 6));
        await resetConfiguration();
    });
    
    test("Paste Table", async () => {
        let sampleTable = `Category	Budget	Actual	Difference
        AutoXZ	₹ 200.00	₹ 90.00	₹ 110.00
        Entertainment	₹ 200.00	₹ 32.00	₹ 168.00
        Food	₹ 350.00	₹ 205.75	₹ 144.25
        Home	₹ 300.00	₹ 250.00	₹ 50.00
        Medical	₹ 100.00	₹ 35.00	₹ 65.00
        Personal Items	₹ 300.00	₹ 80.00	₹ 220.00
        Travel	₹ 500.00	₹ 350.00	₹ 150.00
        Utilities	₹ 200.00	₹ 100.00	₹ 100.00
        Other	₹ 50.00	₹ 60.00	(₹ 10.00)
        Total	₹ 2,200.00	₹ 1,202.75	₹ 997.25`;

        let expectedMarkdownTable = `| Category       | Budget     | Actual     | Difference |
| :------------- | :--------- | :--------- | :--------- |
| AutoXZ         | ₹ 200.00   | ₹ 90.00    | ₹ 110.00   |
| Entertainment  | ₹ 200.00   | ₹ 32.00    | ₹ 168.00   |
| Food           | ₹ 350.00   | ₹ 205.75   | ₹ 144.25   |
| Home           | ₹ 300.00   | ₹ 250.00   | ₹ 50.00    |
| Medical        | ₹ 100.00   | ₹ 35.00    | ₹ 65.00    |
| Personal Items | ₹ 300.00   | ₹ 80.00    | ₹ 220.00   |
| Travel         | ₹ 500.00   | ₹ 350.00   | ₹ 150.00   |
| Utilities      | ₹ 200.00   | ₹ 100.00   | ₹ 100.00   |
| Other          | ₹ 50.00    | ₹ 60.00    | (₹ 10.00)  |
| Total          | ₹ 2,200.00 | ₹ 1,202.75 | ₹ 997.25   |`;
        
        env.clipboard.writeText(sampleTable);
        await resetConfiguration();
        return testCommand('SFDocs.table.pasteTable',
        [], new Selection(0, 0, 0, 0),
        [expectedMarkdownTable], new Selection(11, 57, 11, 57)
        );
    });

    test("Paste Table, without formating", async () => {
        let sampleTable = `Category	Budget	Actual	Difference
        AutoXZ	₹ 200.00	₹ 90.00	₹ 110.00
        Entertainment	₹ 200.00	₹ 32.00	₹ 168.00
        Food	₹ 350.00	₹ 205.75	₹ 144.25
        Home	₹ 300.00	₹ 250.00	₹ 50.00
        Medical	₹ 100.00	₹ 35.00	₹ 65.00
        Personal Items	₹ 300.00	₹ 80.00	₹ 220.00
        Travel	₹ 500.00	₹ 350.00	₹ 150.00
        Utilities	₹ 200.00	₹ 100.00	₹ 100.00
        Other	₹ 50.00	₹ 60.00	(₹ 10.00)
        Total	₹ 2,200.00	₹ 1,202.75	₹ 997.25`;

        let expectedMarkdownTable = `| Category | Budget | Actual | Difference |
| :-- | :-- | :-- | :-- |
| AutoXZ | ₹ 200.00 | ₹ 90.00 | ₹ 110.00 |
| Entertainment | ₹ 200.00 | ₹ 32.00 | ₹ 168.00 |
| Food | ₹ 350.00 | ₹ 205.75 | ₹ 144.25 |
| Home | ₹ 300.00 | ₹ 250.00 | ₹ 50.00 |
| Medical | ₹ 100.00 | ₹ 35.00 | ₹ 65.00 |
| Personal Items | ₹ 300.00 | ₹ 80.00 | ₹ 220.00 |
| Travel | ₹ 500.00 | ₹ 350.00 | ₹ 150.00 |
| Utilities | ₹ 200.00 | ₹ 100.00 | ₹ 100.00 |
| Other | ₹ 50.00 | ₹ 60.00 | (₹ 10.00) |
| Total | ₹ 2,200.00 | ₹ 1,202.75 | ₹ 997.25 |`;
        
        env.clipboard.writeText(sampleTable);
        await updateConfiguration({ config: [["SFDocs.markdownAssistant.table.autoFormat", false]] });
        await testCommand('SFDocs.table.pasteTable',
        [], new Selection(0, 0, 0, 0),
        [expectedMarkdownTable], new Selection(11, 46, 11, 46));
        await resetConfiguration();
    });

    test("Tables: Delete Selected Columns", async() => {
        await resetConfiguration();
        return testCommand('SFDocs.table.deleteColumns',
            [
                "|   A   |   B   |   C   |" ,    
                "| :---: | :---: | :---: |" ,
                "|       |       |       |" ,
                "|       |       |       |" ,
                "|       |       |       |" + '\n'
            ],
            new Selection(0, 1, 0, 11),
            [
                '| C   |',
                '| :-: |',
                '|     |',
                '|     |',
                '|     |' + '\n'
            ],
            new Selection(0, 2, 0, 2));
    });

    test("Tables: Delete Selected Columns, without formating", async () => {
        await updateConfiguration({ config: [["SFDocs.markdownAssistant.table.autoFormat", false]] });
        await testCommand('SFDocs.table.deleteColumns',
        [
            "|   A   |   B   |   C   |" ,    
            "| :---: | :---: | :---: |" ,
            "|       |       |       |" ,
            "|       |       |       |" ,
            "|       |       |       |" + '\n'
        ],
        new Selection(0, 1, 0, 11),
        [
            '| C |',
            '| :-: |',
            '|  |',
            '|  |',
            '|  |' + '\n'
        ],
        new Selection(0, 2, 0, 2));
        await resetConfiguration();
    });

    test("Tables: Delete Selected Rows", async() => {
        await resetConfiguration();
        return testCommand('SFDocs.table.deleteRows',
            [
                "|   A   |   B   |   C   |" ,    
                "| :---: | :---: | :---: |" ,
                "|   D   |   E   |   F   |" ,
                "|       |       |       |" ,
                "|       |       |       |" + '\n'
            ],
            new Selection(2, 1, 2, 1),
            [
                "| A   | B   | C   |",
                "| :-: | :-: | :-: |",
                "|     |     |     |",
                "|     |     |     |" + '\n'
            ],
            new Selection(2, 13, 2, 13));
    });

    test("Tables: Delete Selected Rows, without formating", async () => {
        await updateConfiguration({ config: [["SFDocs.markdownAssistant.table.autoFormat", false]] });
        await testCommand('SFDocs.table.deleteRows',
        [
            "|   A   |   B   |   C   |" ,    
            "| :---: | :---: | :---: |" ,
            "|   D   |   E   |   F   |" ,
            "|       |       |       |" ,
            "|       |       |       |" + '\n'
        ],
        new Selection(2, 1, 2, 1),
        [
            "| A | B | C |",
            "| :-: | :-: | :-: |",
            "|  |  |  |",
            "|  |  |  |" + '\n'
        ],
        new Selection(3, 8, 3, 8));
        await resetConfiguration();
    });

    test("Tables: Insert Columns Right", async() => {
        await resetConfiguration();
        return testCommand('SFDocs.table.insertColumnRight',
            [
                "|   A   |   B   |   C   |" ,    
                "| :---: | :---: | :---: |" ,
                "|       |       |       |" ,
                "|       |       |       |" ,
                "|       |       |       |" + '\n'
            ],
            new Selection(0, 1, 0, 1),
            [
                '| A   |     | B   | C   |',
                '| :-: | :-: | :-: | :-: |',
                '|     |     |     |     |',
                '|     |     |     |     |',
                '|     |     |     |     |' + '\n'
            ],
            new Selection(0, 8, 0, 8));
    });

    test("Tables: Insert Column Right, without formating", async () => {
        await updateConfiguration({ config: [["SFDocs.markdownAssistant.table.autoFormat", false]] });
        await testCommand('SFDocs.table.insertColumnRight',
        [
            "|   A   |   B   |   C   |" ,    
            "| :---: | :---: | :---: |" ,
            "|       |       |       |" ,
            "|       |       |       |" ,
            "|       |       |       |" + '\n'
        ],
        new Selection(0, 1, 0, 1),
        [
            '| A |  | B | C |',
            '| :-: | :-: | :-: | :-: |',
            '|  |  |  |  |',
            '|  |  |  |  |',
            '|  |  |  |  |' + '\n'
        ],
        new Selection(0, 6, 0, 6));
        await resetConfiguration();
    });

    test("Tables: Insert Columns Left", async() => {
        await resetConfiguration();
        return testCommand('SFDocs.table.insertColumnLeft',
            [
                "|   A   |   B   |   C   |" ,    
                "| :---: | :---: | :---: |" ,
                "|       |       |       |" ,
                "|       |       |       |" ,
                "|       |       |       |" + '\n'
            ],
            new Selection(0, 1, 0, 1),
            [
                '|     | A   | B   | C   |',
                '| :-: | :-: | :-: | :-: |',
                '|     |     |     |     |',
                '|     |     |     |     |',
                '|     |     |     |     |' + '\n'
            ],
            new Selection(0, 2, 0, 2));
    });

    test("Tables: Insert Column Left, without formating", async () => {
        await updateConfiguration({ config: [["SFDocs.markdownAssistant.table.autoFormat", false]] });
        await testCommand('SFDocs.table.insertColumnLeft',
        [
            "|   A   |   B   |   C   |" ,    
            "| :---: | :---: | :---: |" ,
            "|       |       |       |" ,
            "|       |       |       |" ,
            "|       |       |       |" + '\n'
        ],
        new Selection(0, 1, 0, 1),
        [
            '|  | A | B | C |',
            '| :-: | :-: | :-: | :-: |',
            '|  |  |  |  |',
            '|  |  |  |  |',
            '|  |  |  |  |' + '\n'
        ],
        new Selection(0, 2, 0, 2));
        await resetConfiguration();
    });

    test("Tables: Move Row Down", async() => {
        await resetConfiguration();
        return testCommand('SFDocs.table.moveRowDown',
            [
                "|   A   |   B   |   C   |" ,    
                "| :---: | :---: | :---: |" ,
                "|   D   |   E   |   F   |" ,
                "|       |       |       |" ,
                "|       |       |       |" + '\n'
            ],
            new Selection(2, 1, 2, 1),
            [
                "| A   | B   | C   |",
                "| :-: | :-: | :-: |",
                "|     |     |     |",
                "| D   | E   | F   |",
                "|     |     |     |" + '\n'
            ],
            new Selection(3, 1, 3, 1));
    });

    test("Tables: Move Row Down, without formating", async () => {
        await updateConfiguration({ config: [["SFDocs.markdownAssistant.table.autoFormat", false]] });
        await testCommand('SFDocs.table.moveRowDown',
        [
            "|   A   |   B   |   C   |" ,    
            "| :---: | :---: | :---: |" ,
            "|   D   |   E   |   F   |" ,
            "|       |       |       |" ,
            "|       |       |       |" + '\n'
        ],
        new Selection(2, 1, 2, 1),
        [
            "| A | B | C |",
            "| :-: | :-: | :-: |",
            "|  |  |  |",
            "| D | E | F |",
            "|  |  |  |" + '\n'
        ],
        new Selection(3, 1, 3, 1));
        await resetConfiguration();
    });

    test("Tables: Move Row Up", async() => {
        await resetConfiguration();
        return testCommand('SFDocs.table.moveRowUp',
            [
                "|   A   |   B   |   C   |" ,    
                "| :---: | :---: | :---: |" ,
                "|       |       |       |" ,
                "|       |       |       |" ,
                "|   D   |   E   |   F   |" + '\n'
            ],
            new Selection(4, 1, 4, 1),
            [
                "| A   | B   | C   |",
                "| :-: | :-: | :-: |",
                "|     |     |     |",
                "| D   | E   | F   |",
                "|     |     |     |" + '\n'
            ],
            new Selection(3, 1, 3, 1));
    });

    test("Tables: Move Row Up, without formating", async () => {
        await updateConfiguration({ config: [["SFDocs.markdownAssistant.table.autoFormat", false]] });
        await testCommand('SFDocs.table.moveRowUp',
        [
            "|   A   |   B   |   C   |" ,    
            "| :---: | :---: | :---: |" ,
            "|       |       |       |" ,
            "|       |       |       |" ,
            "|   D   |   E   |   F   |" + '\n'
        ],
        new Selection(4, 1, 4, 1),
        [
            "| A | B | C |",
            "| :-: | :-: | :-: |",
            "|  |  |  |",
            "| D | E | F |",
            "|  |  |  |" + '\n'
        ],
        new Selection(3, 1, 3, 1));
        await resetConfiguration();
    });

    test("Tables: Copy Column", async () => {
        await testCommand('SFDocs.table.copyColumn',
            [
                "| A   | B   | C   |",
                "| :-: | :-: | :-: |",
                "| X   | Y   | Z   |",
                "| D   | E   | F   |",
                "| I   | J   | K   |" + '\n'
            ],
            new Selection(0, 15, 0, 15),
            [
                "| A   | B   | C   |",
                "| :-: | :-: | :-: |",
                "| X   | Y   | Z   |",
                "| D   | E   | F   |",
                "| I   | J   | K   |" + '\n'
            ],
            new Selection(0, 15, 0, 15));
            const text = await env.clipboard.readText();
            const expectedCopyColumn = `| C |\r\n| :-: |\r\n| Z |\r\n| F |\r\n| K |\r\n`;
            return assert.deepStrictEqual(text, expectedCopyColumn);
    });

    test("Tables: Paste Column Right", async() => {
        await resetConfiguration();
        const copyColumn = `| C |\r\n| :-- |\r\n| Z |\r\n| F |\r\n| K |\r\n`;
        env.clipboard.writeText(copyColumn);
        return testCommand('SFDocs.table.pasteColumnRight',
            [
                "| A   | B   | C   |",
                "| :-: | :-: | :-: |",
                "| X   | Y   | Z   |",
                "| D   | E   | F   |",
                "| I   | J   | K   |" + '\n'
            ],
            new Selection(0, 1, 0, 1),
            [
                "| A   | C   | B   | C   |",
                "| :-: | :-- | :-: | :-: |",
                "| X   | Z   | Y   | Z   |",
                "| D   | F   | E   | F   |",
                "| I   | K   | J   | K   |" + '\n'
            ],
            new Selection(0, 8, 0, 8));
    });

    test("Tables: Paste Column Right, without formating", async () => {
        await updateConfiguration({ config: [["SFDocs.markdownAssistant.table.autoFormat", false]] });
        const copyColumn = `| C |\r\n| :-- |\r\n| Z |\r\n| F |\r\n| K |\r\n`;
        env.clipboard.writeText(copyColumn);
        await testCommand('SFDocs.table.pasteColumnRight',
        [
            "| A   | B   | C   |",
            "| :-: | :-: | :-: |",
            "| X   | Y   | Z   |",
            "| D   | E   | F   |",
            "| I   | J   | K   |" + '\n'
        ],
        new Selection(0, 1, 0, 1),
        [
            "| A | C | B | C |",
            "| :-: | :-- | :-: | :-: |",
            "| X | Z | Y | Z |",
            "| D | F | E | F |",
            "| I | K | J | K |" + '\n'
        ],
        new Selection(0, 6, 0, 6));
        await resetConfiguration();
    });

    test("Tables: Pate Column Left", async() => {
        await resetConfiguration();
        const copyColumn = `| C |\r\n| :-- |\r\n| Z |\r\n| F |\r\n| K |\r\n`;
        env.clipboard.writeText(copyColumn);
        return testCommand('SFDocs.table.pasteColumnLeft',
            [
                "| A   | B   | C   |",
                "| :-: | :-: | :-: |",
                "| X   | Y   | Z   |",
                "| D   | E   | F   |",
                "| I   | J   | K   |" + '\n'
            ],
            new Selection(0, 1, 0, 1),
            [
                "| C   | A   | B   | C   |",
                "| :-- | :-: | :-: | :-: |",
                "| Z   | X   | Y   | Z   |",
                "| F   | D   | E   | F   |",
                "| K   | I   | J   | K   |" + '\n'
            ],
            new Selection(0, 2, 0, 2));
    });

    test("Tables: Paste Column Left, without formating", async () => {
        await updateConfiguration({ config: [["SFDocs.markdownAssistant.table.autoFormat", false]] });
        const copyColumn = `| C |\r\n| :-- |\r\n| Z |\r\n| F |\r\n| K |\r\n`;
        env.clipboard.writeText(copyColumn);
        await testCommand('SFDocs.table.pasteColumnLeft',
        [
            "| A   | B   | C   |",
            "| :-: | :-: | :-: |",
            "| X   | Y   | Z   |",
            "| D   | E   | F   |",
            "| I   | J   | K   |" + '\n'
        ],
        new Selection(0, 1, 0, 1),
        [
            "| C | A | B | C |",
            "| :-- | :-: | :-: | :-: |",
            "| Z | X | Y | Z |",
            "| F | D | E | F |",
            "| K | I | J | K |" + '\n'
        ],
        new Selection(0, 2, 0, 2));
        await resetConfiguration();
    });

    test("Table: Format", async () => {
        await resetConfiguration();
        return testCommand('SFDocs.table.format',
        [
            '| Category | Budget | Actual | Difference |',
            '| :-- | :-- | :-- | :-- |',
            '| AutoXZ | ₹ 200.00 | ₹ 90.00 | ₹ 110.00 |',
            '| Entertainment | ₹ 200.00 | ₹ 32.00 | ₹ 168.00 |',
            '| Food | ₹ 350.00 | ₹ 205.75 | ₹ 144.25 |',
            '| Home | ₹ 300.00 | ₹ 250.00 | ₹ 50.00 |',
            '| Medical | ₹ 100.00 | ₹ 35.00 | ₹ 65.00 |',
            '| Personal Items | ₹ 300.00 | ₹ 80.00 | ₹ 220.00 |',
            '| Travel | ₹ 500.00 | ₹ 350.00 | ₹ 150.00 |',
            '| Utilities | ₹ 200.00 | ₹ 100.00 | ₹ 100.00 |',
            '| Other | ₹ 50.00 | ₹ 60.00 | (₹ 10.00) |',
            '| Total | ₹ 2,200.00 | ₹ 1,202.75 | ₹ 997.25 |'
        ], 
        new Selection(0, 0, 0, 0),
        [
            '| Category       | Budget     | Actual     | Difference |',
            '| :------------- | :--------- | :--------- | :--------- |',
            '| AutoXZ         | ₹ 200.00   | ₹ 90.00    | ₹ 110.00   |',
            '| Entertainment  | ₹ 200.00   | ₹ 32.00    | ₹ 168.00   |',
            '| Food           | ₹ 350.00   | ₹ 205.75   | ₹ 144.25   |',
            '| Home           | ₹ 300.00   | ₹ 250.00   | ₹ 50.00    |',
            '| Medical        | ₹ 100.00   | ₹ 35.00    | ₹ 65.00    |',
            '| Personal Items | ₹ 300.00   | ₹ 80.00    | ₹ 220.00   |',
            '| Travel         | ₹ 500.00   | ₹ 350.00   | ₹ 150.00   |',
            '| Utilities      | ₹ 200.00   | ₹ 100.00   | ₹ 100.00   |',
            '| Other          | ₹ 50.00    | ₹ 60.00    | (₹ 10.00)  |',
            '| Total          | ₹ 2,200.00 | ₹ 1,202.75 | ₹ 997.25   |'
        ], 
        new Selection(0, 0, 0, 0)
        );
    });

    test("Table: Remove Formatting", async () => {
        await resetConfiguration();
        return testCommand('SFDocs.table.removeFormatting',
        [
            '| Category       | Budget     | Actual     | Difference |',
            '| :------------- | :--------- | :--------- | :--------- |',
            '| AutoXZ         | ₹ 200.00   | ₹ 90.00    | ₹ 110.00   |',
            '| Entertainment  | ₹ 200.00   | ₹ 32.00    | ₹ 168.00   |',
            '| Food           | ₹ 350.00   | ₹ 205.75   | ₹ 144.25   |',
            '| Home           | ₹ 300.00   | ₹ 250.00   | ₹ 50.00    |',
            '| Medical        | ₹ 100.00   | ₹ 35.00    | ₹ 65.00    |',
            '| Personal Items | ₹ 300.00   | ₹ 80.00    | ₹ 220.00   |',
            '| Travel         | ₹ 500.00   | ₹ 350.00   | ₹ 150.00   |',
            '| Utilities      | ₹ 200.00   | ₹ 100.00   | ₹ 100.00   |',
            '| Other          | ₹ 50.00    | ₹ 60.00    | (₹ 10.00)  |',
            '| Total          | ₹ 2,200.00 | ₹ 1,202.75 | ₹ 997.25   |'
        ], 
        new Selection(0, 0, 0, 0),
        [
            '| Category | Budget | Actual | Difference |',
            '| :-- | :-- | :-- | :-- |',
            '| AutoXZ | ₹ 200.00 | ₹ 90.00 | ₹ 110.00 |',
            '| Entertainment | ₹ 200.00 | ₹ 32.00 | ₹ 168.00 |',
            '| Food | ₹ 350.00 | ₹ 205.75 | ₹ 144.25 |',
            '| Home | ₹ 300.00 | ₹ 250.00 | ₹ 50.00 |',
            '| Medical | ₹ 100.00 | ₹ 35.00 | ₹ 65.00 |',
            '| Personal Items | ₹ 300.00 | ₹ 80.00 | ₹ 220.00 |',
            '| Travel | ₹ 500.00 | ₹ 350.00 | ₹ 150.00 |',
            '| Utilities | ₹ 200.00 | ₹ 100.00 | ₹ 100.00 |',
            '| Other | ₹ 50.00 | ₹ 60.00 | (₹ 10.00) |',
            '| Total | ₹ 2,200.00 | ₹ 1,202.75 | ₹ 997.25 |'
        ],
        new Selection(0, 0, 0, 0)
        );
    });
});
