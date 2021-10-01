import * as esbuild from 'esbuild'
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
    stylePlugin()
  ]
})