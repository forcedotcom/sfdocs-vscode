import * as vscode from "vscode";
import * as assert from "assert";
import * as path from "path";

type IConfigurationRecord<T = unknown> = readonly [string, T];

const Default_Config: readonly IConfigurationRecord[] = [
    ["SFDocs.markdownAssistant.italic.indicator", "_"],
    ["SFDocs.markdownAssistant.orderedList.marker", "ordered"],
    ["SFDocs.markdownAssistant.table.autoFormat", true],
    ["editor.insertSpaces", true],
    ["editor.tabSize", 4],
];

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export function resetConfiguration(configurationTarget: vscode.ConfigurationTarget | boolean = true): Promise<void> {
    return updateConfiguration({ config: Default_Config, configurationTarget });
}


export async function updateConfiguration({
    config,
    configurationTarget = true,
    overrideInLanguage,
}: {
    config: Iterable<IConfigurationRecord>;
    configurationTarget?: vscode.ConfigurationTarget | boolean;
    overrideInLanguage?: boolean;
}): Promise<void> {
    const configObj = vscode.workspace.getConfiguration();
    for (const [id, value] of config) {
        //console.log(id, value);
        try{
            await configObj.update(id, value, configurationTarget, overrideInLanguage);
        }catch(err){
            console.log(err);
        }
    }
}


export const Test_Workspace_Path = path.resolve(__dirname, "..", "..", "..", "test");
export const Test_Md_File_Path = path.resolve(Test_Workspace_Path, "test.md");

export async function testCommand(
    command: string,
    initLines: readonly string[],
    initSelection: vscode.Selection,
    expectedLines: readonly string[],
    expectedSelection: vscode.Selection
): Promise<void> {

    // Open the file.
    const [document, editor] = await openDocument(Test_Md_File_Path);

    // Place the initial content.
    await editor.edit(editBuilder => {
        const fullRange = new vscode.Range(new vscode.Position(0, 0), document.positionAt(document.getText().length));
        editBuilder.delete(fullRange);
        editBuilder.insert(new vscode.Position(0, 0), initLines.join("\n"));
    });

    // Run the command.
    editor.selection = initSelection;
    await vscode.commands.executeCommand(command);
    //As exceuteCommand is not honoring the above await
    await delay(100);

    // Assert.
    const actual = document.getText()
        .replace(/\r\n/g, "\n"); // Normalize line endings.

    assert.deepStrictEqual(actual, expectedLines.join("\n"));
    assert.deepStrictEqual(editor.selection, expectedSelection);
}


export async function openDocument(file: vscode.Uri | string): Promise<readonly [vscode.TextDocument, vscode.TextEditor]> {
    const document = await vscode.workspace.openTextDocument(file as any);
    const editor = await vscode.window.showTextDocument(document);
    return [document, editor];
};


export function sleep(ms: number): Promise<void> {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
}