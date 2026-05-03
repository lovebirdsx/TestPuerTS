/**
 * 内置 tool：list_assets —— 列出指定 Content 路径下的 UE Asset。
 *
 * 通过 `UE.EditorAssetSubsystem.GetEditorSubsystem(...).ListAssets()` 调用。
 * 必须在 editor 运行时（非 commandlet）调用，否则 Subsystem 不可用。
 */
import * as UE from 'ue';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/dist/cjs/server/mcp';

function getEditorAssetSubsystem(): UE.EditorAssetSubsystem | undefined {
	try {
		const klass = UE.EditorAssetSubsystem.StaticClass();
		const subsystem = UE.EditorSubsystemBlueprintLibrary.GetEditorSubsystem(klass);
		return subsystem as unknown as UE.EditorAssetSubsystem;
	} catch {
		return undefined;
	}
}

export function registerListAssetsTool(server: McpServer): void {
	server.registerTool(
		'list_assets',
		{
			description:
				'List UE assets under a Content Browser path, e.g. "/Game/Maps". Requires the UE editor to be running (not in commandlet mode).',
			inputSchema: {
				path: z.string().optional().describe('Content path. Defaults to "/Game".'),
				recursive: z.boolean().optional().describe('Recurse into sub-directories. Default true.'),
			},
		},
		({ path, recursive }) => {
			const resolvedPath = path ?? '/Game';
			const resolvedRecursive = recursive ?? true;

			const subsystem = getEditorAssetSubsystem();
			if (!subsystem) {
				return {
					isError: true,
					content: [
						{
							type: 'text' as const,
							text: 'EditorAssetSubsystem is not available — make sure the UE editor is running, not a commandlet.',
						},
					],
				};
			}

			const assets = subsystem.ListAssets(resolvedPath, resolvedRecursive, false);
			const items: string[] = [];
			for (let i = 0; i < assets.Num(); i++) {
				items.push(assets.Get(i));
			}

			return {
				content: [
					{
						type: 'text' as const,
						text: items.length > 0 ? items.join('\n') : `(no assets under ${resolvedPath})`,
					},
				],
			};
		},
	);
}
