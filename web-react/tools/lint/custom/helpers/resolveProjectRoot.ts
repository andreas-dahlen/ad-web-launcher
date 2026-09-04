import path from 'node:path'

type LintSettings = {
  custom?: {
    rootDir?: string
  }
}
export function resolveProjectRoot(
  cwd: string,
  settings: LintSettings,
): string {
  const rootDir = settings.custom?.rootDir ?? '.'

  return path.basename(cwd) === rootDir
    ? cwd
    : path.resolve(cwd, rootDir)
}