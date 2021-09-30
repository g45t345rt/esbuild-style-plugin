import 'jest'
import path from 'path'
import { execFileSync } from 'child_process'

const basePath = './test/using_dist'

test('Using dist', async () => {
  execFileSync('node', [path.join(basePath, 'bundle.js')])
  execFileSync('node', [path.join(basePath, 'bundle.mjs')])
})
