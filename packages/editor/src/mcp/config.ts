/**
 * 项目根 `mcp-servers.json` 配置的 zod schema 与加载逻辑。
 *
 * 文件位置：`<ProjectDir>/mcp-servers.json`（git 入库友好）。
 *
 * 示例：
 * ```json
 * {
 *   "enabled": true,
 *   "builtin": { "ueEditor": { "enabled": true } },
 *   "external": {
 *     "filesystem": {
 *       "command": "npx",
 *       "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
 *     }
 *   }
 * }
 * ```
 */
import { z } from 'zod';
import type { IFileIO } from '@universe-agent/editor-common';
import { ueFileIO } from '@universe-agent/editor-common';

export const McpServersConfigSchema = z
	.object({
		enabled: z.boolean().default(true),
		builtin: z
			.object({
				ueEditor: z
					.object({
						enabled: z.boolean().default(true),
					})
					.default({ enabled: true }),
			})
			.default({ ueEditor: { enabled: true } }),
		external: z
			.record(
				z.string(),
				z.object({
					command: z.string(),
					args: z.array(z.string()).optional(),
					env: z.record(z.string(), z.string()).optional(),
					cwd: z.string().optional(),
				}),
			)
			.default({}),
	})
	.default({
		enabled: true,
		builtin: { ueEditor: { enabled: true } },
		external: {},
	});

export type McpServersConfig = z.infer<typeof McpServersConfigSchema>;

export const DEFAULT_MCP_CONFIG: McpServersConfig = McpServersConfigSchema.parse({});

/** 解析并校验 JSON 文本；失败返回默认配置并记录原因。 */
export function parseMcpServersConfig(json: string): { config: McpServersConfig; warning?: string } {
	try {
		const raw = JSON.parse(json);
		const result = McpServersConfigSchema.safeParse(raw);
		if (!result.success) {
			return {
				config: DEFAULT_MCP_CONFIG,
				warning: `mcp-servers.json schema invalid: ${result.error.message}`,
			};
		}
		return { config: result.data };
	} catch (err) {
		return {
			config: DEFAULT_MCP_CONFIG,
			warning: `mcp-servers.json parse error: ${err instanceof Error ? err.message : String(err)}`,
		};
	}
}

/** 从项目根读取 mcp-servers.json，缺失视为默认配置（不报错）。 */
export async function loadMcpServersConfig(
	configPath: string,
	io: IFileIO = ueFileIO,
): Promise<{ config: McpServersConfig; warning?: string }> {
	const text = await io.readText(configPath);
	if (text === undefined) {
		return { config: DEFAULT_MCP_CONFIG };
	}
	return parseMcpServersConfig(text);
}
