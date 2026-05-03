import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/dist/cjs/server/mcp';

export function registerEchoTool(server: McpServer): void {
	server.registerTool(
		'echo',
		{
			description: 'Returns the input message unchanged. Useful for verifying the MCP pipe end-to-end.',
			inputSchema: {
				message: z.string().describe('Message to echo back.'),
			},
		},
		({ message }) => ({
			content: [{ type: 'text', text: message }],
		}),
	);
}
