# Developer instructions 

## Build

In order to build you should have nodejs set up and either npm or yarn installed. The instructions provided below are with respect to npm, but the corresponding commands in yarn will also work.

### Setting up in local

- Clone the repo as needed
- Move to the folder `cd sfdocs-vscode/sfdocs-markdown-assistant` and open it using `code .` (`code` only works if you have code command installed in PATH. Visit [this link](https://stackoverflow.com/questions/29955500/code-not-working-in-command-line-for-visual-studio-code-on-osx-mac) to see how to do this.)
- run commands `npm install && npm run compile`

### How do you debug

- In order to open a sandbox kind of Developer extension - make sure _Run Extension_ is selected in the Run and Debug menu and press the play button or `fn + F5` in mac.
- Ensure you open in a new window.
  
  ![Debug](https://github.com/forcedotcom/sfdocs-vscode/blob/master/vscode-markdown-assistant/images/Debug.gif?raw=true)
- Once you have a new window, add a project that you want to see the work of extension (in our case any content-repo) and open any file.
- If you keep any breakpoints,  it will stop based on the condition.

### Create pakcage

To  build a package for your changes - run the below command

```
vsce package
```
Note: Please increase the version if this is a new package.
In order to test, first uninstall your existing code extension and then install this extension.

### How to test without publishing package.

To run the above created .vsix, you can run the below command.

```
code --install-extension myextension.vsix
```

Example: `code --install-extension ./sfdocs-markdown-assistant-1.0.5.vsix`

If the above command doesn't work, right click the .vsix file in VS Code's Explorer and select _Install Extension VSIX_ .