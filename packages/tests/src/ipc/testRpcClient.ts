import { NetIPCClient, Protocol } from '@universe/lib';
import { connectUeIpc } from './ueIpcSocket';
import { PIPE_NAME, CHANNEL_NAME, createCalculatorProxy, type ICalculatorService } from './testService';

/**
 * 测试用例：PuerTS 作为 RPC Client，连接到 Node.js 端的 RPC Server。
 * Node.js 端由独立进程 (standalone/nodeServer.ts) 运行。
 */
export async function testPuertsAsClient(): Promise<void> {
	console.log('[testRpcClient] 开始：PuerTS 作为 Client 连接到 Node.js Server');

	// 1. 通过 C++ UIPCTransport 连接到命名管道
	const socket = await connectUeIpc(PIPE_NAME);
	console.log('[testRpcClient] 已连接到命名管道');

	// 2. 在 socket 上建立 Protocol → IPCClient
	const protocol = new Protocol(socket);
	const ipcClient = new NetIPCClient(protocol, 'puerts-client');

	// 3. 获取远程服务代理
	const channel = ipcClient.getChannel(CHANNEL_NAME);
	const calculator = createCalculatorProxy(channel);

	// 4. 调用 RPC 方法并验证
	const sum = await calculator.add(2, 3);
	console.log(`[testRpcClient] add(2, 3) = ${sum}, expected 5, ${sum === 5 ? 'PASS' : 'FAIL'}`);
	if (sum !== 5) throw new Error(`add(2, 3) returned ${sum}, expected 5`);

	const product = await calculator.multiply(4, 5);
	console.log(`[testRpcClient] multiply(4, 5) = ${product}, expected 20, ${product === 20 ? 'PASS' : 'FAIL'}`);
	if (product !== 20) throw new Error(`multiply(4, 5) returned ${product}, expected 20`);

	const echoed = await calculator.echo('hello from PuerTS');
	console.log(`[testRpcClient] echo = ${echoed}, ${echoed === '[echo] hello from PuerTS' ? 'PASS' : 'FAIL'}`);
	if (echoed !== '[echo] hello from PuerTS') throw new Error(`echo returned unexpected value: ${echoed}`);

	console.log('[testRpcClient] 所有测试通过！');

	// 5. 清理
	ipcClient.dispose();
}
