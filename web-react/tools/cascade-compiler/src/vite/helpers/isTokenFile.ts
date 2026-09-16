import path from 'node:path'

export function isTokenFile(tokenDir: string, tokenPath: string): boolean {
  const relative = path.relative(tokenDir, tokenPath)

  return (
    !relative.startsWith('..') &&
    !path.isAbsolute(relative) &&
    (tokenPath.endsWith('.json') || tokenPath.endsWith('.jsonc'))
  )
}