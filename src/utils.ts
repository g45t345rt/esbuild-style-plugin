import { TextDecoder } from 'util'
import path from 'path'
import fs from 'fs'
import url from 'node:url'
import { globSync } from 'glob'
import type * as Sass from 'sass'
import { RenderOptions as StylusOptions } from 'stylus'
import { AcceptedPlugin, Result } from 'postcss'

type SassOptions = Sass.LegacySharedOptions<'sync'>;

export interface RenderOptions {
  sassOptions?: SassOptions
  stylusOptions?: StylusOptions
  lessOptions?: Less.Options
}

export interface RenderResult {
  css: string;
  watchFiles: string[];
}

interface SourceMap {
    version: number;
    file: string;
    sourceRoot?: string;
    sources: string[];
    sourcesContent?: string[];
    names: string[];
    mappings: string;
}

export const getModule = async (moduleName: string, checkFunc: string) => {
  try {
    const module = await import(moduleName)
    if (typeof module[checkFunc] === `function`) return module
    if (typeof module.default[checkFunc] === `function`) return module.default
    throw new Error(`Func '${checkFunc}' not found for module '${moduleName}'`)
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      throw new Error(`Missing module. Please install '${moduleName}' package.`)
    } else {
      throw e
    }
  }
}

const getWatchFilesFromSourceMap = (sourceMap: SourceMap): string[] => {
  const topLevelFilePath = url.fileURLToPath(sourceMap.file);
  const baseDir = path.dirname(topLevelFilePath);
  const watchFiles: string[] = sourceMap.sources.map((srcFile) => {
    return path.resolve(baseDir, srcFile);
  });
  return watchFiles;
};

const renderStylus = async (css: string, options: StylusOptions): Promise<string> => {
  const stylus = await getModule('stylus', 'render')
  return new Promise((resolve, reject) => {
    stylus.render(css, options, (err, css) => {
      if (err) reject(err)
      resolve(css)
    })
  })
}

const renderSass = async (filePath: string, options: SassOptions): Promise<RenderResult> => {
  const sass: typeof Sass = (await getModule('sass', 'renderSync'));
  const sassResult = sass.renderSync({
    ...options,
    file: filePath,
    // Force sourcemap to be enabled so that we can parse the file sources out of it
    sourceMap: `${filePath}.map`,
    sourceMapEmbed: false,
  });
  const sourceMap: SourceMap = JSON.parse(sassResult.map.toString());
  return {
    css: sassResult.css.toString(),
    watchFiles: getWatchFilesFromSourceMap(sourceMap),
  };
};

export const renderStyle = async (filePath: string, options: RenderOptions = {}): Promise<RenderResult> => {
  const { ext } = path.parse(filePath)

  if (ext === '.css') {
    return {
      css: (await fs.promises.readFile(filePath)).toString(),
      watchFiles: [],
    };
  }

  if (ext === '.sass' || ext === '.scss') {
    const sassOptions = options.sassOptions || {}
    return renderSass(filePath, sassOptions);
  }

  if (ext === '.styl') {
    const stylusOptions = options.stylusOptions || {}
    const source = await fs.promises.readFile(filePath)
    return {
      css: await renderStylus(new TextDecoder().decode(source), { ...stylusOptions, filename: filePath }),
      watchFiles: [],
    };
  }

  if (ext === '.less') {
    const lestOptions = options.lessOptions || {}
    const source = await fs.promises.readFile(filePath)
    const less = await getModule('less', 'render')
    return {
      css: (await less.render(new TextDecoder().decode(source), { ...lestOptions, filename: filePath })).css,
      watchFiles: [],
    };
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

export const getPostCSSWatchFiles = (result: Result) => {
  let watchFiles = [] as string[]
  const { messages } = result
  for (const message of messages) {
    const { type } = message
    if (type === 'dependency') {
      watchFiles.push(message.file)
    } else if (type === 'dir-dependency') {
      if (!message.dir) continue

      // Can be translated to const globString = message.glob ?? `**/*` but we will use code bellow to support node12
      // https://node.green/#ES2020-features--nullish-coalescing-operator-----
      let globString = `**/*`
      if (message.glob && message.glob !== '') globString = message.glob

      const globPath = path.join(message.dir, globString)
      const files = globSync(globPath)
      watchFiles = [...watchFiles, ...files]
    }
  }
  return watchFiles
}
