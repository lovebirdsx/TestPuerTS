/**
 * acp-connections.json 的 zod schema 与加载逻辑。
 *
 * 文件位置：`<ProjectDir>./config/acp-connections.json`（git 入库友好）。
 *
 * 示例：
 * ```json
 * {
 *   "connections": [
 *     {
 *       "id": "claude",
 *       "label": "Claude Agent",
 *       "command": "npx claude-agent-acp",
 *       "workspace": "",
 *       "extraArgs": ""
 *     }
 *   ]
 * }
 * ```
 */
import type { IFileIO } from '@universe-agent/editor-common';
import { ueFileIO } from '@universe-agent/editor-common';
import { z } from 'zod';

export const ConnectionProfileSchema = z.object({
	id: z.string().min(1),
	label: z.string().min(1),
	command: z.string(),
	workspace: z.string().default(''),
	extraArgs: z.string().default(''),
});

const ConnectionsConfigSchema = z.object({
	connections: z.array(ConnectionProfileSchema).default([]),
});

export type ConnectionProfile = z.infer<typeof ConnectionProfileSchema>;

const EMPTY: { connections: ConnectionProfile[] } = { connections: [] };

export function parseConnectionsConfig(json: string): {
	config: { connections: ConnectionProfile[] };
	warning?: string;
} {
	try {
		const raw = JSON.parse(json) as unknown;
		const result = ConnectionsConfigSchema.safeParse(raw);
		if (!result.success) {
			return {
				config: EMPTY,
				warning: `acp-connections.json schema invalid: ${result.error.message}`,
			};
		}
		return { config: result.data };
	} catch (err) {
		return {
			config: EMPTY,
			warning: `acp-connections.json parse error: ${err instanceof Error ? err.message : String(err)}`,
		};
	}
}

export async function loadConnectionsConfig(
	configPath: string,
	io: IFileIO = ueFileIO,
): Promise<{ config: { connections: ConnectionProfile[] }; warning?: string }> {
	const text = await io.readText(configPath);
	if (text === undefined) return { config: EMPTY };
	return parseConnectionsConfig(text);
}
