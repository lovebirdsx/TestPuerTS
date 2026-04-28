import { once } from './functional';
import { Iterable } from './iterator';

export interface IDisposableTracker {
	/**
	 * Is called on construction of a disposable.
	 */
	trackDisposable(disposable: IDisposable): void;

	/**
	 * Is called when a disposable is registered as child of another disposable (e.g. {@link DisposableStore}).
	 * If parent is `null`, the disposable is removed from its former parent.
	 */
	setParent(child: IDisposable, parent: IDisposable | null): void;

	/**
	 * Is called after a disposable is disposed.
	 */
	markAsDisposed(disposable: IDisposable): void;

	/**
	 * Indicates that the given object is a singleton which does not need to be disposed.
	 */
	markAsSingleton(disposable: IDisposable): void;
}

/**
 * Enables logging of potentially leaked disposables.
 *
 * A disposable is considered leaked if it is not disposed or not registered as the child of
 * another disposable. This tracking is very simple an only works for classes that either
 * extend Disposable or use a DisposableStore. This means there are a lot of false positives.
 */
const TRACK_DISPOSABLES = false;
let disposableTracker: IDisposableTracker | null = null;

if (TRACK_DISPOSABLES) {
	const __is_disposable_tracked__ = '__is_disposable_tracked__';
	setDisposableTracker(
		new (class implements IDisposableTracker {
			trackDisposable(x: IDisposable): void {
				const stack = new Error('Potentially leaked disposable').stack!;
				setTimeout(() => {
					if (!(x as any)[__is_disposable_tracked__]) {
						console.log(stack);
					}
				}, 3000);
			}

			setParent(child: IDisposable, _parent: IDisposable | null): void {
				if (child && child !== Disposable.None) {
					try {
						(child as any)[__is_disposable_tracked__] = true;
					} catch {
						// noop
					}
				}
			}

			markAsDisposed(disposable: IDisposable): void {
				if (disposable && disposable !== Disposable.None) {
					try {
						(disposable as any)[__is_disposable_tracked__] = true;
					} catch {
						// noop
					}
				}
			}
			markAsSingleton(_disposable: IDisposable): void {}
		})(),
	);
}

export function setDisposableTracker(tracker: IDisposableTracker | null): void {
	disposableTracker = tracker;
}

export function trackDisposable<T extends IDisposable>(x: T): T {
	disposableTracker?.trackDisposable(x);
	return x;
}

export function markAsDisposed(disposable: IDisposable): void {
	disposableTracker?.markAsDisposed(disposable);
}

export interface IDisposable {
	dispose(): void;
}

export function dispose<T extends IDisposable>(arg: T | Iterable<T> | undefined): any {
	if (Iterable.is(arg)) {
		const erros: any[] = [];

		for (const item of arg) {
			if (item) {
				try {
					item.dispose();
				} catch (e) {
					erros.push(e);
				}
			}
		}

		if (erros.length === 1) {
			throw erros[0];
		} else if (erros.length > 1) {
			throw new AggregateError(erros);
		}

		return Array.isArray(arg) ? [] : undefined;
	} else if (arg) {
		arg.dispose();
		return arg;
	}

	return undefined;
}

function setParentOfDisposable(child: IDisposable, parent: IDisposable | null): void {
	disposableTracker?.setParent(child, parent);
}

function setParentOfDisposables(children: IDisposable[], parent: IDisposable | null): void {
	if (!disposableTracker) {
		return;
	}
	for (const child of children) {
		disposableTracker.setParent(child, parent);
	}
}

export class DisposableStore implements IDisposable {
	static DISABLE_DISPOSED_WARNING = false;

	private readonly _toDispose = new Set<IDisposable>();
	private _isDisposed = false;

	dispose(): void {
		if (this._isDisposed) {
			return;
		}

		markAsDisposed(this);
		this._isDisposed = true;
		this.clear();
	}

	public get isDisposed(): boolean {
		return this._isDisposed;
	}

	clear(): void {
		if (this._toDispose.size === 0) {
			return;
		}

		try {
			dispose(this._toDispose);
		} finally {
			this._toDispose.clear();
		}
	}

	add<T extends IDisposable>(t: T): T {
		if (!t) {
			return t;
		}

		if ((t as unknown as DisposableStore) === this) {
			throw new Error('Cannot register a disposable on itself!');
		}

		setParentOfDisposable(t, this);
		if (this._isDisposed) {
			if (!DisposableStore.DISABLE_DISPOSED_WARNING) {
				console.warn(
					new Error(
						'Trying to add a disposable to a DisposableStore that has already been disposed of. The added object will be leaked!',
					).stack,
				);
			}
		} else {
			this._toDispose.add(t);
		}

		return t;
	}
}

/**
 * Combine multiple disposable values into a single {@link IDisposable}.
 */
export function combinedDisposable(...disposables: IDisposable[]): IDisposable {
	const parent = toDisposable(() => dispose(disposables));
	setParentOfDisposables(disposables, parent);
	return parent;
}

export function toDisposable(fn: () => void): IDisposable {
	return { dispose: once(fn) };
}

export abstract class Disposable implements IDisposable {
	static readonly None = Object.freeze<IDisposable>({ dispose() {} });

	protected readonly _store = new DisposableStore();

	constructor() {
		trackDisposable(this);
		setParentOfDisposables([this._store], this);
	}

	dispose(): void {
		markAsDisposed(this);

		this._store.dispose();
	}

	/**
	 * Adds `o` to the collection of disposables managed by this object.
	 */
	protected _register<T extends IDisposable>(o: T): T {
		if ((o as unknown as Disposable) === this) {
			throw new Error('Cannot register a disposable on itself!');
		}
		return this._store.add(o);
	}
}
