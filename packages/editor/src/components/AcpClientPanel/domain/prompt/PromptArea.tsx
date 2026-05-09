import * as React from 'react';
import * as UE from 'ue';
import { Spacer } from 'react-umg';

import {
	Btn,
	COL_ACCENT,
	COL_FOREGROUND,
	COL_FOREGROUND_HOVER,
	HBox,
	IconBtn,
	ScrollArea,
	Section,
	Select,
	SelectableText,
	Text,
	TextArea,
	VBox,
} from '../../../ui';
import { useStoreAction, useStoreSelector } from '../../hooks/useStore';
import type { CommandEntry, SessionConfigOption, TextItem } from '../../store';
import { toTArray } from '../shared/ueArray';
import { PlanCard } from './PlanCard';
import { ToolCallCard } from './ToolCallCard';

const center = { VerticalAlignment: 2 as any };

// ──────────────────────────────────────────────────────────────────────────
// 消息流
// ──────────────────────────────────────────────────────────────────────────

function roleColor(role: TextItem['role']) {
	switch (role) {
		case 'user':
			return COL_FOREGROUND_HOVER;
		case 'agent':
			return COL_ACCENT;
		case 'thought':
		case 'system':
		default:
			return COL_FOREGROUND;
	}
}

const MessageRow: React.FC<{ item: TextItem }> = ({ item }) => {
	if (item.role === 'error') {
		return (
			<Section Tone="error" Padding={{ Left: 6, Top: 4, Right: 6, Bottom: 4 }}>
				<SelectableText Text={item.text} AutoWrapText />
			</Section>
		);
	}
	return (
		<VBox Gap={4} Slot={{ Padding: { Left: 6, Top: 2, Right: 6, Bottom: 6 } }}>
			<Text
				Text={item.role.toUpperCase()}
				Font={{ Size: 9 }}
				ColorAndOpacity={{ SpecifiedColor: roleColor(item.role) }}
			/>
			<SelectableText Text={item.text} AutoWrapText />
		</VBox>
	);
};

export const MessageStream: React.FC = () => {
	const timeline = useStoreSelector((s) => s.timeline);

	return (
		<Section Slot={{ Size: { SizeRule: 1, Value: 1 } }}>
			<ScrollArea AlwaysShowScrollbar Slot={{ Size: { SizeRule: 1, Value: 1 } }}>
				<VBox Gap={4}>
					{timeline.length === 0 ? <Text Text="Connect, create a session, then send a prompt." /> : undefined}
					{timeline.map((item) => {
						if (item.kind === 'text') return <MessageRow key={item.id} item={item} />;
						if (item.kind === 'tool') return <ToolCallCard key={item.id} item={item} />;
						return <PlanCard key={item.id} item={item} />;
					})}
				</VBox>
			</ScrollArea>
		</Section>
	);
};

// ──────────────────────────────────────────────────────────────────────────
// Commands 弹出（内联条件展开，避免 ReactUMG MenuAnchor 不接受 React content）
// ──────────────────────────────────────────────────────────────────────────

const CommandsPanel: React.FC<{
	commands: CommandEntry[];
	onPick: (name: string) => void;
}> = ({ commands, onPick }) => {
	if (commands.length === 0) {
		return (
			<Section Padding={{ Left: 6, Top: 4, Right: 6, Bottom: 4 }}>
				<Text Text="No commands available" />
			</Section>
		);
	}
	return (
		<Section Padding={{ Left: 4, Top: 4, Right: 4, Bottom: 4 }} Gap={2}>
			{commands.map((c) => (
				<Btn key={c.name} OnClicked={() => onPick(c.name)} ToolTipText={c.description ?? ''}>
					<Text Text={`/${c.name}`} />
				</Btn>
			))}
		</Section>
	);
};

// ──────────────────────────────────────────────────────────────────────────
// 输入区（VSCode Copilot 风格：TextArea + 工具栏：Commands/Mode/configOptions + Send/Cancel）
// ──────────────────────────────────────────────────────────────────────────

export const InputArea: React.FC = () => {
	const prompt = useStoreSelector((s) => s.prompt);
	const status = useStoreSelector((s) => s.status);
	const sessionId = useStoreSelector((s) => s.sessionId);
	const isPrompting = useStoreSelector((s) => s.isPrompting);
	const configOptions = useStoreSelector((s) => s.configOptions);
	const commands = useStoreSelector((s) => s.commands);
	const setPrompt = useStoreAction('setPrompt');
	const sendPrompt = useStoreAction('sendPrompt');
	const cancel = useStoreAction('cancel');
	const setConfigOption = useStoreAction('setConfigOption');

	const [showCommands, setShowCommands] = React.useState(false);

	const disabled = status !== 'connected' || !sessionId || isPrompting;
	const selectOptions = configOptions.filter(
		(o): o is Extract<SessionConfigOption, { type: 'select' }> => o.type === 'select',
	);

	// Ctrl+Enter 发送：MultiLineEditableTextBox 把普通 Enter 当换行，OnTextCommitted 不触发；
	// 在 OnTextChanged 内检测「Ctrl 键按下且文本新增了一个换行」即触发 send。sendPrompt 内部 trim()。
	const onTextChanged = React.useCallback(
		(text: string) => {
			const isCtrlEnter =
				text.length > prompt.length &&
				text.endsWith('\n') &&
				UE.KismetInputLibrary.ModifierKeysState_IsControlDown(UE.KismetInputLibrary.GetModifierKeysState());
			setPrompt(text);
			if (isCtrlEnter) sendPrompt();
		},
		[prompt, setPrompt, sendPrompt],
	);

	const onPickCommand = React.useCallback(
		(name: string) => {
			setPrompt(`/${name} `);
			setShowCommands(false);
		},
		[setPrompt],
	);

	return (
		<Section>
			{showCommands ? <CommandsPanel commands={commands} onPick={onPickCommand} /> : null}
			<TextArea
				Text={prompt}
				HintText="Ask the agent... (Ctrl+Enter to send)"
				OnTextChanged={onTextChanged}
				bIsReadOnly={disabled}
			/>
			<HBox Gap={4}>
				<IconBtn
					IconName="Filter"
					ToolTipText="Commands (/)"
					OnClicked={() => setShowCommands((v) => !v)}
					Active={showCommands}
					Slot={center}
				/>
				<HBox>
					{selectOptions.map((opt) => {
						const values = opt.options?.map((o) => o.value) ?? [];
						return (
							<Select
								key={opt.id}
								DefaultOptions={toTArray(values)}
								SelectedOption={opt.currentValue ?? values[0]}
								OnSelectionChanged={(value) => setConfigOption(opt.id, value)}
								ToolTipText={opt.name}
								Slot={center}
							/>
						);
					})}
				</HBox>
				<Spacer Slot={{ Size: { SizeRule: 1, Value: 1 } }} />
				<IconBtn
					IconName="ChevronRight"
					ToolTipText="Send (Ctrl+Enter)"
					OnClicked={sendPrompt}
					bIsEnabled={!disabled && !!prompt.trim()}
					Slot={center}
				/>
				<IconBtn IconName="X" ToolTipText="Cancel" OnClicked={cancel} bIsEnabled={isPrompting} Slot={center} />
			</HBox>
		</Section>
	);
};
