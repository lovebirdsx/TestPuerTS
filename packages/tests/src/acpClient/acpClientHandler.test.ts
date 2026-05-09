import * as UE from 'ue';
import { describe, it, expect } from '../testRunner';
import { ACPClientHandler, type RequestPermissionRequest } from '@universe-agent/acp-client-ue';
import type { CliOptions } from '../../../acp-client-ue/src/cli';
import { TestRenderer } from './__fixtures__/testRenderer';
import { withTimeout } from './__fixtures__/withTimeout';

const projectDir = UE.JsRunHelper.GetProjectDir();
const tempDir = `${projectDir}Intermediate/TestAcpHandler`;

function defaultOptions(overrides: Partial<CliOptions> = {}): CliOptions {
	return {
		command: 'fake-acp',
		args: [],
		workspace: tempDir,
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

function buildHandler(opts: Partial<CliOptions> = {}): ACPClientHandler {
	const renderer = new TestRenderer();
	return new ACPClientHandler(renderer as any, defaultOptions(opts));
}

function makePermissionParams(): RequestPermissionRequest {
	return {
		sessionId: 's',
		toolCall: { toolCallId: 't1', title: 'do thing' },
		options: [
			{ optionId: 'allow_once', name: 'Allow once', kind: 'allow_once' },
			{ optionId: 'reject_once', name: 'Reject', kind: 'reject_once' },
		],
	};
}

describe('ACPClientHandler - fs/read_text_file', () => {
	it('reads existing file via UE.ProcessIOHelper', async () => {
		const handler = buildHandler();
		const filePath = `${tempDir}/handler_read.txt`;
		const expected = 'hello-handler';
		await new Promise<void>((resolve) => {
			const r = UE.ProcessIOHelper.WriteTextFile(filePath, expected);
			r.OnComplete.Add(() => resolve());
		});

		const result = (await withTimeout(
			handler.handleRequest('fs/read_text_file', { path: filePath }),
			3000,
			'fs/read_text_file',
		)) as { content: string };

		expect(result.content).toBe(expected);
	});

	it('throws -32002 for missing file', async () => {
		const handler = buildHandler();
		const missing = `${tempDir}/does_not_exist_${Date.now()}.txt`;
		let caught: any = null;
		try {
			await withTimeout(handler.handleRequest('fs/read_text_file', { path: missing }), 3000);
		} catch (e) {
			caught = e;
		}
		expect(caught).toBeTruthy();
		expect(caught.code).toBe(-32002);
	});
});

describe('ACPClientHandler - fs/write_text_file', () => {
	it('writes file and returns empty result', async () => {
		const handler = buildHandler();
		const filePath = `${tempDir}/handler_write.txt`;
		const content = 'written-by-handler';
		const result = await withTimeout(
			handler.handleRequest('fs/write_text_file', { path: filePath, content }),
			3000,
			'fs/write_text_file',
		);
		expect(typeof result).toBe('object');

		// 回读验证
		const readBack = await new Promise<string>((resolve) => {
			const r = UE.ProcessIOHelper.ReadTextFile(filePath);
			r.OnComplete.Add(() => resolve(r.Content));
		});
		expect(readBack).toBe(content);
	});
});

describe('ACPClientHandler - permission strategies', () => {
	it('auto-approve picks first allow option', async () => {
		const handler = buildHandler({ permission: 'auto-approve' });
		const result = (await withTimeout(
			handler.handleRequest('session/request_permission', makePermissionParams()),
			1000,
		)) as { outcome: { outcome: string; optionId: string } };
		expect(result.outcome.outcome).toBe('selected');
		expect(result.outcome.optionId).toBe('allow_once');
	});

	it('deny-all picks first reject option', async () => {
		const handler = buildHandler({ permission: 'deny-all' });
		const result = (await withTimeout(
			handler.handleRequest('session/request_permission', makePermissionParams()),
			1000,
		)) as { outcome: { outcome: string; optionId: string } };
		expect(result.outcome.optionId).toBe('reject_once');
	});

	it('custom permissionHandler takes precedence', async () => {
		const handler = buildHandler({ permission: 'auto-approve' });
		let received: RequestPermissionRequest | null = null;
		handler.setPermissionHandler(async (params) => {
			received = params;
			return { outcome: { outcome: 'selected', optionId: 'custom' } };
		});

		const result = (await withTimeout(
			handler.handleRequest('session/request_permission', makePermissionParams()),
			1000,
		)) as { outcome: { optionId: string } };

		expect(received).not.toBeNull();
		expect(result.outcome.optionId).toBe('custom');
	});

	it.skip('interactive mode (depends on stdin polling, not testable in commandlet)', () => {
		// 依赖 UE.ProcessIOHelper.ReadStdinLine 轮询，commandlet 中无 stdin
	});
});

describe('ACPClientHandler - terminal lifecycle', () => {
	it('create → wait_for_exit returns exitCode for short-lived process', async () => {
		const handler = buildHandler();

		const created = (await withTimeout(
			handler.handleRequest('terminal/create', { command: 'exit', args: ['0'], cwd: tempDir }),
			3000,
			'terminal/create',
		)) as { terminalId: string };
		expect(typeof created.terminalId).toBe('string');

		const exit = (await withTimeout(
			handler.handleRequest('terminal/wait_for_exit', { terminalId: created.terminalId }),
			5000,
			'terminal/wait_for_exit',
		)) as { exitCode: number | null; signal: string | null };
		expect(exit.signal).toBeNull();

		// 再调 terminal/output 应能返回 exitStatus
		const output = (await withTimeout(
			handler.handleRequest('terminal/output', { terminalId: created.terminalId }),
			1000,
			'terminal/output',
		)) as { output: string; truncated: boolean; exitStatus?: { exitCode: number | null } };
		expect(output.exitStatus).toBeTruthy();
	});

	it('output for unknown terminalId throws -32002', async () => {
		const handler = buildHandler();
		let caught: any = null;
		try {
			await withTimeout(handler.handleRequest('terminal/output', { terminalId: 'no-such-term' }), 1000);
		} catch (e) {
			caught = e;
		}
		expect(caught).toBeTruthy();
		expect(caught.code).toBe(-32002);
	});

	it('release for unknown terminalId is no-op (returns object)', async () => {
		const handler = buildHandler();
		const result = await withTimeout(
			handler.handleRequest('terminal/release', { terminalId: 'no-such-term' }),
			1000,
		);
		expect(typeof result).toBe('object');
	});

	it('kill marks terminal as exited', async () => {
		const handler = buildHandler();
		// 起一个长时间命令再 kill
		const created = (await withTimeout(
			handler.handleRequest('terminal/create', {
				command: 'ping',
				args: ['127.0.0.1', '-n', '30'],
				cwd: tempDir,
			}),
			3000,
		)) as { terminalId: string };

		await withTimeout(handler.handleRequest('terminal/kill', { terminalId: created.terminalId }), 3000);

		const output = (await withTimeout(
			handler.handleRequest('terminal/output', { terminalId: created.terminalId }),
			1000,
		)) as { exitStatus?: { exitCode: number | null } };
		expect(output.exitStatus).toBeTruthy();

		// 清理
		await handler.handleRequest('terminal/release', { terminalId: created.terminalId });
	});
});

describe('ACPClientHandler - method dispatch', () => {
	it('unknown method throws -32601', async () => {
		const handler = buildHandler();
		let caught: any = null;
		try {
			await handler.handleRequest('unknown/method', {});
		} catch (e) {
			caught = e;
		}
		expect(caught).toBeTruthy();
		expect(caught.code).toBe(-32601);
	});

	it('cleanup is idempotent and clears terminals', async () => {
		const handler = buildHandler();
		handler.cleanup();
		handler.cleanup();
	});
});
