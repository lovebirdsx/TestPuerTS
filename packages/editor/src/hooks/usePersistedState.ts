import * as React from 'react';
import type { PersistenceStore } from '@universe-agent/editor-common';

/**
 * 将 PersistenceStore 桥接为 React state。
 * 首次渲染用 store 当前值（可能是默认值），ready 后同步为持久化数据。
 * 组件卸载时自动取消订阅。
 *
 * @returns [state, update, isReady]
 *   - state: 当前状态（只读深拷贝）
 *   - update: (mutator) => void，调用 store.update()
 *   - isReady: store 是否已从磁盘加载完毕
 */
export function usePersistedState<T>(
	store: PersistenceStore<T>,
): [Readonly<T>, (mutator: (draft: T) => void) => void, boolean] {
	const [state, setState] = React.useState<Readonly<T>>(() => {
		try {
			return store.get();
		} catch {
			// store 尚未 ready，返回空对象触发 ready 后的同步
			return {} as Readonly<T>;
		}
	});
	const [isReady, setIsReady] = React.useState(false);

	React.useEffect(() => {
		let cancelled = false;

		store.ready().then(() => {
			if (cancelled) return;
			setState(store.get());
			setIsReady(true);
		});

		const unsubscribe = store.onChange((next) => {
			if (!cancelled) setState(next);
		});

		return () => {
			cancelled = true;
			unsubscribe();
		};
	}, [store]);

	const update = React.useCallback(
		(mutator: (draft: T) => void) => {
			store.update(mutator);
		},
		[store],
	);

	return [state, update, isReady];
}
