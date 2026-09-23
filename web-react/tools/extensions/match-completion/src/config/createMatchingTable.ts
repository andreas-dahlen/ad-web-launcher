import type { Match, PreparedMatches } from '../types/all.types.ts';

export function createMatchingTable(obj: Record<string, string[]>): PreparedMatches {

  const triggers = new Set<string>()
  const byTrigger = new Map<string, Match[]>()

  for (const [key, suggestions] of Object.entries(obj)) {
    const trimmedKey = key.trim()
    const trigger = trimmedKey.at(0)

    if (!trigger) continue
    triggers.add(trigger)

    const current = byTrigger.get(trigger)
    const match = {
      matcher: trimmedKey,
      suggestions
    }

    if (current) {
      byTrigger.set(trigger, [...current, match])
    } else {
      byTrigger.set(trigger, [match])
    }
  }

  return {
    triggers: [...triggers],
    byTrigger
  }
}