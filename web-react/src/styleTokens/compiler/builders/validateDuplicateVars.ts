import { formatLogPath } from '../../utils/string.ts';
import type { CompilerToken } from '../../types/compiler.types.ts';

export function validateDuplicateVars(tokens: CompilerToken[]) {
  const seenVariables = new Map<string, { tokenPath: string }>();

  for (const token of tokens) {

    for (const variable of token.vars) {

      const identity = `${token.name}:${token.infix}:${variable.cssName}`

      if (seenVariables.has(identity)) {

        const previous = seenVariables.get(identity);


        throw new Error(
          [`❌ CSS variable identity collision!`,
            `\nGenerated identity:`,
            `   ${identity}`,
            `\nSources:`,
            `     ${formatLogPath(token.tokenPath)}`,
            `     ${previous && formatLogPath(previous.tokenPath)}\n`
          ].join("\n")
        );

      }

      seenVariables.set(identity, {
        tokenPath: token.tokenPath
      })
    }
  }
}