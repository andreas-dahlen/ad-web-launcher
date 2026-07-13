/**
 * HELPER: Simple resolver function to pull an icon component
 * cleanly by its registered string name.
 */
export * from './external';
export * from './system';

// Automatically builds a union type: 'settings' | 'home' | 'bomb' etc.
export type IconName = keyof typeof import('.');
