# SalesforceDocs Markdown Assistant README

This extension assists you in writing markdown. It does so by providing shortcuts and easy routes for adding markdown syntax. Furthermore, you get authoring support for GFM tables and some advanced Markdown plugins. With SalesforceDocs Markdown Assistant, we got you covered for the markdown authoring experience inside Visual Studio Code.

## Supported Features

### Basic Styling

-   Toggle **Bold**, _Italic_, ~Strikethrough~, `Inline Code`, and codeblocks
-   >Blockquotes
-   Make a hyperlink, add cross-references to other markdown files (with auto-complete suggestions for files in the repository)
-   Easy image insertion (with auto-complete suggestions for files in the repository)

### Lists

-   Toggle Bulleted List
-   Toggle Numbered List
-   Toggle Check List
-   Check a subset of check boxes.
  
### Tables
-   Add Table (with default (left) alignment)
-   Add Table with Alignment (choosen by user)
-   Insert Row (Below)
-   Insert Column (Left/Right)
-   Delete Selected Rows
-   Delete Selected Columns
-   Move Row (Up/Down)
-   Move Column (Right/Left)
-   Copy Column
-   Paste Column (Right/Left, for the columns copied using the above copy column feature)
-   Paste Table (from sources like Quip, G-Sheets, Excel etc.)
-   Format (To make the table more readable)
-   Remove Formatting (To condense the table as formatting can lead to readability issues if the cell contents are too long)

**Custom Salesforce Plugins**
-   Enhanced Callouts - Tip, Warning, Note, Caution
-   Enhanced Codeblocks
-   Insert Video - VidYard, YouTube, Local
-   Content Reuse (Include)

## Shortcuts

| Feature                        | Shortcut     |
| ------------------------------ | ------------ |
| Toggle Bold                    | ctrl/cmd+B   |
| Toggle Italic                  | ctrl/cmd+I   |
| Toggle Strikethrough           | alt/option+S |
| Paste a hyperlink              | ctrl/cmd+L   |
| Paste a cross-reference (file) | ctrl/cmd+L   |
| Table: Next cell               | Tab          |
| Table: Previous cell           | Shift+Tab    |

## Different Ways of Using the Authoring Features

All features are available in the command pallete, and all expect table cell navigation ones are available in the right click menu. Table features are in the Table sub-menu).

### Basic Styling

-   Toggling works as expected when there is a selection in the editor.
-   Toggling without any selection: In the below example, cmd+B is pressed once to toggle Bold on, and then once at the end to toggle it off.

    ![BoldNoSelection](https://github.com/forcedotcom/sfdocs-vscode/blob/master/vscode-markdown-assistant/images/BoldNoSel.gif?raw=true)
-   Single Word Styling: You can just click on the word and toggle the styles, no selection required.
-   Reverting back the styling: Selecting the text and toggling works for this. But the easier way is to just click at the start or the end of the stylized text, and toggle the styles.
   
    ![RevertBoldNoSelection](https://github.com/forcedotcom/sfdocs-vscode/blob/master/vscode-markdown-assistant/images/BeforeBoldStartPattern.gif?raw=true)
-   For applying blockquotes to a single line, just click on the line, and select _Toggle Blockquote_ .


#### Keyboard Shortcuts for Inline Styles

| Feature                        | Shortcut     |
| ------------------------------ | ------------ |
| Toggle Bold                    | `ctrl/cmd+B`   |
| Toggle Italic                  | `ctrl/cmd+I`   |
| Toggle Strikethrough           | `alt/option+S` |
| Paste a hyperlink              | `ctrl/cmd+L`   |
| Paste a cross-reference (file) | `ctrl/cmd+L`   |

### Lists

-   `Enter`, `Tab` and `Backspace` behave differently when used with lists.
    -   `Enter` key at the end of a list item, makes a new list item in the next line. If an `Enter` is pressed again without typing anything for this list item, this list item is removed and the cursor goes to the next line.
    -   `Shift+Enter` invokes the default `Enter` behaviour (i.e. a newline) if you don't wish the next line to be a list item.
    -   `Tab` key converts the selected list item into  a sublist item.
    -   `Backspace` converts a sublist item into a normal list item, and a normal list item into normal text.
-   Select the lines that you wish to convert to a list, and toggle your desired list type (bullet, numbered, checklist).
-   Even a pre-existing list can be selected and can be converted to a different type of list by just toggling the desired list type.
-   A subset of a checklist can be selected and it can be checked/unchecked by using the **Check List Items** in the contextual menu.
-   Reverting back: A list can be selected and toggling the same list type as the selected list will remove the list syntax.
-   Crossing out a list item: Just click on the list item and toggle strikethrough.

### Tables

-   Tables reformat as you type into a more readable format (if you navigate using Tab and Shift+Tab as mentioned).
    ![AutoFormat](https://github.com/forcedotcom/sfdocs-vscode/blob/master/vscode-markdown-assistant/images/Autoformat.gif?raw=true)
-   Tab (Next Cell) and Shift+Tab (Previous Cell) are the easiest ways to navigate through the cells.
-   You can copy a table from any non markdown source and paste it in Markdown format using the **Table > Paste Table** in the contextual menu.
  
#### Table Columns/Rows Editing

Select any portion of the rows/columns that you wish to delete and use the **Table > Delete Selected Rows/Columns** in the contextual menu.

![DeleteRows](https://github.com/forcedotcom/sfdocs-vscode/blob/master/vscode-markdown-assistant/images/DeleteRows.gif?raw=true). 

In the following example, the rows corresponding to Food, Home and Medical were selected, and **Table > Delete Selected Rows/Columns** is chosen from the right click menu.
    
![DeleteColumns](https://github.com/forcedotcom/sfdocs-vscode/blob/master/vscode-markdown-assistant/images/DeleteColumns.gif?raw=true)

The columns corresponding to Budget and Actual were selected, and **Table > Delete Selected Columns** is chosen from the right click menu.
  
**Insert, move, copy, or paste a table row or a column**: Place the cursor on the required row/column and use the feature. (Insert Row on the header row inserts a new first row.)

### Custom Markdown Plugins

Though these are available in the right click menu, the best way to insert these is by typing `:` (followed by appropriate letters to filter the suggestions) or ` (for sfdocs-code) as typing these trigger suggestions which you can select from.

![invokeCustom](https://github.com/forcedotcom/sfdocs-vscode/blob/master/vscode-markdown-assistant/images/invokeCustom.gif?raw=true)

#### Keyboard Shortcuts for some of the custom plugins

| Feature                        | Shortcut               |
| ------------------------------ | ---------------------- |
| Shared Markdown File (Include) | `ctrl/cmd + R`         |
| Insert Video                   | `ctrl/cmd + shift + M` |

## Extension Settings

This extension contributes the following settings:

-   `Salesforcedocs.markdownAssistant.completion.respectVscodeSearchExclude`: Whether to exclude files from auto-completion using VS Code's `#search.exclude#` setting. (`node_modules`, `bower_components` and `*.code-search` are **always excluded**, not affected by this option.)
-   `Salesforcedocs.markdownAssistant.completion.root`: The root folder for path auto-completion.
-   `Salesforcedocs.markdownAssistant.italic.indicator`: Use `*` or `_` to wrap italic text.
-   `Salesforcedocs.markdownAssistant.orderedList.autoRenumber`: Auto fix ordered list markers.
-   `Salesforcedocs.markdownAssistant.orderedList.marker`: Ordered list marker (1. everywhere or 1., 2. and so on).
-   `Salesforcedocs.markdownAssistant.table.autoFormat`: Whether to auto format tables while editing.
-   `Salesforcedocs.markdownAssistant.disableCustom`: Whether to disable custom Salesforce plugins (Video, Include etc).

## Known Issues

Tables with excessive styling or newline character in their cell contents can result in malformed Markdown while pasting.

## FAQs

**Does this extension support GFM?**
Yes, it's compliant with both CommonMark and GFM specs.




<!-- ## Release Notes -->

<!-- Users appreciate release notes as you update your extension. -->

### 0.0.1

Initial release

---

## Code of Conduct

Ensure that you've read through the [SalesForce Open Source Code of Conduct](https://github.com/ayu987-sf/sfdocs-author/blob/master/CODE_OF_CONDUCT.md).
