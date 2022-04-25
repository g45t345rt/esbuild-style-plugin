import 'jest'
import * as esbuild from 'esbuild'
import path from 'path'

import stylePlugin from '../../src'

const basePath = './test/render_options'

test('Test sassOptions', async () => {
  await esbuild.build({
    entryPoints: [
      path.join(basePath, 'src/index.ts')
    ],
    outdir: path.join(basePath, 'dist'),
    bundle: true,
    plugins: [stylePlugin({
      renderOptions: {
        sassOptions: {
          style: 'compressed'
        },
        lessOptions: {
          globalVars: {
            color1: 'red'
          }
        }
      }
    })]
  })
})