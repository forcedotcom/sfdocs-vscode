import { Selection, env } from "vscode";
import { resetConfiguration, updateConfiguration, testCommand } from "../utils";

suite("Formatting.", () => {
    suiteSetup(async () => {
        await resetConfiguration();
    });

    suiteTeardown(async () => {
        await resetConfiguration();
    });

    test("Toggle bold. `text |` -> `text **|**`", () => {
        return testCommand('SFDocs.editing.toggleBold',
            ['text '], new Selection(0, 5, 0, 5),
            ['text ****'], new Selection(0, 7, 0, 7)
        );
    });

    test("Toggle bold. `text **|**` -> `text |`", () => {
        return testCommand('SFDocs.editing.toggleBold',
            ['text ****'], new Selection(0, 7, 0, 7),
            ['text '], new Selection(0, 5, 0, 5)
        );
    });

    test("Toggle bold. `text**|**` -> `text|`", () => {
        return testCommand('SFDocs.editing.toggleBold',
            ['text****'], new Selection(0, 6, 0, 6),
            ['text'], new Selection(0, 4, 0, 4)
        );
    });

    test("Toggle bold. `**text|**` -> `**text**|`", () => {
        return testCommand('SFDocs.editing.toggleBold',
            ['**text**'], new Selection(0, 6, 0, 6),
            ['**text**'], new Selection(0, 8, 0, 8)
        );
    });

    test("Toggle bold. `text|` -> `**text**|`", () => {
        return testCommand('SFDocs.editing.toggleBold',
            ['text'], new Selection(0, 4, 0, 4),
            ['**text**'], new Selection(0, 8, 0, 8)
        );
    });

    test("Toggle bold. `te|xt` -> `**te|xt**`", () => {
        return testCommand('SFDocs.editing.toggleBold',
            ['text'], new Selection(0, 2, 0, 2),
            ['**text**'], new Selection(0, 4, 0, 4)
        );
    });

    test("Toggle bold. `**text**|` -> `text|`", () => {
        return testCommand('SFDocs.editing.toggleBold',
            ['**text**'], new Selection(0, 8, 0, 8),
            ['text'], new Selection(0, 4, 0, 4)
        );
    });

    test("Toggle bold. `**te|xt**` -> `te|xt`", () => {
        return testCommand('SFDocs.editing.toggleBold',
            ['**text**'], new Selection(0, 4, 0, 4),
            ['text'], new Selection(0, 2, 0, 2)
        );
    });

    test("Toggle bold. With selection. Toggle on", () => {
        return testCommand('SFDocs.editing.toggleBold',
            ['text'], new Selection(0, 0, 0, 4),
            ['**text**'], new Selection(0, 0, 0, 8)
        );
    });

    test("Toggle bold. With selection. Toggle off", () => {
        return testCommand('SFDocs.editing.toggleBold',
            ['**text**'], new Selection(0, 0, 0, 8),
            ['text'], new Selection(0, 0, 0, 4)
        );
    });

    test("Toggle italic. Use `*`", async () => {
        await updateConfiguration({config: [["SFDocs.markdownAssistant.italic.indicator", '*']]});
        await testCommand('SFDocs.editing.toggleItalic',
            ['text'], new Selection(0, 0, 0, 4),
            ['*text*'], new Selection(0, 0, 0, 6)
        );
        await resetConfiguration();
    });

    test("Toggle italic. Use `_`", async () => {
        resetConfiguration();
        return testCommand('SFDocs.editing.toggleItalic',
            ['text'], new Selection(0, 0, 0, 4),
            ['_text_'], new Selection(0, 0, 0, 6)
        );
    });

    test("Toggle strikethrough. `text|` -> `~~text~~|`", () => {
        return testCommand('SFDocs.editing.toggleStrikethrough',
            ['text'], new Selection(0, 4, 0, 4),
            ['~~text~~'], new Selection(0, 8, 0, 8)
        );
    });

    test("Toggle strikethrough. List item", () => {
        return testCommand('SFDocs.editing.toggleStrikethrough',
            ['- text text'], new Selection(0, 11, 0, 11),
            ['- ~~text text~~'], new Selection(0, 15, 0, 15)
        );
    });

    test("Toggle strikethrough. Task list item", () => {
        return testCommand('SFDocs.editing.toggleStrikethrough',
            ['- [ ] text text'], new Selection(0, 15, 0, 15),
            ['- [ ] ~~text text~~'], new Selection(0, 19, 0, 19)
        );
    });

    test("Toggle Blockquote. Single Line", () => {
        return testCommand('SFDocs.editing.toggleBlockquote',
            ['text'], new Selection(0, 2, 0, 2),
            ['> text'], new Selection(0, 4, 0, 4)
        );
    });

    test("Toggle Blockquote (Remove). Single Line", () => {
        return testCommand('SFDocs.editing.toggleBlockquote',
            ['>text'], new Selection(0, 2, 0, 2),
            ['text'], new Selection(0, 1, 0, 1)
        );
    });

    test("Toggle Blockquote. Multiple Lines", () => {
        return testCommand('SFDocs.editing.toggleBlockquote',
            ['text', 'text1', 'text2'], new Selection(0, 2, 2, 2),
            ['> text', '> text1', '> text2'], new Selection(0, 4, 2, 4)
        );
    });

    test("Toggle Blockquote (Remove). Single Line", () => {
        return testCommand('SFDocs.editing.toggleBlockquote',
        ['> text', '>text1', '> text2'], new Selection(0, 4, 2, 4),
        ['text', 'text1', 'text2'], new Selection(0, 2, 2, 2)
        );
    });

    test("Toggle Codeblock - Selected Text, New Codeblock", () => {
        return testCommand('SFDocs.editing.toggleCodeblock',
            ['text'], new Selection(0, 0, 0, 4),
            ['\n```\ntext\n```\n'], new Selection(0, 0, 0, 0)
        );
    });

    test("Toggle Codeblock - No Selection, Remove Codeblock", () => {
        return testCommand('SFDocs.editing.toggleCodeblock',
            ['\n```\ntext\n```\n'], new Selection(1, 0, 1, 0),
            ['\ntext\n'], new Selection(1, 0, 1, 0)
        );
    });

    test("Toggle Codeblock - No Selection, Remove Codeblock", () => {
        return testCommand('SFDocs.editing.toggleCodeblock',
            ['\n```\ntext\n```\n'], new Selection(3, 3, 3, 3),
            ['\ntext\n'], new Selection(2, 0, 2, 0)
        );
    });

    test("Toggle Codeblock - No Selection, New Codeblock", () => {
        return testCommand('SFDocs.editing.toggleCodeblock',
            [''], new Selection(0, 0, 0, 0),
            ['\n```\n\n```\n'], new Selection(2, 0, 2, 0)
        );
    });

    // disclaimer: I am not sure about this code. Looks like it works fine, but I am not fully understand how it works underneath.
    test("Paste link on selected text. `|text|` -> `[text|](link)`", async () => {
        const link = 'http://just.a.link';
        await env.clipboard.writeText(link);

        return testCommand('SFDocs.editing.pasteHyperlink',
            ['text'], new Selection(0, 0, 0, 4),
            ['[text](' + link + ')'], new Selection(0, 5, 0, 5)
        );
    });

    test("Paste link on selected text. (no link on clipboard)`|text|` -> `[text](|)`", async () => {
        const link = 'Not a link';
        await env.clipboard.writeText(link);

        return testCommand('SFDocs.editing.pasteHyperlink',
            ['text'], new Selection(0, 0, 0, 4),
            ['[text]()'], new Selection(0, 7, 0, 7)
        );
    });

    test("Paste image path on selected text. `|text|` -> `![text|](path)`", async () => {
        const link = './abcd.png';
        await env.clipboard.writeText(link);

        return testCommand('SFDocs.editing.insertImage',
            ['text'], new Selection(0, 0, 0, 4),
            ['![text](' + link + ')'], new Selection(0, 6, 0, 6)
        );
    });

    test("Paste image path on selected text. (no link on clipboard)`|text|` -> `![text](|)`", async () => {
        const link = 'Not a path';
        await env.clipboard.writeText(link);

        return testCommand('SFDocs.editing.insertImage',
            ['text'], new Selection(0, 0, 0, 4),
            ['![text]()'], new Selection(0, 8, 0, 8)
        );
    });
});
