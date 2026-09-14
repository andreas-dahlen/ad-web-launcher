/**
 * HELPER: Simple resolver function to pull an icon component
 * cleanly by its registered string name.
*/
export * from './external.ts';
export * from './system.ts';

// Automatically builds a union type: 'settings' | 'home' | 'bomb' etc.


//currently unused.... TODO remove?
export type IconName = keyof typeof import('.');
