import * as React from 'react';
import { Button, TextBlock, VerticalBox } from 'react-umg';

/**
 * 示例 ReactUMG 面板，演示在 UE 编辑器 Tab 中渲染 React 组件
 */
export const SamplePanel = (): React.ReactElement => {
	const [count, setCount] = React.useState(0);

	return (
		<VerticalBox>
			<TextBlock Text={`Hello from ReactUMG! Count: ${count}`} />
			<Button
				OnClicked={() => {
					setCount(count + 1);
					console.log('Button clicked, count is now', count);
				}}
			>
				<TextBlock Text="Click me" />
			</Button>
		</VerticalBox>
	);
};
