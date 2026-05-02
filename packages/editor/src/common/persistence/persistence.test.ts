import { describe, it, expect, beforeEach } from 'vitest';
import { z } from 'zod';
import { defineStore, type IFileIO } from './index';
import { __resetRegistryForTests } from './registry';

// 内存文件系统，便于测试持久化行为
class MemoryFS implements IFileIO {
	files = new Map<string, string>();
	writeCount = 0;

	async readText(filePath: string): Promise<string | undefined> {
		return this.files.get(filePath);
	}
	async writeText(filePath: string, content: string): Promise<void> {
		this.writeCount++;
		this.files.set(filePath, content);
	}
	async fileExists(filePath: string): Promise<boolean> {
		return this.files.has(filePath);
	}
	async makeDirTree(): Promise<void> {
		// no-op
	}
}

function makeOptions(fs: MemoryFS, _name: string, debounceMs = 10) {
	return {
		debounceMs,
		fileIO: fs,
		resolveFilePath: (n: string) => `mem://${n}.json`,
		resolveCorruptPath: (n: string, ts: number) => `mem://${n}.corrupt-${ts}.json`,
	};
}

const settingsSchema = z.object({
	theme: z.enum(['light', 'dark']).default('dark'),
	recentFiles: z.array(z.string()).default([]),
});

beforeEach(() => {
	__resetRegistryForTests();
});

describe('PersistenceStore', () => {
	it('loads defaults when file does not exist', async () => {
		const fs = new MemoryFS();
		const store = defineStore('settings', settingsSchema, makeOptions(fs, 'settings'));
		await store.ready();
		expect(store.get()).toEqual({ theme: 'dark', recentFiles: [] });
		expect(fs.writeCount).toBe(0); // 不应主动写盘
	});

	it('loads existing data from file', async () => {
		const fs = new MemoryFS();
		fs.files.set('mem://settings.json', JSON.stringify({ theme: 'light', recentFiles: ['a.ts'] }));
		const store = defineStore('settings', settingsSchema, makeOptions(fs, 'settings'));
		await store.ready();
		expect(store.get()).toEqual({ theme: 'light', recentFiles: ['a.ts'] });
	});

	it('debounces writes and persists state', async () => {
		const fs = new MemoryFS();
		const store = defineStore('settings', settingsSchema, makeOptions(fs, 'settings', 20));
		await store.ready();

		store.update((s) => {
			s.theme = 'light';
		});
		store.update((s) => {
			s.recentFiles.push('a.ts');
		});
		store.update((s) => {
			s.recentFiles.push('b.ts');
		});

		expect(fs.writeCount).toBe(0); // 仍在防抖窗口内
		await store.flush();
		expect(fs.writeCount).toBe(1); // 三次修改合并为一次写入
		const written = JSON.parse(fs.files.get('mem://settings.json')!);
		expect(written).toEqual({ theme: 'light', recentFiles: ['a.ts', 'b.ts'] });
	});

	it('flush forces immediate write', async () => {
		const fs = new MemoryFS();
		const store = defineStore('settings', settingsSchema, makeOptions(fs, 'settings', 5000));
		await store.ready();
		store.update((s) => {
			s.theme = 'light';
		});
		await store.flush();
		expect(fs.writeCount).toBe(1);
	});

	it('falls back to defaults and backs up when JSON is corrupt', async () => {
		const fs = new MemoryFS();
		fs.files.set('mem://settings.json', 'not valid json {{{');
		const store = defineStore('settings', settingsSchema, makeOptions(fs, 'settings', 5));
		await store.ready();
		expect(store.get()).toEqual({ theme: 'dark', recentFiles: [] });

		// 应当生成一个 corrupt 备份文件
		const backupKeys = [...fs.files.keys()].filter((k) => k.startsWith('mem://settings.corrupt-'));
		expect(backupKeys).toHaveLength(1);
		expect(fs.files.get(backupKeys[0])).toBe('not valid json {{{');

		// 同时 markDirty 触发一次默认值覆盖原文件
		await store.flush();
		expect(fs.files.get('mem://settings.json')).toBe(JSON.stringify({ theme: 'dark', recentFiles: [] }, null, 2));
	});

	it('falls back to defaults and backs up when schema validation fails', async () => {
		const fs = new MemoryFS();
		fs.files.set('mem://settings.json', JSON.stringify({ theme: 'pink', recentFiles: 'oops' }));
		const store = defineStore('settings', settingsSchema, makeOptions(fs, 'settings', 5));
		await store.ready();
		expect(store.get()).toEqual({ theme: 'dark', recentFiles: [] });
		const backupKeys = [...fs.files.keys()].filter((k) => k.startsWith('mem://settings.corrupt-'));
		expect(backupKeys).toHaveLength(1);
	});

	it('rejects set() that violates schema without changing state', async () => {
		const fs = new MemoryFS();
		const store = defineStore('settings', settingsSchema, makeOptions(fs, 'settings'));
		await store.ready();
		expect(() => store.set({ theme: 'pink' as 'dark', recentFiles: [] })).toThrow();
		expect(store.get()).toEqual({ theme: 'dark', recentFiles: [] });
	});

	it('notifies subscribers on changes and supports unsubscribe', async () => {
		const fs = new MemoryFS();
		const store = defineStore('settings', settingsSchema, makeOptions(fs, 'settings'));
		await store.ready();

		const states: { theme: string }[] = [];
		const off = store.onChange((s) => {
			states.push({ theme: s.theme });
		});

		store.update((s) => {
			s.theme = 'light';
		});
		off();
		store.update((s) => {
			s.theme = 'dark';
		});

		expect(states).toEqual([{ theme: 'light' }]);
	});

	it('reset() returns state to defaults and triggers write', async () => {
		const fs = new MemoryFS();
		fs.files.set('mem://settings.json', JSON.stringify({ theme: 'light', recentFiles: ['x'] }));
		const store = defineStore('settings', settingsSchema, makeOptions(fs, 'settings', 5));
		await store.ready();
		store.reset();
		expect(store.get()).toEqual({ theme: 'dark', recentFiles: [] });
		await store.flush();
		expect(JSON.parse(fs.files.get('mem://settings.json')!)).toEqual({ theme: 'dark', recentFiles: [] });
	});

	it('throws on duplicate defineStore with same name', () => {
		const fs = new MemoryFS();
		defineStore('dup', settingsSchema, makeOptions(fs, 'dup'));
		expect(() => defineStore('dup', settingsSchema, makeOptions(fs, 'dup'))).toThrow();
	});

	it('rejects invalid store names', () => {
		const fs = new MemoryFS();
		expect(() => defineStore('has space', settingsSchema, makeOptions(fs, 'has space'))).toThrow();
		expect(() => defineStore('a/b', settingsSchema, makeOptions(fs, 'a/b'))).toThrow();
	});

	it('get() returns a deep clone (mutation does not affect state)', async () => {
		const fs = new MemoryFS();
		const store = defineStore('settings', settingsSchema, makeOptions(fs, 'settings'));
		await store.ready();
		const snap = store.get() as { recentFiles: string[] };
		snap.recentFiles.push('mutate');
		expect(store.get().recentFiles).toEqual([]);
	});

	it('throws clear error when schema lacks defaults', async () => {
		const fs = new MemoryFS();
		const noDefault = z.object({ x: z.number() });
		const store = defineStore('nodef', noDefault, makeOptions(fs, 'nodef'));
		await expect(store.ready()).rejects.toThrow(/does not provide complete defaults/);
	});
});
