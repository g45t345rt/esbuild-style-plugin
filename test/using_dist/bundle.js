const esbuild = require('esbuild')

const stylePlugin = require('../../dist/index')

esbuild.build({
  plugins: [
    stylePlugin()
  ]
})