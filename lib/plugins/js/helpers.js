'use strict';

const HELPERS = {
  'babel-plugin-transform-object-assign': 'extends',
  'babel-plugin-transform-object-set-prototype-of-to-assign': 'defaults',
  'babel-plugin-transform-es2015-instanceof': 'instanceof',
  'babel-plugin-transform-async-to-generator': 'asyncToGenerator',
  'babel-plugin-transform-es2015-arrow-functions': 'newArrowCheck',
  'babel-plugin-transform-proto-to-assign': ['extends', 'defaults'],
  'babel-plugin-transform-es2015-typeof-symbol': 'typeof',
  'babel-plugin-transform-object-rest-spread': 'extends',
  'babel-plugin-transform-es2015-block-scoping': 'temporalUndefined',
  'babel-plugin-transform-es2015-computed-properties': 'defineProperty',
  'babel-plugin-transform-react-inline-elements': 'jsx',
  'babel-plugin-transform-es2015-classes': ['classCallCheck', 'createClass'],
  'babel-plugin-transform-es2015-modules-commonjs': ['interopRequireDefault', 'interopRequireWildcard'],
  'babel-plugin-transform-es2015-destructuring': ['objectWithoutProperties', 'objectDestructuringEmpty']
};