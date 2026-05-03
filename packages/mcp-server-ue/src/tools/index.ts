/**
 * 内置 tool 集中注册入口。新增 tool 时在这里追加 register。
 */
import type { McpServer } from '@modelcontextprotocol/sdk/dist/cjs/server/mcp';
import { registerEchoTool } from './echo';
import { registerGetProjectInfoTool } from './getProjectInfo';
import { registerListAssetsTool } from './listAssets';

export function registerBuiltinTools(server: McpServer): void {
	registerEchoTool(server);
	registerGetProjectInfoTool(server);
	registerListAssetsTool(server);
}
