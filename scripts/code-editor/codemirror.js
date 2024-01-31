// Even though this project uses CodeMirror 6 it uses a legacy constructor.
// This is documented here: https://codemirror.net/5/doc/manual.html
//
// For this example I was already showing how to use OpenLayers without bundler.
// Thus we import codemirror.min.js in index.html and use the window.CodeMirror constructor.

export async function initializeEditors(
  jsonfgText,
  crsText,
  onJsonChange,
  onCrsChange
) {
  const jsonfgEditor = CodeMirror(document.getElementById("jsonfg-editor"), {
    tabSize: 2,
    value: jsonfgText,
    extraKeys: { Tab: false, "Shift-Tab": false },
    mode: "text",
    theme: "ayu-mirage",
    lineNumbers: true,
  });

  const crsEditor = CodeMirror(document.getElementById("crs-editor"), {
    tabSize: 2,
    value: crsText,
    extraKeys: { Tab: false },
    mode: "text",
    theme: "ayu-mirage",
    lineNumbers: true,
  });

  jsonfgEditor.on("change", onJsonChange);
  crsEditor.on("change", onCrsChange);

  window.jsonfgEditor = jsonfgEditor;
  window.crsEditor = crsEditor;
}
