/**
 * 修复 PuerTS V8 模块加载器对 `module.exports = require('./xxx')` 重导出形式不友好的问题。
 *
 * 现象：当一个 CJS 包入口形如：
 *   ```
 *   if (process.env.NODE_ENV === 'production') {
 *     module.exports = require('./xxx.production.js');
 *   } else {
 *     module.exports = require('./xxx.development.js');
 *   }
 *   ```
 * 消费者顶层捕获 `var X = require('pkg')` 时，PuerTS 的模块缓存
 * （`Content/JavaScript/puerts/modular.js` `executeModule` 中的 `module.exports` 引用）
 * 在内层 require 重新赋值前已被消费者拿到，因此消费者得到的是空对象 `{}`，
 * 后续访问 `X.someExport` 全部 undefined。
 *
 * - immer 10.x：`dist/cjs/index.js` 走 dev/prod 重导出 → zustand/middleware/immer.js
 *   顶层 `var immer$1 = require('immer')` 拿到 `{}`，调用 `produce` 报
 *   `immer$1.produce is not a function`。
 * - react 19：`react/index.js` 同样 `module.exports = require('./cjs/react.development.js')` →
 *   zustand/react.js 顶层 `var React = require('react')` 拿到 `{}`，调用 `React.useCallback` 报
 *   `React.useCallback is not a function`。
 *
 * 解决：在最早期把真实模块加载好，通过 `puerts.registerBuildinModule(name, mod)` 固化为 builtin，
 * 让后续 `require(name)` 在 modular.js 的 `if (moduleName in buildinModule)` 处直接命中完整对象。
 */
export function installCjsReexportShims(): void {
	const puertsObj = (globalThis as { puerts?: { registerBuildinModule?: (name: string, mod: unknown) => void } })
		.puerts;
	const register = puertsObj?.registerBuildinModule;
	if (!register) return;

	/* eslint-disable @typescript-eslint/no-require-imports */
	// `.js` 扩展名会禁用 PuerTS 的 node_modules 目录冒泡。去掉扩展名让加载器自动补 .js 并向上冒泡到 TestPuerTS/node_modules/
	register.call(puertsObj, 'react', require('react/cjs/react.development'));
	register.call(puertsObj, 'immer', require('immer/dist/cjs/immer.cjs.development'));
	/* eslint-enable @typescript-eslint/no-require-imports */
}
