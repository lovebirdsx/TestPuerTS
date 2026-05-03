import { BridgeTransport, type BridgeLink } from '@universe-agent/mcp-server-ue';
import { describe, it, expect } from '../testRunner';
import { createLinkedBridgeLinks } from './inMemoryBridgeLink';

class StubLink implements BridgeLink {
	sent: string[] = [];
	private msgHandler: ((line: string) => void) | null = null;
	private closeHandler: (() => void) | null = null;
	closed = false;

	send(line: string): void {
		this.sent.push(line);
	}
	onMessage(handler: (line: string) => void): void {
		this.msgHandler = handler;
	}
	onClose(handler: () => void): void {
		this.closeHandler = handler;
	}
	close(): void {
		this.closed = true;
	}

	emit(line: string): void {
		this.msgHandler?.(line);
	}
	emitClose(): void {
		this.closeHandler?.();
	}
}

describe('BridgeTransport - encode/decode', () => {
	it('serialises send() payload as JSON line on the link', async () => {
		const link = new StubLink();
		const t = new BridgeTransport(link);
		await t.start();

		await t.send({ jsonrpc: '2.0', id: 1, method: 'ping' } as any);

		expect(link.sent.length).toBe(1);
		const decoded = JSON.parse(link.sent[0]);
		expect(decoded.method).toBe('ping');
		expect(decoded.id).toBe(1);
	});

	it('parses incoming JSON line and forwards to onmessage', async () => {
		const link = new StubLink();
		const t = new BridgeTransport(link);
		const received: any[] = [];
		t.onmessage = (msg) => received.push(msg);
		await t.start();

		link.emit('{"jsonrpc":"2.0","id":7,"result":{"ok":true}}');

		expect(received.length).toBe(1);
		expect(received[0].id).toBe(7);
		expect((received[0] as any).result.ok).toBe(true);
	});

	it('reports parse errors via onerror without throwing', async () => {
		const link = new StubLink();
		const t = new BridgeTransport(link);
		const errors: Error[] = [];
		t.onerror = (err) => errors.push(err);
		t.onmessage = () => {
			throw new Error('should not be called');
		};
		await t.start();

		link.emit('not json at all');

		expect(errors.length).toBe(1);
	});

	it('ignores empty/whitespace-only lines silently', async () => {
		const link = new StubLink();
		const t = new BridgeTransport(link);
		const received: any[] = [];
		const errors: Error[] = [];
		t.onmessage = (msg) => received.push(msg);
		t.onerror = (err) => errors.push(err);
		await t.start();

		link.emit('');
		link.emit('   ');

		expect(received.length).toBe(0);
		expect(errors.length).toBe(0);
	});

	it('forwards onMessage errors to onerror', async () => {
		const link = new StubLink();
		const t = new BridgeTransport(link);
		const errors: Error[] = [];
		t.onmessage = () => {
			throw new Error('handler boom');
		};
		t.onerror = (err) => errors.push(err);
		await t.start();

		link.emit('{"jsonrpc":"2.0","id":1,"method":"x"}');

		expect(errors.length).toBe(1);
		expect(errors[0].message).toContain('handler boom');
	});

	it('propagates link close to onclose', async () => {
		const link = new StubLink();
		const t = new BridgeTransport(link);
		let closed = false;
		t.onclose = () => {
			closed = true;
		};
		await t.start();

		link.emitClose();

		expect(closed).toBe(true);
	});

	it('close() releases the underlying link', async () => {
		const link = new StubLink();
		const t = new BridgeTransport(link);
		await t.start();

		await t.close();

		expect(link.closed).toBe(true);
	});
});

describe('BridgeTransport - linked pair round-trip', () => {
	it('delivers messages bidirectionally over linked BridgeLink', async () => {
		const [clientLink, serverLink] = createLinkedBridgeLinks();
		const clientT = new BridgeTransport(clientLink);
		const serverT = new BridgeTransport(serverLink);

		const serverInbox: any[] = [];
		const clientInbox: any[] = [];
		serverT.onmessage = (m) => serverInbox.push(m);
		clientT.onmessage = (m) => clientInbox.push(m);

		await serverT.start();
		await clientT.start();

		await clientT.send({ jsonrpc: '2.0', id: 1, method: 'hello' } as any);
		await serverT.send({ jsonrpc: '2.0', id: 1, result: { greet: 'hi' } } as any);

		expect(serverInbox.length).toBe(1);
		expect(serverInbox[0].method).toBe('hello');
		expect(clientInbox.length).toBe(1);
		expect((clientInbox[0] as any).result.greet).toBe('hi');
	});
});
