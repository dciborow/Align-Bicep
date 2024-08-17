static fromString(line: string) {
	const lineMatch = getLineMatch();

	// Adjust indentation regex to account for JSX syntax
	const indentation = /^\s*(?:(?:\/\/|\*)\s*)?/.exec(line)![0];
	const parts: LinePart[] = [];

	for (
		let match: RegExpExecArray | null = null;
		(match = lineMatch.exec(line));
	) {
		const [part, text, decoratorChar, operator] = match;

		// Special handling for JSX operators and attributes
		if (operator === '<' || operator === '>' || operator === '/>') {
			// Treat JSX tags as separate parts
			const jsxPart = {
				text: part,
				length: part.length,
				width: getPhysicalWidth(part),
				operator: operator,
				operatorWidth: getPhysicalWidth(operator),
				operatorType: 'jsx',
				decorationLocation: text.length,
				decoratorChar: decoratorChar,
			};
			parts.push(jsxPart);
			continue;
		}

		// Existing logic for other operators
		const width = getPhysicalWidth(part);
		const operatorWidth = getPhysicalWidth(operator);
		const decorationLocation = text.length;
		const operatorType = operatorsGroup[operator];
		const length = part.length;

		parts.push({
			text,
			length,
			width,
			operator,
			operatorWidth,
			operatorType,
			decorationLocation,
			decoratorChar,
		});
	}

	let prefix = '';

	if (parts.length > 0 && parts[0].operatorType === 'assignment') {
		const prefixMatch = /^\s*(.*(?:\.|->))\w+/.exec(parts[0].text);
		if (prefixMatch) {
			prefix = prefixMatch[1];
		}
	}

	return new LineData(indentation, prefix, parts);
}
