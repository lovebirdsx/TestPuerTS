"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const puerts_1 = require("puerts");
const ue = require("ue");
suite('Delegate', () => {
    test('muticast', () => {
        const obj = new ue.MainObject();
        let result1 = 0;
        let result2 = 0;
        obj.NotifyWithInt.Add((i) => {
            result1 = i;
        });
        obj.NotifyWithInt.Add((i) => {
            result2 = i;
        });
        obj.NotifyWithInt.Broadcast(100);
        assert.strictEqual(result1, 100);
        assert.strictEqual(result2, 100);
    });
    test('delegate', () => {
        const obj = new ue.MainObject();
        let result = '';
        assert.strictEqual(obj.NotifyWithString.IsBound(), false);
        obj.NotifyWithString.Bind((value) => {
            result = value;
        });
        obj.NotifyWithString.Execute('hello');
        assert.strictEqual(result, 'hello');
        assert.strictEqual(obj.NotifyWithString.IsBound(), true);
    });
    test('ref', () => {
        const obj = new ue.MainObject();
        obj.NotifyWithRefString.Bind((strRef) => {
            const outerStr = (0, puerts_1.$unref)(strRef);
            (0, puerts_1.$set)(strRef, outerStr + '-out');
        });
        const strRef = (0, puerts_1.$ref)('hello');
        obj.NotifyWithRefString.Execute(strRef);
        assert.strictEqual((0, puerts_1.$unref)(strRef), 'hello-out');
    });
    test('return value', () => {
        const obj = new ue.MainObject();
        obj.NotifyWithStringRet.Bind((str) => {
            return str + '-result';
        });
        const result = obj.NotifyWithStringRet.Execute('test');
        assert.strictEqual(result, 'test-result');
    });
});
//# sourceMappingURL=delegate.test.js.map