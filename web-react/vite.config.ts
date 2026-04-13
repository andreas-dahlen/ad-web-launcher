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
      '@scenes': fromRoot('src/app/scenes'),
      '@assets': fromRoot('src/assets'),
      '@components': fromRoot('src/components'),
      '@hooks': fromRoot('src/components/hooks'),
      '@carousel': fromRoot('src/components/primitives/carousel'),
      '@button': fromRoot('src/components/primitives/button'),
      '@drag': fromRoot('src/components/primitives/drag'),
      '@slider': fromRoot('src/components/primitives/slider'),
      '@primitives': fromRoot('src/components/primitives'),
      '@config': fromRoot('src/config'),
      '@utils': fromRoot('src/config/utils'),
      '@typeScript': fromRoot('src/typeScript'),
      '@debug': fromRoot('src/debug'),
      '@interaction': fromRoot('src/interaction'),
      '@stores': fromRoot('src/interaction/stores'),
      '@styles': fromRoot('src/styles')
    }
  }
})
