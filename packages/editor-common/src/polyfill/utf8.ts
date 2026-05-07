/**
 * UTF-8 编解码工具，用于在 PuerTS V8 模式下替代浏览器/Node 的 TextEncoder / TextDecoder。
 *
 * - encodeUtf8(str)：复用 PuerTS 内建 `puerts.toCString`（V8 端原生 Utf8Length + WriteUtf8），
 *   去掉末尾的 NUL 终止符后包成 Uint8Array。
 * - decodeUtf8(bytes)：一次性解码完整 UTF-8 序列。
 * - Utf8StreamDecoder：流式解码，会缓存末尾不完整的多字节序列，等下次 chunk 到达再拼接，
 *   语义对齐 `new TextDecoder().decode(chunk, { stream: true })`。
 */
import * as puerts from 'puerts';

export function encodeUtf8(input: string): Uint8Array {
	const ab = puerts.toCString(input);
	// puerts.toCString 在末尾追加 '\0'，长度为 utf8Length + 1，去掉它。
	const len = ab.byteLength > 0 ? ab.byteLength - 1 : 0;
	return new Uint8Array(ab, 0, len);
}

export function decodeUtf8(bytes: Uint8Array): string {
	return decodeRange(bytes, 0, bytes.length);
}

export class Utf8StreamDecoder {
	private pending: Uint8Array | null = null;

	decode(chunk: Uint8Array): string {
		if (chunk.length === 0) {
			return '';
		}
		let view: Uint8Array;
		if (this.pending && this.pending.length > 0) {
			view = new Uint8Array(this.pending.length + chunk.length);
			view.set(this.pending, 0);
			view.set(chunk, this.pending.length);
			this.pending = null;
		} else {
			view = chunk;
		}

		const cutoff = findLastIncompleteStart(view);
		if (cutoff < view.length) {
			this.pending = view.slice(cutoff);
		}
		return decodeRange(view, 0, cutoff);
	}
}

function decodeRange(bytes: Uint8Array, start: number, end: number): string {
	if (start >= end) {
		return '';
	}
	const codeUnits: number[] = [];
	let i = start;
	while (i < end) {
		const b0 = bytes[i++]!;
		if (b0 < 0x80) {
			codeUnits.push(b0);
			continue;
		}
		let codepoint = 0xfffd;
		if ((b0 & 0xe0) === 0xc0 && i < end) {
			const b1 = bytes[i++]!;
			if ((b1 & 0xc0) === 0x80) {
				codepoint = ((b0 & 0x1f) << 6) | (b1 & 0x3f);
			}
		} else if ((b0 & 0xf0) === 0xe0 && i + 1 < end) {
			const b1 = bytes[i++]!;
			const b2 = bytes[i++]!;
			if ((b1 & 0xc0) === 0x80 && (b2 & 0xc0) === 0x80) {
				codepoint = ((b0 & 0x0f) << 12) | ((b1 & 0x3f) << 6) | (b2 & 0x3f);
			}
		} else if ((b0 & 0xf8) === 0xf0 && i + 2 < end) {
			const b1 = bytes[i++]!;
			const b2 = bytes[i++]!;
			const b3 = bytes[i++]!;
			if ((b1 & 0xc0) === 0x80 && (b2 & 0xc0) === 0x80 && (b3 & 0xc0) === 0x80) {
				codepoint = ((b0 & 0x07) << 18) | ((b1 & 0x3f) << 12) | ((b2 & 0x3f) << 6) | (b3 & 0x3f);
			}
		}
		if (codepoint > 0xffff) {
			const adjusted = codepoint - 0x10000;
			codeUnits.push(0xd800 | (adjusted >>> 10), 0xdc00 | (adjusted & 0x3ff));
		} else {
			codeUnits.push(codepoint);
		}
	}
	let out = '';
	const STEP = 0x4000;
	for (let j = 0; j < codeUnits.length; j += STEP) {
		out += String.fromCharCode.apply(null, codeUnits.slice(j, j + STEP));
	}
	return out;
}

function findLastIncompleteStart(bytes: Uint8Array): number {
	const len = bytes.length;
	if (len === 0) return 0;
	const lookback = Math.min(len, 4);
	for (let back = 1; back <= lookback; back++) {
		const idx = len - back;
		const b = bytes[idx]!;
		if (b < 0x80) {
			return len;
		}
		if ((b & 0xc0) === 0x80) {
			continue; // continuation byte, keep walking back
		}
		const expected = (b & 0xe0) === 0xc0 ? 2 : (b & 0xf0) === 0xe0 ? 3 : (b & 0xf8) === 0xf0 ? 4 : 1;
		const have = back;
		return have >= expected ? len : idx;
	}
	return len;
}

/**
 * 在 PuerTS V8 模式下，全局缺失 `TextEncoder` / `TextDecoder`。
 * 第三方 dist 代码（典型如 `universe-lib/dist/common.cjs` 的 `VSBuffer.fromString`）
 * 在 `typeof Buffer === "undefined"` 时会回退到 `new TextEncoder()`，触发
 * `TextEncoder is not defined`。
 *
 * 这里注入最小可用实现：仅支持 utf-8，仅 `encode(string) -> Uint8Array` /
 * `decode(buffer) -> string` 这两条最常用路径，足以让 universe-lib 等库工作。
 *
 * 必须在所有可能加载第三方 dist 代码的 `import`/`require` 之前调用。
 */
let codecInstalled = false;
export function installTextCodecPolyfill(): void {
	if (codecInstalled) return;
	codecInstalled = true;

	const g = globalThis as unknown as {
		TextEncoder?: unknown;
		TextDecoder?: unknown;
	};

	if (typeof g.TextEncoder === 'undefined') {
		class TextEncoderPolyfill {
			readonly encoding = 'utf-8';
			encode(input = ''): Uint8Array {
				return encodeUtf8(input);
			}
		}
		g.TextEncoder = TextEncoderPolyfill;
	}

	if (typeof g.TextDecoder === 'undefined') {
		class TextDecoderPolyfill {
			readonly encoding: string;
			readonly fatal: boolean;
			readonly ignoreBOM: boolean;
			constructor(label = 'utf-8', options: { fatal?: boolean; ignoreBOM?: boolean } = {}) {
				this.encoding = String(label).toLowerCase();
				this.fatal = !!options.fatal;
				this.ignoreBOM = !!options.ignoreBOM;
			}
			decode(input?: ArrayBuffer | ArrayBufferView): string {
				if (!input) return '';
				let bytes: Uint8Array;
				if (input instanceof Uint8Array) {
					bytes = input;
				} else if (ArrayBuffer.isView(input)) {
					const v = input as ArrayBufferView;
					bytes = new Uint8Array(v.buffer, v.byteOffset, v.byteLength);
				} else {
					bytes = new Uint8Array(input as ArrayBuffer);
				}
				return decodeUtf8(bytes);
			}
		}
		g.TextDecoder = TextDecoderPolyfill;
	}
}
