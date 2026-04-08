import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { viteSingleFile } from 'vite-plugin-singleFile'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
  viteSingleFile()
  ],
  base: './',
  build: {
    target: 'es2015',
    minify: true
  },
  resolve: {
    alias: {

      "@indexes": path.resolve(__dirname, "src/app/indexes"),
      "@layers": path.resolve(__dirname, "src/app/layers"),
      "@scenes": path.resolve(__dirname, "src/app/scenes"),
      "@assets": path.resolve(__dirname, "src/assets"),
      "@components": path.resolve(__dirname, "src/components"),
      "@carousel": path.resolve(__dirname, "src/components/primitives/carousel"),
      "@button": path.resolve(__dirname, "src/components/primitives/button"),
      "@drag": path.resolve(__dirname, "src/components/primitives/drag"),
      "@slider": path.resolve(__dirname, "src/components/primitives/slider"),
      "@primitives": path.resolve(__dirname, "src/components/primitives"),
      "@config": path.resolve(__dirname, "src/config"),
      "@types": path.resolve(__dirname, "src/types"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@debug": path.resolve(__dirname, "src/debug"),
      "@interaction": path.resolve(__dirname, "src/interaction"),
      "@styles": path.resolve(__dirname, "src/styles")
    }
  }
})
