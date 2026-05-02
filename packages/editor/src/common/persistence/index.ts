// editor 持久化模块公共 API
//
// 使用示例：
//   import { z } from 'zod';
//   import { defineStore } from 'editor';
//
//   const settings = defineStore('settings', z.object({
//     theme: z.enum(['light', 'dark']).default('dark'),
//     recentFiles: z.array(z.string()).default([]),
//   }));
//
//   await settings.ready();
//   settings.update(s => { s.theme = 'light'; });

export { defineStore, PersistenceStore } from './store';
export type { ChangeListener, DefineStoreOptions } from './store';
export { flushAllPersistence } from './registry';
export { setPersistenceRoot, getPersistenceRoot } from './paths';
export type { IFileIO } from './fileIO';
