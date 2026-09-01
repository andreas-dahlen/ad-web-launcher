import { walkProject } from './resolvers/walkProject.js';
import type { Root } from 'postcss';
import type { PostData } from '../types/compiler.types.js';


export function processPost({
  root,
  cssPath,
  mute,
  mutate = true
}: {
  root: Root
  cssPath: string
  mute: boolean
  mutate?: boolean
}): PostData {
  void mutate // possible to avoid css mutations
  void mute //possible later mute... nothing to mute now though
  const postData = walkProject(root, cssPath)

  return postData
}