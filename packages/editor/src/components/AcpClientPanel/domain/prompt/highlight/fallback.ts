import type { CodeLine, CodeToken, HighlightResult } from './types';

interface LangRules {
	keywords?: Set<string>;
	builtins?: Set<string>;
	lineComment?: string;
	blockComment?: [string, string];
	strings: string[];
	hasNumber: boolean;
}

const TS_KEYWORDS = new Set(
	(
		'const let var function class extends implements interface type enum namespace ' +
		'export import from as return if else for while do switch case default break continue ' +
		'try catch finally throw new this super typeof instanceof in of void delete await async yield ' +
		'true false null undefined public private protected static readonly abstract declare is keyof infer satisfies'
	).split(' '),
);

const TS_BUILTINS = new Set(
	'console Math Object Array String Number Boolean Promise Date Error JSON RegExp Map Set WeakMap WeakSet Symbol globalThis'.split(
		' ',
	),
);

const PY_KEYWORDS = new Set(
	(
		'False None True and as assert async await break class continue def del elif else except ' +
		'finally for from global if import in is lambda nonlocal not or pass raise return try while with yield'
	).split(' '),
);

const CPP_KEYWORDS = new Set(
	(
		'alignas alignof asm auto bool break case catch char class const constexpr const_cast continue ' +
		'decltype default delete do double dynamic_cast else enum explicit export extern false float for ' +
		'friend goto if inline int long mutable namespace new noexcept nullptr operator private protected ' +
		'public register reinterpret_cast return short signed sizeof static static_assert static_cast struct ' +
		'switch template this thread_local throw true try typedef typeid typename union unsigned using ' +
		'virtual void volatile wchar_t while uint8 uint16 uint32 uint64 int8 int16 int32 int64 FString TArray TMap'
	).split(' '),
);

const BASH_KEYWORDS = new Set(
	'if then else elif fi case esac for while until do done function return in select break continue local readonly declare typeset export unset'.split(
		' ',
	),
);

const BASH_BUILTINS = new Set(
	'cd ls pwd rm mv cp mkdir rmdir cat grep awk sed sort uniq wc head tail find curl wget ssh git npm node yarn npx echo printf source exit set'.split(
		' ',
	),
);

const RULES: Record<string, LangRules> = {
	typescript: {
		keywords: TS_KEYWORDS,
		builtins: TS_BUILTINS,
		lineComment: '//',
		blockComment: ['/*', '*/'],
		strings: ['"', "'", '`'],
		hasNumber: true,
	},
	javascript: {
		keywords: TS_KEYWORDS,
		builtins: TS_BUILTINS,
		lineComment: '//',
		blockComment: ['/*', '*/'],
		strings: ['"', "'", '`'],
		hasNumber: true,
	},
	json: {
		keywords: new Set(['true', 'false', 'null']),
		strings: ['"'],
		hasNumber: true,
	},
	python: {
		keywords: PY_KEYWORDS,
		lineComment: '#',
		strings: ['"', "'"],
		hasNumber: true,
	},
	cpp: {
		keywords: CPP_KEYWORDS,
		lineComment: '//',
		blockComment: ['/*', '*/'],
		strings: ['"', "'"],
		hasNumber: true,
	},
	bash: {
		keywords: BASH_KEYWORDS,
		builtins: BASH_BUILTINS,
		lineComment: '#',
		strings: ['"', "'"],
		hasNumber: true,
	},
	ini: {
		lineComment: ';',
		strings: ['"', "'"],
		hasNumber: true,
	},
	markdown: {
		strings: [],
		hasNumber: false,
	},
};

const NUMBER_RE = /^-?(?:0x[\da-f]+|0b[01]+|0o[0-7]+|\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/i;

function isIdStart(ch: string): boolean {
	return /[A-Za-z_$]/.test(ch);
}

function isIdCont(ch: string): boolean {
	return /[A-Za-z0-9_$]/.test(ch);
}

function pushToken(tokens: CodeToken[], text: string, className?: string): void {
	if (text.length === 0) {
		return;
	}
	const last = tokens[tokens.length - 1];
	if (last && last.className === className) {
		last.text += text;
		return;
	}
	tokens.push({ text, ...(className ? { className } : {}) });
}

function tokenizeLine(line: string, rules: LangRules, state: { inBlockComment: boolean }): CodeLine {
	const tokens: CodeToken[] = [];
	let i = 0;
	const n = line.length;

	while (i < n) {
		// 跨行块注释续
		if (state.inBlockComment && rules.blockComment) {
			const end = line.indexOf(rules.blockComment[1], i);
			if (end < 0) {
				pushToken(tokens, line.slice(i), 'hljs-comment');
				return tokens;
			}
			const stop = end + rules.blockComment[1].length;
			pushToken(tokens, line.slice(i, stop), 'hljs-comment');
			state.inBlockComment = false;
			i = stop;
			continue;
		}

		// 行注释
		if (rules.lineComment && line.startsWith(rules.lineComment, i)) {
			pushToken(tokens, line.slice(i), 'hljs-comment');
			return tokens;
		}

		// 块注释起始
		if (rules.blockComment && line.startsWith(rules.blockComment[0], i)) {
			const start = i;
			const after = i + rules.blockComment[0].length;
			const end = line.indexOf(rules.blockComment[1], after);
			if (end < 0) {
				pushToken(tokens, line.slice(start), 'hljs-comment');
				state.inBlockComment = true;
				return tokens;
			}
			const stop = end + rules.blockComment[1].length;
			pushToken(tokens, line.slice(start, stop), 'hljs-comment');
			i = stop;
			continue;
		}

		// 字符串
		const quote = rules.strings.find((q) => line.startsWith(q, i));
		if (quote) {
			let j = i + quote.length;
			while (j < n) {
				if (line[j] === '\\' && j + 1 < n) {
					j += 2;
					continue;
				}
				if (line.startsWith(quote, j)) {
					j += quote.length;
					break;
				}
				j += 1;
			}
			const end = Math.min(j, n);
			pushToken(tokens, line.slice(i, end), 'hljs-string');
			i = end;
			continue;
		}

		// 数字
		if (rules.hasNumber) {
			const rest = line.slice(i);
			const m = NUMBER_RE.exec(rest);
			if (m && m.index === 0) {
				pushToken(tokens, m[0], 'hljs-number');
				i += m[0].length;
				continue;
			}
		}

		// 标识符
		if (isIdStart(line[i]!)) {
			let end = i + 1;
			while (end < n && isIdCont(line[end]!)) {
				end += 1;
			}
			const ident = line.slice(i, end);
			let cls: string | undefined;
			if (rules.keywords?.has(ident)) {
				cls = 'hljs-keyword';
			} else if (rules.builtins?.has(ident)) {
				cls = 'hljs-built_in';
			}
			pushToken(tokens, ident, cls);
			i = end;
			continue;
		}

		pushToken(tokens, line[i]!);
		i += 1;
	}

	return tokens;
}

function tokenizeDiff(code: string): CodeLine[] {
	const lines = code.split('\n');
	return lines.map<CodeLine>((line) => {
		if (line.startsWith('+++') || line.startsWith('---') || line.startsWith('@@')) {
			return [{ text: line, className: 'hljs-meta' }];
		}
		if (line.startsWith('+')) {
			return [{ text: line, className: 'hljs-addition' }];
		}
		if (line.startsWith('-')) {
			return [{ text: line, className: 'hljs-deletion' }];
		}
		return [{ text: line }];
	});
}

/**
 * 兜底 highlighter：lowlight 加载失败或抛错时使用。
 * 输入语言名未知时退化到 plain text，保证调用方永远拿得到合法 HighlightResult。
 */
export function fallbackHighlight(language: string | undefined | null, code: string): HighlightResult {
	if (language === 'diff') {
		return { language, lines: tokenizeDiff(code), fallback: true };
	}

	const rules = language ? RULES[language] : undefined;
	const lines = code.split('\n');

	if (!rules) {
		return {
			language: language ?? null,
			lines: lines.map<CodeLine>((line) => (line.length > 0 ? [{ text: line }] : [])),
			fallback: true,
		};
	}

	const state = { inBlockComment: false };
	const out: CodeLine[] = [];
	for (const line of lines) {
		out.push(tokenizeLine(line, rules, state));
	}
	return { language, lines: out, fallback: true };
}
