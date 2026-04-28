/**
 * Node.js 独立进程：作为 RPC Client 连接到 PuerTS 端的 Server。
 * PuerTS 端由 rpcServerMain 运行。
 */
import { ProxyChannel } from '@universe/lib';
import { connect } from '@universe/lib/node';
import { PIPE_NAME, CHANNEL_NAME } from './shared';
import type { ICalculatorService } from '../ipc/testService';

async function main() {
	console.log(`[nodeClient] 连接到 RPC Server: ${PIPE_NAME}`);

	const client = await connect(PIPE_NAME, 'node-client');
	console.log('[nodeClient] 已连接');

	// 获取远程服务代理
	const channel = client.getChannel(CHANNEL_NAME);
	const calculator = ProxyChannel.toService<ICalculatorService>(channel);

	// 调用 RPC 方法并验证
	const sum = await calculator.add(10, 20);
	console.log(`[nodeClient] add(10, 20) = ${sum}, expected 30, ${sum === 30 ? 'PASS' : 'FAIL'}`);
	if (sum !== 30) throw new Error(`add(10, 20) returned ${sum}, expected 30`);

	const product = await calculator.multiply(6, 7);
	console.log(`[nodeClient] multiply(6, 7) = ${product}, expected 42, ${product === 42 ? 'PASS' : 'FAIL'}`);
	if (product !== 42) throw new Error(`multiply(6, 7) returned ${product}, expected 42`);

	const echoed = await calculator.echo('hello from Node.js');
	console.log(`[nodeClient] echo = ${echoed}, ${echoed === '[echo] hello from Node.js' ? 'PASS' : 'FAIL'}`);
	if (echoed !== '[echo] hello from Node.js') throw new Error(`echo returned unexpected: ${echoed}`);

	console.log('[nodeClient] 所有测试通过！');

	// 清理
	client.dispose();
	process.exit(0);
}

main().catch((err) => {
	console.error('[nodeClient] 错误:', err);
	process.exit(1);
});
