import compiler from './src/styleCompiler/compiler/index.js'
// import postcssImport from 'postcss-import';
// import postcssNested from 'postcss-nested';
export default {
  plugins: [
    // ppostcssImport(),
    // postcssNested(),
    compiler({
      tokensDir: './src/styleCompiler/tokens'
    })
  ]
}