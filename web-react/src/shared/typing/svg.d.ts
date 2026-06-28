/// <reference types="vite-plugin-svgr/client" />
declare module '*.svg' {
  const src: string;
  export default src;
}

export type DynamicIconComponent = ComponentType<
  SVGProps<SVGSVGElement> & {
    size?: string | number;
    weight?: string;
    mirrored?: boolean;
  }
>;

declare interface AndroidBridge {
  openApp(packageName: string): void
  // add other methods as you discover them
}

declare const Android: AndroidBridge | undefined
