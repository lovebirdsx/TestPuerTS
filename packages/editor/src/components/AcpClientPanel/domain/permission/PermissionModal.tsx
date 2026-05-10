import * as React from 'react';

import { Btn, HBox, ModalPanel, SPACING, Text, VBox } from '../../../ui';
import { useStoreAction, useStoreSelector } from '../../hooks/useStore';
import { formatUnknown } from '../shared/formatters';

export const PermissionModal: React.FC = () => {
	const pending = useStoreSelector((s) => s.pendingPermission);
	const resolvePermission = useStoreAction('resolvePermission');
	const cancelPermission = useStoreAction('cancelPermission');

	if (!pending) return undefined;

	const request = pending.request;
	const title = request.toolCall.title ?? request.toolCall.toolCallId;

	return (
		<ModalPanel>
			<VBox Gap={SPACING.loose}>
				<Text Text={`Permission Required: ${title}`} />
				<Text Text={formatUnknown(request.toolCall.rawInput)} AutoWrapText />
				<HBox>
					{request.options.map((option) => (
						<Btn key={option.optionId} OnClicked={() => resolvePermission(option.optionId)}>
							<Text Text={option.name} />
						</Btn>
					))}
					<Btn OnClicked={cancelPermission}>
						<Text Text="Cancel" />
					</Btn>
				</HBox>
			</VBox>
		</ModalPanel>
	);
};
