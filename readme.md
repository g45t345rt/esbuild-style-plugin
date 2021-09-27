# Another esbuild plugin for your styling

- Supports css, sass, styl, less
- Handles css modules automatically
- You can include postcss plugins (autoprefixer, preset-env)
- Temp file cleanup and caching (TODO)
- Written in Typescript with maintainable code

## NPM package

`npm i esbuild-style-plugin -D`

## Using the package

Look at the test files or here is a basic example

```js
esbuild.build({
  plugins: [
    stylePlugin()
  ]
})
```

### Plugin options

`extract`
`cssModulesMatch`
`sassOptions`
`lessOptions`
`stylusOptions`

## Preprocessor

The plugin does not come with all preprocessor installed since you might not need all of them.

Install the ones you need!

- SASS `npm i -D sass`
- LESS `npm i -D less`
- STYLUS `npm i -D stylus`

## CSS Modules

### Server side rendering

A specific use case that this plugin covers is SSR.
Using `extract: false` will not process css on server side but will keep css mapping for css modules

## PostCSS

The plugin is using PostCSS to handle css modules files.

### CSSNano

Do not use cssnano plugin. It won't work and if it did it minifies all files seperatly (slow not efficient).
Just let esbuild minify and do his job.
