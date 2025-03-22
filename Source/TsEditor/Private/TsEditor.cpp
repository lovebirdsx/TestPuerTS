#include "TsEditor.h"
#include "TsEditorModule.h"

class FLoggerForJs : public puerts::ILogger
{
public:
	explicit FLoggerForJs(UTsEditor *TsEditor): TsEditor(TsEditor)
	{
	}
	
	virtual ~FLoggerForJs()
	{
	}

	virtual void Log(const FString& Message) const override
	{
		UE_LOG(LogTsEditor, Display, TEXT("%s"), *Message);
	}

	virtual void Info(const FString& Message) const override
	{
		UE_LOG(LogTsEditor, Display, TEXT("%s"), *Message);
	}

	virtual void Warn(const FString& Message) const override
	{
		UE_LOG(LogTsEditor, Warning, TEXT("%s"), *Message);
	}

	virtual void Error(const FString& Message) const override
	{
		UE_LOG(LogTsEditor, Error, TEXT("%s"), *Message);
		if (TsEditor)
		{
			TsEditor->FireLogErrorEvent(Message);
		}
	}

private:
	UTsEditor *TsEditor;
};

UTsEditor::UTsEditor() : bWaitJSDebug(false), ModuleName(TEXT("editor/main")), DebugPort(8888)
{
}

void UTsEditor::Start()
{
	if (IsRunning())
	{
		UE_LOG(LogTsEditor, Error, TEXT("Can not run ts editor again while is already running"));
		return;
	}	
	
	JsEnv = MakeShared<puerts::FJsEnv>(std::make_unique<puerts::DefaultJSModuleLoader>(TEXT("JavaScript")), std::make_shared<FLoggerForJs>(this), DebugPort);

	if (bWaitJSDebug)
	{
		JsEnv->WaitDebugger();
	}

	const TArray<TPair<FString, UObject*>> Arguments;
	JsEnv->Start(ModuleName, Arguments);

	OnStarted.Broadcast();
}

void UTsEditor::Stop()
{
	if (JsEnv.IsValid())
	{
		OnStopped.Broadcast();
		JsEnv.Reset();
	}	
}

void UTsEditor::Restart()
{
	if (bIsRestarting)
		return;
	
	bIsRestarting = true;

	
	// 通过延时来执行,防止在ts中释放虚拟机造成报错
	FTimerHandle UnusedHandle;
	GEditor->GetTimerManager()->SetTimer(UnusedHandle, [this]()
	{
		Stop();
		Start();
		bIsRestarting = false;
	}, 0.1, false);
}

bool UTsEditor::IsRunning()
{
	return JsEnv.IsValid();
}

FString UTsEditor::CurrentStackTrace()
{	
	return JsEnv.IsValid() ? JsEnv.Get()->CurrentStackTrace() : FString();
}

void UTsEditor::FireLogErrorEvent(const FString& Message)
{
	OnLogError.Broadcast(Message);
}
