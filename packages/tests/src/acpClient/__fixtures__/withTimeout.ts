/**
 * 给任意 Promise 套超时，防止单测挂死把 commandlet 拖到全局超时。
 * 默认 2s 足以覆盖内存通道的所有 await。
 */
export function withTimeout<T>(promise: Promise<T>, ms = 2000, label = 'operation'): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		const timer = setTimeout(() => {
			reject(new Error(`Timeout (${ms}ms) waiting for ${label}`));
		}, ms);
		promise.then(
			(v) => {
				clearTimeout(timer);
				resolve(v);
			},
			(err) => {
				clearTimeout(timer);
				reject(err);
			},
		);
	});
}

/** 等待 N 个 microtask 周期排空，让同步 dispatch 与 then 回调跑完。 */
export async function flushMicrotasks(times = 3): Promise<void> {
	for (let i = 0; i < times; i++) {
		await Promise.resolve();
	}
}
