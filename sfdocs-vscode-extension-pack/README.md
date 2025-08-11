# SFDocs Extension Pack

SFDocs Extension Pack packages extensions that Salesforce recommends for authoring docs in Markdown and writing API specs.

The extension pack is good for beginning and professional authors.

## Extensions

- [SFDocs Markdown Preview](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforce-docs-markdown-preview)–Provides Micromark-compliant Markdown previews.
- [SFDocs Markdown Assistant](https://marketplace.visualstudio.com/items?itemName=salesforce.sfdocs-markdown-assistant)–Provides palette commands and shortcuts that make it easy to write Markdown.
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)–Enforces a consistent style by parsing your code and reprinting it with its own style rules.
- [Vale](https://marketplace.visualstudio.com/items?itemName=ChrisChinchilla.vale-vscode)-Provides customizable spelling, style, and grammar checking for a variety of markup formats (Markdown, AsciiDoc, reStructuredText, HTML, and DITA)
- [Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker&ssr=false#overview)-help catch common spelling errors while keeping the number of false positives low.
- [LTeX+](https://marketplace.visualstudio.com/items?itemName=ltex-plus.vscode-ltex-plus)-provides offline grammar checking of various markup languages in Visual Studio Code using LanguageTool (LT)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint&ssr=false#overview)-Lints JavaScript and TypeScript code to enforce consistent style and catch common errors.

## 🚀 Quick Setup

### Automated Configuration (Recommended)

Run our setup script to automatically configure all extensions:

```bash
# Navigate to the extension pack directory
cd ~/.vscode/extensions/salesforce.sfdocs-vscode-extension-pack-*/

# Run the setup script
node setup-vale.js
```

### Manual Configuration

#### Vale Configuration
1. **Install Vale CLI**: Follow [Vale installation guide](https://vale.sh/docs/vale-cli/installation/)
2. **Configure VS Code**:
   - Open VS Code settings (`Cmd+,` on macOS, `Ctrl+,` on Windows)
   - Search for "Vale"
   - Set **Vale › Vale CLI: Config** to:
     - **macOS**: `/Users/Shared/Vale/.vale.ini`
     - **Windows**: `C:\ProgramData\Vale\.vale.ini`

#### Recommended Settings
Copy the settings from `.vscode/settings.json` in this extension pack to your workspace settings for optimal configuration.

## Contribute

Yes, we love to collaborate!
- Log feature requests and bugs in [Github Issues](https://github.com/forcedotcom/sfdocs-vscode/issues).
- To add your extension to this pack, open a PR. We'd be happy to review it!
