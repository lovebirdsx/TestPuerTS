export const PROTOCOL_VERSION = 1;

/**
 * ACP `session/new` 与 `session/load` 请求中 `mcpServers` 数组的元素类型。
 *
 * 命令 + 参数构成一个 stdio 子进程命令，agent 自行 spawn 并通过 stdin/stdout 走 MCP JSON-RPC。
 * 与 MCP 标准一致；env 用 `{ name, value }` 数组（ACP 协议要求），不是 `Record<string,string>`。
 */
export interface McpServerEntry {
	name: string;
	command: string;
	args?: string[];
	env?: { name: string; value: string }[];
}

export interface InitializeResponse {
	protocolVersion: number;
	agentInfo?: {
		name: string;
		version?: string;
	};
	capabilities?: AgentCapabilities;
}

export interface AgentCapabilities {
	loadSession?: boolean | Record<string, unknown>;
	sessionList?: boolean | Record<string, unknown>;
	[key: string]: unknown;
}

export interface SessionMode {
	id: string;
	name?: string;
	description?: string;
}

export interface SessionModeState {
	currentModeId: string;
	availableModes: SessionMode[];
}

export type SessionConfigOption =
	| {
			type: 'select';
			id: string;
			name: string;
			description?: string;
			category?: string | null;
			currentValueId?: string | null;
			options?: { valueId: string; name: string; description?: string }[];
	  }
	| {
			type: 'boolean';
			id: string;
			name: string;
			description?: string;
			category?: string | null;
			currentValue?: boolean;
	  }
	| {
			type: string;
			id: string;
			name?: string;
			description?: string;
			category?: string | null;
			[key: string]: unknown;
	  };

export interface SessionInfo {
	sessionId: string;
	title?: string | null;
	createdAt?: string | null;
	updatedAt?: string | null;
	[key: string]: unknown;
}

export interface SessionStartResponse {
	sessionId: string;
	configOptions?: SessionConfigOption[] | null;
	modes?: SessionModeState | null;
	sessionInfo?: SessionInfo | null;
	models?: unknown;
}

export interface ListSessionsResponse {
	sessions: SessionInfo[];
	nextCursor?: string | null;
}

export interface SessionNotification {
	sessionId: string;
	update: SessionUpdate;
}

export type SessionUpdate =
	| { sessionUpdate: 'agent_message_chunk'; content: { type: string; text?: string } }
	| { sessionUpdate: 'agent_thought_chunk'; content: { type: string; text?: string } }
	| { sessionUpdate: 'user_message_chunk'; content: { type: string; text?: string } }
	| {
			sessionUpdate: 'tool_call';
			toolCallId: string;
			title: string;
			kind?: string;
			status?: string;
			rawInput?: unknown;
	  }
	| {
			sessionUpdate: 'tool_call_update';
			toolCallId: string;
			status?: string | null;
			rawOutput?: unknown;
			content?: unknown;
			title?: string | null;
	  }
	| { sessionUpdate: 'plan'; entries: { content: string; status: string; priority: string }[] }
	| { sessionUpdate: 'available_commands_update'; availableCommands: { name: string; description?: string }[] }
	| { sessionUpdate: 'current_mode_update'; currentModeId: string }
	| { sessionUpdate: 'config_option_update'; configOptions: SessionConfigOption[] }
	| ({ sessionUpdate: 'session_info_update' } & Partial<SessionInfo>)
	| { sessionUpdate: 'usage_update'; size: number; used: number }
	| { sessionUpdate: string };

export interface RequestPermissionRequest {
	toolCall: {
		toolCallId: string;
		title?: string;
		rawInput?: unknown;
	};
	options: { optionId: string; name: string; kind: string }[];
}

export interface RequestPermissionResponse {
	outcome: {
		outcome: string;
		optionId?: string;
	};
}
