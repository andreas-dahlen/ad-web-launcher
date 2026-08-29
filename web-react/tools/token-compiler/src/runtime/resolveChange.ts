import path from 'node:path';
import { formatLogPath } from '../utils/string.js';

type ChangeType = 'CSS' | 'TOKEN'
export function whatChanged(filePath: string, tokenPath: string): ChangeType | null {

  if (isCssFile(filePath)) {
    console.log('CSS change:', formatLogPath(filePath))
    return 'CSS'
  }
  if (isTokenFile(filePath, tokenPath)) {
    console.log('Token change:', formatLogPath(filePath))
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