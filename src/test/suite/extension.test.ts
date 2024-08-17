import * as assert from 'assert';

import LineData from '../../LineData';

suite('Bicep Test Suite', () => {
	const case1 = 'param isZoneRedundant bool = false';
	const test1 = LineData.fromString(case1);
	test('Test Parameters', () => {
		assert.strictEqual(test1.prefix, '');
		assert.strictEqual(test1.parts[0].text, 'param isZoneRedundant ');
		assert.strictEqual(test1.parts[0].operator, 'bool');
		assert.strictEqual(test1.parts[0].operatorType, 'types');
		assert.strictEqual(test1.parts[1].operator, '=');
		assert.strictEqual(test1.parts[1].operatorType, 'assignment');
	});

	const case2 = 'var certificateIssuer = \'Subscription-Issuer\'';
	const test2 = LineData.fromString(case2);
	test('Test Variables', () => {
		assert.strictEqual(test2.prefix, '');
		assert.strictEqual(test2.parts[0].text, 'var certificateIssuer ');
		assert.strictEqual(test2.parts[0].operator, '=');
		assert.strictEqual(test2.parts[0].operatorType, 'assignment');
	});

	const case3 = "resource userAssignedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2018-11-30' = { name: '\${prefix}-id', location: location }";
	const test3 = LineData.fromString(case3);
	test('Test Resources', () => {
		assert.strictEqual(test3.prefix, 'resource userAssignedIdentity \'Microsoft.', 'Resource prefix not equal');
		assert.strictEqual(test3.parts[0].text, 'resource userAssignedIdentity \'Microsoft.ManagedIdentity/userAssignedIdentities@2018-11-30\' ', 'Resource text not equal');
		assert.strictEqual(test3.parts[0].operator, '=');
		assert.strictEqual(test3.parts[0].operatorType, 'assignment');
	});

	const case4 = 'output appName string = appName';
	const test4 = LineData.fromString(case4);
	test('Test Output', () => {
		assert.strictEqual(test4.prefix, '');
		assert.strictEqual(test4.parts[0].text, 'output appName ');
		assert.strictEqual(test4.parts[0].operator, 'string');
		assert.strictEqual(test4.parts[0].operatorType, 'types');
		assert.strictEqual(test4.parts[1].operator, '=');
		assert.strictEqual(test4.parts[1].operatorType, 'assignment');
	});

	const case5 = '<Route path="/" element={<HomePage />} />';
	const test5 = LineData.fromString(case5);
	test('Test JSX Attributes', () => {
		assert.strictEqual(test5.prefix, '', 'JSX prefix should be empty');
		assert.strictEqual(test5.parts.length, 5, 'JSX should be split into five parts');
		assert.strictEqual(test5.parts[0].text, '<Route ');
		assert.strictEqual(test5.parts[0].operator, '&');
		assert.strictEqual(test5.parts[0].operatorType, 'jsx');
		assert.strictEqual(test5.parts[1].text, 'path="/" ');
		assert.strictEqual(test5.parts[1].operator, '&');
		assert.strictEqual(test5.parts[1].operatorType, 'jsx');
		assert.strictEqual(test5.parts[2].text, 'element={<HomePage ');
		assert.strictEqual(test5.parts[2].operator, '&');
		assert.strictEqual(test5.parts[2].operatorType, 'jsx');
		assert.strictEqual(test5.parts[3].text, '/>} ');
		assert.strictEqual(test5.parts[3].operator, '&');
		assert.strictEqual(test5.parts[3].operatorType, 'jsx');
		assert.strictEqual(test5.parts[4].operator, '/>');
		assert.strictEqual(test5.parts[4].operatorType, 'jsx');
	});
});
