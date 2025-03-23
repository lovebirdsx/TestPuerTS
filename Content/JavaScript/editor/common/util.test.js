"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const util_1 = require("./util");
suite('Util', () => {
    test('get modify time', () => {
        assert.ok((0, util_1.getFileModifiedTime)(__filename) > 0);
    });
});
//# sourceMappingURL=util.test.js.map