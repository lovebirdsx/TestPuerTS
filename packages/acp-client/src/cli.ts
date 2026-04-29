import * as UE from 'ue';

export interface CliOptions {
	command: string;
	args: string[];
	workspace: string;
	protocol: boolean;
	verbose: boolean;
	permission: 'interactive' | 'auto-approve' | 'deny-all';
	mode: string | undefined;
	session: string | undefined;
	model: string | undefined;
	apiKey: string | undefined;
	baseUrl: string | undefined;
}

/**
 * 解析命令行参数。
 * 在 PuerTS 环境中，参数通过 PuertsTestHelper.GetTestFilter() 传入，
 * 格式为 "--key=value" 或 "prompt text"。
 */
export function parseCliOptions(): {
	options: CliOptions;
	prompt: string | undefined;
} {
	const rawArgs = UE.PuertsTestHelper.GetTestFilter();
	const projectDir = UE.PuertsTestHelper.GetProjectDir();

	// 解析参数
	const args = parseArgString(rawArgs);

	let command = 'npx universe-agent-acp';
	let extraArgs: string[] = [];
	let workspace = projectDir;
	let protocol = false;
	let verbose = false;
	let permission: CliOptions['permission'] = 'interactive';
	let mode: string | undefined;
	let session: string | undefined;
	let model: string | undefined;
	let apiKey: string | undefined;
	let baseUrl: string | undefined;
	const promptParts: string[] = [];

	for (let i = 0; i < args.length; i++) {
		const arg = args[i]!;

		if (arg.startsWith('--command=')) {
			command = arg.slice('--command='.length);
		} else if (arg === '--command' && args[i + 1]) {
			command = args[++i]!;
		} else if (arg.startsWith('--args=')) {
			extraArgs = arg
				.slice('--args='.length)
				.split(',')
				.map((a) => a.trim())
				.filter(Boolean);
		} else if (arg === '-w' || arg === '--workspace') {
			workspace = args[++i] ?? workspace;
		} else if (arg.startsWith('--workspace=')) {
			workspace = arg.slice('--workspace='.length);
		} else if (arg === '-P' || arg === '--protocol') {
			protocol = true;
		} else if (arg === '-V' || arg === '--verbose') {
			verbose = true;
		} else if (arg.startsWith('--permission=')) {
			permission = arg.slice('--permission='.length) as CliOptions['permission'];
		} else if (arg === '--permission' && args[i + 1]) {
			permission = args[++i]! as CliOptions['permission'];
		} else if (arg.startsWith('--mode=')) {
			mode = arg.slice('--mode='.length);
		} else if (arg === '--mode' && args[i + 1]) {
			mode = args[++i]!;
		} else if (arg.startsWith('--session=')) {
			session = arg.slice('--session='.length);
		} else if (arg === '--session' && args[i + 1]) {
			session = args[++i]!;
		} else if (arg === '-m' || arg === '--model') {
			model = args[++i];
		} else if (arg.startsWith('--model=')) {
			model = arg.slice('--model='.length);
		} else if (arg.startsWith('--api-key=')) {
			apiKey = arg.slice('--api-key='.length);
		} else if (arg === '--api-key' && args[i + 1]) {
			apiKey = args[++i]!;
		} else if (arg.startsWith('--base-url=')) {
			baseUrl = arg.slice('--base-url='.length);
		} else if (arg === '--base-url' && args[i + 1]) {
			baseUrl = args[++i]!;
		} else if (!arg.startsWith('-')) {
			promptParts.push(arg);
		}
	}

	// 透传模型参数给 ACP 服务器
	if (model) extraArgs.push('--model', model);
	if (apiKey) extraArgs.push('--api-key', apiKey);
	if (baseUrl) extraArgs.push('--base-url', baseUrl);

	const prompt = promptParts.length > 0 ? promptParts.join(' ') : undefined;

	return {
		options: {
			command,
			args: extraArgs,
			workspace,
			protocol,
			verbose,
			permission,
			mode,
			session,
			model,
			apiKey,
			baseUrl,
		},
		prompt,
	};
}

/** 简单的参数字符串解析（支持引号） */
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
