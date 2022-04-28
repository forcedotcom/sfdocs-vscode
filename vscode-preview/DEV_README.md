# Developer instructions

## Build

In order to build you should have nodejs set up and either npm or yarn should installed.

### Setting up in local

- Clone the repo as needed
- Move to the folder `cd sfdocs-vscode/vscode-preview` and open it using `code .`
- run commands `yarn install && yarn compile`

### How do you debug

- In order to open a sandbox kind of Developer extension - presss `fn + F5` in mac.
- Once you have a new window, add a project that you want to see the work of extension (in our case any content-repo)
- open a file and click on the extension icon.
- If you keep any breakpoint it will stop based on the condition.

### Dev tools

- On the developer extension window, you can open developer tool by
`ctrl + shift + P` and then select `Open webview Developer tools`

### Create pakcage

To  build a package for your changes - run the below command

```
yarn package
```
Note: Please increase the version if this is a new package.
In order to test, first uninstall your existing code extension and then add this extension.

### How to test without publishing package.

To run the above created .vsix, you can run the below command.

```
code --install-extension myextension.vsix
```

Example: `code --install-extension ~/sfdocs-vscode/vscode-preview/salesforce-docs-markdown-preview-1.0.5.vsix`

If the above command doesn't work - follow the below procedure mentioned here:  
https://stackoverflow.com/questions/42017617/how-to-install-vs-code-extension-manually

![Local Extension](https://i.stack.imgur.com/nPF49.png)
