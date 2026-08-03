
/** Transforms preset names into CSS module class names */
export function cpsx<P extends string>(
  presets: P[] | undefined,
  map: Record<P, string | Record<string, string>>
): string[] {
  if (!presets) return [];
  return presets.flatMap(p => {
    const v = map[p];
    return typeof v === "string" ? v : Object.values(v);
  });
}


/** [USAGE]: mergePresets( buttonPresetMap, presets, !conditional && "presetClassName") */
// export function mergePresets<
//   PresetMap extends Record<string, unknown>
// >(
//   map: PresetMap,
//   base: (keyof PresetMap)[] | undefined,
//   ...additions: (keyof PresetMap | false | null | undefined)[]
// ) {
//   return [
//     ...(base ?? []),
//     ...additions
//   ].filter((x): x is keyof PresetMap => {
//     if (!x) return false;
//     return x in map;
//   });
// }