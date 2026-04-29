import * as UE from 'ue';
import { fmt } from './format';
import { ACPClient } from './client';
import type { Renderer } from './renderer';

const HELP_TEXT = `
Available commands:
  /help                Show this help message
  /quit, /exit         Disconnect and exit
  /session new         Create a new session
  /session load <id>   Load an existing session
  /session info        Show current session info
  /mode <mode>         Switch mode (agent/plan/ask)
  /protocol            Toggle protocol inspector
  /verbose             Toggle verbose output
  /cancel              Cancel current prompt
  /clear               Clear terminal screen
`.trim();

export class Repl {
	private client: ACPClient;
	private renderer: Renderer;
	private prompting = false;
	private closed = false;

	constructor(client: ACPClient, renderer: Renderer) {
		this.client = client;
		this.renderer = renderer;
	}

	async start(): Promise<void> {
		this.printBanner();
		await this.promptLoop();
	}

	private printBanner(): void {
		const init = this.client.initResult;
		const agentName = init?.agentInfo?.name ?? 'unknown';
		const agentVersion = init?.agentInfo?.version ?? '';
		const sessionId = this.client.sessionId ?? 'none';

		UE.ACPClientHelper.WriteStderr('\n');
		UE.ACPClientHelper.WriteStderr(
			fmt.bold('ACP Client') + fmt.dim(` connected to ${agentName} ${agentVersion}`) + '\n',
		);
		UE.ACPClientHelper.WriteStderr(fmt.dim(`Session: ${sessionId}\n`));
		UE.ACPClientHelper.WriteStderr(fmt.dim('Type /help for available commands\n'));
		UE.ACPClientHelper.WriteStderr('\n');
	}

	/** 基于轮询的 stdin 行读取 */
	private readLine(): Promise<string> {
		return new Promise((resolve) => {
			const poll = () => {
				if (this.closed) {
					resolve('');
					return;
				}
				const line = UE.ACPClientHelper.ReadStdinLine();
				if (line !== '') {
					resolve(line);
				} else {
					setTimeout(poll, 50);
				}
			};
			poll();
		});
	}

	private async promptLoop(): Promise<void> {
		while (!this.closed) {
			UE.ACPClientHelper.WriteStderr(fmt.prompt());
			const input = await this.readLine();
			const trimmed = input.trim();

			if (!trimmed) {
				continue;
			}

			if (trimmed.startsWith('/')) {
				await this.handleSlashCommand(trimmed);
				continue;
			}

			// 作为普通 prompt 发送
			this.prompting = true;
			try {
				const result = await this.client.prompt(trimmed);
				this.renderer.ensureNewline();
				UE.ACPClientHelper.WriteStderr(fmt.dim(`[Stop reason: ${result.stopReason}]\n\n`));
			} catch (err) {
				this.renderer.ensureNewline();
				UE.ACPClientHelper.WriteStderr(
					fmt.error(`Error: ${err instanceof Error ? err.message : String(err)}\n\n`),
				);
			} finally {
				this.prompting = false;
			}
		}
	}

	private async handleSlashCommand(input: string): Promise<void> {
		const parts = input.split(/\s+/);
		const cmd = parts[0]!.toLowerCase();

		switch (cmd) {
			case '/quit':
			case '/exit':
				this.closed = true;
				await this.client.disconnect();
				break;

			case '/help':
				UE.ACPClientHelper.WriteStderr(HELP_TEXT + '\n\n');
				break;

			case '/session':
				await this.handleSessionCommand(parts.slice(1));
				break;

			case '/mode': {
				const mode = parts[1];
				if (!mode) {
					UE.ACPClientHelper.WriteStderr(fmt.error('Usage: /mode <agent|plan|ask>\n'));
					break;
				}
				try {
					await this.client.setMode(mode);
					UE.ACPClientHelper.WriteStderr(fmt.info(`Mode set to: ${mode}\n`));
				} catch (err) {
					UE.ACPClientHelper.WriteStderr(
						fmt.error(`Failed to set mode: ${err instanceof Error ? err.message : String(err)}\n`),
					);
				}
				break;
			}

			case '/protocol':
				this.renderer.protocol = !this.renderer.protocol;
				UE.ACPClientHelper.WriteStderr(
					fmt.info(`Protocol inspector: ${this.renderer.protocol ? 'ON' : 'OFF'}\n`),
				);
				break;

			case '/verbose':
				this.renderer.verbose = !this.renderer.verbose;
				UE.ACPClientHelper.WriteStderr(fmt.info(`Verbose mode: ${this.renderer.verbose ? 'ON' : 'OFF'}\n`));
				break;

			case '/cancel':
				if (this.prompting) {
					await this.client.cancel();
					UE.ACPClientHelper.WriteStderr(fmt.info('Cancellation requested.\n'));
				} else {
					UE.ACPClientHelper.WriteStderr(fmt.dim('No active prompt to cancel.\n'));
				}
				break;

			case '/clear':
				UE.ACPClientHelper.WriteStderr('\x1B[2J\x1B[H');
				break;

			default:
				UE.ACPClientHelper.WriteStderr(
					fmt.error(`Unknown command: ${cmd}. Type /help for available commands.\n`),
				);
		}
	}

	private async handleSessionCommand(args: string[]): Promise<void> {
		const subCmd = args[0]?.toLowerCase();

		switch (subCmd) {
			case 'new':
				try {
					const sessionId = await this.client.newSession();
					UE.ACPClientHelper.WriteStderr(fmt.green(`New session created: ${sessionId}\n`));
				} catch (err) {
					UE.ACPClientHelper.WriteStderr(
						fmt.error(`Failed to create session: ${err instanceof Error ? err.message : String(err)}\n`),
					);
				}
				break;

			case 'load': {
				const id = args[1];
				if (!id) {
					UE.ACPClientHelper.WriteStderr(fmt.error('Usage: /session load <id>\n'));
					break;
				}
				try {
					const sessionId = await this.client.loadSession(id);
					UE.ACPClientHelper.WriteStderr(fmt.green(`Session loaded: ${sessionId}\n`));
				} catch (err) {
					UE.ACPClientHelper.WriteStderr(
						fmt.error(`Failed to load session: ${err instanceof Error ? err.message : String(err)}\n`),
					);
				}
				break;
			}

			case 'info':
				UE.ACPClientHelper.WriteStderr(fmt.info(`Session ID: ${this.client.sessionId ?? 'none'}\n`));
				if (this.client.initResult) {
					const init = this.client.initResult;
					UE.ACPClientHelper.WriteStderr(
						fmt.info(`Agent: ${init.agentInfo?.name ?? 'unknown'} ${init.agentInfo?.version ?? ''}\n`),
					);
				}
				break;

			default:
				UE.ACPClientHelper.WriteStderr(fmt.error('Usage: /session <new|load <id>|info>\n'));
		}
	}
}
