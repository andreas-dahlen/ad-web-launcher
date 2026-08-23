import type { RuntimePress, RuntimePressRelease, RuntimeSwipe, RuntimeCommit, RuntimeStart } from '@interaction/types/runtime/runtime.types';
import { merge } from '@test/testUtils/factory.utils';
import { event_DEFAULT } from '@test/app/interaction/fixtures/runtimeEvents.fixture';

export function createRuntimePress(
  overrides: Record<string, unknown> = {}
): RuntimePress {
  return merge(event_DEFAULT.press, overrides)
}
export function createRuntimeswipeStart(
  overrides: Record<string, unknown> = {}
): RuntimeStart {
  return merge(event_DEFAULT.swipeStart, overrides)
}
export function createRuntimeSwipe(
  overrides: Record<string, unknown> = {}
): RuntimeSwipe {
  return merge(event_DEFAULT.swipe, overrides)
}
export function createRuntimeSwipeCommit(
  overrides: Record<string, unknown> = {}
): RuntimeCommit {
  return merge(event_DEFAULT.swipeCommit, overrides)
}
export function createRuntimePressRelease(
  overrides: Record<string, unknown> = {}
): RuntimePressRelease {
  return merge(event_DEFAULT.pressRelease, overrides)
}