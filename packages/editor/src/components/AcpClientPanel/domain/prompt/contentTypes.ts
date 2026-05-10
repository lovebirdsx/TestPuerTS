/**
 * 运行时类型守卫，把 ACP `tool_call_update.content` 这种 `unknown` 归一为可消费的联合类型。
 * 与 `@agentclientprotocol/sdk` 的 `ToolCallContent` 形态保持一致；只读，最小代价。
 */

export interface AcpTextContentBlock {
	type: 'text';
	text: string;
}

export interface AcpImageContentBlock {
	type: 'image';
	mimeType?: string | null;
	data?: string | null;
	uri?: string | null;
}

export type AcpInnerContent = AcpTextContentBlock | AcpImageContentBlock | { type: string; [k: string]: unknown };

export interface AcpContentWrap {
	type: 'content';
	content: AcpInnerContent;
}

export interface AcpDiffBlock {
	type: 'diff';
	path: string;
	oldText?: string | null;
	newText: string;
}

export interface AcpTerminalBlock {
	type: 'terminal';
	terminalId: string;
}

export type AcpContentBlock = AcpContentWrap | AcpDiffBlock | AcpTerminalBlock | { type: string; [k: string]: unknown };

function isObj(v: unknown): v is Record<string, unknown> {
	return typeof v === 'object' && v !== null;
}

function asString(v: unknown): string | undefined {
	return typeof v === 'string' ? v : undefined;
}

export function asContentArray(value: unknown): AcpContentBlock[] | null {
	if (!Array.isArray(value)) return null;
	const out: AcpContentBlock[] = [];
	for (const item of value) {
		if (isObj(item) && typeof item.type === 'string') {
			out.push(item as AcpContentBlock);
		}
	}
	return out;
}

export function isDiffBlock(b: AcpContentBlock): b is AcpDiffBlock {
	return (
		b.type === 'diff' &&
		typeof (b as AcpDiffBlock).path === 'string' &&
		typeof (b as AcpDiffBlock).newText === 'string'
	);
}

export function isTerminalBlock(b: AcpContentBlock): b is AcpTerminalBlock {
	return b.type === 'terminal' && typeof (b as AcpTerminalBlock).terminalId === 'string';
}

export function isContentWrap(b: AcpContentBlock): b is AcpContentWrap {
	if (b.type !== 'content') return false;
	const inner = (b as AcpContentWrap).content;
	return isObj(inner) && typeof inner.type === 'string';
}

export function getInnerText(wrap: AcpContentWrap): string | undefined {
	const inner = wrap.content;
	if (inner.type === 'text') {
		return asString((inner as AcpTextContentBlock).text);
	}
	return undefined;
}
