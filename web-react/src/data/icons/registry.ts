// src/components/icons/index.ts

import { externalIcons } from '@data/icons/externals';
import { systemIcons } from '@data/icons/system';

export const IconRegistry = {
  ...systemIcons,
  ...externalIcons,
  ...customIcons
} as const;
export type IconName = keyof typeof IconRegistry;

/**
 * HELPER: Simple resolver function to pull an icon component
 * cleanly by its registered string name.
 */
export function getIcon(name: IconName) {
  return IconRegistry[name];
}