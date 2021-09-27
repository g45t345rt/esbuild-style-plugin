import 'jest'
import * as esbuild from 'esbuild'
import path from 'path'
import { execFileSync } from 'child_process'

import stylePlugin from '../../src'

const basePath = './test/ssr'

test('Server side rendering', async () => {
  const clientBuild = esbuild.build({
    entryPoints: [
      path.join(basePath, 'src/client.ts')
    ],
    outdir: path.join(basePath, 'dist'),
    bundle: true,
    platform: 'browser',
    plugins: [stylePlugin()]
  })

  const serverBuild = esbuild.build({
    entryPoints: [
      path.join(basePath, 'src/server.ts')
    ],
    outdir: path.join(basePath, 'dist'),
    bundle: true,
    platform: 'node',
    plugins: [stylePlugin({ extract: false })]
  })

  await Promise.all([clientBuild, serverBuild])

  // Make sure you can run server.js on node
  // the test will fail if window.document is injected somewhere
  execFileSync('node', [path.join(basePath, 'dist/server.js')])
})
