import * as UE from 'ue';
import { describe, it, expect, afterAll } from '../testRunner';

const projectDir = UE.JsRunHelper.GetProjectDir();
const tempDir = `${projectDir}Intermediate/TestProcessIO`;

function waitResult(result: UE.AsyncFileResult): Promise<UE.AsyncFileResult> {
	return new Promise((resolve) => {
		result.OnComplete.Add(() => {
			resolve(result);
		});
	});
}

// 测试结束后清理临时文件和目录
afterAll(() => {
	// 清理方式：写入空内容覆盖测试文件（UE 没有提供删除 API）
	// 实际清理依赖 Intermediate 目录的常规清理机制
});

describe('ProcessIOHelper - File Operations', () => {
	const testFile = `${tempDir}/test.txt`;
	const testContent = 'Hello, ProcessIOHelper!';

	it('WriteTextFile should write the file and return true', async () => {
		const result = await waitResult(UE.ProcessIOHelper.WriteTextFile(testFile, testContent));
		expect(result.bSuccess).toBe(true);
	});

	it('FileExists should return true for an existing file', async () => {
		await waitResult(UE.ProcessIOHelper.WriteTextFile(testFile, testContent));
		const result = await waitResult(UE.ProcessIOHelper.FileExists(testFile));
		expect(result.bSuccess).toBe(true);
	});

	it('FileExists should return false for a non-existent file', async () => {
		const result = await waitResult(UE.ProcessIOHelper.FileExists(`${tempDir}/nonexistent_file.txt`));
		expect(result.bSuccess).toBe(false);
	});

	it('ReadTextFile should read back the written content correctly', async () => {
		await waitResult(UE.ProcessIOHelper.WriteTextFile(testFile, testContent));
		const result = await waitResult(UE.ProcessIOHelper.ReadTextFile(testFile));
		expect(result.Content).toBe(testContent);
	});

	it('ReadTextFile should return an empty string for a non-existent file', async () => {
		const result = await waitResult(UE.ProcessIOHelper.ReadTextFile(`${tempDir}/nonexistent_file.txt`));
		expect(result.Content).toBe('');
	});

	it('WriteTextFile should automatically create missing nested directories', async () => {
		const deepFile = `${tempDir}/deep/nested/dir/file.txt`;
		const writeResult = await waitResult(UE.ProcessIOHelper.WriteTextFile(deepFile, 'deep content'));
		expect(writeResult.bSuccess).toBe(true);
		const readResult = await waitResult(UE.ProcessIOHelper.ReadTextFile(deepFile));
		expect(readResult.Content).toBe('deep content');
	});

	it('MakeDirTree should create nested directories successfully', async () => {
		const dirPath = `${tempDir}/a/b/c`;
		const result = await waitResult(UE.ProcessIOHelper.MakeDirTree(dirPath));
		expect(result.bSuccess).toBe(true);
	});

	it('should handle UTF-8 Chinese content correctly', async () => {
		const chineseFile = `${tempDir}/chinese.txt`;
		const chineseContent = '你好，世界！这是一段中文测试内容。';
		await waitResult(UE.ProcessIOHelper.WriteTextFile(chineseFile, chineseContent));
		const result = await waitResult(UE.ProcessIOHelper.ReadTextFile(chineseFile));
		expect(result.Content).toBe(chineseContent);
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
