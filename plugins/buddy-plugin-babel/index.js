'use strict';

const babel = require('babel-core')

  , BOILERPLATE = 'var global = window.global = window;\n\n'
  , DEFAULT_HELPERS = [
      'classCallCheck',
      'createClass',
      'defineProperty',
      'get',
      'inherits',
      'possibleConstructorReturn',
      'taggedTemplateLiteral'
    ]
  , HELPERS = babel.buildExternalHelpers(DEFAULT_HELPERS)
  , SETTINGS = {
      plugins: [
        require('babel-plugin-external-helpers-2'),
        require('babel-plugin-transform-es2015-arrow-functions'),
        require('babel-plugin-transform-es2015-block-scoped-functions'),
        require('babel-plugin-transform-es2015-block-scoping'),
        [require('babel-plugin-transform-es2015-classes'), { loose: true }],
        [require('babel-plugin-transform-es2015-computed-properties'), { loose: true }],
        [require('babel-plugin-transform-es2015-destructuring'), { loose: true }],
        require('babel-plugin-transform-es2015-duplicate-keys'),
        [require('babel-plugin-transform-es2015-for-of'), { loose: true }],
        require('babel-plugin-transform-es2015-function-name'),
        require('babel-plugin-transform-es2015-literals'),
        [require('babel-plugin-transform-es2015-modules-commonjs'), { loose: true }],
        require('babel-plugin-transform-es2015-object-super'),
        require('babel-plugin-transform-es2015-parameters'),
        require('babel-plugin-transform-es2015-shorthand-properties'),
        [require('babel-plugin-transform-es2015-spread'), { loose: true }],
        require('babel-plugin-transform-es2015-sticky-regex'),
        [require('babel-plugin-transform-es2015-template-literals'), { loose: true }],
        require('babel-plugin-transform-es2015-unicode-regex'),
        require('babel-plugin-transform-es3-property-literals'),
        require('babel-plugin-transform-es3-member-expression-literals')
      ],
      presets: [
        require('babel-preset-react')
      ]
    };

/**
 * Retrieve registration data
 */
exports.registration = {
  name: 'babel',
  extensions: {
    js: [
      'js',
      'jsx'
    ]
  }
};

/**
 * Compile 'content'
 * @param {String} content
 * @param {Object} options
 * @param {Function} fn(err, content)
 * @returns {null}
 */
exports.compile = function (content, options, fn) {
  if (!options.cache.getSource('js-helpers')) {
    options.cache.setSource('js-helpers', BOILERPLATE + HELPERS);
  }

  // Skip node_modules files
  if (~options.filepath.indexOf('node_modules')) return fn(null, content);

  try {
    const transform = babel.transform(content, Object.assign({}, SETTINGS));

    fn(null, transform.code);
  } catch (err) {
    err.filepath = options.filepath;
    fn(err);
  }
};