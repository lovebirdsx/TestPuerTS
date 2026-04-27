import { isArray, IVsPlayObjectBase, TObject } from './types';

export function getValueByJsonPath(obj: any, jsonPath: string[]): any {
	let value: any = obj;
	for (const p of jsonPath) {
		value = value[p];
	}

	return value;
}

export function setValueByJsonPath(obj: any, jsonPath: string[], value: any): void {
	if (jsonPath.length === 0) {
		Object.keys(obj).forEach((key) => delete obj[key]);
		Object.assign(obj, value);
		return;
	}

	let target: any = obj;
	for (let i = 0; i < jsonPath.length - 1; i++) {
		target = target[jsonPath[i]];
	}

	target[jsonPath[jsonPath.length - 1]] = value;
}

export function deleteFieldsByJsonPath(obj: any, jsonPath: string[], fields: string[]): void {
	const target = getValueByJsonPath(obj, jsonPath);
	for (const field of fields) {
		delete target[field];
	}
}

export function addFieldsByJsonPath(obj: any, jsonPath: string[], field: keyof any, value: any): void {
	const target = getValueByJsonPath(obj, jsonPath);
	target[field] = value;
}

export function jsonPathToString(jsonPath: string[]): string {
	return jsonPath.join('.');
}

export function stringToJsonPath(str: string): string[] {
	return str.split('.');
}

export function addFieldToJsonPathString(jsonPath: string, field: string): string {
	if (!jsonPath) {
		return field;
	}

	return `${jsonPath}.${field}`;
}

export interface IJsonModifyByPath {
	jsonPath: string[];
	value: unknown;
	propertyIndex?: number;
}

export interface IModifyInObject {
	modifies: IJsonModifyByPath[];
}

export interface IDeleteObjectEdit {
	type: 'delete';
}

export interface ICreateObjectEdit<T extends TObject = TObject> {
	type: 'create';
	object: T;
}

export interface ISetObjectEdit<T extends TObject = TObject> {
	type: 'set';
	object: T;
}

export interface IModifyObjectEdit extends IModifyInObject {
	type: 'modify';
}

export type JsonEditInObject<T extends TObject = TObject> = IDeleteObjectEdit | ICreateObjectEdit<T> | IModifyObjectEdit | ISetObjectEdit<T>;

export interface WorkspaceJsonEdit<T extends TObject = IVsPlayObjectBase> {
	// key => uri.path;
	records: Record<string, JsonEditInObject<T>>;
}

/**
 * 按照 base 的属性顺序排列 obj 的属性
 * @param obj 需要排序的对象
 * @param base 基准对象
 * @returns 排序后的新对象
 */
export function orderObject<T>(obj: T, base: T): T {
	// 类型不同
	if (typeof obj !== typeof base) {
		return obj;
	}

	// 数组
	if (isArray(obj)) {
		const firstElementInBase = (base as unknown[])[0];
		if (!firstElementInBase) {
			return obj;
		}

		return obj.map((item) => {
			// 以base中的第一个元素为基准
			return orderObject(item, firstElementInBase);
		}) as T;
	}
	// 非空对象
	else if (typeof obj === 'object' && obj !== null) {
		const ordered = {} as T;
		// 按照 base 的属性顺序排列 obj 的属性（使用getCachedKeys缓存keys，加快keys查询速度）
		for (const key of Object.keys(base as TObject)) {
			if (key in obj) {
				ordered[key as keyof T] = orderObject(obj[key as keyof T], base[key as keyof T]);
			}
		}

		// 添加 base 中没有的属性
		for (const key of Object.keys(obj)) {
			if (!(key in (base as TObject))) {
				ordered[key as keyof T] = orderObject(obj[key as keyof T], {} as T[keyof T]);
			}
		}

		return ordered;
	}

	// 其他类型
	return obj;
}

/**
 * 以 base 的属性顺序稳定化序列化对象
 * @param obj 需要序列化的对象
 * @param base 基准对象
 * @returns 序列化后的字符串
 */
export function stableStringify<T extends TObject>(obj: T, base: T): string {
	return JSON.stringify(orderObject(obj, base));
}

const objectIds = new WeakMap<TObject, number>();
let currentId = 0;
/**
 * 获得对象的唯一标识，调试用
 */
export function getObjectId(obj: TObject): number {
	if (!objectIds.has(obj)) {
		objectIds.set(obj, currentId++);
	}
	return objectIds.get(obj)!;
}

export function stringify<T extends TObject>(obj: T): string {
	return JSON.stringify(obj, undefined, 2);
}

export function parseJsonSafe(content: string): TObject | undefined {
	try {
		return JSON.parse(content);
	} catch {
		return undefined;
	}
}

/** 移除data中field为null的字段 */
export function removeNullField(data: unknown): unknown {
	if (data === undefined) {
		return undefined;
	}

	if (data === null) {
		return undefined;
	}

	if (typeof data !== 'object') {
		return data;
	}

	if (data instanceof Array) {
		const array: unknown[] = [];
		for (const d of data) {
			array.push(removeNullField(d));
		}
		return array;
	}

	const obj: Record<string, unknown> = {};
	for (const key in data) {
		const d = removeNullField((data as Record<string, unknown>)[key]);
		if (d !== undefined) {
			obj[key] = d;
		}
	}
	return obj;
}

export function applyDiff(data: unknown, base: unknown): unknown {
	if (data === undefined) {
		return base;
	}

	// 之前在压缩的时候, 通过null表示data就是要使用undefined
	if (data === null) {
		return undefined;
	}

	if (base === undefined) {
		return data;
	}

	// 目前编辑器规范中, 统一使用undefined, 所以base不可能为null
	if (base === null) {
		throw new Error('Base can not be null');
	}

	if (typeof data !== 'object') {
		return data;
	}

	if (typeof base !== 'object') {
		return data;
	}

	// 如果base是数组, 那么data只有两种情况
	// 空: 前面的代码已经处理
	// 非空: 直接以data的数据为准
	if (base instanceof Array) {
		return data;
	}

	const result = {};

	// 仅data中存在的字段
	for (const key in data) {
		const baseValue = (base as Record<string, unknown>)[key];
		if (baseValue === undefined) {
			const dataValue = (data as Record<string, unknown>)[key];

			// dataValue只有在不等于null的时候才处理，因为要解决下列场景
			// 1. 实体去掉了模板中的字段，对应的key值为null
			// 2. 模板去掉了字段，就造成了dataValue === null
			// 3. 此时实体对应的key数据应该去掉
			if (dataValue !== null) {
				(result as Record<string, unknown>)[key] = removeNullField(dataValue);
			}
		}
	}

	for (const key in base) {
		const vData = (data as Record<string, unknown>)[key];
		const vBase = (base as Record<string, unknown>)[key];
		if (vData === undefined) {
			// 仅base中存在的字段
			(result as Record<string, unknown>)[key] = vBase;
		} else {
			// 如果为null, 则表示原来的字段为undefined
			if (vData !== null) {
				const typeData = typeof vData;
				const typeBase = typeof vBase;
				if (typeData !== typeBase) {
					(result as Record<string, unknown>)[key] = vData;
				} else {
					if (typeData === 'object') {
						const diff = applyDiff(vData, vBase);
						if (diff !== undefined) {
							(result as Record<string, unknown>)[key] = diff;
						}
					} else {
						(result as Record<string, unknown>)[key] = vData;
					}
				}
			}
		}
	}

	return result;
}

export function deepEquals<T>(x: T, y: T): boolean {
	if (x === y) {
		return true;
	}

	const typeX = typeof x;
	const typeY = typeof y;

	if (typeX !== typeY) {
		return false;
	}

	if (typeX !== 'object' || x === undefined || y === undefined || x === null || y === null) {
		return false;
	}

	if (x instanceof Array) {
		if (x.length !== (y as unknown as unknown[]).length) {
			return false;
		}

		for (let i = 0; i < x.length; i++) {
			if (!deepEquals(x[i], (y as unknown as unknown[])[i])) {
				return false;
			}
		}
	} else {
		for (const key in x) {
			if (!deepEquals(x[key], y[key])) {
				return false;
			}
		}

		for (const key in y) {
			if (x[key] === undefined && y[key] !== undefined) {
				return false;
			}
		}
	}

	return true;
}

export function deepClone<T>(obj: T): T {
	if (typeof obj !== 'object' || obj === null) {
		return obj;
	}

	let result: any;
	if (obj instanceof Date) {
		result = new Date(obj);
	} else if (obj instanceof RegExp) {
		result = new RegExp(obj);
	} else if (Array.isArray(obj)) {
		result = [];
		obj.forEach((item, index) => {
			result[index] = deepClone(item);
		});
	} else {
		result = Object.create(Object.getPrototypeOf(obj));
		Object.keys(obj).forEach((key) => {
			result[key] = deepClone((obj as any)[key]);
		});
	}

	return result as T;
}

export function createDiff(origin: unknown, base: unknown): unknown {
	if (base === undefined) {
		return origin;
	}

	// base非空, 而origin非空, 只能用null表示, 因为undefined无法序列化到json中
	if (origin === undefined) {
		return null;
	}

	if (typeof origin !== 'object' || typeof base !== 'object') {
		return origin;
	}

	// 对于数组, 如果完全相同, 就返回undefined, 否则返回origin
	// O: [1, 2, 3] B:[1, 2, 3] D: undefined
	// O: [1, 2] B:[1, 2, 3] D: [1, 2]
	if (base instanceof Array) {
		const oa = origin as unknown[];
		if (base.length !== oa.length) {
			return origin;
		}

		return deepEquals(base, origin) ? undefined : origin;
	}

	let differentFields = 0;
	const result = {};

	// 仅from有的字段
	for (const key in origin) {
		if ((base as Record<string, unknown>)[key] === undefined) {
			const d = (origin as Record<string, unknown>)[key];
			(result as Record<string, unknown>)[key] = d;
			differentFields++;
		}
	}

	for (const key in base) {
		const vFrom = (origin as Record<string, unknown>)[key];
		const vTo = (base as Record<string, unknown>)[key];

		// 双方都有的字段
		if (vFrom !== undefined) {
			const typeFrom = typeof vFrom;
			const typeTo = typeof vTo;
			if (typeFrom === typeTo && typeFrom === 'object') {
				const data = createDiff(vFrom, vTo);
				if (data !== undefined) {
					(result as Record<string, unknown>)[key] = data;
					differentFields++;
				}
			} else {
				if (vFrom !== vTo) {
					(result as Record<string, unknown>)[key] = vFrom;
					differentFields++;
				}
			}
		} else {
			(result as Record<string, unknown>)[key] = null;
			differentFields++;
		}
	}

	if (differentFields === 0) {
		return undefined;
	}

	return result;
}
