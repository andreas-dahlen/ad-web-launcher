import path from 'node:path';

export type ChangeType = 'CSS' | 'TOKEN'
export function whatChanged(filePath: string, tokenPath: string): ChangeType | null {

  if (isCssFile(filePath)) {
    console.log('CSS:', filePath)
    return 'CSS'
  }
  if (isTokenFile(filePath, tokenPath)) {
    console.log('TOKEN:', filePath)
    return 'TOKEN'
  }
  return null
}

function isTokenFile(
  filePath: string,
  tokenPath: string,
): boolean {

  const relative = path.relative(tokenPath, filePath)

  return (
    !relative.startsWith('..') &&
    !path.isAbsolute(relative) &&
    (filePath.endsWith('.json') || filePath.endsWith('.jsonc'))
  )
}

function isCssFile(filePath: string): boolean {
  return filePath.endsWith(".css")
}