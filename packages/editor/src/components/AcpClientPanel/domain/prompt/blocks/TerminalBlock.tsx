import * as React from 'react';
import type { LinearColor } from 'react-umg';

import { Section, SelectableText, SPACING, Text } from '../../../../ui';

const COL_DIM: LinearColor = { R: 0.55, G: 0.55, B: 0.55, A: 1 };
const COL_RED: LinearColor = { R: 0.95, G: 0.45, B: 0.45, A: 1 };

interface TerminalBlockProps {
	command?: string | null;
	stdout?: string | null;
	stderr?: string | null;
	exitCode?: number | null;
}

/**
 * `execute` 类工具的输出展示：第一行可选回显命令，
 * 接 stdout / stderr（stderr 红色），末尾显示 exit code（非 0 红色）。
 */
export const TerminalBlock: React.FC<TerminalBlockProps> = ({ command, stdout, stderr, exitCode }) => {
	return (
		<Section Tone="normal" Gap={SPACING.tight}>
			{command ? (
				<Text Text={`$ ${command}`} Font={{ Size: 9 }} ColorAndOpacity={{ SpecifiedColor: COL_DIM }} />
			) : null}
			{stdout && stdout.length > 0 ? <SelectableText Text={stdout} AutoWrapText Font={{ Size: 9 }} /> : null}
			{stderr && stderr.length > 0 ? (
				<SelectableText
					Text={stderr}
					AutoWrapText
					Font={{ Size: 9 }}
					ColorAndOpacity={{ SpecifiedColor: COL_RED }}
				/>
			) : null}
			{typeof exitCode === 'number' ? (
				<Text
					Text={`exit ${exitCode}`}
					Font={{ Size: 9 }}
					ColorAndOpacity={{ SpecifiedColor: exitCode === 0 ? COL_DIM : COL_RED }}
				/>
			) : null}
		</Section>
	);
};
