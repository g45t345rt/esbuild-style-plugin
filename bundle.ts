import * as esbuild from 'esbuild'
import pkg from './package.json'

const dependencies = () => Object.keys(pkg.dependencies)

const config = {
  entryPoints: ['./src/index.ts'],
  platform: 'node',
  bundle: true,
  external: [...dependencies()]
} as esbuild.BuildOptions

const formats = {
  'esm': '.mjs',
  'cjs': '.js'
} as { [key in esbuild.Format]: string }

Object.keys(formats).forEach(key => {
  const extension = formats[key]
  esbuild.build({
    ...config,
    format: key as esbuild.Format,
    outExtension: { '.js': extension },
    outdir: `./dist`
  })
})
