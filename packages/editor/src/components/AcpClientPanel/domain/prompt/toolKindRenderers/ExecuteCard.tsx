import * as React from 'react';

import { SPACING, VBox } from '../../../../ui';

import { TerminalBlock } from '../blocks';
import { ContentDispatcher } from '../contentDispatcher';
import { extractCommand, extractTerminalOutput } from './sharedExtractors';
import type { BodyProps, KindRenderer } from './types';

/**
 * `execute` 类工具：rawInput.command 是要跑的命令，rawOutput 通常带 stdout/stderr/exitCode。
 *
 * Body 渲染策略：
 *   1. 若 rawOutput 形态匹配（terminal-style），用 TerminalBlock 渲染；
 *   2. 否则把 content[] 走 ContentDispatcher（包含 `type: 'terminal'` 时会显示占位）。
 */
const ExecuteBody: React.FC<BodyProps> = ({ item }) => {
	const command = extractCommand(item.rawInput);
	const output = extractTerminalOutput(item.rawOutput);

	if (output || command) {
		return (
			<VBox Gap={SPACING.normal}>
				<TerminalBlock
					command={command}
					stdout={output?.stdout}
					stderr={output?.stderr}
					exitCode={output?.exitCode}
				/>
				{item.content !== undefined ? <ContentDispatcher value={item.content} /> : null}
			</VBox>
		);
	}

	return <ContentDispatcher value={item.content} />;
};

export const ExecuteCard: KindRenderer = {
	derivePaths: () => [],
	Body: ExecuteBody,
};
