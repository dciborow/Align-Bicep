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

    // TODO: including comments as "indentation" is hardcoded here. It should be configurable per language
    const indentation = /^\s*(?:(?:\/\/|\*)\s*)?/.exec(line)![0];
    const parts: LinePart[] = [];

    for (
      let match: RegExpExecArray | null = null;
      (match = lineMatch.exec(line));
    ) {
      const [part, text, decoratorChar, operator] = match;

      // Special handling for JSX operators and attributes
      if (operator === "<" || operator === ">" || operator === "/>") {
        // Treat JSX tags as separate parts
        const jsxPart: LinePart = {
          text: part,
          length: part.length,
          width: getPhysicalWidth(part),
          operator: operator,
          operatorWidth: getPhysicalWidth(operator),
          operatorType: "jsx", // Explicitly set as 'jsx'
          decorationLocation: text.length,
          decoratorChar: decoratorChar,
        };
        parts.push(jsxPart);
        continue;
      }

      // Special handling for 'from' keyword in import statements
      if (operator === "from") {
        const fromPart = LineData.createFromPart(part, text, operator, decoratorChar);
        parts.push(fromPart);
        continue;
      }

      // Existing logic for other operators
      const width = getPhysicalWidth(part);
      const operatorWidth = getPhysicalWidth(operator);
      const decorationLocation = text.length;

      // Find the correct operator group (e.g., "assignment", "binary")
      let operatorType: keyof typeof operatorGroups | undefined = undefined;
      for (const group in operatorGroups) {
        if (
          operatorGroups[group as keyof typeof operatorGroups].includes(
            operator
          )
        ) {
          operatorType = group as keyof typeof operatorGroups;
          break;
        }
      }

      if (!operatorType) {
        throw new Error(`Unknown operator type for operator: ${operator}`);
      }

      const linePart: LinePart = {
        text,
        length: part.length, // Correct reference
        width,
        operator,
        operatorWidth,
        operatorType: operatorType as keyof typeof operatorGroups, // Explicitly cast as valid operatorType
        decorationLocation,
        decoratorChar,
      };
      parts.push(linePart);
    }

    let prefix = "";

    if (parts.length > 0 && parts[0].operatorType === "assignment") {
      const prefixMatch = /^\s*(.*(?:\.|->))\w+/.exec(parts[0].text);
      if (prefixMatch) {
        prefix = prefixMatch[1];
      }
    }

    return new LineData(indentation, prefix, parts);
  }

  static createFromPart(part: string, text: string, operator: string, decoratorChar: string): LinePart {
    return {
      text: part,
      length: part.length,
      width: getPhysicalWidth(part),
      operator: operator,
      operatorWidth: getPhysicalWidth(operator),
      operatorType: "importGroup", // Explicitly set as 'importGroup'
      decorationLocation: text.length,
      decoratorChar: decoratorChar,
    };
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
