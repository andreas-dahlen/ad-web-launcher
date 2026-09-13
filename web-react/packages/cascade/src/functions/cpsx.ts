
/** Transforms preset names into CSS module class names */
// export function cpsx<P extends string>(
//   presets: P[] | undefined,
//   map: Record<P, string>
// ): string[] {
//   if (!presets) return []

//   return presets.map(p => map[p])
// }

//TODO possible way to avoid having to spread the return
export function cpsx<P extends string>(
  presets: P[] | undefined,
  map: Record<P, string>
): string {
  return presets?.map(p => map[p]).join(" ") ?? ""
}


/* [USAGE]: mergePresets( buttonPresetMap, presets, !conditional && "presetClassName")
export function mergePresets<
  PresetMap extends Record<string, unknown>
>(
  map: PresetMap,
  base: (keyof PresetMap)[] | undefined,
  ...additions: (keyof PresetMap | false | null | undefined)[]
) {
  return [
    ...(base ?? []),
    ...additions
  ].filter((x): x is keyof PresetMap => {
    if (!x) return false;
    return x in map;
  });
} */