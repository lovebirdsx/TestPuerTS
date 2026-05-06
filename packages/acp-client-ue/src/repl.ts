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
	private prepareMcp: ((sessionKey: string) => Promise<void>) | undefined;
	private prompting = false;
	private closed = false;

	constructor(client: ACPClient, renderer: Renderer, prepareMcp?: (sessionKey: string) => Promise<void>) {
		this.client = client;
		this.renderer = renderer;
		this.prepareMcp = prepareMcp;
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

		UE.ProcessIOHelper.WriteStderr('\n');
		UE.ProcessIOHelper.WriteStderr(
			fmt.bold('ACP Client') + fmt.dim(` connected to ${agentName} ${agentVersion}`) + '\n',
		);
		UE.ProcessIOHelper.WriteStderr(fmt.dim(`Session: ${sessionId}\n`));
		UE.ProcessIOHelper.WriteStderr(fmt.dim('Type /help for available commands\n'));
		UE.ProcessIOHelper.WriteStderr('\n');
	}

	/** 基于轮询的 stdin 行读取 */
	private readLine(): Promise<string> {
		return new Promise((resolve) => {
			const poll = () => {
				if (this.closed) {
					resolve('');
					return;
				}
				const line = UE.ProcessIOHelper.ReadStdinLine();
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
			UE.ProcessIOHelper.WriteStderr(fmt.prompt());
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
				UE.ProcessIOHelper.WriteStderr(fmt.dim(`[Stop reason: ${result.stopReason}]\n\n`));
			} catch (err) {
				this.renderer.ensureNewline();
				UE.ProcessIOHelper.WriteStderr(
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
				UE.ProcessIOHelper.WriteStderr(HELP_TEXT + '\n');
				{
					const serverCommands = this.client.getAvailableCommands();
					if (serverCommands.length > 0) {
						UE.ProcessIOHelper.WriteStderr(
							fmt.dim(
								'\nServer commands:\n' +
									serverCommands
										.map((c) => `  /${c.name}${c.description ? '  ' + c.description : ''}`)
										.join('\n') +
									'\n',
							),
						);
					}
				}
				UE.ProcessIOHelper.WriteStderr('\n');
				break;

			case '/session':
				await this.handleSessionCommand(parts.slice(1));
				break;

			case '/mode': {
				const mode = parts[1];
				if (!mode) {
					UE.ProcessIOHelper.WriteStderr(fmt.error('Usage: /mode <agent|plan|ask>\n'));
					break;
				}
				try {
					await this.client.setMode(mode);
					UE.ProcessIOHelper.WriteStderr(fmt.info(`Mode set to: ${mode}\n`));
				} catch (err) {
					UE.ProcessIOHelper.WriteStderr(
						fmt.error(`Failed to set mode: ${err instanceof Error ? err.message : String(err)}\n`),
					);
				}
				break;
			}

			case '/protocol':
				this.renderer.protocol = !this.renderer.protocol;
				UE.ProcessIOHelper.WriteStderr(
					fmt.info(`Protocol inspector: ${this.renderer.protocol ? 'ON' : 'OFF'}\n`),
				);
				break;

			case '/verbose':
				this.renderer.verbose = !this.renderer.verbose;
				UE.ProcessIOHelper.WriteStderr(fmt.info(`Verbose mode: ${this.renderer.verbose ? 'ON' : 'OFF'}\n`));
				break;

			case '/cancel':
				if (this.prompting) {
					await this.client.cancel();
					UE.ProcessIOHelper.WriteStderr(fmt.info('Cancellation requested.\n'));
				} else {
					UE.ProcessIOHelper.WriteStderr(fmt.dim('No active prompt to cancel.\n'));
				}
				break;

			case '/clear':
				UE.ProcessIOHelper.WriteStderr('\x1B[2J\x1B[H');
				break;

			default: {
				const commandName = cmd.slice(1);
				const serverCommands = this.client.getAvailableCommands();
				const serverCmd = serverCommands.find((c) => c.name === commandName);
				if (serverCmd) {
					const promptText =
						parts.length > 1 ? `/${commandName} ${parts.slice(1).join(' ')}` : `/${commandName}`;
					this.prompting = true;
					try {
						const result = await this.client.prompt(promptText);
						this.renderer.ensureNewline();
						UE.ProcessIOHelper.WriteStderr(fmt.dim(`[Stop reason: ${result.stopReason}]\n\n`));
					} catch (err) {
						this.renderer.ensureNewline();
						UE.ProcessIOHelper.WriteStderr(
							fmt.error(`Error: ${err instanceof Error ? err.message : String(err)}\n\n`),
						);
					} finally {
						this.prompting = false;
					}
				} else {
					UE.ProcessIOHelper.WriteStderr(
						fmt.error(`Unknown command: ${cmd}. Type /help for available commands.\n`),
					);
				}
			}
		}
	}

	private async handleSessionCommand(args: string[]): Promise<void> {
		const subCmd = args[0]?.toLowerCase();

		switch (subCmd) {
			case 'new':
				try {
					await this.prepareMcp?.(`new-${Date.now().toString(36)}`);
					const session = await this.client.newSession();
					UE.ProcessIOHelper.WriteStderr(fmt.green(`New session created: ${session.sessionId}\n`));
				} catch (err) {
					UE.ProcessIOHelper.WriteStderr(
						fmt.error(`Failed to create session: ${err instanceof Error ? err.message : String(err)}\n`),
					);
				}
				break;

			case 'load': {
				const id = args[1];
				if (!id) {
					UE.ProcessIOHelper.WriteStderr(fmt.error('Usage: /session load <id>\n'));
					break;
				}
				try {
					await this.prepareMcp?.(`load-${id}`);
					const session = await this.client.loadSession(id);
					UE.ProcessIOHelper.WriteStderr(fmt.green(`Session loaded: ${session.sessionId}\n`));
				} catch (err) {
					UE.ProcessIOHelper.WriteStderr(
						fmt.error(`Failed to load session: ${err instanceof Error ? err.message : String(err)}\n`),
					);
				}
				break;
			}

			case 'info':
				UE.ProcessIOHelper.WriteStderr(fmt.info(`Session ID: ${this.client.sessionId ?? 'none'}\n`));
				if (this.client.initResult) {
					const init = this.client.initResult;
					UE.ProcessIOHelper.WriteStderr(
						fmt.info(`Agent: ${init.agentInfo?.name ?? 'unknown'} ${init.agentInfo?.version ?? ''}\n`),
					);
				}
				break;

			default:
				UE.ProcessIOHelper.WriteStderr(fmt.error('Usage: /session <new|load <id>|info>\n'));
		}
	}
}
