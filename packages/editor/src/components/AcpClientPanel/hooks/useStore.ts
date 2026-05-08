import * as React from 'react';

import type { AcpPanelStore } from '../store';
import { useAcpPanelStore as defaultStore, type UseAcpPanelStore } from '../store';

/**
 * StoreContext：让所有子组件透明地共享同一个 store hook。
 *
 * - 默认（不提供）使用模块级单例 `useAcpPanelStore`，生产场景无需 Provider 包装。
 * - 测试通过 <StoreProvider value={createAcpPanelStore({...})}> 注入隔离实例。
 *
 * 不暴露 store 的 raw state，组件只通过 useStoreSelector / useStoreAction 访问。
 */
const StoreContext = React.createContext<UseAcpPanelStore | undefined>(undefined);

export const StoreProvider: React.FC<{ value: UseAcpPanelStore; children: React.ReactNode }> = ({ value, children }) =>
	React.createElement(StoreContext.Provider, { value }, children);

export function useStore(): UseAcpPanelStore {
	return React.useContext(StoreContext) ?? defaultStore;
}

export function useStoreSelector<T>(selector: (state: AcpPanelStore) => T): T {
	const store = useStore();
	return store(selector);
}

/** 取一个 action（不会因 state 变化而重渲染调用方）。 */
export function useStoreAction<K extends keyof AcpPanelStore>(name: K): AcpPanelStore[K] {
	const store = useStore();
	return store(React.useCallback((s) => s[name], [name]));
}

/** 监听 zustand persist hydration 完成。 */
export function useHydration(): boolean {
	const store = useStore();
	const [hydrated, setHydrated] = React.useState<boolean>(() => store.persist.hasHydrated());
	React.useEffect(() => {
		const unsub = store.persist.onFinishHydration(() => setHydrated(true));
		setHydrated(store.persist.hasHydrated());
		return () => {
			unsub();
		};
	}, [store]);
	return hydrated;
}
