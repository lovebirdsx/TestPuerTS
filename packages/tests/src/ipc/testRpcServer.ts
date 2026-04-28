import * as UE from 'ue';
import {
	IPCServer,
	Protocol,
	Emitter,
	type ClientConnectionEvent,
} from '@universe/lib';
import { UeIpcSocket } from './ueIpcSocket';
import { PIPE_NAME, CHANNEL_NAME, CalculatorService, createCalculatorServerChannel } from './testService';

/**
 * 测试用例：PuerTS 作为 RPC Server，等待 Node.js 端的 Client 连接。
 * Node.js 端由独立进程 (standalone/nodeClient.ts) 运行。
 */
export async function testPuertsAsServer(): Promise<void> {
	console.log('[testRpcServer] 开始：PuerTS 作为 Server 等待 Node.js Client');

	// 1. 创建连接事件发射器
	const onClientConnect = new Emitter<ClientConnectionEvent>();

	// 2. 创建 IPCServer
	const server = new IPCServer<string>(onClientConnect.event);

	// 3. 注册 Calculator 服务通道
	const service = new CalculatorService();
	server.registerChannel(CHANNEL_NAME, createCalculatorServerChannel(service));

	// 4. 开始监听命名管道（同时输出 SERVER_READY，避免死锁）
	// listenUeIpc 会等到客户端连接才 resolve，
	// 但 gulp 任务需要先看到 SERVER_READY 才启动 Node.js 客户端。
	// 所以需要在 listen 开始后立即输出 ready 信号。

	// 直接使用底层 API：创建 transport 并 listen
	const transport = new UE.IPCTransport();
	transport.Listen(PIPE_NAME);

	// 输出就绪信号（gulp 任务编排会检测此输出来启动 Node.js 客户端）
	console.log('[testRpcServer] SERVER_READY');

	// 等待客户端连接
	const socket = await new Promise<UeIpcSocket>((resolve, reject) => {
		let resolved = false;

		transport.OnConnected.Add(() => {
			if (!resolved) {
				resolved = true;
				resolve(new UeIpcSocket(transport));
			}
		});

		// 可能已经连上了
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

	console.log('[testRpcServer] 客户端已连接');

	// 5. 触发连接事件，让 IPCServer 处理此连接
	const protocol = new Protocol(socket);
	const onDidClientDisconnect = new Emitter<void>();
	socket.onClose(() => onDidClientDisconnect.fire());

	onClientConnect.fire({
		protocol,
		onDidClientDisconnect: onDidClientDisconnect.event,
	});

	// 6. 等待客户端断开（Node.js 端完成测试后会关闭连接）
	await new Promise<void>((resolve) => {
		const timeout = setTimeout(() => {
			console.log('[testRpcServer] 等待超时，关闭服务器');
			resolve();
		}, 15000);

		socket.onClose(() => {
			clearTimeout(timeout);
			console.log('[testRpcServer] 客户端已断开');
			resolve();
		});
	});

	console.log('[testRpcServer] 服务器端测试完成');

	// 7. 清理
	service.dispose();
	server.dispose();
	onClientConnect.dispose();
	onDidClientDisconnect.dispose();
}
