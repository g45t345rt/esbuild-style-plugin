import 'jest'
import * as esbuild from 'esbuild'
import path from 'path'

import stylePlugin from '../../src'

const basePath = './test/postcss_config_file'

test('PostCSS plugins', async () => {
  await esbuild.build({
    entryPoints: [path.join(basePath, 'src/index.ts')],
    outdir: path.join(basePath, 'dist'),
    bundle: true,
    plugins: [stylePlugin({
      postcssConfigFile: path.resolve(__dirname, 'postcss.config.js')
    })]
  })
})