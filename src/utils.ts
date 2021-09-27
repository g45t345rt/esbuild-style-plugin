import { TextDecoder } from 'util'
import path from 'path'
import fs from 'fs'

export const getModule = (moduleName: string) => {
  try {
    require.resolve(moduleName)
  } catch {
    throw new Error(`Missing module. Please install '${moduleName}' package.`)
  }
  return require(moduleName)
}

export interface RenderOptions {
  sassOptions?: {}
  stylusOptions?: {}
  lessOptions?: {}
}

export const renderStyle = async (filePath, options: RenderOptions = {}) => {
  const { ext } = path.parse(filePath)

  if (ext === '.css') {
    return await fs.promises.readFile(filePath)
  }

  if (ext === '.sass' || ext === '.scss') {
    const sassOptions = options.sassOptions || {}
    const sass = getModule('sass')
    return sass.renderSync({ ...sassOptions, file: filePath }).css.toString('utf-8')
  }

  if (ext === '.styl') {
    const stylusOptions = options.sassOptions || {}
    const stylus = getModule('stylus')
    const source = await fs.promises.readFile(filePath)
    return await stylus.render(new TextDecoder().decode(source), { ...stylusOptions, filename: filePath })
  }

  if (ext === '.less') {
    const lestOptions = options.lessOptions || {}
    const less = getModule('less')
    const source = await fs.promises.readFile(filePath)
    return (await less.render(new TextDecoder().decode(source), { ...lestOptions, filename: filePath })).css
  }

  throw new Error(`Can't render this style '${ext}'.`)
}
