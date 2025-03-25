"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const puerts_1 = require("puerts");
const ue = require("ue");
suite('Basic', () => {
    test('access field', () => {
        const obj = new ue.MainObject();
        assert.strictEqual(obj.MyString, '');
        obj.MyString = 'PPPPP';
        assert.strictEqual(obj.MyString, 'PPPPP');
    });
    test('simple type function', () => {
        const obj = new ue.MainObject();
        assert.strictEqual(obj.Add(100, 300), 400);
    });
    test('complex type function', () => {
        const obj = new ue.MainObject();
        const str = obj.Bar(new ue.Vector(1, 2, 3));
        assert.strictEqual(str, 'UMyObject::Bar(X=1.000 Y=2.000 Z=3.000)');
    });
    test('reference type function', () => {
        const obj = new ue.MainObject();
        const vectorRef = (0, puerts_1.$ref)(new ue.Vector(1, 2, 3));
        obj.Bar2(vectorRef);
        const vectorRefValue = (0, puerts_1.$unref)(vectorRef);
        assert.strictEqual(vectorRefValue.X, 1024);
    });
    test('static method', () => {
        const str1 = ue.JSBlueprintFunctionLibrary.GetName();
        assert.strictEqual(str1, 'Hello');
    });
    test('extension method', () => {
        const v = new ue.Vector(3, 2, 1);
        assert.strictEqual(v.ToString(), 'X=3.000 Y=2.000 Z=1.000');
        v.Set(8, 88, 888);
        assert.strictEqual(v.ToString(), 'X=8.000 Y=88.000 Z=888.000');
    });
    test('default params', () => {
        const obj = new ue.MainObject();
        assert.strictEqual(obj.DefaultTest(), 'Str: i am default, I: 10, Vec: X=1.100 Y=2.200 Z=3.300');
        assert.strictEqual(obj.DefaultTest('custom'), 'Str: custom, I: 10, Vec: X=1.100 Y=2.200 Z=3.300');
        assert.strictEqual(obj.DefaultTest('custom', 20), 'Str: custom, I: 20, Vec: X=1.100 Y=2.200 Z=3.300');
        assert.strictEqual(obj.DefaultTest('custom', 20, new ue.Vector(4, 5, 6)), 'Str: custom, I: 20, Vec: X=4.000 Y=5.000 Z=6.000');
    });
    test('enum', () => {
        assert.strictEqual(ue.EToTest.V0, 0);
        assert.strictEqual(ue.EToTest.V1, 1);
        assert.strictEqual(ue.EToTest.V13, 13);
    });
});
//# sourceMappingURL=basic.test.js.map