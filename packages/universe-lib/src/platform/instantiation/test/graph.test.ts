import { describe, it, beforeEach, expect } from 'vitest';

import { Graph, Node } from '../graph';

describe('Graph', () => {
	let graph: Graph<number>;

	beforeEach(() => {
		graph = new Graph((data) => data.toString());
	});

	it('should insert nodes and edges', () => {
		const node1 = graph.lookupOrInsertNode(1);
		const node2 = graph.lookupOrInsertNode(2);
		const node3 = graph.lookupOrInsertNode(3);

		expect(node1).toBeInstanceOf(Node);
		expect(node2).toBeInstanceOf(Node);
		expect(node3).toBeInstanceOf(Node);

		graph.insertEdge(1, 2);
		graph.insertEdge(2, 3);

		expect(node1.outgoing.size).toBe(1);
		expect(node1.outgoing.get('2')).toBe(node2);
		expect(node2.incoming.size).toBe(1);
		expect(node2.incoming.get('1')).toBe(node1);
		expect(node2.outgoing.size).toBe(1);
		expect(node2.outgoing.get('3')).toBe(node3);
		expect(node3.incoming.size).toBe(1);
		expect(node3.incoming.get('2')).toBe(node2);
	});

	it('should remove nodes and edges', () => {
		graph.lookupOrInsertNode(1);
		graph.lookupOrInsertNode(2);
		graph.lookupOrInsertNode(3);
		graph.insertEdge(1, 2);
		graph.insertEdge(2, 3);

		graph.removeNode(2);

		expect(graph.lookup(2)).toBe(undefined);
		expect(graph.lookup(1)?.outgoing.size || 0).toBe(0);
		expect(graph.lookup(3)?.incoming.size || 0).toBe(0);
	});

	it('should find roots', () => {
		graph.lookupOrInsertNode(1);
		graph.lookupOrInsertNode(2);
		graph.lookupOrInsertNode(3);
		graph.insertEdge(1, 2);
		graph.insertEdge(2, 3);

		const roots = graph.roots();

		expect(roots.length).toBe(1);
		expect(roots[0].data).toBe(1);
	});

	it('root', () => {
		graph.insertEdge(1, 2);
		let roots = graph.roots();
		expect(roots.length).toBe(1);
		expect(roots[0].data).toBe(1);

		graph.insertEdge(2, 1);
		roots = graph.roots();
		expect(roots.length).toBe(0);
	});

	it('root complex', () => {
		graph.insertEdge(1, 2);
		graph.insertEdge(1, 3);
		graph.insertEdge(3, 4);

		const roots = graph.roots();
		expect(roots.length).toBe(1);
	});

	it('should check if it is empty', () => {
		expect(graph.isEmpty()).toBeTruthy();
		graph.lookupOrInsertNode(1);
		expect(graph.isEmpty()).toBeFalsy();
	});

	it('should find a cycle', () => {
		graph.lookupOrInsertNode(1);
		graph.lookupOrInsertNode(2);
		graph.lookupOrInsertNode(3);
		graph.insertEdge(1, 2);
		graph.insertEdge(2, 3);
		graph.insertEdge(3, 1);

		const cycle = graph.findCycleSlow();
		expect(cycle).toEqual([1, 2, 3]);
	});

	it('should not find a cycle', () => {
		graph.lookupOrInsertNode(1);
		graph.lookupOrInsertNode(2);
		graph.lookupOrInsertNode(3);
		graph.insertEdge(1, 2);
		graph.insertEdge(2, 3);

		const cycle = graph.findCycleSlow();
		expect(cycle).toBe(undefined);
	});
});
