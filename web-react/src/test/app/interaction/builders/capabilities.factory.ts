import type { Capabilities } from '@interaction/types/descriptor/base.types';
import { merge } from '@test/testUtils/factory.utils';
import { capabilities_DEFAULT } from '@test/app/interaction/fixtures/capabilities.fixture';

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