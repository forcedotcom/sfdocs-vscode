#!/usr/bin/env node

/**
 * SFDocs Extension Pack - Vale Configuration Setup Script
 * 
 * This script automatically configures Vale for the SFDocs Extension Pack
 * by setting up the Vale configuration path in VS Code settings.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const CONFIG_PATHS = {
    darwin: '/Users/Shared/Vale/.vale.ini',
    win32: 'C:\\ProgramData\\Vale\\.vale.ini',
    linux: '/usr/share/vale/.vale.ini'
};

const VSCODE_SETTINGS_PATHS = {
    darwin: path.join(os.homedir(), 'Library/Application Support/Code/User/settings.json'),
    win32: path.join(os.homedir(), 'AppData/Roaming/Code/User/settings.json'),
    linux: path.join(os.homedir(), '.config/Code/User/settings.json')
};

function getValeConfigPath() {
    const platform = os.platform();
    return CONFIG_PATHS[platform] || CONFIG_PATHS.linux;
}

function getVSCodeSettingsPath() {
    const platform = os.platform();
    return VSCODE_SETTINGS_PATHS[platform] || VSCODE_SETTINGS_PATHS.linux;
}

function updateVSCodeSettings() {
    const settingsPath = getVSCodeSettingsPath();
    const valeConfigPath = getValeConfigPath();
    
    console.log('🔧 SFDocs Extension Pack - Vale Configuration Setup');
    console.log('📍 Platform:', os.platform());
    console.log('📁 Vale config path:', valeConfigPath);
    console.log('⚙️  VS Code settings path:', settingsPath);
    
    // Check if Vale config exists
    if (!fs.existsSync(valeConfigPath)) {
        console.log('⚠️  Vale configuration file not found at:', valeConfigPath);
        console.log('📖 Please install Vale first: https://vale.sh/docs/vale-cli/installation/');
        return false;
    }
    
    // Ensure VS Code settings directory exists
    const settingsDir = path.dirname(settingsPath);
    if (!fs.existsSync(settingsDir)) {
        fs.mkdirSync(settingsDir, { recursive: true });
        console.log('📁 Created VS Code settings directory');
    }
    
    // Read existing settings or create new
    let settings = {};
    if (fs.existsSync(settingsPath)) {
        try {
            const settingsContent = fs.readFileSync(settingsPath, 'utf8');
            settings = JSON.parse(settingsContent);
            console.log('📖 Read existing VS Code settings');
        } catch (error) {
            console.log('⚠️  Could not parse existing settings, creating new ones');
            settings = {};
        }
    }
    
    // Update Vale configuration
    settings['vale.valeCLI.config'] = valeConfigPath;
    settings['vale.valeCLI.path'] = 'vale';
    
    // Add other SFDocs recommended settings
    settings['editor.defaultFormatter'] = 'esbenp.prettier-vscode';
    settings['editor.formatOnSave'] = true;
    settings['cSpell.words'] = [
        ...(settings['cSpell.words'] || []),
        'Salesforce', 'SFDocs', 'SFDX', 'Trailhead', 'Apex', 'Lightning', 'Visualforce'
    ].filter((word, index, self) => self.indexOf(word) === index); // Remove duplicates
    
    // Write updated settings
    try {
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 4));
        console.log('✅ Successfully configured Vale for SFDocs Extension Pack!');
        console.log('🎉 Vale configuration path set to:', valeConfigPath);
        console.log('💡 Restart VS Code to apply changes');
        return true;
    } catch (error) {
        console.error('❌ Failed to write VS Code settings:', error.message);
        return false;
    }
}

function main() {
    console.log('\n' + '='.repeat(60));
    
    if (updateVSCodeSettings()) {
        console.log('\n🚀 Setup complete! Your SFDocs Extension Pack is ready to use.');
        console.log('📝 Open a Markdown file to see Vale in action.');
    } else {
        console.log('\n❌ Setup failed. Please configure Vale manually:');
        console.log('1. Open VS Code Settings (Cmd/Ctrl + ,)');
        console.log('2. Search for "Vale"');
        console.log('3. Set "Vale CLI: Config" to:', getValeConfigPath());
    }
    
    console.log('='.repeat(60) + '\n');
}

if (require.main === module) {
    main();
}

module.exports = { updateVSCodeSettings, getValeConfigPath, getVSCodeSettingsPath };