// 解析从 gulp 透传过来的 CLI 参数（通过 UE.JsRunHelper.GetCommandArgs() 拿到的整字符串）。
//
// 支持：
//   --filter <suite-prefix>   或   --filter=<suite-prefix>
//   -t <regex>                或   --test-name-pattern <regex>   或   --test-name-pattern=<regex>
//
// 例子：
//   --filter ueBindings -t "loader|polyfill"

export interface ParsedTestArgs {
	filter?: string;
	testNamePattern?: RegExp;
}

export function parseTestArgs(raw: string): ParsedTestArgs {
	const tokens = parseArgString(raw);

	let filter: string | undefined;
	let pattern: string | undefined;

	for (let i = 0; i < tokens.length; i++) {
		const arg = tokens[i]!;

		if (arg === '--filter' && tokens[i + 1] !== undefined) {
			filter = tokens[++i];
		} else if (arg.startsWith('--filter=')) {
			filter = arg.slice('--filter='.length);
		} else if ((arg === '-t' || arg === '--test-name-pattern') && tokens[i + 1] !== undefined) {
			pattern = tokens[++i];
		} else if (arg.startsWith('--test-name-pattern=')) {
			pattern = arg.slice('--test-name-pattern='.length);
		}
	}

	let testNamePattern: RegExp | undefined;
	if (pattern !== undefined && pattern !== '') {
		try {
			testNamePattern = new RegExp(pattern);
		} catch (err) {
			throw new Error(`Invalid -t / --test-name-pattern regex: ${pattern} (${(err as Error).message})`);
		}
	}

	return { filter: filter || undefined, testNamePattern };
}

// 简单的引号感知拆分（对齐 acp-client-ue/src/cli.ts 的实现）
function parseArgString(input: string): string[] {
	const result: string[] = [];
	let current = '';
	let inQuote: string | null = null;

	for (let i = 0; i < input.length; i++) {
		const ch = input[i]!;

		if (inQuote) {
			if (ch === inQuote) {
				inQuote = null;
			} else {
				current += ch;
			}
		} else if (ch === '"' || ch === "'") {
			inQuote = ch;
		} else if (ch === ' ' || ch === '\t') {
			if (current) {
				result.push(current);
				current = '';
			}
		} else {
			current += ch;
		}
	}

	if (current) {
		result.push(current);
	}

	return result;
}
