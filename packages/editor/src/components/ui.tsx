import * as React from 'react';
import {
	Border,
	Button,
	CheckBox,
	ComboBoxString,
	EditableTextBox,
	HorizontalBox,
	MultiLineEditableTextBox,
	ScrollBox,
	TextBlock,
	VerticalBox,
} from 'react-umg';
import type {
	BorderProps,
	ButtonProps,
	ButtonStyle,
	CheckBoxProps,
	ComboBoxStringProps,
	ComboBoxStyle,
	EditableTextBoxStyle,
	EditableTextBoxProps,
	HorizontalBoxProps,
	LinearColor,
	Margin,
	MultiLineEditableTextBoxProps,
	ScrollBoxProps,
	SlateBrush,
	SlateColor,
	SlateFontInfo,
	TableRowStyle,
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
const COL_PANEL: LinearColor = { R: 0.015, G: 0.015, B: 0.015, A: 1.0 };
const COL_ACCENT: LinearColor = { R: 0.034, G: 0.16, B: 0.32, A: 1.0 };
const COL_WARNING: LinearColor = { R: 0.55, G: 0.37, B: 0.08, A: 1.0 };
const COL_ERROR: LinearColor = { R: 0.45, G: 0.06, B: 0.05, A: 1.0 };

// ── DrawAs 枚举值（ESlateBrushDrawType，来源于 SlateBrush.h） ──

const DRAW_AS_NO_DRAW = 0; // ESlateBrushDrawType::NoDrawType
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
const DEFAULT_CONTROL_FONT: SlateFontInfo = { Size: 9 };

const DEFAULT_TEXT_COLOR: SlateColor = { SpecifiedColor: COL_FOREGROUND };

const DEFAULT_PANEL_PADDING = { Left: 4, Top: 4, Right: 4, Bottom: 4 };
const DEFAULT_PANEL_BACKGROUND: SlateBrush = { DrawAs: DRAW_AS_NO_DRAW as any };
const SECTION_BACKGROUND: SlateBrush = roundedBrush(COL_PANEL, COL_INPUT);
const DEFAULT_BOX_CHILD_GAP = 2;

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

const COMPACT_BUTTON_STYLE: ButtonStyle = {
	...DEFAULT_BUTTON_STYLE,
	NormalPadding: { Left: 8, Top: 1, Right: 8, Bottom: 1 },
	PressedPadding: { Left: 8, Top: 2, Right: 8, Bottom: 0 },
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

type BoxSpacingProps = {
	Gap?: number;
};

type SectionTone = 'normal' | 'accent' | 'warning' | 'error';

type SlottedChildProps = {
	Slot?: {
		Padding?: Margin;
	};
};

function withChildGap(children: React.ReactNode, padding: Margin): React.ReactNode {
	const childArray = React.Children.toArray(children);
	return childArray.map((child, index) => {
		if (index === childArray.length - 1 || !React.isValidElement<SlottedChildProps>(child)) {
			return child;
		}

		const slot = child.props.Slot;
		return React.cloneElement(child, {
			Slot: {
				...slot,
				Padding: {
					...padding,
					...slot?.Padding,
				},
			},
		});
	});
}

// ── 组件 ──

export const Panel = (props: BorderProps): React.ReactElement => {
	const { children, Background, Padding, ...rest } = props;
	return (
		<Border
			Background={Background ?? DEFAULT_PANEL_BACKGROUND}
			Padding={Padding ?? DEFAULT_PANEL_PADDING}
			{...rest}
		>
			{children}
		</Border>
	);
};

export const VBox = (props: VerticalBoxProps & BoxSpacingProps): React.ReactElement => {
	const { children, Gap = DEFAULT_BOX_CHILD_GAP, ...rest } = props;
	return <VerticalBox {...rest}>{withChildGap(children, { Bottom: Gap })}</VerticalBox>;
};

export const HBox = (props: HorizontalBoxProps & BoxSpacingProps): React.ReactElement => {
	const { children, Gap = DEFAULT_BOX_CHILD_GAP, ...rest } = props;
	return <HorizontalBox {...rest}>{withChildGap(children, { Right: Gap })}</HorizontalBox>;
};

export const Btn = (props: ButtonProps): React.ReactElement => {
	const { children, WidgetStyle, ...rest } = props;
	return (
		<Button WidgetStyle={mergeDeep(DEFAULT_BUTTON_STYLE, WidgetStyle)} {...rest}>
			{children}
		</Button>
	);
};

export const ToolbarButton = (props: ButtonProps): React.ReactElement => {
	const { children, WidgetStyle, ...rest } = props;
	return (
		<Btn WidgetStyle={mergeDeep(COMPACT_BUTTON_STYLE, WidgetStyle)} {...rest}>
			{children}
		</Btn>
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

export const Section = (
	props: BorderProps & { Title?: string; Tone?: SectionTone; Gap?: number },
): React.ReactElement => {
	const { children, Title, Tone = 'normal', Gap = 4, Background, Padding, ...rest } = props;
	const toneBrush =
		Tone === 'accent'
			? roundedBrush(COL_ACCENT, COL_INPUT)
			: Tone === 'warning'
				? roundedBrush(COL_WARNING, COL_INPUT)
				: Tone === 'error'
					? roundedBrush(COL_ERROR, COL_INPUT)
					: SECTION_BACKGROUND;
	return (
		<Border
			Background={Background ?? toneBrush}
			Padding={Padding ?? { Left: 6, Top: 6, Right: 6, Bottom: 6 }}
			{...rest}
		>
			<VBox Gap={Gap}>
				{Title ? (
					<Text Text={Title} Font={{ Size: 10 }} ColorAndOpacity={{ SpecifiedColor: COL_FOREGROUND_HOVER }} />
				) : null}
				{children}
			</VBox>
		</Border>
	);
};

export const Divider = (): React.ReactElement => (
	<Border
		Background={roundedBrush(COL_INPUT, COL_INPUT)}
		Padding={{ Left: 0, Top: 0, Right: 0, Bottom: 0 }}
		Slot={{ Size: { SizeRule: 0, Value: 1 } }}
	/>
);

export const Badge = (props: { Text: string; Tone?: SectionTone } & Pick<BorderProps, 'Slot'>): React.ReactElement => {
	const tone = props.Tone ?? 'normal';
	return (
		<Border
			Background={
				tone === 'accent'
					? roundedBrush(COL_ACCENT, COL_ACCENT)
					: tone === 'warning'
						? roundedBrush(COL_WARNING, COL_WARNING)
						: tone === 'error'
							? roundedBrush(COL_ERROR, COL_ERROR)
							: roundedBrush(COL_SECONDARY, COL_SECONDARY)
			}
			Padding={{ Left: 6, Top: 1, Right: 6, Bottom: 1 }}
			Slot={props.Slot}
		>
			<Text Text={props.Text} Font={{ Size: 9 }} ColorAndOpacity={{ SpecifiedColor: COL_FOREGROUND_HOVER }} />
		</Border>
	);
};

const DEFAULT_INPUT_STYLE: EditableTextBoxStyle = {
	BackgroundImageNormal: roundedBrush(COL_RECESSED, COL_INPUT),
	BackgroundImageHovered: roundedBrush(COL_SECONDARY, COL_INPUT),
	BackgroundImageFocused: roundedBrush(COL_SECONDARY, COL_ACCENT),
	BackgroundImageReadOnly: roundedBrush(COL_RECESSED, COL_RECESSED),
	Padding: { Left: 5, Top: 2, Right: 5, Bottom: 2 },
	Font: DEFAULT_CONTROL_FONT,
	TextStyle: {
		Font: DEFAULT_CONTROL_FONT,
		ColorAndOpacity: { SpecifiedColor: COL_FOREGROUND_HOVER },
	},
	ForegroundColor: { SpecifiedColor: COL_FOREGROUND_HOVER },
	BackgroundColor: { SpecifiedColor: COL_RECESSED },
};

export const Input = (props: EditableTextBoxProps): React.ReactElement => {
	const { WidgetStyle, ...rest } = props;
	return (
		<EditableTextBox WidgetStyle={mergeDeep(DEFAULT_INPUT_STYLE, WidgetStyle)} bIsFontDeprecationDone {...rest} />
	);
};

export const TextArea = (props: MultiLineEditableTextBoxProps): React.ReactElement => {
	const { WidgetStyle, TextStyle, ...rest } = props;
	return (
		<MultiLineEditableTextBox
			WidgetStyle={mergeDeep(DEFAULT_INPUT_STYLE, WidgetStyle)}
			TextStyle={mergeDeep({ Font: DEFAULT_CONTROL_FONT, ColorAndOpacity: DEFAULT_TEXT_COLOR }, TextStyle)}
			bIsFontDeprecationDone
			{...rest}
		/>
	);
};

export const ScrollArea = (props: ScrollBoxProps): React.ReactElement => {
	const { children, ...rest } = props;
	return <ScrollBox {...rest}>{children}</ScrollBox>;
};

const DEFAULT_SELECT_STYLE: ComboBoxStyle = {
	ComboButtonStyle: {
		ButtonStyle: COMPACT_BUTTON_STYLE,
		MenuBorderBrush: roundedBrush(COL_PANEL, COL_INPUT),
		MenuBorderPadding: { Left: 1, Top: 1, Right: 1, Bottom: 1 },
		ContentPadding: { Left: 5, Top: 1, Right: 5, Bottom: 1 },
		DownArrowPadding: { Left: 4, Top: 0, Right: 2, Bottom: 0 },
	},
	ContentPadding: { Left: 5, Top: 1, Right: 5, Bottom: 1 },
	MenuRowPadding: { Left: 0, Top: 0, Right: 0, Bottom: 0 },
};

const DEFAULT_SELECT_ITEM_STYLE: TableRowStyle = {
	SelectorFocusedBrush: roundedBrush(COL_HOVER, COL_ACCENT),
	ActiveHoveredBrush: roundedBrush(COL_HOVER, COL_INPUT),
	ActiveBrush: roundedBrush(COL_SECONDARY, COL_ACCENT),
	InactiveHoveredBrush: roundedBrush(COL_HOVER, COL_INPUT),
	InactiveBrush: roundedBrush(COL_PANEL, COL_PANEL),
	EvenRowBackgroundHoveredBrush: roundedBrush(COL_HOVER, COL_INPUT),
	EvenRowBackgroundBrush: roundedBrush(COL_PANEL, COL_PANEL),
	OddRowBackgroundHoveredBrush: roundedBrush(COL_HOVER, COL_INPUT),
	OddRowBackgroundBrush: roundedBrush(COL_PANEL, COL_PANEL),
	TextColor: { SpecifiedColor: COL_FOREGROUND },
	SelectedTextColor: { SpecifiedColor: COL_FOREGROUND_HOVER },
	ActiveHighlightedBrush: roundedBrush(COL_HOVER, COL_ACCENT),
	InactiveHighlightedBrush: roundedBrush(COL_HOVER, COL_INPUT),
};

export const Select = (props: ComboBoxStringProps): React.ReactElement => {
	const { WidgetStyle, ItemStyle, ContentPadding, Font, ForegroundColor, MaxListHeight, ...rest } = props;
	return (
		<ComboBoxString
			WidgetStyle={mergeDeep(DEFAULT_SELECT_STYLE, WidgetStyle)}
			ItemStyle={mergeDeep(DEFAULT_SELECT_ITEM_STYLE, ItemStyle)}
			ContentPadding={ContentPadding ?? { Left: 5, Top: 1, Right: 5, Bottom: 1 }}
			Font={mergeDeep(DEFAULT_CONTROL_FONT, Font)}
			ForegroundColor={ForegroundColor ?? DEFAULT_TEXT_COLOR}
			MaxListHeight={MaxListHeight ?? 320}
			{...rest}
		/>
	);
};

export const Check = (props: CheckBoxProps): React.ReactElement => {
	return <CheckBox {...props} />;
};

export const Tabs = (props: {
	Items: { id: string; label: string }[];
	ActiveId: string;
	OnSelect: (id: string) => void;
}): React.ReactElement => (
	<HBox Gap={2}>
		{props.Items.map((item) => (
			<ToolbarButton key={item.id} OnClicked={() => props.OnSelect(item.id)}>
				<Text
					Text={item.label}
					ColorAndOpacity={{
						SpecifiedColor: item.id === props.ActiveId ? COL_FOREGROUND_HOVER : COL_FOREGROUND,
					}}
				/>
			</ToolbarButton>
		))}
	</HBox>
);

export const ModalPanel = (props: BorderProps): React.ReactElement => {
	const { children, ...rest } = props;
	return (
		<Border
			Background={roundedBrush(COL_HEADER, COL_ACCENT)}
			Padding={{ Left: 8, Top: 8, Right: 8, Bottom: 8 }}
			{...rest}
		>
			{children}
		</Border>
	);
};
