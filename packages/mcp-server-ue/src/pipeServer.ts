/**
 * 把 universe-lib 命名管道连接（PuerTS 端 server）适配为 McpServer 需要的 `BridgeLink`。
 *
 * 时序：
 *   1. editor 调 `serveOnPipe(pipe, options)`：
 *      - 启动 `UE.IPCTransport.Listen(pipe)`
 *      - 包装为 `IPCServer<string>`
 *      - 注册 BRIDGE_CHANNEL 服务（接收 bridge → editor 的 `forwardFromAgent` 调用）
 *   2. mcp-bridge 进程通过 stdio 被 agent spawn，反向 `connect(pipe)` 上来
 *      - 触发 server.onDidAddConnection → 拿到 `connection.channelClient`
 *      - 通过它取 BRIDGE_CALLBACK_CHANNEL（bridge 注册的回调服务）
 *      - 用它来 push 消息到 bridge stdout（→ agent stdin）
 *   3. 构造 McpServer，把 forwardFromAgent → onMessage、callback.pushToAgent → send。
 *
 * 一对一模型：每个命名管道只服务一个 bridge / 一个 ACP session。
 */

import * as UE from 'ue';
import { type ClientConnectionEvent, type Connection, Emitter, IPCServer, Protocol, ProxyChannel } from 'universe-lib';
import {
	BRIDGE_CALLBACK_CHANNEL,
	BRIDGE_CHANNEL,
	type IMcpBridgeCallback,
	type IMcpBridgeService,
} from '@universe-agent/mcp-bridge/dist/shared';
import { type BridgeLink, UeIpcSocket } from '@universe-agent/editor-common';

export interface PipeServerHandle {
	/** universe-lib 服务器（编辑器侧管理 dispose） */
	dispose(): void;
	/** 等待第一个 bridge 连接上来；超时由调用方处理。 */
	waitForBridge(): Promise<BridgeLink>;
}

export function serveOnPipe(pipeName: string): PipeServerHandle {
	const onClientConnect = new Emitter<ClientConnectionEvent>();
	const server = new IPCServer<string>(onClientConnect.event);

	const transport = new UE.IPCTransport();
	transport.Listen(pipeName);

	// 等待 bridge 连接的状态
	let resolveBridge: ((link: BridgeLink) => void) | null = null;
	let rejectBridge: ((err: Error) => void) | null = null;
	const bridgePromise = new Promise<BridgeLink>((resolve, reject) => {
		resolveBridge = resolve;
		rejectBridge = reject;
	});
	// 防御：dispose-before-bridge 场景下 reject 可能没有 .then 链路监听，
	// 这里挂一个 no-op catch 避免 unhandledRejection；真正的等待方会另外注册 then/catch。
	bridgePromise.catch(() => {
		// ignore
	});

	let socket: UeIpcSocket | null = null;
	const onDidClientDisconnect = new Emitter<void>();

	const onConnect = () => {
		if (socket) return;
		socket = new UeIpcSocket(transport);
		socket.onClose(() => onDidClientDisconnect.fire());

		const protocol = new Protocol(socket);
		onClientConnect.fire({ protocol, onDidClientDisconnect: onDidClientDisconnect.event });
	};

	if (transport.IsConnected()) {
		onConnect();
	}
	transport.OnConnected.Add(onConnect);

	// 等到 IPCServer 拿到 connection 后，再构造 BridgeLink
	let messageHandler: ((line: string) => void) | null = null;
	const pendingMessages: string[] = [];
	let closeHandler: (() => void) | null = null;
	let closed = false;

	server.onDidAddConnection((conn: Connection<string>) => {
		try {
			const callbackChannel = conn.channelClient.getChannel(BRIDGE_CALLBACK_CHANNEL);
			const callback = ProxyChannel.toService<IMcpBridgeCallback>(callbackChannel);

			const link: BridgeLink = {
				send(line: string): void {
					if (closed) return;
					callback.pushToAgent(line).catch(() => {
						// bridge 已断开，忽略；后续 onClose 会清理
					});
				},
				onMessage(handler: (line: string) => void): void {
					messageHandler = handler;
					// flush 在 handler 注册前已到达的帧，消除 bridge 先于 mcp.connect 发帧的竞态
					while (pendingMessages.length > 0) {
						handler(pendingMessages.shift()!);
					}
				},
				onClose(handler: () => void): void {
					closeHandler = handler;
				},
				close(): void {
					if (closed) return;
					closed = true;
					try {
						socket?.close();
					} catch {
						// ignore
					}
					closeHandler?.();
				},
			};

			// 注册 BRIDGE_CHANNEL：bridge 调 forwardFromAgent 转发 agent 消息
			const bridgeService: IMcpBridgeService = {
				async forwardFromAgent(line: string): Promise<void> {
					if (closed) return;
					if (messageHandler) {
						messageHandler(line);
					} else {
						// handler 尚未注册（ready() 的 Promise 链还未执行完），先入队
						pendingMessages.push(line);
					}
				},
			};
			server.registerChannel(BRIDGE_CHANNEL, ProxyChannel.fromService(bridgeService));

			resolveBridge?.(link);
			resolveBridge = null;
			rejectBridge = null;

			server.onDidRemoveConnection((removed) => {
				if (removed === conn && !closed) {
					closed = true;
					closeHandler?.();
				}
			});
		} catch (err) {
			rejectBridge?.(err instanceof Error ? err : new Error(String(err)));
			rejectBridge = null;
		}
	});

	return {
		dispose(): void {
			closed = true;
			try {
				socket?.close();
			} catch {
				// ignore
			}
			// 无论 bridge 是否曾连接，必须显式关闭 transport，确保 FTSTicker 被移除。
			// socket?.close() 在 socket 存在时已调用 transport.Close()，此处补全 socket 为 null
			// （bridge 未接入）时的路径；Close() 内部有 PipeHandle 守卫，重复调用安全。
			try {
				transport.Close();
			} catch {
				// ignore
			}
			server.dispose();
			onClientConnect.dispose();
			onDidClientDisconnect.dispose();
			rejectBridge?.(new Error('Pipe server disposed before bridge connected'));
		},
		waitForBridge(): Promise<BridgeLink> {
			return bridgePromise;
		},
	};
}
