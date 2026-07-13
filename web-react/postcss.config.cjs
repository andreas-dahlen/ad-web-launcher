module.exports = {
  plugins: [
    // require('postcss-import'),
    // require('postcss-nested'),
    require('./src/styleCompiler/compiler/index.cjs')({
      tokensDir: './src/styleCompiler/tokens'
    })
  ]
}