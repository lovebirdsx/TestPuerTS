import { CancellationToken, CancellationTokenSource } from './cancellation';
import { CancellationError } from './errors';
import { IDisposable } from './lifecycle';

export function isThenable<T>(obj: unknown): obj is Promise<T> {
	return !!obj && typeof (obj as unknown as Promise<T>).then === 'function';
}

export interface CancelablePromise<T> extends Promise<T> {
	cancel(): void;
}

export function createCancelablePromise<T>(callback: (token: CancellationToken) => Promise<T>): CancelablePromise<T> {
	const source = new CancellationTokenSource();

	const thenable = callback(source.token);
	const promise = new Promise<T>((resolve, reject) => {
		const subscription = source.token.onCancellationRequested(() => {
			subscription.dispose();
			source.dispose();
			reject(new CancellationError());
		});
		Promise.resolve(thenable).then(
			(value) => {
				subscription.dispose();
				source.dispose();
				resolve(value);
			},
			(err) => {
				subscription.dispose();
				source.dispose();
				reject(err);
			},
		);
	});

	return <CancelablePromise<T>>new (class {
		cancel() {
			source.cancel();
		}
		then<
			TResult1 = T,
			TResult2 = never,
		>(resolve?: ((value: T) => TResult1 | Promise<TResult1>) | undefined | null, reject?: ((reason: any) => TResult2 | Promise<TResult2>) | undefined | null): Promise<TResult1 | TResult2> {
			return promise.then(resolve, reject);
		}
		catch<
			TResult = never,
		>(reject?: ((reason: any) => TResult | Promise<TResult>) | undefined | null): Promise<T | TResult> {
			return this.then(undefined, reject);
		}
		finally(onfinally?: (() => void) | undefined | null): Promise<T> {
			return promise.finally(onfinally);
		}
	})();
}

/**
 * Returns a promise that resolves with `undefined` as soon as the passed token is cancelled.
 * @see {@link raceCancellationError}
 */
export function raceCancellation<T>(promise: Promise<T>, token: CancellationToken): Promise<T | undefined>;

/**
 * Returns a promise that resolves with `defaultValue` as soon as the passed token is cancelled.
 * @see {@link raceCancellationError}
 */
export function raceCancellation<T>(promise: Promise<T>, token: CancellationToken, defaultValue: T): Promise<T>;

export function raceCancellation<T>(
	promise: Promise<T>,
	token: CancellationToken,
	defaultValue?: T,
): Promise<T | undefined> {
	return new Promise((resolve, reject) => {
		const ref = token.onCancellationRequested(() => {
			ref.dispose();
			resolve(defaultValue);
		});
		promise.then(resolve, reject).finally(() => ref.dispose());
	});
}

/**
 * Returns a promise that rejects with an {@CancellationError} as soon as the passed token is cancelled.
 * @see {@link raceCancellation}
 */
export function raceCancellationError<T>(promise: Promise<T>, token: CancellationToken): Promise<T> {
	return new Promise((resolve, reject) => {
		const ref = token.onCancellationRequested(() => {
			ref.dispose();
			reject(new CancellationError());
		});
		promise.then(resolve, reject).finally(() => ref.dispose());
	});
}

/**
 * Returns as soon as one of the promises resolves or rejects and cancels remaining promises
 */
export async function raceCancellablePromises<T>(cancellablePromises: CancelablePromise<T>[]): Promise<T> {
	let resolvedPromiseIndex = -1;
	const promises = cancellablePromises.map((promise, index) =>
		promise.then((result) => {
			resolvedPromiseIndex = index;
			return result;
		}),
	);
	try {
		const result = await Promise.race(promises);
		return result;
	} finally {
		cancellablePromises.forEach((cancellablePromise, index) => {
			if (index !== resolvedPromiseIndex) {
				cancellablePromise.cancel();
			}
		});
	}
}

export function raceTimeout<T>(promise: Promise<T>, timeout: number, onTimeout?: () => void): Promise<T | undefined> {
	let promiseResolve: ((value: T | undefined) => void) | undefined = undefined;

	const timer = setTimeout(() => {
		promiseResolve?.(undefined);
		onTimeout?.();
	}, timeout);

	return Promise.race([
		promise.finally(() => clearTimeout(timer)),
		new Promise<T | undefined>((resolve) => (promiseResolve = resolve)),
	]);
}

export interface IPromiseWithStatus<T> {
	readonly promise: Promise<T>;
	readonly isFinished: boolean;
}

export class ResolvablePromise<T> implements IPromiseWithStatus<T> {
	private _resolve!: (value: T) => void;
	private _reject!: (reason: Error) => void;
	private readonly _promise: Promise<T>;
	private _isFinished = false;

	public constructor() {
		this._promise = new Promise((resolve, reject) => {
			this._resolve = resolve;
			this._reject = reject;
		});
	}

	public get promise(): Promise<T> {
		return this._promise;
	}

	public get isFinished(): boolean {
		return this._isFinished;
	}

	public resolve(value: T): void {
		if (this._isFinished) {
			throw new Error('Already finished');
		}

		this._isFinished = true;
		this._resolve(value);
	}

	public reject(err: Error): void {
		if (this._isFinished) {
			throw new Error('Already finished');
		}

		this._isFinished = true;
		this._reject(err);
	}
}

/**
 * A barrier that is initially closed and then becomes opened permanently.
 */
export class Barrier {
	private _isOpen: boolean;
	private _promise: Promise<boolean>;
	private _completePromise!: (v: boolean) => void;

	constructor() {
		this._isOpen = false;
		this._promise = new Promise<boolean>((c, _e) => {
			this._completePromise = c;
		});
	}

	isOpen(): boolean {
		return this._isOpen;
	}

	open(): void {
		this._isOpen = true;
		this._completePromise(true);
	}

	wait(): Promise<boolean> {
		return this._promise;
	}
}

export interface IdleDeadline {
	didTimeout: boolean;
	timeRemaining(): number;
}

export function runWhenIdle(runner: (idle: IdleDeadline) => void, _timeout?: number): IDisposable {
	let disposed = false;
	setTimeout(() => {
		if (disposed) {
			return;
		}

		const end = Date.now() + 15;
		runner(
			Object.freeze({
				didTimeout: true,
				timeRemaining() {
					return Math.max(0, end - Date.now());
				},
			}),
		);
	}, 0);
	return {
		dispose() {
			if (disposed) {
				return;
			}
			disposed = true;
		},
	};
}

export class IdleValue<T> {
	private readonly _executor: () => void;
	private readonly _handle: IDisposable;

	private _didRun = false;
	private _value?: T;
	private _error?: unknown;

	constructor(executor: () => T) {
		this._executor = () => {
			try {
				this._value = executor();
			} catch (err) {
				this._error = err;
			} finally {
				this._didRun = true;
			}
		};

		this._handle = runWhenIdle(() => this._executor());
	}

	dispose() {
		this._handle.dispose();
	}

	get value(): T {
		if (!this._didRun) {
			this._handle.dispose();
			this._executor();
		}
		if (this._error) {
			throw this._error;
		}
		return this._value!;
	}

	get isInitialized(): boolean {
		return this._didRun;
	}
}

export async function wait(timeout: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, timeout);
	});
}

export function timeout(millis: number): CancelablePromise<void>;
export function timeout(millis: number, token: CancellationToken): Promise<void>;
export function timeout(millis: number, token?: CancellationToken): CancelablePromise<void> | Promise<void> {
	if (!token) {
		return createCancelablePromise((token) => timeout(millis, token));
	}

	return new Promise((resolve, reject) => {
		const handle = setTimeout(() => {
			disposable.dispose();
			resolve();
		}, millis);
		const disposable = token.onCancellationRequested(() => {
			clearTimeout(handle);
			disposable.dispose();
			reject(new CancellationError());
		});
	});
}

export function waitCondition(condition: () => boolean, interval: number = 1): Promise<void> {
	return new Promise((resolve) => {
		const handle = setInterval(() => {
			if (condition()) {
				clearInterval(handle);
				resolve();
			}
		}, interval);
	});
}
