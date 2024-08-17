export const operatorGroups = {
  assignment: ["=", "+=", "-=", "*=", "/=", "??=", "^=", "|=", ":=", ":", "?"],
  binary: ["+", "-", "*", "/", "??", "**", ".."],
  comparison: ["===", "!==", "==", "!=", ">=", "<="],
  comma: [],
  index: [".", "->", "=>"],
  jsx: ["<", ">", "/>"], // JSX-related operators
  types: [
    "string",
    "int",
    "object",
    "bool",
    "array",
    "securestring",
    "secureObject",
  ],
};

// Define the operatorsGroup mapping object
export const operatorsGroup: {
  [operator: string]: keyof typeof operatorGroups;
} = {};

// Populate the operatorsGroup with mappings
(Object.keys(operatorGroups) as (keyof typeof operatorGroups)[]).forEach(
  (groupName) => {
    operatorGroups[groupName].forEach((operator) => {
      operatorsGroup[operator] = groupName;
    });
  }
);

const operatorsSorted = [
  ...operatorGroups.assignment,
  ...operatorGroups.types,
  ...operatorGroups.binary,
  ...operatorGroups.comparison,
  ...operatorGroups.comma,
  ...operatorGroups.jsx, // Add JSX operators to the sorted list
].sort((a, b) => b.length - a.length); // naive regex escape

export const getLineMatch = () =>
  new RegExp(
    `(.*?(.))(${operatorsSorted
      .map(
        (operator) =>
          (operatorsGroup[operator] === "types" ||
          operatorsGroup[operator] === "jsx"
            ? operator
            : operator.replace(/(.)/g, "\\$1")) +
          (operatorsGroup[operator] === "binary" ? "(?=\\s)" : "")
      )
      .join("|")})`,
    "g"
  );
