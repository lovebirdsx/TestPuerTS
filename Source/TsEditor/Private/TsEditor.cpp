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
		UE_LOG(LogTsEditor, Log, TEXT("%s"), *Message);		
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
	TryStart();
}

bool UTsEditor::TryStart()
{
	if (IsRunning())
	{
		UE_LOG(LogTsEditor, Error, TEXT("Can not run ts editor again while is already running"));
		return false;
	}

	SetState(ETsEditorState::Starting);
	LastStartError.Empty();

	JsEnv = MakeShared<puerts::FJsEnv>(std::make_unique<puerts::DefaultJSModuleLoader>(TEXT("JavaScript")), std::make_shared<FLoggerForJs>(this), DebugPort);

	if (bWaitJSDebug)
	{
		JsEnv->WaitDebugger();
	}

	const TArray<TPair<FString, UObject*>> Arguments;
	if (!JsEnv->Start(ModuleName, Arguments))
	{
		if (LastStartError.IsEmpty())
		{
			LastStartError = FString::Printf(TEXT("Failed to start TsEditor module: %s"), *ModuleName);
		}
		UE_LOG(LogTsEditor, Error, TEXT("%s"), *LastStartError);
		JsEnv.Reset();
		SetState(ETsEditorState::Failed);
		OnStartFailed.Broadcast(LastStartError);
		return false;
	}

	SetState(ETsEditorState::Running);
	OnStarted.Broadcast();
	return true;
}

void UTsEditor::Stop()
{
	if (JsEnv.IsValid())
	{
		OnStopped.Broadcast();
		if (FModuleManager::Get().IsModuleLoaded("TsEditor"))
		{
			FModuleManager::GetModuleChecked<FTsEditorModule>("TsEditor").UnregisterMenuEntriesByOwner(TEXT("TsEditorJS"));
		}
		JsEnv.Reset();
	}
	SetState(ETsEditorState::Stopped);
}

void UTsEditor::Restart()
{
	if (bIsRestarting)
		return;

	bIsRestarting = true;
	SetState(ETsEditorState::Restarting);


	// 通过延时来执行,防止在ts中释放虚拟机造成报错
	FTimerHandle UnusedHandle;
	GEditor->GetTimerManager()->SetTimer(UnusedHandle, [this]()
	{
		Stop();
		TryStart();
		bIsRestarting = false;
	}, 0.1, false);
}

bool UTsEditor::IsRunning()
{
	return State == ETsEditorState::Running && JsEnv.IsValid();
}

FString UTsEditor::CurrentStackTrace()
{	
	return JsEnv.IsValid() ? JsEnv.Get()->CurrentStackTrace() : FString();
}

FString UTsEditor::GetLastStartError() const
{
	return LastStartError;
}

ETsEditorState UTsEditor::GetState() const
{
	return State;
}

void UTsEditor::FireLogErrorEvent(const FString& Message)
{
	if (State == ETsEditorState::Starting || State == ETsEditorState::Failed)
	{
		LastStartError = Message;
	}
	OnLogError.Broadcast(Message);
}

void UTsEditor::SetState(ETsEditorState InState)
{
	State = InState;
}
