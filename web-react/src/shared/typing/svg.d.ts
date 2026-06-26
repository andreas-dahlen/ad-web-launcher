/// <reference types="vite-plugin-svgr/client" />
declare module '*.svg' {
  const src: string;
  export default src;
}

declare interface AndroidBridge {
  openApp(packageName: string): void
  // add other methods as you discover them
}

declare const Android: AndroidBridge | undefined
