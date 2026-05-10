import * as React from 'react';
import type { LinearColor } from 'react-umg';
import { RichTextBlock } from 'react-umg';
import * as UE from 'ue';

import { Btn, IconBtn, HBox, Section, SelectableText, SPACING, Text, VBox } from '../../../../ui';
import { detectLanguageByPath, fallbackHighlight, lineToMarkup, type CodeLine } from '../highlight';
import { highlightCode } from '../highlight';

const COL_DIM: LinearColor = { R: 0.55, G: 0.55, B: 0.55, A: 1 };
const COL_CODE_DEFAULT: LinearColor = { R: 0.85, G: 0.85, B: 0.85, A: 1 };

interface CodeBlockProps {
	code: string;
	/** 用作语言推断 + 路径展示，可与 path 二选一。 */
	language?: string | null;
	/** 当未传 language 时，会从 path 后缀推断；CodeBlock 自身不渲染 path 信息。 */
	path?: string;
	maxLines?: number;
}

/** 单例缓存：首次访问 EditorHelper 拉一次 RichTextBlock 用样式表，失败返回 null（退到 plain）。 */
let cachedStyleSet: UE.DataTable | null | undefined = undefined;
function getCodeStyleSet(): UE.DataTable | null {
	if (cachedStyleSet !== undefined) {
		return cachedStyleSet;
	}
	try {
		const tbl = UE.EditorHelper.BuildAcpCodeStyleSet();
		cachedStyleSet = tbl ?? null;
	} catch {
		cachedStyleSet = null;
	}
	return cachedStyleSet;
}

function highlightLines(code: string, language: string | null | undefined): CodeLine[] {
	if (!language) {
		return fallbackHighlight(null, code).lines;
	}
	return highlightCode(language, code).lines;
}

/**
 * 代码块视图。默认 RichText 模式（彩色但不可选中），点击右上角切换到 Plain 模式（可选中复制）。
 * RichText 标记串通过 `linesToMarkup` 序列化，TextStyleSet 由 EditorHelper.BuildAcpCodeStyleSet() 注入。
 * 加载样式表失败时永久退到 plain 模式（cachedStyleSet === null）。
 */
export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language, path, maxLines = 30 }) => {
	const [showAll, setShowAll] = React.useState(false);
	const [plainMode, setPlainMode] = React.useState(false);

	const lang = language ?? detectLanguageByPath(path) ?? null;
	const styleSet = getCodeStyleSet();
	const richAvailable = styleSet !== null;
	const useRich = !plainMode && richAvailable;

	const allLines = React.useMemo(() => code.split('\n'), [code]);
	const visibleCount = showAll ? allLines.length : Math.min(maxLines, allLines.length);
	const hidden = allLines.length - visibleCount;
	const visibleText = allLines.slice(0, visibleCount).join('\n');

	const richLines = React.useMemo<string[] | null>(() => {
		if (!useRich) {
			return null;
		}
		const sliced = allLines.slice(0, visibleCount).join('\n');
		const tokens = highlightLines(sliced, lang);
		return tokens.map(lineToMarkup);
	}, [useRich, allLines, visibleCount, lang]);

	return (
		<Section Tone="normal" Gap={SPACING.tight}>
			<HBox Gap={SPACING.normal}>
				<Text
					Text={lang ? `[${lang}]` : '[plain]'}
					Font={{ Size: 8 }}
					ColorAndOpacity={{ SpecifiedColor: COL_DIM }}
				/>
				{richAvailable ? (
					<IconBtn
						IconName="Edit"
						ToolTipText={plainMode ? '切换到彩色模式' : '切换到可选中复制模式'}
						Active={plainMode}
						OnClicked={() => setPlainMode((v) => !v)}
						Size={12}
					/>
				) : null}
			</HBox>
			{useRich && richLines ? (
				<VBox Gap={SPACING.none}>
					{richLines.map((markup, i) => (
						<RichTextBlock
							key={i}
							{...({ TextStyleSet: styleSet } as Record<string, unknown>)}
							Text={markup === '' ? ' ' : markup}
							DefaultTextStyleOverride={{
								Font: { Size: 9 },
								ColorAndOpacity: { SpecifiedColor: COL_CODE_DEFAULT },
							}}
						/>
					))}
				</VBox>
			) : (
				<SelectableText Text={visibleText} AutoWrapText Font={{ Size: 9 }} />
			)}
			{hidden > 0 ? (
				<Btn OnClicked={() => setShowAll(true)}>
					<Text
						Text={`… show ${hidden} more line${hidden > 1 ? 's' : ''}`}
						Font={{ Size: 9 }}
						ColorAndOpacity={{ SpecifiedColor: COL_DIM }}
					/>
				</Btn>
			) : null}
		</Section>
	);
};
