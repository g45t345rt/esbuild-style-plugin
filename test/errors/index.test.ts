import 'jest'
import path from 'path'

import { getModule, renderStyle } from '../../src/utils'

const basePath = './test/errors'

test('Test errors', async () => {
  const ext = '.asd'
  const filePath = path.join(basePath, `styles${ext}`)
  expect(() => renderStyle(filePath)).rejects.toThrow(`Can't render this style '${ext}'.`)

  const moduleName = 'asd'
  expect(() => getModule(moduleName)).toThrow(`Missing module. Please install '${moduleName}' package.`)
})