import * as Mocha from 'mocha';
import * as path from 'path';
import * as util from 'util';

import * as fs from 'fs';

function findTestFiles(dir: string): string[] {
	let results: string[] = [];
	const list = fs.readdirSync(dir);
	for (const file of list) {
		const fullPath = path.join(dir, file);
		const stat = fs.statSync(fullPath);
		if (stat.isDirectory()) {
			results = results.concat(findTestFiles(fullPath));
		} else if (stat.isFile() && file.endsWith('test.js')) {
			results.push(fullPath);
		}
	}
	return results;
}

class Reporter extends Mocha.reporters.Base {
	constructor(runner: Mocha.Runner, options: Mocha.MochaOptions) {
		super(runner, options);

		runner.on('pass', (test) => {
			console.log(`✅ ${test.fullTitle()} (${test.duration}ms)`);
		});

		runner.on('fail', (test, err) => {
			console.error(`❌ ${test.fullTitle()}`);
			console.error(`   错误信息: ${err.message}`);
		});

		runner.on('end', () => {
			this.epilogue();
		});

		Mocha.reporters.base.consoleLog = Reporter.consoleLog;
	}

	static consoleLog(...data: any[]) {
		const log = util.format(...data);
		console.log(log);
	}
}

export function runUnitTests() {
	const mocha = new Mocha({ ui: 'tdd', reporter: Reporter });
	const srcDir = path.resolve(__dirname, '..');
	const testFiles = findTestFiles(srcDir);
	for (const file of testFiles) {
		mocha.addFile(file);
	}

	console.log('Running unit tests...');
	mocha.run();
}
