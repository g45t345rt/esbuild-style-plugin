import * as esbuild from 'esbuild'
import path from 'path'
import atImport from 'postcss-import'
import tailwindcss from 'tailwindcss'

import stylePlugin from '../../src'

const onRebuild = (error: esbuild.BuildFailure, result: esbuild.BuildResult) => {
  if (error) console.error('watch build failed:', error)
  else console.log('watch build succeeded:', result)
}

esbuild.build({
  entryPoints: ['./test/watch/src/index.ts'],
  outdir: './test/watch/dist',
  bundle: true,
  watch: { onRebuild },
  plugins: [
    stylePlugin({
      postcss: {
        plugins: [
          atImport(),
          tailwindcss({
            content: [
              path.join(`./test/watch/css`, `**/*.{html,js}`)
            ]
          })
        ]
      }
    })
  ]
})
