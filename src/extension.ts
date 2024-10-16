// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const openEditor = vscode.commands.registerCommand(
    "formula-editor-vscode.editor",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      const panel = vscode.window.createWebviewPanel(
        "formulaEditor", // Identifies the type of the webview. Used internally
        "Formula Editor", // Title of the panel displayed to the user
        vscode.ViewColumn.Two, // Editor column to show the new webview panel in.
        {} // Webview options. More on these later.
      );
      panel.webview.options = {
        enableScripts: true,
      };

      panel.webview.html = getWebviewContent(
        context.extensionUri,
        panel.webview
      );
    }
  );

  vscode.languages.registerHoverProvider(
    "markdown",
    new (class implements vscode.HoverProvider {
      provideHover(
        _document: vscode.TextDocument,
        _position: vscode.Position,
        _token: vscode.CancellationToken
      ): vscode.ProviderResult<vscode.Hover> {
        const commentCommandUri = vscode.Uri.parse(
          `command:formula-editor-vscode.editor`
        );
        const contents = new vscode.MarkdownString(
          `[Edit this formula](${commentCommandUri})`
        );

        contents.isTrusted = true;

        return new vscode.Hover(contents);
      }
    })()
  );

  context.subscriptions.push(openEditor);
}

function getWebviewContent(_extensionUri: vscode.Uri, webview: vscode.Webview) {
  const scriptPathOnDisk = vscode.Uri.joinPath(
    _extensionUri,
    "node_modules",
    "mathlive",
    "dist",
    "mathlive.js"
  );

  const scriptUri = webview.asWebviewUri(scriptPathOnDisk);
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>untitled</title>
    <script src=${scriptUri}></script>
  </head>
  <body style="text-align: center;">
    <math-field style="margin-top: 40px; font-size: large;">x=\\frac{-b\\pm \\sqrt{b^2-4ac}}{2a}</math-field>
    <script>
    const mf = document.querySelector('math-field');
    mf.mathVirtualKeyboardPolicy = "sandboxed";
    </script>
  </body>
</html>`;
}

// This method is called when your extension is deactivated
export function deactivate() {}
