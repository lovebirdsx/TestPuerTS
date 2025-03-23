"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileModifiedTime = getFileModifiedTime;
const fs = require("fs");
function getFileModifiedTime(filePath) {
    return fs.statSync(filePath).mtimeMs;
}
//# sourceMappingURL=util.js.map