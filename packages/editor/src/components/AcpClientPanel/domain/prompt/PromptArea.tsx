import * as React from 'react';
import * as UE from 'ue';
import { Spacer } from 'react-umg';

import { Badge, Btn, HBox, ScrollArea, Section, Text, TextArea, ToolbarButton, VBox } from '../../../ui';
import { useStoreAction, useStoreSelector } from '../../hooks/useStore';
import type { ChatMessage } from '../../store';

const center = { VerticalAlignment: 2 as any };

// ──────────────────────────────────────────────────────────────────────────
// 消息流
// ──────────────────────────────────────────────────────────────────────────

const MessageRow: React.FC<{ message: ChatMessage }> = ({ message }) => {
	const tone = message.role === 'error' ? 'error' : message.role === 'agent' ? 'accent' : 'normal';
	return (
		<Section Tone={tone} Padding={{ Left: 6, Top: 4, Right: 6, Bottom: 4 }}>
			<HBox>
				<Badge Text={message.role} Tone={tone} />
			</HBox>
			<Text Text={message.text} AutoWrapText />
		</Section>
	);
};

export const MessageStream: React.FC = () => {
	const messages = useStoreSelector((s) => s.messages);
	const clearMessages = useStoreAction('clearMessages');

	return (
		<Section Slot={{ Size: { SizeRule: 1, Value: 1 } }}>
			<HBox Gap={4}>
				<Text Text="Conversation" Slot={center} />
				<Spacer Slot={{ Size: { SizeRule: 1, Value: 1 } }} />
				<ToolbarButton OnClicked={clearMessages} bIsEnabled={messages.length > 0} Slot={center}>
					<Text Text="Clear" />
				</ToolbarButton>
			</HBox>
			<ScrollArea AlwaysShowScrollbar Slot={{ Size: { SizeRule: 1, Value: 1 } }}>
				<VBox Gap={4}>
					{messages.length === 0 ? <Text Text="Connect, create a session, then send a prompt." /> : undefined}
					{messages.map((m) => (
						<MessageRow key={m.id} message={m} />
					))}
				</VBox>
			</ScrollArea>
		</Section>
	);
};

// ──────────────────────────────────────────────────────────────────────────
// Prompt 输入
// ──────────────────────────────────────────────────────────────────────────

export const PromptBox: React.FC = () => {
	const prompt = useStoreSelector((s) => s.prompt);
	const status = useStoreSelector((s) => s.status);
	const sessionId = useStoreSelector((s) => s.sessionId);
	const isPrompting = useStoreSelector((s) => s.isPrompting);
	const setPrompt = useStoreAction('setPrompt');
	const sendPrompt = useStoreAction('sendPrompt');
	const cancel = useStoreAction('cancel');

	const disabled = status !== 'connected' || !sessionId || isPrompting;

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
			<HBox>
				<Btn OnClicked={sendPrompt} bIsEnabled={!disabled && !!prompt.trim()}>
					<Text Text="Send" />
				</Btn>
				<Btn OnClicked={cancel} bIsEnabled={isPrompting}>
					<Text Text="Cancel" />
				</Btn>
			</HBox>
		</Section>
	);
};
