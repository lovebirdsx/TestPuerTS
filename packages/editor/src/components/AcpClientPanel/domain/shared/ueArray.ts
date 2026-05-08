import * as UE from 'ue';

/** 转 react-umg 用的 TArray<string>。 */
export function toTArray(values: string[]): UE.TArray<string> {
	const array = UE.NewArray(UE.BuiltinString);
	values.forEach((value) => array.Add(value));
	return array;
}
