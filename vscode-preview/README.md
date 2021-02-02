# vscode-salesforcedocs-preview README

This extension will use Micromark processor to generate markdown Preview.

## Features

![Details](https://github.com/salesforcedocs/vscode-salesforcedocs-preview/blob/master/media/images/configDetails.png?raw=true)

## Extension file

The extension is not yet published to VS Code Marketplace but you can download the extension packaged file from here : [SalesforceDocs Preview](https://drive.google.com/uc?export=download&id=1vOKc9g4on0P-0iuH2BTtwTNrxziuiDWy)

You can manually install a VS Code extension packaged in a **.vsix** file. 
Using the Install from VSIX command in the Extensions view command drop-down, or the Extensions: Install from VSIX command in the Command Palette, point to the .vsix file.

You can also install using the VS Code --install-extension command-line switch providing the path to the .vsix file.

```code --install-extension salesforcedocs-preview-1.0.0.vsix```

## Development Mode

To run this extension in development mode , follow below steps:

* Checkout the code : [SalesforceDocs Preview](https://github.com/salesforcedocs/vscode-salesforcedocs-preview)
* Install all dependent packages : `npm install`
* Compile the code : `npm run compile`
* To run/debug the extension in Development hit: `F5` (**Function 5**) key in keyboard.

**Note:** 
To use this extension , It’s better to disable the default markdown-language-feature extension of VS Code. I was trying to find a way to disable default extension whenever this extension get activated but unable to find any api for that. SO we have to do this manually for now.(Any suggestion for this)

Steps to disable the default markdown-language-feature extension:

1. Click on extensions icon on the left hand side Activity bar
2. In the extension filter , type @builtin and hit Enter
    1. It will show you all the built in extension from VS Code
3. Go to Markdown Language Feature extension 
4. Click on to the Settings icon
5. Click on Disable option

*💡 Exact same steps can be used to enable the feature extension back.*


**Enjoy!**
