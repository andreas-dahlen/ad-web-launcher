import type { RuntimePress, RuntimePressRelease, RuntimeRevertOverride, RuntimeSwipe, RuntimeSwipeCommit, RuntimeSwipeStart } from '@interaction/types/runtime.types';
import { merge } from '@test/builders/factory.utils';
import { event_DEFAULT } from '@test/defaults/desc.defaults';

export function createRuntimePress(
  overrides: Record<string, unknown> = {}
): RuntimePress {
  return merge(event_DEFAULT.press, overrides)
}
export function createRuntimeswipeStart(
  overrides: Record<string, unknown> = {}
): RuntimeSwipeStart {
  return merge(event_DEFAULT.swipeStart, overrides)
}
export function createRuntimeSwipe(
  overrides: Record<string, unknown> = {}
): RuntimeSwipe {
  return merge(event_DEFAULT.swipe, overrides)
}
export function createRuntimeSwipeCommit(
  overrides: Record<string, unknown> = {}
): RuntimeSwipeCommit | RuntimeRevertOverride {
  return merge(event_DEFAULT.swipeCommit, overrides)
}
export function createRuntimePressRelease(
  overrides: Record<string, unknown> = {}
): RuntimePressRelease {
  return merge(event_DEFAULT.pressRelease, overrides)
}