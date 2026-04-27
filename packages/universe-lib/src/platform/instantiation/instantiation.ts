import { SyncDescriptor0 } from './descriptors';
import { ServiceCollection, ServiceIdentifier } from './serviceCollection';

export namespace _util {
	export const serviceIds = new Map<string, ServiceIdentifier<any>>();

	export const DI_TARGET = 'DI_TARGET';
	export const DI_DEPENDENCIES = 'DI_DEPENDENCIES';

	export function getServiceDependencies(ctor: any): { id: ServiceIdentifier<any>; index: number }[] {
		return ctor[DI_DEPENDENCIES] || [];
	}
}

export type BrandedService = { _serviceBrand: undefined };

export interface ServicesAccessor {
	get<T>(id: ServiceIdentifier<T>): T;
}

export type GetLeadingNonServiceArgs<TArgs extends any[]> = TArgs extends [] ? [] : TArgs extends [...infer TFirst, BrandedService] ? GetLeadingNonServiceArgs<TFirst> : TArgs;

export interface IInstantiationService {
	readonly _serviceBrand: undefined;

	/**
	 * 同步创建一个实例
	 */
	createInstance<T>(descriptor: SyncDescriptor0<T>): T;
	createInstance<Ctor extends new (...args: any[]) => any, R extends InstanceType<Ctor>>(ctor: Ctor, ...args: GetLeadingNonServiceArgs<ConstructorParameters<Ctor>>): R;

	/**
	 * 在accessor中获得服务实例，并进行相关操作
	 * 如果服务支持延迟实例化，则构造函数会在服务的第一次请求（调用该服务的方法或者属性）时调用
	 * 如果服务不支持延迟实例化，则构造函数会在服务注册时调用
	 */
	invokeFunction<R, TS extends any[] = []>(fn: (accessor: ServicesAccessor, ...args: TS) => R, ...args: TS): R;

	createChild(services: ServiceCollection): IInstantiationService;
}

export const IInstantiationService = createDecorator<IInstantiationService>('instantiationService');

function storeServiceDependency(id: Function, target: Function, index: number): void {
	if ((target as any)[_util.DI_TARGET] === target) {
		(target as any)[_util.DI_DEPENDENCIES].push({ id, index });
	} else {
		(target as any)[_util.DI_DEPENDENCIES] = [{ id, index }];
		(target as any)[_util.DI_TARGET] = target;
	}
}

export function createDecorator<T>(serviceId: string): ServiceIdentifier<T> {
	if (_util.serviceIds.has(serviceId)) {
		return _util.serviceIds.get(serviceId)!;
	}

	const id = <any>function id(target: any, _key: string, index: number): any {
		if (arguments.length !== 3) {
			throw new Error('@IServiceName-decorator can only be used to decorate a parameter');
		}
		storeServiceDependency(id, target, index);
	};

	id.toString = () => serviceId;

	_util.serviceIds.set(serviceId, id);
	return id;
}
