import * as UE from 'ue';
import { IPCServer, Protocol, Emitter, type ClientConnectionEvent } from '@universe/lib';
import { describe, it, expect, beforeAll, afterAll } from '../testRunner';
import { UeIpcSocket } from './ueIpcSocket';
import { PIPE_NAME, CHANNEL_NAME, CalculatorService, createCalculatorServerChannel } from './testService';

// Node.js standalone 脚本路径（相对于 UE 项目根目录）
const NODE_SCRIPT = 'Content/JavaScript/tests/standalone/nodeClient.js';

// Node.js client 调用: add(10, 20), multiply(6, 7), echo('hello from Node.js')

interface CallRecord {
	method: string;
	args: unknown[];
	result: unknown;
}

/** 带调用记录的 CalculatorService */
class SpyCalculatorService extends CalculatorService {
	readonly calls: CallRecord[] = [];

	override async add(a: number, b: number): Promise<number> {
		const result = await super.add(a, b);
		this.calls.push({ method: 'add', args: [a, b], result });
		return result;
	}

	override async multiply(a: number, b: number): Promise<number> {
		const result = await super.multiply(a, b);
		this.calls.push({ method: 'multiply', args: [a, b], result });
		return result;
	}

	override async echo(msg: string): Promise<string> {
		const result = await super.echo(msg);
		this.calls.push({ method: 'echo', args: [msg], result });
		return result;
	}
}

describe('rpcServer', () => {
	let server: IPCServer<string>;
	let service: SpyCalculatorService;
	let onClientConnect: Emitter<ClientConnectionEvent>;
	let onDidClientDisconnect: Emitter<void>;
	let nodeProcessId: number;

	beforeAll(async () => {
		// 1. 创建 IPCServer
		onClientConnect = new Emitter<ClientConnectionEvent>();
		server = new IPCServer<string>(onClientConnect.event);

		// 2. 注册 Calculator 服务（使用 Spy 版本记录调用）
		service = new SpyCalculatorService();
		server.registerChannel(CHANNEL_NAME, createCalculatorServerChannel(service));

		// 3. 监听命名管道
		const transport = new UE.IPCTransport();
		transport.Listen(PIPE_NAME);

		// 4. 启动 Node.js RPC Client
		const projectDir = UE.PuertsTestHelper.GetProjectDir();
		nodeProcessId = UE.PuertsTestHelper.SpawnProcess('node', `${projectDir}${NODE_SCRIPT}`, projectDir);
		if (nodeProcessId < 0) {
			throw new Error('Failed to spawn Node.js client process');
		}

		// 5. 等待客户端连接
		const socket = await new Promise<UeIpcSocket>((resolve, reject) => {
			let resolved = false;

			transport.OnConnected.Add(() => {
				if (!resolved) {
					resolved = true;
					resolve(new UeIpcSocket(transport));
				}
			});

			if (!resolved && transport.IsConnected()) {
				resolved = true;
				resolve(new UeIpcSocket(transport));
			}

			setTimeout(() => {
				if (!resolved) {
					reject(new Error(`Listen on ${PIPE_NAME} timed out`));
				}
			}, 15000);
		});

		// 6. 触发连接事件
		const protocol = new Protocol(socket);
		onDidClientDisconnect = new Emitter<void>();
		socket.onClose(() => onDidClientDisconnect.fire());

		onClientConnect.fire({
			protocol,
			onDidClientDisconnect: onDidClientDisconnect.event,
		});

		// 7. 等待 Node.js 客户端完成测试并断开
		await new Promise<void>((resolve) => {
			const timeout = setTimeout(() => {
				console.log('[testRpcServer] 等待客户端断开超时');
				resolve();
			}, 15000);

			socket.onClose(() => {
				clearTimeout(timeout);
				resolve();
			});
		});
	});

	afterAll(() => {
		service?.dispose();
		server?.dispose();
		onClientConnect?.dispose();
		onDidClientDisconnect?.dispose();
		if (nodeProcessId > 0) {
			UE.PuertsTestHelper.KillProcess(nodeProcessId);
		}
	});

	it('add should have been called by client', () => {
		const call = service.calls.find((c) => c.method === 'add');
		expect(call).toBeTruthy();
		expect(call!.args).toEqual([10, 20]);
		expect(call!.result).toBe(30);
	});

	it('multiply should have been called by client', () => {
		const call = service.calls.find((c) => c.method === 'multiply');
		expect(call).toBeTruthy();
		expect(call!.args).toEqual([6, 7]);
		expect(call!.result).toBe(42);
	});

	it('echo should have been called by client', () => {
		const call = service.calls.find((c) => c.method === 'echo');
		expect(call).toBeTruthy();
		expect(call!.args).toEqual(['hello from Node.js']);
		expect(call!.result).toBe('[echo] hello from Node.js');
	});

	it('should have received exactly 3 calls', () => {
		expect(service.calls.length).toBe(3);
	});
});
