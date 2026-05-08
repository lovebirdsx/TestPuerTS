import { getPersistenceRoot, ueFileIO } from '@universe-agent/editor-common';
import type { StateStorage } from 'zustand/middleware';

function resolvePath(name: string): string {
	return `${getPersistenceRoot()}/${name}.json`;
}

/**
 * zustand persist 适配 ueFileIO。
 * - getItem 返回 null 表示文件不存在（zustand 视为首次启动）
 * - setItem 写盘前先确保根目录存在；调用方负责 await（zustand persist 内部按需 await）
 */
export const ueStorage: StateStorage = {
	async getItem(name: string): Promise<string | null> {
		const text = await ueFileIO.readText(resolvePath(name));
		return text === undefined ? null : text;
	},
	async setItem(name: string, value: string): Promise<void> {
		await ueFileIO.makeDirTree(getPersistenceRoot());
		await ueFileIO.writeText(resolvePath(name), value);
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
