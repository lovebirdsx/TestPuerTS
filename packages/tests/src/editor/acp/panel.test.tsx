import * as React from 'react';
import { describe, it, expect } from '../../testRunner';
import { render, fireEvent } from '../../reactUmg/testing';
import { AcpClientPanel } from 'editor';
import { MockAcpUiController, asController } from './mockController';

function flushMicrotasks(): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('AcpClientPanel - initial render', () => {
	it('renders Connect button and disconnected status badge by default', () => {
		const view = render(
			<AcpClientPanel
				controllerFactory={() => asController(new MockAcpUiController({ command: 'foo', workspace: '.' }))}
			/>,
		);
		expect(view.queryByText('disconnected')).toBeTruthy();
		expect(view.queryByTypeWithText('Button', 'Connect')).toBeTruthy();
	});

	it('shows "No session" placeholder before connecting', () => {
		const view = render(
			<AcpClientPanel
				controllerFactory={() => asController(new MockAcpUiController({ command: 'foo', workspace: '.' }))}
			/>,
		);
		expect(view.queryByText('No session')).toBeTruthy();
	});
});

describe('AcpClientPanel - connect / disconnect', () => {
	it('clicking Connect creates controller, subscribes, and calls connect()', async () => {
		const created: MockAcpUiController[] = [];
		const view = render(
			<AcpClientPanel
				controllerFactory={(opts) => {
					const m = new MockAcpUiController(opts);
					created.push(m);
					return asController(m);
				}}
			/>,
		);

		view.act(() => fireEvent.click(view.findByTypeWithText('Button', 'Connect')));
		await flushMicrotasks();

		expect(created.length).toBe(1);
		expect(created[0]!.connectCalls).toBe(1);
	});

	it('updates badge and button when controller emits status_changed: connected', async () => {
		let mock!: MockAcpUiController;
		const view = render(
			<AcpClientPanel
				controllerFactory={(opts) => {
					mock = new MockAcpUiController(opts);
					return asController(mock);
				}}
			/>,
		);

		view.act(() => fireEvent.click(view.findByTypeWithText('Button', 'Connect')));
		await flushMicrotasks();

		view.act(() => mock.emit({ type: 'status_changed', status: 'connected' }));
		expect(view.queryByText('connected')).toBeTruthy();
		expect(view.queryByTypeWithText('Button', 'Disconnect')).toBeTruthy();
	});

	it('clicking Disconnect calls controller.disconnect()', async () => {
		let mock!: MockAcpUiController;
		const view = render(
			<AcpClientPanel
				controllerFactory={(opts) => {
					mock = new MockAcpUiController(opts);
					return asController(mock);
				}}
			/>,
		);
		view.act(() => fireEvent.click(view.findByTypeWithText('Button', 'Connect')));
		await flushMicrotasks();
		view.act(() => mock.emit({ type: 'status_changed', status: 'connected' }));

		view.act(() => fireEvent.click(view.findByTypeWithText('Button', 'Disconnect')));
		expect(mock.disconnectCalls).toBeGreaterThan(0);
	});

	it('connect failure surfaces error message', async () => {
		let mock!: MockAcpUiController;
		const view = render(
			<AcpClientPanel
				controllerFactory={(opts) => {
					mock = new MockAcpUiController(opts);
					mock.connectImpl = async () => {
						throw new Error('connect-failed');
					};
					return asController(mock);
				}}
			/>,
		);
		view.act(() => fireEvent.click(view.findByTypeWithText('Button', 'Connect')));
		await flushMicrotasks();
		view.act(() => {});

		expect(view.findAllByText('error').length).toBeGreaterThan(0);
		expect(view.findAllByText(/connect-failed/).length).toBeGreaterThan(0);
	});

	it('disconnect on unmount triggers controller.disconnect()', async () => {
		let mock!: MockAcpUiController;
		const view = render(
			<AcpClientPanel
				controllerFactory={(opts) => {
					mock = new MockAcpUiController(opts);
					return asController(mock);
				}}
			/>,
		);
		view.act(() => fireEvent.click(view.findByTypeWithText('Button', 'Connect')));
		await flushMicrotasks();

		const before = mock.disconnectCalls;
		view.unmount();
		expect(mock.disconnectCalls).toBeGreaterThan(before);
	});
});

describe('AcpClientPanel - sessions and prompts', () => {
	it('clicking New session calls controller.newSession()', async () => {
		let mock!: MockAcpUiController;
		const view = render(
			<AcpClientPanel
				controllerFactory={(opts) => {
					mock = new MockAcpUiController(opts);
					return asController(mock);
				}}
			/>,
		);
		view.act(() => fireEvent.click(view.findByTypeWithText('Button', 'Connect')));
		await flushMicrotasks();
		view.act(() => mock.emit({ type: 'status_changed', status: 'connected' }));

		view.act(() => fireEvent.click(view.findByTypeWithText('Button', 'New')));
		expect(mock.newSessionCalls).toBe(1);
	});

	it('session_changed event renders session id and system message', async () => {
		let mock!: MockAcpUiController;
		const view = render(
			<AcpClientPanel
				controllerFactory={(opts) => {
					mock = new MockAcpUiController(opts);
					return asController(mock);
				}}
			/>,
		);
		view.act(() => fireEvent.click(view.findByTypeWithText('Button', 'Connect')));
		await flushMicrotasks();
		view.act(() =>
			mock.emit({
				type: 'session_changed',
				session: { sessionId: 'abc-123-456', configOptions: [], modes: undefined } as any,
			}),
		);

		expect(view.findAllByText(/abc-123-456/).length).toBeGreaterThan(0);
		expect(view.findAllByText(/Session ready/).length).toBeGreaterThan(0);
	});

	it('message_chunk events stream into conversation', async () => {
		let mock!: MockAcpUiController;
		const view = render(
			<AcpClientPanel
				controllerFactory={(opts) => {
					mock = new MockAcpUiController(opts);
					return asController(mock);
				}}
			/>,
		);
		view.act(() => fireEvent.click(view.findByTypeWithText('Button', 'Connect')));
		await flushMicrotasks();
		view.act(() => mock.emit({ type: 'message_chunk', role: 'agent', text: 'Hello ' }));
		view.act(() => mock.emit({ type: 'message_chunk', role: 'agent', text: 'world' }));

		expect(view.queryByText('Hello world')).toBeTruthy();
	});
});

describe('AcpClientPanel - tool calls and inspector', () => {
	it('tool_call_updated populates Inspector tools tab when active', async () => {
		let mock!: MockAcpUiController;
		const view = render(
			<AcpClientPanel
				controllerFactory={(opts) => {
					mock = new MockAcpUiController(opts);
					return asController(mock);
				}}
			/>,
		);
		view.act(() => fireEvent.click(view.findByTypeWithText('Button', 'Connect')));
		await flushMicrotasks();
		view.act(() => fireEvent.click(view.findByTypeWithText('Button', 'Tools')));
		view.act(() =>
			mock.emit({
				type: 'tool_call_updated',
				toolCallId: 'tc1',
				title: 'ReadFile',
				kind: 'read',
				status: 'pending',
			}),
		);

		expect(view.queryByText('ReadFile')).toBeTruthy();
	});
});

describe('AcpClientPanel - permission modal', () => {
	it('permission_requested event opens modal with options; clicking option resolves', async () => {
		let mock!: MockAcpUiController;
		let resolvedWith: string | undefined;
		const view = render(
			<AcpClientPanel
				controllerFactory={(opts) => {
					mock = new MockAcpUiController(opts);
					return asController(mock);
				}}
			/>,
		);
		view.act(() => fireEvent.click(view.findByTypeWithText('Button', 'Connect')));
		await flushMicrotasks();

		view.act(() =>
			mock.emit({
				type: 'permission_requested',
				permission: {
					id: 1,
					request: {
						sessionId: 'sess',
						toolCall: { toolCallId: 'x', title: 'WriteFile' } as any,
						options: [
							{ optionId: 'allow_once', name: 'Allow', kind: 'allow_once' },
							{ optionId: 'reject_once', name: 'Reject', kind: 'reject_once' },
						],
					} as any,
					resolve: (id: string) => {
						resolvedWith = id;
					},
					cancel: () => {},
				},
			}),
		);

		expect(view.findAllByText(/WriteFile/).length).toBeGreaterThan(0);
		view.act(() => fireEvent.click(view.findByTypeWithText('Button', 'Allow')));
		expect(resolvedWith).toBe('allow_once');
	});

	it('cancel button on permission modal calls cancel()', async () => {
		let mock!: MockAcpUiController;
		let cancelled = false;
		const view = render(
			<AcpClientPanel
				controllerFactory={(opts) => {
					mock = new MockAcpUiController(opts);
					return asController(mock);
				}}
			/>,
		);
		view.act(() => fireEvent.click(view.findByTypeWithText('Button', 'Connect')));
		await flushMicrotasks();
		view.act(() =>
			mock.emit({
				type: 'permission_requested',
				permission: {
					id: 1,
					request: {
						sessionId: 'sess',
						toolCall: { toolCallId: 'x', title: 'WriteFile' } as any,
						options: [{ optionId: 'allow_once', name: 'Allow', kind: 'allow_once' }],
					} as any,
					resolve: () => {},
					cancel: () => {
						cancelled = true;
					},
				},
			}),
		);
		// 模态内有 Allow 按钮 + Cancel 按钮（Cancel 与 Toolbar 的 Cancel 同名，取后者会冲突，使用 findAll 取最后一个）
		const cancelButtons = view.findAllByTypeWithText('Button', 'Cancel');
		view.act(() => fireEvent.click(cancelButtons[cancelButtons.length - 1]!));
		expect(cancelled).toBe(true);
	});
});

describe('AcpClientPanel - protocol & policy controls', () => {
	it('toggling Protocol button calls controller.setProtocolEnabled', async () => {
		let mock!: MockAcpUiController;
		const view = render(
			<AcpClientPanel
				controllerFactory={(opts) => {
					mock = new MockAcpUiController(opts);
					return asController(mock);
				}}
			/>,
		);
		view.act(() => fireEvent.click(view.findByTypeWithText('Button', 'Connect')));
		await flushMicrotasks();

		// 初始按钮文案 "Protocol Off"
		view.act(() => fireEvent.click(view.findByTypeWithText('Button', 'Protocol Off')));
		expect(mock.lastProtocolEnabled).toBe(true);
	});
});

describe('AcpClientPanel - error event', () => {
	it('error event flips status badge and appends error message', async () => {
		let mock!: MockAcpUiController;
		const view = render(
			<AcpClientPanel
				controllerFactory={(opts) => {
					mock = new MockAcpUiController(opts);
					return asController(mock);
				}}
			/>,
		);
		view.act(() => fireEvent.click(view.findByTypeWithText('Button', 'Connect')));
		await flushMicrotasks();

		view.act(() => mock.emit({ type: 'error', message: 'oops' }));
		expect(view.findAllByText(/oops/).length).toBeGreaterThan(0);
	});
});
