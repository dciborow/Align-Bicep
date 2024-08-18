import { operatorGroups } from "./operatorGroups";

/**
 * Represents a segment of a line that contains an operator and its metadata.
 * Used to manage and decorate code segments based on detected operators.
 */
export default interface LinePart {
  text: string; // The content of this line part
  width: number; // Width of the text in pixels
  length: number; // Length of the text in characters
  operator: string; // The detected operator in this part
  operatorWidth: number; // The width of the operator in pixels
  operatorType: keyof typeof operatorGroups; // The type/category of the operator
  decorationLocation: number; // Position in the text for decoration
  decoratorChar: string; // The character used for decoration
}
