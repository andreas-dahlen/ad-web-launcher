import type { FormatResult } from '../generateOutput.ts';
import type { GroupMetadata } from '../../extract/assemblers/assembleMetadata.ts';
export function formatTokenPatch(metadata: GroupMetadata[]): FormatResult[] {
  const files: FormatResult[] = []

  const basePath = "file://wsl.localhost/Ubuntu"

  for (const data of metadata) {

    const cssFile = `${basePath}${data.cssFile}`
    for (const tokenPath of data.tokenFiles) {
      if (!tokenPath.endsWith(".jsonc")) continue
      files.push({
        filePath: tokenPath,
        content: createFileComment(cssFile, "jsonc")
      })
    }

    if (!data.cssFile.endsWith(".css")) continue
    const tokenPaths = data.tokenFiles
      .map(file => `${basePath}${file}`).join("\n")

    files.push({
      filePath: data.cssFile,
      content: createFileComment(tokenPaths, "css")
    })

  }
  return files
}

function createFileComment(file: string, type: "css" | "jsonc") {

  return type === "css"
    ? `/* \n${file}\n*/`
    : `// ${file}`
}