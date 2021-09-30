import esbuild from 'esbuild'
import stylePlugin from '../../dist/index.mjs'

esbuild.build({
  bundle: true,
  outdir: './test/using_dist/dist',
  entryPoints: ['./test/using_dist/index.js'],
  plugins: [
    stylePlugin()
  ]
})