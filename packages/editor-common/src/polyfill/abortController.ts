/**
 * AbortController / AbortSignal 最小 polyfill。
 *
 * PuerTS V8 模式下全局缺失 `AbortController` —— Node.js 版本本来内置在全局，
 * V8 prebuilt 没有，第三方库（典型如 @modelcontextprotocol/sdk 的 Protocol.connect）
 * 在请求路径上 `new AbortController()`，会触发 ReferenceError 进而把 initialize
 * 链路卡死，最终命中 SDK 默认 60s 请求超时。
 *
 * 这里实现的子集足够 MCP SDK / fetch 等常见库走通：
 * - `signal.aborted` / `signal.reason`
 * - `signal.addEventListener('abort', cb)` / `removeEventListener` / `dispatchEvent`
 * - `signal.throwIfAborted()`
 * - `controller.abort(reason?)`
 * - `AbortSignal.timeout(ms)` / `AbortSignal.abort(reason?)`
 *
 * 不实现：DOM Event 链、`onabort` setter 的所有边角语义。
 */

let installed = false;

export function installAbortControllerPolyfill(): void {
	if (installed) return;
	installed = true;

	const g = globalThis as unknown as {
		AbortController?: unknown;
		AbortSignal?: unknown;
	};

	if (typeof g.AbortController !== 'undefined' && typeof g.AbortSignal !== 'undefined') {
		return;
	}

	type Listener = (event: { type: 'abort' }) => void;

	class AbortSignalPolyfill {
		aborted = false;
		reason: unknown = undefined;
		onabort: Listener | null = null;
		private listeners = new Set<Listener>();

		addEventListener(type: string, listener: Listener): void {
			if (type !== 'abort' || typeof listener !== 'function') return;
			this.listeners.add(listener);
		}

		removeEventListener(type: string, listener: Listener): void {
			if (type !== 'abort') return;
			this.listeners.delete(listener);
		}

		dispatchEvent(event: { type: string }): boolean {
			if (event.type !== 'abort') return true;
			for (const l of this.listeners) {
				try {
					l({ type: 'abort' });
				} catch {
					// ignore
				}
			}
			if (typeof this.onabort === 'function') {
				try {
					this.onabort({ type: 'abort' });
				} catch {
					// ignore
				}
			}
			return true;
		}

		throwIfAborted(): void {
			if (this.aborted) {
				throw this.reason instanceof Error
					? this.reason
					: new AbortErrorPolyfill(String(this.reason ?? 'aborted'));
			}
		}

		_doAbort(reason?: any): void {
			if (this.aborted) return;
			this.aborted = true;
			this.reason = reason !== undefined ? reason : new AbortErrorPolyfill('The operation was aborted.');
			this.dispatchEvent({ type: 'abort' });
			this.listeners.clear();
			this.onabort = null;
		}

		static abort(reason?: unknown): AbortSignalPolyfill {
			const s = new AbortSignalPolyfill();
			s._doAbort(reason);
			return s;
		}

		static timeout(ms: number): AbortSignalPolyfill {
			const s = new AbortSignalPolyfill();
			setTimeout(() => s._doAbort(new AbortErrorPolyfill('timeout')), ms);
			return s;
		}
	}

	class AbortErrorPolyfill extends Error {
		constructor(message: string) {
			super(message);
			this.name = 'AbortError';
		}
	}

	class AbortControllerPolyfill {
		signal: AbortSignalPolyfill;

		constructor() {
			this.signal = new AbortSignalPolyfill();
		}

		abort(reason?: unknown): void {
			this.signal._doAbort(reason);
		}
	}

	if (typeof g.AbortSignal === 'undefined') {
		g.AbortSignal = AbortSignalPolyfill;
	}
	if (typeof g.AbortController === 'undefined') {
		g.AbortController = AbortControllerPolyfill;
	}
}
