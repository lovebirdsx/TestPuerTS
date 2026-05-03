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

export async function flushAllPersistence(): Promise<void> {
	const all = Array.from(stores);
	await Promise.all(all.map((s) => s.flush()));
}

export function __resetRegistryForTests(): void {
	stores.clear();
	names.clear();
}
