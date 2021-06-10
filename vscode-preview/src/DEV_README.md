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

