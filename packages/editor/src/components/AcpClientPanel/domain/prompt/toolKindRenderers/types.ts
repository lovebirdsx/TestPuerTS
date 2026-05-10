import * as React from 'react';

import type { ToolItem } from '../../../store';
import type { ExtractedPath } from './sharedExtractors';

/**
 * 各 ToolKind 的渲染分两部分：
 *
 * - `derivePaths(item)`     —— 给共用头部的 PathChip 列表用
 * - `Body` React 组件     —— 展开时的主体
 *
 * 这样头部 PathChip 不需要每次解构 ToolItem，body 可以根据 kind 完全自由组织。
 */
export interface KindRenderer {
	derivePaths: (item: ToolItem) => ExtractedPath[];
	Body: React.FC<BodyProps>;
}

export interface BodyProps {
	item: ToolItem;
}
