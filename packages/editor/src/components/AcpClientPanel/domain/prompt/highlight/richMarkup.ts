import type { CodeLine, CodeToken } from './types';

/**
 * 把着色后的 token 流序列化成 UE RichTextBlock 标记串。
 *
 * 标记规则参考 `Engine/Source/Runtime/Slate/Private/Framework/Text/RichTextMarkupProcessing.cpp`：
 * - 元素：`<tag>text</>`，闭合标签固定为 `</>` 不带名字。
 * - 标签名允许 `[\w\d\.-]+`，所以 `hljs-keyword` 这种带横杠的名字可以直接用。
 * - 实体：`&amp; &lt; &gt; &quot;`。
 *
 * 这里输出每行一段独立 markup 字符串，外层 `VBox` 一行一个 RichTextBlock，
 * 既避开 RichText 单串过长导致的版面坍塌，也方便 `maxLines` 截断。
 */

const ENTITY_MAP: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
};

function escapeText(text: string): string {
	let out = '';
	for (let i = 0; i < text.length; i++) {
		const ch = text[i]!;
		out += ENTITY_MAP[ch] ?? ch;
	}
	return out;
}

function tokenToMarkup(tok: CodeToken): string {
	const escaped = escapeText(tok.text);
	if (!tok.className) {
		return escaped;
	}
	return `<${tok.className}>${escaped}</>`;
}

export function lineToMarkup(line: CodeLine): string {
	if (line.length === 0) {
		return '';
	}
	let out = '';
	for (const tok of line) {
		out += tokenToMarkup(tok);
	}
	return out;
}

export function linesToMarkup(lines: CodeLine[]): string[] {
	return lines.map(lineToMarkup);
}
