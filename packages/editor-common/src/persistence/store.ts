import { z, ZodError, type ZodType } from 'zod';
import { ueFileIO, type IFileIO } from './fileIO';
import { getCorruptBackupPath, getStoreFilePath } from './paths';
import { registerStore, unregisterStore } from './registry';

const NAME_PATTERN = /^[a-zA-Z0-9_-]+$/;

export type ChangeListener<T> = (state: Readonly<T>) => void;

export interface DefineStoreOptions {
	debounceMs?: number;
	fileIO?: IFileIO;
	resolveFilePath?: (name: string) => string;
	resolveCorruptPath?: (name: string, timestamp: number) => string;
}

function deepClone<T>(value: T): T {
	return JSON.parse(JSON.stringify(value)) as T;
}

function summarizeZodError(err: ZodError): string {
	return err.issues
		.slice(0, 5)
		.map((i) => `${i.path.join('.') || '<root>'}: ${i.message}`)
		.join('; ');
}

export class PersistenceStore<T> {
	private state!: T;
	private loadPromise: Promise<void> | undefined;
	private loaded = false;
	private dirty = false;
	private debounceTimer: ReturnType<typeof setTimeout> | undefined;
	private pendingFlush: Promise<void> | undefined;
	private listeners = new Set<ChangeListener<T>>();
	private disposed = false;

	private readonly debounceMs: number;
	private readonly io: IFileIO;
	private readonly filePath: () => string;
	private readonly corruptPath: (timestamp: number) => string;

	constructor(
		readonly name: string,
		private readonly schema: ZodType<T>,
		options: DefineStoreOptions = {},
	) {
		this.debounceMs = options.debounceMs ?? 200;
		this.io = options.fileIO ?? ueFileIO;
		const resolveFile = options.resolveFilePath ?? getStoreFilePath;
		const resolveCorrupt = options.resolveCorruptPath ?? getCorruptBackupPath;
		this.filePath = () => resolveFile(name);
		this.corruptPath = (ts: number) => resolveCorrupt(name, ts);
	}

	private parseDefaults(): T {
		const tryEmpty = this.schema.safeParse(undefined);
		if (tryEmpty.success) {
			return tryEmpty.data;
		}
		const tryEmptyObj = this.schema.safeParse({});
		if (tryEmptyObj.success) {
			return tryEmptyObj.data;
		}
		throw new Error(
			`Persistence store "${this.name}": schema does not provide complete defaults. ` +
				`Use z.object({...}).default({...}) or give every field a .default(). ` +
				`Errors: ${summarizeZodError(tryEmptyObj.error)}`,
		);
	}

	ready(): Promise<void> {
		if (!this.loadPromise) {
			this.loadPromise = this.load();
		}
		return this.loadPromise;
	}

	private async load(): Promise<void> {
		const path = this.filePath();
		let raw: string | undefined;
		try {
			raw = await this.io.readText(path);
		} catch (err) {
			console.warn(`[persistence:${this.name}] read failed, using defaults: ${(err as Error).message}`);
			this.state = this.parseDefaults();
			this.loaded = true;
			return;
		}

		if (raw === undefined || raw === '') {
			this.state = this.parseDefaults();
			this.loaded = true;
			return;
		}

		let parsed: unknown;
		try {
			parsed = JSON.parse(raw);
		} catch (err) {
			await this.handleCorrupt(raw, `JSON parse error: ${(err as Error).message}`);
			return;
		}

		const result = this.schema.safeParse(parsed);
		if (!result.success) {
			await this.handleCorrupt(raw, `schema validation: ${summarizeZodError(result.error)}`);
			return;
		}

		this.state = result.data;
		this.loaded = true;
	}

	private async handleCorrupt(originalText: string, reason: string): Promise<void> {
		const ts = Date.now();
		const backupPath = this.corruptPath(ts);
		console.warn(`[persistence:${this.name}] corrupt file (${reason}); backing up to ${backupPath}`);
		try {
			await this.io.writeText(backupPath, originalText);
		} catch (err) {
			console.warn(`[persistence:${this.name}] failed to write backup: ${(err as Error).message}`);
		}
		this.state = this.parseDefaults();
		this.loaded = true;
		this.markDirty();
	}

	private ensureLoadedSync(): void {
		if (!this.loaded) {
			throw new Error(
				`Persistence store "${this.name}" not loaded yet. ` +
					`Call await store.ready() before synchronous get/set/update.`,
			);
		}
	}

	get(): Readonly<T> {
		this.ensureLoadedSync();
		return deepClone(this.state) as Readonly<T>;
	}

	set(next: T): void {
		this.ensureLoadedSync();
		const result = this.schema.safeParse(next);
		if (!result.success) {
			throw new Error(`Persistence store "${this.name}" set rejected: ${summarizeZodError(result.error)}`);
		}
		this.state = result.data;
		this.markDirty();
		this.notify();
	}

	update(mutator: (draft: T) => void): void {
		this.ensureLoadedSync();
		const draft = deepClone(this.state);
		mutator(draft);
		this.set(draft);
	}

	reset(): void {
		this.state = this.parseDefaults();
		this.loaded = true;
		this.markDirty();
		this.notify();
	}

	onChange(listener: ChangeListener<T>): () => void {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}

	private notify(): void {
		const snapshot = deepClone(this.state) as Readonly<T>;
		for (const l of this.listeners) {
			try {
				l(snapshot);
			} catch (err) {
				console.error(`[persistence:${this.name}] listener error: ${(err as Error).message}`);
			}
		}
	}

	private markDirty(): void {
		if (this.disposed) return;
		this.dirty = true;
		if (this.debounceTimer) {
			clearTimeout(this.debounceTimer);
		}
		this.debounceTimer = setTimeout(() => {
			this.debounceTimer = undefined;
			void this.persist();
		}, this.debounceMs);
	}

	private async persist(): Promise<void> {
		if (!this.dirty) return;
		if (this.pendingFlush) {
			await this.pendingFlush;
			if (!this.dirty) return;
		}
		this.dirty = false;
		const stateAtWrite = deepClone(this.state);
		const result = this.schema.safeParse(stateAtWrite);
		if (!result.success) {
			console.error(
				`[persistence:${this.name}] state failed schema validation, skipping write: ${summarizeZodError(result.error)}`,
			);
			return;
		}
		const json = JSON.stringify(result.data, null, 2);
		const path = this.filePath();
		this.pendingFlush = (async () => {
			try {
				await this.io.writeText(path, json);
			} catch (err) {
				console.error(`[persistence:${this.name}] write failed: ${(err as Error).message}`);
				this.dirty = true;
			} finally {
				this.pendingFlush = undefined;
			}
		})();
		await this.pendingFlush;
	}

	async flush(): Promise<void> {
		if (this.debounceTimer) {
			clearTimeout(this.debounceTimer);
			this.debounceTimer = undefined;
		}
		if (this.pendingFlush) {
			await this.pendingFlush;
		}
		if (this.dirty) {
			await this.persist();
		}
	}

	dispose(): void {
		this.disposed = true;
		if (this.debounceTimer) {
			clearTimeout(this.debounceTimer);
			this.debounceTimer = undefined;
		}
		this.listeners.clear();
		unregisterStore(this.name, this);
	}
}

export function defineStore<S extends ZodType>(
	name: string,
	schema: S,
	options?: DefineStoreOptions,
): PersistenceStore<z.infer<S>> {
	if (!NAME_PATTERN.test(name)) {
		throw new Error(`Persistence store name "${name}" is invalid; must match ${NAME_PATTERN}`);
	}
	const store = new PersistenceStore<z.infer<S>>(name, schema as unknown as ZodType<z.infer<S>>, options);
	registerStore(name, store);
	void store.ready();
	return store;
}
