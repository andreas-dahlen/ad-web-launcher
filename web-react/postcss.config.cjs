module.exports = {
  plugins: [
    require('postcss-import'),
    require('postcss-nested'),
    require('./src/shared/styleSystem/compiler/index.cjs')({
      tokensDir: './src/shared/styleSystem/tokens'
    })
  ]
}