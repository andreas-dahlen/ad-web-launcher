export type ValidPrefix =
  | "o" // Override
  | "s" // State
  | "m" // Mode
  | "p" // Preset
  | "t" // Theme
  | "f"; // Fallback

export type CssVarString = `--${string}`;