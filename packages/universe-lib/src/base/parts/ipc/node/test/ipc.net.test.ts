import { describe, it, beforeEach, expect } from 'vitest';
import { EventEmitter } from 'events';
import { AddressInfo, connect, createServer, Server, Socket } from 'net';
import { tmpdir } from 'os';
import { Barrier, timeout } from '../../../../common/async';
import { VSBuffer } from '../../../../common/buffer';
import { Emitter, Event } from '../../../../common/event';
import { Disposable, DisposableStore } from '../../../../common/lifecycle';
import {
	ILoadEstimator,
	PersistentProtocol,
	Protocol,
	ProtocolConstants,
	SocketCloseEvent,
	SocketDiagnosticsEventType,
} from '../../common/ipc.net';
import {
	createRandomIPCHandle,
	createStaticIPCHandle,
	connect as ipcConnect,
	NodeSocket,
	serve as ipcServe,
	WebSocketNodeSocket,
} from '../ipc.net';
import { runWithFakedTimers } from '../../../../test/timeTravelScheduler';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../test/utils';
import { flakySuite } from '../../../../test/testUtils';
import { CancellationToken } from '../../../../common/cancellation';
import { IServerChannel, ProxyChannel } from '../../common/ipc';
import { CancellationError } from '../../../../common/errors';
import { URI } from '../../../../index.common';

class MessageStream extends Disposable {
	private _currentComplete: ((data: VSBuffer) => void) | null;
	private _messages: VSBuffer[];

	constructor(x: Protocol | PersistentProtocol) {
		super();
		this._currentComplete = null;
		this._messages = [];
		this._register(
			x.onMessage((data) => {
				this._messages.push(data);
				this._trigger();
			}),
		);
	}

	private _trigger(): void {
		if (!this._currentComplete) {
			return;
		}
		if (this._messages.length === 0) {
			return;
		}
		const complete = this._currentComplete;
		const msg = this._messages.shift()!;

		this._currentComplete = null;
		complete(msg);
	}

	public waitForOne(): Promise<VSBuffer> {
		return new Promise<VSBuffer>((complete) => {
			this._currentComplete = complete;
			this._trigger();
		});
	}
}

class EtherStream extends EventEmitter {
	constructor(
		private readonly _ether: Ether,
		private readonly _name: 'a' | 'b',
	) {
		super();
	}

	write(data: Buffer, _cb?: Function): boolean {
		if (!Buffer.isBuffer(data)) {
			throw new Error(`Invalid data`);
		}
		this._ether.write(this._name, data);
		return true;
	}

	destroy(): void {}
}

class Ether {
	private readonly _a: EtherStream;
	private readonly _b: EtherStream;

	private _ab: Buffer[];
	private _ba: Buffer[];

	public get a(): Socket {
		return <any>this._a;
	}

	public get b(): Socket {
		return <any>this._b;
	}

	constructor(private readonly _wireLatency = 0) {
		this._a = new EtherStream(this, 'a');
		this._b = new EtherStream(this, 'b');
		this._ab = [];
		this._ba = [];
	}

	public write(from: 'a' | 'b', data: Buffer): void {
		setTimeout(() => {
			if (from === 'a') {
				this._ab.push(data);
			} else {
				this._ba.push(data);
			}

			setTimeout(() => this._deliver(), 0);
		}, this._wireLatency);
	}

	private _deliver(): void {
		if (this._ab.length > 0) {
			const data = Buffer.concat(this._ab);
			this._ab.length = 0;
			this._b.emit('data', data);
			setTimeout(() => this._deliver(), 0);
			return;
		}

		if (this._ba.length > 0) {
			const data = Buffer.concat(this._ba);
			this._ba.length = 0;
			this._a.emit('data', data);
			setTimeout(() => this._deliver(), 0);
			return;
		}
	}
}

describe('IPC, Socket Protocol', () => {
	ensureNoDisposablesAreLeakedInTestSuite();

	let ether: Ether;

	beforeEach(() => {
		ether = new Ether();
	});

	it('read/write', async () => {
		const a = new Protocol(new NodeSocket(ether.a));
		const b = new Protocol(new NodeSocket(ether.b));
		const bMessages = new MessageStream(b);

		a.send(VSBuffer.fromString('foobarfarboo'));
		const msg1 = await bMessages.waitForOne();
		expect(msg1.toString()).toBe('foobarfarboo');

		const buffer = VSBuffer.alloc(1);
		buffer.writeUInt8(123, 0);
		a.send(buffer);
		const msg2 = await bMessages.waitForOne();
		expect(msg2.readUInt8(0)).toBe(123);

		bMessages.dispose();
		a.dispose();
		b.dispose();
	});

	it('read/write, object data', async () => {
		const a = new Protocol(new NodeSocket(ether.a));
		const b = new Protocol(new NodeSocket(ether.b));
		const bMessages = new MessageStream(b);

		const data = {
			pi: Math.PI,
			foo: 'bar',
			more: true,
			data: 'Hello World'.split(''),
		};

		a.send(VSBuffer.fromString(JSON.stringify(data)));
		const msg = await bMessages.waitForOne();
		expect(JSON.parse(msg.toString())).toEqual(data);

		bMessages.dispose();
		a.dispose();
		b.dispose();
	});
});

describe('PersistentProtocol reconnection', () => {
	ensureNoDisposablesAreLeakedInTestSuite();

	it('acks get piggybacked with messages', async () => {
		// 加入自定义的负载估算器，如果使用默认的负载估算器，会导致没有释放的定时器
		const loadEstimator: ILoadEstimator = {
			hasHighLoad: () => false,
		};

		const ether = new Ether();
		const a = new PersistentProtocol({ socket: new NodeSocket(ether.a), loadEstimator });
		const aMessages = new MessageStream(a);
		const b = new PersistentProtocol({ socket: new NodeSocket(ether.b), loadEstimator });
		const bMessages = new MessageStream(b);

		a.send(VSBuffer.fromString('a1'));
		expect(a.unacknowledgedCount).toBe(1);
		expect(b.unacknowledgedCount).toBe(0);

		a.send(VSBuffer.fromString('a2'));
		expect(a.unacknowledgedCount).toBe(2);
		expect(b.unacknowledgedCount).toBe(0);

		a.send(VSBuffer.fromString('a3'));
		expect(a.unacknowledgedCount).toBe(3);
		expect(b.unacknowledgedCount).toBe(0);

		const a1 = await bMessages.waitForOne();
		expect(a1.toString()).toBe('a1');
		expect(a.unacknowledgedCount).toBe(3);
		expect(b.unacknowledgedCount).toBe(0);

		const a2 = await bMessages.waitForOne();
		expect(a2.toString()).toBe('a2');
		expect(a.unacknowledgedCount).toBe(3);
		expect(b.unacknowledgedCount).toBe(0);

		const a3 = await bMessages.waitForOne();
		expect(a3.toString()).toBe('a3');
		expect(a.unacknowledgedCount).toBe(3);
		expect(b.unacknowledgedCount).toBe(0);

		b.send(VSBuffer.fromString('b1'));
		expect(a.unacknowledgedCount).toBe(3);
		expect(b.unacknowledgedCount).toBe(1);

		const b1 = await aMessages.waitForOne();
		expect(b1.toString()).toBe('b1');
		expect(a.unacknowledgedCount).toBe(0);
		expect(b.unacknowledgedCount).toBe(1);

		a.send(VSBuffer.fromString('a4'));
		expect(a.unacknowledgedCount).toBe(1);
		expect(b.unacknowledgedCount).toBe(1);

		const b2 = await bMessages.waitForOne();
		expect(b2.toString()).toBe('a4');
		expect(a.unacknowledgedCount).toBe(1);
		expect(b.unacknowledgedCount).toBe(0);

		aMessages.dispose();
		bMessages.dispose();
		a.dispose();
		b.dispose();
	});

	it('ack gets sent after a while', async () => {
		await runWithFakedTimers({ useFakeTimers: true, maxTaskCount: 100 }, async () => {
			const loadEstimator: ILoadEstimator = {
				hasHighLoad: () => false,
			};
			const ether = new Ether();
			const aSocket = new NodeSocket(ether.a);
			const a = new PersistentProtocol({ socket: aSocket, loadEstimator });
			const aMessages = new MessageStream(a);
			const bSocket = new NodeSocket(ether.b);
			const b = new PersistentProtocol({ socket: bSocket, loadEstimator });
			const bMessages = new MessageStream(b);

			// send one message A -> B
			a.send(VSBuffer.fromString('a1'));
			expect(a.unacknowledgedCount).toBe(1);
			expect(b.unacknowledgedCount).toBe(0);
			const a1 = await bMessages.waitForOne();
			expect(a1.toString()).toBe('a1');
			expect(a.unacknowledgedCount).toBe(1);
			expect(b.unacknowledgedCount).toBe(0);

			// wait for ack to arrive B -> A
			await timeout(2 * ProtocolConstants.AcknowledgeTime);
			expect(a.unacknowledgedCount).toBe(0);
			expect(b.unacknowledgedCount).toBe(0);

			aMessages.dispose();
			bMessages.dispose();
			a.dispose();
			b.dispose();
		});
	});

	it('messages that are never written to a socket should not cause an ack timeout', async () => {
		await runWithFakedTimers(
			{
				useFakeTimers: true,
				useSetImmediate: true,
				maxTaskCount: 1000,
			},
			async () => {
				// Date.now() in fake timers starts at 0, which is very inconvenient
				// since we want to test exactly that a certain field is not initialized with Date.now()
				// As a workaround we wait such that Date.now() starts producing more realistic values
				await timeout(60 * 60 * 1000);

				const loadEstimator: ILoadEstimator = {
					hasHighLoad: () => false,
				};
				const ether = new Ether();
				const aSocket = new NodeSocket(ether.a);
				const a = new PersistentProtocol({ socket: aSocket, loadEstimator, sendKeepAlive: false });
				const aMessages = new MessageStream(a);
				const bSocket = new NodeSocket(ether.b);
				const b = new PersistentProtocol({ socket: bSocket, loadEstimator, sendKeepAlive: false });
				const bMessages = new MessageStream(b);

				// send message a1 before reconnection to get _recvAckCheck() scheduled
				a.send(VSBuffer.fromString('a1'));
				expect(a.unacknowledgedCount).toBe(1);
				expect(b.unacknowledgedCount).toBe(0);

				// read message a1 at B
				const a1 = await bMessages.waitForOne();
				expect(a1.toString()).toBe('a1');
				expect(a.unacknowledgedCount).toBe(1);
				expect(b.unacknowledgedCount).toBe(0);

				// send message b1 to send the ack for a1
				b.send(VSBuffer.fromString('b1'));
				expect(a.unacknowledgedCount).toBe(1);
				expect(b.unacknowledgedCount).toBe(1);

				// read message b1 at A to receive the ack for a1
				const b1 = await aMessages.waitForOne();
				expect(b1.toString()).toBe('b1');
				expect(a.unacknowledgedCount).toBe(0);
				expect(b.unacknowledgedCount).toBe(1);

				// begin reconnection
				aSocket.dispose();
				const aSocket2 = new NodeSocket(ether.a);
				a.beginAcceptReconnection(aSocket2, null);

				let timeoutListenerCalled = false;
				const socketTimeoutListener = a.onSocketTimeout(() => {
					timeoutListenerCalled = true;
				});

				// send message 2 during reconnection
				a.send(VSBuffer.fromString('a2'));
				expect(a.unacknowledgedCount).toBe(1);
				expect(b.unacknowledgedCount).toBe(1);

				// wait for scheduled _recvAckCheck() to execute
				await timeout(2 * ProtocolConstants.TimeoutTime);

				expect(a.unacknowledgedCount).toBe(1);
				expect(b.unacknowledgedCount).toBe(1);
				expect(timeoutListenerCalled).toBe(false);

				a.endAcceptReconnection();
				expect(timeoutListenerCalled).toBe(false);

				await timeout(2 * ProtocolConstants.TimeoutTime);
				expect(a.unacknowledgedCount).toBe(0);
				expect(b.unacknowledgedCount).toBe(0);
				expect(timeoutListenerCalled).toBe(false);

				socketTimeoutListener.dispose();
				aMessages.dispose();
				bMessages.dispose();
				a.dispose();
				b.dispose();
			},
		);
	});

	it('acks are always sent after a reconnection', async () => {
		await runWithFakedTimers(
			{
				useFakeTimers: true,
				useSetImmediate: true,
				maxTaskCount: 1000,
			},
			async () => {
				const loadEstimator: ILoadEstimator = {
					hasHighLoad: () => false,
				};
				const wireLatency = 1000;
				const ether = new Ether(wireLatency);
				const aSocket = new NodeSocket(ether.a);
				const a = new PersistentProtocol({ socket: aSocket, loadEstimator });
				const aMessages = new MessageStream(a);
				const bSocket = new NodeSocket(ether.b);
				const b = new PersistentProtocol({ socket: bSocket, loadEstimator });
				const bMessages = new MessageStream(b);

				// send message a1 to have something unacknowledged
				a.send(VSBuffer.fromString('a1'));
				expect(a.unacknowledgedCount).toBe(1);
				expect(b.unacknowledgedCount).toBe(0);

				// read message a1 at B
				const a1 = await bMessages.waitForOne();
				expect(a1.toString()).toBe('a1');
				expect(a.unacknowledgedCount).toBe(1);
				expect(b.unacknowledgedCount).toBe(0);

				// wait for B to send an ACK message,
				// but resume before A receives it
				await timeout(ProtocolConstants.AcknowledgeTime + wireLatency / 2);
				expect(a.unacknowledgedCount).toBe(1);
				expect(b.unacknowledgedCount).toBe(0);

				// simulate complete reconnection
				aSocket.dispose();
				bSocket.dispose();
				const ether2 = new Ether(wireLatency);
				const aSocket2 = new NodeSocket(ether2.a);
				const bSocket2 = new NodeSocket(ether2.b);
				b.beginAcceptReconnection(bSocket2, null);
				b.endAcceptReconnection();
				a.beginAcceptReconnection(aSocket2, null);
				a.endAcceptReconnection();

				// wait for quite some time
				await timeout(2 * ProtocolConstants.AcknowledgeTime + wireLatency);
				expect(a.unacknowledgedCount).toBe(0);
				expect(b.unacknowledgedCount).toBe(0);

				aMessages.dispose();
				bMessages.dispose();
				a.dispose();
				b.dispose();
			},
		);
	});

	it('onSocketTimeout is emitted at most once every 20s', async () => {
		await runWithFakedTimers(
			{
				useFakeTimers: true,
				useSetImmediate: true,
				maxTaskCount: 1000,
			},
			async () => {
				const loadEstimator: ILoadEstimator = {
					hasHighLoad: () => false,
				};
				const ether = new Ether();
				const aSocket = new NodeSocket(ether.a);
				const a = new PersistentProtocol({ socket: aSocket, loadEstimator });
				const aMessages = new MessageStream(a);
				const bSocket = new NodeSocket(ether.b);
				const b = new PersistentProtocol({ socket: bSocket, loadEstimator });
				const bMessages = new MessageStream(b);

				// never receive acks
				b.pauseSocketWriting();

				// send message a1 to have something unacknowledged
				a.send(VSBuffer.fromString('a1'));

				// wait for the first timeout to fire
				await Event.toPromise(a.onSocketTimeout);

				let timeoutFiredAgain = false;
				const timeoutListener = a.onSocketTimeout(() => {
					timeoutFiredAgain = true;
				});

				// send more messages
				a.send(VSBuffer.fromString('a2'));
				a.send(VSBuffer.fromString('a3'));

				// wait for 10s
				await timeout(ProtocolConstants.TimeoutTime / 2);

				expect(timeoutFiredAgain).toBe(false);

				timeoutListener.dispose();
				aMessages.dispose();
				bMessages.dispose();
				a.dispose();
				b.dispose();
			},
		);
	});

	it('writing can be paused', async () => {
		await runWithFakedTimers({ useFakeTimers: true, maxTaskCount: 100 }, async () => {
			const loadEstimator: ILoadEstimator = {
				hasHighLoad: () => false,
			};
			const ether = new Ether();
			const aSocket = new NodeSocket(ether.a);
			const a = new PersistentProtocol({ socket: aSocket, loadEstimator });
			const aMessages = new MessageStream(a);
			const bSocket = new NodeSocket(ether.b);
			const b = new PersistentProtocol({ socket: bSocket, loadEstimator });
			const bMessages = new MessageStream(b);

			// send one message A -> B
			a.send(VSBuffer.fromString('a1'));
			const a1 = await bMessages.waitForOne();
			expect(a1.toString()).toBe('a1');

			// ask A to pause writing
			b.sendPause();

			// send a message B -> A
			b.send(VSBuffer.fromString('b1'));
			const b1 = await aMessages.waitForOne();
			expect(b1.toString()).toBe('b1');

			// send a message A -> B (this should be blocked at A)
			a.send(VSBuffer.fromString('a2'));

			// wait a long time and check that not even acks are written
			await timeout(2 * ProtocolConstants.AcknowledgeTime);
			expect(a.unacknowledgedCount).toBe(1);
			expect(b.unacknowledgedCount).toBe(1);

			// ask A to resume writing
			b.sendResume();

			// check that B receives message
			const a2 = await bMessages.waitForOne();
			expect(a2.toString()).toBe('a2');

			// wait a long time and check that acks are written
			await timeout(2 * ProtocolConstants.AcknowledgeTime);
			expect(a.unacknowledgedCount).toBe(0);
			expect(b.unacknowledgedCount).toBe(0);

			aMessages.dispose();
			bMessages.dispose();
			a.dispose();
			b.dispose();
		});
	});
});

flakySuite('IPC, create handle', () => {
	it('createRandomIPCHandle', async () => {
		return testIPCHandle(createRandomIPCHandle());
	});

	it('createStaticIPCHandle', async () => {
		return testIPCHandle(createStaticIPCHandle(tmpdir(), 'test', '1.64.0'));
	});

	function testIPCHandle(_handle: string): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			const pipeName = createRandomIPCHandle();

			const server = createServer();

			server.on('error', () => {
				return new Promise(() => server.close(() => reject()));
			});

			server.listen(pipeName, () => {
				server.removeListener('error', reject);

				return new Promise(() => {
					server.close(() => resolve());
				});
			});
		});
	}
});

describe('WebSocketNodeSocket', () => {
	function toUint8Array(data: number[]): Uint8Array {
		const result = new Uint8Array(data.length);
		for (let i = 0; i < data.length; i++) {
			result[i] = data[i];
		}
		return result;
	}

	function fromUint8Array(data: Uint8Array): number[] {
		const result: number[] = [];
		for (let i = 0; i < data.length; i++) {
			result[i] = data[i];
		}
		return result;
	}

	function fromCharCodeArray(data: number[]): string {
		let result = '';
		for (let i = 0; i < data.length; i++) {
			result += String.fromCharCode(data[i]);
		}
		return result;
	}

	class FakeNodeSocket extends Disposable {
		private readonly _onData = new Emitter<VSBuffer>();
		public readonly onData = this._onData.event;

		private readonly _onClose = new Emitter<SocketCloseEvent>();
		public readonly onClose = this._onClose.event;

		public traceSocketEvent(
			_type: SocketDiagnosticsEventType,
			_data?: VSBuffer | Uint8Array | ArrayBuffer | ArrayBufferView | any,
		): void {}

		constructor() {
			super();
		}

		public fireData(data: number[]): void {
			this._onData.fire(VSBuffer.wrap(toUint8Array(data)));
		}
	}

	async function testReading(frames: number[][], permessageDeflate: boolean): Promise<string> {
		const disposables = new DisposableStore();
		const socket = new FakeNodeSocket();
		const webSocket = disposables.add(new WebSocketNodeSocket(<any>socket, permessageDeflate, null, false));

		const barrier = new Barrier();
		let remainingFrameCount = frames.length;

		let receivedData: string = '';
		disposables.add(
			webSocket.onData((buff) => {
				receivedData += fromCharCodeArray(fromUint8Array(buff.buffer));
				remainingFrameCount--;
				if (remainingFrameCount === 0) {
					barrier.open();
				}
			}),
		);

		for (let i = 0; i < frames.length; i++) {
			socket.fireData(frames[i]);
		}

		await barrier.wait();

		disposables.dispose();

		return receivedData;
	}

	it('A single-frame unmasked text message', async () => {
		const frames = [
			[0x81, 0x05, 0x48, 0x65, 0x6c, 0x6c, 0x6f], // contains "Hello"
		];
		const actual = await testReading(frames, false);
		expect(actual).toEqual('Hello');
	});

	it('A single-frame masked text message', async () => {
		const frames = [
			[0x81, 0x85, 0x37, 0xfa, 0x21, 0x3d, 0x7f, 0x9f, 0x4d, 0x51, 0x58], // contains "Hello"
		];
		const actual = await testReading(frames, false);
		expect(actual).toEqual('Hello');
	});

	it('A fragmented unmasked text message', async () => {
		// contains "Hello"
		const frames = [
			[0x01, 0x03, 0x48, 0x65, 0x6c], // contains "Hel"
			[0x80, 0x02, 0x6c, 0x6f], // contains "lo"
		];
		const actual = await testReading(frames, false);
		expect(actual).toEqual('Hello');
	});

	describe('compression', () => {
		it('A single-frame compressed text message', async () => {
			// contains "Hello"
			const frames = [
				[0xc1, 0x07, 0xf2, 0x48, 0xcd, 0xc9, 0xc9, 0x07, 0x00], // contains "Hello"
			];
			const actual = await testReading(frames, true);
			expect(actual).toEqual('Hello');
		});

		it('A fragmented compressed text message', async () => {
			// contains "Hello"
			const frames = [
				// contains "Hello"
				[0x41, 0x03, 0xf2, 0x48, 0xcd],
				[0x80, 0x04, 0xc9, 0xc9, 0x07, 0x00],
			];
			const actual = await testReading(frames, true);
			expect(actual).toEqual('Hello');
		});

		it('A single-frame non-compressed text message', async () => {
			const frames = [
				[0x81, 0x05, 0x48, 0x65, 0x6c, 0x6c, 0x6f], // contains "Hello"
			];
			const actual = await testReading(frames, true);
			expect(actual).toEqual('Hello');
		});

		it('A single-frame compressed text message followed by a single-frame non-compressed text message', async () => {
			const frames = [
				[0xc1, 0x07, 0xf2, 0x48, 0xcd, 0xc9, 0xc9, 0x07, 0x00], // contains "Hello"
				[0x81, 0x05, 0x77, 0x6f, 0x72, 0x6c, 0x64], // contains "world"
			];
			const actual = await testReading(frames, true);
			expect(actual).toEqual('Helloworld');
		});
	});

	it('Large buffers are split and sent in chunks', async () => {
		let receivingSideOnDataCallCount = 0;
		let receivingSideTotalBytes = 0;
		const receivingSideSocketClosedBarrier = new Barrier();

		const server = await listenOnRandomPort((socket) => {
			// stop the server when the first connection is received
			server.close();

			const webSocketNodeSocket = new WebSocketNodeSocket(new NodeSocket(socket), true, null, false);
			webSocketNodeSocket.onData((data) => {
				receivingSideOnDataCallCount++;
				receivingSideTotalBytes += data.byteLength;
			});

			webSocketNodeSocket.onClose(() => {
				webSocketNodeSocket.dispose();
				receivingSideSocketClosedBarrier.open();
			});
		});

		const socket = connect({
			host: '127.0.0.1',
			port: (<AddressInfo>server.address()).port,
		});

		const buff = generateRandomBuffer(1 * 1024 * 1024);

		const webSocketNodeSocket = new WebSocketNodeSocket(new NodeSocket(socket), true, null, false);
		webSocketNodeSocket.write(buff);
		await webSocketNodeSocket.drain();
		webSocketNodeSocket.dispose();
		await receivingSideSocketClosedBarrier.wait();

		expect(receivingSideTotalBytes).toBe(buff.byteLength);
		expect(receivingSideOnDataCallCount).toBe(4);
	});

	function generateRandomBuffer(size: number): VSBuffer {
		const buff = VSBuffer.alloc(size);
		for (let i = 0; i < size; i++) {
			buff.writeUInt8(Math.floor(256 * Math.random()), i);
		}
		return buff;
	}

	function listenOnRandomPort(handler: (socket: Socket) => void): Promise<Server> {
		return new Promise((resolve, reject) => {
			const server = createServer(handler).listen(0);
			server.on('listening', () => {
				resolve(server);
			});
			server.on('error', (err) => {
				reject(err);
			});
		});
	}
});

describe('Node ipc', () => {
	class TestService implements ITestService {
		private readonly _onPong = new Emitter<string>();
		readonly onPong = this._onPong.event;
		uri = URI.file('/test');

		marco(): Promise<string> {
			return Promise.resolve('polo');
		}

		error(message: string): Promise<void> {
			return Promise.reject(new Error(message));
		}

		neverComplete(): Promise<void> {
			return new Promise((_) => {});
		}

		neverCompleteCT(cancellationToken: CancellationToken): Promise<void> {
			if (cancellationToken.isCancellationRequested) {
				return Promise.reject(new CancellationError());
			}

			return new Promise((_, e) => cancellationToken.onCancellationRequested(() => e(new CancellationError())));
		}

		buffersLength(buffers: VSBuffer[]): Promise<number> {
			return Promise.resolve(buffers.reduce((r, b) => r + b.buffer.length, 0));
		}

		ping(msg: string): void {
			this._onPong.fire(msg);
		}

		context(context?: unknown): Promise<unknown> {
			return Promise.resolve(context);
		}

		getUri(): Promise<URI> {
			return Promise.resolve(this.uri!);
		}

		setUri(uri: URI): Promise<void> {
			this.uri = uri;
			return Promise.resolve();
		}
	}

	interface ITestService {
		marco(): Promise<string>;
		error(message: string): Promise<void>;
		neverComplete(): Promise<void>;
		neverCompleteCT(cancellationToken: CancellationToken): Promise<void>;
		buffersLength(buffers: VSBuffer[]): Promise<number>;
		context(): Promise<unknown>;
		getUri(): Promise<URI>;
		setUri(uri: URI): Promise<void>;

		onPong: Event<string>;
	}

	class TestChannel implements IServerChannel {
		constructor(private service: ITestService) {}

		call(_: unknown, command: string, arg: any, cancellationToken: CancellationToken): Promise<any> {
			switch (command) {
				case 'marco':
					return this.service.marco();
				case 'error':
					return this.service.error(arg);
				case 'neverComplete':
					return this.service.neverComplete();
				case 'neverCompleteCT':
					return this.service.neverCompleteCT(cancellationToken);
				case 'buffersLength':
					return this.service.buffersLength(arg);
				default:
					return Promise.reject(new Error('not implemented'));
			}
		}

		listen(_: unknown, event: string, _arg?: any): Event<any> {
			switch (event) {
				case 'onPong':
					return this.service.onPong;
				default:
					throw new Error('not implemented');
			}
		}
	}

	it('simple', async () => {
		const pipeName = createRandomIPCHandle();
		const server = await ipcServe(pipeName);
		const service = new TestService();
		const channel = new TestChannel(service);
		server.registerChannel('test', channel);
		const client = await ipcConnect(pipeName, 'client-test');
		const proxy = client.getChannel('test');

		const pong = proxy.call('marco');
		expect(await pong).toBe('polo');

		client.dispose();
		server.dispose();
	});

	it('proxy', async () => {
		const pipeName = createRandomIPCHandle();
		const server = await ipcServe(pipeName);
		const service = new TestService();

		server.registerChannel('test', ProxyChannel.fromService(service));
		const client = await ipcConnect(pipeName, 'client-test');

		const clService = ProxyChannel.toService<ITestService>(client.getChannel('test'));

		// 调用服务端的方法
		const pong = await clService.marco();
		expect(pong).toBe('polo');

		// 等待服务端的事件
		const waitPong = Event.toPromise(clService.onPong);
		service.ping('hello');
		const msg = await waitPong;
		expect(msg).toBe('hello');

		// 获取URI
		const uri = await clService.getUri();
		expect(uri.toString()).toBe('file:///test');

		// 设置URI
		await clService.setUri(URI.file('/new'));
		expect(service.uri.toString()).toBe('file:///new');

		client.dispose();
		server.dispose();
	});

	// 代理到代理
	it('proxy to proxy', async () => {
		// 服务端
		const pipeServer = createRandomIPCHandle();
		const server = await ipcServe(pipeServer);
		const service = new TestService();
		server.registerChannel('test', ProxyChannel.fromService(service));

		// 中间层
		const middleClient = await ipcConnect(pipeServer, 'client-test');
		const middleService = ProxyChannel.toService<ITestService>(middleClient.getChannel('test'));
		const pipeMiddle = createRandomIPCHandle();
		const middleServer = await ipcServe(pipeMiddle);
		middleServer.registerChannel('test', ProxyChannel.fromService(middleService, { isProxyService: true }));

		// 客户端
		const client = await ipcConnect(pipeMiddle, 'client-test');
		const clService = ProxyChannel.toService<ITestService>(client.getChannel('test'));

		// 调用服务端的方法
		const pong = await clService.marco();
		expect(pong).toBe('polo');

		// 等待服务端的事件
		const waitPong = Event.toPromise(clService.onPong);
		service.ping('hello');
		const msg = await waitPong;
		expect(msg).toBe('hello');

		server.dispose();
		middleClient.dispose();
		middleServer.dispose();
		client.dispose();
	});
});
