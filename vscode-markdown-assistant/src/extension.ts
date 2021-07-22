import { commands, languages, ExtensionContext, workspace} from 'vscode';
import { styleByWrapping, toggleBlockquote } from './basicStyling';
import { paste } from './Hyperlink';
import { Document_Selector_Markdown, MdCompletionItemProvider } from './completions';
import { toggleBulletList, toggleNumberList, checkTaskList, toggleCheckList} from './list';
import { imagePaste } from './image';
import { generateTable, generateTableWithAlignment } from './table/generator';
import { navigateNextCell, navigatePrevCell } from './table/navigate';
import { insertColumn, insertRow } from './table/insertion';
import { deleteRows, deleteColumns } from './table/deletion';
import { moveRow, moveColumn } from './table/move';
import { pasteTable } from './table/pasteTable';
import { copyColumn, pasteColumn } from './table/copyPasteColumn';
import { onBackspaceKey, onEnterKey} from './keyBehaviour';
import { contentReuse, enhancedCodeblock, insertVideo, insertVideoShortcut } from './custom';
import { format, removeFormatting } from './table/format';

export function activate(context: ExtensionContext) {
    function getTableAutoformatConfig(){
        return workspace.getConfiguration('Salesforcedocs.markdownAssistant.table').get<boolean>('autoFormat');
    }

    context.subscriptions.push(
        commands.registerCommand('sfdocs.editing.toggleBold', ()=>styleByWrapping('**')),
        commands.registerCommand('sfdocs.editing.toggleItalic', ()=>styleByWrapping(workspace.getConfiguration('Salesforcedocs.markdownAssistant.italic').get<string>('indicator') || '_')),
        commands.registerCommand('sfdocs.editing.toggleStrikethrough', ()=>styleByWrapping('~~')),
        commands.registerCommand('sfdocs.editing.toggleCodeblock', ()=>styleByWrapping('\n```\n', '\n```\n')),
        commands.registerCommand('sfdocs.editing.toggleInlineCode', ()=>styleByWrapping('`')),
        commands.registerCommand('sfdocs.editing.toggleBlockquote', toggleBlockquote),

        commands.registerCommand('sfdocs.editing.pasteHyperlink', paste),
        commands.registerCommand('sfdocs.editing.insertImage', imagePaste),
        
        commands.registerCommand('sfdocs.editing.toggleCheckList', toggleCheckList),
        commands.registerCommand('sfdocs.editing.toggleBulletList', toggleBulletList),
        commands.registerCommand('sfdocs.editing.toggleNumberList', toggleNumberList),
        commands.registerCommand('sfdocs.editing.checkList', checkTaskList),

        commands.registerCommand('sfdocs.onEnterKey', onEnterKey),
        commands.registerCommand('sfdocs.onShiftEnterKey', ()=>{return onEnterKey("shift");}),
        commands.registerCommand('sfdocs.onBackspaceKey', onBackspaceKey),

        languages.registerCompletionItemProvider(Document_Selector_Markdown, new MdCompletionItemProvider(), '(', '\\', '/', '[', '#', ':', '`'),

        commands.registerCommand('sfdocs.table.generateWithAlignment', generateTableWithAlignment),
        commands.registerCommand('sfdocs.table.generate', generateTable),
        commands.registerCommand('sfdocs.table.nextCell', ()=>{navigateNextCell(getTableAutoformatConfig()!);}),
        commands.registerCommand('sfdocs.table.prevCell', ()=>{navigatePrevCell(getTableAutoformatConfig()!);}),
        commands.registerCommand('sfdocs.table.insertColumnRight', ()=>{insertColumn(false, getTableAutoformatConfig()!);}),
        commands.registerCommand('sfdocs.table.insertColumnLeft', ()=>{insertColumn(true, getTableAutoformatConfig()!);}),
        commands.registerCommand('sfdocs.table.insertRow', ()=>{insertRow(getTableAutoformatConfig()!);}),
        commands.registerCommand('sfdocs.table.deleteRows', ()=>{deleteRows(getTableAutoformatConfig()!);}),
        commands.registerCommand('sfdocs.table.deleteColumns', ()=>{deleteColumns(getTableAutoformatConfig()!);}),
        commands.registerCommand('sfdocs.table.moveRowUp', ()=>{moveRow(true, getTableAutoformatConfig()!);}),
        commands.registerCommand('sfdocs.table.moveRowDown', ()=>{moveRow(false, getTableAutoformatConfig()!);}),
        commands.registerCommand('sfdocs.table.moveColumnLeft', ()=>{moveColumn(true, getTableAutoformatConfig()!);}),
        commands.registerCommand('sfdocs.table.moveColumnRight', ()=>{moveColumn(false, getTableAutoformatConfig()!);}),
        commands.registerCommand('sfdocs.table.copyColumn', copyColumn),
        commands.registerCommand('sfdocs.table.pasteColumnLeft', ()=>{pasteColumn(true, getTableAutoformatConfig()!);}),
        commands.registerCommand('sfdocs.table.pasteColumnRight', ()=>{pasteColumn(false, getTableAutoformatConfig()!);}),
        commands.registerCommand('sfdocs.table.pasteTable', ()=>{pasteTable(getTableAutoformatConfig()!);}),
        commands.registerCommand('sfdocs.table.format', format),
        commands.registerCommand('sfdocs.table.removeFormatting', removeFormatting),

        commands.registerCommand('sfdocs.custom.enhancedCallouts.tip', ()=>styleByWrapping('\n:::tip\n', '\n:::\n')),
        commands.registerCommand('sfdocs.custom.enhancedCallouts.warning', ()=>styleByWrapping('\n:::warning\n', '\n:::\n')),
        commands.registerCommand('sfdocs.custom.enhancedCallouts.caution', ()=>styleByWrapping('\n:::caution\n', '\n:::\n')),
        commands.registerCommand('sfdocs.custom.enhancedCallouts.note', ()=>styleByWrapping('\n:::note\n', '\n:::\n')),

        commands.registerCommand('sfdocs.custom.insertVideo.vidyard', ()=>{insertVideo("vidyard");}),
        commands.registerCommand('sfdocs.custom.insertVideo.youtube', ()=>{insertVideo("youtube");}),
        commands.registerCommand('sfdocs.custom.insertVideo.local', ()=>{insertVideo("local");}),
        commands.registerCommand('sfdocs.custom.insertVideoShortcut', insertVideoShortcut),

        commands.registerCommand('sfdocs.custom.contentReuse', contentReuse),
        commands.registerCommand('sfdocs.custom.enhancedCodeblock', enhancedCodeblock)
    );
}