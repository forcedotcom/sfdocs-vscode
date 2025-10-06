# Change Log

All notable changes to the "SFDocs-vscode-extension-pack" extension pack will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.1.6] - 2025-10-06

### Changed
- Repository detection is now **case-sensitive** to distinguish between `salesforcedocs` and `SalesforceDocs` organizations
- Only `salesforcedocs` (lowercase) repositories will trigger the extension

## [0.1.5] - 2025-10-06

### Added
- Repository detection: Extension now only activates for salesforcedocs GitHub repositories
- Checks `.git/config` for salesforcedocs organization to determine if setup prompts should appear

### Changed
- Warnings and setup prompts only appear for salesforcedocs repositories
- Non-salesforcedocs repositories are silently skipped

## [0.1.4] - 2025-10-06

### Changed
- Notifications now use warning dialogs (yellow/orange) for better visibility and urgency
- Updated message text to emphasize importance of SFDocs Cursor AI rules
- Button text changed to "Yes, Set Up Now" for clearer call-to-action

## [0.1.3] - 2025-10-06

### Changed
- Notifications now use modal dialogs that stay visible until user responds (won't auto-dismiss)

## [0.1.2] - 2025-10-06

### Added
- **Auto-setup Configuration**: New setting `sfdocs.autoSetupCursorRules` (default: false)
  - When enabled, automatically sets up `.cursorrules` without prompting
  - Automatically updates existing `.cursorrules` files when new versions are available
  - Runs silently in the background

### Changed
- Reduced delay for auto-setup from 2 seconds to 1 second when `autoSetupCursorRules` is enabled
- Setup function now accepts parameter to suppress notifications during auto-setup

## [0.1.1] - 2025-10-05

### Added
- **Cursor Editor Detection**: Extension now detects if running in Cursor vs VS Code and only activates Cursor rules management in Cursor
- **Auto-check on Every Folder Open**: Extension checks for `.cursorrules` existence and updates every time a folder is opened
- **Automatic .gitignore Management**: Automatically adds `.cursorrules` to `.gitignore` when setting up the file
- **"Never for this workspace" Option**: Users can permanently disable setup prompts for specific workspaces
- **Update Notifications**: When `.cursorrules` file exists but is outdated, shows update notification with options to update or view changes

### Changed
- Extension now runs check on every workspace folder open (not just first time)
- Improved notification messages with emojis for better visibility
- Manual setup command now warns when running in VS Code (not Cursor)

### Fixed
- Extension now properly detects and handles workspace-specific preferences
- Better handling of workspace folder changes

## [0.1.0] - 2025-10-05

### Added
- **Embedded `.cursorrules` Template**: Extension includes SFDocs Cursor AI rules for enhanced documentation assistance
- **Automatic Setup Prompt**: Offers to set up `.cursorrules` on first workspace open
- **Manual Setup Command**: `SFDocs: Setup/Update .cursorrules File` - Create or update the rules file
- **Automatic Extension Update Checking**: 
  - Checks for new versions daily (every 24 hours)
  - Notifies when updates are available
  - Options to update now, view release notes, or skip
  - Configurable via `sfdocs.autoCheckUpdates` setting
- **Manual Update Check Command**: `SFDocs: Check for Extension Updates` - Check for updates anytime
- **Smart Update Management**: When updating existing files:
  - View changes in a diff view before applying
  - Choose to update or keep current version
  - Version tracking to know when content is up-to-date
- **SFDocs-Specific Rules Include**:
  - Environment setup and troubleshooting workflows
  - Common yarn, git, and validation commands
  - Proactive error detection and assistance
  - Best practices for Salesforce documentation development

### Changed
- Extension is now an active extension (not just a passive extension pack)
- Updated description to reflect Cursor AI rules management features
- Upgraded minimum VS Code engine version to 1.74.0 for better API support

### Technical
- Added TypeScript compilation and webpack bundling
- Embedded `.cursorrules` content directly in extension (no network requests needed)
- Works completely offline
- Proper error handling and user-friendly notifications
- No external dependencies or authentication required

## [0.0.4] - Previous Release

- Initial extension pack release with curated extensions for Salesforce documentation authoring
