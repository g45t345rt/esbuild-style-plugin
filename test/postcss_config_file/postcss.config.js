const autoprefixer = require('autoprefixer')
const presetEnv = require('postcss-preset-env')
const scss = require('postcss-scss')
const skipInlineComments = require('postcss-strip-inline-comments')

module.exports = {
  parser: scss,
  plugins: [
    skipInlineComments,
    autoprefixer,
    presetEnv
  ]
}
