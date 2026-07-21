import compiler from './src/styleCompiler/compiler/index.ts'
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