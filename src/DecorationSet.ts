import * as vscode from "vscode";
import { decorationTypes } from "./extension";

export default class DecorationSet {
  decorations: vscode.Range[][] = [];

  combine(other: DecorationSet) {
    other.decorations.forEach((ranges, index) =>
      (this.decorations[index] ??= []).push(...ranges)
    );
    return this;
  }

  apply(editor: vscode.TextEditor) {
    this.decorations.forEach((ranges, i) => {
      editor.setDecorations(decorationTypes.getForWidth(i), ranges);
    });

    // Specific handling for JSX elements
    this.decorations.forEach((ranges, i) => {
      ranges.forEach((range) => {
        const lineText = editor.document.lineAt(range.start.line).text;
        if (lineText.includes("<") && lineText.includes(">")) {
          editor.setDecorations(decorationTypes.getForWidth(i), ranges);
        }
      });
    });
  }
}
