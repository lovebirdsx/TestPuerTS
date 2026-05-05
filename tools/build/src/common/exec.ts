import { spawn } from 'child_process';
import { info } from 'gulplog';
import { blue, green, isRed, red } from './util';

interface IExecOptions {
	logPrefix?: string;

	originalLog?: boolean;

	workingDir?: string;

	/** 获得文本颜色 */
	formatText?: (data: string, isError: boolean) => string;

	noThrow?: boolean;

	/** 透传所有输出，跳过 verbose 过滤（适合 watch/长驻模式） */
	passthrough?: boolean;

	/** 将 stdin 设为 inherit，支持 Ctrl+C 等交互操作 */
	interactive?: boolean;

	/** 追加或覆盖子进程环境变量（合并到 process.env） */
	env?: NodeJS.ProcessEnv;
}

let execVerbose = false;
export function setExecVerbose(verbose: boolean): void {
	execVerbose = verbose;
}

/**
 * 执行命令
 * @param cmd 命令
 * @param options {@link IExecOptions} 选项
 */
export async function exec(
	cmd: string,
	{ logPrefix, originalLog, workingDir, noThrow, formatText, passthrough, interactive, env }: IExecOptions,
): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		const subProcess = spawn(cmd, {
			shell: true,
			cwd: workingDir,
			stdio: interactive ? ['inherit', 'pipe', 'pipe'] : undefined,
			env: env ? { ...process.env, ...env } : undefined,
		});

		// interactive 模式下，Ctrl+C 已经由控制台广播给整个进程组（包括子进程），
		// 子进程会自行清理退出。这里安装一个空 SIGINT handler 覆盖 Node 的默认行为，
		// 防止 gulp 父进程先于子进程退出，导致子进程的清理日志被截断或子进程变成孤儿。
		let sigintHandler: (() => void) | undefined;
		if (interactive) {
			sigintHandler = () => {
				// 故意空实现：等待子进程通过 'close' 事件正常结束
			};
			process.on('SIGINT', sigintHandler);
		}

		subProcess.on('close', (code) => {
			if (sigintHandler) {
				process.off('SIGINT', sigintHandler);
			}
			if (code !== 0 && code !== null && !noThrow) {
				reject(new Error(`Error executing command: ${cmd}`));
			} else {
				resolve();
			}
		});

		const realFormatText = formatText ?? ((data: string, isError: boolean): string => (isError ? red(data) : data));

		const onOutput = (data: string | undefined, isError: boolean): void => {
			if (!data) {
				return;
			}

			const str = data.toString();
			if (str.trim() === '') {
				return;
			}

			const formatedText = realFormatText(str, isError);
			if (!passthrough && !execVerbose && !isRed(formatedText)) {
				return;
			}

			const output = logPrefix ? `${blue(logPrefix)}${formatedText}` : formatedText;
			if (originalLog) {
				process.stdout.write(output);
			} else {
				info(output);
			}
		};

		subProcess.stdout?.on('data', (data) => {
			onOutput(data, false);
		});

		subProcess.stderr?.on('data', (data) => {
			onOutput(data, true);
		});
	});
}

export function formatEsbuildOutput(data: string, _isError: boolean) {
	if (data.includes('errors')) {
		return red(data);
	}

	return data;
}

export function formatWebpackOutput(data: string, _isError: boolean) {
	if (data.includes('errors')) {
		return red(data);
	}

	return data;
}

export function formatTscCheckOutput(data: string, isError: boolean) {
	if (isError) {
		return red(data);
	}

	if (data.includes('error TS')) {
		return red(data);
	}

	return data;
}

export function formatLintOutput(data: string, isError: boolean) {
	if (isError) {
		return red(data);
	}

	if (data.includes('error')) {
		return red(data);
	}

	return data;
}

export function formatVitestOutput(data: string, isError: boolean) {
	if (isError) {
		return red(data);
	}

	if (
		data.includes('FAIL') ||
		data.includes('Error:') ||
		data.includes('AssertionError') ||
		data.includes('ERR_ASSERTION')
	) {
		return red(data);
	}

	return data;
}

export function formatCheckCircularText(text: string, isError: boolean): string {
	const normalText = ['Finding files'];
	const greenText = ['No circular dependency found'];

	if (normalText.some((t) => text.includes(t))) {
		return text;
	}

	if (greenText.some((t) => text.includes(t))) {
		return green(text);
	}

	if (text.startsWith('1) ')) {
		return red(text);
	}

	return isError ? red(text) : text;
}

export function formatCSharpOutput(data: string, isError: boolean) {
	if (isError) {
		return red(data);
	}

	if (data.includes('error')) {
		return red(data);
	}

	return data;
}

// UE 日志等级，Fatal/Error 级别标红
const UE_VERBOSITY_ERROR = new Set(['Fatal', 'Error']);
const UE_VERBOSITY_LEVELS = ['Fatal', 'Error', 'Warning', 'Display', 'Log', 'Verbose', 'VeryVerbose'];

function stripUeLine(line: string): { text: string; isError: boolean } {
	let s = line;

	// 去掉时间戳前缀：[2026.05.05-01.02.54:297][  0]
	if (s.startsWith('[')) {
		const i1 = s.indexOf(']');
		if (i1 > 0) {
			const i2 = s.indexOf(']', i1 + 1);
			if (i2 > 0) s = s.slice(i2 + 1);
		}
	}

	// 去掉 LogCategory: Verbosity: 前缀
	const sep = s.indexOf(': ');
	if (sep > 0) {
		const rest = s.slice(sep + 2);
		for (const level of UE_VERBOSITY_LEVELS) {
			if (rest.startsWith(level + ':')) {
				const msg = rest.slice(level.length + 1);
				const text = msg.startsWith(' ') ? msg.slice(1) : msg;
				return { text: text.trimEnd(), isError: UE_VERBOSITY_ERROR.has(level) };
			}
		}
	}

	return { text: s.trimEnd(), isError: false };
}

export function formatUeOutput(data: string, isError: boolean): string {
	if (isError) return red(data);

	const lines = data.split('\n');
	const formatted = lines.map((line) => {
		const { text, isError: lineIsError } = stripUeLine(line);
		return lineIsError ? red(text) : text;
	});

	return formatted.join('\n');
}
