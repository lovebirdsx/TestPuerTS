// Fill out your copyright notice in the Description page of Project Settings.

#include "MainObject.h"

UMainObject::UMainObject()
{
    V = { 1, 2, 4 };

    SomeData.Alignment = { 8, 16 };

    SomeData.DoNoSerialize = 99;
    SomeData.WillSerialize = 88;
    MyArray.Add(1024);
    MyArray.Add(777);

    MySet.Add(TEXT("John"));
    MySet.Add(TEXT("Hello"));

    MyMap.Add(TEXT("John"), 1);
    MyMap.Add(TEXT("Hello"), 2);

    for (int i = 0; i < 100; ++i)
    {
        MyFixSizeArray[i] = 99 - i;
    }

    ArrayBuffer.Length = 10;
    ArrayBuffer.Data = ::malloc(10);

    int8 * Data = static_cast<int8 *>(ArrayBuffer.Data);

    for (int i = 0; i < ArrayBuffer.Length; i++)
    {
        Data[i] = 2 * (i + 1);
    }    
}

int32 UMainObject::Add(int32 a, int32 b) const
{
    //UE_LOG(LogTemp, Warning, TEXT("UMyObject::Add(%d, %d)"), a, b);
    return a + b;
}

FString UMainObject::Foo() const
{
    return TEXT("UMyObject::Foo");
}


FString UMainObject::Bar(FVector VV) const
{
    FString Result = FString::Printf(TEXT("UMyObject::Bar(%s)"), *VV.ToString());    
    return Result;
}

FString UMainObject::Bar2(FVector& VV) const
{
    FString Result = FString::Printf(TEXT("UMyObject::Bar2(%s)"), *VV.ToString());    
    VV.X = 1024;
    return Result;
}

FVector UMainObject::Bar3(FVector& VV) const
{    
    VV.X = 1024;
    return VV + 1;
}

TArray<uint8> UMainObject::GetData()
{
    TArray<uint8> ret;
    ret.Add(1);
    ret.Add(3);
    return ret;
}

TArray<FString> UMainObject::GetStrings()
{
    TArray<FString> ret;
    ret.Add(TEXT("Hello"));
    ret.Add(TEXT("World"));
    return ret;
}

TArray<int32> UMainObject::GetInts()
{
    TArray<int32> ret;
    ret.Add(1);
    ret.Add(4);
    return ret;
}

void UMainObject::EnumTest(EToTest E)
{
    
}

void UMainObject::NameTest(FName Name)
{
    
}

FString UMainObject::DefaultTest(FString Str, int I, FVector Vec)
{
    return FString::Printf(TEXT("Str: %s, I: %d, Vec: %s"), *Str, I, *Vec.ToString());
}

FArrayBuffer UMainObject::ArrayBufferTest(const FArrayBuffer& Ab) const
{    
    if (Ab.Length > 0)
    {
        return FArrayBuffer{ static_cast<char*>(Ab.Data) + 1, Ab.Length - 1};
    }
    else
    {
        return Ab;
    }
}

void  UMainObject::PrintState() const
{
    
}

void UMainObject::PassJsFunctionAsDelegate(FCallback Callback) const
{
    Callback.Execute(TEXT("John"));
    Callback.Execute(TEXT("Che"));
}

int32 UMainObject::Mult_Implementation(int32 a, int32 b) const
{	
	return a + b;
}

UMainObject::~UMainObject()
{
    ::free(ArrayBuffer.Data);
}
