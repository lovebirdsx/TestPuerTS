import { TsEditorMenuLibrary, TsEditorMenuEntryConfig } from 'ue';
import * as ue from 'ue';
import { toManualReleaseDelegate, releaseManualReleaseDelegate } from 'puerts';

export interface EditorMenuRegistration {
	id: string;
	label: string;
	tooltip?: string;
	path?: string[];
	section?: string;
	owner?: string;
	sortOrder?: number;
	closeAfterSelection?: boolean;
	onExecute: (id: string) => void;
	canExecute?: (id: string) => boolean;
}

export interface Disposable {
	dispose(): void;
}

const activeMenuRegistrations = new Map<string, Disposable>();

export function registerEditorMenu(registration: EditorMenuRegistration): Disposable {
	const config = new TsEditorMenuEntryConfig();
	const path = ue.NewArray(ue.BuiltinString);
	path.Add(...(registration.path ?? []));

	config.Id = registration.id;
	config.Owner = registration.owner ?? 'TsEditorJS';
	config.Path = path;
	config.Section = registration.section ?? 'Dynamic';
	config.Label = registration.label;
	config.ToolTip = registration.tooltip ?? '';
	config.SortOrder = registration.sortOrder ?? 0;
	config.bCloseAfterSelection = registration.closeAfterSelection ?? true;

	// 使用 toManualReleaseDelegate 防止代理 UObject 被 GC 回收
	// toDelegate(undefined, fn) 创建的代理 UObject 无强引用持有，
	// 而 FScriptDelegate 内部仅用 TWeakObjectPtr 引用代理，GC 后委托失效
	const executeFn = (id: string) => registration.onExecute(id);
	const canExecuteFn = (id: string) => registration.canExecute?.(id) ?? true;
	const executeDelegate = toManualReleaseDelegate(executeFn);
	const canExecuteDelegate = toManualReleaseDelegate(canExecuteFn);
	TsEditorMenuLibrary.RegisterMenuEntry(config, executeDelegate, canExecuteDelegate);

	const disposable = {
		dispose() {
			TsEditorMenuLibrary.UnregisterMenuEntry(registration.id);
			activeMenuRegistrations.delete(registration.id);
			releaseManualReleaseDelegate(executeFn);
			releaseManualReleaseDelegate(canExecuteFn);
		},
	};
	activeMenuRegistrations.set(registration.id, disposable);
	return disposable;
}

export function registerEditorMenus(registrations: EditorMenuRegistration[]): Disposable {
	const disposables = registrations.map((registration) => registerEditorMenu(registration));
	return {
		dispose() {
			for (const disposable of disposables) {
				disposable.dispose();
			}
		},
	};
}

export function unregisterEditorMenu(id: string) {
	TsEditorMenuLibrary.UnregisterMenuEntry(id);
}
