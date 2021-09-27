export const getModule = (moduleName: string) => {
  try {
    require.resolve(moduleName)
  } catch {
    throw new Error(`Missing module. Please install '${moduleName}' package.`)
  }
  return require(moduleName)
}

export const isCSSModule = (path: string) => path.match(/\.module\./)
