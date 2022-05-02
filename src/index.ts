import path from 'path'
import fs from 'fs'
import postcss, { AcceptedPlugin, ProcessOptions } from 'postcss'
import cssModules from 'postcss-modules'
import temp from 'temp'
import { OnLoadArgs, OnLoadResult, OnResolveArgs, OnResolveResult, PluginBuild } from 'esbuild'

import CssModulesOptions from './postcssModulesOptions'
import './modules' // keep this import for enabling modules types declaration ex: import styles from 'styles.module.sass'
import { getPostCSSWatchFiles, importPostcssConfigFile, RenderOptions, renderStyle } from './utils'

interface PostCSS extends ProcessOptions {
  plugins: AcceptedPlugin[]
}

interface PluginOptions {
  extract?: boolean
  cssModulesMatch?: RegExp
  cssModulesOptions?: CssModulesOptions,
  postcss?: PostCSS // AcceptedPlugin[],
  //postcssOptions?: ProcessOptions
  postcssConfigFile?: string | boolean
  renderOptions?: RenderOptions
}

const LOAD_TEMP_NAMESPACE = 'temp_stylePlugin'
const LOAD_STYLE_NAMESPACE = 'stylePlugin'
const SKIP_RESOLVE = 'esbuild-style-plugin-skipResolve'
const styleFilter = /.\.(css|sass|scss|less|styl)$/

const handleCSSModules = (mapping: { data: any }, cssModulesOptions: CssModulesOptions) => {
  const _getJSON = cssModulesOptions.getJSON

  return cssModules({
    ...cssModulesOptions,
    getJSON: (cssFilename, json, outputFilename) => {
      if (typeof _getJSON === 'function') _getJSON(cssFilename, json, outputFilename)
      mapping.data = JSON.stringify(json, null, 2)
    }
  })
}

const onStyleResolve = async (build: PluginBuild, args: OnResolveArgs): Promise<OnResolveResult> => {
  const { namespace, resolveDir } = args

  if (args.pluginData === SKIP_RESOLVE) return

  const result = await build.resolve(args.path, { resolveDir: args.resolveDir, pluginData: SKIP_RESOLVE })
  if (result.errors.length > 0) {
    return { errors: result.errors }
  }

  const fullPath = result.path

  // Check for pre compiled JS files like file.css.js
  if (!styleFilter.test(fullPath)) return

  if (namespace === LOAD_STYLE_NAMESPACE) {
    return {
      path: fullPath,
      namespace: LOAD_TEMP_NAMESPACE,
      pluginData: { resolveDir }
    }
  }

  return {
    path: fullPath,
    namespace: LOAD_STYLE_NAMESPACE,
    watchFiles: [fullPath]
  }
}

const onTempLoad = async (args: OnLoadArgs): Promise<OnLoadResult> => {
  const { pluginData } = args
  const data = await fs.promises.readFile(args.path)

  return {
    resolveDir: pluginData.resolveDir,
    contents: data,
    loader: 'css'
  }
}

const onStyleLoad = (options: PluginOptions) => async (args: OnLoadArgs): Promise<OnLoadResult> => {
  // { extract: false } is for SSR since we only need the css mapping and not the actual css file
  const extract = options.extract === undefined ? true : options.extract
  const cssModulesMatch = options.cssModulesMatch || /\.module\./
  const isCSSModule = args.path.match(cssModulesMatch)
  const cssModulesOptions = options.cssModulesOptions || {}
  const renderOptions = options.renderOptions

  // Render whatever style currently on the loader .css, .sass, .styl, .less
  let css = await renderStyle(args.path, renderOptions)

  let watchFiles = []
  let mapping = { data: {} }
  let { plugins = [], ...processOptions } = options.postcss || {}
  let injectMapping = false
  let contents = ''

  // Match file with extension .module. => styles.module.sass
  if (isCSSModule) {
    // We have css module file so we include the postcss-modules plugin
    plugins = [handleCSSModules(mapping, cssModulesOptions), ...plugins]
    injectMapping = true
  }

  // Makes no sense to process postcss if we don't have any plugins
  if (plugins.length > 0) {
    const result = await postcss(plugins).process(css, { ...processOptions, from: args.path })
    css = result.css

    watchFiles = [...watchFiles, ...getPostCSSWatchFiles(result)]

    // Inject classnames mapping for css modules
    if (injectMapping) contents += `export default ${mapping.data};`
  }

  // Write new css to a temporary file
  if (extract) {
    const writestream = temp.createWriteStream({ suffix: '.css' })
    writestream.write(css)
    writestream.end()

    // Inject import "new url path" so esbuild can resolve a new css file
    contents += `import ${JSON.stringify(writestream.path)};`
  }

  return {
    watchFiles,
    resolveDir: path.dirname(args.path), // Keep resolveDir for onTempLoad anything resolve inside temp file must be resolve using source dir
    contents: contents
  }
}

const stylePlugin = (options: PluginOptions = {}) => ({
  name: 'esbuild-style-plugin',
  setup: async (build: PluginBuild) => {
    if (options.postcssConfigFile) {
      console.log(`Using postcss config file.`)
      options.postcss = await importPostcssConfigFile(options.postcssConfigFile)
    }

    // Resolve all css or other style here
    build.onResolve({ filter: styleFilter }, onStyleResolve.bind(null, build))

    // New temp files from rendered css must be evaluated
    build.onLoad({ filter: /.*/, namespace: LOAD_TEMP_NAMESPACE }, onTempLoad)

    // Render css with CSS Extensions / Preprocessors and PostCSS
    build.onLoad({ filter: /.*/, namespace: LOAD_STYLE_NAMESPACE }, onStyleLoad(options))
  }
})

export = stylePlugin
