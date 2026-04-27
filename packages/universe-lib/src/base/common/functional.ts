export function once<T extends () => unknown>(fn: T): T {
	let didCall = false;
	let result: unknown;

	return function wrap() {
		if (didCall) {
			return result;
		}

		didCall = true;
		result = fn();
		return result;
	} as unknown as T;
}
