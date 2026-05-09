import * as React from 'react';
import * as UE from 'ue';
import { Spacer } from 'react-umg';

import {
	Btn,
	COL_ACCENT,
	COL_FOREGROUND,
	COL_FOREGROUND_HOVER,
	HBox,
	ScrollArea,
	Section,
	Select,
	Text,
	TextArea,
	ToolbarButton,
	VBox,
} from '../../../ui';
import { useStoreAction, useStoreSelector } from '../../hooks/useStore';
import type { TextItem } from '../../store';
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
				<Text Text={item.text} AutoWrapText />
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
			<Text Text={item.text} AutoWrapText />
		</VBox>
	);
};

export const MessageStream: React.FC = () => {
	const timeline = useStoreSelector((s) => s.timeline);
	const clearMessages = useStoreAction('clearMessages');

	return (
		<Section Slot={{ Size: { SizeRule: 1, Value: 1 } }}>
			<HBox Gap={4}>
				<Text Text="Conversation" Slot={center} />
				<Spacer Slot={{ Size: { SizeRule: 1, Value: 1 } }} />
				<ToolbarButton OnClicked={clearMessages} bIsEnabled={timeline.length > 0} Slot={center}>
					<Text Text="Clear" />
				</ToolbarButton>
			</HBox>
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
// 输入区（VSCode Copilot 风格：TextArea + 工具栏：Mode/Policy + Send/Cancel）
// ──────────────────────────────────────────────────────────────────────────

const PERMISSION_OPTIONS = ['interactive', 'auto-approve', 'deny-all'];

export const InputArea: React.FC = () => {
	const prompt = useStoreSelector((s) => s.prompt);
	const status = useStoreSelector((s) => s.status);
	const sessionId = useStoreSelector((s) => s.sessionId);
	const isPrompting = useStoreSelector((s) => s.isPrompting);
	const modes = useStoreSelector((s) => s.modes);
	const permission = useStoreSelector((s) => s.permission);
	const setPrompt = useStoreAction('setPrompt');
	const sendPrompt = useStoreAction('sendPrompt');
	const cancel = useStoreAction('cancel');
	const setMode = useStoreAction('setMode');
	const setPermissionStrategy = useStoreAction('setPermissionStrategy');

	const disabled = status !== 'connected' || !sessionId || isPrompting;
	const modeIds = modes?.availableModes.map((m) => m.id) ?? [];

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

	return (
		<Section>
			<TextArea
				Text={prompt}
				HintText="Ask the agent... (Ctrl+Enter to send)"
				OnTextChanged={onTextChanged}
				bIsReadOnly={disabled}
			/>
			<HBox Gap={4}>
				{modeIds.length > 0 ? (
					<Select
						DefaultOptions={toTArray(modeIds)}
						SelectedOption={modes?.currentModeId}
						OnSelectionChanged={setMode}
						Slot={center}
					/>
				) : undefined}
				<Select
					DefaultOptions={toTArray(PERMISSION_OPTIONS)}
					SelectedOption={permission}
					OnSelectionChanged={(value) => setPermissionStrategy(value as typeof permission)}
					Slot={center}
				/>
				<Spacer Slot={{ Size: { SizeRule: 1, Value: 1 } }} />
				<Btn OnClicked={sendPrompt} bIsEnabled={!disabled && !!prompt.trim()} Slot={center}>
					<Text Text="Send" />
				</Btn>
				<Btn OnClicked={cancel} bIsEnabled={isPrompting} Slot={center}>
					<Text Text="Cancel" />
				</Btn>
			</HBox>
		</Section>
	);
};
