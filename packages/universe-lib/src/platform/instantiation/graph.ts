export class Node<T> {
	readonly incoming = new Map<string, Node<T>>();
	readonly outgoing = new Map<string, Node<T>>();

	constructor(
		readonly key: string,
		readonly data: T,
	) {}
}

export class Graph<T> {
	private readonly _nodes = new Map<string, Node<T>>();

	constructor(private readonly _hashFn: (data: T) => string) {}

	roots(): Node<T>[] {
		const ret: Node<T>[] = [];
		this._nodes.forEach((node) => {
			if (node.incoming.size === 0) {
				ret.push(node);
			}
		});
		return ret;
	}

	leaves(): Node<T>[] {
		const ret: Node<T>[] = [];
		this._nodes.forEach((node) => {
			if (node.outgoing.size === 0) {
				ret.push(node);
			}
		});
		return ret;
	}

	insertEdge(from: T, to: T): void {
		const fromNode = this.lookupOrInsertNode(from);
		const toNode = this.lookupOrInsertNode(to);
		fromNode.outgoing.set(this._hashFn(to), toNode);
		toNode.incoming.set(this._hashFn(from), fromNode);
	}

	removeNode(data: T): void {
		const key = this._hashFn(data);
		this._nodes.delete(key);
		this._nodes.forEach((node) => {
			node.outgoing.delete(key);
			node.incoming.delete(key);
		});
	}

	lookupOrInsertNode(data: T): Node<T> {
		const key = this._hashFn(data);
		let node = this._nodes.get(key);
		if (!node) {
			node = new Node(key, data);
			this._nodes.set(key, node);
		}
		return node;
	}

	lookup(data: T): Node<T> | undefined {
		return this._nodes.get(this._hashFn(data));
	}

	isEmpty(): boolean {
		return this._nodes.size === 0;
	}

	toString(): string {
		const data: string[] = [];
		this._nodes.forEach((value, key) => {
			data.push(
				`${key}\n\t(-> incoming)[${[...value.incoming.keys()].join(', ')}]\n\t(outgoing ->)[${[...value.outgoing.keys()].join(',')}]\n`,
			);
		});
		return data.join('\n');
	}

	/**
	 * 找到一个环
	 */
	findCycleSlow(): T[] | undefined {
		const ret: T[] = [];
		const visited = new Set<string>();

		const doFindCycle = (node: Node<T>): boolean => {
			if (visited.has(node.key)) {
				return false;
			}
			visited.add(node.key);
			ret.push(node.data);
			for (const outgoing of node.outgoing.values()) {
				if (visited.has(outgoing.key) || doFindCycle(outgoing)) {
					return true;
				}
			}
			ret.pop();
			return false;
		};

		for (const node of this._nodes.values()) {
			if (doFindCycle(node)) {
				return ret;
			}
		}
		return undefined;
	}
}
