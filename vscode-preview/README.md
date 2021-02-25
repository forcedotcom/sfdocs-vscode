# SalesforceDocs Markdown Preview

![Features GIF](https://github.com/forcedotcom/sfdocs-vscode/blob/master/vscode-preview/media/images/preview.gif?raw=true)

SalesforceDocs Markdown Preview is a [Micromark-compliant](https://github.com/micromark/micromark) VS Code extension for Markdown previews. By default, the exrension uses Salesforce docs look-and-feel for previews. It features [most of the out-of-the-box Markdown preview features](https://code.visualstudio.com/docs/languages/markdown) like:

- Dynamic previews
- Editor and preview synchronization
- Custom CSS

## Prerequisites

Before you use the plugin, disable the default markdown-language-feature extension of VS Code by following these steps:
![Manual Install](https://github.com/forcedotcom/sfdocs-vscode/blob/master/vscode-preview/media/images/disable_default_preview.png?raw=true)

1. Click on the **Extension** icon in the Activity Bar on the side of VS Code or use the **View: Extensions** command (⇧⌘X).
2. In the extension filter, type and select **@builtin**.
3. Scroll down and select **Markdown Language Features**
4. Click the **Disable** button.
5. Click the **Reload Required** button to reload VS Code.

## Keybindings

> The `cmd` key for *Windows* is `ctrl`.

| Shortcuts               | Functionality                                       |
| ----------------------- | --------------------------------------------------- |
| `cmd-k f` or `ctrl-k f` | Open SalesforceDocs Preview in full screen mode     |
| `cmd-k s` or `ctrl-k s` | Open SalesforceDocs Preview in the side editor mode |

## Configurations

The SalesforceDocs Markdown Preview offers most configuration options that are provided by the default Markdown preview of Visual Studio Code. In addition to that, you can also select your style preset to match SalesforceDocs, or the default Visual Studio Code preview, in the Settings. 
