import * as esbuild from 'esbuild'
import path from 'path'
import atImport from 'postcss-import'
import tailwindcss from 'tailwindcss'

import stylePlugin from '../../src'

const consoleLogPlugin: esbuild.Plugin = {
  name: 'console-log-plugin',
  setup(build) {
    build.onEnd((result) => {
      if (result.errors.length > 0) {
        console.error('watch build failed:', result.errors);
      } else {
        console.log('watch build succeeded:', result);
      }
    })
  },
}

esbuild.context({
  entryPoints: ['./test/watch/src/index.ts'],
  outdir: './test/watch/dist',
  bundle: true,
  plugins: [
    consoleLogPlugin,
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
}).then(async (context) => {
  context.watch();
});
