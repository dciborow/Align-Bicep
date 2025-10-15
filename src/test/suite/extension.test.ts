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
    // Prefix detection is disabled, so prefix should be empty
    assert.strictEqual(
      test3.prefix,
      "",
      "Resource prefix should be empty"
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

  // Test case for issue: "Does not format correctly when there is a '.' in the string of the line"
  // https://github.com/dciborow/Align-Bicep/issues/...
  const case6 = "  system.debug: value";
  const test6 = LineData.fromString(case6);
  test("Test identifier with dot (e.g., YAML key)", () => {
    assert.strictEqual(
      test6.prefix,
      "",
      "Identifier with dot should have empty prefix to align with other identifiers"
    );
    assert.strictEqual(test6.parts.length, 1, "Should have 1 part (assignment only)");
    assert.strictEqual(test6.parts[0].operator, ":");
    assert.strictEqual(test6.parts[0].operatorType, "assignment");
  });
});
