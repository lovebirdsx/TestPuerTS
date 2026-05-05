// 把 gulp 命令行上的若干"已知 flag"原样抽出，准备拼到 UE commandlet 末尾透传给 PuerTS。
//
// 为什么不用 POSIX `--` 分隔符？
//   gulp 5 (yargs) 默认不开 `populate--`，`--` 后的所有 token 会进 `argv._` 被当成 task name，
//   直接报 `Task never defined`。所以这里改用命名 flag 白名单。

/**
 * 把 token 包装成可以安全拼到一行 shell 命令里的形式。
 * 含空格 / 引号 / 反斜杠的 token 会被双引号包裹，内部 `"` 转义为 `\"`。
 */
export function quoteForCmd(token: string): string {
	if (token === '') return '""';
	if (/^[A-Za-z0-9_\-./=:@]+$/.test(token)) return token;
	const escaped = token.replace(/(["\\])/g, '\\$1');
	return `"${escaped}"`;
}

/** flag 类型：boolean 不取值；value 取下一个 token；string 同 value。 */
type FlagType = 'value';

interface FlagSpec {
	/** 接受的 flag 名（如 ['--filter']、['-t', '--test-name-pattern']） */
	names: string[];
	type: FlagType;
}

/**
 * 在 process.argv 里按 spec 抽取 flag，返回原样 token 数组（保留 flag 名 + 值）。
 * 既支持 `--name value` 也支持 `--name=value`；后者会被规范化成两个 token。
 *
 * 例：spec 含 `--filter`、`-t`，argv 含 `--filter` `ueBindings` `-t=async`
 *     返回 ['--filter', 'ueBindings', '-t', 'async']
 */
export function extractFlagTokens(specs: FlagSpec[]): string[] {
	const argv = process.argv;
	const out: string[] = [];

	const valueFlagNames = new Set<string>();
	for (const s of specs) {
		if (s.type === 'value') for (const n of s.names) valueFlagNames.add(n);
	}

	for (let i = 2; i < argv.length; i++) {
		const arg = argv[i]!;

		// `--name=value` 形式
		const eq = arg.indexOf('=');
		if (eq > 0 && arg.startsWith('-')) {
			const name = arg.slice(0, eq);
			if (valueFlagNames.has(name)) {
				out.push(name, arg.slice(eq + 1));
				continue;
			}
		}

		// `--name value` 形式
		if (valueFlagNames.has(arg) && i + 1 < argv.length) {
			out.push(arg, argv[++i]!);
			continue;
		}
	}

	return out;
}

/** 测试任务关心的 flag：`--filter <suite-prefix>` 与 `-t/--test-name-pattern <regex>`。 */
export function getTestPassthroughTokens(): string[] {
	return extractFlagTokens([
		{ names: ['--filter'], type: 'value' },
		{ names: ['-t', '--test-name-pattern'], type: 'value' },
	]);
}

/**
 * ACP 任务接受单个 `--acp-args=<整段字符串>`，按 shell 风格拆分，
 * 透传给 acp-client 自己的 cli.ts 解析。
 *
 * 例：`--acp-args="--mode auto-approve --session abc"`
 *     → ['--mode', 'auto-approve', '--session', 'abc']
 */
export function getAcpPassthroughTokens(): string[] {
	const tokens = extractFlagTokens([{ names: ['--acp-args'], type: 'value' }]);
	const out: string[] = [];
	for (let i = 0; i < tokens.length; i += 2) {
		// tokens[i] === '--acp-args'，tokens[i+1] 是整段字符串
		const raw = tokens[i + 1];
		if (raw) out.push(...splitShellArgs(raw));
	}
	return out;
}

/** 引号感知的简单 shell 风格拆分。 */
function splitShellArgs(input: string): string[] {
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

	if (current) result.push(current);
	return result;
}
