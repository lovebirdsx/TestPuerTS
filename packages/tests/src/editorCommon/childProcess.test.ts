import * as UE from 'ue';
import { describe, it, expect } from '../testRunner';

describe('ChildProcess - Basic Spawn', () => {
	it('should spawn a process and capture stdout', async () => {
		const proc = new UE.ChildProcess();
		let stdout = '';

		const result = await new Promise<{ exitCode: number; stdout: string }>((resolve) => {
			proc.OnStdoutDataAvailable.Add(() => {
				stdout += proc.ReadStdoutString();
			});
			proc.OnExit.Add(() => {
				resolve({ exitCode: proc.GetExitCode(), stdout });
			});

			const opts = new UE.ChildProcessOptions();
			const ok = proc.Spawn('node', '-e "console.log(\'hello-childprocess\')"', opts);
			expect(ok).toBe(true);
		});

		expect(result.exitCode).toBe(0);
		expect(result.stdout).toContain('hello-childprocess');
	});

	it('should capture exit code from a failing process', async () => {
		const proc = new UE.ChildProcess();

		const exitCode = await new Promise<number>((resolve) => {
			proc.OnExit.Add(() => {
				resolve(proc.GetExitCode());
			});

			const opts = new UE.ChildProcessOptions();
			proc.Spawn('node', '-e "process.exit(42)"', opts);
		});

		expect(exitCode).toBe(42);
	});

	it('should report IsRunning correctly', async () => {
		const proc = new UE.ChildProcess();

		const opts = new UE.ChildProcessOptions();
		proc.Spawn('node', '-e "setTimeout(() => {}, 500)"', opts);

		expect(proc.IsRunning()).toBe(true);

		await new Promise<void>((resolve) => {
			proc.OnExit.Add(() => {
				resolve();
			});
		});

		expect(proc.IsRunning()).toBe(false);
	});

	it('should return a valid process ID', () => {
		const proc = new UE.ChildProcess();
		const opts = new UE.ChildProcessOptions();
		proc.Spawn('node', '-e "setTimeout(() => {}, 200)"', opts);

		expect(proc.GetProcessId()).toBeGreaterThan(0);

		proc.Kill(true);
	});
});

describe('ChildProcess - Stdin/Stdout Communication', () => {
	it('should write to stdin and read echoed stdout', async () => {
		const proc = new UE.ChildProcess();
		let stdout = '';

		const result = await new Promise<string>((resolve) => {
			proc.OnStdoutDataAvailable.Add(() => {
				stdout += proc.ReadStdoutString();
			});
			proc.OnExit.Add(() => {
				resolve(stdout);
			});

			const opts = new UE.ChildProcessOptions();
			// Node 脚本：读取 stdin 后输出到 stdout
			const script = `
				let data = '';
				process.stdin.on('data', (chunk) => { data += chunk; });
				process.stdin.on('end', () => { process.stdout.write('echo:' + data); });
			`.replace(/\n/g, ' ');
			proc.Spawn('node', `-e "${script}"`, opts);

			proc.WriteStdin('test-input');
			proc.CloseStdin(); // 发送 EOF
		});

		expect(result).toContain('echo:test-input');
	});
});

describe('ChildProcess - Stderr', () => {
	it('should capture stderr separately', async () => {
		const proc = new UE.ChildProcess();
		let stderr = '';

		const result = await new Promise<{ exitCode: number; stderr: string }>((resolve) => {
			proc.OnStderrDataAvailable.Add(() => {
				stderr += proc.ReadStderrString();
			});
			proc.OnExit.Add(() => {
				resolve({ exitCode: proc.GetExitCode(), stderr });
			});

			const opts = new UE.ChildProcessOptions();
			proc.Spawn('node', '-e "console.error(\'error-output\')"', opts);
		});

		expect(result.exitCode).toBe(0);
		expect(result.stderr).toContain('error-output');
	});

	it('should merge stderr into stdout when bMergeStderr is true', async () => {
		const proc = new UE.ChildProcess();
		let stdout = '';

		const result = await new Promise<string>((resolve) => {
			proc.OnStdoutDataAvailable.Add(() => {
				stdout += proc.ReadStdoutString();
			});
			proc.OnExit.Add(() => {
				resolve(stdout);
			});

			const opts = new UE.ChildProcessOptions();
			opts.bMergeStderr = true;
			proc.Spawn('node', '-e "console.error(\'merged-error\')"', opts);
		});

		expect(result).toContain('merged-error');
	});
});

describe('ChildProcess - Kill', () => {
	it('should kill a running process', async () => {
		const proc = new UE.ChildProcess();

		const opts = new UE.ChildProcessOptions();
		// 长时间运行的进程
		proc.Spawn('node', '-e "setTimeout(() => {}, 60000)"', opts);

		expect(proc.IsRunning()).toBe(true);

		proc.Kill(true);

		// 等待退出事件
		await new Promise<void>((resolve) => {
			proc.OnExit.Add(() => {
				resolve();
			});
		});

		expect(proc.IsRunning()).toBe(false);
		// 被 Kill 的进程退出码通常非 0
		expect(proc.GetExitCode()).not.toBe(0);
	});
});

describe('ChildProcess - Environment Variables', () => {
	it('should pass custom environment variables to child process', async () => {
		const proc = new UE.ChildProcess();
		let stdout = '';

		const result = await new Promise<string>((resolve) => {
			proc.OnStdoutDataAvailable.Add(() => {
				stdout += proc.ReadStdoutString();
			});
			proc.OnExit.Add(() => {
				resolve(stdout);
			});

			const opts = new UE.ChildProcessOptions();
			opts.Environment.Add('TEST_CHILD_VAR', 'custom-value-123');
			proc.Spawn('node', '-e "console.log(process.env.TEST_CHILD_VAR)"', opts);
		});

		expect(result).toContain('custom-value-123');
	});
});

describe('ChildProcess - Working Directory', () => {
	it('should respect WorkingDir option', async () => {
		const proc = new UE.ChildProcess();
		let stdout = '';

		const projectDir = UE.JsRunHelper.GetProjectDir();

		const result = await new Promise<string>((resolve) => {
			proc.OnStdoutDataAvailable.Add(() => {
				stdout += proc.ReadStdoutString();
			});
			proc.OnExit.Add(() => {
				resolve(stdout);
			});

			const opts = new UE.ChildProcessOptions();
			opts.WorkingDir = projectDir;
			proc.Spawn('node', '-e "console.log(process.cwd())"', opts);
		});

		// 输出的 cwd 应该包含项目路径（路径分隔符可能不同）
		const normalized = result.trim().replace(/\\/g, '/').toLowerCase();
		const expectedNormalized = projectDir.replace(/\\/g, '/').toLowerCase().replace(/\/$/, '');
		expect(normalized).toContain(expectedNormalized);
	});
});
