import * as React from 'react';
import { z } from 'zod';
import { defineStore } from '@universe-agent/editor-common';

const sessionStore = defineStore(
	'editor-tab-session',
	z.object({
		openTabs: z.array(z.string()).default([]),
	}),
);

// 内存注册表：tabName → 组件工厂
const tabFactoryRegistry = new Map<string, () => React.ReactElement>();

export function registerTabFactory(tabName: string, factory: () => React.ReactElement): void {
	tabFactoryRegistry.set(tabName, factory);
}

export function trackTabOpen(tabName: string): void {
	void sessionStore.ready().then(() => {
		sessionStore.update((s) => {
			if (!s.openTabs.includes(tabName)) {
				s.openTabs.push(tabName);
			}
		});
	});
}

export function untrackTabOpen(tabName: string): void {
	void sessionStore.ready().then(() => {
		sessionStore.update((s) => {
			const idx = s.openTabs.indexOf(tabName);
			if (idx !== -1) {
				s.openTabs.splice(idx, 1);
			}
		});
	});
}

export async function restoreOpenTabs(
	opener: (tabName: string, factory: () => React.ReactElement) => void,
): Promise<void> {
	await sessionStore.ready();
	const { openTabs } = sessionStore.get();
	for (const tabName of openTabs) {
		const factory = tabFactoryRegistry.get(tabName);
		if (factory) {
			opener(tabName, factory);
		}
	}
}
