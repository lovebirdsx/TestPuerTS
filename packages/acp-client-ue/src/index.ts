// PuerTS polyfill（setTimeout/setInterval 需要显式 delay 参数）
const _origSetTimeout = globalThis.setTimeout;
const _origSetInterval = globalThis.setInterval;

(globalThis as any).setTimeout = function (handler: (...args: any[]) => void, timeout?: number, ...args: any[]) {
	return _origSetTimeout(handler, timeout ?? 0, ...args);
};

(globalThis as any).setInterval = function (handler: (...args: any[]) => void, timeout?: number, ...args: any[]) {
	return _origSetInterval(handler, timeout ?? 0, ...args);
};

import * as UE from 'ue';
import { parseCliOptions } from './cli';
import { ACPClient } from './client';
import { Renderer } from './renderer';
import { Repl } from './repl';
import { fmt, createSpinner } from './format';

async function main(): Promise<void> {
	const { options, prompt } = parseCliOptions();

	const renderer = new Renderer({
		protocol: options.protocol,
		verbose: options.verbose,
	});

	const client = new ACPClient(renderer, options);

	// 连接服务端
	const spinner = createSpinner('Connecting to ACP server...');
	try {
		await client.connect();
		const initResult = await client.initialize();
		spinner.stop(
			fmt.green(`Connected to ${initResult.agentInfo?.name ?? 'agent'} ${initResult.agentInfo?.version ?? ''}`),
		);
	} catch (err) {
		spinner.stop();
		UE.ProcessIOHelper.WriteStderr(
			fmt.error(`Failed to connect: ${err instanceof Error ? err.message : String(err)}\n`),
		);
		UE.JsRunHelper.MarkDone(1);
		return;
	}

	// 创建或加载会话
	try {
		if (options.session) {
			await client.loadSession(options.session);
			UE.ProcessIOHelper.WriteStderr(fmt.dim(`Session loaded: ${client.sessionId}\n`));
		} else {
			await client.newSession();
			UE.ProcessIOHelper.WriteStderr(fmt.dim(`Session created: ${client.sessionId}\n`));
		}
	} catch (err) {
		UE.ProcessIOHelper.WriteStderr(
			fmt.error(`Failed to create session: ${err instanceof Error ? err.message : String(err)}\n`),
		);
		await client.disconnect();
		UE.JsRunHelper.MarkDone(1);
		return;
	}

	// 若指定了初始模式则进行设置
	if (options.mode) {
		try {
			await client.setMode(options.mode);
		} catch (err) {
			UE.ProcessIOHelper.WriteStderr(
				fmt.error(`Failed to set mode: ${err instanceof Error ? err.message : String(err)}\n`),
			);
		}
	}

	// 单次执行模式或 REPL 模式
	if (prompt) {
		try {
			const result = await client.prompt(prompt);
			renderer.ensureNewline();
			UE.ProcessIOHelper.WriteStderr(fmt.dim(`[Stop reason: ${result.stopReason}]\n`));
		} catch (err) {
			renderer.ensureNewline();
			UE.ProcessIOHelper.WriteStderr(fmt.error(`Error: ${err instanceof Error ? err.message : String(err)}\n`));
		}
		await client.disconnect();
		UE.JsRunHelper.MarkDone(0);
	} else {
		const repl = new Repl(client, renderer);
		await repl.start();
		await client.disconnect();
		UE.JsRunHelper.MarkDone(0);
	}
}

main().catch((err) => {
	UE.ProcessIOHelper.WriteStderr(fmt.error(`Fatal: ${err instanceof Error ? err.message : String(err)}\n`));
	UE.JsRunHelper.MarkDone(1);
});
