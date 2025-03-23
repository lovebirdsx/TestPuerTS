"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.watch = watch;
const fs = require("fs");
/**
 * 监控文件夹，当文件夹内文件发生变化时，调用回调函数
 * @param dir 文件夹路径
 * @param callback 回调函数
 * @returns 取消监听函数
 */
function watch(dir, callback) {
    let timeoutId = null;
    const watcher = fs.watch(dir, { recursive: true }, (eventType, filename) => {
        console.log(`File ${filename} has been changed: ${eventType}`);
        // 使用去抖动机制防止多次连续触发
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            callback();
            timeoutId = null;
        }, 100);
    });
    watcher.on('error', (error) => {
        console.error(`Watcher error: ${error}`);
    });
    return () => {
        watcher.close();
    };
}
//# sourceMappingURL=watcher.js.map