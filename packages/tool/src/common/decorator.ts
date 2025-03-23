/**
 * 装饰器，可以缓存无参数方法的返回值
 */
export function memoize(_target: unknown, _propertyName: string, descriptor: PropertyDescriptor) {
	const method = descriptor.value;
	let isCached = false;
	let result: unknown;

	descriptor.value = function wrap() {
		if (!isCached) {
			result = method.apply(this);
			isCached = true;
		}
		return result;
	};
}
