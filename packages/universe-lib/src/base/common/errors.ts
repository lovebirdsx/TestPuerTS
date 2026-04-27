const canceledName = 'Canceled';

export class CancellationError extends Error {
	constructor() {
		super(canceledName);
		this.name = this.message;
	}
}

export function isCancellationError(error: any): boolean {
	if (error instanceof CancellationError) {
		return true;
	}

	return error instanceof Error && error.name === canceledName && error.message === canceledName;
}

/**
 * Error that when thrown won't be logged in telemetry as an unhandled error.
 */
export class ErrorNoTelemetry extends Error {
	override readonly name: string;

	constructor(msg?: string) {
		super(msg);
		this.name = 'CodeExpectedError';
	}

	public static fromError(err: Error): ErrorNoTelemetry {
		if (err instanceof ErrorNoTelemetry) {
			return err;
		}

		const result = new ErrorNoTelemetry();
		result.message = err.message;
		result.stack = err.stack;
		return result;
	}

	public static isErrorNoTelemetry(err: Error): err is ErrorNoTelemetry {
		return err.name === 'CodeExpectedError';
	}
}

export interface ErrorListenerCallback {
	(error: any): void;
}

export interface ErrorListenerUnbind {
	(): void;
}

// Avoid circular dependency on EventEmitter by implementing a subset of the interface.
export class ErrorHandler {
	private unexpectedErrorHandler: (e: any) => void;
	private listeners: ErrorListenerCallback[];

	constructor() {
		this.listeners = [];

		this.unexpectedErrorHandler = function (e: any) {
			setTimeout(() => {
				if (e.stack) {
					if (ErrorNoTelemetry.isErrorNoTelemetry(e)) {
						throw new ErrorNoTelemetry(e.message + '\n\n' + e.stack);
					}

					throw new Error(e.message + '\n\n' + e.stack);
				}

				throw e;
			}, 0);
		};
	}

	addListener(listener: ErrorListenerCallback): ErrorListenerUnbind {
		this.listeners.push(listener);

		return () => {
			this._removeListener(listener);
		};
	}

	private emit(e: any): void {
		this.listeners.forEach((listener) => {
			listener(e);
		});
	}

	private _removeListener(listener: ErrorListenerCallback): void {
		this.listeners.splice(this.listeners.indexOf(listener), 1);
	}

	setUnexpectedErrorHandler(newUnexpectedErrorHandler: (e: any) => void): void {
		this.unexpectedErrorHandler = newUnexpectedErrorHandler;
	}

	getUnexpectedErrorHandler(): (e: any) => void {
		return this.unexpectedErrorHandler;
	}

	onUnexpectedError(e: any): void {
		this.unexpectedErrorHandler(e);
		this.emit(e);
	}

	// For external errors, we don't want the listeners to be called
	onUnexpectedExternalError(e: any): void {
		this.unexpectedErrorHandler(e);
	}
}

export const errorHandler = new ErrorHandler();

/** @skipMangle */
export function setUnexpectedErrorHandler(newUnexpectedErrorHandler: (e: any) => void): void {
	errorHandler.setUnexpectedErrorHandler(newUnexpectedErrorHandler);
}

export function onUnexpectedError(e: any): undefined {
	// ignore errors from cancelled promises
	if (!isCancellationError(e)) {
		errorHandler.onUnexpectedError(e);
	}
	return undefined;
}

export function onUnexpectedExternalError(e: any): undefined {
	// ignore errors from cancelled promises
	if (!isCancellationError(e)) {
		errorHandler.onUnexpectedExternalError(e);
	}
	return undefined;
}

/**
 * 安全运行方法，如果发生异常，会被捕获并记录日志
 */
export function safeRun<T extends void | Promise<void>>(fn: (...args: any[]) => T, ...args: any[]): T {
	try {
		const a = fn(...args);
		if (a instanceof Promise) {
			a.catch(onUnexpectedError);
			return a;
		}
	} catch (e) {
		onUnexpectedError(e);
	}

	return undefined as any;
}

/**
 * 将方法包装为安全运行的方法，如果发生异常，会被捕获并记录日志
 */
export function safeWrap<T extends (...args: any[]) => void | Promise<void>>(fn: T): T {
	return function (...args: any[]) {
		return safeRun(fn, ...args);
	} as T;
}

/**
 * 安全运行方法的装饰器，类方法调用时，如果发生异常，会被捕获并记录日志
 */
export function safe(_target: Object, _propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor {
	if (typeof descriptor.value !== 'function') {
		throw new Error('@safe 装饰器只能用于类的方法上');
	}

	const originalMethod = descriptor.value;

	descriptor.value = function (...args: any[]) {
		return safeRun(originalMethod.bind(this), ...args);
	};

	return descriptor;
}
