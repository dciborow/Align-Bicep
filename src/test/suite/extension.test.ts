import * as assert from "assert";

import LineData from "../../LineData";

suite("Bicep Test Suite", () => {
  const case1 = "param isZoneRedundant bool = false";
  const test1 = LineData.fromString(case1);
  test("Test Parameters", () => {
    assert.strictEqual(test1.prefix, "");
    assert.strictEqual(test1.parts[0].text, "param isZoneRedundant ");
    assert.strictEqual(test1.parts[0].operator, "bool");
    assert.strictEqual(test1.parts[0].operatorType, "types");
    assert.strictEqual(test1.parts[1].operator, "=");
    assert.strictEqual(test1.parts[1].operatorType, "assignment");
  });

  const case2 = "var certificateIssuer = 'Subscription-Issuer'";
  const test2 = LineData.fromString(case2);
  test("Test Variables", () => {
    assert.strictEqual(test2.prefix, "");
    assert.strictEqual(test2.parts[0].text, "var certificateIssuer ");
    assert.strictEqual(test2.parts[0].operator, "=");
    assert.strictEqual(test2.parts[0].operatorType, "assignment");
  });

  const case3 =
    "resource userAssignedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2018-11-30' = { name: '${prefix}-id', location: location }";
  const test3 = LineData.fromString(case3);
  test("Test Resources", () => {
    assert.strictEqual(
      test3.prefix,
      "resource userAssignedIdentity 'Microsoft.",
      "Resource prefix not equal"
    );
    assert.strictEqual(
      test3.parts[0].text,
      "resource userAssignedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2018-11-30' ",
      "Resource text not equal"
    );
    assert.strictEqual(test3.parts[0].operator, "=");
    assert.strictEqual(test3.parts[0].operatorType, "assignment");
  });

  const case4 = "output appName string = appName";
  const test4 = LineData.fromString(case4);
  test("Test Output", () => {
    assert.strictEqual(test4.prefix, "");
    assert.strictEqual(test4.parts[0].text, "output appName ");
    assert.strictEqual(test4.parts[0].operator, "string");
    assert.strictEqual(test4.parts[0].operatorType, "types");
    assert.strictEqual(test4.parts[1].operator, "=");
    assert.strictEqual(test4.parts[1].operatorType, "assignment");
  });

  const case5 = '<Route path="/" element={<HomePage />} />';
  const test5 = LineData.fromString(case5);
  test("Test JSX Attributes", () => {
    assert.strictEqual(test5.prefix, "", "JSX prefix should be empty");
    assert.strictEqual(
      test5.parts.length,
      5,
      "JSX should be split into five parts"
    );
  });

  const case6 = "import Sidebar from './components/Sidebar';";
  const test6 = LineData.fromString(case6);
  test("Test Import Statements", () => {
    assert.strictEqual(test6.prefix, "", "Import prefix should be empty");
    assert.strictEqual(
      test6.parts.length,
      2,
      "Import statement should be split into two parts"
    );
    assert.strictEqual(
      test6.parts[0].text,
      "import Sidebar ",
      "First part of import statement should be 'import Sidebar '"
    );
    assert.strictEqual(
      test6.parts[0].operator,
      "from",
      "First operator should be 'from'"
    );
    assert.strictEqual(
      test6.parts[0].operatorType,
      "importGroup",
      "First operator type should be 'importGroup'"
    );
    assert.strictEqual(
      test6.parts[1].text,
      " './components/Sidebar';",
      "Second part of import statement should be ' './components/Sidebar';'"
    );
  });

  // New test case for import statements with multiple parts
  const case7 = "import { Sidebar, Header } from './components';";
  const test7 = LineData.fromString(case7);
  test("Test Import Statements with Multiple Parts", () => {
    assert.strictEqual(test7.prefix, "", "Import prefix should be empty");
    assert.strictEqual(
      test7.parts.length,
      2,
      "Import statement should be split into two parts"
    );
    assert.strictEqual(
      test7.parts[0].text,
      "import { Sidebar, Header } ",
      "First part of import statement should be 'import { Sidebar, Header } '"
    );
    assert.strictEqual(
      test7.parts[0].operator,
      "from",
      "First operator should be 'from'"
    );
    assert.strictEqual(
      test7.parts[0].operatorType,
      "importGroup",
      "First operator type should be 'importGroup'"
    );
    assert.strictEqual(
      test7.parts[1].text,
      " './components';",
      "Second part of import statement should be ' './components';'"
    );
  });

  // New test case for createFromPart method
  const part = "import Sidebar ";
  const text = "import Sidebar ";
  const operator = "from";
  const decoratorChar = " ";
  const fromPart = LineData.createFromPart(part, text, operator, decoratorChar);
  test("Test createFromPart Method", () => {
    assert.strictEqual(fromPart.text, part, "Text should match the part");
    assert.strictEqual(fromPart.length, part.length, "Length should match the part length");
    assert.strictEqual(fromPart.width, getPhysicalWidth(part), "Width should match the physical width of the part");
    assert.strictEqual(fromPart.operator, operator, "Operator should match the provided operator");
    assert.strictEqual(fromPart.operatorWidth, getPhysicalWidth(operator), "Operator width should match the physical width of the operator");
    assert.strictEqual(fromPart.operatorType, "importGroup", "Operator type should be 'importGroup'");
    assert.strictEqual(fromPart.decorationLocation, text.length, "Decoration location should match the text length");
    assert.strictEqual(fromPart.decoratorChar, decoratorChar, "Decorator char should match the provided decorator char");
  });
});
