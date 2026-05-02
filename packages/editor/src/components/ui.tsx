import * as React from 'react';
import { Button, HorizontalBox, TextBlock, VerticalBox } from 'react-umg';
import type {
	ButtonProps,
	ButtonStyle,
	HorizontalBoxProps,
	LinearColor,
	SlateBrush,
	SlateColor,
	SlateFontInfo,
	TextBlockProps,
	VerticalBoxProps,
} from 'react-umg';

// ── UE5.5 编辑器 Dark 主题颜色（线性空间，来源于 StyleColors.cpp） ──
// HEX 为 sRGB，linear 值通过 sRGB→linear gamma 转换得到
// 语义色名称对应 EStyleColor 枚举

/** Input #0F0F0F → 按钮描边色 */
const COL_INPUT: LinearColor = { R: 0.003, G: 0.003, B: 0.003, A: 1.0 };
/** Recessed #1A1A1A → 禁用按钮描边色 */
const COL_RECESSED: LinearColor = { R: 0.0087, G: 0.0087, B: 0.0087, A: 1.0 };
/** Secondary #383838 → 按钮默认底色 */
const COL_SECONDARY: LinearColor = { R: 0.0396, G: 0.0396, B: 0.0396, A: 1.0 };
/** Hover #575757 → 按钮悬停底色 */
const COL_HOVER: LinearColor = { R: 0.0955, G: 0.0955, B: 0.0955, A: 1.0 };
/** Header #2F2F2F → 按钮按下底色 */
const COL_HEADER: LinearColor = { R: 0.028, G: 0.028, B: 0.028, A: 1.0 };
/** Dropdown #383838 → 按钮禁用底色 */
const COL_DROPDOWN: LinearColor = { R: 0.0396, G: 0.0396, B: 0.0396, A: 1.0 };
/** Foreground #C0C0C0 → 普通文字色 */
const COL_FOREGROUND: LinearColor = { R: 0.533, G: 0.533, B: 0.533, A: 1.0 };
/** ForegroundHover #FFFFFF → 按钮/高亮文字色 */
const COL_FOREGROUND_HOVER: LinearColor = { R: 1.0, G: 1.0, B: 1.0, A: 1.0 };

// ── DrawAs 枚举值（ESlateBrushDrawType，来源于 SlateBrush.h） ──

const DRAW_AS_ROUNDED_BOX = 4; // ESlateBrushDrawType::RoundedBox

// ── 圆角按钮 Brush 辅助 ──

const CORNER_RADIUS = 4.0;
const OUTLINE_WIDTH = 1.0;

function roundedBrush(fill: LinearColor, outline: LinearColor): SlateBrush {
	return {
		DrawAs: DRAW_AS_ROUNDED_BOX as any,
		TintColor: { SpecifiedColor: fill },
		OutlineSettings: {
			CornerRadii: { X: CORNER_RADIUS, Y: CORNER_RADIUS, Z: CORNER_RADIUS, W: CORNER_RADIUS },
			Color: { SpecifiedColor: outline },
			Width: OUTLINE_WIDTH,
			RoundingType: 0 as any, // ESlateBrushRoundingType::FixedRadius
		},
	};
}

// ── 默认样式 ──

const DEFAULT_FONT: SlateFontInfo = { Size: 10 };

const DEFAULT_TEXT_COLOR: SlateColor = { SpecifiedColor: COL_FOREGROUND };

const DEFAULT_BUTTON_STYLE: ButtonStyle = {
	Normal: roundedBrush(COL_SECONDARY, COL_INPUT),
	Hovered: roundedBrush(COL_HOVER, COL_INPUT),
	Pressed: roundedBrush(COL_HEADER, COL_INPUT),
	Disabled: roundedBrush(COL_DROPDOWN, COL_RECESSED),
	NormalForeground: { SpecifiedColor: COL_FOREGROUND_HOVER },
	HoveredForeground: { SpecifiedColor: COL_FOREGROUND_HOVER },
	PressedForeground: { SpecifiedColor: COL_FOREGROUND_HOVER },
	DisabledForeground: { SpecifiedColor: COL_FOREGROUND },
	NormalPadding: { Left: 12, Top: 1.5, Right: 12, Bottom: 1.5 },
	PressedPadding: { Left: 12, Top: 2.5, Right: 12, Bottom: 0.5 },
};

// ── 工具函数 ──

function mergeDeep<T>(defaults: T, overrides?: Partial<T>): T {
	if (!overrides) return defaults;
	const result = { ...defaults } as any;
	for (const key in overrides) {
		const val = overrides[key];
		const def = (defaults as any)[key];
		if (
			val !== undefined &&
			val !== null &&
			typeof val === 'object' &&
			!Array.isArray(val) &&
			typeof def === 'object' &&
			def !== null
		) {
			result[key] = mergeDeep(def, val);
		} else if (val !== undefined) {
			result[key] = val;
		}
	}
	return result as T;
}

// ── 组件 ──

export const VBox = (props: VerticalBoxProps): React.ReactElement => {
	const { children, ...rest } = props;
	return <VerticalBox {...rest}>{children}</VerticalBox>;
};

export const HBox = (props: HorizontalBoxProps): React.ReactElement => {
	const { children, ...rest } = props;
	return <HorizontalBox {...rest}>{children}</HorizontalBox>;
};

export const Btn = (props: ButtonProps): React.ReactElement => {
	const { children, WidgetStyle, ...rest } = props;
	return (
		<Button WidgetStyle={mergeDeep(DEFAULT_BUTTON_STYLE, WidgetStyle)} {...rest}>
			{children}
		</Button>
	);
};

export const Text = (props: TextBlockProps): React.ReactElement => {
	const { Font, ColorAndOpacity, ...rest } = props;
	return (
		<TextBlock
			Font={mergeDeep(DEFAULT_FONT, Font)}
			ColorAndOpacity={ColorAndOpacity ?? DEFAULT_TEXT_COLOR}
			{...rest}
		/>
	);
};
