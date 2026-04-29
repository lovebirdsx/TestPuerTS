import * as UE from 'ue';
import { describe, it, expect, afterAll } from '../testRunner';

const projectDir = UE.JsRunHelper.GetProjectDir();
const tempDir = `${projectDir}Intermediate/TestProcessIO`;

// 测试结束后清理临时文件和目录
afterAll(() => {
	// 清理方式：写入空内容覆盖测试文件（UE 没有提供删除 API）
	// 实际清理依赖 Intermediate 目录的常规清理机制
});

describe('ProcessIOHelper - File Operations', () => {
	const testFile = `${tempDir}/test.txt`;
	const testContent = 'Hello, ProcessIOHelper!';

	it('WriteTextFile should write the file and return true', () => {
		const result = UE.ProcessIOHelper.WriteTextFile(testFile, testContent);
		expect(result).toBe(true);
	});

	it('FileExists should return true for an existing file', () => {
		UE.ProcessIOHelper.WriteTextFile(testFile, testContent);
		expect(UE.ProcessIOHelper.FileExists(testFile)).toBe(true);
	});

	it('FileExists should return false for a non-existent file', () => {
		expect(UE.ProcessIOHelper.FileExists(`${tempDir}/nonexistent_file.txt`)).toBe(false);
	});

	it('ReadTextFile should read back the written content correctly', () => {
		UE.ProcessIOHelper.WriteTextFile(testFile, testContent);
		const content = UE.ProcessIOHelper.ReadTextFile(testFile);
		expect(content).toBe(testContent);
	});

	it('ReadTextFile should return an empty string for a non-existent file', () => {
		const content = UE.ProcessIOHelper.ReadTextFile(`${tempDir}/nonexistent_file.txt`);
		expect(content).toBe('');
	});

	it('WriteTextFile should automatically create missing nested directories', () => {
		const deepFile = `${tempDir}/deep/nested/dir/file.txt`;
		const result = UE.ProcessIOHelper.WriteTextFile(deepFile, 'deep content');
		expect(result).toBe(true);
		expect(UE.ProcessIOHelper.ReadTextFile(deepFile)).toBe('deep content');
	});

	it('MakeDirTree should create nested directories successfully', () => {
		const dirPath = `${tempDir}/a/b/c`;
		const result = UE.ProcessIOHelper.MakeDirTree(dirPath);
		expect(result).toBe(true);
	});

	it('should handle UTF-8 Chinese content correctly', () => {
		const chineseFile = `${tempDir}/chinese.txt`;
		const chineseContent = '你好，世界！这是一段中文测试内容。';
		UE.ProcessIOHelper.WriteTextFile(chineseFile, chineseContent);
		const readBack = UE.ProcessIOHelper.ReadTextFile(chineseFile);
		expect(readBack).toBe(chineseContent);
	});
});

describe('ProcessIOHelper - Environment Variables', () => {
	it('GetEnvVar should return the value of an existing environment variable', () => {
		const path = UE.ProcessIOHelper.GetEnvVar('PATH');
		expect(path).not.toBe('');
	});

	it('GetEnvVar should return an empty string for a non-existent variable', () => {
		const value = UE.ProcessIOHelper.GetEnvVar('PROCESSIOHELPER_TEST_NONEXISTENT_VAR_12345');
		expect(value).toBe('');
	});
});

describe('ProcessIOHelper - Stdin', () => {
	it('HasStdinInput should return false in the Commandlet environment', () => {
		expect(UE.ProcessIOHelper.HasStdinInput()).toBe(false);
	});

	it('ReadStdinLine should return an empty string when there is no input', () => {
		expect(UE.ProcessIOHelper.ReadStdinLine()).toBe('');
	});

	it('IsStdinTTY should return false in the Commandlet environment', () => {
		expect(UE.ProcessIOHelper.IsStdinTTY()).toBe(false);
	});
});

describe('ProcessIOHelper - Stdout/Stderr', () => {
	it('WriteStdout should execute without throwing', () => {
		UE.ProcessIOHelper.WriteStdout('[test] stdout output\n');
		expect(true).toBe(true);
	});

	it('WriteStderr should execute without throwing', () => {
		UE.ProcessIOHelper.WriteStderr('[ignore] stderr output\n');
		expect(true).toBe(true);
	});
});
