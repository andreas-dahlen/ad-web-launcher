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
  mutate = true
}: {
  root: Root,
  cssPath: string,
  mutate?: boolean
}): PostData {
  void mutate
  const postData = walkProject(root, cssPath)

  return postData
}