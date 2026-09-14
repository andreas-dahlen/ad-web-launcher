import type { FormatPatchResult, GroupMetadata } from '../../../types/emitter.types.ts'

export function formatPathPatches(metadata: GroupMetadata[]): FormatPatchResult[] {
  const files: FormatPatchResult[] = []

  const basePath = "file://wsl.localhost/Ubuntu"

  for (const data of metadata) {

    const cssFile = `${basePath}${data.cssFile}`
    for (const tokenPath of data.tokenFiles) {
      if (!tokenPath.endsWith(".jsonc")) continue
      files.push({
        outputFile: tokenPath,
        content: createFileComment(cssFile, "jsonc"),
        kind: "jsonc"
      })
    }

    if (!data.cssFile.endsWith(".css")) continue
    const tokenPaths = data.tokenFiles
      .map(file => `${basePath}${file}`).join("\n")

    files.push({
      outputFile: data.cssFile,
      content: createFileComment(tokenPaths, "css"),
      kind: "css"
    })

  }
  return files
}

function createFileComment(file: string, type: "css" | "jsonc") {

  return type === "css"
    ? `/* \n${file}\n*/`
    : `// ${file}`
}