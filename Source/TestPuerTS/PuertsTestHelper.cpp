#include "PuertsTestHelper.h"

bool UPuertsTestHelper::bTestDone = false;
int32 UPuertsTestHelper::TestExitCode = 0;

void UPuertsTestHelper::MarkTestDone(int32 ExitCode)
{
	bTestDone = true;
	TestExitCode = ExitCode;
	UE_LOG(LogTemp, Display, TEXT("PuertsTestHelper: MarkTestDone called with ExitCode=%d"), ExitCode);
}

void UPuertsTestHelper::Reset()
{
	bTestDone = false;
	TestExitCode = 0;
}
