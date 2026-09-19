import { walkProject } from './resolvers/walkProject.ts';
import type { Root } from 'postcss';
import type { PostDataResult } from '../types/compiler.types.ts';


export function processPost({
  root,
  cssPath,
  trace,
  mutate = true
}: {
  root: Root
  cssPath: string
  trace: boolean
  mutate?: boolean
}): PostDataResult {
  void mutate // possible to avoid css mutations
  void trace //possible later trace... no tracing currently though
  const PostDataResult = walkProject(root, cssPath)

  return PostDataResult
}