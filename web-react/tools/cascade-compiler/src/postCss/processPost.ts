import { walkProject } from './resolvers/walkProject.ts';
import type { Root } from 'postcss';
import type { PostData } from '../types/compiler.types.ts';


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
}): PostData {
  void mutate // possible to avoid css mutations
  void trace //possible later trace... no tracing currently though
  const postData = walkProject(root, cssPath)

  return postData
}