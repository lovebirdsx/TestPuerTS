import * as UE from 'ue';
import { describe, it, expect, beforeEach, afterEach } from '../testRunner';
import { McpManager, parseMcpServersConfig, DEFAULT_MCP_CONFIG } from '@universe-agent/acp-client-ue';
import { withTimeout } from './__fixtures__/withTimeout';

const projectDir = UE.JsRunHelper.GetProjectDir();
const tmpDir = `${projectDir}Intermediate/TestMcpManager`;
const fakeBridge = `${projectDir}Intermediate/fake-bridge.js`;

let cfgCounter = 0;
function tempConfigPath(): string {
	return `${tmpDir}/cfg_${Date.now()}_${cfgCounter++}.json`;
}

async function writeConfig(content: string): Promise<string> {
	const path = tempConfigPath();
	await new Promise<void>((resolve) => {
		const r = UE.ProcessIOHelper.WriteTextFile(path, content);
		r.OnComplete.Add(() => resolve());
	});
	return path;
}

describe('parseMcpServersConfig (pure)', () => {
	it('returns DEFAULT_MCP_CONFIG with warning on JSON parse error', () => {
		const r = parseMcpServersConfig('not-json');
		expect(r.config.enabled).toBe(true);
		expect(r.warning).toBeTruthy();
		expect(r.warning!.includes('parse error')).toBe(true);
	});

	it('returns DEFAULT_MCP_CONFIG with warning on schema mismatch', () => {
		const r = parseMcpServersConfig('{"enabled":"yes"}');
		expect(r.warning).toBeTruthy();
		expect(r.warning!.includes('schema invalid')).toBe(true);
	});

	it('parses minimal config and applies defaults', () => {
		const r = parseMcpServersConfig('{}');
		expect(r.warning).toBeUndefined();
		expect(r.config.enabled).toBe(true);
		expect(r.config.builtin.ueEditor.enabled).toBe(true);
		expect(Object.keys(r.config.external).length).toBe(0);
	});

	it('preserves external entries verbatim', () => {
		const json = JSON.stringify({
			enabled: true,
			external: {
				fs: { command: 'npx', args: ['-y', 'pkg'], env: { K: 'V' } },
			},
		});
		const r = parseMcpServersConfig(json);
		expect(r.config.external.fs!.command).toBe('npx');
		expect(r.config.external.fs!.args).toEqual(['-y', 'pkg']);
		expect(r.config.external.fs!.env!.K).toBe('V');
	});
});

describe('McpManager - loadConfig', () => {
	let manager: McpManager | null = null;
	afterEach(() => {
		manager?.dispose();
		manager = null;
	});

	it('returns DEFAULT_MCP_CONFIG when file missing (no warning)', async () => {
		manager = new McpManager({
			configPath: `${tmpDir}/never_exists_${Date.now()}.json`,
			bridgeEntry: fakeBridge,
		});
		const r = await withTimeout(manager.loadConfig(), 2000);
		expect(r.config).toBe(DEFAULT_MCP_CONFIG);
		expect(r.warning).toBeUndefined();
	});

	it('caches config across calls; force=true reloads', async () => {
		const path = await writeConfig('{"enabled":true}');
		manager = new McpManager({ configPath: path, bridgeEntry: fakeBridge });

		const first = await withTimeout(manager.loadConfig(), 2000);
		// 改文件
		await new Promise<void>((resolve) => {
			const r = UE.ProcessIOHelper.WriteTextFile(path, '{"enabled":false}');
			r.OnComplete.Add(() => resolve());
		});

		const cachedAgain = await withTimeout(manager.loadConfig(), 2000);
		expect(cachedAgain.config).toBe(first.config); // 命中缓存

		const reloaded = await withTimeout(manager.loadConfig(true), 2000);
		expect(reloaded.config.enabled).toBe(false);
	});

	it('parse error surfaces as warning, falls back to defaults', async () => {
		const path = await writeConfig('not-json-at-all');
		manager = new McpManager({ configPath: path, bridgeEntry: fakeBridge });
		const r = await withTimeout(manager.loadConfig(), 2000);
		expect(r.warning).toBeTruthy();
		expect(r.config.enabled).toBe(true);
	});
});

describe('McpManager - buildSessionMcpList', () => {
	let manager: McpManager | null = null;
	afterEach(() => {
		manager?.dispose();
		manager = null;
	});

	it('disabled config returns empty servers', async () => {
		const path = await writeConfig('{"enabled":false}');
		manager = new McpManager({ configPath: path, bridgeEntry: fakeBridge });
		const r = await withTimeout(manager.buildSessionMcpList('s1'), 2000);
		expect(r.servers.length).toBe(0);
		expect(r.warnings.length).toBe(0);
		expect(manager.hasSession('s1')).toBe(false);
	});

	it('builtin only: returns single ue-editor entry with bridge args', async () => {
		const path = await writeConfig('{"enabled":true}');
		manager = new McpManager({ configPath: path, bridgeEntry: fakeBridge });
		const r = await withTimeout(manager.buildSessionMcpList('s2'), 3000);

		expect(r.servers.length).toBe(1);
		const entry = r.servers[0]!;
		expect(entry.name).toBe('ue-editor');
		expect(entry.command).toBe('node');
		expect(entry.args![0]).toBe(fakeBridge);
		expect(entry.args![1]).toBe('--pipe');
		expect(entry.args![2]!.startsWith('\\\\.\\pipe\\ue-mcp-')).toBe(true);

		expect(manager.hasSession('s2')).toBe(true);
	});

	it('builtin disabled: only external entries returned', async () => {
		const json = JSON.stringify({
			enabled: true,
			builtin: { ueEditor: { enabled: false } },
			external: {
				fs: { command: 'npx', args: ['-y', 'pkg'] },
			},
		});
		const path = await writeConfig(json);
		manager = new McpManager({ configPath: path, bridgeEntry: fakeBridge });
		const r = await withTimeout(manager.buildSessionMcpList('s3'), 2000);

		expect(r.servers.length).toBe(1);
		expect(r.servers[0]!.name).toBe('fs');
		expect(r.servers[0]!.command).toBe('npx');
		expect(manager.hasSession('s3')).toBe(false);
	});

	it('orders builtin first, externals follow Object.entries order', async () => {
		const json = JSON.stringify({
			enabled: true,
			external: {
				alpha: { command: 'a' },
				beta: { command: 'b' },
			},
		});
		const path = await writeConfig(json);
		manager = new McpManager({ configPath: path, bridgeEntry: fakeBridge });
		const r = await withTimeout(manager.buildSessionMcpList('s4'), 3000);

		expect(r.servers.length).toBe(3);
		expect(r.servers[0]!.name).toBe('ue-editor');
		expect(r.servers[1]!.name).toBe('alpha');
		expect(r.servers[2]!.name).toBe('beta');
	});

	it('external env: record → {name,value}[] conversion', async () => {
		const json = JSON.stringify({
			enabled: true,
			builtin: { ueEditor: { enabled: false } },
			external: {
				fs: { command: 'npx', env: { FOO: 'bar', BAZ: 'qux' } },
			},
		});
		const path = await writeConfig(json);
		manager = new McpManager({ configPath: path, bridgeEntry: fakeBridge });
		const r = await withTimeout(manager.buildSessionMcpList('s5'), 2000);

		const env = r.servers[0]!.env!;
		expect(env.length).toBe(2);
		const map = new Map(env.map((e) => [e.name, e.value]));
		expect(map.get('FOO')).toBe('bar');
		expect(map.get('BAZ')).toBe('qux');
	});

	it('schema warning is propagated through warnings[]', async () => {
		const path = await writeConfig('{"enabled":"oops"}');
		manager = new McpManager({ configPath: path, bridgeEntry: fakeBridge });
		const r = await withTimeout(manager.buildSessionMcpList('s6'), 3000);
		expect(r.warnings.length).toBe(1);
		expect(r.warnings[0]!.includes('schema invalid')).toBe(true);
	});
});

describe('McpManager - session lifecycle', () => {
	let manager: McpManager | null = null;
	beforeEach(async () => {
		const path = await writeConfig('{"enabled":true}');
		manager = new McpManager({ configPath: path, bridgeEntry: fakeBridge });
	});
	afterEach(() => {
		manager?.dispose();
		manager = null;
	});

	it('startSession creates handle; same id repeated stops previous one', () => {
		const e1 = manager!.startSession('dup');
		expect(manager!.hasSession('dup')).toBe(true);

		const e2 = manager!.startSession('dup');
		expect(manager!.hasSession('dup')).toBe(true);
		// 两次 args 中的 pipe 名应不同（因 nonce）
		expect(e1.args![2]).not.toBe(e2.args![2]);
	});

	it('stopSession releases handle', () => {
		manager!.startSession('to-stop');
		expect(manager!.hasSession('to-stop')).toBe(true);
		manager!.stopSession('to-stop');
		expect(manager!.hasSession('to-stop')).toBe(false);
	});

	it('stopSession on unknown id is a no-op', () => {
		manager!.stopSession('never-existed');
	});

	it('dispose stops all sessions', () => {
		manager!.startSession('a');
		manager!.startSession('b');
		expect(manager!.hasSession('a')).toBe(true);
		expect(manager!.hasSession('b')).toBe(true);
		manager!.dispose();
		expect(manager!.hasSession('a')).toBe(false);
		expect(manager!.hasSession('b')).toBe(false);
	});
});
