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
    const parts: LinePart[] = [];

    let match: RegExpExecArray | null = null;

    const indentation = line.match(/^\s*/)?.[0] || ""; // Pf6ab

    while ((match = lineMatch.exec(line)) !== null) {
      const [part, text, decoratorChar, operator] = match;

      if (operator === "<" || operator === ">" || operator === "/>") {
        // JSX tag handling
        parts.push({
          text: part,
          length: part.length,
          width: getPhysicalWidth(part),
          operator: operator,
          operatorWidth: getPhysicalWidth(operator),
          operatorType: "jsx",
          decorationLocation: text.length,
          decoratorChar: decoratorChar,
        });
      } else {
        // General case handling
        const operatorType = this.findOperatorGroup(operator); // P8c8f
        if (!operatorType) {
          throw new Error(`Unknown operator type for operator: ${operator}`);
        }

        parts.push({
          text: text,
          length: part.length,
          width: getPhysicalWidth(part),
          operator: operator,
          operatorWidth: getPhysicalWidth(operator),
          operatorType,
          decorationLocation: text.length,
          decoratorChar,
        });
      }
    }

    // Add additional logic here to split attributes and embedded JSX expressions
    // if necessary, particularly for cases like `path="/"` or `{<HomePage />}`.

    // Determine the prefix (if any) for object properties
    let prefix = "";
    if (parts.length > 0 && parts[0].operatorType === "assignment") {
      const prefixMatch = /^\s*(.*(?:\.|->))\w+/.exec(parts[0].text);
      if (prefixMatch) {
        prefix = prefixMatch[1];
      }
    }

    return new LineData(indentation, prefix, parts); // Pf6ab
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

  private static findOperatorGroup(operator: string): keyof typeof operatorGroups | undefined { // P8c8f
    return Object.keys(operatorGroups).find(group => // P8c8f
      operatorGroups[group as keyof typeof operatorGroups].includes(operator) // P8c8f
    ) as keyof typeof operatorGroups | undefined; // P8c8f
  } // P8c8f
}
