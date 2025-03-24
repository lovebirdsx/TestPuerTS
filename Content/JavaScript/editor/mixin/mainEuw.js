"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bindMainEUWClass = bindMainEUWClass;
const puerts_1 = require("puerts");
const ue = require("ue");
const runTest_1 = require("../tests/runTest");
class MainEUW {
    OnClick(event) {
        (0, runTest_1.runTest)(event);
    }
}
function bindMainEUWClass(path) {
    const ucls = ue.Class.Load(path);
    const JsMainEUW = puerts_1.blueprint.tojs(ucls);
    puerts_1.blueprint.mixin(JsMainEUW, MainEUW);
    return () => {
        puerts_1.blueprint.unmixin(JsMainEUW);
    };
}
//# sourceMappingURL=mainEuw.js.map