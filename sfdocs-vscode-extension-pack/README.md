# SFDocs Extension Pack

SFDocs Extension Pack packages extensions that Salesforce recommends for authoring docs in Markdown and writing API specs. It also automatically sets up and maintains Cursor AI rules for enhanced AI-assisted documentation writing.

The extension pack is good for beginning and professional authors.

## Features

### Automatic Cursor AI Rules Setup

This extension pack automatically sets up the `.cursorrules` file in your workspace, which configures Cursor AI to better assist with Salesforce documentation writing. The rules include:

- **SFDocs-specific workflow guidance** for environment setup and troubleshooting
- **Common command references** for yarn, git, and validation
- **Proactive assistance** for detecting setup needs and errors
- **Best practices** for Salesforce documentation development

The extension will automatically offer to set up the `.cursorrules` file when you first open a workspace.

### Manual Commands

You can use these commands via the Command Palette (`Cmd/Ctrl+Shift+P`):

- `SFDocs: Setup/Update .cursorrules File` - Create or update the `.cursorrules` file in your workspace
- `SFDocs: Check for Extension Updates` - Manually check if a new version of the extension pack is available

### Update Management

When you run the setup command and a `.cursorrules` file already exists, you'll be prompted with options to:
- **Update** - Replace with the latest version from the extension
- **View Changes** - See a diff comparison of what will change
- **Keep Current** - Keep your existing file unchanged

## Included Extensions

- [SFDocs Markdown Preview](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforce-docs-markdown-preview) – Provides Micromark-compliant Markdown previews.
- [SFDocs Markdown Assistant](https://marketplace.visualstudio.com/items?itemName=salesforce.sfdocs-markdown-assistant) – Provides palette commands and shortcuts that make it easy to write Markdown.
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) – Enforces a consistent style by parsing your code and reprinting it with its own style rules.
- [Vale](https://marketplace.visualstudio.com/items?itemName=ChrisChinchilla.vale-vscode) - Provides customizable spelling, style, and grammar checking for a variety of markup formats (Markdown, AsciiDoc, reStructuredText, HTML, and DITA)
- [Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker&ssr=false#overview) - Help catch common spelling errors while keeping the number of false positives low.
- [LTeX+](https://marketplace.visualstudio.com/items?itemName=ltex-plus.vscode-ltex-plus) - Provides offline grammar checking of various markup languages in Visual Studio Code using LanguageTool (LT)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint&ssr=false#overview) - Lints JavaScript and TypeScript code to enforce consistent style and catch common errors.

## Automatic Update Checking

The extension automatically checks for updates daily (every 24 hours) and notifies you when a new version is available. When an update is found, you can:
- **Update Now** - Opens the extension in VS Code marketplace to install the update
- **Release Notes** - View what's new in the latest version
- **Later** - Skip this update notification

### Configuration

You can control update checking behavior in VS Code settings:

- `sfdocs.autoCheckUpdates` - Enable or disable automatic daily update checks (default: `true`)

To disable automatic checks:
```json
{
  "sfdocs.autoCheckUpdates": false
}
```

## How It Works

The `.cursorrules` content is embedded directly in the extension, so it works offline without any network requests or authentication. When you install a new version of the extension pack with updated rules, simply run the setup command to get the latest version.

## Publishing Updates

To publish a new version of this extension pack:

1. Update the version number in `package.json`
2. Update the `CHANGELOG.md` with release notes
3. Run `npm install` to install dependencies
4. Run `npm run compile` to build the extension
5. Run `npm run package` to create the `.vsix` file
6. Run `npm run vscode:publish` to publish to the marketplace (requires publisher credentials)

### Version Guidelines

Follow [Semantic Versioning](https://semver.org/):
- **Major version** (1.0.0): Breaking changes or significant feature additions
- **Minor version** (0.1.0): New features or functionality (like adding new extensions to the pack)
- **Patch version** (0.0.1): Bug fixes or minor improvements

## Contribute

Yes, we love to collaborate!
- Log feature requests and bugs in [Github Issues](https://github.com/forcedotcom/sfdocs-vscode/issues).
- To add your extension to this pack, open a PR. We'd be happy to review it!
