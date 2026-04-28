var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/main.ts
var UE = __toESM(require("ue"));
console.log("=== PuerTS Commandlet Test Runner ===");
console.log("\u53EF\u7528\u7684\u6D4B\u8BD5\u6A21\u5757:");
console.log("  -module=tests/rpcClientMain  \u2192 PuerTS \u4F5C\u4E3A Client\uFF0CNode.js \u4F5C\u4E3A Server");
console.log("  -module=tests/rpcServerMain  \u2192 PuerTS \u4F5C\u4E3A Server\uFF0CNode.js \u4F5C\u4E3A Client");
UE.PuertsTestHelper.MarkTestDone(0);
//# sourceMappingURL=main.js.map
