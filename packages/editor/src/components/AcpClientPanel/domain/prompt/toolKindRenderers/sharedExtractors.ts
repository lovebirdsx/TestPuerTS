/**
 * 共享的 rawInput 字段抽取，避免 4 个 renderer 各自重写 string-narrowing 逻辑。
 *
 * 注：ACP 协议本身的 `tool_call_update` 不强制 input shape，不同 agent 习惯不一样
 * （path / file_path / absolute_path / command 都见过），尽量兼容。
 */

export interface ExtractedPath {
	path: string;
	line?: number;
}

function isObj(v: unknown): v is Record<string, unknown> {
	return typeof v === 'object' && v !== null;
}

function asString(v: unknown): string | undefined {
	return typeof v === 'string' && v.length > 0 ? v : undefined;
}

function asNumber(v: unknown): number | undefined {
	return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
}

const PATH_KEYS = ['path', 'file_path', 'filePath', 'absolute_path', 'absolutePath', 'filename'] as const;

export function extractPrimaryPath(input: unknown): ExtractedPath | undefined {
	if (!isObj(input)) return undefined;
	for (const k of PATH_KEYS) {
		const p = asString(input[k]);
		if (p) {
			const line = asNumber(input.line) ?? asNumber(input.lineNumber) ?? asNumber(input.line_number);
			return line ? { path: p, line } : { path: p };
		}
	}
	return undefined;
}

export function extractCommand(input: unknown): string | undefined {
	if (!isObj(input)) return undefined;
	return asString(input.command) ?? asString(input.cmd) ?? asString(input.script);
}

export function extractDescription(input: unknown): string | undefined {
	if (!isObj(input)) return undefined;
	return asString(input.description) ?? asString(input.message) ?? asString(input.title);
}

export function extractPattern(input: unknown): string | undefined {
	if (!isObj(input)) return undefined;
	return asString(input.pattern) ?? asString(input.query) ?? asString(input.regex);
}

export function extractUrl(input: unknown): string | undefined {
	if (!isObj(input)) return undefined;
	return asString(input.url) ?? asString(input.uri);
}

/** rawOutput 拼出来的 terminal 字段：常见 keys exitCode / stdout / stderr。 */
export interface TerminalOutput {
	stdout?: string;
	stderr?: string;
	exitCode?: number;
}

export function extractTerminalOutput(output: unknown): TerminalOutput | undefined {
	if (!isObj(output)) return undefined;
	const stdout = asString(output.stdout) ?? asString(output.output);
	const stderr = asString(output.stderr) ?? asString(output.error);
	const exitCode =
		asNumber(output.exitCode) ?? asNumber(output.exit_code) ?? asNumber(output.code) ?? asNumber(output.status);
	if (stdout === undefined && stderr === undefined && exitCode === undefined) return undefined;
	return { stdout, stderr, exitCode };
}
