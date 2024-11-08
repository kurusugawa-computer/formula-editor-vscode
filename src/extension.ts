import * as vscode from "vscode";
import { getWebviewEditor } from "./formulaEditor";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const openEditor = vscode.commands.registerCommand(
    "formula-editor-vscode.openEditor",
    () => {
      let text = getSelectedText();

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

  /*
  const openLinkEditor = vscode.commands.registerCommand(
    "formula-editor-vscode.openLinkedEditor",
    () => {
      // Get selected text
      let text = getSelectedText();

      if (text?.includes("\n")) {
        vscode.window.showErrorMessage(
          "リンクモードでは改行を含むテキストは選択できません。"
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

      let editor = vscode.window.activeTextEditor;
      let doc = editor?.document;
      let cur_selection = editor?.selection;

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
  */

  context.subscriptions.push(openEditor);
  //  context.subscriptions.push(openLinkEditor);
}

function getSelectedText() {
  let editor = vscode.window.activeTextEditor;
  let doc = editor?.document;
  let cur_selection = editor?.selection;
  let text = doc?.getText(cur_selection);

  return text;
}

// This method is called when your extension is deactivated
export function deactivate() {}
