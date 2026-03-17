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
      "@components": path.resolve(__dirname, "src/components"),
      "@config": path.resolve(__dirname, "src/config"),
      "@debug": path.resolve(__dirname, "src/debug"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
      "@interaction": path.resolve(__dirname, "src/interaction"),
      "@layout": path.resolve(__dirname, "src/layout"),
      "@styles": path.resolve(__dirname, "src/styles"),
      "@types": path.resolve(__dirname, "src/types"),
      "@utils": path.resolve(__dirname, "src/utils")
    }
  }
})
