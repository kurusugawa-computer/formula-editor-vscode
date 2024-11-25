import * as vscode from "vscode";
import { getLocale } from "./extension";

interface UIStrings {
  lang: string;
  copyTooltip: string;
  copyNotice: string;
}

export function getWebviewEditor(
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
  const uiStrings = getUIStrings();

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
        <img id="icon" src=${imageUri} width="15px" height="20px" title="${uiStrings.copyTooltip}" onClick=copy()>
        <p id="copied-text">${uiStrings.copyNotice}</p>
      </div>
    </div>
    <script>
      const mf = document.querySelector('math-field');
      mf.mathVirtualKeyboardPolicy = "sandboxed";
      mf.menuItems = mf.menuItems.filter(item => !(item.id == 'copy' || item.id == 'cut'));

      MathfieldElement.locale = "${uiStrings.lang}";

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

function getUIStrings(): UIStrings {
  const lang = getLocale();
  let uiStrings: UIStrings;
  switch (lang) {
    case "ja":
      uiStrings = {
        lang: lang,
        copyTooltip: "latex形式でコピー",
        copyNotice: "コピーしました",
      };
      break;
    case "en":
      uiStrings = {
        lang: lang,
        copyTooltip: "copy latex format string",
        copyNotice: "Copied!",
      };
      break;
    default:
      uiStrings = {
        lang: lang,
        copyTooltip: "copy latex format string",
        copyNotice: "Copied!",
      };
      break;
  }

  return uiStrings;
}

/*
export function getWebviewLinkedEditor(
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
      (この数式は ${fileName} の ${line} 行目とリンクされています)
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
*/
