#include "ProcessIOHelper.h"
#include "HAL/PlatformProcess.h"
#include "Misc/FileHelper.h"
#include "Misc/Paths.h"
#include "Async/Async.h"

#include "Windows/AllowWindowsPlatformTypes.h"
#include <io.h>
#include <fcntl.h>

TArray<uint8> UProcessIOHelper::StdinBuffer;

bool UProcessIOHelper::HasStdinInput()
{
	HANDLE hStdin = GetStdHandle(STD_INPUT_HANDLE);
	if (hStdin == INVALID_HANDLE_VALUE)
	{
		return false;
	}

	// 判断是管道还是控制台
	DWORD FileType = GetFileType(hStdin);
	if (FileType == FILE_TYPE_CHAR)
	{
		// 控制台模式
		DWORD NumEvents = 0;
		if (!GetNumberOfConsoleInputEvents(hStdin, &NumEvents))
		{
			return false;
		}
		if (NumEvents == 0)
		{
			return false;
		}

		// 检查是否有按键事件
		TArray<INPUT_RECORD> Records;
		Records.SetNum(NumEvents);
		DWORD NumRead = 0;
		PeekConsoleInputW(hStdin, Records.GetData(), NumEvents, &NumRead);
		for (DWORD i = 0; i < NumRead; i++)
		{
			if (Records[i].EventType == KEY_EVENT && Records[i].Event.KeyEvent.bKeyDown)
			{
				return true;
			}
		}
		return false;
	}
	else
	{
		// 管道/文件模式
		DWORD BytesAvailable = 0;
		if (PeekNamedPipe(hStdin, nullptr, 0, nullptr, &BytesAvailable, nullptr))
		{
			return BytesAvailable > 0;
		}
		// 如果不是管道（比如重定向的文件），也认为有输入
		return true;
	}
}

FString UProcessIOHelper::ReadStdinLine()
{
	HANDLE hStdin = GetStdHandle(STD_INPUT_HANDLE);
	if (hStdin == INVALID_HANDLE_VALUE)
	{
		return FString();
	}

	// 检查缓冲区中是否已有完整行
	for (int32 i = 0; i < StdinBuffer.Num(); i++)
	{
		if (StdinBuffer[i] == '\n')
		{
			// 提取这一行（不包含 \n）
			int32 LineEnd = i;
			if (LineEnd > 0 && StdinBuffer[LineEnd - 1] == '\r')
			{
				LineEnd--;
			}

			FString Line = FString(LineEnd, UTF8_TO_TCHAR(reinterpret_cast<const char*>(StdinBuffer.GetData())));

			// 从缓冲区移除已读取的数据
			StdinBuffer.RemoveAt(0, i + 1);
			return Line;
		}
	}

	// 尝试读取更多数据
	DWORD FileType = GetFileType(hStdin);
	if (FileType == FILE_TYPE_CHAR)
	{
		// 控制台模式：逐字符读取
		DWORD NumEvents = 0;
		if (!GetNumberOfConsoleInputEvents(hStdin, &NumEvents) || NumEvents == 0)
		{
			return FString();
		}

		TArray<INPUT_RECORD> Records;
		Records.SetNum(NumEvents);
		DWORD NumRead = 0;
		ReadConsoleInputW(hStdin, Records.GetData(), NumEvents, &NumRead);

		for (DWORD i = 0; i < NumRead; i++)
		{
			if (Records[i].EventType == KEY_EVENT && Records[i].Event.KeyEvent.bKeyDown)
			{
				WCHAR Ch = Records[i].Event.KeyEvent.uChar.UnicodeChar;
				if (Ch == 0)
				{
					continue; // 功能键等
				}

				if (Ch == '\r' || Ch == '\n')
				{
					// 回车：输出换行并返回缓冲区内容
					WriteStdout(TEXT("\n"));
					FString Line = FString(StdinBuffer.Num(),
						UTF8_TO_TCHAR(reinterpret_cast<const char*>(StdinBuffer.GetData())));
					StdinBuffer.Empty();
					return Line;
				}
				else if (Ch == '\b' || Ch == 127)
				{
					// 退格
					if (StdinBuffer.Num() > 0)
					{
						StdinBuffer.RemoveAt(StdinBuffer.Num() - 1);
						WriteStdout(TEXT("\b \b"));
					}
				}
				else
				{
					// 普通字符
					FTCHARToUTF8 Utf8(&Ch, 1);
					StdinBuffer.Append(reinterpret_cast<const uint8*>(Utf8.Get()), Utf8.Length());

					// 回显
					TCHAR EchoBuf[2] = { static_cast<TCHAR>(Ch), 0 };
					WriteStdout(EchoBuf);
				}
			}
		}
	}
	else
	{
		// 管道/文件模式
		DWORD BytesAvailable = 0;
		bool bHasData = false;

		if (PeekNamedPipe(hStdin, nullptr, 0, nullptr, &BytesAvailable, nullptr))
		{
			bHasData = BytesAvailable > 0;
		}
		else
		{
			// 非管道（文件重定向），尝试读取
			bHasData = true;
		}

		if (bHasData)
		{
			uint8 TempBuf[4096];
			DWORD BytesRead = 0;
			DWORD ToRead = BytesAvailable > 0 ? FMath::Min(BytesAvailable, (DWORD)sizeof(TempBuf)) : 1;

			if (ReadFile(hStdin, TempBuf, ToRead, &BytesRead, nullptr) && BytesRead > 0)
			{
				StdinBuffer.Append(TempBuf, BytesRead);
			}
		}
	}

	// 再次检查是否有完整行
	for (int32 i = 0; i < StdinBuffer.Num(); i++)
	{
		if (StdinBuffer[i] == '\n')
		{
			int32 LineEnd = i;
			if (LineEnd > 0 && StdinBuffer[LineEnd - 1] == '\r')
			{
				LineEnd--;
			}

			FString Line = FString(LineEnd, UTF8_TO_TCHAR(reinterpret_cast<const char*>(StdinBuffer.GetData())));
			StdinBuffer.RemoveAt(0, i + 1);
			return Line;
		}
	}

	return FString();
}

void UProcessIOHelper::WriteStdout(const FString& Text)
{
	HANDLE hStdout = GetStdHandle(STD_OUTPUT_HANDLE);
	if (hStdout == INVALID_HANDLE_VALUE)
	{
		return;
	}

	FTCHARToUTF8 Utf8(*Text, Text.Len());
	DWORD BytesWritten = 0;
	WriteFile(hStdout, Utf8.Get(), Utf8.Length(), &BytesWritten, nullptr);
}

void UProcessIOHelper::WriteStderr(const FString& Text)
{
	HANDLE hStderr = GetStdHandle(STD_ERROR_HANDLE);
	if (hStderr == INVALID_HANDLE_VALUE)
	{
		return;
	}

	FTCHARToUTF8 Utf8(*Text, Text.Len());
	DWORD BytesWritten = 0;
	WriteFile(hStderr, Utf8.Get(), Utf8.Length(), &BytesWritten, nullptr);
}

void UAsyncFileResult::StartPolling()
{
	TickerHandle = FTSTicker::GetCoreTicker().AddTicker(
		FTickerDelegate::CreateLambda([this](float) -> bool
		{
			if (bCompleted.Load())
			{
				bDone = true;
				OnComplete.Broadcast();
				RemoveFromRoot();
				return false;
			}
			return true;
		}),
		0.01f
	);
}

UAsyncFileResult* UProcessIOHelper::ReadTextFile(const FString& FilePath)
{
	UAsyncFileResult* Result = NewObject<UAsyncFileResult>();
	Result->AddToRoot();

	FString PathCopy = FilePath;
	Async(EAsyncExecution::ThreadPool, [Result, PathCopy]()
	{
		FString Content;
		bool bOk = FFileHelper::LoadFileToString(Content, *PathCopy);
		Result->Content = MoveTemp(Content);
		Result->bSuccess = bOk;
		Result->bCompleted.Store(true);
	});

	Result->StartPolling();
	return Result;
}

UAsyncFileResult* UProcessIOHelper::FileExists(const FString& FilePath)
{
	UAsyncFileResult* Result = NewObject<UAsyncFileResult>();
	Result->AddToRoot();

	FString PathCopy = FilePath;
	Async(EAsyncExecution::ThreadPool, [Result, PathCopy]()
	{
		Result->bSuccess = FPaths::FileExists(PathCopy);
		Result->bCompleted.Store(true);
	});

	Result->StartPolling();
	return Result;
}

UAsyncFileResult* UProcessIOHelper::WriteTextFile(const FString& FilePath, const FString& Content)
{
	UAsyncFileResult* Result = NewObject<UAsyncFileResult>();
	Result->AddToRoot();

	FString PathCopy = FilePath;
	FString ContentCopy = Content;
	Async(EAsyncExecution::ThreadPool, [Result, PathCopy, ContentCopy]()
	{
		FString Dir = FPaths::GetPath(PathCopy);
		if (!Dir.IsEmpty())
		{
			IPlatformFile& PlatformFile = FPlatformFileManager::Get().GetPlatformFile();
			PlatformFile.CreateDirectoryTree(*Dir);
		}
		Result->bSuccess = FFileHelper::SaveStringToFile(ContentCopy, *PathCopy, FFileHelper::EEncodingOptions::ForceUTF8WithoutBOM);
		Result->bCompleted.Store(true);
	});

	Result->StartPolling();
	return Result;
}

UAsyncFileResult* UProcessIOHelper::MakeDirTree(const FString& Path)
{
	UAsyncFileResult* Result = NewObject<UAsyncFileResult>();
	Result->AddToRoot();

	FString PathCopy = Path;
	Async(EAsyncExecution::ThreadPool, [Result, PathCopy]()
	{
		IPlatformFile& PlatformFile = FPlatformFileManager::Get().GetPlatformFile();
		Result->bSuccess = PlatformFile.CreateDirectoryTree(*PathCopy);
		Result->bCompleted.Store(true);
	});

	Result->StartPolling();
	return Result;
}

bool UProcessIOHelper::IsStdinTTY()
{
	HANDLE hStdin = GetStdHandle(STD_INPUT_HANDLE);
	if (hStdin == INVALID_HANDLE_VALUE)
	{
		return false;
	}

	return GetFileType(hStdin) == FILE_TYPE_CHAR;
}

FString UProcessIOHelper::GetEnvVar(const FString& Name)
{
	return FPlatformMisc::GetEnvironmentVariable(*Name);
}

#include "Windows/HideWindowsPlatformTypes.h"
