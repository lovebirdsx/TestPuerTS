import './puertsPolyfill';
import * as UE from 'ue';
import { testPuertsAsServer } from './ipc/testRpcServer';

async function main() {
	console.log('=== PuerTS RPC Test: Server Mode ===');
	let exitCode = 0;

	try {
		await testPuertsAsServer();
	} catch (err: any) {
		console.error(`测试失败: ${err.message || err}`);
		if (err.stack) console.error(err.stack);
		exitCode = 1;
	}

	console.log(`=== 测试结束，退出码: ${exitCode} ===`);
	UE.PuertsTestHelper.MarkTestDone(exitCode);
}

main();
