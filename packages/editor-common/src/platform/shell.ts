import * as ue from 'ue';

/**
 * 在系统的默认管理器（如 Windows 资源管理器或 macOS Finder）中打开给定的路径
 * 或者直接用默认程序打开文件（类似于双击）
 * @param path 文件或文件夹的绝对路径
 */
export function openPath(path: string): void {
	ue.JsRunHelper.SpawnProcess('cmd.exe', `/c start "" "${path}"`, '');
}
