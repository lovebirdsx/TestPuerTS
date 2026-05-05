import './puertsPolyfill';
import * as UE from 'ue';
import { createLogger } from '@universe-agent/editor-common';
import { runTests } from './testRunner';
import { parseTestArgs } from './cliArgs';

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
	const logger = createLogger('test:main');
	const raw = UE.JsRunHelper.GetCommandArgs() || '';

	let parsed;
	try {
		parsed = parseTestArgs(raw);
	} catch (err) {
		logger.error((err as Error).message);
		UE.JsRunHelper.MarkDone(1);
		return;
	}

	const exitCode = await runTests(parsed);

	logger.info(`=== Test Finished, Exit Code: ${exitCode} ===`);
	UE.JsRunHelper.MarkDone(exitCode);
}

loadTests();
main();
