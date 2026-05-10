/**
 * facade 与 fallback 的统一 token 模型。
 *
 * className 沿用 highlight.js 的 hljs-* 命名（keyword/string/number/comment/built_in/...），
 * 让 lowlight 路径与 fallback 路径输出一致，下游只需一份 RichText 样式映射。
 */
export interface CodeToken {
	text: string;
	className?: string;
}

export type CodeLine = CodeToken[];

export interface HighlightResult {
	language: string | null;
	lines: CodeLine[];
	fallback: boolean;
}
