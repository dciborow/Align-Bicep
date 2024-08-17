import { getPhysicalWidth } from './extension';
import { getLineMatch, operatorGroups } from './operatorGroups';
import LinePart from './LinePart';

export default class LineData {
	constructor(
		public indentation: string,
		public prefix: string,
		public parts: LinePart[]
	) {}

	static fromString(line: string) {
		const lineMatch = getLineMatch();

		// TODO: including comments as "indentation" is hardcoded here. It should be configurable per language
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
				const jsxPart: LinePart = {
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

			// Find the correct operator group (e.g., "assignment", "binary")
			let operatorType: keyof typeof operatorGroups | undefined = undefined;
			for (const group in operatorGroups) {
				if (operatorGroups[group as keyof typeof operatorGroups].includes(operator)) {
					operatorType = group as keyof typeof operatorGroups;
					break;
				}
			}

			if (!operatorType) {
				throw new Error(`Unknown operator type for operator: ${operator}`);
			}

			const linePart: LinePart = {
				text,
				length: part.length, // Correct reference
				width,
				operator,
				operatorWidth,
				operatorType,
				decorationLocation,
				decoratorChar,
			};
			parts.push(linePart);
		}

		let prefix = '';

		if (parts.length > 0 && parts[0].operatorType === 'assignment') {
			const prefixMatch = /^\s*(.*(?:\.|->))\w+/.exec(parts[
