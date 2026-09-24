import fs from "node:fs"
import path from "node:path"
import { createIssueCollector, type IssueCollector } from '../../diagnostics/issueCollector.ts'
import type { TokenPathsAndIssues } from '../../types/compiler.types.ts'

export function findTokenPaths(target: string): TokenPathsAndIssues {
  const collector = createIssueCollector()
  collector.setSubject("Token Path resolution")
  collector.scope({
    path: target,
    value: target
  })

  const paths = findPaths(path.resolve(target), collector)

  return {
    tokenPaths: paths.toSorted((a, b) => a.localeCompare(b)),
    issues: collector.flush()
  }

  function findPaths(
    target: string,
    collector: IssueCollector,
  ): string[] {

    try {
      const stat = fs.statSync(target);
      if (stat.isFile() && isTokenFile(target)) return [target];
    } catch (error) {
      collector.set({
        value: String(error),
        reason: "couldn't resolve tokenPath"
      })
      return []
    }

    try {

      return fs.readdirSync(target, { withFileTypes: true })
        .flatMap(entry => {
          const fullPath = path.join(target, entry.name);

          if (entry.isDirectory()) {
            return findPaths(fullPath, collector);
          }

          if (entry.isFile() && isTokenFile(entry.name)) {
            return [fullPath];
          }

          return [];
        })
    } catch (error) {
      collector.set({
        value: String(error),
        reason: "wouldn't read tokenFilePath"
      })
      return []
    }

  }

  function isTokenFile(filePath: string): boolean {
    return filePath.endsWith(".json") ||
      filePath.endsWith(".jsonc");
  }
}



