import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { info } from 'gulplog';

import { readJsonFile, writeJsonFile, green, yellow } from './util';
import { getConfig } from '../config';

interface TaskCacheOptions {
	/** 缓存键，如 'tool:build' */
	taskName: string;
	/** 输入文件 glob 模式（相对 projectRoot 解析） */
	inputGlobs: string[];
}

interface CacheEntry {
	/** 文件列表 hash，用于检测文件增删 */
	filesHash: string;
	/** 输入文件中最大的 mtime */
	mtime: number;
	taskName: string;
}

function getProjectRoot(): string {
	const config = getConfig();
	return config.projectRoot;
}

function getCachePath(taskName: string): string {
	const safeName = taskName.replace(/:/g, '-');
	return path.join(getProjectRoot(), '.gulp-cache', `${safeName}.json`);
}

/**
 * 解析 glob 获取文件列表并计算 filesHash 和 maxMtime
 */
function resolveInputs(inputGlobs: string[]): { filesHash: string; mtime: number } {
	const projectRoot = getProjectRoot();
	const allFiles: string[] = [];

	for (const pattern of inputGlobs) {
		// 将 glob 模式中的反斜杠转为正斜杠（Windows 兼容）
		const normalizedPattern = pattern.replace(/\\/g, '/');
		const files = fs.globSync(normalizedPattern, { cwd: projectRoot });
		allFiles.push(...files);
	}

	// 去重并排序，确保确定性
	const uniqueFiles = [...new Set(allFiles)].sort();

	// 计算文件列表 hash（检测增删/重命名）
	const listHash = crypto.createHash('sha256');
	for (const file of uniqueFiles) {
		listHash.update(file);
	}
	const filesHash = listHash.digest('hex');

	// 取所有文件中最大的 mtime
	let maxMtime = 0;
	for (const file of uniqueFiles) {
		const fullPath = path.join(projectRoot, file);
		const stat = fs.statSync(fullPath);
		if (stat.mtimeMs > maxMtime) {
			maxMtime = stat.mtimeMs;
		}
	}

	return { filesHash, mtime: maxMtime };
}

/**
 * 用文件 mtime 缓存机制包装 gulp 任务函数。
 * 输入文件未变更时跳过任务执行。
 */
export function withCache(options: TaskCacheOptions, taskFn: () => Promise<void>): () => Promise<void> {
	return async () => {
		const config = getConfig();

		if (config.noCache) {
			await taskFn();
			try {
				const inputs = resolveInputs(options.inputGlobs);
				writeJsonFile<CacheEntry>(getCachePath(options.taskName), {
					...inputs,
					taskName: options.taskName,
				});
			} catch {
				// 忽略缓存写入失败
			}
			return;
		}

		const inputs = resolveInputs(options.inputGlobs);

		try {
			const cached = readJsonFile<CacheEntry>(getCachePath(options.taskName));
			if (cached && cached.filesHash === inputs.filesHash && inputs.mtime <= cached.mtime) {
				info(green(`[${options.taskName}] Skipped (cached, inputs unchanged)`));
				return;
			}
		} catch {
			// 缓存读取失败，视为 cache miss
		}

		await taskFn();

		try {
			writeJsonFile<CacheEntry>(getCachePath(options.taskName), {
				...inputs,
				taskName: options.taskName,
			});
		} catch {
			info(yellow(`[${options.taskName}] Warning: failed to write cache`));
		}
	};
}
