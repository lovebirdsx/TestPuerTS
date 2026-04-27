export class SyncDescriptor<T> {
	constructor(
		readonly ctor: { new (...args: any[]): T },
		readonly staticArguments: any[],
		readonly supportsDelayedInstantiation: boolean,
	) {}
}

export interface SyncDescriptor0<T> {
	readonly ctor: new () => T;
}
