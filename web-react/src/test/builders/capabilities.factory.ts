import type { Capabilities } from '@interaction/types/base.types';
import { merge } from '@test/utils/factory.utils';
import { capabilities_DEFAULT } from '@test/fixtures/capabilities.fixture';

export function createPressCapabilities(
  overrides: Partial<Capabilities> = {}): Capabilities {
  return merge(capabilities_DEFAULT.press, overrides)
}
export function createSwipeCapabilities(
  overrides: Partial<Capabilities> = {}): Capabilities {
  return merge(capabilities_DEFAULT.swipe, overrides)
}
export function createInstantCapabilities(
  overrides: Partial<Capabilities> = {}): Capabilities {
  return merge(capabilities_DEFAULT.instant, overrides)
}