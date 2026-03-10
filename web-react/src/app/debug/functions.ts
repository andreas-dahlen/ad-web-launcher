import { DEBUG } from './debugFlags'

type DebugKey = keyof typeof DEBUG.channels

// Universal log function that respects DEBUG settings.
export function log(key: DebugKey, ...args: unknown[]): void {

  //critical channels
  if (DEBUG.channels[key] === 'always') {
      console.log(format(key), ...args)
      return
}

  // Normal debug-gated logging
  if (!DEBUG.enabled) return
  if (!DEBUG.channels[key]) return

  console.log(format(key), ...args)
}

function format(key: DebugKey): string {
  const time = new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
  })
  return `[${time}] [${key}]`
}

// Draw using raw screen pixels only.
export function drawDots(x: number, y: number, color: string = 'red'): void {
  if (DEBUG.enabled && DEBUG.channels.drawDots) {
    const dot = document.createElement('div')
    dot.style.position = 'fixed'
    dot.style.left = `${x - 6}px`
    dot.style.top = `${y - 6}px`
    dot.style.width = '12px'
    dot.style.height = '12px'
    dot.style.borderRadius = '50%'
    dot.style.background = color
    dot.style.pointerEvents = 'none'
    dot.style.zIndex = '99999'

    document.body.appendChild(dot)
    setTimeout(() => dot.remove(), 500)
  }
}