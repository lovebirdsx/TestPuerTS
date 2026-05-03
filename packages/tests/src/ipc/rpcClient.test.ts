import * as UE from 'ue';
import { NetIPCClient, Protocol } from 'universe-lib';
import { describe, it, expect, beforeAll, afterAll } from '../testRunner';
import { connectUeIpc } from '@universe-agent/editor-common';
import { PIPE_NAME, CHANNEL_NAME, createCalculatorProxy, type ICalculatorService } from './testService';

// Node.js standalone 脚本路径（相对于 UE 项目根目录）
const NODE_SCRIPT = 'Content/JavaScript/tests/standalone/nodeServer.js';

describe('rpcClient', () => {
	let calculator: ICalculatorService;
	let ipcClient: NetIPCClient;
	let nodeProcessId: number;

	beforeAll(async () => {
		// 启动 Node.js RPC Server
		const projectDir = UE.JsRunHelper.GetProjectDir();
		nodeProcessId = UE.JsRunHelper.SpawnProcess('node', `${projectDir}${NODE_SCRIPT}`, projectDir);
		if (nodeProcessId < 0) {
			throw new Error('Failed to spawn Node.js server process');
		}

		// 等待 Node.js 进程启动并创建管道
		await new Promise<void>((resolve) => setTimeout(resolve, 1000));

		// 连接到命名管道（connectUeIpc 内置超时重试）
		const socket = await connectUeIpc(PIPE_NAME);
		const protocol = new Protocol(socket);
		ipcClient = new NetIPCClient(protocol, 'puerts-client');
		const channel = ipcClient.getChannel(CHANNEL_NAME);
		calculator = createCalculatorProxy(channel);
	});

	afterAll(() => {
		ipcClient?.dispose();
		if (nodeProcessId > 0) {
			UE.JsRunHelper.KillProcess(nodeProcessId);
		}
	});

	it('add(2, 3) should return 5', async () => {
		const result = await calculator.add(2, 3);
		expect(result).toBe(5);
	});

	it('multiply(4, 5) should return 20', async () => {
		const result = await calculator.multiply(4, 5);
		expect(result).toBe(20);
	});

	it('echo should prefix message', async () => {
		const result = await calculator.echo('hello from PuerTS');
		expect(result).toBe('[echo] hello from PuerTS');
	});
});
