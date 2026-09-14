import { extractGroupName } from '../../../compiler/resolvers/extractGroupName.ts';
import type { PackageData } from '../../../types/emitter.types.ts';


export function assemblePackageData(
  groupPaths: string[],
): PackageData {
  const fileNames = groupPaths.flatMap(groupPath => {
    const name = extractGroupName(groupPath)

    return [
      `presets/${name}.preset.ts`,
      `tokenModules/${name}.token.ts`,
    ]
  })

  return {
    fileNames,
    outputFile: 'index.ts',
  }
}