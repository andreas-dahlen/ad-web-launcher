import validate from '../compiler/validation/validateJson.js';
import { findTokenFiles } from './findTokenFiles.js';
import loadToken from './loadToken.js';

export default function loadTokens(tokensDir) {
  const files = findTokenFiles(tokensDir)
  const seenVariables = new Map();

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