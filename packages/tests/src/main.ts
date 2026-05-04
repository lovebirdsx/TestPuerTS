import './puertsPolyfill';
import * as UE from 'ue';
import { createLogger } from '@universe-agent/editor-common';
import { runTests } from './testRunner';

// 导入测试文件（describe 在导入时注册）
import './ueBindings/basic.test';
import './ueBindings/actor.test';
import './ueBindings/async.test';
import './ueBindings/container.test';
import './ueBindings/delegate.test';
import './ipc/rpcClient.test';
import './ipc/rpcServer.test';
import './editorCommon/processIOHelper.test';
import './editorCommon/childProcess.test';
import './editor/persistence.test';
import './editor/acp/reducer.test';
import './editor/acp/panel.test';
import './editor/acp/e2e.test';
import './reactUmg/compareWidgetProps.test';
import './reactUmg/umgWidget.test';
import './reactUmg/reconciler.test';
import './reactUmg/testing.smoke.test';
import './mcp/bridgeTransport.test';
import './mcp/mcpServer.test';
import './acpClient/jsonrpc.test';
import './acpClient/acpClient.test';
import './acpClient/acpClientHandler.test';
import './acpClient/mcpManager.test';
import './acpClient/controllerIntegration.test';
import './acpClient/acpClient.realProcess.test';

async function main() {
	const filter = UE.JsRunHelper.GetCommandArgs() || undefined;
	const exitCode = await runTests(filter);

	createLogger('test:main').info(`=== 测试结束，退出码: ${exitCode} ===`);
	UE.JsRunHelper.MarkDone(exitCode);
}

main();
