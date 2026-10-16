import type { LoadHandler } from '../loaders/loadHandler.ts';
import picomatch from 'picomatch';

export function getMatchers(loader: LoadHandler) {
  return {
    patterns: loader.getExcludePatterns()
      .map((pattern) => picomatch(pattern, { dot: true })),

    fileExcludes: loader.getFileExcludes()
      .map((pattern) => picomatch(pattern, { dot: true })),
  }
}