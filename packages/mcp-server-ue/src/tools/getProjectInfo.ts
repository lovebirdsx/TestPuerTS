import * as UE from 'ue';
import type { McpServer } from '@modelcontextprotocol/sdk/dist/cjs/server/mcp';

export function registerGetProjectInfoTool(server: McpServer): void {
	server.registerTool(
		'get_project_info',
		{
			description: 'Returns basic information about the active UE project (name, directory, engine version).',
		},
		() => {
			const projectDir = UE.JsRunHelper.GetProjectDir();
			const info = {
				projectDir,
				engineVersion: 'UE5',
			};
			return {
				content: [{ type: 'text', text: JSON.stringify(info, null, 2) }],
			};
		},
	);
}
