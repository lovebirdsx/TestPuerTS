import { createLogger, getPersistenceRoot, ueFileIO } from '@universe-agent/editor-common';
import type { StateStorage } from 'zustand/middleware';

const logger = createLogger('editor:acp-panel:storage');

function resolvePath(name: string): string {
	return `${getPersistenceRoot()}/${name}.json`;
}

// 按 key 序列化写入：zustand persist 每次状态变化都调用 setItem（void 模式），
// 多次并发写同一文件会因 Windows 文件锁导致后续写失败；用链式 Promise 确保顺序执行。
const writeQueues = new Map<string, Promise<void>>();

/**
 * zustand persist 适配 ueFileIO。
 * - getItem 返回 null 表示文件不存在（zustand 视为首次启动）
 * - setItem 序列化对同一文件的并发写入，写失败只记日志不上抛
 */
export const ueStorage: StateStorage = {
	async getItem(name: string): Promise<string | null> {
		const text = await ueFileIO.readText(resolvePath(name));
		return text === undefined ? null : text;
	},
	setItem(name: string, value: string): Promise<void> {
		const prev = writeQueues.get(name) ?? Promise.resolve();
		const curr = prev
			.then(async () => {
				await ueFileIO.makeDirTree(getPersistenceRoot());
				await ueFileIO.writeText(resolvePath(name), value);
			})
			.catch((err: unknown) => {
				const msg = err instanceof Error ? err.message : String(err);
				logger.warn(`setItem "${name}" failed: ${msg}`);
			});
		writeQueues.set(name, curr);
		return curr;
	},
	async removeItem(): Promise<void> {
		// 编辑器场景没有"删除配置"语义；空实现即可。
	},
};

/** 测试用：返回一个 in-memory storage（Map 后端）。 */
export function createMemoryStorage(): StateStorage & { snapshot: () => Map<string, string> } {
	const map = new Map<string, string>();
	return {
		getItem(name) {
			return map.has(name) ? (map.get(name) as string) : null;
		},
		setItem(name, value) {
			map.set(name, value);
		},
		removeItem(name) {
			map.delete(name);
		},
		snapshot: () => new Map(map),
	};
}
