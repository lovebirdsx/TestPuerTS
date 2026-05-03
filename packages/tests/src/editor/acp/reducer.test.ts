import { describe, it, expect } from '../../testRunner';
import {
	reduceEvent,
	createInitialState,
	splitArgs,
	addMessage,
	appendStreamMessage,
	upsertTool,
	type AcpPanelState,
} from 'editor';
import type { AcpUiEvent } from '@universe-agent/acp-client-ue';

function init(): AcpPanelState {
	return createInitialState();
}

describe('AcpClientPanel reducer - status / connection', () => {
	it('status_changed updates status, preserves error when message absent', () => {
		const next = reduceEvent(
			{ ...init(), error: 'old error' },
			{
				type: 'status_changed',
				status: 'connected',
			},
		);
		expect(next.status).toBe('connected');
		expect(next.error).toBe('old error');
	});

	it('status_changed with message overwrites error', () => {
		const next = reduceEvent(init(), {
			type: 'status_changed',
			status: 'error',
			message: 'boom',
		});
		expect(next.status).toBe('error');
		expect(next.error).toBe('boom');
	});

	it('initialized stores agent name and version with fallbacks', () => {
		const a = reduceEvent(init(), {
			type: 'initialized',
			result: { agentInfo: { name: 'foo', version: '1.0' } } as any,
		});
		expect(a.agentName).toBe('foo');
		expect(a.agentVersion).toBe('1.0');

		const b = reduceEvent(init(), { type: 'initialized', result: {} as any });
		expect(b.agentName).toBe('agent');
		expect(b.agentVersion).toBe('');
	});
});

describe('AcpClientPanel reducer - sessions', () => {
	it('session_changed sets sessionId, configOptions, modes and appends system message', () => {
		const next = reduceEvent(init(), {
			type: 'session_changed',
			session: { sessionId: 'sess-1', configOptions: [], modes: undefined } as any,
		});
		expect(next.sessionId).toBe('sess-1');
		expect(next.messages.length).toBe(1);
		expect(next.messages[0]!.role).toBe('system');
		expect(next.messages[0]!.text).toContain('sess-1');
	});

	it('mode_updated only mutates modes when previous modes exist', () => {
		const a = reduceEvent(init(), { type: 'mode_updated', currentModeId: 'fast' });
		expect(a.modes).toBeUndefined();

		const withModes: AcpPanelState = {
			...init(),
			modes: { currentModeId: 'slow', availableModes: [{ id: 'slow' }, { id: 'fast' }] } as any,
		};
		const b = reduceEvent(withModes, { type: 'mode_updated', currentModeId: 'fast' });
		expect(b.modes!.currentModeId).toBe('fast');
	});

	it('config_options_updated replaces configOptions array', () => {
		const next = reduceEvent(init(), {
			type: 'config_options_updated',
			configOptions: [{ id: 'verbose', name: 'V', type: 'boolean', currentValue: true } as any],
		});
		expect(next.configOptions.length).toBe(1);
	});

	it('session_info_updated merges sessionInfo', () => {
		const start: AcpPanelState = { ...init(), sessionInfo: { sessionId: 's', mode: 'a' } as any };
		const next = reduceEvent(start, {
			type: 'session_info_updated',
			sessionInfo: { mode: 'b' } as any,
		});
		expect((next.sessionInfo as any).sessionId).toBe('s');
		expect((next.sessionInfo as any).mode).toBe('b');
	});

	it('usage_updated stores usage', () => {
		const next = reduceEvent(init(), { type: 'usage_updated', size: 100, used: 30 });
		expect(next.usage).toEqual({ size: 100, used: 30 });
	});
});

describe('AcpClientPanel reducer - messages', () => {
	it('message_chunk appends user message', () => {
		const next = reduceEvent(init(), { type: 'message_chunk', role: 'user', text: 'hi' });
		expect(next.messages.length).toBe(1);
		expect(next.messages[0]!.role).toBe('user');
		expect(next.messages[0]!.text).toBe('hi');
	});

	it('message_chunk merges into last message of same role', () => {
		let s = reduceEvent(init(), { type: 'message_chunk', role: 'agent', text: 'hel' });
		s = reduceEvent(s, { type: 'message_chunk', role: 'agent', text: 'lo' });
		expect(s.messages.length).toBe(1);
		expect(s.messages[0]!.text).toBe('hello');
	});

	it('message_chunk role switch starts a new message', () => {
		let s = reduceEvent(init(), { type: 'message_chunk', role: 'user', text: 'a' });
		s = reduceEvent(s, { type: 'message_chunk', role: 'agent', text: 'b' });
		expect(s.messages.length).toBe(2);
	});

	it('thought_chunk appends as thought role and merges with prior thought', () => {
		let s = reduceEvent(init(), { type: 'thought_chunk', text: 'th1' });
		s = reduceEvent(s, { type: 'thought_chunk', text: 'th2' });
		expect(s.messages.length).toBe(1);
		expect(s.messages[0]!.role).toBe('thought');
		expect(s.messages[0]!.text).toBe('th1th2');
	});

	it('prompt_finished clears isPrompting and adds system message', () => {
		const start: AcpPanelState = { ...init(), isPrompting: true };
		const next = reduceEvent(start, { type: 'prompt_finished', stopReason: 'end_turn' });
		expect(next.isPrompting).toBe(false);
		expect(next.messages[next.messages.length - 1]!.text).toContain('end_turn');
	});

	it('error event appends error message and clears isPrompting', () => {
		const start: AcpPanelState = { ...init(), isPrompting: true };
		const next = reduceEvent(start, { type: 'error', message: 'kaboom' });
		expect(next.isPrompting).toBe(false);
		expect(next.error).toBe('kaboom');
		expect(next.messages[next.messages.length - 1]!.role).toBe('error');
	});
});

describe('AcpClientPanel reducer - plan / tools / commands', () => {
	it('plan_updated replaces plan list', () => {
		const next = reduceEvent(init(), {
			type: 'plan_updated',
			entries: [{ content: 'do x', status: 'pending', priority: 'high' }],
		});
		expect(next.plan.length).toBe(1);
	});

	it('commands_updated replaces commands list', () => {
		const next = reduceEvent(init(), {
			type: 'commands_updated',
			commands: [{ name: 'init' }, { name: 'help', description: 'show help' }],
		});
		expect(next.commands.length).toBe(2);
	});

	it('upsertTool inserts new and updates existing by id', () => {
		const evt = (id: string, status: string): Extract<AcpUiEvent, { type: 'tool_call_updated' }> => ({
			type: 'tool_call_updated',
			toolCallId: id,
			title: `T-${id}`,
			status,
		});
		let tools = upsertTool([], evt('a', 'pending'));
		expect(tools.length).toBe(1);
		expect(tools[0]!.status).toBe('pending');

		tools = upsertTool(tools, evt('a', 'done'));
		expect(tools.length).toBe(1);
		expect(tools[0]!.status).toBe('done');

		tools = upsertTool(tools, evt('b', 'pending'));
		expect(tools.length).toBe(2);
	});

	it('tool_call_updated wires through reducer', () => {
		const next = reduceEvent(init(), {
			type: 'tool_call_updated',
			toolCallId: 't1',
			title: 'Search',
		});
		expect(next.tools.length).toBe(1);
		expect(next.tools[0]!.title).toBe('Search');
	});
});

describe('AcpClientPanel reducer - protocol log', () => {
	it('protocol_message appends entries', () => {
		const next = reduceEvent(init(), {
			type: 'protocol_message',
			direction: 'send',
			message: { jsonrpc: '2.0', id: 1, method: 'foo' } as any,
		});
		expect(next.protocol.length).toBe(1);
		expect(next.protocol[0]!.direction).toBe('send');
	});

	it('protocol log caps at 200 entries (slice(-199) + new)', () => {
		let s: AcpPanelState = init();
		for (let i = 0; i < 250; i++) {
			s = reduceEvent(s, {
				type: 'protocol_message',
				direction: 'send',
				message: { jsonrpc: '2.0', id: i } as any,
			});
		}
		expect(s.protocol.length).toBe(200);
	});
});

describe('AcpClientPanel reducer - permission', () => {
	it('permission_requested stores the pending permission', () => {
		const pending = {
			id: 1,
			request: { sessionId: 's', toolCall: { toolCallId: 't', title: 'tc' }, options: [] } as any,
			resolve: () => {},
			cancel: () => {},
		};
		const next = reduceEvent(init(), { type: 'permission_requested', permission: pending });
		expect(next.pendingPermission).toBe(pending as any);
	});
});

describe('AcpClientPanel reducer - misc helpers', () => {
	it('addMessage assigns incrementing ids and preserves history', () => {
		const a = addMessage(init(), 'user', 'one');
		const b = addMessage(a, 'agent', 'two');
		expect(b.messages.length).toBe(2);
		expect(b.messages[0]!.id).toBeLessThan(b.messages[1]!.id);
	});

	it('appendStreamMessage starts new entry when last role differs', () => {
		const a = appendStreamMessage(init(), 'user', 'u');
		const b = appendStreamMessage(a, 'agent', 'a');
		expect(b.messages.length).toBe(2);
	});

	it('unknown event type returns same state object', () => {
		const s = init();
		const next = reduceEvent(s, { type: 'session_listed', result: { sessions: [] } } as any);
		// session_listed 走 default 分支不会返回新引用
		expect(next).toBe(s);
	});
});

describe('AcpClientPanel splitArgs', () => {
	it('returns empty for empty input', () => {
		expect(splitArgs('').length).toBe(0);
	});

	it('returns single arg', () => {
		const r = splitArgs('alpha');
		expect(r.length).toBe(1);
		expect(r[0]).toBe('alpha');
	});

	it('splits on spaces', () => {
		const r = splitArgs('a b c');
		expect(r).toEqual(['a', 'b', 'c']);
	});

	it('collapses consecutive spaces', () => {
		const r = splitArgs('a   b');
		expect(r).toEqual(['a', 'b']);
	});

	it('trims surrounding spaces', () => {
		const r = splitArgs('  a  b  ');
		expect(r).toEqual(['a', 'b']);
	});
});
