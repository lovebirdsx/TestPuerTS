"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runUnitTests = runUnitTests;
exports.runTest = runTest;
const containerTest_1 = require("./containerTest");
const mixinTest_1 = require("./mixinTest");
const Mocha = require("mocha");
const path = require("path");
const util = require("util");
const fs = require("fs");
const basicTest_1 = require("./basicTest");
function findTestFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            results = results.concat(findTestFiles(fullPath));
        }
        else if (stat.isFile() && file.endsWith('test.js')) {
            results.push(fullPath);
        }
    }
    return results;
}
class Reporter extends Mocha.reporters.Base {
    constructor(runner, options) {
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
    static consoleLog(...data) {
        const log = util.format(...data);
        console.log(log);
    }
}
function runUnitTests() {
    const mocha = new Mocha({ ui: 'tdd', reporter: Reporter });
    const srcDir = path.resolve(__dirname, '..');
    const testFiles = findTestFiles(srcDir);
    for (const file of testFiles) {
        mocha.addFile(file);
    }
    console.log('Running unit tests...');
    mocha.run();
}
function runTest(test) {
    switch (test) {
        case 'UnitTest':
            runUnitTests();
            break;
        case 'BasicTest':
            (0, basicTest_1.basicTest)();
            break;
        case 'ContainerTest':
            (0, containerTest_1.containerTest)();
            break;
        case 'MixinTest':
            (0, mixinTest_1.mixinTest)();
            break;
        default:
            console.log('Unknown test:', test);
            break;
    }
}
//# sourceMappingURL=runTest.js.map