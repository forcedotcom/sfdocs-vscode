# Change Log

All notable changes to the "SFDocs-vscode-extension-pack" extension pack will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.1.0] - 2025-10-06

### Major Features

#### Automatic Cursor AI Rules Management
- **Embedded `.cursorrules` Template**: Includes comprehensive SFDocs Cursor AI rules for enhanced documentation assistance
- **Automatic Setup & Updates**: Automatically sets up and updates `.cursorrules` files without prompting (configurable via `sfdocs.autoSetupCursorRules`)
- **Smart Repository Detection**: Only activates for `salesforcedocs` GitHub repositories (case-sensitive)
  - Uses `git remote -v` for reliable detection across all Git URL formats
  - Supports SSH aliases and custom remote configurations
- **Cursor Editor Detection**: Only activates Cursor rules features when running in Cursor (not VS Code)
- **Automatic .gitignore Management**: Automatically adds `.cursorrules` to `.gitignore`

#### Extension Update Management
- **Automatic Update Checking**: Checks for new versions daily (every 24 hours)
- **Smart Notifications**: Notifies when updates are available with options to update, view release notes, or skip
- **Configurable**: Control via `sfdocs.autoCheckUpdates` setting (default: true)

#### User Experience
- **Modal Notifications**: Important setup prompts use modal dialogs for better visibility
- **Diff View**: View changes before updating existing `.cursorrules` files
- **Workspace Preferences**: "Never for this workspace" option to skip prompts permanently
- **Manual Commands**:
  - `SFDocs: Setup/Update .cursorrules File` - Create or update the rules file
  - `SFDocs: Check for Extension Updates` - Check for updates anytime

### Configuration Settings
- `sfdocs.autoCheckUpdates` (default: `true`) - Automatically check for extension updates daily
- `sfdocs.autoSetupCursorRules` (default: `true`) - Automatically setup/update `.cursorrules` without prompting

### Technical Improvements
- Converted from passive extension pack to active extension
- TypeScript compilation with webpack bundling
- Embedded content (no network requests or authentication needed)
- Works completely offline
- Proper error handling and user-friendly notifications
- Upgraded minimum VS Code engine version to 1.74.0

### Included AI Rules
- SFDocs-specific workflow guidance for environment setup and troubleshooting
- Common command references for yarn, git, and validation
- Proactive error detection and assistance
- Best practices for Salesforce documentation development

## [0.0.4] - Previous Release

- Initial extension pack release with curated extensions for Salesforce documentation authoring
