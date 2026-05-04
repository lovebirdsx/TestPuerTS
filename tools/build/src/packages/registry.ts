import * as path from 'path';
import { getConfig } from '../config';

/**
 * 包定义。新增 workspace 包时只需在 WORKSPACE_PACKAGES 末尾追加一项，
 * 同时在仓库根 tsconfig.workspace.json 的 references 里加一行即可。
 *
 * gulpfile.ts 与 workspace.ts 都不需要修改。
 */
export interface PackageDef {
	/** 任务前缀，如 'editor' → 生成 editor:lint / editor:build / editor:typecheck 等 */
	name: string;
	/** 包根目录绝对路径（用于跑 eslint src 之类 per-package 命令时的 cwd） */
	dir: string;
	/** 相对 projectRoot 的源文件 glob，用于 per-package lint 缓存键 */
	srcGlob: string[];
	/** per-package lint 时执行的 eslint 入口（相对 dir），默认 'src' */
	lintEntry?: string;
	/** typecheck 时是否额外跑 madge 循环依赖检查 */
	enableMadge?: boolean;
	/** madge 入口（相对 dir），默认 './src' */
	madgeEntry?: string;
	/** 是否生成 <pkg>:watch 薄包装（独立 tsc -w，便于只关注一个包） */
	hasWatch?: boolean;
}

const config = getConfig();
const packagesPath = config.packagesPath;
const buildToolsPath = config.buildToolsPath;

export const WORKSPACE_PACKAGES: PackageDef[] = [
	{
		name: 'editor-common',
		dir: path.join(packagesPath, 'editor-common'),
		srcGlob: ['packages/editor-common/src/**/*.ts', 'packages/editor-common/eslint.config.*'],
	},
	{
		name: 'mcp-bridge',
		dir: path.join(packagesPath, 'mcp-bridge'),
		srcGlob: ['packages/mcp-bridge/src/**/*.ts'],
	},
	{
		name: 'acp-client-ue',
		dir: path.join(packagesPath, 'acp-client-ue'),
		srcGlob: ['packages/acp-client-ue/src/**/*.ts'],
	},
	{
		name: 'mcp-server-ue',
		dir: path.join(packagesPath, 'mcp-server-ue'),
		srcGlob: ['packages/mcp-server-ue/src/**/*.ts'],
	},
	{
		name: 'editor',
		dir: path.join(packagesPath, 'editor'),
		srcGlob: ['packages/editor/src/**/*.{ts,tsx}'],
		enableMadge: true,
		hasWatch: true,
	},
	{
		name: 'tests',
		dir: path.join(packagesPath, 'tests'),
		srcGlob: ['packages/tests/src/**/*.ts'],
	},
	{
		name: 'tool',
		dir: buildToolsPath,
		srcGlob: ['tools/build/src/**/*.ts'],
		enableMadge: true,
		hasWatch: true,
	},
];

/** 所有包源文件 glob 的并集，用于 workspace 级缓存键 */
export function allSrcGlobs(): string[] {
	const set = new Set<string>();
	for (const pkg of WORKSPACE_PACKAGES) {
		pkg.srcGlob.forEach((g) => set.add(g));
	}
	return [...set];
}

/** 所有包 tsconfig.json 路径（相对 projectRoot），用于 workspace 级缓存键 */
export function allTsconfigGlobs(): string[] {
	const tsconfigs = new Set<string>(['tsconfig.workspace.json', 'tsconfig.base.json']);
	for (const pkg of WORKSPACE_PACKAGES) {
		const rel = path.relative(config.projectRoot, pkg.dir).replace(/\\/g, '/');
		tsconfigs.add(`${rel}/tsconfig.json`);
		tsconfigs.add(`${rel}/package.json`);
	}
	return [...tsconfigs];
}
