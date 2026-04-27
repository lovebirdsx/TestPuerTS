import { describe, it, beforeEach, expect } from 'vitest';
import { createDecorator } from '../instantiation';
import { ServiceIdentifier } from '../serviceCollection';
import { InstantiationService } from '../instantiationService';
import { ServiceCollection } from '../serviceCollection';
import { SyncDescriptor } from '../descriptors';

// 接口定义
interface ILogger {
	readonly _serviceBrand: undefined;
	log(message: string): void;
}

const ILogger = createDecorator<ILogger>('Logger');

interface IFileSystem {
	readonly _serviceBrand: undefined;
	readFile(path: string): string;
	writeFile(path: string, content: string): void;
}

const IFileSystem = createDecorator<IFileSystem>('FileSystem');

interface ISaver {
	readonly _serviceBrand: undefined;
	readonly id: string;
	save(path: string, obj: unknown): void;
}

const ISaver = createDecorator<ISaver>('Saver');

interface ILoader {
	readonly _serviceBrand: undefined;
	load(path: string): unknown;
}

const ILoader = createDecorator<ILoader>('Loader');

// 接口实现
class Logger implements ILogger {
	static constructorCallCount = 0;

	declare readonly _serviceBrand: undefined;

	constructor() {
		this.log = this.log.bind(this);
		Logger.constructorCallCount++;
	}

	log(_message: string): void {
		// console.log(message);
	}
}

class FileSystem implements IFileSystem {
	static constructorCallCount = 0;

	private static _files: Map<string, string> = new Map();

	static clearFiles(): void {
		FileSystem._files.clear();
	}

	static getFile(path: string): string | undefined {
		return FileSystem._files.get(path);
	}

	declare readonly _serviceBrand: undefined;

	constructor(@ILogger private logger: ILogger) {
		FileSystem.constructorCallCount++;
	}

	readFile(path: string): string {
		this.logger.log(`Reading file ${path}`);
		return FileSystem.getFile(path) || '';
	}

	writeFile(path: string, content: string): void {
		this.logger.log(`Writing file ${path}`);
		FileSystem._files.set(path, content);
	}
}

class Saver implements ISaver {
	static constructorCallCount = 0;

	declare readonly _serviceBrand: undefined;

	constructor(
		readonly id: string,
		@ILogger private logger: ILogger,
		@IFileSystem private fileSystem: IFileSystem,
	) {
		Saver.constructorCallCount++;
	}

	save(path: string, obj: unknown): void {
		this.logger.log(`Saving object to ${path}`);
		const content = JSON.stringify(obj);
		this.fileSystem.writeFile(path, content);
	}
}

class Loader implements ILoader {
	declare readonly _serviceBrand: undefined;

	constructor(@IFileSystem private fileSystem: IFileSystem) {}

	load(path: string): unknown {
		const content = this.fileSystem.readFile(path);
		return JSON.parse(content);
	}
}

const _registry: [ServiceIdentifier<any>, SyncDescriptor<any>][] = [];
function registerSingleton<T>(id: ServiceIdentifier<T>, ctor: { new (...args: any[]): T }, supportsDelayedInstantiation: boolean): void {
	_registry.push([id, new SyncDescriptor(ctor, [], supportsDelayedInstantiation)]);
}

function getSingletonServiceDescriptors(): [ServiceIdentifier<any>, SyncDescriptor<any>][] {
	return _registry;
}

registerSingleton(ILogger, Logger, false);
registerSingleton(IFileSystem, FileSystem, true);
registerSingleton(ISaver, Saver, true);
registerSingleton(ILoader, Loader, true);

describe('Dependency Injection', () => {
	beforeEach(() => {
		Logger.constructorCallCount = 0;
		FileSystem.constructorCallCount = 0;
		Saver.constructorCallCount = 0;
	});

	// 服务没有注册时会报错
	it('service not registered', () => {
		const instantiationService = new InstantiationService();
		expect(() => instantiationService.createInstance(Saver, 'error')).toThrow();
	});

	// 通过InstantiationService来创建服务
	it('inject by InstantiationService', () => {
		const services = new ServiceCollection();
		for (const [id, descriptor] of getSingletonServiceDescriptors()) {
			services.set(id, descriptor);
		}

		const instantiationService = new InstantiationService(services);
		const saver = instantiationService.createInstance(Saver, 'test');
		saver.save('test.txt', 'hello');
		expect(FileSystem.getFile('test.txt')).toBe('"hello"');
	});

	// 服务在后台会自动创建
	it('service background instantiation', async () => {
		const services = new ServiceCollection();
		for (const [id, descriptor] of getSingletonServiceDescriptors()) {
			services.set(id, descriptor);
		}

		const instantiationService = new InstantiationService(services);
		const saver = instantiationService.createInstance(Saver, 'test');

		// 虽然Saver依赖FileSystem，但因为没有调用FileSystem的方法，所以FileSystem不会被创建
		// 这个是因为FileSystem配置成可以延迟创建
		expect(FileSystem.constructorCallCount).toBe(0);

		// Logger不是延迟创建，所以会被创建
		expect(Logger.constructorCallCount).toBe(1);

		saver.save('test.txt', 'hello');
		expect(FileSystem.constructorCallCount).toBe(1);
	});

	// 构造函数延迟调用
	it('constructor lazy call', async () => {
		interface ILazyConstructService {
			readonly _serviceBrand: undefined;
		}
		const ILazyConstructService = createDecorator<ILazyConstructService>('LazyConstructService');

		interface IInstantConstructService {
			readonly _serviceBrand: undefined;
		}
		const IInstantConstructService = createDecorator<IInstantConstructService>('InstantConstructService');

		class LazyConstructService implements ILazyConstructService {
			static constructorCallCount = 0;

			declare readonly _serviceBrand: undefined;

			constructor() {
				LazyConstructService.constructorCallCount++;
			}
		}

		class InstantConstructService implements IInstantConstructService {
			static constructorCallCount = 0;

			declare readonly _serviceBrand: undefined;

			constructor() {
				InstantConstructService.constructorCallCount++;
			}
		}

		const services = new ServiceCollection();
		const descriptorLazy = new SyncDescriptor(LazyConstructService, [], true);
		const descriptorInstant = new SyncDescriptor(InstantConstructService, [], false);
		services.set(ILazyConstructService, descriptorLazy);
		services.set(IInstantConstructService, descriptorInstant);

		const instantiationService = new InstantiationService(services);
		await new Promise<void>((resolve) => {
			instantiationService.invokeFunction((accessor) => {
				accessor.get(ILazyConstructService);
				accessor.get(IInstantConstructService);
				resolve();
			});
		});

		expect(InstantConstructService.constructorCallCount).toBe(1);
		expect(LazyConstructService.constructorCallCount).toBe(0);
	});
});
