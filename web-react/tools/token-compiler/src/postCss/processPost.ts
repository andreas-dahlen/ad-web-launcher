import { walkProject } from './resolvers/walkProject.js';
import type { CssVarString } from '../oldSharedUtils/oldSharedCompiler.types.js';
import type { Root } from 'postcss';

export type PostData = {
  cssPath: string;
  variables: CssVarString[];
  oklchVariables: Array<[CssVarString, string]>;
};

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