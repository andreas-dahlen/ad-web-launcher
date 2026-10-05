export function cpsx<P extends string>(
  presets: P | P[] | undefined,
  css: Record<string, string>,
): string {
  const values = presets ? (Array.isArray(presets) ? presets : [presets]) : [];

  return values.map(p => css[p]).filter(Boolean).join(" ");
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