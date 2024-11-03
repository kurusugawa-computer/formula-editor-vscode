import * as vscode from "vscode";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const openEditor = vscode.commands.registerCommand(
    "formula-editor-vscode.openEditor",
    () => {
      // Get selected text
      let editor = vscode.window.activeTextEditor;
      let doc = editor?.document;
      let cur_selection = editor?.selection;
      let text = doc?.getText(cur_selection);

      const panel = vscode.window.createWebviewPanel(
        "formulaEditor", // Identifies the type of the webview. Used internally
        "Formula Editor", // Title of the panel displayed to the user
        vscode.ViewColumn.Two, // Editor column to show the new webview panel in.
        {} // Webview options. More on these later.
      );
      panel.webview.options = {
        enableScripts: true,
      };

      panel.webview.html = getWebviewEditor(
        context.extensionUri,
        panel.webview,
        text ?? ""
      );
    }
  );

  const openLinkEditor = vscode.commands.registerCommand(
    "formula-editor-vscode.openLinkedEditor",
    () => {
      // Get selected text
      let editor = vscode.window.activeTextEditor;
      let doc = editor?.document;
      let cur_selection = editor?.selection;
      let text = doc?.getText(cur_selection);

      if (text?.includes("\n")) {
        vscode.window.showErrorMessage(
          "Text must not contain line breaks in link mode."
        );
        return;
      }

      const panel = vscode.window.createWebviewPanel(
        "formulaEditor(Linked)", // Identifies the type of the webview. Used internally
        "Formula Editor(Linked)", // Title of the panel displayed to the user
        vscode.ViewColumn.Two, // Editor column to show the new webview panel in.
        {} // Webview options. More on these later.
      );
      panel.webview.options = {
        enableScripts: true,
      };

      panel.webview.html = getWebviewLinkedEditor(
        context.extensionUri,
        panel.webview,
        text ?? "",
        doc?.fileName ?? "unknown",
        cur_selection?.start.line !== undefined
          ? (cur_selection?.start.line + 1).toString()
          : "unknown"
      );

      let range: vscode.Range;
      if (cur_selection !== undefined) {
        range = new vscode.Range(cur_selection.start, cur_selection.end);
      }
      let prevTextLength = text === undefined ? 0 : text.length;

      panel.webview.onDidReceiveMessage(
        (message) => {
          // This code is called when the editor in webview is updated
          const edit = new vscode.WorkspaceEdit();
          if (doc?.uri !== undefined && cur_selection !== undefined) {
            // Replace original text with latex format string of text in editor
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

  context.subscriptions.push(openEditor);
  context.subscriptions.push(openLinkEditor);
}

function getWebviewEditor(
  extensionUri: vscode.Uri,
  webview: vscode.Webview,
  content: string
) {
  const scriptPathOnDisk = vscode.Uri.joinPath(
    extensionUri,
    "node_modules",
    "mathlive",
    "dist",
    "mathlive.js"
  );
  const stylesPathOnDisk = vscode.Uri.joinPath(
    extensionUri,
    "src",
    "public",
    "styles.css"
  );
  const imagePathOnDisk = vscode.Uri.joinPath(
    extensionUri,
    "src",
    "public",
    "copy.svg"
  );

  const scriptUri = webview.asWebviewUri(scriptPathOnDisk);
  const stylesUri = webview.asWebviewUri(stylesPathOnDisk);
  const imageUri = webview.asWebviewUri(imagePathOnDisk);

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <link href="${stylesUri}" rel="stylesheet">
    <script src=${scriptUri}></script>
  </head>
  <body>
    <math-field id="formula">${content}</math-field>
    <div id="copy-box">
      <div id="latex-text"></div>
      <div id="copy-button">
        <img id="icon" src=${imageUri} width="15px" height="20px" title="Copy latex format text" onClick=copy()>
        <p id="copied-text" class="hidden">Copied!</p>
      </div>
    </div>
    <script>
      const mf = document.querySelector('math-field');
      mf.mathVirtualKeyboardPolicy = "sandboxed";

      let formulaElement = document.getElementById('formula');
      let latexElement = document.getElementById('latex-text');
      setInterval(() => {
        latexElement.textContent = formulaElement.value;
      },1)

      function copy() {
        let latexElement = document.getElementById('latex-text');
        navigator.clipboard.writeText(latexElement.textContent);
      }

      const copiedText = document.getElementById('copied-text');
      const icon = document.getElementById('icon');

      icon.addEventListener('click', () => {
        copiedText.classList.remove('hidden');
        copiedText.classList.add('popup-message');
      });

      copiedText.addEventListener('animationend', () => {
        copiedText.classList.remove('popup-message');
        copiedText.classList.add('hidden');
      });
    </script>
  </body>
</html>`;
}

function getWebviewLinkedEditor(
  _extensionUri: vscode.Uri,
  webview: vscode.Webview,
  content: string,
  fileName: string,
  line: string
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
    <p id="explanation">
      (This formula is linked to part of line ${line} in ${fileName})
    </p>
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
