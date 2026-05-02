import './puertsPolyfill';
import * as UE from 'ue';
import { runTests } from './testRunner';

// 导入测试文件（describe 在导入时注册）
import './ipc/rpcClient.test';
import './ipc/rpcServer.test';
import './editorCommon/processIOHelper.test';
import './editorCommon/childProcess.test';
import './editor/persistence.test';
import './reactUmg/compareWidgetProps.test';
import './reactUmg/umgWidget.test';
import './reactUmg/reconciler.test';

async function main() {
	const filter = UE.JsRunHelper.GetCommandArgs() || undefined;
	const exitCode = await runTests(filter);

	console.log(`=== 测试结束，退出码: ${exitCode} ===`);
	UE.JsRunHelper.MarkDone(exitCode);
}

main();
