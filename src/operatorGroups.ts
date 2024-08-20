/**
 * Groups various operators by their purpose. These groups facilitate operations 
 * such as validation, sorting, and regular expression construction. The grouping 
 * ensures operators are categorized logically for different use cases.
 */
export const operatorGroups = {
  assignment: ["=", "+=", "-=", "*=", "/=", "??=", "^=", "|=", ":=", ":", "?"],
  binary: ["+", "-", "*", "/", "??", "**", ".."],
  comparison: ["===", "!==", "==", "!=", ">=", "<="],
  comma: [], // Placeholder for potential future operators that may fit the "comma" category.
  index: [".", "->", "=>"],
  jsx: ["<", ">", "/>"], // JSX-specific operators used in React element syntax.
  types: [
    "string",
    "int",
    "object",
    "bool",
    "array",
    "securestring",
    "secureObject",
  ], // Specific keywords for type categorization, including domain-specific types.
  bicep: [
    "param",
    "var",
    "resource",
    "output",
  ], // Bicep-specific keywords
};

/**
 * Maps each operator to its corresponding group to allow for fast lookup. 
 * This is used when categorizing operators for validation or processing purposes.
 */
export const operatorsGroup: {
  [operator: string]: keyof typeof operatorGroups;
} = {};

/**
 * Populates the operatorsGroup map by iterating through operatorGroups. This 
 * ensures that any future updates to operatorGroups are automatically reflected 
 * in operatorsGroup without additional maintenance.
 */
(Object.keys(operatorGroups) as (keyof typeof operatorGroups)[]).forEach(
  (groupName) => {
    operatorGroups[groupName].forEach((operator) => {
      operatorsGroup[operator] = groupName;
    });
  }
);

/**
 * Sorts operators by length in descending order. This is critical when generating 
 * regular expressions, as longer operators need to be matched first to prevent 
 * shorter operators from matching prematurely (e.g., matching "=" before "===").
 */
const operatorsSorted = [
  ...operatorGroups.assignment,
  ...operatorGroups.types,
  ...operatorGroups.binary,
  ...operatorGroups.comparison,
  ...operatorGroups.comma,
  ...operatorGroups.jsx,
  ...operatorGroups.bicep,
].sort((a, b) => b.length - a.length);

/**
 * Constructs a regular expression that matches any line containing an operator 
 * from the sorted list of operators. This function applies specific handling 
 * to certain categories of operators: JSX and type operators are used directly, 
 * while other operators are escaped for safety. Binary operators are matched 
 * only if followed by whitespace to avoid conflicts with similar operators.
 * 
 * @returns {RegExp} A regular expression for matching lines that contain 
 * any of the operators.
 */
export const getLineMatch = () =>
  new RegExp(
    `(.*?(.))(${operatorsSorted
      .map(
        (operator) =>
          (operatorsGroup[operator] === "types" ||
          operatorsGroup[operator] === "jsx" ||
          operatorsGroup[operator] === "bicep"
            ? operator
            : operator.replace(/(.)/g, "\\$1")) +
          (operatorsGroup[operator] === "binary" ? "(?=\\s)" : "")
      )
      .join("|")})`,
    "g"
  );
