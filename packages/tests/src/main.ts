import * as UE from 'ue';

console.log('=== PuerTS Commandlet Test Runner ===');
console.log('可用的测试模块:');
console.log('  -module=tests/rpcClientMain  → PuerTS 作为 Client，Node.js 作为 Server');
console.log('  -module=tests/rpcServerMain  → PuerTS 作为 Server，Node.js 作为 Client');

UE.PuertsTestHelper.MarkTestDone(0);
