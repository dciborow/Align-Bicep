import * as vscode from "vscode";

export default class DecorationTypeStore implements vscode.Disposable {
  private store: vscode.TextEditorDecorationType[] = [];

  getForWidth(width: number) {
    if (!this.store[width]) {
      this.store[width] = vscode.window.createTextEditorDecorationType({
        letterSpacing: `${width}ch`,
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
      });
    }
    return this.store[width];
  }

  reset() {
    this.store.forEach((v) => v.dispose());
    this.store.length = 0;
  }

  dispose() {
    this.reset();
  }
}
