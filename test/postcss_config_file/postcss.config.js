const autoprefixer = require('autoprefixer')
const presetEnv = require('postcss-preset-env')
const scss = require('postcss-scss')

module.exports = {
  parser: scss,
  plugins: [
    autoprefixer,
    presetEnv
  ]
}
