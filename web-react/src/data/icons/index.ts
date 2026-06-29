// src/components/icons/index.ts

import { external } from '@data/icons/external';
import { system } from '@data/icons/system';

export const Icons = {
  ...external,
  ...system,
} as const;
export type IconName = keyof typeof Icons;

/**
 * HELPER: Simple resolver function to pull an icon component
 * cleanly by its registered string name.
 */
export function getIcon(name: IconName) {
  return Icons[name];
}
