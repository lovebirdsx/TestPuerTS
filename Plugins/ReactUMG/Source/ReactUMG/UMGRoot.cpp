#include "UMGRoot.h"
#include "Blueprint/WidgetTree.h"

UUMGRoot::UUMGRoot(const FObjectInitializer& ObjectInitializer) : Super(ObjectInitializer)
{
	WidgetTree = CreateDefaultSubobject<UWidgetTree>(TEXT("WidgetTree"));
	WidgetTree->SetFlags(RF_Transactional);
}

UUMGRoot* UUMGRoot::CreateUmgRoot(UWorld* World)
{
	return ::CreateWidget<UUMGRoot>(World);
}

UPanelSlot* UUMGRoot::AddChild(UWidget* Content)
{
	if (Content == nullptr)
	{
		return nullptr;
	}

	if (RootSlot)
	{
		return nullptr;
	}

	Content->RemoveFromParent();

	EObjectFlags NewObjectFlags = RF_Transactional;
	if (HasAnyFlags(RF_Transient))
	{
		NewObjectFlags |= RF_Transient;
	}

	UPanelSlot* PanelSlot = NewObject<UPanelSlot>(this, UPanelSlot::StaticClass(), NAME_None, NewObjectFlags);
	PanelSlot->Content = Content;

	Content->Slot = PanelSlot;

	RootSlot = PanelSlot;

	WidgetTree->RootWidget = Content;

	InvalidateLayoutAndVolatility();

	return PanelSlot;
}

bool UUMGRoot::RemoveChild(UWidget* Content)
{
	if (Content == nullptr || RootSlot == nullptr || Content != RootSlot->Content)
	{
		return false;
	}
	UPanelSlot* PanelSlot = RootSlot;
	RootSlot = nullptr;

	if (PanelSlot->Content)
	{
		PanelSlot->Content->Slot = nullptr;
	}

	const bool bReleaseChildren = true;
	PanelSlot->ReleaseSlateResources(bReleaseChildren);
	PanelSlot->Parent = nullptr;
	PanelSlot->Content = nullptr;

	WidgetTree->RootWidget = nullptr;

	InvalidateLayoutAndVolatility();

	return true;
}

FReply UUMGRoot::NativeOnKeyDown(const FGeometry& InGeometry, const FKeyEvent& InKeyEvent)
{
	OnUMGKeyDown.Broadcast(InKeyEvent.GetKey().ToString());
	return FReply::Handled();
}

FReply UUMGRoot::NativeOnKeyUp(const FGeometry& InGeometry, const FKeyEvent& InKeyEvent)
{
	OnUMGKeyUp.Broadcast(InKeyEvent.GetKey().ToString());
	return FReply::Handled();
}

void UUMGRoot::NativeTick(const FGeometry& MyGeometry, float InDeltaTime)
{
	OnUMGTick.Broadcast(InDeltaTime);
}

FReply UUMGRoot::NativeOnFocusReceived(const FGeometry& InGeometry, const FFocusEvent& InFocusEvent)
{
	OnUMGFocusGet.Broadcast();
	return FReply::Handled();
}

void UUMGRoot::NativeOnFocusLost(const FFocusEvent& InFocusEvent)
{
	OnUMGFocusLost.Broadcast();	
}

