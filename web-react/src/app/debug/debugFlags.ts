

export const DEBUG = {
  enabled: import.meta.env.VITE_DEBUG === 'true',

  channels: {
    init: 'always',

    drawDots: false, //this could actually be turned into a nice visual heptic feedback thingie majingie
    lagTime: false,
    swipe: false,
    dom: false,
    input: false,
    adapter: false,
    drag: false,
    resolver: false,
    delegator: false
  }
} as const