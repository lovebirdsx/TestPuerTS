export function formatUnknown(value: unknown): string {
	if (value === undefined || value === null) return '';
	try {
		return JSON.stringify(value, undefined, 2);
	} catch {
		return String(value);
	}
}

export function shortId(id: string): string {
	return id.length > 12 ? `${id.slice(0, 12)}...` : id;
}
