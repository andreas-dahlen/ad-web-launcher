import { initializeCompiler } from '../src/styleTokens/compiler/compilerService.ts';
import createTokenWatcherAdapter from './adapters/vite.token-watcher-adapter.ts';
import createTokenPostCssAdapter from './adapters/postcss.token-adapter.ts';

export default function createTokenIntegration(tokenDir: string) {
  const tokenCompiler = initializeCompiler(tokenDir);

  return {
    viteWatcher: createTokenWatcherAdapter(tokenCompiler),
    postcss: createTokenPostCssAdapter(tokenCompiler),
  };
}