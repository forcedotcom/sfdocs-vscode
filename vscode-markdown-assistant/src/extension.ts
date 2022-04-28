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
import { contentReuse, enhancedCodeblock, insertVideo, insertVideoShortcut, insertDefinitionList } from './custom';
import { format, removeFormatting } from './table/format';

export function activate(context: ExtensionContext) {
    function getTableAutoformatConfig(){
        return workspace.getConfiguration('SFDocs.markdownAssistant.table').get<boolean>('autoFormat');
    }

    context.subscriptions.push(
        commands.registerCommand('SFDocs.editing.toggleBold', ()=>styleByWrapping('**')),
        commands.registerCommand('SFDocs.editing.toggleItalic', ()=>styleByWrapping(workspace.getConfiguration('SFDocs.markdownAssistant.italic').get<string>('indicator') || '_')),
        commands.registerCommand('SFDocs.editing.toggleStrikethrough', ()=>styleByWrapping('~~')),
        commands.registerCommand('SFDocs.editing.toggleCodeblock', ()=>styleByWrapping('\n```\n', '\n```\n')),
        commands.registerCommand('SFDocs.editing.toggleInlineCode', ()=>styleByWrapping('`')),
        commands.registerCommand('SFDocs.editing.toggleBlockquote', toggleBlockquote),

        commands.registerCommand('SFDocs.editing.pasteHyperlink', paste),
        commands.registerCommand('SFDocs.editing.insertImage', imagePaste),
        
        commands.registerCommand('SFDocs.editing.toggleCheckList', toggleCheckList),
        commands.registerCommand('SFDocs.editing.toggleBulletList', toggleBulletList),
        commands.registerCommand('SFDocs.editing.toggleNumberList', toggleNumberList),
        commands.registerCommand('SFDocs.editing.definitionList', insertDefinitionList),
        commands.registerCommand('SFDocs.editing.checkList', checkTaskList),

        commands.registerCommand('SFDocs.onEnterKey', onEnterKey),
        commands.registerCommand('SFDocs.onShiftEnterKey', ()=>{return onEnterKey("shift");}),
        commands.registerCommand('SFDocs.onBackspaceKey', onBackspaceKey),

        languages.registerCompletionItemProvider(Document_Selector_Markdown, new MdCompletionItemProvider(), '(', '\\', '/', '[', '#', ':', '`'),

        commands.registerCommand('SFDocs.table.generateWithAlignment', generateTableWithAlignment),
        commands.registerCommand('SFDocs.table.generate', generateTable),
        commands.registerCommand('SFDocs.table.nextCell', ()=>{navigateNextCell(getTableAutoformatConfig()!);}),
        commands.registerCommand('SFDocs.table.prevCell', ()=>{navigatePrevCell(getTableAutoformatConfig()!);}),
        commands.registerCommand('SFDocs.table.insertColumnRight', ()=>{insertColumn(false, getTableAutoformatConfig()!);}),
        commands.registerCommand('SFDocs.table.insertColumnLeft', ()=>{insertColumn(true, getTableAutoformatConfig()!);}),
        commands.registerCommand('SFDocs.table.insertRow', ()=>{insertRow(getTableAutoformatConfig()!);}),
        commands.registerCommand('SFDocs.table.deleteRows', ()=>{deleteRows(getTableAutoformatConfig()!);}),
        commands.registerCommand('SFDocs.table.deleteColumns', ()=>{deleteColumns(getTableAutoformatConfig()!);}),
        commands.registerCommand('SFDocs.table.moveRowUp', ()=>{moveRow(true, getTableAutoformatConfig()!);}),
        commands.registerCommand('SFDocs.table.moveRowDown', ()=>{moveRow(false, getTableAutoformatConfig()!);}),
        commands.registerCommand('SFDocs.table.moveColumnLeft', ()=>{moveColumn(true, getTableAutoformatConfig()!);}),
        commands.registerCommand('SFDocs.table.moveColumnRight', ()=>{moveColumn(false, getTableAutoformatConfig()!);}),
        commands.registerCommand('SFDocs.table.copyColumn', copyColumn),
        commands.registerCommand('SFDocs.table.pasteColumnLeft', ()=>{pasteColumn(true, getTableAutoformatConfig()!);}),
        commands.registerCommand('SFDocs.table.pasteColumnRight', ()=>{pasteColumn(false, getTableAutoformatConfig()!);}),
        commands.registerCommand('SFDocs.table.pasteTable', ()=>{pasteTable(getTableAutoformatConfig()!);}),
        commands.registerCommand('SFDocs.table.format', format),
        commands.registerCommand('SFDocs.table.removeFormatting', removeFormatting),

        commands.registerCommand('SFDocs.custom.enhancedCallouts.tip', ()=>styleByWrapping('\n:::tip\n', '\n:::\n')),
        commands.registerCommand('SFDocs.custom.enhancedCallouts.warning', ()=>styleByWrapping('\n:::warning\n', '\n:::\n')),
        commands.registerCommand('SFDocs.custom.enhancedCallouts.caution', ()=>styleByWrapping('\n:::caution\n', '\n:::\n')),
        commands.registerCommand('SFDocs.custom.enhancedCallouts.note', ()=>styleByWrapping('\n:::note\n', '\n:::\n')),

        commands.registerCommand('SFDocs.custom.insertVideo.vidyard', ()=>{insertVideo("vidyard");}),
        commands.registerCommand('SFDocs.custom.insertVideo.youtube', ()=>{insertVideo("youtube");}),
        commands.registerCommand('SFDocs.custom.insertVideo.local', ()=>{insertVideo("local");}),
        commands.registerCommand('SFDocs.custom.insertVideoShortcut', insertVideoShortcut),

        commands.registerCommand('SFDocs.custom.contentReuse', contentReuse),
        commands.registerCommand('SFDocs.custom.enhancedCodeblock', enhancedCodeblock)
    );
}