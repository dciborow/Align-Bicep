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
    assert.strictEqual(test5.parts[0].text, '<Route path="');
    assert.strictEqual(test5.parts[0].operator, "/>");
    assert.strictEqual(test5.parts[0].operatorType, "jsx");
    assert.strictEqual(test5.parts[1].text, ' element={<HomePage ');
    assert.strictEqual(test5.parts[1].operator, "/>");
    assert.strictEqual(test5.parts[1].operatorType, "jsx");
  });

  const case6 = '<Route path="/plan" element={<PlanPage />} />';
  const test6 = LineData.fromString(case6);
  test("Test JSX Alignment", () => {
    assert.strictEqual(test6.prefix, "", "JSX prefix should be empty");
    assert.strictEqual(
      test6.parts.length,
      5,
      "JSX should be split into five parts"
    );
    assert.strictEqual(test6.parts[0].text, '<Route path="');
    assert.strictEqual(test6.parts[0].operator, "/>");
    assert.strictEqual(test6.parts[0].operatorType, "jsx");
    assert.strictEqual(test6.parts[1].text, ' element={<PlanPage ');
    assert.strictEqual(test6.parts[1].operator, "/>");
    assert.strictEqual(test6.parts[1].operatorType, "jsx");
  });

  const case7 = `
    <Route path="/"        element={<HomePage    />} />
    <Route path="/plan"    element={<PlanPage    />} />
    <Route path="/develop" element={<DevelopPage />} />
    <Route path="/release" element={<ReleasePage />} />
    <Route path="/review"  element={<ReviewPage  />} />
    <Route path="/monitor" element={<MonitorPage />} />
  `;
  const test7 = LineData.fromString(case7);
  test("Test Route Elements Alignment", () => {
    assert.strictEqual(test7.prefix, "", "Route prefix should be empty");
    assert.strictEqual(
      test7.parts.length,
      6,
      "Route elements should be split into six parts"
    );
    assert.strictEqual(test7.parts[0].text, '<Route path="/"        element={<HomePage    />} />');
    assert.strictEqual(test7.parts[1].text, '<Route path="/plan"    element={<PlanPage    />} />');
    assert.strictEqual(test7.parts[2].text, '<Route path="/develop" element={<DevelopPage />} />');
    assert.strictEqual(test7.parts[3].text, '<Route path="/release" element={<ReleasePage />} />');
    assert.strictEqual(test7.parts[4].text, '<Route path="/review"  element={<ReviewPage  />} />');
    assert.strictEqual(test7.parts[5].text, '<Route path="/monitor" element={<MonitorPage />} />');
  });
});
