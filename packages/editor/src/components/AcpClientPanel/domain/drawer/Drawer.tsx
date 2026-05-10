import * as React from 'react';
import { Spacer } from 'react-umg';

import { Divider, HBox, Section, SPACING, Text, ToolbarButton } from '../../../ui';

const center = { VerticalAlignment: 2 as any };

export const Drawer: React.FC<{
	title: string;
	onClose: () => void;
	children?: React.ReactNode;
}> = ({ title, onClose, children }) => (
	<Section Gap={SPACING.loose}>
		<HBox Gap={SPACING.normal}>
			<Text Text={title} Slot={center} />
			<Spacer Slot={{ Size: { SizeRule: 1, Value: 1 } }} />
			<ToolbarButton OnClicked={onClose} Slot={center}>
				<Text Text="✕" />
			</ToolbarButton>
		</HBox>
		<Divider />
		{children}
	</Section>
);
