/**
 * 协议类型：从 @agentclientprotocol/sdk 直接 re-export，无任何本地扩展。
 *
 * 所有 SDK 引用均为 `export type { ... } from`，编译后被 TypeScript 完全擦除，
 * 不会在 PuerTS 运行时触发 SDK 主入口（含 Web Streams / zod 副作用）的加载。
 *
 * 运行时常量 PROTOCOL_VERSION 保持本地硬编码，避免 PuerTS commonjs loader
 * 加载 SDK 的 ESM .js 文件。SDK 升级协议版本时手动更新本文件。
 */

export type {
	AgentCapabilities,
	EnvVariable,
	InitializeResponse,
	ListSessionsResponse,
	McpServerStdio as McpServerEntry,
	NewSessionResponse as SessionStartResponse,
	PermissionOption,
	RequestPermissionRequest,
	RequestPermissionResponse,
	SessionConfigOption,
	SessionInfo,
	SessionInfoUpdate,
	SessionMode,
	SessionModeState,
	SessionNotification,
	SessionUpdate,
} from '@agentclientprotocol/sdk';

/** 协议版本常量（与 @agentclientprotocol/sdk 的 PROTOCOL_VERSION 保持同步，SDK 升 v2 时手动更新） */
export const PROTOCOL_VERSION = 1;
