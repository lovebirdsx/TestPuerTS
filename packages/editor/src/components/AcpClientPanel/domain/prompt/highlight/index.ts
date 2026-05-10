import { fallbackHighlight } from './fallback';
import { lowlightHighlight } from './lowlightAdapter';
import type { HighlightResult } from './types';

export type { CodeLine, CodeToken, HighlightResult } from './types';
export { detectLanguageByPath } from './extToLang';
export { fallbackHighlight };
export { lineToMarkup, linesToMarkup } from './richMarkup';

let lowlightDisabled = false;

export function highlightCode(language: string | undefined | null, code: string): HighlightResult {
	if (language && !lowlightDisabled) {
		try {
			const r = lowlightHighlight(language, code);
			if (r) {
				return r;
			}
		} catch {
			// 适配层意外抛错时永久禁用 lowlight 通道，避免每次都吃异常
			lowlightDisabled = true;
		}
	}
	return fallbackHighlight(language, code);
}
