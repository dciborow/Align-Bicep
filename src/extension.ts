import { setTimeout } from "timers";
import * as vscode from "vscode";
import AlignmentGroup from "./AlignmentGroup";
import DecorationSet from "./DecorationSet";
import DecorationTypeStore from "./DecorationTypeStore";
import LineData from "./LineData";
import { getLineMatch } from "./operatorGroups";

const EXTENSION_ID = "align-bicep";

interface ExtensionConfig extends vscode.WorkspaceConfiguration {
  "allowed-language-ids": string[] | null;
  "disallowed-language-ids": string[] | null;
  "bicep.allowed-language-ids": string[] | null;
  "bicep.disallowed-language-ids": string[] | null;
  delay: number | "off";
}

const disposables: vscode.Disposable[] = [];

let active = true;

export function activate(context: vscode.ExtensionContext) {
  console.log(`Extension "${EXTENSION_ID}" is now active!`);

  disposables.push(
    vscode.commands.registerCommand("align-bicep.toggle", () => {
      active = !active;
      if (active) {
        decorateCurrentEditor(false);
      } else {
        clearDecorations();
      }
    }),
    vscode.commands.registerCommand("align-bicep.realign", () => {
      if (active) {
        decorateCurrentEditor(false);
      }
    })
  );

  const onChangeTextHandler = (
    event: vscode.TextDocumentChangeEvent | vscode.TextDocument
  ) => {
    const doc = "document" in event ? event.document : event;

    const openEditor = vscode.window.visibleTextEditors.find(
      (editor) => editor.document.uri === doc.uri
    );

    if (openEditor) {
      decorateDebounced(openEditor);
    }
  };

  function decorateCurrentEditor(debounce: boolean) {
    const currentEditor = vscode.window.activeTextEditor;
    if (!currentEditor) {
      return;
    }

    const languageId = currentEditor.document.languageId;

    if (shouldDecorateLanguage(languageId)) {
      if (debounce) {
        decorateDebounced(currentEditor);
      } else {
        decorate(currentEditor);
      }
    } else {
      clearDecorations();
    }
  }

  vscode.workspace.onDidChangeTextDocument(onChangeTextHandler);

  vscode.window.onDidChangeActiveTextEditor(
    (editor: vscode.TextEditor | undefined) => {
      if (!editor) {
        return;
      }

      decorate(editor);
    }
  );

  vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration(EXTENSION_ID)) {
      loadConfig();

      decorateCurrentEditor(false);
    }
  });

  loadConfig();

  decorateCurrentEditor(false);
}

const config: {
  current: ExtensionConfig;
} = {
  current: vscode.workspace.getConfiguration(EXTENSION_ID) as ExtensionConfig,
};

function loadConfig() {
  config.current = vscode.workspace.getConfiguration(
    EXTENSION_ID
  ) as ExtensionConfig;

  for (const setting of [
    "allowed-language-ids",
    "disallowed-language-ids",
    "bicep.allowed-language-ids",
    "bicep.disallowed-language-ids",
  ]) {
    if (config.current[setting] !== null) {
      if (
        !(config.current[setting] instanceof Array) ||
        config.current[setting].some((t: any) => typeof t !== "string")
      ) {
        (config.current as any)[setting] = null;
        console.warn(`Invalid "${setting}" setting`);
      }
    }
  }

  if (config.current.delay !== "off") {
    if (typeof config.current.delay !== "number") {
      config.current.delay = "off";
    }
  }
}

export const decorationTypes = new DecorationTypeStore();
disposables.push(decorationTypes);

export function getPhysicalWidth(line: string) {
  return line
    .split("")
    .map((ch, i) => (ch === "\t" ? 4 - ((i + 1) % 4) + 3 : 1))
    .reduce((a, b) => a + b, 0);
}

class ThingBuilder<T> {
  public current: T | null = null;

  private _all: T[] = [];

  get all() {
    return this._all;
  }

  push(next?: T) {
    if (this.current !== null) {
      this._all.push(this.current);
    }

    this.current = next === undefined ? null : next;
  }
}

function obfuscateStrings(str: string) {
  return str.replace(
    /(?<!\\)("|`)(.*?)(?<!\\)\1/g,
    (_match, quote, content) => quote + content.replace(/./g, " ") + quote
  );
}

function shouldDecorateLanguage(id: string) {
  if (
    config.current["allowed-language-ids"] === null &&
    config.current["disallowed-language-ids"] === null &&
    config.current["bicep.allowed-language-ids"] === null &&
    config.current["bicep.disallowed-language-ids"] === null
  ) {
    return true;
  }

  if (config.current["disallowed-language-ids"] !== null) {
    if (config.current["disallowed-language-ids"].includes(id)) {
      return false;
    }
  }
  if (config.current["allowed-language-ids"] !== null) {
    return config.current["allowed-language-ids"].includes(id);
  }
  if (config.current["bicep.disallowed-language-ids"] !== null) {
    if (config.current["bicep.disallowed-language-ids"].includes(id)) {
      return false;
    }
  }
  if (config.current["bicep.allowed-language-ids"] !== null) {
    return config.current["bicep.allowed-language-ids"].includes(id);
  }
  return true;
}

function clearDecorations() {
  decorationTypes.reset();
}

let timeoutId: null | number = null;
function decorateDebounced(editor: vscode.TextEditor) {
  if (!shouldDecorateLanguage(editor.document.languageId)) {
    return;
  }

  const delay = config.current.delay;

  if (delay === "off") {
    return;
  }

  if (delay <= 0) {
    decorate(editor);
    return;
  }

  if (timeoutId) {
    (clearTimeout as unknown as (id: number) => void)(timeoutId);
    timeoutId = null;
  }

  timeoutId = (
    setTimeout as unknown as (callback: () => void, delay: number) => number
  )(() => {
    decorate(editor);
    timeoutId = null;
  }, delay);
}

function decorate(editor: vscode.TextEditor) {
  if (!active) {
    return;
  }

  if (!shouldDecorateLanguage(editor.document.languageId)) {
    return;
  }

  clearDecorations();

  let sourceCode = editor.document.getText();

  const sourceCodeArr = sourceCode.split("\n");

  const groupBuilder = new ThingBuilder<AlignmentGroup>();

  for (let line = 0; line < sourceCodeArr.length; line++) {
    const lineMatch = getLineMatch();

    const lineString = obfuscateStrings(sourceCodeArr[line]);

    if (!lineMatch.test(lineString)) {
      groupBuilder.push();
      continue;
    }

    const stuff =
      editor.document.languageId === "bicep"
        ? LineData.fromBicepString(lineString)
        : LineData.fromString(lineString);

    if (
      groupBuilder.current &&
      !groupBuilder.current.isLineStuffCompatible(stuff)
    ) {
      groupBuilder.push();
    }

    if (groupBuilder.current === null) {
      groupBuilder.current = new AlignmentGroup(line, [stuff]);
      continue;
    }

    groupBuilder.current.lines.push(stuff);
  }
  groupBuilder.push();

  const groups = groupBuilder.all;

  const decorators = groups
    .map((group) => group.resolveAlignment())
    .reduce((all, curr) => all.combine(curr), new DecorationSet());

  decorators.apply(editor);
}

export function deactivate() {
  disposables.forEach((d) => d.dispose());
  console.log('Extension "align-bicep" deactivated.');
}
