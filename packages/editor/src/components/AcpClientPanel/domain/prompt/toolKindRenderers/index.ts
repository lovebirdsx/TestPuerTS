import { DeleteCard } from './DeleteCard';
import { EditCard } from './EditCard';
import { ExecuteCard } from './ExecuteCard';
import { FetchCard } from './FetchCard';
import { MoveCard } from './MoveCard';
import { OtherCard } from './OtherCard';
import { ReadCard } from './ReadCard';
import { SearchCard } from './SearchCard';
import { SwitchModeCard } from './SwitchModeCard';
import { ThinkCard } from './ThinkCard';
import type { KindRenderer } from './types';

/**
 * 按 ACP `ToolKind` 把 ToolItem 派发到对应的 renderer。
 * 未注册的 kind 走 OtherCard 兜底（旧 dump 行为）。
 */
const REGISTRY: Record<string, KindRenderer> = {
	read: ReadCard,
	edit: EditCard,
	delete: DeleteCard,
	move: MoveCard,
	search: SearchCard,
	execute: ExecuteCard,
	think: ThinkCard,
	fetch: FetchCard,
	switch_mode: SwitchModeCard,
	other: OtherCard,
};

export function getRendererForKind(kind: string | undefined | null): KindRenderer {
	if (kind && REGISTRY[kind]) return REGISTRY[kind];
	return OtherCard;
}

export type { KindRenderer, BodyProps } from './types';
