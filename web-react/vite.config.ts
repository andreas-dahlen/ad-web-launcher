import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { viteSingleFile } from 'vite-plugin-singleFile'
import path from 'path'
import svgr from "vite-plugin-svgr";

const fromRoot = (relativePath: string) => path.resolve(__dirname, relativePath)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), viteSingleFile(), svgr()],
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
      '@config': fromRoot('src/config'),
      '@data': fromRoot('src/data'),
      '@features': fromRoot('src/features'),
      '@interaction': fromRoot('src/interaction'),
      '@primitives': fromRoot('src/primitives'),
      '@composites': fromRoot('src/composites'),

      '@stores': fromRoot('src/shared/state/stores'),
      '@hooks': fromRoot('src/shared/state/hooks'),
      '@typing': fromRoot('src/shared/typing'),
      '@styles': fromRoot('src/shared/styles'),
      '@utils': fromRoot('src/shared/utils'),
      '@infrastructure': fromRoot('src/infrastructure'),
      '@test': fromRoot('src/test')
    }
  }
})
