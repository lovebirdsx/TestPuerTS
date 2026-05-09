import * as net from 'net';

const PIPE_PATH = '\\\\.\\pipe\\ue-editor-cmd';
const CONNECT_TIMEOUT_MS = 3000;

/** 向 editor 发送 JSON 命令。连接失败时静默处理（editor 未运行属正常情况）。 */
export function sendEditorCommand(cmd: object): Promise<void> {
	return new Promise<void>((resolve) => {
		let finished = false;
		const done = () => {
			if (!finished) {
				finished = true;
				resolve();
			}
		};

		let socket: net.Socket;
		try {
			socket = net.createConnection(PIPE_PATH);
		} catch {
			done();
			return;
		}

		const timer = setTimeout(() => {
			socket.destroy();
			done();
		}, CONNECT_TIMEOUT_MS);

		socket.once('connect', () => {
			clearTimeout(timer);
			socket.end(JSON.stringify(cmd) + '\n', 'utf8', done);
		});
		socket.once('error', () => {
			clearTimeout(timer);
			done();
		});
		socket.once('close', done);
	});
}
