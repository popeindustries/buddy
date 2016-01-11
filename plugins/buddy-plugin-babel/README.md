[![NPM Version](https://img.shields.io/npm/v/transfigure-babel.svg?style=flat)](https://npmjs.org/package/transfigure-babel)
[![Build Status](https://img.shields.io/travis/popeindustries/transfigure-babel.svg?style=flat)](https://travis-ci.org/popeindustries/transfigure-babel)

# transfigure-babel

[Transfigure](https://www.npmjs.com/package/transfigure) plugin for es6+ source transforms (via [Babel](http://babeljs.io)).

## Usage

By default, the following transformations are enabled:

  - es6.arrowFunctions
  - es6.blockScoping
  - es6.classes
  - es6.constants
  - es6.destructuring
  - es6.forOf
  - es6.modules
  - es6.objectSuper
  - es6.parameters.default
  - es6.parameters.rest
  - es6.properties.computed
  - es6.properties.shorthand
  - es6.regex.sticky
  - es6.regex.unicode
  - es6.spread
  - es6.tailCall
  - es6.templateLiterals
  - utility.deadCodeElimination
