import 'jest'
import path from 'path'

import { renderStyle, getModule } from '../../src/utils'

const basePath = './test/errors'

test('Test errors', async () => {
  const ext = '.asd'
  const filePath = path.join(basePath, `styles${ext}`)
  expect(() => renderStyle(filePath)).rejects.toThrow(`Can't render this style '${ext}'.`)

  const moduleName = 'asd'
  expect(() => getModule(moduleName)).rejects.toThrow(`Missing module. Please install '${moduleName}' package.`)
})