# Change Log

All notable changes to the "SFDocs-vscode-extension-pack" extension pack will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

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
