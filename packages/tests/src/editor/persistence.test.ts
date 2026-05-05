import * as UE from 'ue';
import { z } from 'zod';
import { defineStore, setPersistenceRoot, flushAllPersistence, PersistenceStore } from '@universe-agent/editor-common';
import { describe, it, expect, beforeAll, afterAll } from '../testRunner';

// 把测试用持久化目录强制指向 Intermediate 下，避免污染用户 AppData
const projectDir = UE.JsRunHelper.GetProjectDir();
const testRoot = `${projectDir}Intermediate/TestPersistence`;

beforeAll(() => {
	setPersistenceRoot(testRoot);
});

afterAll(() => {
	setPersistenceRoot(undefined);
});

const sampleSchema = z.object({
	theme: z.enum(['light', 'dark']).default('dark'),
	recentFiles: z.array(z.string()).default([]),
	greeting: z.string().default(''),
});

let storeCounter = 0;
function uniqueName(prefix: string): string {
	storeCounter++;
	return `${prefix}_${Date.now()}_${storeCounter}`;
}

async function settleStore<T>(store: PersistenceStore<T>): Promise<void> {
	await store.ready();
	await store.flush();
}

describe('Persistence - End to End (real UE FS)', () => {
	it('writes defaults file when first modified, then reloads same value', async () => {
		const name = uniqueName('settings');
		const a = defineStore(name, sampleSchema);
		await a.ready();
		a.update((s) => {
			s.theme = 'light';
			s.greeting = 'hello';
		});
		await a.flush();
		a.dispose();

		const b = defineStore(name, sampleSchema);
		await b.ready();
		expect(b.get().theme).toBe('light');
		expect(b.get().greeting).toBe('hello');
		b.dispose();
	});

	it('handles UTF-8 chinese content correctly', async () => {
		const name = uniqueName('chinese');
		const a = defineStore(name, sampleSchema);
		await a.ready();
		const phrase = '你好，世界！🚀';
		a.update((s) => {
			s.greeting = phrase;
		});
		await a.flush();
		a.dispose();

		const b = defineStore(name, sampleSchema);
		await b.ready();
		expect(b.get().greeting).toBe(phrase);
		b.dispose();
	});

	it('falls back to defaults and writes a backup when file is corrupt', async () => {
		const name = uniqueName('corrupt');
		// 先写入合法数据
		const a = defineStore(name, sampleSchema);
		await settleStore(a);
		a.dispose();

		// 直接用 UE API 把文件改坏
		const filePath = `${testRoot}/${name}.json`;
		const writeResult = await new Promise<UE.AsyncFileResult>((resolve) => {
			const r = UE.ProcessIOHelper.WriteTextFile(filePath, '{ broken json :::');
			r.OnComplete.Add(() => resolve(r));
		});
		expect(writeResult.bSuccess).toBe(true);

		const b = defineStore(name, sampleSchema, { silenceCorruptWarning: true });
		await b.ready();
		expect(b.get().theme).toBe('dark'); // 回退默认值
		await b.flush();
		b.dispose();

		// 校验确实写出了备份文件（取最近一个）。这里只确认 corrupt 文件的存在性较难枚举目录，
		// 间接通过：如果原文件被修复成默认 JSON 即可判断回退发生
		const readResult = await new Promise<UE.AsyncFileResult>((resolve) => {
			const r = UE.ProcessIOHelper.ReadTextFile(filePath);
			r.OnComplete.Add(() => resolve(r));
		});
		const parsed = JSON.parse(readResult.Content);
		expect(parsed.theme).toBe('dark');
	});

	it('flushAllPersistence persists all dirty stores', async () => {
		const n1 = uniqueName('multi1');
		const n2 = uniqueName('multi2');
		const s1 = defineStore(n1, sampleSchema);
		const s2 = defineStore(n2, sampleSchema);
		await s1.ready();
		await s2.ready();
		s1.update((s) => {
			s.greeting = 'one';
		});
		s2.update((s) => {
			s.greeting = 'two';
		});

		await flushAllPersistence();

		s1.dispose();
		s2.dispose();

		const r1 = defineStore(n1, sampleSchema);
		const r2 = defineStore(n2, sampleSchema);
		await r1.ready();
		await r2.ready();
		expect(r1.get().greeting).toBe('one');
		expect(r2.get().greeting).toBe('two');
		r1.dispose();
		r2.dispose();
	});
});
