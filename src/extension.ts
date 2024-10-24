// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const openEditor = vscode.commands.registerCommand(
    "formula-editor-vscode.openEditor",
    () => {
      const panel = vscode.window.createWebviewPanel(
        "formulaEditor", // Identifies the type of the webview. Used internally
        "Formula Editor", // Title of the panel displayed to the user
        vscode.ViewColumn.Two, // Editor column to show the new webview panel in.
        {} // Webview options. More on these later.
      );
      panel.webview.options = {
        enableScripts: true,
      };

      let editor = vscode.window.activeTextEditor;
      let doc = editor?.document;
      let cur_selection = editor?.selection;
      let text = doc?.getText(cur_selection);

      panel.webview.html = getWebviewContent(
        context.extensionUri,
        panel.webview,
        text ?? ""
      );

      let range: vscode.Range;
      if (cur_selection !== undefined) {
        range = new vscode.Range(cur_selection.start, cur_selection.end);
      }
      let prevTextLength = text === undefined ? 0 : text.length;

      panel.webview.onDidReceiveMessage(
        (message) => {
          const edit = new vscode.WorkspaceEdit();
          if (doc?.uri !== undefined && cur_selection !== undefined) {
            edit.replace(doc?.uri, range, message.text);
            vscode.workspace.applyEdit(edit);
            range = new vscode.Range(
              range.start.line,
              range.start.character,
              range.end.line,
              range.end.character + (message.text.length - prevTextLength)
            );
            prevTextLength = message.text.length;
          }
        },
        undefined,
        context.subscriptions
      );
    }
  );

  const openEditorFromHover = vscode.commands.registerCommand(
    "formula-editor-vscode.openEditorFromHover",
    () => {
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
        panel.webview,
        ""
      );
    }
  );

  vscode.languages.registerHoverProvider(
    "markdown",
    new (class implements vscode.HoverProvider {
      provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        _token: vscode.CancellationToken
      ): vscode.ProviderResult<vscode.Hover> {
        const commentCommandUri = vscode.Uri.parse(
          `command:formula-editor-vscode.openEditorFromHover`
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
  context.subscriptions.push(openEditorFromHover);
}

function getWebviewContent(
  _extensionUri: vscode.Uri,
  webview: vscode.Webview,
  content: string
) {
  const scriptPathOnDisk = vscode.Uri.joinPath(
    _extensionUri,
    "node_modules",
    "mathlive",
    "dist",
    "mathlive.js"
  );
  const stylesPathOnDisk = vscode.Uri.joinPath(
    _extensionUri,
    "src",
    "public",
    "styles.css"
  );

  const scriptUri = webview.asWebviewUri(scriptPathOnDisk);
  const stylesUri = webview.asWebviewUri(stylesPathOnDisk);

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <link href="${stylesUri}" rel="stylesheet">
    <script src=${scriptUri}></script>
  </head>
  <body>
    <math-field id="formula">${content}</math-field>
    <script>
    const mf = document.querySelector('math-field');
    mf.mathVirtualKeyboardPolicy = "sandboxed";

    const vscode = acquireVsCodeApi();
    var prevKatex = document.getElementById("formula").value;
    setInterval(() => {
      var katex = document.getElementById("formula").value;
      if(prevKatex != katex){
        vscode.postMessage({
          text: katex,
        })
        prevKatex = katex
      }
    },1)
    </script>
  </body>
</html>`;
}

// This method is called when your extension is deactivated
export function deactivate() {}
