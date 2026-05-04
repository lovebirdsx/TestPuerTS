import * as UE from 'ue';

/**
 * 统一日志接口。所有 PuerTS-runtime 包应通过 createLogger(category) 获取实例，
 * 而不是直接使用 console.*，以避免 PuerTS log.js 中"console_org 旁路 + UE_LOG"
 * 双写同一 stdout fd 引发的字节级交错。
 */
export interface Logger {
	log(...args: unknown[]): void;
	info(...args: unknown[]): void;
	warn(...args: unknown[]): void;
	error(...args: unknown[]): void;
}

function formatArg(value: unknown): string {
	if (value instanceof Error) {
		return value.stack ?? `${value.name}: ${value.message}`;
	}
	if (typeof value === 'string') {
		return value;
	}
	if (typeof value === 'object' && value !== null) {
		try {
			return JSON.stringify(value);
		} catch {
			return String(value);
		}
	}
	return String(value);
}

function format(args: unknown[]): string {
	return args.map(formatArg).join(' ');
}

export function createLogger(category: string): Logger {
	return {
		log(...args: unknown[]) {
			UE.JsLogHelper.Log(category, format(args));
		},
		info(...args: unknown[]) {
			UE.JsLogHelper.Info(category, format(args));
		},
		warn(...args: unknown[]) {
			UE.JsLogHelper.Warn(category, format(args));
		},
		error(...args: unknown[]) {
			UE.JsLogHelper.Error(category, format(args));
		},
	};
}

/**
 * 用 createLogger 替换 globalThis.console，让第三方库（universe-lib / ACP SDK /
 * MCP SDK 等）的 console.* 调用也走 UJsLogHelper → UE_LOG（受 GLog 锁保护）。
 *
 * 调用时机：每个 PuerTS 入口（puertsPolyfill / editor main）尽早调用一次。
 */
export function installConsoleOverride(rootCategory = 'console'): void {
	const logger = createLogger(rootCategory);
	const g = globalThis as unknown as { console?: Record<string, unknown> };
	const original = g.console ?? {};
	g.console = {
		...original,
		log: logger.log,
		info: logger.info,
		warn: logger.warn,
		error: logger.error,
		debug: logger.log,
		trace: logger.log,
	};
}
