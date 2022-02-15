import { TextDecoder } from 'util'
import path from 'path'
import fs from 'fs'
import { Options as SassOptions } from 'sass'
import { RenderOptions as StylusOptions } from 'stylus'
import { AcceptedPlugin } from 'postcss'

export interface RenderOptions {
  sassOptions?: SassOptions
  stylusOptions?: StylusOptions
  lessOptions?: Less.Options
}

export const getModule = async (moduleName: string) => {
  try {
    return (await import(moduleName)).default
  } catch {
    throw new Error(`Missing module. Please install '${moduleName}' package.`)
  }
}

const renderStylus = async (css: string, options: StylusOptions): Promise<string> => {
  const stylus = await getModule('stylus')
  return new Promise((resolve, reject) => {
    stylus.render(css, options, (err, css) => {
      if (err) reject(err)
      resolve(css)
    })
  })
}

export const renderStyle = async (filePath, options: RenderOptions = {}): Promise<string> => {
  const { ext } = path.parse(filePath)

  if (ext === '.css') {
    return (await fs.promises.readFile(filePath)).toString()
  }

  if (ext === '.sass' || ext === '.scss') {
    const sassOptions = options.sassOptions || {}
    const sass = await getModule('sass')
    return sass.renderSync({ ...sassOptions, file: filePath }).css.toString()
  }

  if (ext === '.styl') {
    const stylusOptions = options.stylusOptions || {}
    const source = await fs.promises.readFile(filePath)
    return await renderStylus(new TextDecoder().decode(source), { ...stylusOptions, filename: filePath })
  }

  if (ext === '.less') {
    const lestOptions = options.lessOptions || {}
    const source = await fs.promises.readFile(filePath)
    const less = await getModule('less')
    return (await less.render(new TextDecoder().decode(source), { ...lestOptions, filename: filePath })).css
  }

  throw new Error(`Can't render this style '${ext}'.`)
}

export const importPostcssConfigFile = async (configFilePath: string | boolean): Promise<{ plugins: AcceptedPlugin[] }> => {
  let _configFilePath = configFilePath === true ? path.resolve(process.cwd(), 'postcss.config.js') : configFilePath as string

  try {
    const imported = await import(_configFilePath)
    if (!imported.default) throw new Error(`Missing default import .`)
    const config = imported.default
    if (!config.plugins) throw new Error(`Missing plugins [array].`)
    return config
  } catch (err) {
    console.error(err)
    throw new Error(`PostCSS config file at ${_configFilePath} can't load.`)
  }
}
