import { getPhysicalWidth } from "./extension";
import { getLineMatch, operatorGroups } from "./operatorGroups";
import LinePart from "./LinePart";

export default class LineData {
  constructor(
    public indentation: string,
    public prefix: string,
    public parts: LinePart[]
  ) {}

  static fromString(line: string) {
    const lineMatch = getLineMatch();

    const indentation = LineData.extractIndentation(line);
    const parts: LinePart[] = LineData.extractParts(line, lineMatch);

    const prefix = LineData.determinePrefix(parts);

    return new LineData(indentation, prefix, parts);
  }

  static extractIndentation(line: string): string {
    return /^\s*(?:(?:\/\/|\*)\s*)?/.exec(line)![0];
  }

  private static extractParts(line: string, lineMatch: RegExp): LinePart[] {
    const parts: LinePart[] = [];

    for (let match: RegExpExecArray | null = null; (match = lineMatch.exec(line)); ) {
      const [part, text, decoratorChar, operator] = match;

      if (LineData.isJSXOperator(operator)) {
        parts.push(LineData.createJSXPart(part, text, operator, decoratorChar));
        continue;
      }

      parts.push(LineData.createLinePart(part, text, operator, decoratorChar));
    }

    return parts;
  }

  private static isJSXOperator(operator: string): boolean {
    return operator === "<" || operator === ">" || operator === "/>";
  }

  private static createJSXPart(part: string, text: string, operator: string, decoratorChar: string): LinePart {
    return {
      text: part,
      length: part.length,
      width: getPhysicalWidth(part),
      operator: operator,
      operatorWidth: getPhysicalWidth(operator),
      operatorType: "jsx",
      decorationLocation: text.length,
      decoratorChar: decoratorChar,
    };
  }

  static createLinePart(part: string, text: string, operator: string, decoratorChar: string): LinePart {
    const width = getPhysicalWidth(part);
    const operatorWidth = getPhysicalWidth(operator);
    const decorationLocation = text.length;

    const operatorType = LineData.findOperatorType(operator);

    return {
      text,
      length: part.length,
      width,
      operator,
      operatorWidth,
      operatorType,
      decorationLocation,
      decoratorChar,
    };
  }

  static findOperatorType(operator: string): keyof typeof operatorGroups {
    for (const group in operatorGroups) {
      if (operatorGroups[group as keyof typeof operatorGroups].includes(operator)) {
        return group as keyof typeof operatorGroups;
      }
    }
    throw new Error(`Unknown operator type for operator: ${operator}`);
  }

  static determinePrefix(parts: LinePart[]): string {
    if (parts.length > 0 && parts[0].operatorType === "assignment") {
      const prefixMatch = /^\s*(.*(?:\.|->))\w+/.exec(parts[0].text);
      if (prefixMatch) {
        return prefixMatch[1];
      }
    }
    return "";
  }

  compare(other: LineData) {
    if (this.indentation !== other.indentation) {
      return false;
    }
    if (this.prefix !== other.prefix) {
      return false;
    }

    const lim = Math.min(this.parts.length, other.parts.length);

    for (let i = 0; i < lim; i++) {
      if (this.parts[i].operatorType !== other.parts[i].operatorType) {
        return false;
      }
    }

    return true;
  }
}
