import * as UE from 'ue';
import { createLogger } from '@universe-agent/editor-common';

const logger = createLogger('editor:commandService');

export interface EditorCommand {
	type: string;
	[key: string]: unknown;
}

type CommandHandler = (cmd: EditorCommand) => void;

export class CommandService {
	private readonly pipeName: string;
	private readonly handlers = new Map<string, CommandHandler[]>();
	private currentTransport: UE.IPCTransport | null = null;
	private stopped = false;

	constructor(pipeName: string) {
		this.pipeName = pipeName;
	}

	on(type: string, handler: CommandHandler): this {
		const list = this.handlers.get(type) ?? [];
		list.push(handler);
		this.handlers.set(type, list);
		return this;
	}

	start(): void {
		if (!this.stopped) this.acceptNext();
	}

	dispose(): void {
		this.stopped = true;
		const t = this.currentTransport;
		this.currentTransport = null;
		if (t)
			try {
				t.Close();
			} catch {
				/* ignore */
			}
	}

	private acceptNext(): void {
		if (this.stopped) return;

		const transport = new UE.IPCTransport();
		this.currentTransport = transport;
		let lineBuf = '';

		transport.OnDataAvailable.Add(() => {
			if (this.stopped) return;
			const ab: ArrayBuffer = transport.ReadBuffer();
			if (!ab || ab.byteLength === 0) return;
			lineBuf += new TextDecoder().decode(new Uint8Array(ab));
			const parts = lineBuf.split('\n');
			lineBuf = parts.pop() ?? '';
			for (const line of parts) {
				const trimmed = line.trim();
				if (trimmed) this.handleLine(trimmed);
			}
		});

		transport.OnClosed.Add(() => {
			if (transport !== this.currentTransport) return;
			this.currentTransport = null;
			lineBuf = '';
			this.acceptNext();
		});

		transport.OnConnected.Add(() => {
			logger.log('[CommandService] client connected');
		});

		transport.Listen(this.pipeName);
		logger.log(`[CommandService] listening on ${this.pipeName}`);
	}

	private handleLine(line: string): void {
		let cmd: EditorCommand;
		try {
			cmd = JSON.parse(line) as EditorCommand;
		} catch {
			logger.warn(`[CommandService] invalid JSON: ${line}`);
			return;
		}
		if (typeof cmd.type !== 'string') return;
		for (const h of this.handlers.get(cmd.type) ?? []) {
			try {
				h(cmd);
			} catch (e) {
				logger.error(`[CommandService] handler error: ${String(e)}`);
			}
		}
	}
}
