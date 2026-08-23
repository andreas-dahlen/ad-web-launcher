import { defineConfig } from 'eslint/config'

import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import unicorn from 'eslint-plugin-unicorn'

export default defineConfig({
  files: ['src/**/*.{ts,tsx}'],

  extends: [
    js.configs.recommended,
    tseslint.configs.recommended,
    reactHooks.configs.flat.recommended,
    reactRefresh.configs.vite,
    unicorn.configs.recommended,
  ],

  languageOptions: {
    ecmaVersion: 2023,
    globals: globals.browser,
  },
})