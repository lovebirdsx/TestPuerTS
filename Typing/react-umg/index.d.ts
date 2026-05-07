declare module "react-umg" {
    import * as React from 'react';
    import * as UE from 'ue';
    type TArray<T> = UE.TArray<T>;
    type TSet<T> = UE.TSet<T>;
    type TMap<TKey, TValue> = UE.TMap<TKey, TValue>;

    interface PanelSlot {
    }

    interface Margin {
        Left?: number;
        Top?: number;
        Right?: number;
        Bottom?: number;
    }

    type EHorizontalAlignment = UE.EHorizontalAlignment;
    type EVerticalAlignment = UE.EVerticalAlignment;
    interface BackgroundBlurSlot extends PanelSlot {
        Padding?: Margin;
        HorizontalAlignment?: EHorizontalAlignment;
        VerticalAlignment?: EVerticalAlignment;
    }

    interface BorderSlot extends PanelSlot {
        Padding?: Margin;
        HorizontalAlignment?: EHorizontalAlignment;
        VerticalAlignment?: EVerticalAlignment;
    }

    interface ButtonSlot extends PanelSlot {
        Padding?: Margin;
        HorizontalAlignment?: EHorizontalAlignment;
        VerticalAlignment?: EVerticalAlignment;
    }

    interface Vector2D {
        X?: number;
        Y?: number;
    }

    interface Anchors {
        Minimum?: Vector2D;
        Maximum?: Vector2D;
    }

    interface AnchorData {
        Offsets?: Margin;
        Anchors?: Anchors;
        Alignment?: Vector2D;
    }

    interface CanvasPanelSlot extends PanelSlot {
        LayoutData?: AnchorData;
        bAutoSize?: boolean;
        ZOrder?: number;
    }

    interface GridSlot extends PanelSlot {
        Padding?: Margin;
        HorizontalAlignment?: EHorizontalAlignment;
        VerticalAlignment?: EVerticalAlignment;
        Row?: number;
        RowSpan?: number;
        Column?: number;
        ColumnSpan?: number;
        Layer?: number;
        Nudge?: Vector2D;
    }

    type ESlateSizeRule = UE.ESlateSizeRule;
    interface SlateChildSize {
        Value?: number;
        SizeRule?: ESlateSizeRule;
    }

    interface HorizontalBoxSlot extends PanelSlot {
        Size?: SlateChildSize;
        Padding?: Margin;
        HorizontalAlignment?: EHorizontalAlignment;
        VerticalAlignment?: EVerticalAlignment;
    }

    interface OverlaySlot extends PanelSlot {
        Padding?: Margin;
        HorizontalAlignment?: EHorizontalAlignment;
        VerticalAlignment?: EVerticalAlignment;
    }

    interface SafeZoneSlot extends PanelSlot {
        bIsTitleSafe?: boolean;
        SafeAreaScale?: Margin;
        HAlign?: EHorizontalAlignment;
        VAlign?: EVerticalAlignment;
        Padding?: Margin;
    }

    interface ScaleBoxSlot extends PanelSlot {
        Padding?: Margin;
        HorizontalAlignment?: EHorizontalAlignment;
        VerticalAlignment?: EVerticalAlignment;
    }

    interface ScrollBoxSlot extends PanelSlot {
        Size?: SlateChildSize;
        Padding?: Margin;
        HorizontalAlignment?: EHorizontalAlignment;
        VerticalAlignment?: EVerticalAlignment;
    }

    interface SizeBoxSlot extends PanelSlot {
        Padding?: Margin;
        HorizontalAlignment?: EHorizontalAlignment;
        VerticalAlignment?: EVerticalAlignment;
    }

    interface StackBoxSlot extends PanelSlot {
        Padding?: Margin;
        Size?: SlateChildSize;
        HorizontalAlignment?: EHorizontalAlignment;
        VerticalAlignment?: EVerticalAlignment;
    }

    interface UniformGridSlot extends PanelSlot {
        HorizontalAlignment?: EHorizontalAlignment;
        VerticalAlignment?: EVerticalAlignment;
        Row?: number;
        Column?: number;
    }

    interface VerticalBoxSlot extends PanelSlot {
        Size?: SlateChildSize;
        Padding?: Margin;
        HorizontalAlignment?: EHorizontalAlignment;
        VerticalAlignment?: EVerticalAlignment;
    }

    interface WidgetSwitcherSlot extends PanelSlot {
        Padding?: Margin;
        HorizontalAlignment?: EHorizontalAlignment;
        VerticalAlignment?: EVerticalAlignment;
    }

    interface WindowTitleBarAreaSlot extends PanelSlot {
        Padding?: Margin;
        HorizontalAlignment?: EHorizontalAlignment;
        VerticalAlignment?: EVerticalAlignment;
    }

    interface WrapBoxSlot extends PanelSlot {
        Padding?: Margin;
        FillSpanWhenLessThan?: number;
        HorizontalAlignment?: EHorizontalAlignment;
        VerticalAlignment?: EVerticalAlignment;
        bFillEmptySpace?: boolean;
        bForceNewLine?: boolean;
    }

    export interface Props {
        Slot ? : PanelSlot;
    }

    type ESlateVisibility = UE.ESlateVisibility;
    interface WidgetTransform {
        Translation?: Vector2D;
        Scale?: Vector2D;
        Shear?: Vector2D;
        Angle?: number;
    }

    type EFlowDirectionPreference = UE.EFlowDirectionPreference;
    type ESlateAccessibleBehavior = UE.ESlateAccessibleBehavior;
    type EMouseCursor = UE.EMouseCursor;
    type EWidgetClipping = UE.EWidgetClipping;
    type EWidgetPixelSnapping = UE.EWidgetPixelSnapping;
    interface WidgetProps extends Props {
        bIsEnabledDelegate?: () => boolean;
        ToolTipTextDelegate?: () => string;
        ToolTipText?: string;
        VisibilityDelegate?: () => ESlateVisibility;
        RenderTransform?: WidgetTransform;
        RenderTransformPivot?: Vector2D;
        FlowDirectionPreference?: EFlowDirectionPreference;
        bIsVariable?: boolean;
        bCreatedByConstructionScript?: boolean;
        bIsEnabled?: boolean;
        bOverride_Cursor?: boolean;
        bOverrideAccessibleDefaults?: boolean;
        bCanChildrenBeAccessible?: boolean;
        AccessibleBehavior?: ESlateAccessibleBehavior;
        AccessibleSummaryBehavior?: ESlateAccessibleBehavior;
        AccessibleText?: string;
        AccessibleTextDelegate?: () => string;
        AccessibleSummaryText?: string;
        AccessibleSummaryTextDelegate?: () => string;
        bIsVolatile?: boolean;
        bHiddenInDesigner?: boolean;
        bExpandedInDesigner?: boolean;
        bLockedInDesigner?: boolean;
        Cursor?: EMouseCursor;
        Clipping?: EWidgetClipping;
        Visibility?: ESlateVisibility;
        PixelSnapping?: EWidgetPixelSnapping;
        RenderOpacity?: number;
        DesignerFlags?: number;
        DisplayLabel?: string;
        CategoryName?: string;
    }

    class Widget extends React.Component<WidgetProps> {
        nativePtr: UE.Widget;
    }

    interface TopLevelAssetPath {
        PackageName?: string;
        AssetName?: string;
    }

    interface AssetData {
        ObjectPath?: string;
        PackageName?: string;
        PackagePath?: string;
        AssetName?: string;
        AssetClass?: string;
        AssetClassPath?: TopLevelAssetPath;
    }

    interface IntPoint {
        X?: number;
        Y?: number;
    }

    type EThumbnailLabelType_BlueprintType = UE.EThumbnailLabelType_BlueprintType;
    interface LinearColor {
        R?: number;
        G?: number;
        B?: number;
        A?: number;
    }

    type EThumbnailColorStripOrientation_BlueprintType = UE.EThumbnailColorStripOrientation_BlueprintType;
    interface AssetThumbnailWidgetSettings {
        bForceGenericThumbnail?: boolean;
        bAllowHintText?: boolean;
        bAllowRealTimeOnHovered?: boolean;
        bAllowAssetSpecificThumbnailOverlay?: boolean;
        ThumbnailLabel?: EThumbnailLabelType_BlueprintType;
        HintColorAndOpacity?: LinearColor;
        bOverrideAssetTypeColor?: boolean;
        AssetTypeColorOverride?: LinearColor;
        Padding?: Margin;
        GenericThumbnailSize?: number;
        ColorStripOrientation?: EThumbnailColorStripOrientation_BlueprintType;
    }

    interface AssetThumbnailWidgetProps extends WidgetProps {
        AssetToShow?: AssetData;
        Resolution?: IntPoint;
        ThumbnailSettings?: AssetThumbnailWidgetSettings;
    }

    class AssetThumbnailWidget extends React.Component<AssetThumbnailWidgetProps> {
        nativePtr: UE.AssetThumbnailWidget;
    }

    type EAudioRadialSliderLayout = UE.EAudioRadialSliderLayout;
    interface AudioRadialSliderProps extends WidgetProps {
        Value?: number;
        ValueDelegate?: () => number;
        WidgetLayout?: EAudioRadialSliderLayout;
        CenterBackgroundColor?: LinearColor;
        SliderProgressColor?: LinearColor;
        SliderBarColor?: LinearColor;
        HandStartEndRatio?: Vector2D;
        UnitsText?: string;
        TextLabelBackgroundColor?: LinearColor;
        ShowLabelOnlyOnHover?: boolean;
        ShowUnitsText?: boolean;
        IsUnitsTextReadOnly?: boolean;
        IsValueTextReadOnly?: boolean;
        SliderThickness?: number;
        OutputRange?: Vector2D;
        OnValueChanged?: (Value: number) => void;
    }

    class AudioRadialSlider extends React.Component<AudioRadialSliderProps> {
        nativePtr: UE.AudioRadialSlider;
    }

    interface AudioFrequencyRadialSliderProps extends AudioRadialSliderProps {
    }

    class AudioFrequencyRadialSlider extends React.Component<AudioFrequencyRadialSliderProps> {
        nativePtr: UE.AudioFrequencyRadialSlider;
    }

    type EOrientation = UE.EOrientation;
    interface AudioSliderBaseProps extends WidgetProps {
        Value?: number;
        UnitsText?: string;
        TextLabelBackgroundColor?: LinearColor;
        TextLabelBackgroundColorDelegate?: () => LinearColor;
        ShowLabelOnlyOnHover?: boolean;
        ShowUnitsText?: boolean;
        IsUnitsTextReadOnly?: boolean;
        IsValueTextReadOnly?: boolean;
        ValueDelegate?: () => number;
        SliderBackgroundColor?: LinearColor;
        SliderBackgroundColorDelegate?: () => LinearColor;
        SliderBarColor?: LinearColor;
        SliderBarColorDelegate?: () => LinearColor;
        SliderThumbColor?: LinearColor;
        SliderThumbColorDelegate?: () => LinearColor;
        WidgetBackgroundColor?: LinearColor;
        WidgetBackgroundColorDelegate?: () => LinearColor;
        Orientation?: EOrientation;
        OnValueChanged?: (Value: number) => void;
    }

    class AudioSliderBase extends React.Component<AudioSliderBaseProps> {
        nativePtr: UE.AudioSliderBase;
    }

    interface AudioFrequencySliderProps extends AudioSliderBaseProps {
        OutputRange?: Vector2D;
    }

    class AudioFrequencySlider extends React.Component<AudioFrequencySliderProps> {
        nativePtr: UE.AudioFrequencySlider;
    }

    interface SlateWidgetStyle {
    }

    interface Vector2f {
        X?: number;
        Y?: number;
    }

    interface AudioMaterialWidgetStyle extends SlateWidgetStyle {
        DesiredSize?: Vector2f;
    }

    interface AudioMaterialButtonStyle extends AudioMaterialWidgetStyle {
        ButtonMainColor?: LinearColor;
        ButtonMainColorTint_1?: LinearColor;
        ButtonMainColorTint_2?: LinearColor;
        ButtonAccentColor?: LinearColor;
        ButtonShadowColor?: LinearColor;
        ButtonUnpressedOutlineColor?: LinearColor;
        ButtonPressedOutlineColor?: LinearColor;
    }

    interface AudioMaterialButtonProps extends WidgetProps {
        WidgetStyle?: AudioMaterialButtonStyle;
        OnButtonPressedChangedEvent?: (bIsPressed: boolean) => void;
        bIsPressed?: boolean;
    }

    class AudioMaterialButton extends React.Component<AudioMaterialButtonProps> {
        nativePtr: UE.AudioMaterialButton;
    }

    interface AudioMaterialEnvelopeStyle extends AudioMaterialWidgetStyle {
        CurveColor?: LinearColor;
        BackgroundColor?: LinearColor;
        OutlineColor?: LinearColor;
    }

    type EAudioMaterialEnvelopeType = UE.EAudioMaterialEnvelopeType;
    interface AudioMaterialEnvelopeSettings {
        EnvelopeType?: EAudioMaterialEnvelopeType;
        AttackCurve?: number;
        AttackValue?: number;
        AttackTime?: number;
        DecayCurve?: number;
        DecayTime?: number;
        SustainValue?: number;
        ReleaseCurve?: number;
        ReleaseTime?: number;
    }

    interface AudioMaterialEnvelopeProps extends WidgetProps {
        WidgetStyle?: AudioMaterialEnvelopeStyle;
        EnvelopeSettings?: AudioMaterialEnvelopeSettings;
    }

    class AudioMaterialEnvelope extends React.Component<AudioMaterialEnvelopeProps> {
        nativePtr: UE.AudioMaterialEnvelope;
    }

    type ESlateColorStylingMode = UE.ESlateColorStylingMode;
    interface SlateColor {
        SpecifiedColor?: LinearColor;
        ColorUseRule?: ESlateColorStylingMode;
    }

    type ESlateBrushDrawType = UE.ESlateBrushDrawType;
    type ESlateBrushTileType = UE.ESlateBrushTileType;
    type ESlateBrushMirrorType = UE.ESlateBrushMirrorType;
    type ESlateBrushImageType = UE.ESlateBrushImageType;
    interface DeprecateSlateVector2D extends Vector2f {
    }

    interface Vector4 {
        X?: number;
        Y?: number;
        Z?: number;
        W?: number;
    }

    type ESlateBrushRoundingType = UE.ESlateBrushRoundingType;
    interface SlateBrushOutlineSettings {
        CornerRadii?: Vector4;
        Color?: SlateColor;
        Width?: number;
        RoundingType?: ESlateBrushRoundingType;
        bUseBrushTransparency?: boolean;
    }

    interface Box2f {
        Min?: Vector2f;
        Max?: Vector2f;
        bIsValid?: boolean;
    }

    interface SlateBrush {
        TintColor?: SlateColor;
        DrawAs?: ESlateBrushDrawType;
        Tiling?: ESlateBrushTileType;
        Mirroring?: ESlateBrushMirrorType;
        ImageType?: ESlateBrushImageType;
        ImageSize?: DeprecateSlateVector2D;
        Margin?: Margin;
        Tint?: LinearColor;
        OutlineSettings?: SlateBrushOutlineSettings;
        UVRegion?: Box2f;
        bIsDynamicallyLoaded?: boolean;
        bHasUObject?: boolean;
        ResourceName?: string;
    }

    interface AudioTextBoxStyle extends SlateWidgetStyle {
        BackgroundImage?: SlateBrush;
        BackgroundColor?: SlateColor;
    }

    interface AudioMaterialKnobStyle extends AudioMaterialWidgetStyle {
        KnobMainColor?: LinearColor;
        KnobAccentColor?: LinearColor;
        KnobShadowColor?: LinearColor;
        KnobSmoothBevelColor?: LinearColor;
        KnobIndicatorDotColor?: LinearColor;
        KnobEdgeFillColor?: LinearColor;
        KnobBarColor?: LinearColor;
        KnobBarShadowColor?: LinearColor;
        KnobBarFillMinColor?: LinearColor;
        KnobBarFillMidColor?: LinearColor;
        KnobBarFillMaxColor?: LinearColor;
        KnobBarFillTintColor?: LinearColor;
        TextBoxStyle?: AudioTextBoxStyle;
    }

    interface AudioMaterialKnobProps extends WidgetProps {
        WidgetStyle?: AudioMaterialKnobStyle;
        OnKnobValueChanged?: (Value: number) => void;
        Value?: number;
        TuneSpeed?: number;
        FineTuneSpeed?: number;
        bLocked?: boolean;
        bMouseUsesStep?: boolean;
        StepSize?: number;
    }

    class AudioMaterialKnob extends React.Component<AudioMaterialKnobProps> {
        nativePtr: UE.AudioMaterialKnob;
    }

    interface FontOutlineSettings {
        OutlineSize?: number;
        bMiteredCorners?: boolean;
        bSeparateFillAlpha?: boolean;
        bApplyOutlineToDropShadows?: boolean;
        OutlineColor?: LinearColor;
    }

    type EFontHinting = UE.EFontHinting;
    interface SlateFontInfo {
        OutlineSettings?: FontOutlineSettings;
        TypefaceFontName?: string;
        Size?: number;
        LetterSpacing?: number;
        SkewAmount?: number;
        bForceMonospaced?: boolean;
        bMaterialIsStencil?: boolean;
        MonospacedWidth?: number;
        FontName?: string;
        Hinting?: EFontHinting;
    }

    interface AudioMaterialMeterStyle extends AudioMaterialWidgetStyle {
        MeterFillMinColor?: LinearColor;
        MeterFillMidColor?: LinearColor;
        MeterFillMaxColor?: LinearColor;
        MeterFillBackgroundColor?: LinearColor;
        MeterPadding?: Vector2D;
        ValueRangeDb?: Vector2D;
        bShowScale?: boolean;
        bScaleSide?: boolean;
        ScaleHashOffset?: number;
        ScaleHashWidth?: number;
        ScaleHashHeight?: number;
        DecibelsPerHash?: number;
        Font?: SlateFontInfo;
    }

    interface MeterChannelInfo {
        MeterValue?: number;
        PeakValue?: number;
        ClippingValue?: number;
    }

    interface AudioMaterialMeterProps extends WidgetProps {
        WidgetStyle?: AudioMaterialMeterStyle;
        Orientation?: EOrientation;
        MeterChannelInfoDelegate?: () => TArray<MeterChannelInfo>;
        MeterChannelInfo?: TArray<MeterChannelInfo>;
    }

    class AudioMaterialMeter extends React.Component<AudioMaterialMeterProps> {
        nativePtr: UE.AudioMaterialMeter;
    }

    interface AudioMaterialSliderStyle extends AudioMaterialWidgetStyle {
        SliderBackgroundColor?: LinearColor;
        SliderBackgroundAccentColor?: LinearColor;
        SliderValueMainColor?: LinearColor;
        SliderHandleMainColor?: LinearColor;
        SliderHandleOutlineColor?: LinearColor;
        TextBoxStyle?: AudioTextBoxStyle;
    }

    interface AudioMaterialSliderProps extends WidgetProps {
        WidgetStyle?: AudioMaterialSliderStyle;
        OnValueChanged?: (Value: number) => void;
        Value?: number;
        Orientation?: EOrientation;
        TuneSpeed?: number;
        FineTuneSpeed?: number;
        bLocked?: boolean;
        bMouseUsesStep?: boolean;
        StepSize?: number;
    }

    class AudioMaterialSlider extends React.Component<AudioMaterialSliderProps> {
        nativePtr: UE.AudioMaterialSlider;
    }

    interface AudioMeterStyle extends SlateWidgetStyle {
        MeterValueImage?: SlateBrush;
        BackgroundImage?: SlateBrush;
        MeterBackgroundImage?: SlateBrush;
        MeterValueBackgroundImage?: SlateBrush;
        MeterPeakImage?: SlateBrush;
        MeterSize?: Vector2D;
        MeterPadding?: Vector2D;
        MeterValuePadding?: number;
        PeakValueWidth?: number;
        ValueRangeDb?: Vector2D;
        bShowScale?: boolean;
        bScaleSide?: boolean;
        ScaleHashOffset?: number;
        ScaleHashWidth?: number;
        ScaleHashHeight?: number;
        DecibelsPerHash?: number;
        Font?: SlateFontInfo;
    }

    interface AudioMeterProps extends WidgetProps {
        MeterChannelInfo?: TArray<MeterChannelInfo>;
        MeterChannelInfoDelegate?: () => TArray<MeterChannelInfo>;
        WidgetStyle?: AudioMeterStyle;
        Orientation?: EOrientation;
        BackgroundColor?: LinearColor;
        MeterBackgroundColor?: LinearColor;
        MeterValueColor?: LinearColor;
        MeterPeakColor?: LinearColor;
        MeterClippingColor?: LinearColor;
        MeterScaleColor?: LinearColor;
        MeterScaleLabelColor?: LinearColor;
    }

    class AudioMeter extends React.Component<AudioMeterProps> {
        nativePtr: UE.AudioMeter;
    }

    interface FixedSampleSequenceRulerStyle extends SlateWidgetStyle {
        HandleWidth?: number;
        HandleColor?: SlateColor;
        HandleBrush?: SlateBrush;
        TicksColor?: SlateColor;
        TicksTextColor?: SlateColor;
        TicksTextFont?: SlateFontInfo;
        TicksTextOffset?: number;
        BackgroundColor?: SlateColor;
        BackgroundBrush?: SlateBrush;
        DesiredWidth?: number;
        DesiredHeight?: number;
    }

    interface SampledSequenceValueGridOverlayStyle extends SlateWidgetStyle {
        GridColor?: SlateColor;
        GridThickness?: number;
        LabelTextColor?: SlateColor;
        LabelTextFont?: SlateFontInfo;
        DesiredWidth?: number;
        DesiredHeight?: number;
    }

    interface SampledSequenceViewerStyle extends SlateWidgetStyle {
        SequenceColor?: SlateColor;
        SequenceLineThickness?: number;
        MajorGridLineColor?: SlateColor;
        MinorGridLineColor?: SlateColor;
        ZeroCrossingLineColor?: SlateColor;
        ZeroCrossingLineThickness?: number;
        SampleMarkersSize?: number;
        SequenceBackgroundColor?: SlateColor;
        BackgroundBrush?: SlateBrush;
        DesiredWidth?: number;
        DesiredHeight?: number;
    }

    interface TriggerThresholdLineStyle extends SlateWidgetStyle {
        LineColor?: LinearColor;
    }

    interface AudioOscilloscopePanelStyle extends SlateWidgetStyle {
        TimeRulerStyle?: FixedSampleSequenceRulerStyle;
        ValueGridStyle?: SampledSequenceValueGridOverlayStyle;
        WaveViewerStyle?: SampledSequenceViewerStyle;
        TriggerThresholdLineStyle?: TriggerThresholdLineStyle;
    }

    type EXAxisLabelsUnit = UE.EXAxisLabelsUnit;
    type EYAxisLabelsUnit = UE.EYAxisLabelsUnit;
    type EAudioOscilloscopeTriggerMode = UE.EAudioOscilloscopeTriggerMode;
    type EAudioPanelLayoutType = UE.EAudioPanelLayoutType;
    interface AudioOscilloscopeProps extends WidgetProps {
        OscilloscopeStyle?: AudioOscilloscopePanelStyle;
        MaxTimeWindowMs?: number;
        TimeWindowMs?: number;
        AnalysisPeriodMs?: number;
        bShowTimeGrid?: boolean;
        TimeGridLabelsUnit?: EXAxisLabelsUnit;
        bShowAmplitudeGrid?: boolean;
        bShowAmplitudeLabels?: boolean;
        AmplitudeGridLabelsUnit?: EYAxisLabelsUnit;
        TriggerMode?: EAudioOscilloscopeTriggerMode;
        TriggerThreshold?: number;
        PanelLayoutType?: EAudioPanelLayoutType;
        ChannelToAnalyze?: number;
    }

    class AudioOscilloscope extends React.Component<AudioOscilloscopeProps> {
        nativePtr: UE.AudioOscilloscope;
    }

    interface AudioSliderProps extends AudioSliderBaseProps {
    }

    class AudioSlider extends React.Component<AudioSliderProps> {
        nativePtr: UE.AudioSlider;
    }

    interface SampledSequenceVectorViewerStyle extends SlateWidgetStyle {
        BackgroundColor?: SlateColor;
        BackgroundBrush?: SlateBrush;
        LineColor?: LinearColor;
        LineThickness?: number;
    }

    interface AudioVectorscopePanelStyle extends SlateWidgetStyle {
        ValueGridStyle?: SampledSequenceValueGridOverlayStyle;
        VectorViewerStyle?: SampledSequenceVectorViewerStyle;
    }

    interface AudioVectorscopeProps extends WidgetProps {
        VectorscopeStyle?: AudioVectorscopePanelStyle;
        bShowGrid?: boolean;
        GridDivisions?: number;
        MaxDisplayPersistenceMs?: number;
        DisplayPersistenceMs?: number;
        Scale?: number;
        PanelLayoutType?: EAudioPanelLayoutType;
    }

    class AudioVectorscope extends React.Component<AudioVectorscopeProps> {
        nativePtr: UE.AudioVectorscope;
    }

    interface AudioVolumeRadialSliderProps extends AudioRadialSliderProps {
    }

    class AudioVolumeRadialSlider extends React.Component<AudioVolumeRadialSliderProps> {
        nativePtr: UE.AudioVolumeRadialSlider;
    }

    interface AudioVolumeSliderProps extends AudioSliderProps {
    }

    class AudioVolumeSlider extends React.Component<AudioVolumeSliderProps> {
        nativePtr: UE.AudioVolumeSlider;
    }

    interface PanelWidgetProps extends WidgetProps {
        children?: React.ReactNode;
    }

    class PanelWidget extends React.Component<PanelWidgetProps> {
        nativePtr: UE.PanelWidget;
    }

    interface ContentWidgetProps extends PanelWidgetProps {
        children?: React.ReactNode;
    }

    class ContentWidget extends React.Component<ContentWidgetProps> {
        nativePtr: UE.ContentWidget;
    }

    interface BackgroundBlurProps extends ContentWidgetProps {
        children?: React.ReactNode;
        Padding?: Margin;
        HorizontalAlignment?: EHorizontalAlignment;
        VerticalAlignment?: EVerticalAlignment;
        bApplyAlphaToBlur?: boolean;
        BlurStrength?: number;
        bOverrideAutoRadiusCalculation?: boolean;
        BlurRadius?: number;
        CornerRadius?: Vector4;
        LowQualityFallbackBrush?: SlateBrush;
    }

    class BackgroundBlur extends React.Component<BackgroundBlurProps> {
        nativePtr: UE.BackgroundBlur;
    }

    interface Geometry {
    }

    interface InputEvent {
    }

    interface PointerEvent extends InputEvent {
    }

    interface EventReply {
    }

    interface BorderProps extends ContentWidgetProps {
        children?: React.ReactNode;
        HorizontalAlignment?: EHorizontalAlignment;
        VerticalAlignment?: EVerticalAlignment;
        bShowEffectWhenDisabled?: boolean;
        ContentColorAndOpacity?: LinearColor;
        ContentColorAndOpacityDelegate?: () => LinearColor;
        Padding?: Margin;
        Background?: SlateBrush;
        BackgroundDelegate?: () => SlateBrush;
        BrushColor?: LinearColor;
        BrushColorDelegate?: () => LinearColor;
        DesiredSizeScale?: Vector2D;
        bFlipForRightToLeftFlowDirection?: boolean;
        OnMouseButtonDownEvent?: (MyGeometry: Geometry, MouseEvent: PointerEvent) => EventReply;
        OnMouseButtonUpEvent?: (MyGeometry: Geometry, MouseEvent: PointerEvent) => EventReply;
        OnMouseMoveEvent?: (MyGeometry: Geometry, MouseEvent: PointerEvent) => EventReply;
        OnMouseDoubleClickEvent?: (MyGeometry: Geometry, MouseEvent: PointerEvent) => EventReply;
    }

    class Border extends React.Component<BorderProps> {
        nativePtr: UE.Border;
    }

    interface SlateSound {
    }

    interface ButtonStyle extends SlateWidgetStyle {
        Normal?: SlateBrush;
        Hovered?: SlateBrush;
        Pressed?: SlateBrush;
        Disabled?: SlateBrush;
        NormalForeground?: SlateColor;
        HoveredForeground?: SlateColor;
        PressedForeground?: SlateColor;
        DisabledForeground?: SlateColor;
        NormalPadding?: Margin;
        PressedPadding?: Margin;
        PressedSlateSound?: SlateSound;
        HoveredSlateSound?: SlateSound;
        PressedSound?: string;
        HoveredSound?: string;
    }

    type EButtonClickMethod = UE.EButtonClickMethod;
    type EButtonTouchMethod = UE.EButtonTouchMethod;
    type EButtonPressMethod = UE.EButtonPressMethod;
    interface ButtonProps extends ContentWidgetProps {
        children?: React.ReactNode;
        WidgetStyle?: ButtonStyle;
        ColorAndOpacity?: LinearColor;
        BackgroundColor?: LinearColor;
        ClickMethod?: EButtonClickMethod;
        TouchMethod?: EButtonTouchMethod;
        PressMethod?: EButtonPressMethod;
        IsFocusable?: boolean;
        OnClicked?: () => void;
        OnPressed?: () => void;
        OnReleased?: () => void;
        OnHovered?: () => void;
        OnUnhovered?: () => void;
    }

    class Button extends React.Component<ButtonProps> {
        nativePtr: UE.Button;
    }

    interface CanvasPanelProps extends PanelWidgetProps {
        children?: React.ReactNode;
    }

    class CanvasPanel extends React.Component<CanvasPanelProps> {
        nativePtr: UE.CanvasPanel;
    }

    type ECheckBoxState = UE.ECheckBoxState;
    type ESlateCheckBoxType = UE.ESlateCheckBoxType;
    interface CheckBoxStyle extends SlateWidgetStyle {
        CheckBoxType?: ESlateCheckBoxType;
        UncheckedImage?: SlateBrush;
        UncheckedHoveredImage?: SlateBrush;
        UncheckedPressedImage?: SlateBrush;
        CheckedImage?: SlateBrush;
        CheckedHoveredImage?: SlateBrush;
        CheckedPressedImage?: SlateBrush;
        UndeterminedImage?: SlateBrush;
        UndeterminedHoveredImage?: SlateBrush;
        UndeterminedPressedImage?: SlateBrush;
        Padding?: Margin;
        BackgroundImage?: SlateBrush;
        BackgroundHoveredImage?: SlateBrush;
        BackgroundPressedImage?: SlateBrush;
        ForegroundColor?: SlateColor;
        HoveredForeground?: SlateColor;
        PressedForeground?: SlateColor;
        CheckedForeground?: SlateColor;
        CheckedHoveredForeground?: SlateColor;
        CheckedPressedForeground?: SlateColor;
        UndeterminedForeground?: SlateColor;
        BorderBackgroundColor?: SlateColor;
        CheckedSlateSound?: SlateSound;
        UncheckedSlateSound?: SlateSound;
        HoveredSlateSound?: SlateSound;
        CheckedSound?: string;
        UncheckedSound?: string;
        HoveredSound?: string;
    }

    interface CheckBoxProps extends ContentWidgetProps {
        children?: React.ReactNode;
        CheckedState?: ECheckBoxState;
        CheckedStateDelegate?: () => ECheckBoxState;
        WidgetStyle?: CheckBoxStyle;
        HorizontalAlignment?: EHorizontalAlignment;
        ClickMethod?: EButtonClickMethod;
        TouchMethod?: EButtonTouchMethod;
        PressMethod?: EButtonPressMethod;
        IsFocusable?: boolean;
        OnCheckStateChanged?: (bIsChecked: boolean) => void;
    }

    class CheckBox extends React.Component<CheckBoxProps> {
        nativePtr: UE.CheckBox;
    }

    interface CircularThrobberProps extends WidgetProps {
        NumberOfPieces?: number;
        Period?: number;
        Radius?: number;
        Image?: SlateBrush;
        bEnableRadius?: boolean;
    }

    class CircularThrobber extends React.Component<CircularThrobberProps> {
        nativePtr: UE.CircularThrobber;
    }

    interface ScrollBarStyle extends SlateWidgetStyle {
        HorizontalBackgroundImage?: SlateBrush;
        VerticalBackgroundImage?: SlateBrush;
        VerticalTopSlotImage?: SlateBrush;
        HorizontalTopSlotImage?: SlateBrush;
        VerticalBottomSlotImage?: SlateBrush;
        HorizontalBottomSlotImage?: SlateBrush;
        NormalThumbImage?: SlateBrush;
        HoveredThumbImage?: SlateBrush;
        DraggedThumbImage?: SlateBrush;
        Thickness?: number;
    }

    interface ComboBoxProps extends WidgetProps {
        ScrollBarStyle?: ScrollBarStyle;
        bIsFocusable?: boolean;
    }

    class ComboBox extends React.Component<ComboBoxProps> {
        nativePtr: UE.ComboBox;
    }

    interface ComboButtonStyle extends SlateWidgetStyle {
        ButtonStyle?: ButtonStyle;
        DownArrowImage?: SlateBrush;
        ShadowOffset?: DeprecateSlateVector2D;
        ShadowColorAndOpacity?: LinearColor;
        MenuBorderBrush?: SlateBrush;
        MenuBorderPadding?: Margin;
        ContentPadding?: Margin;
        DownArrowPadding?: Margin;
        DownArrowAlign?: EVerticalAlignment;
    }

    interface ComboBoxStyle extends SlateWidgetStyle {
        ComboButtonStyle?: ComboButtonStyle;
        PressedSlateSound?: SlateSound;
        SelectionChangeSlateSound?: SlateSound;
        ContentPadding?: Margin;
        MenuRowPadding?: Margin;
        PressedSound?: string;
        SelectionChangeSound?: string;
    }

    interface TableRowStyle extends SlateWidgetStyle {
        SelectorFocusedBrush?: SlateBrush;
        ActiveHoveredBrush?: SlateBrush;
        ActiveBrush?: SlateBrush;
        InactiveHoveredBrush?: SlateBrush;
        InactiveBrush?: SlateBrush;
        bUseParentRowBrush?: boolean;
        ParentRowBackgroundBrush?: SlateBrush;
        ParentRowBackgroundHoveredBrush?: SlateBrush;
        EvenRowBackgroundHoveredBrush?: SlateBrush;
        EvenRowBackgroundBrush?: SlateBrush;
        OddRowBackgroundHoveredBrush?: SlateBrush;
        OddRowBackgroundBrush?: SlateBrush;
        TextColor?: SlateColor;
        SelectedTextColor?: SlateColor;
        DropIndicator_Above?: SlateBrush;
        DropIndicator_Onto?: SlateBrush;
        DropIndicator_Below?: SlateBrush;
        ActiveHighlightedBrush?: SlateBrush;
        InactiveHighlightedBrush?: SlateBrush;
    }

    type ESelectInfo = UE.ESelectInfo;
    interface ComboBoxKeyProps extends WidgetProps {
        Options?: TArray<string>;
        SelectedOption?: string;
        WidgetStyle?: ComboBoxStyle;
        ItemStyle?: TableRowStyle;
        ScrollBarStyle?: ScrollBarStyle;
        ForegroundColor?: SlateColor;
        ContentPadding?: Margin;
        MaxListHeight?: number;
        bHasDownArrow?: boolean;
        bEnableGamepadNavigationMode?: boolean;
        bIsFocusable?: boolean;
        OnSelectionChanged?: (SelectedItem: string, SelectionType: ESelectInfo) => void;
        OnOpening?: () => void;
    }

    class ComboBoxKey extends React.Component<ComboBoxKeyProps> {
        nativePtr: UE.ComboBoxKey;
    }

    interface ComboBoxStringProps extends WidgetProps {
        DefaultOptions?: TArray<string>;
        SelectedOption?: string;
        WidgetStyle?: ComboBoxStyle;
        ItemStyle?: TableRowStyle;
        ScrollBarStyle?: ScrollBarStyle;
        ContentPadding?: Margin;
        MaxListHeight?: number;
        HasDownArrow?: boolean;
        EnableGamepadNavigationMode?: boolean;
        Font?: SlateFontInfo;
        ForegroundColor?: SlateColor;
        bIsFocusable?: boolean;
        OnSelectionChanged?: (SelectedItem: string, SelectionType: ESelectInfo) => void;
        OnOpening?: () => void;
    }

    class ComboBoxString extends React.Component<ComboBoxStringProps> {
        nativePtr: UE.ComboBoxString;
    }

    interface SoftObjectPath {
        AssetPath?: TopLevelAssetPath;
        SubPathString?: string;
    }

    interface PropertyViewBaseProps extends WidgetProps {
        SoftObjectPath?: SoftObjectPath;
        bAutoLoadAsset?: boolean;
        OnPropertyChanged?: (PropertyName: string) => void;
    }

    class PropertyViewBase extends React.Component<PropertyViewBaseProps> {
        nativePtr: UE.PropertyViewBase;
    }

    interface DetailsViewProps extends PropertyViewBaseProps {
        bAllowFiltering?: boolean;
        bAllowFavoriteSystem?: boolean;
        bShowModifiedPropertiesOption?: boolean;
        bShowKeyablePropertiesOption?: boolean;
        bShowAnimatedPropertiesOption?: boolean;
        ColumnWidth?: number;
        bShowScrollBar?: boolean;
        bForceHiddenPropertyVisibility?: boolean;
        ViewIdentifier?: string;
        CategoriesToShow?: TArray<string>;
        PropertiesToShow?: TArray<string>;
        bShowOnlyAllowed?: boolean;
    }

    class DetailsView extends React.Component<DetailsViewProps> {
        nativePtr: UE.DetailsView;
    }

    type EDynamicBoxType = UE.EDynamicBoxType;
    interface RadialBoxSettings {
        StartingAngle?: number;
        bDistributeItemsEvenly?: boolean;
        AngleBetweenItems?: number;
        SectorCentralAngle?: number;
    }

    interface UserWidgetPool {
    }

    interface DynamicEntryBoxBaseProps extends WidgetProps {
        EntrySpacing?: Vector2D;
        SpacingPattern?: TArray<Vector2D>;
        EntryBoxType?: EDynamicBoxType;
        EntrySizeRule?: SlateChildSize;
        EntryHorizontalAlignment?: EHorizontalAlignment;
        EntryVerticalAlignment?: EVerticalAlignment;
        MaxElementSize?: number;
        RadialBoxSettings?: RadialBoxSettings;
        EntryWidgetPool?: UserWidgetPool;
    }

    class DynamicEntryBoxBase extends React.Component<DynamicEntryBoxBaseProps> {
        nativePtr: UE.DynamicEntryBoxBase;
    }

    interface DynamicEntryBoxProps extends DynamicEntryBoxBaseProps {
        NumDesignerPreviewEntries?: number;
    }

    class DynamicEntryBox extends React.Component<DynamicEntryBoxProps> {
        nativePtr: UE.DynamicEntryBox;
    }

    interface EditableTextStyle extends SlateWidgetStyle {
        Font?: SlateFontInfo;
        ColorAndOpacity?: SlateColor;
        BackgroundImageSelected?: SlateBrush;
        BackgroundImageComposing?: SlateBrush;
        CaretImage?: SlateBrush;
    }

    type EVirtualKeyboardType = UE.EVirtualKeyboardType;
    interface VirtualKeyboardOptions {
        bEnableAutocorrect?: boolean;
    }

    type EVirtualKeyboardTrigger = UE.EVirtualKeyboardTrigger;
    type EVirtualKeyboardDismissAction = UE.EVirtualKeyboardDismissAction;
    type ETextJustify = UE.ETextJustify;
    type ETextOverflowPolicy = UE.ETextOverflowPolicy;
    type ETextShapingMethod = UE.ETextShapingMethod;
    type ETextFlowDirection = UE.ETextFlowDirection;
    interface ShapedTextOptions {
        bOverride_TextShapingMethod?: boolean;
        bOverride_TextFlowDirection?: boolean;
        TextShapingMethod?: ETextShapingMethod;
        TextFlowDirection?: ETextFlowDirection;
    }

    type ETextCommit = UE.ETextCommit;
    interface EditableTextProps extends WidgetProps {
        Text?: string;
        TextDelegate?: () => string;
        HintText?: string;
        HintTextDelegate?: () => string;
        WidgetStyle?: EditableTextStyle;
        IsReadOnly?: boolean;
        IsPassword?: boolean;
        MinimumDesiredWidth?: number;
        IsCaretMovedWhenGainFocus?: boolean;
        SelectAllTextWhenFocused?: boolean;
        RevertTextOnEscape?: boolean;
        ClearKeyboardFocusOnCommit?: boolean;
        SelectAllTextOnCommit?: boolean;
        AllowContextMenu?: boolean;
        KeyboardType?: EVirtualKeyboardType;
        VirtualKeyboardOptions?: VirtualKeyboardOptions;
        VirtualKeyboardTrigger?: EVirtualKeyboardTrigger;
        VirtualKeyboardDismissAction?: EVirtualKeyboardDismissAction;
        Justification?: ETextJustify;
        OverflowPolicy?: ETextOverflowPolicy;
        ShapedTextOptions?: ShapedTextOptions;
        OnTextChanged?: (Text: string) => void;
        OnTextCommitted?: (Text: string, CommitMethod: ETextCommit) => void;
    }

    class EditableText extends React.Component<EditableTextProps> {
        nativePtr: UE.EditableText;
    }

    type ETextTransformPolicy = UE.ETextTransformPolicy;
    interface TextBlockStyle extends SlateWidgetStyle {
        Font?: SlateFontInfo;
        ColorAndOpacity?: SlateColor;
        ShadowOffset?: DeprecateSlateVector2D;
        ShadowColorAndOpacity?: LinearColor;
        SelectedBackgroundColor?: SlateColor;
        HighlightColor?: SlateColor;
        HighlightShape?: SlateBrush;
        StrikeBrush?: SlateBrush;
        UnderlineBrush?: SlateBrush;
        TransformPolicy?: ETextTransformPolicy;
        OverflowPolicy?: ETextOverflowPolicy;
    }

    interface EditableTextBoxStyle extends SlateWidgetStyle {
        BackgroundImageNormal?: SlateBrush;
        BackgroundImageHovered?: SlateBrush;
        BackgroundImageFocused?: SlateBrush;
        BackgroundImageReadOnly?: SlateBrush;
        Padding?: Margin;
        Font?: SlateFontInfo;
        TextStyle?: TextBlockStyle;
        ForegroundColor?: SlateColor;
        BackgroundColor?: SlateColor;
        ReadOnlyForegroundColor?: SlateColor;
        FocusedForegroundColor?: SlateColor;
        HScrollBarPadding?: Margin;
        VScrollBarPadding?: Margin;
        ScrollBarStyle?: ScrollBarStyle;
    }

    interface EditableTextBoxProps extends WidgetProps {
        Text?: string;
        TextDelegate?: () => string;
        WidgetStyle?: EditableTextBoxStyle;
        HintText?: string;
        HintTextDelegate?: () => string;
        IsReadOnly?: boolean;
        IsPassword?: boolean;
        MinimumDesiredWidth?: number;
        IsCaretMovedWhenGainFocus?: boolean;
        SelectAllTextWhenFocused?: boolean;
        RevertTextOnEscape?: boolean;
        ClearKeyboardFocusOnCommit?: boolean;
        SelectAllTextOnCommit?: boolean;
        AllowContextMenu?: boolean;
        KeyboardType?: EVirtualKeyboardType;
        VirtualKeyboardOptions?: VirtualKeyboardOptions;
        VirtualKeyboardTrigger?: EVirtualKeyboardTrigger;
        VirtualKeyboardDismissAction?: EVirtualKeyboardDismissAction;
        Justification?: ETextJustify;
        OverflowPolicy?: ETextOverflowPolicy;
        ShapedTextOptions?: ShapedTextOptions;
        OnTextChanged?: (Text: string) => void;
        OnTextCommitted?: (Text: string, CommitMethod: ETextCommit) => void;
        bIsFontDeprecationDone?: boolean;
    }

    class EditableTextBox extends React.Component<EditableTextBoxProps> {
        nativePtr: UE.EditableTextBox;
    }

    interface EditorUtilityButtonProps extends ButtonProps {
        children?: React.ReactNode;
    }

    class EditorUtilityButton extends React.Component<EditorUtilityButtonProps> {
        nativePtr: UE.EditorUtilityButton;
    }

    interface EditorUtilityCheckBoxProps extends CheckBoxProps {
        children?: React.ReactNode;
    }

    class EditorUtilityCheckBox extends React.Component<EditorUtilityCheckBoxProps> {
        nativePtr: UE.EditorUtilityCheckBox;
    }

    interface EditorUtilityCircularThrobberProps extends CircularThrobberProps {
    }

    class EditorUtilityCircularThrobber extends React.Component<EditorUtilityCircularThrobberProps> {
        nativePtr: UE.EditorUtilityCircularThrobber;
    }

    interface EditorUtilityComboBoxKeyProps extends ComboBoxKeyProps {
    }

    class EditorUtilityComboBoxKey extends React.Component<EditorUtilityComboBoxKeyProps> {
        nativePtr: UE.EditorUtilityComboBoxKey;
    }

    interface EditorUtilityComboBoxStringProps extends ComboBoxStringProps {
    }

    class EditorUtilityComboBoxString extends React.Component<EditorUtilityComboBoxStringProps> {
        nativePtr: UE.EditorUtilityComboBoxString;
    }

    interface EditorUtilityEditableTextProps extends EditableTextProps {
    }

    class EditorUtilityEditableText extends React.Component<EditorUtilityEditableTextProps> {
        nativePtr: UE.EditorUtilityEditableText;
    }

    interface EditorUtilityEditableTextBoxProps extends EditableTextBoxProps {
    }

    class EditorUtilityEditableTextBox extends React.Component<EditorUtilityEditableTextBoxProps> {
        nativePtr: UE.EditorUtilityEditableTextBox;
    }

    interface ExpandableAreaStyle extends SlateWidgetStyle {
        CollapsedImage?: SlateBrush;
        ExpandedImage?: SlateBrush;
        RolloutAnimationSeconds?: number;
    }

    interface ExpandableAreaProps extends WidgetProps {
        Style?: ExpandableAreaStyle;
        BorderBrush?: SlateBrush;
        BorderColor?: SlateColor;
        bIsExpanded?: boolean;
        MaxHeight?: number;
        HeaderPadding?: Margin;
        AreaPadding?: Margin;
    }

    class ExpandableArea extends React.Component<ExpandableAreaProps> {
        nativePtr: UE.ExpandableArea;
    }

    interface EditorUtilityExpandableAreaProps extends ExpandableAreaProps {
    }

    class EditorUtilityExpandableArea extends React.Component<EditorUtilityExpandableAreaProps> {
        nativePtr: UE.EditorUtilityExpandableArea;
    }

    interface Key {
        KeyName?: string;
    }

    interface InputChord {
        Key?: Key;
        bShift?: boolean;
        bCtrl?: boolean;
        bAlt?: boolean;
        bCmd?: boolean;
    }

    interface InputKeySelectorProps extends WidgetProps {
        WidgetStyle?: ButtonStyle;
        TextStyle?: TextBlockStyle;
        SelectedKey?: InputChord;
        Margin?: Margin;
        KeySelectionText?: string;
        NoKeySpecifiedText?: string;
        bAllowModifierKeys?: boolean;
        bAllowGamepadKeys?: boolean;
        EscapeKeys?: TArray<Key>;
        OnKeySelected?: (SelectedKey: InputChord) => void;
        OnIsSelectingKeyChanged?: () => void;
    }

    class InputKeySelector extends React.Component<InputKeySelectorProps> {
        nativePtr: UE.InputKeySelector;
    }

    interface EditorUtilityInputKeySelectorProps extends InputKeySelectorProps {
    }

    class EditorUtilityInputKeySelector extends React.Component<EditorUtilityInputKeySelectorProps> {
        nativePtr: UE.EditorUtilityInputKeySelector;
    }

    interface ListViewBaseProps extends WidgetProps {
        WheelScrollMultiplier?: number;
        bEnableScrollAnimation?: boolean;
        ScrollingAnimationInterpolationSpeed?: number;
        bInEnableTouchAnimatedScrolling?: boolean;
        AllowOverscroll?: boolean;
        bEnableRightClickScrolling?: boolean;
        bEnableTouchScrolling?: boolean;
        bIsPointerScrollingEnabled?: boolean;
        bIsGamepadScrollingEnabled?: boolean;
        bEnableFixedLineOffset?: boolean;
        FixedLineScrollOffset?: number;
        bAllowDragging?: boolean;
        NumDesignerPreviewEntries?: number;
        EntryWidgetPool?: UserWidgetPool;
    }

    class ListViewBase extends React.Component<ListViewBaseProps> {
        nativePtr: UE.ListViewBase;
    }

    interface TableViewStyle extends SlateWidgetStyle {
        BackgroundBrush?: SlateBrush;
    }

    type ESelectionMode = UE.ESelectionMode;
    type EConsumeMouseWheel = UE.EConsumeMouseWheel;
    type EScrollIntoViewAlignment = UE.EScrollIntoViewAlignment;
    interface ListViewProps extends ListViewBaseProps {
        WidgetStyle?: TableViewStyle;
        ScrollBarStyle?: ScrollBarStyle;
        Orientation?: EOrientation;
        SelectionMode?: ESelectionMode;
        ConsumeMouseWheel?: EConsumeMouseWheel;
        bClearSelectionOnClick?: boolean;
        bIsFocusable?: boolean;
        bReturnFocusToSelection?: boolean;
        ScrollIntoViewAlignment?: EScrollIntoViewAlignment;
        EntrySpacing?: number;
        HorizontalEntrySpacing?: number;
        VerticalEntrySpacing?: number;
        ScrollBarPadding?: Margin;
        BP_OnListViewScrolled?: (ItemOffset: number, DistanceRemaining: number) => void;
    }

    class ListView extends React.Component<ListViewProps> {
        nativePtr: UE.ListView;
    }

    interface EditorUtilityListViewProps extends ListViewProps {
    }

    class EditorUtilityListView extends React.Component<EditorUtilityListViewProps> {
        nativePtr: UE.EditorUtilityListView;
    }

    type ETextWrappingPolicy = UE.ETextWrappingPolicy;
    interface TextLayoutWidgetProps extends WidgetProps {
        ShapedTextOptions?: ShapedTextOptions;
        Justification?: ETextJustify;
        WrappingPolicy?: ETextWrappingPolicy;
        AutoWrapText?: boolean;
        ApplyLineHeightToBottomLine?: boolean;
        WrapTextAt?: number;
        Margin?: Margin;
        LineHeightPercentage?: number;
    }

    class TextLayoutWidget extends React.Component<TextLayoutWidgetProps> {
        nativePtr: UE.TextLayoutWidget;
    }

    interface MultiLineEditableTextProps extends TextLayoutWidgetProps {
        Text?: string;
        HintText?: string;
        HintTextDelegate?: () => string;
        WidgetStyle?: TextBlockStyle;
        bIsReadOnly?: boolean;
        SelectAllTextWhenFocused?: boolean;
        ClearTextSelectionOnFocusLoss?: boolean;
        RevertTextOnEscape?: boolean;
        ClearKeyboardFocusOnCommit?: boolean;
        AllowContextMenu?: boolean;
        VirtualKeyboardOptions?: VirtualKeyboardOptions;
        VirtualKeyboardDismissAction?: EVirtualKeyboardDismissAction;
        OnTextChanged?: (Text: string) => void;
        OnTextCommitted?: (Text: string, CommitMethod: ETextCommit) => void;
    }

    class MultiLineEditableText extends React.Component<MultiLineEditableTextProps> {
        nativePtr: UE.MultiLineEditableText;
    }

    interface EditorUtilityMultiLineEditableTextProps extends MultiLineEditableTextProps {
    }

    class EditorUtilityMultiLineEditableText extends React.Component<EditorUtilityMultiLineEditableTextProps> {
        nativePtr: UE.EditorUtilityMultiLineEditableText;
    }

    interface MultiLineEditableTextBoxProps extends TextLayoutWidgetProps {
        Text?: string;
        HintText?: string;
        HintTextDelegate?: () => string;
        WidgetStyle?: EditableTextBoxStyle;
        TextStyle?: TextBlockStyle;
        bIsReadOnly?: boolean;
        AllowContextMenu?: boolean;
        VirtualKeyboardOptions?: VirtualKeyboardOptions;
        VirtualKeyboardDismissAction?: EVirtualKeyboardDismissAction;
        OnTextChanged?: (Text: string) => void;
        OnTextCommitted?: (Text: string, CommitMethod: ETextCommit) => void;
        bIsFontDeprecationDone?: boolean;
    }

    class MultiLineEditableTextBox extends React.Component<MultiLineEditableTextBoxProps> {
        nativePtr: UE.MultiLineEditableTextBox;
    }

    interface EditorUtilityMultiLineEditableTextBoxProps extends MultiLineEditableTextBoxProps {
    }

    class EditorUtilityMultiLineEditableTextBox extends React.Component<EditorUtilityMultiLineEditableTextBoxProps> {
        nativePtr: UE.EditorUtilityMultiLineEditableTextBox;
    }

    interface ProgressBarStyle extends SlateWidgetStyle {
        BackgroundImage?: SlateBrush;
        FillImage?: SlateBrush;
        MarqueeImage?: SlateBrush;
        EnableFillAnimation?: boolean;
    }

    type EProgressBarFillType = UE.EProgressBarFillType;
    type EProgressBarFillStyle = UE.EProgressBarFillStyle;
    interface ProgressBarProps extends WidgetProps {
        WidgetStyle?: ProgressBarStyle;
        Percent?: number;
        BarFillType?: EProgressBarFillType;
        BarFillStyle?: EProgressBarFillStyle;
        bIsMarquee?: boolean;
        BorderPadding?: Vector2D;
        PercentDelegate?: () => number;
        FillColorAndOpacity?: LinearColor;
        FillColorAndOpacityDelegate?: () => LinearColor;
    }

    class ProgressBar extends React.Component<ProgressBarProps> {
        nativePtr: UE.ProgressBar;
    }

    interface EditorUtilityProgressBarProps extends ProgressBarProps {
    }

    class EditorUtilityProgressBar extends React.Component<EditorUtilityProgressBarProps> {
        nativePtr: UE.EditorUtilityProgressBar;
    }

    interface ScrollBarProps extends WidgetProps {
        WidgetStyle?: ScrollBarStyle;
        bAlwaysShowScrollbar?: boolean;
        bAlwaysShowScrollbarTrack?: boolean;
        Orientation?: EOrientation;
        Thickness?: Vector2D;
        Padding?: Margin;
    }

    class ScrollBar extends React.Component<ScrollBarProps> {
        nativePtr: UE.ScrollBar;
    }

    interface EditorUtilityScrollBarProps extends ScrollBarProps {
    }

    class EditorUtilityScrollBar extends React.Component<EditorUtilityScrollBarProps> {
        nativePtr: UE.EditorUtilityScrollBar;
    }

    interface ScrollBoxStyle extends SlateWidgetStyle {
        BarThickness?: number;
        TopShadowBrush?: SlateBrush;
        BottomShadowBrush?: SlateBrush;
        LeftShadowBrush?: SlateBrush;
        RightShadowBrush?: SlateBrush;
        HorizontalScrolledContentPadding?: Margin;
        VerticalScrolledContentPadding?: Margin;
    }

    type EDescendantScrollDestination = UE.EDescendantScrollDestination;
    type EScrollWhenFocusChanges = UE.EScrollWhenFocusChanges;
    interface ScrollBoxProps extends PanelWidgetProps {
        children?: React.ReactNode;
        ScrollAnimationInterpolationSpeed?: number;
        bEnableTouchScrolling?: boolean;
        WidgetStyle?: ScrollBoxStyle;
        WidgetBarStyle?: ScrollBarStyle;
        Orientation?: EOrientation;
        ScrollBarVisibility?: ESlateVisibility;
        ConsumeMouseWheel?: EConsumeMouseWheel;
        ScrollbarThickness?: Vector2D;
        ScrollbarPadding?: Margin;
        AlwaysShowScrollbar?: boolean;
        AlwaysShowScrollbarTrack?: boolean;
        AllowOverscroll?: boolean;
        BackPadScrolling?: boolean;
        FrontPadScrolling?: boolean;
        bAnimateWheelScrolling?: boolean;
        NavigationDestination?: EDescendantScrollDestination;
        NavigationScrollPadding?: number;
        ScrollWhenFocusChanges?: EScrollWhenFocusChanges;
        bAllowRightClickDragScrolling?: boolean;
        WheelScrollMultiplier?: number;
        OnUserScrolled?: (CurrentOffset: number) => void;
        OnScrollBarVisibilityChanged?: (NewVisibility: ESlateVisibility) => void;
    }

    class ScrollBox extends React.Component<ScrollBoxProps> {
        nativePtr: UE.ScrollBox;
    }

    interface EditorUtilityScrollBoxProps extends ScrollBoxProps {
        children?: React.ReactNode;
    }

    class EditorUtilityScrollBox extends React.Component<EditorUtilityScrollBoxProps> {
        nativePtr: UE.EditorUtilityScrollBox;
    }

    interface SliderStyle extends SlateWidgetStyle {
        NormalBarImage?: SlateBrush;
        HoveredBarImage?: SlateBrush;
        DisabledBarImage?: SlateBrush;
        NormalThumbImage?: SlateBrush;
        HoveredThumbImage?: SlateBrush;
        DisabledThumbImage?: SlateBrush;
        BarThickness?: number;
    }

    interface SliderProps extends WidgetProps {
        Value?: number;
        ValueDelegate?: () => number;
        MinValue?: number;
        MaxValue?: number;
        WidgetStyle?: SliderStyle;
        Orientation?: EOrientation;
        SliderBarColor?: LinearColor;
        SliderHandleColor?: LinearColor;
        IndentHandle?: boolean;
        Locked?: boolean;
        MouseUsesStep?: boolean;
        RequiresControllerLock?: boolean;
        StepSize?: number;
        IsFocusable?: boolean;
        OnMouseCaptureBegin?: () => void;
        OnMouseCaptureEnd?: () => void;
        OnControllerCaptureBegin?: () => void;
        OnControllerCaptureEnd?: () => void;
        OnValueChanged?: (Value: number) => void;
    }

    class Slider extends React.Component<SliderProps> {
        nativePtr: UE.Slider;
    }

    interface EditorUtilitySliderProps extends SliderProps {
    }

    class EditorUtilitySlider extends React.Component<EditorUtilitySliderProps> {
        nativePtr: UE.EditorUtilitySlider;
    }

    interface SpinBoxStyle extends SlateWidgetStyle {
        BackgroundBrush?: SlateBrush;
        ActiveBackgroundBrush?: SlateBrush;
        HoveredBackgroundBrush?: SlateBrush;
        ActiveFillBrush?: SlateBrush;
        HoveredFillBrush?: SlateBrush;
        InactiveFillBrush?: SlateBrush;
        ArrowsImage?: SlateBrush;
        ForegroundColor?: SlateColor;
        TextPadding?: Margin;
        InsetPadding?: Margin;
    }

    interface SpinBoxProps extends WidgetProps {
        Value?: number;
        ValueDelegate?: () => number;
        WidgetStyle?: SpinBoxStyle;
        MinFractionalDigits?: number;
        MaxFractionalDigits?: number;
        bAlwaysUsesDeltaSnap?: boolean;
        bEnableSlider?: boolean;
        Delta?: number;
        SliderExponent?: number;
        Font?: SlateFontInfo;
        Justification?: ETextJustify;
        MinDesiredWidth?: number;
        KeyboardType?: EVirtualKeyboardType;
        ClearKeyboardFocusOnCommit?: boolean;
        SelectAllTextOnCommit?: boolean;
        ForegroundColor?: SlateColor;
        OnValueChanged?: (InValue: number) => void;
        OnValueCommitted?: (InValue: number, CommitMethod: ETextCommit) => void;
        OnBeginSliderMovement?: () => void;
        OnEndSliderMovement?: (InValue: number) => void;
        bOverride_MinValue?: boolean;
        bOverride_MaxValue?: boolean;
        bOverride_MinSliderValue?: boolean;
        bOverride_MaxSliderValue?: boolean;
        MinValue?: number;
        MaxValue?: number;
        MinSliderValue?: number;
        MaxSliderValue?: number;
    }

    class SpinBox extends React.Component<SpinBoxProps> {
        nativePtr: UE.SpinBox;
    }

    interface EditorUtilitySpinBoxProps extends SpinBoxProps {
    }

    class EditorUtilitySpinBox extends React.Component<EditorUtilitySpinBoxProps> {
        nativePtr: UE.EditorUtilitySpinBox;
    }

    interface ThrobberProps extends WidgetProps {
        NumberOfPieces?: number;
        bAnimateHorizontally?: boolean;
        bAnimateVertically?: boolean;
        bAnimateOpacity?: boolean;
        Image?: SlateBrush;
    }

    class Throbber extends React.Component<ThrobberProps> {
        nativePtr: UE.Throbber;
    }

    interface EditorUtilityThrobberProps extends ThrobberProps {
    }

    class EditorUtilityThrobber extends React.Component<EditorUtilityThrobberProps> {
        nativePtr: UE.EditorUtilityThrobber;
    }

    interface TreeViewProps extends ListViewProps {
    }

    class TreeView extends React.Component<TreeViewProps> {
        nativePtr: UE.TreeView;
    }

    interface EditorUtilityTreeViewProps extends TreeViewProps {
    }

    class EditorUtilityTreeView extends React.Component<EditorUtilityTreeViewProps> {
        nativePtr: UE.EditorUtilityTreeView;
    }

    interface QueuedWidgetAnimationTransition {
    }

    interface Guid {
        A?: number;
        B?: number;
        C?: number;
        D?: number;
    }

    interface NamedSlotBinding {
        Name?: string;
        Guid?: Guid;
    }

    type EDesignPreviewSizeMode = UE.EDesignPreviewSizeMode;
    type EWidgetTickFrequency = UE.EWidgetTickFrequency;
    interface WidgetChild {
        WidgetName?: string;
    }

    type EWidgetAnimationEvent = UE.EWidgetAnimationEvent;
    interface AnimationEventBinding {
        AnimationEvent?: EWidgetAnimationEvent;
        UserTag?: string;
    }

    interface UserWidgetProps extends WidgetProps {
        ColorAndOpacity?: LinearColor;
        ColorAndOpacityDelegate?: () => LinearColor;
        ForegroundColor?: SlateColor;
        ForegroundColorDelegate?: () => SlateColor;
        OnVisibilityChanged?: (InVisibility: ESlateVisibility) => void;
        Padding?: Margin;
        Priority?: number;
        bIsFocusable?: boolean;
        bStopAction?: boolean;
        bAutomaticallyRegisterInputOnConstruction?: boolean;
        QueuedWidgetAnimationTransitions?: TArray<QueuedWidgetAnimationTransition>;
        NamedSlotBindings?: TArray<NamedSlotBinding>;
        DesignTimeSize?: Vector2D;
        DesignSizeMode?: EDesignPreviewSizeMode;
        PaletteCategory?: string;
        bHasScriptImplementedTick?: boolean;
        bHasScriptImplementedPaint?: boolean;
        TickFrequency?: EWidgetTickFrequency;
        DesiredFocusWidget?: WidgetChild;
        AnimationCallbacks?: TArray<AnimationEventBinding>;
    }

    class UserWidget extends React.Component<UserWidgetProps> {
        nativePtr: UE.UserWidget;
    }

    interface EditorUtilityWidgetProps extends UserWidgetProps {
        TabDisplayName?: string;
        HelpText?: string;
        bAlwaysReregisterWithWindowsMenu?: boolean;
        bAutoRunDefaultAction?: boolean;
    }

    class EditorUtilityWidget extends React.Component<EditorUtilityWidgetProps> {
        nativePtr: UE.EditorUtilityWidget;
    }

    interface GridPanelProps extends PanelWidgetProps {
        children?: React.ReactNode;
        ColumnFill?: TArray<number>;
        RowFill?: TArray<number>;
    }

    class GridPanel extends React.Component<GridPanelProps> {
        nativePtr: UE.GridPanel;
    }

    interface HorizontalBoxProps extends PanelWidgetProps {
        children?: React.ReactNode;
    }

    class HorizontalBox extends React.Component<HorizontalBoxProps> {
        nativePtr: UE.HorizontalBox;
    }

    interface ImageProps extends WidgetProps {
        Brush?: SlateBrush;
        BrushDelegate?: () => SlateBrush;
        ColorAndOpacity?: LinearColor;
        ColorAndOpacityDelegate?: () => LinearColor;
        bFlipForRightToLeftFlowDirection?: boolean;
        OnMouseButtonDownEvent?: (MyGeometry: Geometry, MouseEvent: PointerEvent) => EventReply;
    }

    class Image extends React.Component<ImageProps> {
        nativePtr: UE.Image;
    }

    interface InvalidationBoxProps extends ContentWidgetProps {
        children?: React.ReactNode;
        bCanCache?: boolean;
    }

    class InvalidationBox extends React.Component<InvalidationBoxProps> {
        nativePtr: UE.InvalidationBox;
    }

    interface FrameNumber {
        Value?: number;
    }

    interface FrameTime {
        FrameNumber?: FrameNumber;
        SubFrame?: number;
    }

    interface FrameRate {
        Numerator?: number;
        Denominator?: number;
    }

    interface QualifiedFrameTime {
        Time?: FrameTime;
        Rate?: FrameRate;
    }

    interface MovieSceneSequenceID {
        Value?: number;
    }

    interface LevelSequencePlayerSnapshot {
        RootName?: string;
        RootTime?: QualifiedFrameTime;
        SourceTime?: QualifiedFrameTime;
        CurrentShotName?: string;
        CurrentShotLocalTime?: QualifiedFrameTime;
        CurrentShotSourceTime?: QualifiedFrameTime;
        SourceTimecode?: string;
        ShotID?: MovieSceneSequenceID;
    }

    interface LevelSequenceBurnInProps extends UserWidgetProps {
        FrameInformation?: LevelSequencePlayerSnapshot;
    }

    class LevelSequenceBurnIn extends React.Component<LevelSequenceBurnInProps> {
        nativePtr: UE.LevelSequenceBurnIn;
    }

    type EMenuPlacement = UE.EMenuPlacement;
    interface MenuAnchorProps extends ContentWidgetProps {
        children?: React.ReactNode;
        Placement?: EMenuPlacement;
        bFitInWindow?: boolean;
        ShouldDeferPaintingAfterWindowContent?: boolean;
        UseApplicationMenuStack?: boolean;
        OnMenuOpenChanged?: (bIsOpen: boolean) => void;
    }

    class MenuAnchor extends React.Component<MenuAnchorProps> {
        nativePtr: UE.MenuAnchor;
    }

    interface NamedSlotProps extends ContentWidgetProps {
        children?: React.ReactNode;
        bExposeOnInstanceOnly?: boolean;
        SlotGuid?: Guid;
    }

    class NamedSlot extends React.Component<NamedSlotProps> {
        nativePtr: UE.NamedSlot;
    }

    interface NativeWidgetHostProps extends WidgetProps {
    }

    class NativeWidgetHost extends React.Component<NativeWidgetHostProps> {
        nativePtr: UE.NativeWidgetHost;
    }

    interface ObjectMixerWidgetUserConfig {
    }

    interface ObjectMixerEditorUWidgetProps extends WidgetProps {
        ObjectMixerWidgetUserConfig?: ObjectMixerWidgetUserConfig;
    }

    class ObjectMixerEditorUWidget extends React.Component<ObjectMixerEditorUWidgetProps> {
        nativePtr: UE.ObjectMixerEditorUWidget;
    }

    interface OverlayProps extends PanelWidgetProps {
        children?: React.ReactNode;
    }

    class Overlay extends React.Component<OverlayProps> {
        nativePtr: UE.Overlay;
    }

    type ESlatePostRT = UE.ESlatePostRT;
    interface SlatePostBufferUpdateInfo {
        BufferToUpdate?: ESlatePostRT;
    }

    interface PostBufferUpdateProps extends WidgetProps {
        bPerformDefaultPostBufferUpdate?: boolean;
        BuffersToUpdate?: TArray<ESlatePostRT>;
        UpdateBufferInfos?: TArray<SlatePostBufferUpdateInfo>;
    }

    class PostBufferUpdate extends React.Component<PostBufferUpdateProps> {
        nativePtr: UE.PostBufferUpdate;
    }

    interface KeyHandleMap {
    }

    interface IndexedCurve {
        KeyHandlesToIndices?: KeyHandleMap;
    }

    type ERichCurveExtrapolation = UE.ERichCurveExtrapolation;
    interface RealCurve extends IndexedCurve {
        DefaultValue?: number;
        PreInfinityExtrap?: ERichCurveExtrapolation;
        PostInfinityExtrap?: ERichCurveExtrapolation;
    }

    type ERichCurveInterpMode = UE.ERichCurveInterpMode;
    type ERichCurveTangentMode = UE.ERichCurveTangentMode;
    type ERichCurveTangentWeightMode = UE.ERichCurveTangentWeightMode;
    interface RichCurveKey {
        InterpMode?: ERichCurveInterpMode;
        TangentMode?: ERichCurveTangentMode;
        TangentWeightMode?: ERichCurveTangentWeightMode;
        Time?: number;
        Value?: number;
        ArriveTangent?: number;
        ArriveTangentWeight?: number;
        LeaveTangent?: number;
        LeaveTangentWeight?: number;
    }

    interface RichCurve extends RealCurve {
        Keys?: TArray<RichCurveKey>;
    }

    interface RuntimeFloatCurve {
        EditorCurveData?: RichCurve;
    }

    interface RadialSliderProps extends WidgetProps {
        Value?: number;
        ValueDelegate?: () => number;
        bUseCustomDefaultValue?: boolean;
        CustomDefaultValue?: number;
        SliderRange?: RuntimeFloatCurve;
        ValueTags?: TArray<number>;
        SliderHandleStartAngle?: number;
        SliderHandleEndAngle?: number;
        AngularOffset?: number;
        HandStartEndRatio?: Vector2D;
        WidgetStyle?: SliderStyle;
        SliderBarColor?: LinearColor;
        SliderProgressColor?: LinearColor;
        SliderHandleColor?: LinearColor;
        CenterBackgroundColor?: LinearColor;
        Locked?: boolean;
        MouseUsesStep?: boolean;
        RequiresControllerLock?: boolean;
        StepSize?: number;
        IsFocusable?: boolean;
        UseVerticalDrag?: boolean;
        ShowSliderHandle?: boolean;
        ShowSliderHand?: boolean;
        OnMouseCaptureBegin?: () => void;
        OnMouseCaptureEnd?: () => void;
        OnControllerCaptureBegin?: () => void;
        OnControllerCaptureEnd?: () => void;
        OnValueChanged?: (Value: number) => void;
    }

    class RadialSlider extends React.Component<RadialSliderProps> {
        nativePtr: UE.RadialSlider;
    }

    interface ReactWidgetProps extends UserWidgetProps {
    }

    class ReactWidget extends React.Component<ReactWidgetProps> {
        nativePtr: UE.ReactWidget;
    }

    interface RetainerBoxProps extends ContentWidgetProps {
        children?: React.ReactNode;
        bRetainRender?: boolean;
        RenderOnInvalidation?: boolean;
        RenderOnPhase?: boolean;
        Phase?: number;
        PhaseCount?: number;
        TextureParameter?: string;
        bShowEffectsInDesigner?: boolean;
    }

    class RetainerBox extends React.Component<RetainerBoxProps> {
        nativePtr: UE.RetainerBox;
    }

    interface RichTextBlockProps extends TextLayoutWidgetProps {
        Text?: string;
        DefaultTextStyleOverride?: TextBlockStyle;
        MinDesiredWidth?: number;
        bOverrideDefaultStyle?: boolean;
        TextTransformPolicy?: ETextTransformPolicy;
        TextOverflowPolicy?: ETextOverflowPolicy;
        DefaultTextStyle?: TextBlockStyle;
    }

    class RichTextBlock extends React.Component<RichTextBlockProps> {
        nativePtr: UE.RichTextBlock;
    }

    interface SafeZoneProps extends ContentWidgetProps {
        children?: React.ReactNode;
        PadLeft?: boolean;
        PadRight?: boolean;
        PadTop?: boolean;
        PadBottom?: boolean;
    }

    class SafeZone extends React.Component<SafeZoneProps> {
        nativePtr: UE.SafeZone;
    }

    type EStretch = UE.EStretch;
    type EStretchDirection = UE.EStretchDirection;
    interface ScaleBoxProps extends ContentWidgetProps {
        children?: React.ReactNode;
        Stretch?: EStretch;
        StretchDirection?: EStretchDirection;
        UserSpecifiedScale?: number;
        IgnoreInheritedScale?: boolean;
    }

    class ScaleBox extends React.Component<ScaleBoxProps> {
        nativePtr: UE.ScaleBox;
    }

    interface SinglePropertyViewProps extends PropertyViewBaseProps {
        PropertyName?: string;
        NameOverride?: string;
    }

    class SinglePropertyView extends React.Component<SinglePropertyViewProps> {
        nativePtr: UE.SinglePropertyView;
    }

    interface SizeBoxProps extends ContentWidgetProps {
        children?: React.ReactNode;
        WidthOverride?: number;
        HeightOverride?: number;
        MinDesiredWidth?: number;
        MinDesiredHeight?: number;
        MaxDesiredWidth?: number;
        MaxDesiredHeight?: number;
        MinAspectRatio?: number;
        MaxAspectRatio?: number;
        bOverride_WidthOverride?: boolean;
        bOverride_HeightOverride?: boolean;
        bOverride_MinDesiredWidth?: boolean;
        bOverride_MinDesiredHeight?: boolean;
        bOverride_MaxDesiredWidth?: boolean;
        bOverride_MaxDesiredHeight?: boolean;
        bOverride_MinAspectRatio?: boolean;
        bOverride_MaxAspectRatio?: boolean;
    }

    class SizeBox extends React.Component<SizeBoxProps> {
        nativePtr: UE.SizeBox;
    }

    interface SpacerProps extends WidgetProps {
        Size?: Vector2D;
    }

    class Spacer extends React.Component<SpacerProps> {
        nativePtr: UE.Spacer;
    }

    interface StackBoxProps extends PanelWidgetProps {
        children?: React.ReactNode;
        Orientation?: EOrientation;
    }

    class StackBox extends React.Component<StackBoxProps> {
        nativePtr: UE.StackBox;
    }

    interface Synth2DSliderStyle extends SlateWidgetStyle {
        NormalThumbImage?: SlateBrush;
        DisabledThumbImage?: SlateBrush;
        NormalBarImage?: SlateBrush;
        DisabledBarImage?: SlateBrush;
        BackgroundImage?: SlateBrush;
        BarThickness?: number;
    }

    interface Synth2DSliderProps extends WidgetProps {
        ValueX?: number;
        ValueY?: number;
        ValueXDelegate?: () => number;
        ValueYDelegate?: () => number;
        WidgetStyle?: Synth2DSliderStyle;
        SliderHandleColor?: LinearColor;
        IndentHandle?: boolean;
        Locked?: boolean;
        StepSize?: number;
        IsFocusable?: boolean;
        OnMouseCaptureBegin?: () => void;
        OnMouseCaptureEnd?: () => void;
        OnControllerCaptureBegin?: () => void;
        OnControllerCaptureEnd?: () => void;
        OnValueChangedX?: (Value: number) => void;
        OnValueChangedY?: (Value: number) => void;
    }

    class Synth2DSlider extends React.Component<Synth2DSliderProps> {
        nativePtr: UE.Synth2DSlider;
    }

    type ESynthKnobSize = UE.ESynthKnobSize;
    interface SynthKnobStyle extends SlateWidgetStyle {
        LargeKnob?: SlateBrush;
        LargeKnobOverlay?: SlateBrush;
        MediumKnob?: SlateBrush;
        MediumKnobOverlay?: SlateBrush;
        MinValueAngle?: number;
        MaxValueAngle?: number;
        KnobSize?: ESynthKnobSize;
    }

    interface SynthKnobProps extends WidgetProps {
        Value?: number;
        StepSize?: number;
        MouseSpeed?: number;
        MouseFineTuneSpeed?: number;
        ShowTooltipInfo?: boolean;
        ParameterName?: string;
        ParameterUnits?: string;
        ValueDelegate?: () => number;
        WidgetStyle?: SynthKnobStyle;
        Locked?: boolean;
        IsFocusable?: boolean;
        OnMouseCaptureBegin?: () => void;
        OnMouseCaptureEnd?: () => void;
        OnControllerCaptureBegin?: () => void;
        OnControllerCaptureEnd?: () => void;
        OnValueChanged?: (Value: number) => void;
    }

    class SynthKnob extends React.Component<SynthKnobProps> {
        nativePtr: UE.SynthKnob;
    }

    interface TakeRecorderOverlayWidgetProps extends UserWidgetProps {
    }

    class TakeRecorderOverlayWidget extends React.Component<TakeRecorderOverlayWidgetProps> {
        nativePtr: UE.TakeRecorderOverlayWidget;
    }

    interface TextBlockProps extends TextLayoutWidgetProps {
        Text?: string;
        TextDelegate?: () => string;
        ColorAndOpacity?: SlateColor;
        ColorAndOpacityDelegate?: () => SlateColor;
        MinDesiredWidth?: number;
        Font?: SlateFontInfo;
        StrikeBrush?: SlateBrush;
        ShadowOffset?: Vector2D;
        ShadowColorAndOpacity?: LinearColor;
        ShadowColorAndOpacityDelegate?: () => LinearColor;
        bWrapWithInvalidationPanel?: boolean;
        TextTransformPolicy?: ETextTransformPolicy;
        TextOverflowPolicy?: ETextOverflowPolicy;
        bSimpleTextMode?: boolean;
    }

    class TextBlock extends React.Component<TextBlockProps> {
        nativePtr: UE.TextBlock;
    }

    type EListItemAlignment = UE.EListItemAlignment;
    interface TileViewProps extends ListViewProps {
        EntryHeight?: number;
        EntryWidth?: number;
        TileAlignment?: EListItemAlignment;
        bWrapHorizontalNavigation?: boolean;
        ScrollbarDisabledVisibility?: ESlateVisibility;
        bEntrySizeIncludesEntrySpacing?: boolean;
    }

    class TileView extends React.Component<TileViewProps> {
        nativePtr: UE.TileView;
    }

    type EMultiBoxType = UE.EMultiBoxType;
    interface ToolMenuWidgetProps extends WidgetProps {
        MenuName?: string;
        MenuType?: EMultiBoxType;
        FullMenuName?: string;
    }

    class ToolMenuWidget extends React.Component<ToolMenuWidgetProps> {
        nativePtr: UE.ToolMenuWidget;
    }

    interface UMGRootProps extends UserWidgetProps {
        OnUMGKeyDown?: (Key: string) => void;
        OnUMGKeyUp?: (Key: string) => void;
        OnUMGTick?: (DeltaTime: number) => void;
        OnUMGFocusGet?: () => void;
        OnUMGFocusLost?: () => void;
    }

    class UMGRoot extends React.Component<UMGRootProps> {
        nativePtr: UE.UMGRoot;
    }

    interface UniformGridPanelProps extends PanelWidgetProps {
        children?: React.ReactNode;
        SlotPadding?: Margin;
        MinDesiredSlotWidth?: number;
        MinDesiredSlotHeight?: number;
    }

    class UniformGridPanel extends React.Component<UniformGridPanelProps> {
        nativePtr: UE.UniformGridPanel;
    }

    interface VerticalBoxProps extends PanelWidgetProps {
        children?: React.ReactNode;
    }

    class VerticalBox extends React.Component<VerticalBoxProps> {
        nativePtr: UE.VerticalBox;
    }

    interface ViewportProps extends ContentWidgetProps {
        children?: React.ReactNode;
        BackgroundColor?: LinearColor;
    }

    class Viewport extends React.Component<ViewportProps> {
        nativePtr: UE.Viewport;
    }

    interface VREditorBaseUserWidgetProps extends UserWidgetProps {
    }

    class VREditorBaseUserWidget extends React.Component<VREditorBaseUserWidgetProps> {
        nativePtr: UE.VREditorBaseUserWidget;
    }

    interface PointerToUberGraphFrame {
    }

    interface W_Main_CProps extends EditorUtilityWidgetProps {
        UberGraphFrame?: PointerToUberGraphFrame;
    }

    class W_Main_C extends React.Component<W_Main_CProps> {
        nativePtr: UE.Game.Editor.W_Main.W_Main_C;
    }

    interface WidgetSwitcherProps extends PanelWidgetProps {
        children?: React.ReactNode;
        ActiveWidgetIndex?: number;
    }

    class WidgetSwitcher extends React.Component<WidgetSwitcherProps> {
        nativePtr: UE.WidgetSwitcher;
    }

    interface WindowTitleBarAreaProps extends ContentWidgetProps {
        children?: React.ReactNode;
        bWindowButtonsEnabled?: boolean;
        bDoubleClickTogglesFullscreen?: boolean;
    }

    class WindowTitleBarArea extends React.Component<WindowTitleBarAreaProps> {
        nativePtr: UE.WindowTitleBarArea;
    }

    interface WrapBoxProps extends PanelWidgetProps {
        children?: React.ReactNode;
        InnerSlotPadding?: Vector2D;
        WrapSize?: number;
        bExplicitWrapSize?: boolean;
        HorizontalAlignment?: EHorizontalAlignment;
        Orientation?: EOrientation;
    }

    class WrapBox extends React.Component<WrapBoxProps> {
        nativePtr: UE.WrapBox;
    }


    interface Root {
        removeFromViewport() : void;
        getWidget(): any;
    }

    interface TReactUMG {
        render(element: React.ReactElement) : Root;
        init(world: any) : void;
    }

    var ReactUMG : TReactUMG;
}    
    