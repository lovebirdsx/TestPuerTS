/**
 * mcp-bridge 与 editor 端共享的协议定义。
 *
 * 通信模型：
 *   - bridge 是 universe-lib client（反向连接到 editor 内的 server）
 *   - bridge 注册一个回调通道（reverse channel），让 editor 能把 MCP 消息推回 bridge stdout
 *   - bridge 通过主通道把 agent 经 stdin 送来的 MCP 消息行转发给 editor
 *
 * agent 视角：bridge 就是普通的 stdio MCP server，符合 MCP 标准 spawn 模型，无需改造 agent。
 */

/** 主通道名 —— editor 注册的服务，bridge 通过它把 agent → editor 的消息转发出去。 */
export const BRIDGE_CHANNEL = 'mcp-bridge';

/** 反向通道名 —— bridge 注册的回调服务，editor 通过它把 editor → agent 的消息推回 bridge stdout。 */
export const BRIDGE_CALLBACK_CHANNEL = 'mcp-bridge-callback';

/** editor 端实现的服务接口：bridge 调它来转发 agent 发来的 ndjson 行。 */
export interface IMcpBridgeService {
	/**
	 * 转发 agent 通过 stdin 发来的一行 MCP JSON-RPC 消息。
	 * @param line ndjson 单帧（不含末尾换行）
	 */
	forwardFromAgent(line: string): Promise<void>;
}

/** bridge 端实现的回调服务：editor 调它把 MCP 响应/通知推到 bridge stdout。 */
export interface IMcpBridgeCallback {
	/**
	 * editor 推送的 MCP JSON-RPC 消息（响应或通知），bridge 写入 stdout。
	 * @param line ndjson 单帧（不含末尾换行）
	 */
	pushToAgent(line: string): Promise<void>;
}
