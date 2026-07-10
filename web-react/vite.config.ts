import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { viteSingleFile } from 'vite-plugin-singlefile'
import path from 'path'
import svgr from "vite-plugin-svgr";
import tokenWatcher from './vite.token-watcher'

const fromRoot = (relativePath: string) => path.resolve(__dirname, relativePath)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), viteSingleFile(), svgr(), tokenWatcher()],
  base: './',
  build: {
    target: 'es2015',
    minify: true
  },
  resolve: {
    alias: {
      '@api': fromRoot('src/api'),
      '@app': fromRoot('src/app'),
      '@assets': fromRoot('src/assets'),
      '@blocks': fromRoot('src/blocks'),
      '@composites': fromRoot('src/composites'),
      '@config': fromRoot('src/config'),
      '@data': fromRoot('src/data'),
      '@features': fromRoot('src/features'),
      '@interaction': fromRoot('src/interaction'),
      '@panels': fromRoot('src/panels'),
      '@primitives': fromRoot('src/primitives'),

      '@stores': fromRoot('src/shared/state/stores'),
      '@hooks': fromRoot('src/shared/state/hooks'),
      '@typing': fromRoot('src/shared/typing'),
      '@styles': fromRoot('src/shared/styles'),
      '@utils': fromRoot('src/shared/utils'),

      '@tokens': fromRoot('src/styleSystem/tokens'),
      '@schema': fromRoot('src/styleSystem/schema'),

      '@test': fromRoot('src/test')
    }
  }
})
