import { hasBasePath } from '../utils/comparePaths.ts'
import type { ExcludeOrInclude } from '../types/core.types.ts'


export function compress(
  resolutionData: Map<string, ExcludeOrInclude>,
): Record<string, true> {

  const filtered = filter(resolutionData)

  return reduse(filtered)
}

function filter(
  data: Map<string, ExcludeOrInclude>,
): Set<string> {
  const exclude = new Set<string>()

  for (const [path, type] of data) {
    if (type === 'include') {
      continue
    }
    exclude.add(path)
  }
  return exclude
}

function reduse(filtered: Set<string>): Record<string, true> {

  const exclude: Record<string, true> = {}

  for (const path of filtered) {
    if (hasBasePath(filtered, path)) {
      continue
    }
    exclude[path] = true
  }

  return exclude
}