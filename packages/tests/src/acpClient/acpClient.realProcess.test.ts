/**
 * 真实子进程 smoke 测试。
 *
 * 默认 SKIP（commandlet 中无可用 ACP server 命令；起子进程也会拖慢全套测试）。
 *
 * 启用方式：
 *   1. 设置环境变量 UNIVERSE_ACP_E2E=1（PuerTS 通过 process.env 读取）
 *   2. 可选：设置 UNIVERSE_ACP_SERVER_CMD 指向真实 ACP server 命令；缺省只跑 ChildProcessTransport 行回环
 *
 * 注意：Editor 进程的 process.env 通常继承自启动它的 shell；commandlet 同理。
 */
import { describe, it, expect } from '../testRunner';
import { ACPClient, buildSpawnArgs, ChildProcessTransport } from '@universe-agent/acp-client-ue';
import type { CliOptions } from '../../../acp-client-ue/src/cli';
import { TestRenderer } from './__fixtures__/testRenderer';
import { withTimeout } from './__fixtures__/withTimeout';
import * as UE from 'ue';

function envFlag(name: string): string | undefined {
	try {
		// PuerTS 暴露的 process 对象不一定包含 env；安全访问
		const p: any = (globalThis as any).process;
		return p && p.env ? p.env[name] : undefined;
	} catch {
		return undefined;
	}
}

const E2E_ENABLED = envFlag('UNIVERSE_ACP_E2E') === '1';
const ACP_SERVER_CMD = envFlag('UNIVERSE_ACP_SERVER_CMD');

const describeIfEnabled = E2E_ENABLED ? describe : describe.skip;

function defaultOptions(overrides: Partial<CliOptions> = {}): CliOptions {
	return {
		command: 'fake',
		args: [],
		workspace: UE.JsRunHelper.GetProjectDir(),
		protocol: false,
		verbose: false,
		permission: 'auto-approve',
		mode: undefined,
		session: undefined,
		model: undefined,
		apiKey: undefined,
		baseUrl: undefined,
		...overrides,
	};
}

describeIfEnabled('ChildProcessTransport - real subprocess (UNIVERSE_ACP_E2E=1)', () => {
	it('roundtrips a single ndjson line via cmd /c echo', async () => {
		// 用 cmd /c echo 写一行可解析为 JSON 的字符串
		const proc = new UE.ChildProcess();
		const opts = new UE.ChildProcessOptions();
		opts.WorkingDir = UE.JsRunHelper.GetProjectDir();
		opts.bHideWindow = true;
		const ok = proc.Spawn('cmd', '/c echo {"hello":1}', opts);
		expect(ok).toBe(true);

		const transport = new ChildProcessTransport(proc);
		const received: string[] = [];
		transport.onData((bytes) => received.push(new TextDecoder().decode(bytes)));

		// 等待子进程退出
		await new Promise<void>((resolve) => {
			let done = false;
			transport.onClose(() => {
				if (!done) {
					done = true;
					resolve();
				}
			});
			// 安全网超时
			setTimeout(() => {
				if (!done) {
					done = true;
					resolve();
				}
			}, 3000);
		});

		const all = received.join('');
		expect(all.includes('"hello":1') || all.includes('"hello": 1')).toBe(true);
		transport.close();
	});

	const realCmdDescribe = ACP_SERVER_CMD ? describe : describe.skip;
	realCmdDescribe('full ACP server smoke (UNIVERSE_ACP_SERVER_CMD set)', () => {
		it('initialize → newSession → prompt → disconnect', async () => {
			const renderer = new TestRenderer();
			const options = defaultOptions({ command: ACP_SERVER_CMD! });
			const client = new ACPClient(renderer as any, options);

			await withTimeout(client.connect(), 5000, 'connect');
			const init = await withTimeout(client.initialize(), 5000, 'initialize');
			expect(init.protocolVersion).toBeGreaterThan(0);

			await withTimeout(client.newSession(), 8000, 'newSession');
			expect(client.sessionId).toBeTruthy();

			const result = await withTimeout(client.prompt('say hi'), 30000, 'prompt');
			expect(typeof result.stopReason).toBe('string');

			await client.disconnect();
		});
	});
});

describe('ChildProcessTransport - buildSpawnArgs sanity (always on)', () => {
	it('produces executable=cmd and /c-prefixed args', () => {
		const r = buildSpawnArgs(defaultOptions({ command: 'foo', workspace: '/w' }));
		expect(r.executable).toBe('cmd');
		expect(r.args.startsWith('/c ')).toBe(true);
	});
});
