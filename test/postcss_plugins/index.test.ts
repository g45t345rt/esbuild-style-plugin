import 'jest'
import * as esbuild from 'esbuild'
import path from 'path'
import autoprefixer from 'autoprefixer'
import presetEnv from 'postcss-preset-env'

import stylePlugin from '../../src'

const basePath = './test/postcss_plugins'

test('PostCSS plugins', async () => {
  await esbuild.build({
    entryPoints: [path.join(basePath, 'src/index.ts')],
    outdir: path.join(basePath, 'dist'),
    bundle: true,
    plugins: [stylePlugin({
      postcss: [
        autoprefixer,
        presetEnv({ stage: 0 })
      ]
    })]
  })
})