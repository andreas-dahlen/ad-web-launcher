type DataValue = string | number | boolean | null | undefined;
type DataState = Readonly<Record<string, DataValue>>;
type DataAttrs = Record<`data-${string}`, string>;
/** Converts values into data-attribute entries. */
export default function dasx(...states: DataState[]): DataAttrs;
export {};
//# sourceMappingURL=index.d.ts.map