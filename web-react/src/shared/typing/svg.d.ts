declare module '*.svg?react' {
  import * as React from 'react';
  const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

declare interface AndroidBridge {
  openApp(packageName: string): void
  // add other methods as you discover them
}

declare const Android: AndroidBridge | undefined