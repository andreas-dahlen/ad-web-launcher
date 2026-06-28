/// <reference types="vite/client" />

interface String {
  // This tricks the type-checker into believing any string matching our pattern 
  // is inherently a valid key lookup across your workspace
  [key: `${string}Class`]: string;
}