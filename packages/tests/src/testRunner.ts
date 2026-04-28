// vitest 风格测试运行器，适配 PuerTS Commandlet 环境

type TestFn = () => Promise<void> | void;

interface TestCase {
	name: string;
	fn: TestFn;
	fullName: string;
}

interface Suite {
	name: string;
	fullName: string;
	tests: TestCase[];
	children: Suite[];
	beforeAll: TestFn[];
	afterAll: TestFn[];
	beforeEach: TestFn[];
	afterEach: TestFn[];
}

// ===== 内部状态 =====

const rootSuite: Suite = {
	name: '',
	fullName: '',
	tests: [],
	children: [],
	beforeAll: [],
	afterAll: [],
	beforeEach: [],
	afterEach: [],
};

let currentSuite: Suite = rootSuite;

// ===== 公开 API =====

export function describe(name: string, fn: () => void): void {
	const suite: Suite = {
		name,
		fullName: currentSuite.fullName ? `${currentSuite.fullName} > ${name}` : name,
		tests: [],
		children: [],
		beforeAll: [],
		afterAll: [],
		beforeEach: [],
		afterEach: [],
	};
	currentSuite.children.push(suite);

	const parent = currentSuite;
	currentSuite = suite;
	fn();
	currentSuite = parent;
}

export function it(name: string, fn: TestFn): void {
	currentSuite.tests.push({
		name,
		fn,
		fullName: currentSuite.fullName ? `${currentSuite.fullName} > ${name}` : name,
	});
}

export const test = it;

export function beforeAll(fn: TestFn): void {
	currentSuite.beforeAll.push(fn);
}

export function afterAll(fn: TestFn): void {
	currentSuite.afterAll.push(fn);
}

export function beforeEach(fn: TestFn): void {
	currentSuite.beforeEach.push(fn);
}

export function afterEach(fn: TestFn): void {
	currentSuite.afterEach.push(fn);
}

// ===== expect 断言 =====

class ExpectError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ExpectError';
	}
}

interface Matchers {
	toBe(expected: unknown): void;
	toEqual(expected: unknown): void;
	toBeTruthy(): void;
	toBeFalsy(): void;
	toContain(item: unknown): void;
	toBeGreaterThan(n: number): void;
	toBeLessThan(n: number): void;
	toBeUndefined(): void;
	toBeNull(): void;
	not: Matchers;
}

function createMatchers(actual: unknown, negated: boolean): Matchers {
	function assert(pass: boolean, message: string): void {
		if (negated ? pass : !pass) {
			throw new ExpectError(message);
		}
	}

	const matchers: Matchers = {
		toBe(expected: unknown) {
			assert(actual === expected, `expected ${JSON.stringify(actual)} to be ${JSON.stringify(expected)}`);
		},
		toEqual(expected: unknown) {
			const eq = JSON.stringify(actual) === JSON.stringify(expected);
			assert(eq, `expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`);
		},
		toBeTruthy() {
			assert(!!actual, `expected ${JSON.stringify(actual)} to be truthy`);
		},
		toBeFalsy() {
			assert(!actual, `expected ${JSON.stringify(actual)} to be falsy`);
		},
		toContain(item: unknown) {
			if (typeof actual === 'string') {
				assert(actual.includes(item as string), `expected "${actual}" to contain "${item}"`);
			} else if (Array.isArray(actual)) {
				assert(actual.includes(item), `expected array to contain ${JSON.stringify(item)}`);
			} else {
				throw new ExpectError('toContain requires a string or array');
			}
		},
		toBeGreaterThan(n: number) {
			assert((actual as number) > n, `expected ${actual} to be greater than ${n}`);
		},
		toBeLessThan(n: number) {
			assert((actual as number) < n, `expected ${actual} to be less than ${n}`);
		},
		toBeUndefined() {
			assert(actual === undefined, `expected ${JSON.stringify(actual)} to be undefined`);
		},
		toBeNull() {
			assert(actual === null, `expected ${JSON.stringify(actual)} to be null`);
		},
		get not(): Matchers {
			return createMatchers(actual, !negated);
		},
	};
	return matchers;
}

export function expect(actual: unknown): Matchers {
	return createMatchers(actual, false);
}

// ===== 执行引擎 =====

interface TestResult {
	name: string;
	passed: boolean;
	error?: string;
}

async function runSuite(
	suite: Suite,
	filter: string | undefined,
	parentBeforeEach: TestFn[],
	parentAfterEach: TestFn[],
): Promise<TestResult[]> {
	// filter 匹配：如果指定了 filter，只运行名称匹配的顶层 suite
	if (filter && suite !== rootSuite && suite.fullName !== filter && !suite.fullName.startsWith(filter + ' > ')) {
		return [];
	}

	const results: TestResult[] = [];
	const allBeforeEach = [...parentBeforeEach, ...suite.beforeEach];
	const allAfterEach = [...suite.afterEach, ...parentAfterEach];

	// beforeAll
	for (const fn of suite.beforeAll) {
		try {
			await fn();
		} catch (err: any) {
			// beforeAll 失败，标记该 suite 所有测试为失败
			const msg = `beforeAll failed: ${err.message || err}`;
			for (const test of suite.tests) {
				results.push({ name: test.fullName, passed: false, error: msg });
			}
			return results;
		}
	}

	// 运行测试
	for (const test of suite.tests) {
		try {
			for (const fn of allBeforeEach) await fn();
			await test.fn();
			for (const fn of allAfterEach) await fn();
			results.push({ name: test.fullName, passed: true });
		} catch (err: any) {
			results.push({ name: test.fullName, passed: false, error: err.message || String(err) });
		}
	}

	// 递归子 suite
	for (const child of suite.children) {
		const childResults = await runSuite(child, filter, allBeforeEach, allAfterEach);
		results.push(...childResults);
	}

	// afterAll
	for (const fn of suite.afterAll) {
		try {
			await fn();
		} catch (err: any) {
			console.error(`afterAll failed in "${suite.fullName}": ${err.message || err}`);
		}
	}

	return results;
}

export async function runTests(filter?: string): Promise<number> {
	console.log('=== PuerTS Test Runner ===');

	const results = await runSuite(rootSuite, filter, [], []);

	if (results.length === 0) {
		if (filter) {
			console.error(`未找到匹配的测试套件: "${filter}"`);
			const names = rootSuite.children.map((s) => s.name);
			console.log(`可用的测试套件: ${names.join(', ')}`);
			return 1;
		}
		console.log('没有注册任何测试');
		return 0;
	}

	// 输出结果
	let passed = 0;
	let failed = 0;
	for (const r of results) {
		if (r.passed) {
			console.log(` ✓ ${r.name}`);
			passed++;
		} else {
			console.error(` ✗ ${r.name}`);
			console.error(`   ${r.error}`);
			failed++;
		}
	}

	console.log(`\n结果: ${passed} passed, ${failed} failed, ${results.length} total`);
	return failed > 0 ? 1 : 0;
}
