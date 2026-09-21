import type { Config, Match, PreparedMatches } from '../types/all.types.ts';

export function createMatchingTable(config: Config): PreparedMatches {

  const triggers = new Set<string>()
  const byTrigger = new Map<string, Match[]>()

  for (const [key, suggestions] of Object.entries(config.suggestions)) {
    const trimmedKey = key.trim()
    const trigger = trimmedKey.slice(-1)
    const current = byTrigger.get(trigger)
    triggers.add(trigger)

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