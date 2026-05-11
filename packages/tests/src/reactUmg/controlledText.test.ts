import * as puerts from 'puerts';
import * as React from 'react';
import * as UE from 'ue';

import { describe, it, expect, beforeEach, afterEach } from '../testRunner';
import { UEWidget, MockWidgetRoot } from './mockWidgetRoot';
import { render, fireEvent } from './testing';

// 修复目标：受控 *EditableText* 控件，React 推回的 Text 与 widget 当前 Text 相同时
// 不应再次 puerts.merge → SynchronizeWidgetProperties → SetText，否则 SlateEditableText
// 会把光标重置到末尾，造成中间输入跳尾。

interface MergeCall {
	target: unknown;
	props: Record<string, unknown>;
}

// 一次性拿到真实的 puerts.merge，避免 testRunner 在断言失败时不跑 afterEach 导致 spy 嵌套
const REAL_MERGE: typeof puerts.merge = puerts.merge;
let mergeCalls: MergeCall[] = [];

function installMergeSpy(): void {
	mergeCalls = [];
	(puerts as unknown as { merge: typeof puerts.merge }).merge = ((
		target: unknown,
		props: Record<string, unknown>,
	) => {
		mergeCalls.push({ target, props });
		return REAL_MERGE.call(puerts, target as never, props as never);
	}) as typeof puerts.merge;
}

function restoreMergeSpy(): void {
	(puerts as unknown as { merge: typeof puerts.merge }).merge = REAL_MERGE;
}

function wroteTextTo(target: unknown): boolean {
	return mergeCalls.some((c) => c.target === target && 'Text' in c.props);
}

describe('UEWidget - MultiLineEditableTextBox echo skip', () => {
	beforeEach(() => installMergeSpy());
	afterEach(() => restoreMergeSpy());

	it('GetText 与 SetText 在 commandlet 环境下可双向访问', () => {
		const w = new UEWidget('MultiLineEditableTextBox', { Text: 'hello' });
		const n = w.nativePtr as UE.MultiLineEditableTextBox;
		n.SetText('foo');
		expect(n.GetText()).toBe('foo');
	});

	it('echo: React 推回的 Text 等于 widget 当前 Text 时跳过 puerts.merge 写 Text', () => {
		const root = new MockWidgetRoot();
		const w = new UEWidget('MultiLineEditableTextBox', { Text: 'hello' });
		root.appendChild(w);
		const n = w.nativePtr as UE.MultiLineEditableTextBox;

		// 模拟用户在 widget 中间插入字符 → Slate 端把文本更新到 'heXllo'
		n.SetText('heXllo');
		expect(n.GetText()).toBe('heXllo');

		mergeCalls.length = 0;
		// React 重新 render，把同样的字符串作为 newProps.Text 推回
		w.updateProps({ Text: 'hello' }, { Text: 'heXllo' });

		expect(wroteTextTo(n)).toBe(false);
	});

	it('non-echo: React 推回的 Text 与 widget 当前 Text 不同时仍走 puerts.merge', () => {
		const w = new UEWidget('MultiLineEditableTextBox', { Text: 'hello' });
		const n = w.nativePtr as UE.MultiLineEditableTextBox;
		// 让 widget 当前 Text 与 oldProps.Text 一致
		n.SetText('hello');

		mergeCalls.length = 0;
		w.updateProps({ Text: 'hello' }, { Text: 'world' });

		const wroteWorld = mergeCalls.some((c) => c.target === n && c.props.Text === 'world');
		expect(wroteWorld).toBe(true);
	});

	it('EditableTextBox 单行也命中 echo skip', () => {
		const w = new UEWidget('EditableTextBox', { Text: 'a' });
		const n = w.nativePtr as UE.EditableTextBox;
		n.SetText('aZ');

		mergeCalls.length = 0;
		w.updateProps({ Text: 'a' }, { Text: 'aZ' });

		expect(wroteTextTo(n)).toBe(false);
	});

	// ------------------------------------------------------------------
	// 关键回归：Text echo + 其它 prop 同时变化
	// 当下 fix 仅过滤掉 Text，但仍会 puerts.merge(其它 prop) → SynchronizeWidgetProperties。
	// SynchronizeProperties 在 C++ 内会调 MyEditableTextBlock->SetText(this->Text)。
	// 如果 UPROPERTY widget.Text 在 echo 跳过期间没被同步到 React 的最新值（仍是初值），
	// SynchronizeProperties 就会用旧 UPROPERTY 文本去覆盖 Slate 真实文本，光标乱跳。
	// ------------------------------------------------------------------
	// ------------------------------------------------------------------
	// REGRESSION：用户报告 fix 之后光标仍跳尾的真实场景
	// ------------------------------------------------------------------
	// PromptArea 用的 `TextArea` 包装内部每次 render 都 `mergeDeep(DEFAULT_INPUT_STYLE, WidgetStyle)`，
	// 生成新对象引用 —— 这是 React 用户层很常见的写法。
	//
	// 而 `updateProps` 当前用浅比较 `oldProp !== newProp` 判定 prop 是否变化，所以即使
	// WidgetStyle 内容完全相同，引用变了就会被纳入 `myProps`。`filterEditableTextEcho` 只把
	// Text 删掉 → `propsForMerge` 仍非空（含 WidgetStyle/TextStyle）→ 仍 `puerts.merge` +
	// `UE.UMGManager.SynchronizeWidgetProperties`，UE 端 `SynchronizeProperties()` 无条件调
	// `MyEditableTextBlock->SetText(Text)`，Slate 内部 `JumpTo(EndOfDocument)` 把光标跳尾。
	it('regression: 同一内容的 WidgetStyle 在每次 rerender 都换新引用时，echo 路径不应触发 puerts.merge', () => {
		const w = new UEWidget('MultiLineEditableTextBox', {
			Text: 'hello',
			WidgetStyle: { Padding: { Left: 0, Top: 0, Right: 0, Bottom: 0 } },
		});
		const n = w.nativePtr as UE.MultiLineEditableTextBox;

		// 模拟用户输入字符 → Slate 内部 'heXllo'，UPROPERTY Text 也被 UMG HandleOnTextChanged 同步
		n.SetText('heXllo');
		expect(n.GetText()).toBe('heXllo');

		mergeCalls.length = 0;
		// React rerender：Text 推回 'heXllo'（echo），WidgetStyle 内容相同但是新对象引用
		w.updateProps(
			{ Text: 'hello', WidgetStyle: { Padding: { Left: 0, Top: 0, Right: 0, Bottom: 0 } } },
			{ Text: 'heXllo', WidgetStyle: { Padding: { Left: 0, Top: 0, Right: 0, Bottom: 0 } } },
		);

		// 期望（修复后）：内容未变的 prop 不被认为是变化 → propsForMerge 为空 → 不调 puerts.merge
		// 当前实现：myProps 含 WidgetStyle（新引用），filterEditableTextEcho 只删 Text，
		// propsForMerge 非空 → 仍调 puerts.merge → SynchronizeProperties → SetText → 光标跳尾
		expect(mergeCalls.length).toBe(0);
	});

	it('echo + 其它 prop 同时变化：UPROPERTY Text 应同步到新值，避免 SynchronizeProperties 用旧值覆盖 Slate', () => {
		const w = new UEWidget('MultiLineEditableTextBox', { Text: 'hello', HintText: 'h0' });
		const n = w.nativePtr as UE.MultiLineEditableTextBox;
		expect(n.Text).toBe('hello'); // init 时 puerts.merge 写入 UPROPERTY

		// 用户输入字符 → Slate 内部 'heXllo'，UPROPERTY 仍是 'hello'
		n.SetText('heXllo');
		expect(n.GetText()).toBe('heXllo');

		mergeCalls.length = 0;
		// React 推回：Text='heXllo'（echo）+ HintText='h1'（同时变化）
		w.updateProps({ Text: 'hello', HintText: 'h0' }, { Text: 'heXllo', HintText: 'h1' });

		// fix 应让 UPROPERTY Text 与 Slate 真实文本对齐，防止后续 SynchronizeProperties 用旧值覆盖
		expect(n.Text).toBe('heXllo');
		// 在 commandlet 中 Slate 不 valid，n.GetText 退回 UPROPERTY，所以这里也应为 'heXllo'
		expect(n.GetText()).toBe('heXllo');
	});
});

describe('ReactUMG controlled MultiLineEditableTextBox - 端到端 echo 不写 Text', () => {
	beforeEach(() => installMergeSpy());
	afterEach(() => restoreMergeSpy());

	it('用户中间输入 → OnTextChanged → setState 后，puerts.merge 不会再向 widget 写 Text', () => {
		const Comp: React.FC = () => {
			const [text, setTextS] = React.useState('hello');
			return React.createElement('MultiLineEditableTextBox', {
				Text: text,
				OnTextChanged: setTextS,
			});
		};

		const view = render(React.createElement(Comp));
		const w = view.findByType('MultiLineEditableTextBox');
		const n = w.nativePtr as UE.MultiLineEditableTextBox;

		// 在 commandlet 中没有真实 Slate，OnTextChanged broadcast 不会自动更新 widget.Text；
		// 我们手动模拟：用户输入字符 X 在位置 2 → widget 内部文本变 'heXllo'
		n.SetText('heXllo');
		expect(n.GetText()).toBe('heXllo');

		mergeCalls.length = 0;
		view.act(() => {
			fireEvent.textChanged(w, 'heXllo');
		});

		// fix 生效：updateProps 阶段 GetText() === 'heXllo' === newProps.Text → 跳过 merge
		expect(wroteTextTo(n)).toBe(false);
	});
});
