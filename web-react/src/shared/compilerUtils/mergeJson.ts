import type { RawComponent } from './compiler.types';

export function mergeJson(...parts: RawComponent[]) {
  return {
    component: parts[0].component,
    infix: parts[0].infix,
    alwaysAllowed: parts.flatMap(part => part.alwaysAllowed ?? []),
    vars: Object.assign({}, ...parts.map(part => part.vars)),
  };
}