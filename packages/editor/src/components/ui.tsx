import * as React from 'react';
import * as UE from 'ue';
import {
	Border,
	Button,
	CheckBox,
	ComboBoxString,
	EditableTextBox,
	HorizontalBox,
	Image,
	MultiLineEditableTextBox,
	ScrollBox,
	SizeBox,
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
export const COL_FOREGROUND: LinearColor = { R: 0.533, G: 0.533, B: 0.533, A: 1.0 };
/** ForegroundHover #FFFFFF → 按钮/高亮文字色 */
export const COL_FOREGROUND_HOVER: LinearColor = { R: 1.0, G: 1.0, B: 1.0, A: 1.0 };
const COL_PANEL: LinearColor = { R: 0.015, G: 0.015, B: 0.015, A: 1.0 };
export const COL_ACCENT: LinearColor = { R: 0.034, G: 0.16, B: 0.32, A: 1.0 };
const COL_WARNING: LinearColor = { R: 0.55, G: 0.37, B: 0.08, A: 1.0 };
const COL_ERROR: LinearColor = { R: 0.45, G: 0.06, B: 0.05, A: 1.0 };

// ── 间距设计 token（语义化命名，业务代码不要写裸数字；参见 components/CLAUDE.md） ──

export const SPACING = {
	/** 0：行紧贴（代码块内每行） */
	none: 0,
	/** 2：同卡内字段/标签近距堆叠；VBox·HBox 默认 */
	tight: 2,
	/** 4：卡片间、工具栏按钮间，最常用；Section 默认 Gap */
	normal: 4,
	/** 6：章节/抽屉/模态等大块 */
	loose: 6,
	/** 8：同行内强分组（DiffView 头部统计），罕用 */
	wide: 8,
} as const;

export const PADDING = {
	/** {4,4,4,4}：Panel / 简单弹出列表 */
	panel: { Left: 4, Top: 4, Right: 4, Bottom: 4 } as const,
	/** {6,4,6,4}：卡片（横宽纵紧）；Section 默认 Padding */
	card: { Left: 6, Top: 4, Right: 6, Bottom: 4 } as const,
	/** {6,6,6,6}：对称章节（带 Title 时备用） */
	section: { Left: 6, Top: 6, Right: 6, Bottom: 6 } as const,
	/** {8,8,8,8}：ModalPanel 默认 */
	modal: { Left: 8, Top: 8, Right: 8, Bottom: 8 } as const,
} as const;

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

const DEFAULT_PANEL_BACKGROUND: SlateBrush = { DrawAs: DRAW_AS_NO_DRAW as any };
const SECTION_BACKGROUND: SlateBrush = roundedBrush(COL_PANEL, COL_INPUT);

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

const BUTTON_ACTIVE_STYLE: ButtonStyle = {
	...DEFAULT_BUTTON_STYLE,
	Normal: roundedBrush(COL_ACCENT, COL_ACCENT),
	Hovered: roundedBrush(COL_ACCENT, COL_ACCENT),
	Pressed: roundedBrush(COL_ACCENT, COL_ACCENT),
	Disabled: roundedBrush(COL_ACCENT, COL_ACCENT),
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
		<Border Background={Background ?? DEFAULT_PANEL_BACKGROUND} Padding={Padding ?? PADDING.panel} {...rest}>
			{children}
		</Border>
	);
};

export const VBox = (props: VerticalBoxProps & BoxSpacingProps): React.ReactElement => {
	const { children, Gap = SPACING.tight, ...rest } = props;
	return <VerticalBox {...rest}>{withChildGap(children, { Bottom: Gap })}</VerticalBox>;
};

export const HBox = (props: HorizontalBoxProps & BoxSpacingProps): React.ReactElement => {
	const { children, Gap = SPACING.tight, ...rest } = props;
	return <HorizontalBox {...rest}>{withChildGap(children, { Right: Gap })}</HorizontalBox>;
};

export const Btn = (props: ButtonProps & { Active?: boolean }): React.ReactElement => {
	const { children, WidgetStyle, Active, ...rest } = props;
	const baseStyle = Active ? BUTTON_ACTIVE_STYLE : DEFAULT_BUTTON_STYLE;
	return (
		<Button WidgetStyle={mergeDeep(baseStyle, WidgetStyle)} {...rest}>
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

// 从StarshipCoreStyle.cpp中提取
const _ICON_NAMES = [
	'Denied',
	'Help',
	'Download',
	'Server',
	'Cloud',
	'Local',
	'Alert',
	'Error',
	'ErrorWithColor',
	'Warning',
	'WarningWithColor',
	'Info',
	'InfoWithColor',
	'Success',
	'SuccessWithColor',
	'AlertCircle',
	'AlertCircleWithColor',
	'box-perspective',
	'cylinder',
	'pyramid',
	'sphere',
	'Settings',
	'Blueprints',
	'Cross',
	'Plus',
	'Minus',
	'PlusCircle',
	'MinusCircle',
	'X',
	'XCircle',
	'Delete',
	'Save',
	'SaveModified',
	'Favorites',
	'Import',
	'Filter',
	'AutoFilter',
	'Lock',
	'Unlock',
	'Normalize',
	'CircleArrowLeft',
	'CircleArrowRight',
	'CircleArrowUp',
	'CircleArrowDown',
	'ArrowLeft',
	'ArrowRight',
	'ArrowUp',
	'ArrowDown',
	'Check',
	'FolderOpen',
	'FolderClosed',
	'ChevronLeft',
	'ChevronRight',
	'ChevronUp',
	'ChevronDown',
	'Search',
	'FilledCircle',
	'Duplicate',
	'Edit',
	'Visible',
	'Hidden',
	'DragHandle',
	'Refresh',
	'Star',
	'Link',
	'Unlink',
	'BulletPoint',
	'BulletPoint16',
	'SortDown',
	'SortUp',
	'EyeDropper',
	'C',
	'Advanced',
	'Launch',
	'Rotate90Clockwise',
	'Rotate90CounterClockwise',
	'Rotate180',
	'FlipHorizontal',
	'FlipVertical',
	'Layout',
	'Recent',
	'Badge',
	'BadgeModified',
	'Toolbar',
	'ConstraintManager',
	'ConstraintManager',
	'Role',
	'Merge',
	'Calendar',
	'Success',
] as const;

export type IconName = (typeof _ICON_NAMES)[number];

// ── 编辑器内置图标 ──
// 通过 UEditorIconHelper.GetEditorIcon 从 FAppStyle 读取 brush。
// IconName 命名见 Engine/Source/Editor/EditorStyle/Private/SlateEditorStyle.cpp 与 StarshipCoreStyle.cpp。

export const Icon = (props: { Name: IconName; Size?: number }): React.ReactElement => {
	const { Name, Size = 14 } = props;
	const brush = UE.EditorIconHelper.GetEditorIcon(`Icons.${Name}`);
	return (
		<SizeBox
			WidthOverride={Size}
			HeightOverride={Size}
			bOverride_WidthOverride={true}
			bOverride_HeightOverride={true}
		>
			<Image Brush={brush} />
		</SizeBox>
	);
};

const ICON_BUTTON_STYLE: ButtonStyle = {
	...COMPACT_BUTTON_STYLE,
	NormalPadding: { Left: 4, Top: 2, Right: 4, Bottom: 2 },
	PressedPadding: { Left: 4, Top: 3, Right: 4, Bottom: 1 },
};

const ICON_BUTTON_ACTIVE_STYLE: ButtonStyle = {
	...ICON_BUTTON_STYLE,
	Normal: roundedBrush(COL_ACCENT, COL_ACCENT),
	Hovered: roundedBrush(COL_ACCENT, COL_ACCENT),
	Pressed: roundedBrush(COL_ACCENT, COL_ACCENT),
};

export interface IconBtnProps {
	IconName: IconName;
	ToolTipText: string;
	OnClicked?: () => void;
	bIsEnabled?: boolean;
	Active?: boolean;
	Size?: number;
	Slot?: ButtonProps['Slot'];
}

export const IconBtn = (props: IconBtnProps): React.ReactElement => {
	const { IconName, ToolTipText, OnClicked, bIsEnabled, Active, Size, Slot } = props;
	return (
		<Button
			WidgetStyle={Active ? ICON_BUTTON_ACTIVE_STYLE : ICON_BUTTON_STYLE}
			OnClicked={OnClicked}
			bIsEnabled={bIsEnabled}
			ToolTipText={ToolTipText}
			Slot={Slot}
		>
			<Icon Name={IconName} Size={Size} />
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

const NO_BRUSH: SlateBrush = { DrawAs: DRAW_AS_NO_DRAW as any };

const SELECTABLE_TEXT_STYLE: EditableTextBoxStyle = {
	BackgroundImageNormal: NO_BRUSH,
	BackgroundImageHovered: NO_BRUSH,
	BackgroundImageFocused: NO_BRUSH,
	BackgroundImageReadOnly: NO_BRUSH,
	Padding: { Left: 0, Top: 0, Right: 0, Bottom: 0 },
	Font: DEFAULT_FONT,
	ForegroundColor: DEFAULT_TEXT_COLOR,
	BackgroundColor: { SpecifiedColor: { R: 0, G: 0, B: 0, A: 0 } },
};

/** 外观同 Text，但支持鼠标选中后 Ctrl+C 复制 */
export const SelectableText = ({ Font, ColorAndOpacity, ...rest }: TextBlockProps): React.ReactElement => {
	return (
		<MultiLineEditableTextBox
			bIsReadOnly
			WidgetStyle={SELECTABLE_TEXT_STYLE}
			TextStyle={{
				Font: mergeDeep(DEFAULT_FONT, Font),
				ColorAndOpacity: ColorAndOpacity ?? DEFAULT_TEXT_COLOR,
			}}
			bIsFontDeprecationDone
			{...(rest as MultiLineEditableTextBoxProps)}
		/>
	);
};

export const Section = (
	props: BorderProps & { Title?: string; Tone?: SectionTone; Gap?: number },
): React.ReactElement => {
	const { children, Title, Tone = 'normal', Gap = SPACING.normal, Background, Padding, ...rest } = props;
	const toneBrush =
		Tone === 'accent'
			? roundedBrush(COL_ACCENT, COL_INPUT)
			: Tone === 'warning'
				? roundedBrush(COL_WARNING, COL_INPUT)
				: Tone === 'error'
					? roundedBrush(COL_ERROR, COL_INPUT)
					: SECTION_BACKGROUND;
	return (
		<Border Background={Background ?? toneBrush} Padding={Padding ?? PADDING.card} {...rest}>
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
