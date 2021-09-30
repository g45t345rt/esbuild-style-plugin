# esbuild-style-plugin

Another esbuild plugin for your styling.

- Supports multiple preprocessors like SASS, STYLUS, LESS
- Dynamic preprocessors import - no preprocessors installed by default
- Handles css modules automatically with PostCSS
- You can include postcss plugins (autoprefixer, preset-env)
- Server side rendering friendly! :)
- Support esbuild watch (TODO)
- Temp file cleanup and caching (TODO)
- Includes d.ts files in dist
- Build format for both cjs and esm
- Written in Typescript with maintainable code

## NPM package

`npm i esbuild-style-plugin -D`

## Using the package

Look at the test files or here is a basic example

```js
// import stylePlugin from 'esbuild-style-plugin`
const stylePlugin = require('esbuild-style-plugin')

esbuild.build({
  plugins: [
    stylePlugin()
  ]
})
```

### Plugin options

- `extract` default to true
- `cssModulesMatch` match .module. by default
- `sassOptions` <https://sass-lang.com/documentation/js-api#options>
- `lessOptions` <https://lesscss.org/usage/#less-options>
- `stylusOptions` <https://stylus-lang.com/docs/js.html>

## Preprocessor

The plugin does not come with all preprocessor installed since you might not need all of them.

Install the ones you need!

- SASS `npm i -D sass`
- LESS `npm i -D less`
- STYLUS `npm i -D stylus`

## CSS Modules

### Server side rendering

A specific use case that this plugin covers is SSR.
Using `extract: false` will not process css on server side but will keep css mapping for css modules.

## PostCSS

The plugin is using PostCSS to handle css modules files.
You can include any other plugins with the `postcss` option.

### CSSNano

Do not use cssnano plugin. It won't work and if it did it minifies all files seperatly (slow not efficient).
Just let esbuild minify and do his job.

### Preprocessors import typings

If you want to be able to use `import styles from 'styles.module.sass'` without any errors
Just add `esbuild-style-plugin` to your types in `tsconfig.json`

![tsconfig.json import types](import_types.jpg)