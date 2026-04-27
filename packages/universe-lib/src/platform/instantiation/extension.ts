import { ServiceIdentifier } from './serviceCollection';
import { SyncDescriptor } from './descriptors';

export const _registry: [ServiceIdentifier<any>, SyncDescriptor<any>][] = [];
export function registerSingleton<T>(id: ServiceIdentifier<T>, ctor: { new (...args: any[]): T }, supportsDelayedInstantiation: boolean): void {
	_registry.push([id, new SyncDescriptor(ctor, [], supportsDelayedInstantiation)]);
}

export function getSingletonServiceDescriptors(): [ServiceIdentifier<any>, SyncDescriptor<any>][] {
	return _registry;
}
