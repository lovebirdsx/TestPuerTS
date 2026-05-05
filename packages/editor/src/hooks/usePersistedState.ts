import * as React from 'react';
import type { PersistenceStore } from '@universe-agent/editor-common';

/**
 * 将 PersistenceStore 桥接为 React state。
 * 首次渲染用 store.getOrDefault()（store 未 ready 时返回 schema 默认值），
 * ready 后同步为持久化数据。组件卸载时自动取消订阅。
 *
 * @returns [state, update, isReady]
 *   - state: 当前状态（只读深拷贝）
 *   - update: (mutator) => void，调用 store.update()（store 未 ready 时仅更新本地 state）
 *   - isReady: store 是否已从磁盘加载完毕
 */
export function usePersistedState<T>(
	store: PersistenceStore<T>,
): [Readonly<T>, (mutator: (draft: T) => void) => void, boolean] {
	const [state, setState] = React.useState<Readonly<T>>(() => store.getOrDefault());
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
			if (!isReady) {
				// store 未 ready 时，不能写入磁盘，只做乐观本地 state 更新
				setState((prev) => {
					const draft = JSON.parse(JSON.stringify(prev)) as T;
					mutator(draft);
					return draft as Readonly<T>;
				});
				return;
			}
			store.update(mutator);
		},
		[store, isReady],
	);

	return [state, update, isReady];
}
