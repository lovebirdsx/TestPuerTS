import * as React from 'react';
import { describe, it, expect } from '../../testRunner';
import { render, fireEvent } from '../../reactUmg/testing';
import { AcpClientPanel, createAcpPanelConfigStore, type AcpClientPanelProps } from 'editor';
import type { IFileIO } from '@universe-agent/editor-common';
import { MockAcpClient, asClient } from './mockController';

function flushMicrotasks(): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, 0));
}

// 内存 IFileIO：测试用，避免触盘 + 让每个 store 完全隔离。
function memoryFileIO(): IFileIO {
	const files = new Map<string, string>();
	return {
		async readText(path: string) {
			return files.get(path);
		},
		async writeText(path: string, content: string) {
			files.set(path, content);
		},
		async fileExists(path: string) {
			return files.has(path);
		},
		async makeDirTree() {
			/* no-op */
		},
	};
}

let storeCounter = 0;
function freshConfigStore() {
	storeCounter++;
	return createAcpPanelConfigStore(`acp-client-panel-test-${Date.now()}-${storeCounter}`, {
		fileIO: memoryFileIO(),
		// 同步默认值路径（无文件 → 默认值），但 ready 仍是 microtask；测试在 connect 前 await flushMicrotasks 兜底。
	});
}

// 包装 render：自动注入隔离的 configStore，调用方只需传额外 props。
function renderPanel(extra: Omit<AcpClientPanelProps, 'configStore'>): ReturnType<typeof render> {
	return render(<AcpClientPanel {...extra} configStore={freshConfigStore()} />);
}

describe('AcpClientPanel - initial render', () => {
	it('renders Connect button and disconnected status badge by default', () => {
		const view = renderPanel({ clientFactory: (opts) => asClient(new MockAcpClient(opts)) });
		expect(view.queryByText('disconnected')).toBeTruthy();
		expect(view.queryByTypeWithText('Button', 'Connect')).toBeTruthy();
	});

	it('shows "No session" placeholder before connecting', () => {
		const view = renderPanel({ clientFactory: (opts) => asClient(new MockAcpClient(opts)) });
		expect(view.queryByText('No session')).toBeTruthy();
	});
});

describe('AcpClientPanel - connect / disconnect', () => {
	it('clicking Connect creates client, subscribes, and calls connect()', async () => {
		const created: MockAcpClient[] = [];
		const view = renderPanel({
			clientFactory: (opts) => {
				const m = new MockAcpClient(opts);
				created.push(m);
				return asClient(m);
			},
		});

		view.act(() => fireEvent.click(view.findByTypeWithText('Button', 'Connect')));
		await flushMicrotasks();

		expect(created.length).toBe(1);
		expect(created[0]!.connectCalls).toBe(1);
	});

	it('updates badge and button when controller emits status_changed: connected', async () => {
		let mock!: MockAcpClient;
		const view = renderPanel({
			clientFactory: (opts) => {
				mock = new MockAcpClient(opts);
				return asClient(mock);
			},
		});

		view.act(() => fireEvent.click(view.findByTypeWithText('Button', 'Connect')));
		await flushMicrotasks();

		view.act(() => mock.mockController.emit({ type: 'status_changed', status: 'connected' }));
		expect(view.queryByText('connected')).toBeTruthy();
		expect(view.queryByTypeWithText('Button', 'Disconnect')).toBeTruthy();
	});

	it('clicking Disconnect calls client.dispose()', async () => {
		let mock!: MockAcpClient;
		const view = renderPanel({
			clientFactory: (opts) => {
				mock = new MockAcpClient(opts);
				return asClient(mock);
			},
		});
		view.act(() => fireEvent.click(view.findByTypeWithText('Button', 'Connect')));
		await flushMicrotasks();
		view.act(() => mock.mockController.emit({ type: 'status_changed', status: 'connected' }));

		view.act(() => fireEvent.click(view.findByTypeWithText('Button', 'Disconnect')));
		expect(mock.disposeCalls).toBeGreaterThan(0);
	});

	it('connect failure surfaces error message', async () => {
		let mock!: MockAcpClient;
		const view = renderPanel({
			clientFactory: (opts) => {
				mock = new MockAcpClient(opts);
				mock.mockController.connectImpl = async () => {
					throw new Error('connect-failed');
				};
				return asClient(mock);
			},
		});
		view.act(() => fireEvent.click(view.findByTypeWithText('Button', 'Connect')));
		await flushMicrotasks();
		view.act(() => {});

		expect(view.findAllByText('error').length).toBeGreaterThan(0);
		expect(view.findAllByText(/connect-failed/).length).toBeGreaterThan(0);
	});

	it('dispose on unmount triggers client.dispose()', async () => {
		let mock!: MockAcpClient;
		const view = renderPanel({
			clientFactory: (opts) => {
				mock = new MockAcpClient(opts);
				return asClient(mock);
			},
		});
		view.act(() => fireEvent.click(view.findByTypeWithText('Button', 'Connect')));
		await flushMicrotasks();

		const before = mock.disposeCalls;
		view.unmount();
		expect(mock.disposeCalls).toBeGreaterThan(before);
	});
});

describe('AcpClientPanel - sessions and prompts', () => {
	it('clicking New session calls client.newSession()', async () => {
		let mock!: MockAcpClient;
		const view = renderPanel({
			clientFactory: (opts) => {
				mock = new MockAcpClient(opts);
				return asClient(mock);
			},
		});
		view.act(() => fireEvent.click(view.findByTypeWithText('Button', 'Connect')));
		await flushMicrotasks();
		view.act(() => mock.mockController.emit({ type: 'status_changed', status: 'connected' }));

		view.act(() => fireEvent.click(view.findByTypeWithText('Button', 'New')));
		await flushMicrotasks();
		await flushMicrotasks();
		expect(mock.newSessionCalls).toBe(1);
	});

	it('newSession warnings render as system messages', async () => {
		let mock!: MockAcpClient;
		const view = renderPanel({
			clientFactory: (opts) => {
				mock = new MockAcpClient(opts);
				mock.newSessionImpl = async () => ({ warnings: ['bad-config'] });
				return asClient(mock);
			},
		});
		view.act(() => fireEvent.click(view.findByTypeWithText('Button', 'Connect')));
		await flushMicrotasks();
		view.act(() => mock.mockController.emit({ type: 'status_changed', status: 'connected' }));

		view.act(() => fireEvent.click(view.findByTypeWithText('Button', 'New')));
		await flushMicrotasks();
		await flushMicrotasks();
		view.act(() => {});
		expect(view.findAllByText(/MCP config: bad-config/).length).toBeGreaterThan(0);
	});

	it('session_changed event renders session id and system message', async () => {
		let mock!: MockAcpClient;
		const view = renderPanel({
			clientFactory: (opts) => {
				mock = new MockAcpClient(opts);
				return asClient(mock);
			},
		});
		view.act(() => fireEvent.click(view.findByTypeWithText('Button', 'Connect')));
		await flushMicrotasks();
		view.act(() =>
			mock.mockController.emit({
				type: 'session_changed',
				session: { sessionId: 'abc-123-456', configOptions: [], modes: undefined } as any,
			}),
		);

		expect(view.findAllByText(/abc-123-456/).length).toBeGreaterThan(0);
		expect(view.findAllByText(/Session ready/).length).toBeGreaterThan(0);
	});

	it('message_chunk events stream into conversation', async () => {
		let mock!: MockAcpClient;
		const view = renderPanel({
			clientFactory: (opts) => {
				mock = new MockAcpClient(opts);
				return asClient(mock);
			},
		});
		view.act(() => fireEvent.click(view.findByTypeWithText('Button', 'Connect')));
		await flushMicrotasks();
		view.act(() => mock.mockController.emit({ type: 'message_chunk', role: 'agent', text: 'Hello ' }));
		view.act(() => mock.mockController.emit({ type: 'message_chunk', role: 'agent', text: 'world' }));

		expect(view.queryByText('Hello world')).toBeTruthy();
	});
});

describe('AcpClientPanel - tool calls and inspector', () => {
	it('tool_call_updated populates Inspector tools tab when active', async () => {
		let mock!: MockAcpClient;
		const view = renderPanel({
			clientFactory: (opts) => {
				mock = new MockAcpClient(opts);
				return asClient(mock);
			},
		});
		view.act(() => fireEvent.click(view.findByTypeWithText('Button', 'Connect')));
		await flushMicrotasks();
		view.act(() => fireEvent.click(view.findByTypeWithText('Button', 'Tools')));
		view.act(() =>
			mock.mockController.emit({
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
		let mock!: MockAcpClient;
		let resolvedWith: string | undefined;
		const view = renderPanel({
			clientFactory: (opts) => {
				mock = new MockAcpClient(opts);
				return asClient(mock);
			},
		});
		view.act(() => fireEvent.click(view.findByTypeWithText('Button', 'Connect')));
		await flushMicrotasks();

		view.act(() =>
			mock.mockController.emit({
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
		let mock!: MockAcpClient;
		let cancelled = false;
		const view = renderPanel({
			clientFactory: (opts) => {
				mock = new MockAcpClient(opts);
				return asClient(mock);
			},
		});
		view.act(() => fireEvent.click(view.findByTypeWithText('Button', 'Connect')));
		await flushMicrotasks();
		view.act(() =>
			mock.mockController.emit({
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
		let mock!: MockAcpClient;
		const view = renderPanel({
			clientFactory: (opts) => {
				mock = new MockAcpClient(opts);
				return asClient(mock);
			},
		});
		view.act(() => fireEvent.click(view.findByTypeWithText('Button', 'Connect')));
		await flushMicrotasks();

		// 隔离 store：默认 protocolEnabled=false → 当前按钮为 'Protocol Off'，点击后应转为 true
		view.act(() => fireEvent.click(view.findByTypeWithText('Button', 'Protocol Off')));
		expect(mock.mockController.lastProtocolEnabled).toBe(true);
	});
});

describe('AcpClientPanel - error event', () => {
	it('error event flips status badge and appends error message', async () => {
		let mock!: MockAcpClient;
		const view = renderPanel({
			clientFactory: (opts) => {
				mock = new MockAcpClient(opts);
				return asClient(mock);
			},
		});
		view.act(() => fireEvent.click(view.findByTypeWithText('Button', 'Connect')));
		await flushMicrotasks();

		view.act(() => mock.mockController.emit({ type: 'error', message: 'oops' }));
		expect(view.findAllByText(/oops/).length).toBeGreaterThan(0);
	});
});
