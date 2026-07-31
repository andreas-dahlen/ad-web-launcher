import type { CompilerToken } from '@styleTokens/types/compiler.types';
import validate from './validateJson.ts';

export default function validateDuplicateVars(tokens: CompilerToken[]) {
  const seenVariables = new Map<string, { tokenPath: string }>();

  for (const token of tokens) {
    for (const variable of token.vars) {
      const identity = `${token.name}:${token.infix}:${variable.name}`;
      if (seenVariables.has(identity)) {

        const previous = seenVariables.get(identity);

        validate.duplicates(previous, identity, token.tokenPath)

      }

      seenVariables.set(identity, {
        tokenPath: token.tokenPath
      })
    }
  }
}