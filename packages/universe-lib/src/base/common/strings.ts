import { CharCode } from './charCode';

export function compareSubstring(
	a: string,
	b: string,
	aStart: number = 0,
	aEnd: number = a.length,
	bStart: number = 0,
	bEnd: number = b.length,
): number {
	for (; aStart < aEnd && bStart < bEnd; aStart++, bStart++) {
		const codeA = a.charCodeAt(aStart);
		const codeB = b.charCodeAt(bStart);
		if (codeA < codeB) {
			return -1;
		} else if (codeA > codeB) {
			return 1;
		}
	}
	const aLen = aEnd - aStart;
	const bLen = bEnd - bStart;
	if (aLen < bLen) {
		return -1;
	} else if (aLen > bLen) {
		return 1;
	}
	return 0;
}

export function compareIgnoreCase(a: string, b: string): number {
	return compareSubstringIgnoreCase(a, b, 0, a.length, 0, b.length);
}

export function compareSubstringIgnoreCase(
	a: string,
	b: string,
	aStart: number = 0,
	aEnd: number = a.length,
	bStart: number = 0,
	bEnd: number = b.length,
): number {
	for (; aStart < aEnd && bStart < bEnd; aStart++, bStart++) {
		let codeA = a.charCodeAt(aStart);
		let codeB = b.charCodeAt(bStart);

		if (codeA === codeB) {
			// equal
			continue;
		}

		if (codeA >= 128 || codeB >= 128) {
			// not ASCII letters -> fallback to lower-casing strings
			return compareSubstring(a.toLowerCase(), b.toLowerCase(), aStart, aEnd, bStart, bEnd);
		}

		// mapper lower-case ascii letter onto upper-case varinats
		// [97-122] (lower ascii) --> [65-90] (upper ascii)
		if (isLowerAsciiLetter(codeA)) {
			codeA -= 32;
		}
		if (isLowerAsciiLetter(codeB)) {
			codeB -= 32;
		}

		// compare both code points
		const diff = codeA - codeB;
		if (diff === 0) {
			continue;
		}

		return diff;
	}

	const aLen = aEnd - aStart;
	const bLen = bEnd - bStart;

	if (aLen < bLen) {
		return -1;
	} else if (aLen > bLen) {
		return 1;
	}

	return 0;
}

export function isAsciiDigit(code: number): boolean {
	return code >= CharCode.Digit0 && code <= CharCode.Digit9;
}

export function isLowerAsciiLetter(code: number): boolean {
	return code >= CharCode.a && code <= CharCode.z;
}

export function isUpperAsciiLetter(code: number): boolean {
	return code >= CharCode.A && code <= CharCode.Z;
}

export function equalsIgnoreCase(a: string, b: string): boolean {
	return a.length === b.length && compareSubstringIgnoreCase(a, b) === 0;
}

export function startsWithIgnoreCase(str: string, candidate: string): boolean {
	const candidateLength = candidate.length;
	if (candidate.length > str.length) {
		return false;
	}

	return compareSubstringIgnoreCase(str, candidate, 0, candidateLength) === 0;
}

/**
 * @returns the length of the common prefix of the two strings.
 */
export function commonPrefixLength(a: string, b: string): number {
	const len = Math.min(a.length, b.length);
	let i: number;

	for (i = 0; i < len; i++) {
		if (a.charCodeAt(i) !== b.charCodeAt(i)) {
			return i;
		}
	}

	return len;
}

/**
 * @returns the length of the common suffix of the two strings.
 */
export function commonSuffixLength(a: string, b: string): number {
	const len = Math.min(a.length, b.length);
	let i: number;

	const aLastIndex = a.length - 1;
	const bLastIndex = b.length - 1;

	for (i = 0; i < len; i++) {
		if (a.charCodeAt(aLastIndex - i) !== b.charCodeAt(bLastIndex - i)) {
			return i;
		}
	}

	return len;
}

/**
 * Removes all occurrences of needle from the beginning and end of haystack.
 * @param haystack string to trim
 * @param needle the thing to trim (default is a blank)
 */
export function trim(haystack: string, needle: string = ' '): string {
	const trimmed = ltrim(haystack, needle);
	return rtrim(trimmed, needle);
}

/**
 * Removes all occurrences of needle from the beginning of haystack.
 * @param haystack string to trim
 * @param needle the thing to trim
 */
export function ltrim(haystack: string, needle: string): string {
	if (!haystack || !needle) {
		return haystack;
	}

	const needleLen = needle.length;
	if (needleLen === 0 || haystack.length === 0) {
		return haystack;
	}

	let offset = 0;

	while (haystack.indexOf(needle, offset) === offset) {
		offset = offset + needleLen;
	}
	return haystack.substring(offset);
}

/**
 * Removes all occurrences of needle from the end of haystack.
 * @param haystack string to trim
 * @param needle the thing to trim
 */
export function rtrim(haystack: string, needle: string): string {
	if (!haystack || !needle) {
		return haystack;
	}

	const needleLen = needle.length,
		haystackLen = haystack.length;

	if (needleLen === 0 || haystackLen === 0) {
		return haystack;
	}

	let offset = haystackLen,
		idx = -1;

	while (true) {
		idx = haystack.lastIndexOf(needle, offset - 1);
		if (idx === -1 || idx + needleLen !== offset) {
			break;
		}
		if (idx === 0) {
			return '';
		}
		offset = idx;
	}

	return haystack.substring(0, offset);
}

/**
 * See http://en.wikipedia.org/wiki/Surrogate_pair
 */
export function isHighSurrogate(charCode: number): boolean {
	return 0xd800 <= charCode && charCode <= 0xdbff;
}

/**
 * See http://en.wikipedia.org/wiki/Surrogate_pair
 */
export function isLowSurrogate(charCode: number): boolean {
	return 0xdc00 <= charCode && charCode <= 0xdfff;
}

/**
 * See http://en.wikipedia.org/wiki/Surrogate_pair
 */
export function computeCodePoint(highSurrogate: number, lowSurrogate: number): number {
	return ((highSurrogate - 0xd800) << 10) + (lowSurrogate - 0xdc00) + 0x10000;
}

export function compare(a: string, b: string): number {
	if (a < b) {
		return -1;
	} else if (a > b) {
		return 1;
	} else {
		return 0;
	}
}

const regexCache = new Map<string, RegExp>();
export function matchesGlob(str: string, glob: string): boolean {
	let regex = regexCache.get(glob);
	if (!regex) {
		const regexPattern = globToRegex(glob);
		regex = new RegExp(regexPattern);
		regexCache.set(glob, regex);
	}
	return regex.test(str);
}

function globToRegex(glob: string): string {
	let regex = '^';
	let i = 0;

	while (i < glob.length) {
		const c = glob[i];

		if (c === '\\') {
			// 处理转义字符
			i++;
			if (i < glob.length) {
				const nextChar = glob[i];
				regex += '\\' + nextChar;
			} else {
				// 反斜杠在末尾，视为字面反斜杠
				regex += '\\\\';
			}
		} else if (c === '*') {
			if (glob[i + 1] === '*') {
				// 处理双星 **
				regex += '.*';
				i++;
			} else {
				// 单星 *
				regex += '[^/]*';
			}
		} else if (c === '?') {
			regex += '[^/]';
		} else if (c === '[') {
			let j = i + 1;
			let charClass = '';

			// 处理字符类的否定
			if (j < glob.length && (glob[j] === '!' || glob[j] === '^')) {
				charClass += '^';
				j++;
			}

			// 构建字符类
			while (j < glob.length && glob[j] !== ']') {
				let cc = glob[j];

				if (cc === '\\' && j + 1 < glob.length) {
					// 处理转义字符
					j++;
					cc = glob[j];
					charClass += '\\' + cc;
				} else {
					if ('\\^$.|?*+(){}'.includes(cc)) {
						charClass += '\\' + cc;
					} else {
						charClass += cc;
					}
				}
				j++;
			}

			if (j >= glob.length || glob[j] !== ']') {
				// 未匹配的 '['，视为字面字符
				regex += '\\[';
				i = j - 1;
			} else {
				regex += '[' + charClass + ']';
				i = j;
			}
		} else if (c === '{') {
			// 处理花括号扩展
			let j = i + 1;
			let group = '';

			while (j < glob.length && glob[j] !== '}') {
				const currentChar = glob[j];
				if (currentChar === '\\' && j + 1 < glob.length) {
					// 处理转义字符
					j++;
					group += '\\' + glob[j];
				} else {
					group += currentChar;
				}
				j++;
			}

			if (j >= glob.length || glob[j] !== '}') {
				// 未匹配的 '{'，视为字面字符
				regex += '\\{';
				i = j - 1;
			} else {
				const options = group.split(',').map((option) => {
					// 递归转换每个选项，支持嵌套花括号
					return globToRegex(option).slice(1, -1); // 去除 ^ 和 $
				});
				regex += '(' + options.join('|') + ')';
				i = j;
			}
		} else {
			if ('\\^$.|+(){}'.includes(c)) {
				regex += '\\' + c;
			} else {
				regex += c;
			}
		}
		i++;
	}

	regex += '$';
	return regex;
}

/**
 * Checks if the characters of the provided query string are included in the
 * target string. The characters do not have to be contiguous within the string.
 */
export function fuzzyContains(target: string, query: string): boolean {
	if (!target) {
		return false;
	}

	if (!query) {
		return true;
	}

	if (target.length < query.length) {
		return false; // impossible for query to be contained in target
	}

	const queryLen = query.length;
	const targetLower = target.toLowerCase();

	let index = 0;
	let lastIndexOf = -1;
	while (index < queryLen) {
		const indexOf = targetLower.indexOf(query[index], lastIndexOf + 1);
		if (indexOf < 0) {
			return false;
		}

		lastIndexOf = indexOf;

		index++;
	}

	return true;
}
