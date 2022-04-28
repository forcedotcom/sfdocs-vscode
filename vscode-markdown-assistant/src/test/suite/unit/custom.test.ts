import { Selection } from 'vscode';
import { resetConfiguration, testCommand } from "../utils";

suite("Custom Plugins", () => {
    suiteSetup(async () => {
        await resetConfiguration();
    });

    suiteTeardown(async () => {
        await resetConfiguration();
    });

    test("Enhanced Callouts: Caution", () => {
        return testCommand('SFDocs.custom.enhancedCallouts.caution',
            [
                ''
            ],
            new Selection(0, 1, 0, 1),
            [
                '',
                ':::caution',
                '',
                ':::',
                ''
            ],
            new Selection(2, 0, 2, 0));
    });

    test("Enhanced Callouts: Tip", () => {
        return testCommand('SFDocs.custom.enhancedCallouts.tip',
            [
                ''
            ],
            new Selection(0, 1, 0, 1),
            [
                '',
                ':::tip',
                '',
                ':::',
                ''
            ],
            new Selection(2, 0, 2, 0));
    });

    test("Enhanced Callouts: Note", () => {
        return testCommand('SFDocs.custom.enhancedCallouts.note',
            [
                ''
            ],
            new Selection(0, 1, 0, 1),
            [
                '',
                ':::note',
                '',
                ':::',
                ''
            ],
            new Selection(2, 0, 2, 0));
    });

    test("Enhanced Callouts: Warning", () => {
        return testCommand('SFDocs.custom.enhancedCallouts.warning',
            [
                ''
            ],
            new Selection(0, 1, 0, 1),
            [
                '',
                ':::warning',
                '',
                ':::',
                ''
            ],
            new Selection(2, 0, 2, 0));
    });

    test("Enhanced Codeblocks", () => {
        return testCommand('SFDocs.custom.enhancedCodeblock',
            [
                ''
            ],
            new Selection(0, 1, 0, 1),
            [
                '',
                '```sfdocs-code {"lang":"", "title": "", "src": "" }',
                '',
                '```',
                ''
            ],
            new Selection(1, 24, 1, 24));
    });

    test("Insert Video: VidYard", () => {
        return testCommand('SFDocs.custom.insertVideo.vidyard',
            [
                ''
            ],
            new Selection(0, 1, 0, 1),
            [
                '',
                '::video{src="" title="" type="vidyard"}',
                '',
            ],
            new Selection(1, 13, 1, 13));
    });

    test("Insert Video: YouTube", () => {
        return testCommand('SFDocs.custom.insertVideo.youtube',
            [
                ''
            ],
            new Selection(0, 1, 0, 1),
            [
                '',
                '::video{src="" title="" type="youtube"}',
                '',
            ],
            new Selection(1, 13, 1, 13));
    });

    test("Insert Video: Local", () => {
        return testCommand('SFDocs.custom.insertVideo.local',
            [
                ''
            ],
            new Selection(0, 1, 0, 1),
            [
                '',
                '::video{src="" title="" type="local"}',
                '',
            ],
            new Selection(1, 13, 1, 13));
    });

    test("Content Reuse: Include", () => {
        return testCommand('SFDocs.custom.contentReuse',
            [
                ''
            ],
            new Selection(0, 1, 0, 1),
            [
                '',
                '::include{src=""}',
                '',
            ],
            new Selection(1, 15, 1, 15));
    });

    test("Insert Definition List", () => {
        return testCommand('SFDocs.editing.definitionList',
            [
                ''
            ],
            new Selection(0, 1, 0, 1),
            ['',
            '- First Term',
            '',
            '    - : This text defines the first term.',
            ''
            ],
            new Selection(4, 0, 4, 0));
    });

});