# Developer instructions

## Prerequisites

Install Node.js and either npm or yarn (the following instructions are for npm but the corresponding commands in yarn will also work.)

## Local Environment Setup

1. Clone the repo:

  ```shell
  git clone git@github.com:forcedotcom/sfdocs-vscode.git
  ```

2. Move to the folder `cd sfdocs-vscode/vscode-markdown-assistant` and open it using `code .` or `cursor .` (`code` only works if you have code command installed in PATH. Visit [this link](https://stackoverflow.com/questions/29955500/code-not-working-in-command-line-for-visual-studio-code-on-osx-mac) to see how to do this.)
3. run `npm install && npm run compile`.

## How to Debug

- In order to open a sandbox kind of Developer extension - make sure _Run Extension_ is selected in the Run and Debug menu and press the play button or `fn + F5` in mac.
  
  ![Debug](https://github.com/forcedotcom/sfdocs-vscode/blob/master/vscode-markdown-assistant/images/Debug.gif?raw=true)
- Once you have a new window, add a project that you want to see the work of extension (in our case any content-repo) and open any file.
- If you keep any breakpoints, it will stop based on the condition.

## Build Local Package

1. If this is a new package, first increase the version in [package.json](./package.json). For example, if the current version is 0.1.7, the next version is 0.1.8.
2. To build a package for your changes - run the following command:

    ```bash
    npx vsce package
    ```

## Test Local Package

1. Uninstall the existing code extension.
2. Run the following command to install the extension:

    ```shell
    cursor --install-extension <extension_name>.vsix
    # or
    code --install-extension <extension_name>.vsix

    # example: code --install-extension ./sfdocs-markdown-assistant-1.0.5.vsix`
    ```

If the above command doesn't work, right-click the .vsix file in VS Code/Cursor's Explorer and select _Install Extension VSIX_.

Once the extension is installed, verify the version and then you may test the new functionalities.

## Submit Pull Request (PR)

When you are ready to submit a PR, remove the old .vsix file, then commit and push the new one along with your changes.

After your PR is merged, we will handle scheduling the publication of the new extension version to the marketplace.
