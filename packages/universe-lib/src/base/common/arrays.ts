export function getRandomElement<T>(arr: T[]): T | undefined {
	return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * When comparing two values,
 * a negative number indicates that the first value is less than the second,
 * a positive number indicates that the first value is greater than the second,
 * and zero indicates that neither is the case.
 */
export type CompareResult = number;

export namespace CompareResult {
	export function isLessThan(result: CompareResult): boolean {
		return result < 0;
	}

	export function isLessThanOrEqual(result: CompareResult): boolean {
		return result <= 0;
	}

	export function isGreaterThan(result: CompareResult): boolean {
		return result > 0;
	}

	export function isNeitherLessOrGreaterThan(result: CompareResult): boolean {
		return result === 0;
	}

	export const greaterThan = 1;
	export const lessThan = -1;
	export const neitherLessOrGreaterThan = 0;
}

/**
 * A comparator `c` defines a total order `<=` on `T` as following:
 * `c(a, b) <= 0` iff `a` <= `b`.
 * We also have `c(a, b) == 0` iff `c(b, a) == 0`.
 */
export type Comparator<T> = (a: T, b: T) => CompareResult;

export function compareBy<TItem, TCompareBy>(selector: (item: TItem) => TCompareBy, comparator: Comparator<TCompareBy>): Comparator<TItem> {
	return (a, b) => comparator(selector(a), selector(b));
}

/**
 * The natural order on numbers.
 */
export const numberComparator: Comparator<number> = (a, b) => a - b;

export const booleanComparator: Comparator<boolean> = (a, b) => numberComparator(a ? 1 : 0, b ? 1 : 0);

export function reverseOrder<TItem>(comparator: Comparator<TItem>): Comparator<TItem> {
	return (a, b) => -comparator(a, b);
}

/**
 * @returns New array with all falsy values removed. The original array IS NOT modified.
 */
export function coalesce<T>(array: readonly (T | undefined | null)[]): T[] {
	return <T[]>array.filter((e) => !!e);
}

/**
 * 解析数组中的id字段，返回前缀和最大的后缀值
 *
 * * 函数只会解析数组中的前count个元素
 * * 算法首先会取最后一个元素的id值，算出id的前缀和初始的后缀值
 * * 然后从第一个元素开始，如果id的形式和最后一个元素一样，且后缀值更大，则会更新最大的后缀值
 *
 * @param array 需要解析的数组
 * @param count 解析的元素个数
 * @returns 返回前缀和最大的后缀值
 */
export function parseArrayMaxIdAndPrefx<T extends { id?: string }>(array: T[], count: number): { prefix: string; maxSuffix: number } {
	if (array.length === 0 || count === 0) {
		return { prefix: 'id', maxSuffix: 0 };
	}

	const lastElement = array[count - 1];
	const lastId = lastElement.id;
	if (!lastId) {
		return { prefix: 'id', maxSuffix: 0 };
	}

	const match = lastId.match(/^(.*?)(\d+)$/);
	if (!match) {
		return { prefix: lastId, maxSuffix: 0 };
	}

	const prefix = match[1];
	let maxSuffix = parseInt(match[2], 10);

	for (let i = 0; i < count - 1; i++) {
		const element = array[i];
		const id = element.id;
		if (!id || !id.startsWith(prefix)) {
			continue;
		}

		const suffix = parseInt(id.substring(prefix.length), 10);
		if (isNaN(suffix)) {
			continue;
		}

		if (suffix > maxSuffix) {
			maxSuffix = suffix;
		}
	}

	return { prefix, maxSuffix };
}

/**
 * 对于新增的元素，如果元素是一个object，且object中有id字段，则要确保id字段是唯一的
 *
 * @param value 数组的值
 * @param startIndex 新增元素的起始索引
 *
 * * 先根据已有的id字段，找到最大的id值，和id字段的前缀
 * * 从startIndex开始，依此设定id为前缀+最大id值+1
 */
export function updateIdInArray(value: unknown[], startIndex: number): void {
	const element0 = value[0];
	if (typeof element0 !== 'object' || !element0) {
		return;
	}

	if (!('id' in element0)) {
		return;
	}

	const { prefix, maxSuffix } = parseArrayMaxIdAndPrefx(value as { id: string }[], startIndex);
	for (let i = startIndex; i < value.length; i++) {
		const element = value[i];
		if (typeof element !== 'object' || !element) {
			continue;
		}

		if (!('id' in element)) {
			continue;
		}

		element.id = `${prefix}${maxSuffix + i - startIndex + 1}`;
	}
}
