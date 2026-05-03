export interface BridgeLink {
	send(line: string): void;
	onMessage(handler: (line: string) => void): void;
	onClose(handler: () => void): void;
	close(): void;
}
