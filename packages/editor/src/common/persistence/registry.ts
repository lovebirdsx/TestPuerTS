// 解耦合：用最小接口而非具体 PersistenceStore 类型，避免循环依赖
interface FlushableStore {
	flush(): Promise<void>;
}

const stores = new Set<FlushableStore>();
const names = new Set<string>();

export function registerStore(name: string, store: FlushableStore): void {
	if (names.has(name)) {
		throw new Error(`Persistence store "${name}" is already defined`);
	}
	names.add(name);
	stores.add(store);
}

export function unregisterStore(name: string, store: FlushableStore): void {
	names.delete(name);
	stores.delete(store);
}

// 等待所有 store 完成挂起的写入。退出钩子调用。
export async function flushAllPersistence(): Promise<void> {
	const all = Array.from(stores);
	await Promise.all(all.map((s) => s.flush()));
}

// 仅供测试使用：清空注册表
export function __resetRegistryForTests(): void {
	stores.clear();
	names.clear();
}
