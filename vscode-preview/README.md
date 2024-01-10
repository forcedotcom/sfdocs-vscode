# SFDocs Markdown Preview

> ℹ️ For the best experience of **SFDocs Markdown Preview** extension , we suggest you to disable the builtin **Markdown Language Features** extension.

SFDocs Markdown Preview provides [Micromark-compliant](https://github.com/micromark/micromark) Markdown previews. It features [most of the out-of-the-box Markdown preview features](https://code.visualstudio.com/docs/languages/markdown) like:

- Dynamic previews
- Editor and preview synchronization
- Custom CSS

![Features GIF](https://github.com/forcedotcom/sfdocs-vscode/blob/master/vscode-preview/media/images/preview.gif?raw=true)

<!-- ## Prerequisites

Before you use the plugin, disable the default markdown-language-feature extension of VS Code by following these steps:
![Manual Install](https://github.com/forcedotcom/sfdocs-vscode/blob/master/vscode-preview/media/images/disable_default_preview.png?raw=true)

1. Click on the **Extension** icon in the Activity Bar on the side of VS Code or use the **View: Extensions** command (⇧⌘X).
2. In the extension filter, type and select **@builtin**.
3. Scroll down and select **Markdown Language Features**
4. Click the **Disable** button.
5. Click the **Reload Required** button to reload VS Code. -->

## Steps to preview with local changes

- Run npm install command to install the dependencies
- Run npm run compile to compile your changes
- fn + F5 to test locally . It will open the vs code in local mode and open the markdown file you want to test in a new window.
- Run npm run package to generate the latest .vsix file

`Always use npm package manager to generate the .vsix file for the extension`.

## For debugging

- For debugging the css you can use the Webview Developer tools

## Shortcuts

| Shortcut              | Description                                       |
| ----------------------- | --------------------------------------------------- |
| Cmd-K F or Ctrl-K F | Open SFDocs Preview in full screen mode     |
| Cmd-K S or Ctrl-K S | Open SFDocs Preview in the side editor mode |


## Markdown Support

The extension supports all CommonMark syntax and the following additional plugins:

### Content Reuse

```md
::include{src="./../shared/test_include.md"}
```

Renders to

![content reuse](https://github.com/forcedotcom/sfdocs-vscode/blob/master/vscode-preview/media/content-reuse.png?raw=true)

### Pull code samples from multiple sources

#### File in the same repository

````mdx
```sfdocs-code {"lang":"java", "title": "From the same repo", "src": "./../../../samples/quip-java/test.java" }

```
````
#### File from a public Gist on GitHub

````mdx
```sfdocs-code {"lang":"markdown", "title": "From a GitHub Gist file", "src": "https://gist.githubusercontent.com/sejal-salesforce/6dfe506915cb0f6b2295d3fd6f8c9fe1/raw" }

```
````

#### File from a public GitHub repository

````mdx
```sfdocs-code {"lang":"javascript", "title": "From lwc-recipes GitHub Repository", "src": "https://raw.githubusercontent.com/trailheadapps/lwc-recipes/master/force-app/main/default/lwc/clock/clock.js" }

```
````

### Callouts

Use callouts in your content.

```md
:::tip
An example of a tip
:::

:::warning
An example of a warning
:::


:::note
An example of a note
:::
```

### Videos

Add YouTube videos to your content.

```m
::video{src="https://youtube.com/embed/di6iwHhrH6s" title="Video from Youtube" type="youtube" }
```

