// Simple test to understand prefix detection
const LineData = require('./dist/LineData').default;

const testCases = [
  "  system.debug: ${{ parameters.debug }}",
  "  ROOT             : $(Build.SourcesDirectory)",
  "  REPOROOT         : $(Build.SourcesDirectory)",
  "  OUTPUTROOT       : $(REPOROOT)/out",
  "  NUGET_XMLDOC_MODE: none",
  "bar.foo = value",
  "bar.foobar = value",
  "resource userAssignedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2018-11-30' = { name: '${prefix}-id', location: location }"
];

for (const testCase of testCases) {
  const data = LineData.fromString(testCase);
  console.log(`Line: "${testCase}"`);
  console.log(`  Prefix: "${data.prefix}"`);
  console.log(`  Parts: ${data.parts.length}`);
  if (data.parts.length > 0) {
    console.log(`  First part text: "${data.parts[0].text}"`);
    console.log(`  First part operator: "${data.parts[0].operator}"`);
    console.log(`  First part operatorType: "${data.parts[0].operatorType}"`);
  }
  console.log('---');
}
