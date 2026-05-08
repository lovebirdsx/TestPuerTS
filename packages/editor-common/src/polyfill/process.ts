/**
 * PuerTS V8 prebuilt 不带全局 `process` 对象。许多 npm 包（如 immer 的 cjs entry）
 * 通过 `process.env.NODE_ENV` 切换 dev / prod 构建，导入时即引用 `process.env`。
 * 这里注入一个最小实现：仅保证 `process.env` 是一个对象，不抛出。
 */
export function installProcessPolyfill(): void {
	const g = globalThis as unknown as { process?: { env?: Record<string, string | undefined> } };
	if (!g.process) {
		g.process = { env: {} };
	} else if (!g.process.env) {
		g.process.env = {};
	}
}
