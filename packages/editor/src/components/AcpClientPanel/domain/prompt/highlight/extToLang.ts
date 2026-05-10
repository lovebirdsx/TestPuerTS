/**
 * 路径后缀 → highlight.js 语言名。
 * 仅覆盖项目里高频出现的 8 种；未命中返回 undefined，调用方走 plain text。
 */
const EXT_TO_LANG: Record<string, string> = {
	ts: 'typescript',
	tsx: 'typescript',
	mts: 'typescript',
	cts: 'typescript',
	d: 'typescript',
	js: 'javascript',
	jsx: 'javascript',
	mjs: 'javascript',
	cjs: 'javascript',
	json: 'json',
	jsonc: 'json',
	sh: 'bash',
	bash: 'bash',
	zsh: 'bash',
	py: 'python',
	pyi: 'python',
	cpp: 'cpp',
	cc: 'cpp',
	cxx: 'cpp',
	c: 'cpp',
	h: 'cpp',
	hpp: 'cpp',
	hh: 'cpp',
	hxx: 'cpp',
	ini: 'ini',
	toml: 'ini',
	cfg: 'ini',
	conf: 'ini',
	md: 'markdown',
	markdown: 'markdown',
};

export function detectLanguageByPath(path: string | undefined | null): string | undefined {
	if (!path) {
		return undefined;
	}
	const lower = path.toLowerCase();
	const dot = lower.lastIndexOf('.');
	if (dot < 0 || dot === lower.length - 1) {
		return undefined;
	}
	const ext = lower.slice(dot + 1);
	return EXT_TO_LANG[ext];
}
