// vitest 风格测试运行器，适配 PuerTS Commandlet 环境
import { createLogger } from '@universe-agent/editor-common';
import { green, red } from './util';

const logger = createLogger();

type TestFn = () => Promise<void> | void;

interface TestCase {
	name: string;
	fn: TestFn;
	fullName: string;
	skipped?: boolean;
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
	skipped?: boolean;
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

interface DescribeFn {
	(name: string, fn: () => void): void;
	skip(name: string, fn: () => void): void;
}

interface ItFn {
	(name: string, fn: TestFn): void;
	skip(name: string, fn?: TestFn): void;
}

function describeImpl(name: string, fn: () => void, skipped: boolean): void {
	const suite: Suite = {
		name,
		fullName: currentSuite.fullName ? `${currentSuite.fullName} > ${name}` : name,
		tests: [],
		children: [],
		beforeAll: [],
		afterAll: [],
		beforeEach: [],
		afterEach: [],
		skipped: skipped || currentSuite.skipped,
	};
	currentSuite.children.push(suite);

	const parent = currentSuite;
	currentSuite = suite;
	fn();
	currentSuite = parent;
}

export const describe: DescribeFn = Object.assign((name: string, fn: () => void) => describeImpl(name, fn, false), {
	skip(name: string, fn: () => void) {
		describeImpl(name, fn, true);
	},
});

export const it: ItFn = Object.assign(
	(name: string, fn: TestFn) => {
		currentSuite.tests.push({
			name,
			fn,
			fullName: currentSuite.fullName ? `${currentSuite.fullName} > ${name}` : name,
			skipped: currentSuite.skipped,
		});
	},
	{
		skip(name: string, fn?: TestFn) {
			currentSuite.tests.push({
				name,
				fn: fn ?? (() => {}),
				fullName: currentSuite.fullName ? `${currentSuite.fullName} > ${name}` : name,
				skipped: true,
			});
		},
	},
);

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
	toThrow(expected?: string | RegExp): void;
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
			assert(actual === undefined, `expected ${actual} to be undefined`);
		},
		toBeNull() {
			assert(actual === null, `expected ${actual} to be null`);
		},
		toThrow(expected?: string | RegExp) {
			if (typeof actual !== 'function') {
				throw new ExpectError('toThrow requires a function');
			}
			let thrown: unknown;
			let didThrow = false;
			try {
				(actual as () => unknown)();
			} catch (err) {
				thrown = err;
				didThrow = true;
			}
			if (!didThrow) {
				assert(false, 'expected function to throw');
				return;
			}
			if (expected === undefined) {
				assert(true, 'expected function not to throw');
				return;
			}
			const msg = thrown instanceof Error ? thrown.message : String(thrown);
			const matched = expected instanceof RegExp ? expected.test(msg) : msg.includes(expected);
			assert(matched, `expected thrown message ${JSON.stringify(msg)} to match ${String(expected)}`);
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
	skipped?: boolean;
	error?: string;
}

async function runSuite(
	suite: Suite,
	filter: string | undefined,
	testNamePattern: RegExp | undefined,
	parentBeforeEach: TestFn[],
	parentAfterEach: TestFn[],
): Promise<TestResult[]> {
	// filter 匹配：如果指定了 filter，只运行名称匹配的顶层 suite
	if (filter && suite !== rootSuite && !suite.fullName.startsWith(filter)) {
		return [];
	}

	const results: TestResult[] = [];
	const allBeforeEach = [...parentBeforeEach, ...suite.beforeEach];
	const allAfterEach = [...suite.afterEach, ...parentAfterEach];

	function report(r: TestResult): void {
		results.push(r);
		if (r.skipped) {
			logger.info(` ↷ ${r.name} (skipped)`);
		} else if (r.passed) {
			logger.info(` ${green('✓')} ${r.name}`);
		} else {
			logger.error(` ${red('✗')} ${r.name}`);
			logger.error(`   ${r.error}`);
		}
	}

	// 整个 suite 被 skip：不跑钩子，所有 test 标记为 skipped，但仍递归子 suite（保持输出结构）
	if (suite.skipped) {
		for (const t of suite.tests) {
			if (testNamePattern && !testNamePattern.test(t.fullName)) continue;
			report({ name: t.fullName, passed: true, skipped: true });
		}
		for (const child of suite.children) {
			const childResults = await runSuite(child, filter, testNamePattern, allBeforeEach, allAfterEach);
			results.push(...childResults);
		}
		return results;
	}

	// beforeAll
	for (const fn of suite.beforeAll) {
		try {
			await fn();
		} catch (err: any) {
			// beforeAll 失败，标记该 suite 所有测试为失败
			const msg = `beforeAll failed: ${err.message || err}`;
			for (const test of suite.tests) {
				if (testNamePattern && !testNamePattern.test(test.fullName)) continue;
				report({ name: test.fullName, passed: false, error: msg });
			}
			return results;
		}
	}

	// 运行测试
	for (const test of suite.tests) {
		if (testNamePattern && !testNamePattern.test(test.fullName)) continue;
		if (test.skipped) {
			report({ name: test.fullName, passed: true, skipped: true });
			continue;
		}
		try {
			for (const fn of allBeforeEach) await fn();
			await test.fn();
			for (const fn of allAfterEach) await fn();
			report({ name: test.fullName, passed: true });
		} catch (err: any) {
			report({ name: test.fullName, passed: false, error: err.message || String(err) });
		}
	}

	// 递归子 suite
	for (const child of suite.children) {
		const childResults = await runSuite(child, filter, testNamePattern, allBeforeEach, allAfterEach);
		results.push(...childResults);
	}

	// afterAll
	for (const fn of suite.afterAll) {
		try {
			await fn();
		} catch (err: any) {
			logger.error(`afterAll failed in "${suite.fullName}": ${err.message || err}`);
		}
	}

	return results;
}

export interface RunOptions {
	filter?: string;
	testNamePattern?: RegExp;
}

export async function runTests(opts: RunOptions = {}): Promise<number> {
	logger.info('=== PuerTS Test Runner ===');

	const { filter, testNamePattern } = opts;
	if (filter) logger.info(`  filter: ${filter}`);
	if (testNamePattern) logger.info(`  test-name-pattern: ${testNamePattern}`);

	const results = await runSuite(rootSuite, filter, testNamePattern, [], []);

	if (results.length === 0) {
		const criteria: string[] = [];
		if (filter) criteria.push(`filter="${filter}"`);
		if (testNamePattern) criteria.push(`pattern=${testNamePattern}`);
		if (criteria.length > 0) {
			logger.error(`未找到匹配的测试 (${criteria.join(', ')})`);
			const names = rootSuite.children.map((s) => s.name);
			logger.info(`可用的顶层测试套件: ${names.join(', ')}`);
			return 1;
		}
		logger.info('没有注册任何测试');
		return 0;
	}

	let passed = 0;
	let failed = 0;
	let skipped = 0;
	for (const r of results) {
		if (r.skipped) skipped++;
		else if (r.passed) passed++;
		else failed++;
	}

	logger.info(`\nResult: ${passed} passed, ${failed} failed, ${skipped} skipped, ${results.length} total`);

	// 再次输出失败的测试名称，方便 CI 搜集
	if (failed > 0) {
		logger.info('\nFailed tests:');
		for (const r of results) {
			if (!r.passed && !r.skipped) {
				logger.info(` ${red('✗')} ${r.name}`);
			}
		}
		logger.info('');
	}

	return failed > 0 ? 1 : 0;
}
