import * as React from 'react';
import * as UE from 'ue';
import { z } from 'zod';
import { HorizontalBox, SizeBox, Spacer } from 'react-umg';
import type {
	AcpPermissionStrategy,
	AcpUiController,
	AcpUiEvent,
	JsonRpcMessage,
	PendingPermissionRequest,
	SessionConfigOption,
	SessionInfo,
	SessionModeState,
} from '@universe-agent/acp-client-ue';
import { AcpClient, type AcpClientOptions } from '@universe-agent/acp-client-ue';
import { defineStore, type DefineStoreOptions, type PersistenceStore } from '@universe-agent/editor-common';
import {
	Badge,
	Btn,
	Divider,
	HBox,
	ModalPanel,
	Panel,
	ScrollArea,
	Section,
	Select,
	Tabs,
	Text,
	TextArea,
	ToolbarButton,
	VBox,
} from './ui';
import { usePersistedState } from '../hooks/usePersistedState';

type MessageRole = 'user' | 'agent' | 'thought' | 'system' | 'error';
type InspectorTab = 'plan' | 'tools' | 'protocol' | 'settings';

interface ChatMessage {
	id: number;
	role: MessageRole;
	text: string;
}

interface ToolRecord {
	id: string;
	title: string;
	kind?: string;
	status?: string | undefined;
	rawInput?: unknown;
	rawOutput?: unknown;
	content?: unknown;
}

interface AcpPanelState {
	status: string;
	agentName: string;
	agentVersion: string;
	sessionId: string | undefined;
	configOptions: SessionConfigOption[];
	modes: SessionModeState | undefined;
	sessionInfo: SessionInfo | undefined;
	isPrompting: boolean;
	messages: ChatMessage[];
	plan: { content: string; status: string; priority: string }[];
	tools: ToolRecord[];
	commands: { name: string; description?: string }[];
	protocol: { id: number; direction: 'send' | 'recv'; message: JsonRpcMessage }[];
	usage: { size: number; used: number } | undefined;
	pendingPermission: PendingPermissionRequest | undefined;
	error: string | undefined;
}

export type { AcpPanelState, ChatMessage, ToolRecord, MessageRole, InspectorTab };

let nextMessageId = 1;
let nextProtocolId = 1;

const DEFAULT_COMMAND = 'npx universe-agent-acp';

const acpPanelConfigSchema = z.object({
	command: z.string().default(DEFAULT_COMMAND),
	workspace: z.string().default(''),
	extraArgs: z.string().default(''),
	permission: z.enum(['interactive', 'auto-approve', 'deny-all']).default('interactive'),
	protocolEnabled: z.boolean().default(false),
	autoConnect: z.boolean().default(false),
	inspector: z.enum(['plan', 'tools', 'protocol', 'settings']).default('plan'),
});

export type AcpPanelConfig = z.infer<typeof acpPanelConfigSchema>;
export type AcpPanelConfigStore = PersistenceStore<AcpPanelConfig>;

const acpPanelConfigStore: AcpPanelConfigStore = defineStore('acp-client-panel', acpPanelConfigSchema);

/**
 * 创建一个独立的 AcpPanel 配置 store。测试可用此函数构造隔离实例，避免共享模块级单例
 * 的异步 ready 回调或写入污染影响别的用例。
 */
export function createAcpPanelConfigStore(name: string, options?: DefineStoreOptions): AcpPanelConfigStore {
	return defineStore(name, acpPanelConfigSchema, options);
}

export type AcpClientFactory = (options: AcpClientOptions) => AcpClient;

const defaultAcpClientFactory: AcpClientFactory = (options) => new AcpClient(options);

export interface AcpClientPanelProps {
	// 测试或调试用：覆盖默认的 AcpClient 工厂；不传则使用真实 AcpClient（自动启动 MCP）。
	clientFactory?: AcpClientFactory;
	// 测试用：覆盖模块级持久化 store，避免共享状态在多个测试间产生副作用。
	configStore?: AcpPanelConfigStore;
}

export const AcpClientPanel = (props: AcpClientPanelProps = {}): React.ReactElement => {
	const clientFactory = props.clientFactory ?? defaultAcpClientFactory;
	const store = props.configStore ?? acpPanelConfigStore;
	const [config, updateConfig, isReady] = usePersistedState(store);
	const command = config.command !== '' ? config.command : DEFAULT_COMMAND;
	const workspace = config.workspace !== '' ? config.workspace : UE.JsRunHelper.GetProjectDir();
	const extraArgs = config.extraArgs;
	const permission = config.permission;
	const protocolEnabled = config.protocolEnabled;
	const autoConnect = config.autoConnect;
	const inspector = config.inspector;
	const setCommand = (value: string) =>
		updateConfig((s) => {
			s.command = value;
		});
	const setWorkspace = (value: string) =>
		updateConfig((s) => {
			s.workspace = value;
		});
	const setExtraArgs = (value: string) =>
		updateConfig((s) => {
			s.extraArgs = value;
		});
	const setInspector = (value: InspectorTab) =>
		updateConfig((s) => {
			s.inspector = value;
		});
	const setAutoConnect = (value: boolean) =>
		updateConfig((s) => {
			s.autoConnect = value;
		});
	const [sessionToLoad, setSessionToLoad] = React.useState('');
	const [prompt, setPrompt] = React.useState('');
	const [client, setClient] = React.useState<AcpClient | undefined>(undefined);
	const controller: AcpUiController | undefined = client?.controller;
	const [state, setState] = React.useState<AcpPanelState>(() => createInitialState());

	React.useEffect(() => {
		return () => {
			client?.dispose();
		};
	}, [client]);

	const handleEvent = React.useCallback((event: AcpUiEvent) => {
		setState((prev) => reduceEvent(prev, event));
	}, []);

	const connect = React.useCallback(() => {
		const next = clientFactory({
			command,
			args: splitArgs(extraArgs),
			workspace,
			permission,
			protocol: protocolEnabled,
			verbose: true,
		});
		next.controller.subscribe(handleEvent);
		setClient(next);
		setState(createInitialState());
		next.connect().catch((err) => {
			setState((prev) =>
				addMessage({ ...prev, status: 'error', error: errorMessage(err) }, 'error', errorMessage(err)),
			);
		});
	}, [command, clientFactory, extraArgs, handleEvent, permission, protocolEnabled, workspace]);

	const disconnect = React.useCallback(() => {
		client?.dispose();
		setClient(undefined);
	}, [client]);

	const clearMessages = React.useCallback(() => {
		setState((prev) => ({ ...prev, messages: [] }));
	}, []);

	const clearProtocol = React.useCallback(() => {
		setState((prev) => ({ ...prev, protocol: [] }));
	}, []);

	// 自动连接：store ready 之后只触发一次（避免热重载或 dispose 后反复重连）
	const autoConnectTriggeredRef = React.useRef(false);
	React.useEffect(() => {
		if (!isReady || autoConnectTriggeredRef.current) return;
		autoConnectTriggeredRef.current = true;
		if (autoConnect) connect();
	}, [isReady, autoConnect, connect]);

	const reportMcpWarnings = React.useCallback((warnings: string[]) => {
		for (const warning of warnings) {
			setState((prev) => addMessage(prev, 'system', `MCP config: ${warning}`));
		}
	}, []);

	const createSession = React.useCallback(() => {
		if (!client) return;
		client
			.newSession()
			.then(({ warnings }) => reportMcpWarnings(warnings))
			.catch((err) => {
				setState((prev) => addMessage(prev, 'error', errorMessage(err)));
			});
	}, [client, reportMcpWarnings]);

	const loadSession = React.useCallback(() => {
		const sessionId = sessionToLoad.trim();
		if (!sessionId || !client) return;
		client
			.loadSession(sessionId)
			.then(({ warnings }) => reportMcpWarnings(warnings))
			.catch((err) => {
				setState((prev) => addMessage(prev, 'error', errorMessage(err)));
			});
	}, [client, reportMcpWarnings, sessionToLoad]);

	const sendPrompt = React.useCallback(() => {
		const text = prompt.trim();
		if (!text || !controller) return;
		setPrompt('');
		setState((prev) => addMessage({ ...prev, isPrompting: true }, 'user', text));
		controller.sendPrompt(text).catch((err) => {
			setState((prev) => addMessage(prev, 'error', errorMessage(err)));
		});
	}, [controller, prompt]);

	const cancel = React.useCallback(() => {
		controller?.cancel();
		setState((prev) => addMessage({ ...prev, isPrompting: false }, 'system', 'Cancellation requested.'));
	}, [controller]);

	const changePermission = React.useCallback(
		(value: string) => {
			const next = value as AcpPermissionStrategy;
			updateConfig((s) => {
				s.permission = next;
			});
			controller?.setPermissionStrategy(next);
		},
		[controller, updateConfig],
	);

	const changeProtocol = React.useCallback(
		(value: boolean) => {
			updateConfig((s) => {
				s.protocolEnabled = value;
			});
			controller?.setProtocolEnabled(value);
		},
		[controller, updateConfig],
	);

	const connected = state.status === 'connected';

	return (
		<Panel>
			<VBox Gap={6}>
				<Toolbar
					status={state.status}
					agentName={state.agentName}
					agentVersion={state.agentVersion}
					sessionId={state.sessionId}
					isPrompting={state.isPrompting}
					connected={connected}
					autoConnect={autoConnect}
					onAutoConnect={setAutoConnect}
					onConnect={connect}
					onDisconnect={disconnect}
					onCancel={cancel}
				/>
				<HorizontalBox Slot={{ Size: { SizeRule: 1, Value: 1 } }}>
					<SizeBox WidthOverride={260} bOverride_WidthOverride Slot={{ Padding: { Right: 6 } }}>
						<Sidebar
							command={command}
							workspace={workspace}
							extraArgs={extraArgs}
							sessionToLoad={sessionToLoad}
							permission={permission}
							protocolEnabled={protocolEnabled}
							connected={connected}
							modes={state.modes}
							configOptions={state.configOptions}
							commands={state.commands}
							onCommand={setCommand}
							onWorkspace={setWorkspace}
							onExtraArgs={setExtraArgs}
							onSessionToLoad={setSessionToLoad}
							onPermission={changePermission}
							onProtocol={changeProtocol}
							onNewSession={createSession}
							onLoadSession={loadSession}
							onSetMode={(mode) => controller?.setMode(mode)}
							onSetConfig={(optionId, value) => controller?.setConfigOption(optionId, value)}
						/>
					</SizeBox>
					<VBox Slot={{ Size: { SizeRule: 1, Value: 1 }, Padding: { Right: 6 } }} Gap={6}>
						<MessageStream messages={state.messages} onClear={clearMessages} />
						<PromptBox
							prompt={prompt}
							disabled={!connected || !state.sessionId || state.isPrompting}
							isPrompting={state.isPrompting}
							onPrompt={setPrompt}
							onSend={sendPrompt}
							onCancel={cancel}
						/>
					</VBox>
					<SizeBox WidthOverride={340} bOverride_WidthOverride>
						<Inspector
							active={inspector}
							state={state}
							onSelect={setInspector}
							onClearProtocol={clearProtocol}
						/>
					</SizeBox>
				</HorizontalBox>
				{state.pendingPermission ? (
					<PermissionPanel
						permission={state.pendingPermission}
						onResolved={() => {
							setState((prev) => ({ ...prev, pendingPermission: undefined }));
						}}
					/>
				) : undefined}
			</VBox>
		</Panel>
	);
};

function Toolbar(props: {
	status: string;
	agentName: string;
	agentVersion: string;
	sessionId: string | undefined;
	isPrompting: boolean;
	connected: boolean;
	autoConnect: boolean;
	onAutoConnect: (value: boolean) => void;
	onConnect: () => void;
	onDisconnect: () => void;
	onCancel: () => void;
}): React.ReactElement {
	// EVerticalAlignment.VAlign_Center = 2 — 让顶栏所有项垂直居中对齐
	const center = { VerticalAlignment: 2 as any };
	const agentLabel = props.agentName ? `${props.agentName} ${props.agentVersion}`.trim() : 'ACP Client';
	const sessionLabel = props.sessionId ? `Session ${shortId(props.sessionId)}` : 'No session';
	return (
		<HBox Gap={8}>
			<Badge
				Text={props.status}
				Tone={props.connected ? 'accent' : props.status === 'error' ? 'error' : 'normal'}
				Slot={center}
			/>
			<Text Text={agentLabel} Slot={center} />
			<Text Text={sessionLabel} Slot={center} />
			<Spacer Slot={{ Size: { SizeRule: 1, Value: 1 } }} />
			<HBox Gap={4} Slot={center}>
				<Btn OnClicked={() => props.onAutoConnect(!props.autoConnect)}>
					<Text Text={`${props.autoConnect ? '[x]' : '[ ]'} Auto Connect`} />
				</Btn>
				<ToolbarButton OnClicked={props.connected ? props.onDisconnect : props.onConnect}>
					<Text Text={props.connected ? 'Disconnect' : 'Connect'} />
				</ToolbarButton>
				<ToolbarButton OnClicked={props.onCancel} bIsEnabled={props.isPrompting}>
					<Text Text="Cancel" />
				</ToolbarButton>
			</HBox>
		</HBox>
	);
}

function Sidebar(props: {
	command: string;
	workspace: string;
	extraArgs: string;
	sessionToLoad: string;
	permission: AcpPermissionStrategy;
	protocolEnabled: boolean;
	connected: boolean;
	modes: SessionModeState | undefined;
	configOptions: SessionConfigOption[];
	commands: { name: string; description?: string }[];
	onCommand: (value: string) => void;
	onWorkspace: (value: string) => void;
	onExtraArgs: (value: string) => void;
	onSessionToLoad: (value: string) => void;
	onPermission: (value: string) => void;
	onProtocol: (value: boolean) => void;
	onNewSession: () => void;
	onLoadSession: () => void;
	onSetMode: (mode: string) => void;
	onSetConfig: (optionId: string, value: string | boolean) => void;
}): React.ReactElement {
	return (
		<VBox Gap={6}>
			<Section Title="Connection">
				<Text Text="Command" />
				<SidebarTextArea Text={props.command} OnTextChanged={props.onCommand} bIsReadOnly={props.connected} />
				<Text Text="Workspace" />
				<SidebarTextArea
					Text={props.workspace}
					OnTextChanged={props.onWorkspace}
					bIsReadOnly={props.connected}
				/>
				<Text Text="Extra Args" />
				<SidebarTextArea
					Text={props.extraArgs}
					OnTextChanged={props.onExtraArgs}
					bIsReadOnly={props.connected}
				/>
			</Section>
			<Section Title="Session">
				<HBox>
					<Btn OnClicked={props.onNewSession} bIsEnabled={props.connected}>
						<Text Text="New" />
					</Btn>
					<Btn OnClicked={props.onLoadSession} bIsEnabled={props.connected && !!props.sessionToLoad.trim()}>
						<Text Text="Load" />
					</Btn>
				</HBox>
				<SidebarTextArea
					Text={props.sessionToLoad}
					HintText="session id"
					OnTextChanged={props.onSessionToLoad}
				/>
			</Section>
			<Section Title="Policy">
				<Select
					DefaultOptions={toTArray(['interactive', 'auto-approve', 'deny-all'])}
					SelectedOption={props.permission}
					OnSelectionChanged={props.onPermission}
				/>
				<Btn OnClicked={() => props.onProtocol(!props.protocolEnabled)}>
					<Text Text={props.protocolEnabled ? 'Protocol On' : 'Protocol Off'} />
				</Btn>
			</Section>
			<SessionOptions
				modes={props.modes}
				configOptions={props.configOptions}
				onSetMode={props.onSetMode}
				onSetConfig={props.onSetConfig}
			/>
			<Section Title="Commands">
				{props.commands.length === 0 ? <Text Text="No commands" /> : undefined}
				<SidebarTextArea
					Text={props.commands
						.map((c) => `/${c.name}${c.description ? ` - ${c.description}` : ''}`)
						.join('\n')}
					bIsReadOnly
				/>
			</Section>
		</VBox>
	);
}

function SidebarTextArea(props: React.ComponentProps<typeof TextArea>): React.ReactElement {
	return <TextArea AutoWrapText WrapTextAt={230} {...props} />;
}

function SessionOptions(props: {
	modes: SessionModeState | undefined;
	configOptions: SessionConfigOption[];
	onSetMode: (mode: string) => void;
	onSetConfig: (optionId: string, value: string | boolean) => void;
}): React.ReactElement {
	const modeOptions = props.modes?.availableModes.map((mode) => mode.id) ?? [];
	return (
		<Section Title="Session Options">
			{modeOptions.length > 0 ? (
				<>
					<Text Text="Mode" />
					<Select
						DefaultOptions={toTArray(modeOptions)}
						SelectedOption={props.modes?.currentModeId}
						OnSelectionChanged={props.onSetMode}
					/>
				</>
			) : undefined}
			{props.configOptions.map((option) => (
				<ConfigOptionControl key={option.id} option={option} onChange={props.onSetConfig} />
			))}
			{modeOptions.length === 0 && props.configOptions.length === 0 ? (
				<Text Text="No session options" />
			) : undefined}
		</Section>
	);
}

function ConfigOptionControl(props: {
	option: SessionConfigOption;
	onChange: (optionId: string, value: string | boolean) => void;
}): React.ReactElement {
	if (props.option.type === 'select') {
		const selectOption = props.option as Extract<SessionConfigOption, { type: 'select' }>;
		const values = selectOption.options?.map((o) => o.valueId) ?? [];
		return (
			<VBox Gap={2}>
				<Text Text={selectOption.name} />
				<Select
					DefaultOptions={toTArray(values)}
					SelectedOption={selectOption.currentValueId ?? values[0]}
					OnSelectionChanged={(value) => props.onChange(selectOption.id, value)}
				/>
			</VBox>
		);
	}

	if (props.option.type === 'boolean') {
		const booleanOption = props.option as Extract<SessionConfigOption, { type: 'boolean' }>;
		return (
			<Btn OnClicked={() => props.onChange(booleanOption.id, !booleanOption.currentValue)}>
				<Text Text={`${booleanOption.currentValue ? '[x]' : '[ ]'} ${booleanOption.name}`} />
			</Btn>
		);
	}

	return <Text Text={`${props.option.name ?? props.option.id}: unsupported ${props.option.type}`} />;
}

function MessageStream(props: { messages: ChatMessage[]; onClear: () => void }): React.ReactElement {
	const center = { VerticalAlignment: 2 as any };
	return (
		<Section Slot={{ Size: { SizeRule: 1, Value: 1 } }}>
			<HBox Gap={4}>
				<Text Text="Conversation" Slot={center} />
				<Spacer Slot={{ Size: { SizeRule: 1, Value: 1 } }} />
				<ToolbarButton OnClicked={props.onClear} bIsEnabled={props.messages.length > 0} Slot={center}>
					<Text Text="Clear" />
				</ToolbarButton>
			</HBox>
			<ScrollArea AlwaysShowScrollbar Slot={{ Size: { SizeRule: 1, Value: 1 } }}>
				<VBox Gap={4}>
					{props.messages.length === 0 ? (
						<Text Text="Connect, create a session, then send a prompt." />
					) : undefined}
					{props.messages.map((message) => (
						<MessageRow key={message.id} message={message} />
					))}
				</VBox>
			</ScrollArea>
		</Section>
	);
}

function MessageRow(props: { message: ChatMessage }): React.ReactElement {
	const tone = props.message.role === 'error' ? 'error' : props.message.role === 'agent' ? 'accent' : 'normal';
	return (
		<Section Tone={tone} Padding={{ Left: 6, Top: 4, Right: 6, Bottom: 4 }}>
			<HBox>
				<Badge Text={props.message.role} Tone={tone} />
			</HBox>
			<Text Text={props.message.text} AutoWrapText />
		</Section>
	);
}

function PromptBox(props: {
	prompt: string;
	disabled: boolean;
	isPrompting: boolean;
	onPrompt: (value: string) => void;
	onSend: () => void;
	onCancel: () => void;
}): React.ReactElement {
	// Ctrl+Enter 发送：MultiLineEditableTextBox 把普通 Enter 当作换行（OnTextCommitted 不触发），
	// 所以在 OnTextChanged 中检测「Ctrl 键按下且文本新增了一个换行」即触发 send。
	// sendPrompt 内部会 trim()，因此尾部的 '\n' 不需要在这里去除。
	const onTextChanged = React.useCallback(
		(text: string) => {
			const isCtrlEnter =
				text.length === props.prompt.length + 1 &&
				text.endsWith('\n') &&
				UE.KismetInputLibrary.ModifierKeysState_IsControlDown(UE.KismetInputLibrary.GetModifierKeysState());
			props.onPrompt(text);
			if (isCtrlEnter) props.onSend();
		},
		[props],
	);
	return (
		<Section>
			<TextArea
				Text={props.prompt}
				HintText="Ask the agent... (Ctrl+Enter to send)"
				OnTextChanged={onTextChanged}
				bIsReadOnly={props.disabled}
			/>
			<HBox>
				<Btn OnClicked={props.onSend} bIsEnabled={!props.disabled && !!props.prompt.trim()}>
					<Text Text="Send" />
				</Btn>
				<Btn OnClicked={props.onCancel} bIsEnabled={props.isPrompting}>
					<Text Text="Cancel" />
				</Btn>
			</HBox>
		</Section>
	);
}

function Inspector(props: {
	active: InspectorTab;
	state: AcpPanelState;
	onSelect: (tab: InspectorTab) => void;
	onClearProtocol: () => void;
}): React.ReactElement {
	const center = { VerticalAlignment: 2 as any };
	return (
		<Section Slot={{ Size: { SizeRule: 1, Value: 1 } }}>
			<HBox Gap={4}>
				<Tabs
					Items={[
						{ id: 'plan', label: 'Plan' },
						{ id: 'tools', label: 'Tools' },
						{ id: 'protocol', label: 'Protocol' },
						{ id: 'settings', label: 'State' },
					]}
					ActiveId={props.active}
					OnSelect={(id) => props.onSelect(id as InspectorTab)}
				/>
				<Spacer Slot={{ Size: { SizeRule: 1, Value: 1 } }} />
				{props.active === 'protocol' ? (
					<ToolbarButton
						OnClicked={props.onClearProtocol}
						bIsEnabled={props.state.protocol.length > 0}
						Slot={center}
					>
						<Text Text="Clear" />
					</ToolbarButton>
				) : undefined}
			</HBox>
			<Divider />
			{props.active === 'plan' ? <PlanView plan={props.state.plan} /> : undefined}
			{props.active === 'tools' ? <ToolsView tools={props.state.tools} /> : undefined}
			{props.active === 'protocol' ? <ProtocolView protocol={props.state.protocol} /> : undefined}
			{props.active === 'settings' ? <StateView state={props.state} /> : undefined}
		</Section>
	);
}

function PlanView(props: { plan: AcpPanelState['plan'] }): React.ReactElement {
	return (
		<ScrollArea AlwaysShowScrollbar Slot={{ Size: { SizeRule: 1, Value: 1 } }}>
			<VBox Gap={4}>
				{props.plan.length === 0 ? <Text Text="No plan yet" /> : undefined}
				{props.plan.map((entry, index) => (
					<Text key={index} Text={`${entry.status} ${entry.priority}: ${entry.content}`} AutoWrapText />
				))}
			</VBox>
		</ScrollArea>
	);
}

function ToolsView(props: { tools: ToolRecord[] }): React.ReactElement {
	return (
		<ScrollArea AlwaysShowScrollbar Slot={{ Size: { SizeRule: 1, Value: 1 } }}>
			<VBox Gap={4}>
				{props.tools.length === 0 ? <Text Text="No tool calls" /> : undefined}
				{props.tools.map((tool) => (
					<Section key={tool.id} Title={tool.title}>
						<Text Text={`${tool.kind ?? 'tool'} ${tool.status ?? ''}`} />
						<Text Text={formatUnknown(tool.rawInput ?? tool.rawOutput ?? tool.content)} AutoWrapText />
					</Section>
				))}
			</VBox>
		</ScrollArea>
	);
}

function ProtocolView(props: { protocol: AcpPanelState['protocol'] }): React.ReactElement {
	return (
		<ScrollArea AlwaysShowScrollbar Slot={{ Size: { SizeRule: 1, Value: 1 } }}>
			<VBox Gap={4}>
				{props.protocol.length === 0 ? <Text Text="Protocol log is empty" /> : undefined}
				{props.protocol.map((item) => (
					<Text key={item.id} Text={`${item.direction} ${formatUnknown(item.message)}`} AutoWrapText />
				))}
			</VBox>
		</ScrollArea>
	);
}

function StateView(props: { state: AcpPanelState }): React.ReactElement {
	return (
		<VBox Gap={4}>
			<Text Text={`Status: ${props.state.status}`} />
			<Text Text={`Session: ${props.state.sessionId ?? 'none'}`} />
			<Text
				Text={`Usage: ${props.state.usage ? `${props.state.usage.used}/${props.state.usage.size}` : 'n/a'}`}
			/>
			<Text Text={`Messages: ${props.state.messages.length}`} />
			<Text Text={`Tools: ${props.state.tools.length}`} />
			{props.state.error ? <Text Text={`Error: ${props.state.error}`} /> : undefined}
		</VBox>
	);
}

function PermissionPanel(props: { permission: PendingPermissionRequest; onResolved: () => void }): React.ReactElement {
	const request = props.permission.request;
	return (
		<ModalPanel>
			<VBox Gap={6}>
				<Text Text={`Permission Required: ${request.toolCall.title ?? request.toolCall.toolCallId}`} />
				<Text Text={formatUnknown(request.toolCall.rawInput)} AutoWrapText />
				<HBox>
					{request.options.map((option) => (
						<Btn
							key={option.optionId}
							OnClicked={() => {
								props.permission.resolve(option.optionId);
								props.onResolved();
							}}
						>
							<Text Text={option.name} />
						</Btn>
					))}
					<Btn
						OnClicked={() => {
							props.permission.cancel();
							props.onResolved();
						}}
					>
						<Text Text="Cancel" />
					</Btn>
				</HBox>
			</VBox>
		</ModalPanel>
	);
}

function createInitialState(): AcpPanelState {
	return {
		status: 'disconnected',
		agentName: '',
		agentVersion: '',
		sessionId: undefined,
		configOptions: [],
		modes: undefined,
		sessionInfo: undefined,
		isPrompting: false,
		messages: [],
		plan: [],
		tools: [],
		commands: [],
		protocol: [],
		usage: undefined,
		pendingPermission: undefined,
		error: undefined,
	};
}

function reduceEvent(state: AcpPanelState, event: AcpUiEvent): AcpPanelState {
	switch (event.type) {
		case 'status_changed':
			return { ...state, status: event.status, error: event.message ?? state.error };
		case 'initialized':
			return {
				...state,
				agentName: event.result.agentInfo?.name ?? 'agent',
				agentVersion: event.result.agentInfo?.version ?? '',
			};
		case 'session_changed':
			return addMessage(
				{
					...state,
					sessionId: event.session.sessionId,
					configOptions: event.session.configOptions ?? [],
					modes: event.session.modes ?? undefined,
					sessionInfo: event.session.sessionInfo ?? { sessionId: event.session.sessionId },
				},
				'system',
				`Session ready: ${event.session.sessionId}`,
			);
		case 'message_chunk':
			return appendStreamMessage(state, event.role, event.text);
		case 'thought_chunk':
			return appendStreamMessage(state, 'thought', event.text);
		case 'plan_updated':
			return { ...state, plan: event.entries };
		case 'tool_call_updated':
			return { ...state, tools: upsertTool(state.tools, event) };
		case 'commands_updated':
			return { ...state, commands: event.commands };
		case 'mode_updated':
			return {
				...state,
				modes: state.modes ? { ...state.modes, currentModeId: event.currentModeId } : state.modes,
			};
		case 'config_options_updated':
			return { ...state, configOptions: event.configOptions };
		case 'session_info_updated':
			return { ...state, sessionInfo: { ...state.sessionInfo, ...event.sessionInfo } };
		case 'usage_updated':
			return { ...state, usage: { size: event.size, used: event.used } };
		case 'protocol_message':
			return {
				...state,
				protocol: [
					...state.protocol.slice(-199),
					{ id: nextProtocolId++, direction: event.direction, message: event.message },
				],
			};
		case 'permission_requested':
			return { ...state, pendingPermission: event.permission };
		case 'prompt_finished':
			return addMessage({ ...state, isPrompting: false }, 'system', `Stop reason: ${event.stopReason}`);
		case 'error':
			return addMessage({ ...state, error: event.message, isPrompting: false }, 'error', event.message);
		default:
			return state;
	}
}

function appendStreamMessage(state: AcpPanelState, role: MessageRole, text: string): AcpPanelState {
	const last = state.messages[state.messages.length - 1];
	if (last && last.role === role) {
		return {
			...state,
			messages: [...state.messages.slice(0, -1), { ...last, text: last.text + text }],
		};
	}
	return addMessage(state, role, text);
}

function addMessage(state: AcpPanelState, role: MessageRole, text: string): AcpPanelState {
	return {
		...state,
		messages: [...state.messages, { id: nextMessageId++, role, text }],
	};
}

function upsertTool(tools: ToolRecord[], event: Extract<AcpUiEvent, { type: 'tool_call_updated' }>): ToolRecord[] {
	const index = tools.findIndex((tool) => tool.id === event.toolCallId);
	const next: ToolRecord = {
		id: event.toolCallId,
		title: event.title,
		kind: event.kind,
		status: event.status,
		rawInput: event.rawInput,
		rawOutput: event.rawOutput,
		content: event.content,
	};
	if (index < 0) {
		return [...tools, next];
	}
	const previous = tools[index]!;
	return [...tools.slice(0, index), { ...previous, ...next }, ...tools.slice(index + 1)];
}

function splitArgs(input: string): string[] {
	return input
		.split(' ')
		.map((part) => part.trim())
		.filter(Boolean);
}

function toTArray(values: string[]): UE.TArray<string> {
	const array = UE.NewArray(UE.BuiltinString);
	values.forEach((value) => array.Add(value));
	return array;
}

function formatUnknown(value: unknown): string {
	if (value === undefined || value === undefined) return '';
	try {
		return JSON.stringify(value, undefined, 2);
	} catch {
		return String(value);
	}
}

function errorMessage(err: unknown): string {
	return err instanceof Error ? err.message : String(err);
}

function shortId(id: string): string {
	return id.length > 12 ? `${id.slice(0, 12)}...` : id;
}

// 测试用：导出 reducer 与初始状态工厂，便于 L1 纯函数测试覆盖
export { reduceEvent, createInitialState, splitArgs, addMessage, appendStreamMessage, upsertTool, errorMessage };
