## Plugins

Writing a **buddy** plugin makes it possible to add new languages and file types, add new version presets, and extend or modify the behaviour of existing transforms. In fact, all of **buddy**'s built in file types are [implemented](https://github.com/popeindustries/buddy/tree/master/lib/plugins) as plugins.

Plugins are loaded based on the following rules:

- all packages beginning with `buddy-plugin-` installed to `node_modules`
- all modules found in `{project}/buddy-plugins`

### API

Plugin modules must export a single function called `register`:
```js
module.exports = {
  name: 'myPlugin',
  type: 'js',

  /**
   * Register plugin
   * @param {Config} config
   */
  register (config) {
    //...
  }
};
```

The passed `Config` instance exposes the following four methods:

**registerFileExtensionsForType(extensions: Array, type: String)**: register file `extensions` for file `type`. Enables adding file extensions to an existing type (see [react](https://github.com/popeindustries/buddy/blob/master/lib/plugins/react/index.js) plugin).

**registerTargetVersionForType(version: String, plugins: Array, type: String)**: register `plugins` for a build target `version` preset. Enables defining Babel or PostCSS plugin presets as a build target version (see [flow](https://github.com/popeindustries/buddy/blob/master/lib/plugins/flow/index.js) plugin).

**registerFileDefinitionAndExtensionsForType (define: Function, extensions: Array, type: String)**: register definition for new file `type` with `extensions`. Enables defining the behaviour for a new file type (see [css](https://github.com/popeindustries/buddy/blob/master/lib/plugins/css/index.js),  [js](https://github.com/popeindustries/buddy/blob/master/lib/plugins/js/index.js), and [html](https://github.com/popeindustries/buddy/blob/master/lib/plugins/html/index.js) plugins).

The `define` function will be called with a [`File`](https://github.com/popeindustries/buddy/blob/master/lib/File.js) *class*, and should return a new *class* definition. If a *class* definition has already been defined for `type`, `File` will be the existing subclass (`JSFile`, `CSSFile`, etc.):

```js
/**
 * Extend 'File' with new behaviour
 * @param {Class} File
 * @param {Object} utils
 * @returns {Class}
 */
function define (File, utils) {
  return class MYFile extends File {
    //...
  }
}
```

**extendFileDefinitionForExtensionsOrType (extend: Function, extensions: Array, type: String)**: `extend` an existing file definition registered by file `extensions` or `type`. Enables adding or modifying the behaviour of a file definition (see [uglify](https://github.com/popeindustries/buddy/blob/master/lib/plugins/uglify/index.js) plugin).

The `extend` function will be called with the `prototype` of the [`File`](https://github.com/popeindustries/buddy/blob/master/lib/File.js) *class* being extended (`JSFile.prototype`, `CSSFile.prototype`, etc):

```js
/**
 * Extend 'prototype' with new behaviour
 * @param {Object} prototype
 * @param {Object} utils
 */
function extend (prototype, utils) {
  prototype.foo = function foo () {
    //...
  }
}
```