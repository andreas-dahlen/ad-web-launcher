import type { TokenGroup } from "../types/compiler.types";

export function assertHasCssPath(
  group: TokenGroup,
): asserts group is TokenGroup & { cssPath: string } {
  if (!group.cssPath) {
    throw new Error(
      `Invariant violated: Token group "${group.groupPath}" has no cssPath.`,
    );
  }
}