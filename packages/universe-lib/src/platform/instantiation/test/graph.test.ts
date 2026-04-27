import { beforeEach } from 'vitest';
import * as assert from 'assert';

import { Graph, Node } from '../graph';

suite('Graph', () => {
	let graph: Graph<number>;

	beforeEach(() => {
		graph = new Graph((data) => data.toString());
	});

	test('should insert nodes and edges', () => {
		const node1 = graph.lookupOrInsertNode(1);
		const node2 = graph.lookupOrInsertNode(2);
		const node3 = graph.lookupOrInsertNode(3);

		assert.ok(node1 instanceof Node);
		assert.ok(node2 instanceof Node);
		assert.ok(node3 instanceof Node);

		graph.insertEdge(1, 2);
		graph.insertEdge(2, 3);

		assert.strictEqual(node1.outgoing.size, 1);
		assert.strictEqual(node1.outgoing.get('2'), node2);
		assert.strictEqual(node2.incoming.size, 1);
		assert.strictEqual(node2.incoming.get('1'), node1);
		assert.strictEqual(node2.outgoing.size, 1);
		assert.strictEqual(node2.outgoing.get('3'), node3);
		assert.strictEqual(node3.incoming.size, 1);
		assert.strictEqual(node3.incoming.get('2'), node2);
	});

	test('should remove nodes and edges', () => {
		graph.lookupOrInsertNode(1);
		graph.lookupOrInsertNode(2);
		graph.lookupOrInsertNode(3);
		graph.insertEdge(1, 2);
		graph.insertEdge(2, 3);

		graph.removeNode(2);

		assert.strictEqual(graph.lookup(2), undefined);
		assert.strictEqual(graph.lookup(1)?.outgoing.size || 0, 0);
		assert.strictEqual(graph.lookup(3)?.incoming.size || 0, 0);
	});

	test('should find roots', () => {
		graph.lookupOrInsertNode(1);
		graph.lookupOrInsertNode(2);
		graph.lookupOrInsertNode(3);
		graph.insertEdge(1, 2);
		graph.insertEdge(2, 3);

		const roots = graph.roots();

		assert.strictEqual(roots.length, 1);
		assert.strictEqual(roots[0].data, 1);
	});

	test('root', () => {
		graph.insertEdge(1, 2);
		let roots = graph.roots();
		assert.strictEqual(roots.length, 1);
		assert.strictEqual(roots[0].data, 1);

		graph.insertEdge(2, 1);
		roots = graph.roots();
		assert.strictEqual(roots.length, 0);
	});

	test('root complex', () => {
		graph.insertEdge(1, 2);
		graph.insertEdge(1, 3);
		graph.insertEdge(3, 4);

		const roots = graph.roots();
		assert.strictEqual(roots.length, 1);
	});

	test('should check if it is empty', () => {
		assert.ok(graph.isEmpty());
		graph.lookupOrInsertNode(1);
		assert.ok(!graph.isEmpty());
	});

	test('should find a cycle', () => {
		graph.lookupOrInsertNode(1);
		graph.lookupOrInsertNode(2);
		graph.lookupOrInsertNode(3);
		graph.insertEdge(1, 2);
		graph.insertEdge(2, 3);
		graph.insertEdge(3, 1);

		const cycle = graph.findCycleSlow();
		assert.deepStrictEqual(cycle, [1, 2, 3]);
	});

	test('should not find a cycle', () => {
		graph.lookupOrInsertNode(1);
		graph.lookupOrInsertNode(2);
		graph.lookupOrInsertNode(3);
		graph.insertEdge(1, 2);
		graph.insertEdge(2, 3);

		const cycle = graph.findCycleSlow();
		assert.strictEqual(cycle, undefined);
	});
});
