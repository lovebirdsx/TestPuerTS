import * as React from 'react';
import { Spacer } from 'react-umg';

import { Divider, HBox, ScrollArea, Section, Tabs, Text, ToolbarButton, VBox } from '../../../ui';
import { useStoreAction, useStoreSelector } from '../../hooks/useStore';
import type { InspectorTab } from '../../store';
import { formatUnknown } from '../shared/formatters';

const center = { VerticalAlignment: 2 as any };

// ──────────────────────────────────────────────────────────────────────────
// Tab views
// ──────────────────────────────────────────────────────────────────────────

const PlanView: React.FC = () => {
	const plan = useStoreSelector((s) => s.plan);
	return (
		<ScrollArea AlwaysShowScrollbar Slot={{ Size: { SizeRule: 1, Value: 1 } }}>
			<VBox Gap={4}>
				{plan.length === 0 ? <Text Text="No plan yet" /> : undefined}
				{plan.map((entry, index) => (
					<Text key={index} Text={`${entry.status} ${entry.priority}: ${entry.content}`} AutoWrapText />
				))}
			</VBox>
		</ScrollArea>
	);
};

const ToolsView: React.FC = () => {
	const tools = useStoreSelector((s) => s.tools);
	return (
		<ScrollArea AlwaysShowScrollbar Slot={{ Size: { SizeRule: 1, Value: 1 } }}>
			<VBox Gap={4}>
				{tools.length === 0 ? <Text Text="No tool calls" /> : undefined}
				{tools.map((tool) => (
					<Section key={tool.id} Title={tool.title}>
						<Text Text={`${tool.kind ?? 'tool'} ${tool.status ?? ''}`} />
						<Text Text={formatUnknown(tool.rawInput ?? tool.rawOutput ?? tool.content)} AutoWrapText />
					</Section>
				))}
			</VBox>
		</ScrollArea>
	);
};

const ProtocolView: React.FC = () => {
	const protocol = useStoreSelector((s) => s.protocol);
	return (
		<ScrollArea AlwaysShowScrollbar Slot={{ Size: { SizeRule: 1, Value: 1 } }}>
			<VBox Gap={4}>
				{protocol.length === 0 ? <Text Text="Protocol log is empty" /> : undefined}
				{protocol.map((item) => (
					<Text key={item.id} Text={`${item.direction} ${formatUnknown(item.message)}`} AutoWrapText />
				))}
			</VBox>
		</ScrollArea>
	);
};

const StateView: React.FC = () => {
	const status = useStoreSelector((s) => s.status);
	const sessionId = useStoreSelector((s) => s.sessionId);
	const usage = useStoreSelector((s) => s.usage);
	const messageCount = useStoreSelector((s) => s.messages.length);
	const toolCount = useStoreSelector((s) => s.tools.length);
	const error = useStoreSelector((s) => s.error);

	return (
		<VBox Gap={4}>
			<Text Text={`Status: ${status}`} />
			<Text Text={`Session: ${sessionId ?? 'none'}`} />
			<Text Text={`Usage: ${usage ? `${usage.used}/${usage.size}` : 'n/a'}`} />
			<Text Text={`Messages: ${messageCount}`} />
			<Text Text={`Tools: ${toolCount}`} />
			{error ? <Text Text={`Error: ${error}`} /> : undefined}
		</VBox>
	);
};

const CommandsView: React.FC = () => {
	const commands = useStoreSelector((s) => s.commands);
	return (
		<ScrollArea AlwaysShowScrollbar Slot={{ Size: { SizeRule: 1, Value: 1 } }}>
			<VBox Gap={2}>
				{commands.length === 0 ? <Text Text="No commands" /> : undefined}
				{commands.map((c) => (
					<Text key={c.name} Text={`/${c.name}${c.description ? ` - ${c.description}` : ''}`} />
				))}
			</VBox>
		</ScrollArea>
	);
};

// ──────────────────────────────────────────────────────────────────────────
// Inspector 容器
// ──────────────────────────────────────────────────────────────────────────

const TAB_ITEMS: { id: InspectorTab; label: string }[] = [
	{ id: 'plan', label: 'Plan' },
	{ id: 'tools', label: 'Tools' },
	{ id: 'protocol', label: 'Protocol' },
	{ id: 'state', label: 'State' },
	{ id: 'commands', label: 'Commands' },
];

export const Inspector: React.FC = () => {
	const activeTab = useStoreSelector((s) => s.activeTab);
	const protocolLength = useStoreSelector((s) => s.protocol.length);
	const setActiveTab = useStoreAction('setActiveTab');
	const clearProtocol = useStoreAction('clearProtocol');

	return (
		<Section Slot={{ Size: { SizeRule: 1, Value: 1 } }}>
			<HBox Gap={4}>
				<Tabs Items={TAB_ITEMS} ActiveId={activeTab} OnSelect={(id) => setActiveTab(id as InspectorTab)} />
				<Spacer Slot={{ Size: { SizeRule: 1, Value: 1 } }} />
				{activeTab === 'protocol' ? (
					<ToolbarButton OnClicked={clearProtocol} bIsEnabled={protocolLength > 0} Slot={center}>
						<Text Text="Clear" />
					</ToolbarButton>
				) : undefined}
			</HBox>
			<Divider />
			{activeTab === 'plan' ? <PlanView /> : undefined}
			{activeTab === 'tools' ? <ToolsView /> : undefined}
			{activeTab === 'protocol' ? <ProtocolView /> : undefined}
			{activeTab === 'state' ? <StateView /> : undefined}
			{activeTab === 'commands' ? <CommandsView /> : undefined}
		</Section>
	);
};
