// Even though this project uses CodeMirror 6 it uses a legacy constructor.
// This is documented here: https://codemirror.net/5/doc/manual.html
//
// For this example I was already showing how to use OpenLayers without bundler.
// Thus we import codemirror.min.js in index.html and use the window.CodeMirror constructor.

export function createEditor(element, text, onChange) {
  const editor = CodeMirror(element, {
    tabSize: 2,
    value: text,
    extraKeys: { Tab: false, "Shift-Tab": false },
    mode: "text",
    theme: "ayu-mirage",
    lineNumbers: true,
  });

  editor.on("change", onChange);

  return editor;
}
