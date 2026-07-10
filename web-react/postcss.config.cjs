module.exports = {
  plugins: [
    require('postcss-import'),
    require('postcss-nested'),
    require('./src/styleSystem/compiler/index.cjs')({
      tokensDir: './src/styleSystem/tokens'
    })
  ]
}