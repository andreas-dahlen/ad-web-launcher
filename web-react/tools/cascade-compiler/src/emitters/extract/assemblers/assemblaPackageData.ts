import { extractGroupName } from '../../../compiler/resolvers/extractGroupName.ts';
import type { PackageData } from '../../../types/emitter.types.ts';


export function assemblePackageData(
  groupPaths: string[],
): PackageData {

  const presetNames: string[] = []
  const tokenNames: string[] = []

  for (const groupPath of groupPaths) {
    const name = extractGroupName(groupPath)

    presetNames.push(`${name}.preset`)
    tokenNames.push(`${name}.token`)
  }

  return {
    presetNames,
    tokenNames
  }
}