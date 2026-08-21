// import path from 'path'
// import createTokenIntegration from './plugins/vite.token-integration.ts'
// import { defineConfig } from 'vite'

// const fromRoot = (relativePath: string) =>
//   path.resolve(import.meta.dirname, relativePath)

// const TOKEN_DIR = fromRoot('src/styleTokens/tokens')

// const tokenIntegration = createTokenIntegration(TOKEN_DIR)


// export default defineConfig({
//   css: {
//     postcss: {
//       plugins: [
//         tokenIntegration.postcss
//       ]
//     }
//   },

//   plugins: [
//     tokenIntegration.viteWatcher
//   ]
// })