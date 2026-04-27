/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { describe } from 'vitest';

export function flakySuite(title: string, fn: () => void) /* Suite */ {
	return describe(title, function () {
		// vitest 通过配置文件管理 retry 和 timeout，此处直接执行
		fn();
	});
}
