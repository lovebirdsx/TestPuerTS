import type { IChannel, IServerChannel, Event } from '@universe/lib';
import { Emitter, ProxyChannel } from '@universe/lib';

// ===== 测试用 RPC 服务定义 =====

export interface ICalculatorService {
	add(a: number, b: number): Promise<number>;
	multiply(a: number, b: number): Promise<number>;
	echo(msg: string): Promise<string>;
	onNotification: Event<string>;
}

export class CalculatorService implements ICalculatorService {
	private readonly _onNotification = new Emitter<string>();
	readonly onNotification = this._onNotification.event;

	async add(a: number, b: number): Promise<number> {
		return a + b;
	}

	async multiply(a: number, b: number): Promise<number> {
		return a * b;
	}

	async echo(msg: string): Promise<string> {
		return `[echo] ${msg}`;
	}

	notify(msg: string): void {
		this._onNotification.fire(msg);
	}

	dispose(): void {
		this._onNotification.dispose();
	}
}

// ===== 共享常量 =====

export const PIPE_NAME = '\\\\.\\pipe\\puerts-rpc-test';
export const CHANNEL_NAME = 'calculator';

// ===== 辅助：从 IChannel 创建代理服务 =====

export function createCalculatorProxy(channel: IChannel): ICalculatorService {
	return ProxyChannel.toService<ICalculatorService>(channel);
}

export function createCalculatorServerChannel(service: ICalculatorService): IServerChannel<string> {
	return ProxyChannel.fromService(service);
}
