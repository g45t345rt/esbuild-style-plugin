import 'jest'
import * as esbuild from 'esbuild'
import path from 'path'

import stylePlugin from '../../src'

const basePath = './test/css_modules/'

test('Test css modules',  async () => {
  await esbuild.build({
    entryPoints: [path.join(basePath, 'src/index.ts')],
    outdir: path.join(basePath, 'dist'),
    bundle: true,
    plugins: [stylePlugin({
      //cssModuleMatch: /.modue/
    })]
  })
})
