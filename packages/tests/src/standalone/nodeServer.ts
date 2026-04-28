/**
 * Node.js 独立进程：启动命名管道 RPC Server。
 * 等待 PuerTS 端 (rpcClientMain) 作为 Client 连接并调用 RPC。
 */
import { serve, ProxyChannel } from '@universe/lib';
import { PIPE_NAME, CHANNEL_NAME } from './shared';
import { CalculatorService } from '../ipc/testService';

async function main() {
	console.log(`[nodeServer] 启动 RPC Server on ${PIPE_NAME}`);

	const server = await serve(PIPE_NAME);
	const service = new CalculatorService();

	server.registerChannel(CHANNEL_NAME, ProxyChannel.fromService(service));

	console.log('[nodeServer] SERVER_READY');

	// 等待一段时间让测试完成，或监听连接断开
	const timeout = setTimeout(() => {
		console.log('[nodeServer] 超时，关闭服务器');
		cleanup();
	}, 30000);

	server.onDidRemoveConnection(() => {
		console.log('[nodeServer] 客户端断开，关闭服务器');
		clearTimeout(timeout);
		// 短暂延迟确保所有数据已发送
		setTimeout(() => cleanup(), 500);
	});

	function cleanup() {
		service.dispose();
		server.dispose();
		console.log('[nodeServer] 已关闭');
		process.exit(0);
	}
}

main().catch((err) => {
	console.error('[nodeServer] 错误:', err);
	process.exit(1);
});
