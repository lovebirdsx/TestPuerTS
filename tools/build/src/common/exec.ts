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

		subProcess.on('close', (code) => {
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
