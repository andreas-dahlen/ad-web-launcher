import type { GroupMetadata } from '../../extract/assemblers/assembleMetadata.ts';
import type { FormatResult } from '../generateOutput.ts';

export function formatMetaFile(groups: GroupMetadata[]): FormatResult {

  const content = JSON.stringify(
    {
      groups: Object.fromEntries(
        groups.map(group => [
          group.name,
          {
            cssPath: group.cssFile,
            tokenPaths: group.tokenFiles,
          },
        ]),
      ),

      files: Object.fromEntries(
        groups.flatMap(group => [
          [group.cssFile, group.name],
          ...group.tokenFiles.map(tokenFile => [tokenFile, group.name]),
        ]),
      ),
    },
    null,
    2,
  )

  return {
    outputFile: groups[0].outputFile,
    content,
  }
}