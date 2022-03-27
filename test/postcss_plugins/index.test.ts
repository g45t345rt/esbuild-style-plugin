import 'jest'
import * as esbuild from 'esbuild'
import path from 'path'
import autoprefixer from 'autoprefixer'
import presetEnv from 'postcss-preset-env'

import scss from 'postcss-scss'
import skipInlineComments from 'postcss-strip-inline-comments'

import stylePlugin from '../../src'

const basePath = './test/postcss_plugins'

test('PostCSS plugins', async () => {
  await esbuild.build({
    entryPoints: [path.join(basePath, 'src/index.ts')],
    outdir: path.join(basePath, 'dist'),
    bundle: true,
    plugins: [stylePlugin({
      postcss: {
        parser: scss,
        plugins: [
          skipInlineComments(),
          autoprefixer,
          presetEnv({ stage: 0 })
        ]
      }
    })]
  })
})