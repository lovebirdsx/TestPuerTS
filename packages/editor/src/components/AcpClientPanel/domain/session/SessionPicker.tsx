import * as React from 'react';
import { Spacer } from 'react-umg';

import { Badge, Btn, HBox, IconBtn, ScrollArea, Section, Text, VBox } from '../../../ui';
import { useStoreAction, useStoreSelector } from '../../hooks/useStore';
import type { SessionListEntry } from '../../store';

const center = { VerticalAlignment: 2 as any };

// ──────────────────────────────────────────────────────────────────────────
// 工具
// ──────────────────────────────────────────────────────────────────────────

/** 会话标题：优先 title；否则截短 sessionId 作为兜底显示。 */
function displayTitle(entry: SessionListEntry): string {
	if (entry.title && entry.title.length > 0) return entry.title;
	const id = entry.sessionId;
	return id.length > 16 ? `${id.slice(0, 8)}…${id.slice(-4)}` : id;
}

/** 把 ISO 时间转成相对描述；解析失败回退到原串。 */
function formatRelativeTime(iso: string | null | undefined): string {
	if (!iso) return '';
	const ts = Date.parse(iso);
	if (Number.isNaN(ts)) return iso;
	const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
	if (diffSec < 60) return `${diffSec}s ago`;
	const diffMin = Math.floor(diffSec / 60);
	if (diffMin < 60) return `${diffMin}m ago`;
	const diffH = Math.floor(diffMin / 60);
	if (diffH < 24) return `${diffH}h ago`;
	const diffD = Math.floor(diffH / 24);
	if (diffD < 30) return `${diffD}d ago`;
	return new Date(ts).toISOString().slice(0, 10);
}

// ──────────────────────────────────────────────────────────────────────────
// 子组件
// ──────────────────────────────────────────────────────────────────────────

const SessionRow: React.FC<{
	entry: SessionListEntry;
	active: boolean;
	onSelect: (id: string) => void;
}> = ({ entry, active, onSelect }) => {
	const title = displayTitle(entry);
	const subtitle = formatRelativeTime(entry.updatedAt ?? entry.createdAt);
	return (
		<Btn OnClicked={() => onSelect(entry.sessionId)} bIsEnabled={!active}>
			<VBox Gap={2}>
				<HBox Gap={4}>
					<Text Text={title} />
					{active ? <Badge Text="ACTIVE" Tone="accent" /> : null}
				</HBox>
				{subtitle ? <Text Text={subtitle} Font={{ Size: 8 }} /> : null}
			</VBox>
		</Btn>
	);
};

// ──────────────────────────────────────────────────────────────────────────
// 主组件
// ──────────────────────────────────────────────────────────────────────────

export const SessionPicker: React.FC = () => {
	const connected = useStoreSelector((s) => s.status === 'connected');
	const sessions = useStoreSelector((s) => s.sessions);
	const sessionId = useStoreSelector((s) => s.sessionId);
	const sessionsLoading = useStoreSelector((s) => s.sessionsLoading);
	const sessionsError = useStoreSelector((s) => s.sessionsError);
	const newSession = useStoreAction('newSession');
	const refreshSessions = useStoreAction('refreshSessions');
	const switchSession = useStoreAction('switchSession');
	const setActiveDrawer = useStoreAction('setActiveDrawer');

	return (
		<Section Gap={6} Slot={{ Size: { SizeRule: 1, Value: 1 } }}>
			<HBox Gap={4}>
				<IconBtn
					IconName="ArrowLeft"
					ToolTipText="Back to conversation"
					OnClicked={() => setActiveDrawer(undefined)}
					Slot={center}
				/>
				<Text Text="Sessions" Slot={center} />
				<Spacer Slot={{ Size: { SizeRule: 1, Value: 1 } }} />
				<IconBtn
					IconName="Refresh"
					ToolTipText="Refresh"
					OnClicked={() => {
						void refreshSessions();
					}}
					bIsEnabled={connected && !sessionsLoading}
					Slot={center}
				/>
				<IconBtn
					IconName="Plus"
					ToolTipText="New session"
					OnClicked={newSession}
					bIsEnabled={connected}
					Slot={center}
				/>
			</HBox>

			{sessionsError ? <Text Text={`Error: ${sessionsError}`} /> : null}

			{!connected ? <Text Text="Not connected." /> : null}

			{connected && sessions.length === 0 && !sessionsLoading && !sessionsError ? (
				<Text Text="No sessions yet." />
			) : null}

			<ScrollArea Slot={{ Size: { SizeRule: 1, Value: 1 } }}>
				<VBox Gap={4}>
					{sessions.map((entry) => (
						<SessionRow
							key={entry.sessionId}
							entry={entry}
							active={entry.sessionId === sessionId}
							onSelect={switchSession}
						/>
					))}
				</VBox>
			</ScrollArea>
		</Section>
	);
};
