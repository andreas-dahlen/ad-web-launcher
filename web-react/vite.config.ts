import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { viteSingleFile } from 'vite-plugin-singleFile'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
  viteSingleFile()
  ],
    base: './',
  build: {
    target: 'es2015',
    minify: true
  }
})
