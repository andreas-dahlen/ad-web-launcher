import validate from '../validation/validateJson.ts';
import findTokenPaths from './findTokenPaths.ts';
import loadToken, { type LoadedToken } from './getToken.ts';

export default function getTokens(tokensDir: string): LoadedToken[] {
  const files = findTokenPaths(tokensDir)
  const seenVariables = new Map<string, { fullPath: string }>();

  return files.map(fullPath => {
    const token = loadToken(fullPath);

    for (const variable of token.vars) {

      const identity = `${token.name}:${token.infix}:${variable.name}`;

      if (seenVariables.has(identity)) {
        const previous = seenVariables.get(identity);
        validate.duplicates(previous, identity, fullPath)
      }

      seenVariables.set(identity, {
        fullPath
      })
    }
    return token
  })
};