import './puertsPolyfill';
import * as UE from 'ue';
import { createLogger } from '@universe-agent/editor-common';
import { runTests } from './testRunner';

// 运行时扫描编译输出目录，自动 require 所有 *.test.js
function loadTests() {
	const testsOutDir = `${UE.JsRunHelper.GetProjectDir()}Content/JavaScript/tests`;
	const jsExt = UE.NewArray(UE.BuiltinString);
	jsExt.Add('js');
	const entries = UE.ProcessIOHelper.ListFilesRecursive(testsOutDir, jsExt);
	for (const entry of entries) {
		if (entry.RelativePath.endsWith('.test.js')) {
			// eslint-disable-next-line @typescript-eslint/no-require-imports
			require(`./${entry.RelativePath.replace(/\.js$/, '')}`);
		}
	}
}

async function main() {
	const filter = UE.JsRunHelper.GetCommandArgs() || undefined;
	const exitCode = await runTests(filter);

	createLogger('test:main').info(`=== 测试结束，退出码: ${exitCode} ===`);
	UE.JsRunHelper.MarkDone(exitCode);
}

loadTests();
main();
