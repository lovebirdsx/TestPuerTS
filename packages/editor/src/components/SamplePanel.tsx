import * as React from 'react';
import { Btn, Panel, Text, VBox } from './ui';

/**
 * 示例 ReactUMG 面板，演示在 UE 编辑器 Tab 中渲染 React 组件
 */
export const SamplePanel = (): React.ReactElement => {
	const [count, setCount] = React.useState(0);

	return (
		<Panel>
			<VBox>
				<Text Text={`Hello from ReactUMG! Count: ${count}`} />
				<Btn
					OnClicked={() => {
						setCount(count + 1);
						console.log('Button clicked, count is now', count);
					}}
				>
					<Text Text="Click me" />
				</Btn>
			</VBox>
		</Panel>
	);
};
