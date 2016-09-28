/** BUDDY BUILT **/
var $m = {};
var originalRequire = require;
require = function buddyRequire (id) {
  if (!$m[id]) return originalRequire(id);
  if ('function' == typeof $m[id]) $m[id]();
  return $m[id].exports;
};
/*== node_modules/csso/lib/utils/list.js ==*/
$m['csso/lib/utils/list.js#2.2.1'] = { exports: {} };
//
//            item        item        item        item
//          /------\    /------\    /------\    /------\
//          | data |    | data |    | data |    | data |
//  null <--+-prev |<---+-prev |<---+-prev |<---+-prev |
//          | next-+--->| next-+--->| next-+--->| next-+--> null
//          \------/    \------/    \------/    \------/
//             ^                                    ^
//             |                list                |
//             |              /------\              |
//             \--------------+-head |              |
//                            | tail-+--------------/
//                            \------/
//

function _cssolibutilslistjs221_createItem(data) {
    return {
        data: data,
        next: null,
        prev: null
    };
}

var _cssolibutilslistjs221_List = function (values) {
    this.cursor = null;
    this.head = null;
    this.tail = null;

    if (Array.isArray(values)) {
        var cursor = null;

        for (var i = 0; i < values.length; i++) {
            var item = _cssolibutilslistjs221_createItem(values[i]);

            if (cursor !== null) {
                cursor.next = item;
            } else {
                this.head = item;
            }

            item.prev = cursor;
            cursor = item;
        }

        this.tail = cursor;
    }
};

Object.defineProperty(_cssolibutilslistjs221_List.prototype, 'size', {
    get: function () {
        var size = 0;
        var cursor = this.head;

        while (cursor) {
            size++;
            cursor = cursor.next;
        }

        return size;
    }
});

_cssolibutilslistjs221_List.createItem = _cssolibutilslistjs221_createItem;
_cssolibutilslistjs221_List.prototype.createItem = _cssolibutilslistjs221_createItem;

_cssolibutilslistjs221_List.prototype.toArray = function () {
    var cursor = this.head;
    var result = [];

    while (cursor) {
        result.push(cursor.data);
        cursor = cursor.next;
    }

    return result;
};
_cssolibutilslistjs221_List.prototype.toJSON = function () {
    return this.toArray();
};

_cssolibutilslistjs221_List.prototype.isEmpty = function () {
    return this.head === null;
};

_cssolibutilslistjs221_List.prototype.first = function () {
    return this.head && this.head.data;
};

_cssolibutilslistjs221_List.prototype.last = function () {
    return this.tail && this.tail.data;
};

_cssolibutilslistjs221_List.prototype.each = function (fn, context) {
    var item;
    var cursor = {
        prev: null,
        next: this.head,
        cursor: this.cursor
    };

    if (context === undefined) {
        context = this;
    }

    // push cursor
    this.cursor = cursor;

    while (cursor.next !== null) {
        item = cursor.next;
        cursor.next = item.next;

        fn.call(context, item.data, item, this);
    }

    // pop cursor
    this.cursor = this.cursor.cursor;
};

_cssolibutilslistjs221_List.prototype.eachRight = function (fn, context) {
    var item;
    var cursor = {
        prev: this.tail,
        next: null,
        cursor: this.cursor
    };

    if (context === undefined) {
        context = this;
    }

    // push cursor
    this.cursor = cursor;

    while (cursor.prev !== null) {
        item = cursor.prev;
        cursor.prev = item.prev;

        fn.call(context, item.data, item, this);
    }

    // pop cursor
    this.cursor = this.cursor.cursor;
};

_cssolibutilslistjs221_List.prototype.nextUntil = function (start, fn, context) {
    if (start === null) {
        return;
    }

    var item;
    var cursor = {
        prev: null,
        next: start,
        cursor: this.cursor
    };

    if (context === undefined) {
        context = this;
    }

    // push cursor
    this.cursor = cursor;

    while (cursor.next !== null) {
        item = cursor.next;
        cursor.next = item.next;

        if (fn.call(context, item.data, item, this)) {
            break;
        }
    }

    // pop cursor
    this.cursor = this.cursor.cursor;
};

_cssolibutilslistjs221_List.prototype.prevUntil = function (start, fn, context) {
    if (start === null) {
        return;
    }

    var item;
    var cursor = {
        prev: start,
        next: null,
        cursor: this.cursor
    };

    if (context === undefined) {
        context = this;
    }

    // push cursor
    this.cursor = cursor;

    while (cursor.prev !== null) {
        item = cursor.prev;
        cursor.prev = item.prev;

        if (fn.call(context, item.data, item, this)) {
            break;
        }
    }

    // pop cursor
    this.cursor = this.cursor.cursor;
};

_cssolibutilslistjs221_List.prototype.some = function (fn, context) {
    var cursor = this.head;

    if (context === undefined) {
        context = this;
    }

    while (cursor !== null) {
        if (fn.call(context, cursor.data, cursor, this)) {
            return true;
        }

        cursor = cursor.next;
    }

    return false;
};

_cssolibutilslistjs221_List.prototype.map = function (fn, context) {
    var result = [];
    var cursor = this.head;

    if (context === undefined) {
        context = this;
    }

    while (cursor !== null) {
        result.push(fn.call(context, cursor.data, cursor, this));
        cursor = cursor.next;
    }

    return result;
};

_cssolibutilslistjs221_List.prototype.copy = function () {
    var result = new _cssolibutilslistjs221_List();
    var cursor = this.head;

    while (cursor !== null) {
        result.insert(_cssolibutilslistjs221_createItem(cursor.data));
        cursor = cursor.next;
    }

    return result;
};

_cssolibutilslistjs221_List.prototype.updateCursors = function (prevOld, prevNew, nextOld, nextNew) {
    var cursor = this.cursor;

    while (cursor !== null) {
        if (prevNew === true || cursor.prev === prevOld) {
            cursor.prev = prevNew;
        }

        if (nextNew === true || cursor.next === nextOld) {
            cursor.next = nextNew;
        }

        cursor = cursor.cursor;
    }
};

_cssolibutilslistjs221_List.prototype.insert = function (item, before) {
    if (before !== undefined && before !== null) {
        // prev   before
        //      ^
        //     item
        this.updateCursors(before.prev, item, before, item);

        if (before.prev === null) {
            // insert to the beginning of list
            if (this.head !== before) {
                throw new Error('before doesn\'t below to list');
            }

            // since head points to before therefore list doesn't empty
            // no need to check tail
            this.head = item;
            before.prev = item;
            item.next = before;

            this.updateCursors(null, item);
        } else {

            // insert between two items
            before.prev.next = item;
            item.prev = before.prev;

            before.prev = item;
            item.next = before;
        }
    } else {
        // tail
        //      ^
        //     item
        this.updateCursors(this.tail, item, null, item);

        // insert to end of the list
        if (this.tail !== null) {
            // if list has a tail, then it also has a head, but head doesn't change

            // last item -> new item
            this.tail.next = item;

            // last item <- new item
            item.prev = this.tail;
        } else {
            // if list has no a tail, then it also has no a head
            // in this case points head to new item
            this.head = item;
        }

        // tail always start point to new item
        this.tail = item;
    }
};

_cssolibutilslistjs221_List.prototype.remove = function (item) {
    //      item
    //       ^
    // prev     next
    this.updateCursors(item, item.prev, item, item.next);

    if (item.prev !== null) {
        item.prev.next = item.next;
    } else {
        if (this.head !== item) {
            throw new Error('item doesn\'t below to list');
        }

        this.head = item.next;
    }

    if (item.next !== null) {
        item.next.prev = item.prev;
    } else {
        if (this.tail !== item) {
            throw new Error('item doesn\'t below to list');
        }

        this.tail = item.prev;
    }

    item.prev = null;
    item.next = null;

    return item;
};

_cssolibutilslistjs221_List.prototype.appendList = function (list) {
    // ignore empty lists
    if (list.head === null) {
        return;
    }

    this.updateCursors(this.tail, list.tail, null, list.head);

    // insert to end of the list
    if (this.tail !== null) {
        // if destination list has a tail, then it also has a head,
        // but head doesn't change

        // dest tail -> source head
        this.tail.next = list.head;

        // dest tail <- source head
        list.head.prev = this.tail;
    } else {
        // if list has no a tail, then it also has no a head
        // in this case points head to new item
        this.head = list.head;
    }

    // tail always start point to new item
    this.tail = list.tail;

    list.head = null;
    list.tail = null;
};

$m['csso/lib/utils/list.js#2.2.1'].exports = _cssolibutilslistjs221_List;
/*≠≠ node_modules/csso/lib/utils/list.js ≠≠*/

/*== node_modules/csso/lib/utils/clone.js ==*/
$m['csso/lib/utils/clone.js#2.2.1'] = { exports: {} };
var _cssolibutilsclonejs221_List = $m['csso/lib/utils/list.js#2.2.1'].exports;

$m['csso/lib/utils/clone.js#2.2.1'].exports = function clone(node) {
    var result = {};

    for (var key in node) {
        var value = node[key];

        if (value) {
            if (Array.isArray(value)) {
                value = value.slice(0);
            } else if (value instanceof _cssolibutilsclonejs221_List) {
                value = new _cssolibutilsclonejs221_List(value.map(clone));
            } else if (value.constructor === Object) {
                value = clone(value);
            }
        }

        result[key] = value;
    }

    return result;
};
/*≠≠ node_modules/csso/lib/utils/clone.js ≠≠*/

/*== node_modules/csso/lib/utils/walk.js ==*/
$m['csso/lib/utils/walk.js#2.2.1'] = { exports: {} };
function _cssolibutilswalkjs221_walkRules(node, item, list) {
    switch (node.type) {
        case 'StyleSheet':
            var oldStylesheet = this.stylesheet;
            this.stylesheet = node;

            node.rules.each(_cssolibutilswalkjs221_walkRules, this);

            this.stylesheet = oldStylesheet;
            break;

        case 'Atrule':
            if (node.block !== null) {
                _cssolibutilswalkjs221_walkRules.call(this, node.block);
            }

            this.fn(node, item, list);
            break;

        case 'Ruleset':
            this.fn(node, item, list);
            break;
    }
}

function _cssolibutilswalkjs221_walkRulesRight(node, item, list) {
    switch (node.type) {
        case 'StyleSheet':
            var oldStylesheet = this.stylesheet;
            this.stylesheet = node;

            node.rules.eachRight(_cssolibutilswalkjs221_walkRulesRight, this);

            this.stylesheet = oldStylesheet;
            break;

        case 'Atrule':
            if (node.block !== null) {
                _cssolibutilswalkjs221_walkRulesRight.call(this, node.block);
            }

            this.fn(node, item, list);
            break;

        case 'Ruleset':
            this.fn(node, item, list);
            break;
    }
}

function _cssolibutilswalkjs221_walkAll(node, item, list) {
    switch (node.type) {
        case 'StyleSheet':
            var oldStylesheet = this.stylesheet;
            this.stylesheet = node;

            node.rules.each(_cssolibutilswalkjs221_walkAll, this);

            this.stylesheet = oldStylesheet;
            break;

        case 'Atrule':
            if (node.expression !== null) {
                _cssolibutilswalkjs221_walkAll.call(this, node.expression);
            }
            if (node.block !== null) {
                _cssolibutilswalkjs221_walkAll.call(this, node.block);
            }
            break;

        case 'Ruleset':
            this.ruleset = node;

            if (node.selector !== null) {
                _cssolibutilswalkjs221_walkAll.call(this, node.selector);
            }
            _cssolibutilswalkjs221_walkAll.call(this, node.block);

            this.ruleset = null;
            break;

        case 'Selector':
            var oldSelector = this.selector;
            this.selector = node;

            node.selectors.each(_cssolibutilswalkjs221_walkAll, this);

            this.selector = oldSelector;
            break;

        case 'Block':
            node.declarations.each(_cssolibutilswalkjs221_walkAll, this);
            break;

        case 'Declaration':
            this.declaration = node;

            _cssolibutilswalkjs221_walkAll.call(this, node.property);
            _cssolibutilswalkjs221_walkAll.call(this, node.value);

            this.declaration = null;
            break;

        case 'Attribute':
            _cssolibutilswalkjs221_walkAll.call(this, node.name);
            if (node.value !== null) {
                _cssolibutilswalkjs221_walkAll.call(this, node.value);
            }
            break;

        case 'FunctionalPseudo':
        case 'Function':
            this['function'] = node;

            node.arguments.each(_cssolibutilswalkjs221_walkAll, this);

            this['function'] = null;
            break;

        case 'AtruleExpression':
            this.atruleExpression = node;

            node.sequence.each(_cssolibutilswalkjs221_walkAll, this);

            this.atruleExpression = null;
            break;

        case 'Value':
        case 'Argument':
        case 'SimpleSelector':
        case 'Braces':
        case 'Negation':
            node.sequence.each(_cssolibutilswalkjs221_walkAll, this);
            break;

        case 'Url':
        case 'Progid':
            _cssolibutilswalkjs221_walkAll.call(this, node.value);
            break;

        // nothig to do with
        // case 'Property':
        // case 'Combinator':
        // case 'Dimension':
        // case 'Hash':
        // case 'Identifier':
        // case 'Nth':
        // case 'Class':
        // case 'Id':
        // case 'Percentage':
        // case 'PseudoClass':
        // case 'PseudoElement':
        // case 'Space':
        // case 'Number':
        // case 'String':
        // case 'Operator':
        // case 'Raw':
    }

    this.fn(node, item, list);
}

function _cssolibutilswalkjs221_createContext(root, fn) {
    var context = {
        fn: fn,
        root: root,
        stylesheet: null,
        atruleExpression: null,
        ruleset: null,
        selector: null,
        declaration: null,
        function: null
    };

    return context;
}

$m['csso/lib/utils/walk.js#2.2.1'].exports = {
    all: function (root, fn) {
        _cssolibutilswalkjs221_walkAll.call(_cssolibutilswalkjs221_createContext(root, fn), root);
    },
    rules: function (root, fn) {
        _cssolibutilswalkjs221_walkRules.call(_cssolibutilswalkjs221_createContext(root, fn), root);
    },
    rulesRight: function (root, fn) {
        _cssolibutilswalkjs221_walkRulesRight.call(_cssolibutilswalkjs221_createContext(root, fn), root);
    }
};
/*≠≠ node_modules/csso/lib/utils/walk.js ≠≠*/

/*== node_modules/source-map/lib/util.js ==*/
$m['source-map/lib/util.js#0.5.6'] = { exports: {} };
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

/**
 * This is a helper function for getting values from parameter/options
 * objects.
 *
 * @param args The object we are extracting values from
 * @param name The name of the property we are getting.
 * @param defaultValue An optional value to return if the property is missing
 * from the object. If this is not specified and the property is missing, an
 * error will be thrown.
 */
function _sourcemaplibutiljs056_getArg(aArgs, aName, aDefaultValue) {
  if (aName in aArgs) {
    return aArgs[aName];
  } else if (arguments.length === 3) {
    return aDefaultValue;
  } else {
    throw new Error('"' + aName + '" is a required argument.');
  }
}
$m['source-map/lib/util.js#0.5.6'].exports.getArg = _sourcemaplibutiljs056_getArg;

var _sourcemaplibutiljs056_urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.]*)(?::(\d+))?(\S*)$/;
var _sourcemaplibutiljs056_dataUrlRegexp = /^data:.+\,.+$/;

function _sourcemaplibutiljs056_urlParse(aUrl) {
  var match = aUrl.match(_sourcemaplibutiljs056_urlRegexp);
  if (!match) {
    return null;
  }
  return {
    scheme: match[1],
    auth: match[2],
    host: match[3],
    port: match[4],
    path: match[5]
  };
}
$m['source-map/lib/util.js#0.5.6'].exports.urlParse = _sourcemaplibutiljs056_urlParse;

function _sourcemaplibutiljs056_urlGenerate(aParsedUrl) {
  var url = '';
  if (aParsedUrl.scheme) {
    url += aParsedUrl.scheme + ':';
  }
  url += '//';
  if (aParsedUrl.auth) {
    url += aParsedUrl.auth + '@';
  }
  if (aParsedUrl.host) {
    url += aParsedUrl.host;
  }
  if (aParsedUrl.port) {
    url += ":" + aParsedUrl.port;
  }
  if (aParsedUrl.path) {
    url += aParsedUrl.path;
  }
  return url;
}
$m['source-map/lib/util.js#0.5.6'].exports.urlGenerate = _sourcemaplibutiljs056_urlGenerate;

/**
 * Normalizes a path, or the path portion of a URL:
 *
 * - Replaces consecutive slashes with one slash.
 * - Removes unnecessary '.' parts.
 * - Removes unnecessary '<dir>/..' parts.
 *
 * Based on code in the Node.js 'path' core module.
 *
 * @param aPath The path or url to normalize.
 */
function _sourcemaplibutiljs056_normalize(aPath) {
  var path = aPath;
  var url = _sourcemaplibutiljs056_urlParse(aPath);
  if (url) {
    if (!url.path) {
      return aPath;
    }
    path = url.path;
  }
  var isAbsolute = $m['source-map/lib/util.js#0.5.6'].exports.isAbsolute(path);

  var parts = path.split(/\/+/);
  for (var part, up = 0, i = parts.length - 1; i >= 0; i--) {
    part = parts[i];
    if (part === '.') {
      parts.splice(i, 1);
    } else if (part === '..') {
      up++;
    } else if (up > 0) {
      if (part === '') {
        // The first part is blank if the path is absolute. Trying to go
        // above the root is a no-op. Therefore we can remove all '..' parts
        // directly after the root.
        parts.splice(i + 1, up);
        up = 0;
      } else {
        parts.splice(i, 2);
        up--;
      }
    }
  }
  path = parts.join('/');

  if (path === '') {
    path = isAbsolute ? '/' : '.';
  }

  if (url) {
    url.path = path;
    return _sourcemaplibutiljs056_urlGenerate(url);
  }
  return path;
}
$m['source-map/lib/util.js#0.5.6'].exports.normalize = _sourcemaplibutiljs056_normalize;

/**
 * Joins two paths/URLs.
 *
 * @param aRoot The root path or URL.
 * @param aPath The path or URL to be joined with the root.
 *
 * - If aPath is a URL or a data URI, aPath is returned, unless aPath is a
 *   scheme-relative URL: Then the scheme of aRoot, if any, is prepended
 *   first.
 * - Otherwise aPath is a path. If aRoot is a URL, then its path portion
 *   is updated with the result and aRoot is returned. Otherwise the result
 *   is returned.
 *   - If aPath is absolute, the result is aPath.
 *   - Otherwise the two paths are joined with a slash.
 * - Joining for example 'http://' and 'www.example.com' is also supported.
 */
function _sourcemaplibutiljs056_join(aRoot, aPath) {
  if (aRoot === "") {
    aRoot = ".";
  }
  if (aPath === "") {
    aPath = ".";
  }
  var aPathUrl = _sourcemaplibutiljs056_urlParse(aPath);
  var aRootUrl = _sourcemaplibutiljs056_urlParse(aRoot);
  if (aRootUrl) {
    aRoot = aRootUrl.path || '/';
  }

  // `join(foo, '//www.example.org')`
  if (aPathUrl && !aPathUrl.scheme) {
    if (aRootUrl) {
      aPathUrl.scheme = aRootUrl.scheme;
    }
    return _sourcemaplibutiljs056_urlGenerate(aPathUrl);
  }

  if (aPathUrl || aPath.match(_sourcemaplibutiljs056_dataUrlRegexp)) {
    return aPath;
  }

  // `join('http://', 'www.example.com')`
  if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
    aRootUrl.host = aPath;
    return _sourcemaplibutiljs056_urlGenerate(aRootUrl);
  }

  var joined = aPath.charAt(0) === '/' ? aPath : _sourcemaplibutiljs056_normalize(aRoot.replace(/\/+$/, '') + '/' + aPath);

  if (aRootUrl) {
    aRootUrl.path = joined;
    return _sourcemaplibutiljs056_urlGenerate(aRootUrl);
  }
  return joined;
}
$m['source-map/lib/util.js#0.5.6'].exports.join = _sourcemaplibutiljs056_join;

$m['source-map/lib/util.js#0.5.6'].exports.isAbsolute = function (aPath) {
  return aPath.charAt(0) === '/' || !!aPath.match(_sourcemaplibutiljs056_urlRegexp);
};

/**
 * Make a path relative to a URL or another path.
 *
 * @param aRoot The root path or URL.
 * @param aPath The path or URL to be made relative to aRoot.
 */
function _sourcemaplibutiljs056_relative(aRoot, aPath) {
  if (aRoot === "") {
    aRoot = ".";
  }

  aRoot = aRoot.replace(/\/$/, '');

  // It is possible for the path to be above the root. In this case, simply
  // checking whether the root is a prefix of the path won't work. Instead, we
  // need to remove components from the root one by one, until either we find
  // a prefix that fits, or we run out of components to remove.
  var level = 0;
  while (aPath.indexOf(aRoot + '/') !== 0) {
    var index = aRoot.lastIndexOf("/");
    if (index < 0) {
      return aPath;
    }

    // If the only part of the root that is left is the scheme (i.e. http://,
    // file:///, etc.), one or more slashes (/), or simply nothing at all, we
    // have exhausted all components, so the path is not relative to the root.
    aRoot = aRoot.slice(0, index);
    if (aRoot.match(/^([^\/]+:\/)?\/*$/)) {
      return aPath;
    }

    ++level;
  }

  // Make sure we add a "../" for each component we removed from the root.
  return Array(level + 1).join("../") + aPath.substr(aRoot.length + 1);
}
$m['source-map/lib/util.js#0.5.6'].exports.relative = _sourcemaplibutiljs056_relative;

var _sourcemaplibutiljs056_supportsNullProto = function () {
  var obj = Object.create(null);
  return !('__proto__' in obj);
}();

function _sourcemaplibutiljs056_identity(s) {
  return s;
}

/**
 * Because behavior goes wacky when you set `__proto__` on objects, we
 * have to prefix all the strings in our set with an arbitrary character.
 *
 * See https://github.com/mozilla/source-map/pull/31 and
 * https://github.com/mozilla/source-map/issues/30
 *
 * @param String aStr
 */
function _sourcemaplibutiljs056_toSetString(aStr) {
  if (_sourcemaplibutiljs056_isProtoString(aStr)) {
    return '$' + aStr;
  }

  return aStr;
}
$m['source-map/lib/util.js#0.5.6'].exports.toSetString = _sourcemaplibutiljs056_supportsNullProto ? _sourcemaplibutiljs056_identity : _sourcemaplibutiljs056_toSetString;

function _sourcemaplibutiljs056_fromSetString(aStr) {
  if (_sourcemaplibutiljs056_isProtoString(aStr)) {
    return aStr.slice(1);
  }

  return aStr;
}
$m['source-map/lib/util.js#0.5.6'].exports.fromSetString = _sourcemaplibutiljs056_supportsNullProto ? _sourcemaplibutiljs056_identity : _sourcemaplibutiljs056_fromSetString;

function _sourcemaplibutiljs056_isProtoString(s) {
  if (!s) {
    return false;
  }

  var length = s.length;

  if (length < 9 /* "__proto__".length */) {
      return false;
    }

  if (s.charCodeAt(length - 1) !== 95 /* '_' */ || s.charCodeAt(length - 2) !== 95 /* '_' */ || s.charCodeAt(length - 3) !== 111 /* 'o' */ || s.charCodeAt(length - 4) !== 116 /* 't' */ || s.charCodeAt(length - 5) !== 111 /* 'o' */ || s.charCodeAt(length - 6) !== 114 /* 'r' */ || s.charCodeAt(length - 7) !== 112 /* 'p' */ || s.charCodeAt(length - 8) !== 95 /* '_' */ || s.charCodeAt(length - 9) !== 95 /* '_' */) {
      return false;
    }

  for (var i = length - 10; i >= 0; i--) {
    if (s.charCodeAt(i) !== 36 /* '$' */) {
        return false;
      }
  }

  return true;
}

/**
 * Comparator between two mappings where the original positions are compared.
 *
 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
 * mappings with the same original source/line/column, but different generated
 * line and column the same. Useful when searching for a mapping with a
 * stubbed out mapping.
 */
function _sourcemaplibutiljs056_compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
  var cmp = mappingA.source - mappingB.source;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0 || onlyCompareOriginal) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  return mappingA.name - mappingB.name;
}
$m['source-map/lib/util.js#0.5.6'].exports.compareByOriginalPositions = _sourcemaplibutiljs056_compareByOriginalPositions;

/**
 * Comparator between two mappings with deflated source and name indices where
 * the generated positions are compared.
 *
 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
 * mappings with the same generated line and column, but different
 * source/name/original line and column the same. Useful when searching for a
 * mapping with a stubbed out mapping.
 */
function _sourcemaplibutiljs056_compareByGeneratedPositionsDeflated(mappingA, mappingB, onlyCompareGenerated) {
  var cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0 || onlyCompareGenerated) {
    return cmp;
  }

  cmp = mappingA.source - mappingB.source;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0) {
    return cmp;
  }

  return mappingA.name - mappingB.name;
}
$m['source-map/lib/util.js#0.5.6'].exports.compareByGeneratedPositionsDeflated = _sourcemaplibutiljs056_compareByGeneratedPositionsDeflated;

function _sourcemaplibutiljs056_strcmp(aStr1, aStr2) {
  if (aStr1 === aStr2) {
    return 0;
  }

  if (aStr1 > aStr2) {
    return 1;
  }

  return -1;
}

/**
 * Comparator between two mappings with inflated source and name strings where
 * the generated positions are compared.
 */
function _sourcemaplibutiljs056_compareByGeneratedPositionsInflated(mappingA, mappingB) {
  var cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = _sourcemaplibutiljs056_strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0) {
    return cmp;
  }

  return _sourcemaplibutiljs056_strcmp(mappingA.name, mappingB.name);
}
$m['source-map/lib/util.js#0.5.6'].exports.compareByGeneratedPositionsInflated = _sourcemaplibutiljs056_compareByGeneratedPositionsInflated;
/*≠≠ node_modules/source-map/lib/util.js ≠≠*/

/*== node_modules/source-map/lib/mapping-list.js ==*/
$m['source-map/lib/mapping-list.js#0.5.6'] = { exports: {} };
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2014 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var _sourcemaplibmappinglistjs056_util = $m['source-map/lib/util.js#0.5.6'].exports;

/**
 * Determine whether mappingB is after mappingA with respect to generated
 * position.
 */
function _sourcemaplibmappinglistjs056_generatedPositionAfter(mappingA, mappingB) {
  // Optimized for most common case
  var lineA = mappingA.generatedLine;
  var lineB = mappingB.generatedLine;
  var columnA = mappingA.generatedColumn;
  var columnB = mappingB.generatedColumn;
  return lineB > lineA || lineB == lineA && columnB >= columnA || _sourcemaplibmappinglistjs056_util.compareByGeneratedPositionsInflated(mappingA, mappingB) <= 0;
}

/**
 * A data structure to provide a sorted view of accumulated mappings in a
 * performance conscious manner. It trades a neglibable overhead in general
 * case for a large speedup in case of mappings being added in order.
 */
function _sourcemaplibmappinglistjs056_MappingList() {
  this._array = [];
  this._sorted = true;
  // Serves as infimum
  this._last = { generatedLine: -1, generatedColumn: 0 };
}

/**
 * Iterate through internal items. This method takes the same arguments that
 * `Array.prototype.forEach` takes.
 *
 * NOTE: The order of the mappings is NOT guaranteed.
 */
_sourcemaplibmappinglistjs056_MappingList.prototype.unsortedForEach = function MappingList_forEach(aCallback, aThisArg) {
  this._array.forEach(aCallback, aThisArg);
};

/**
 * Add the given source mapping.
 *
 * @param Object aMapping
 */
_sourcemaplibmappinglistjs056_MappingList.prototype.add = function MappingList_add(aMapping) {
  if (_sourcemaplibmappinglistjs056_generatedPositionAfter(this._last, aMapping)) {
    this._last = aMapping;
    this._array.push(aMapping);
  } else {
    this._sorted = false;
    this._array.push(aMapping);
  }
};

/**
 * Returns the flat, sorted array of mappings. The mappings are sorted by
 * generated position.
 *
 * WARNING: This method returns internal data without copying, for
 * performance. The return value must NOT be mutated, and should be treated as
 * an immutable borrow. If you want to take ownership, you must make your own
 * copy.
 */
_sourcemaplibmappinglistjs056_MappingList.prototype.toArray = function MappingList_toArray() {
  if (!this._sorted) {
    this._array.sort(_sourcemaplibmappinglistjs056_util.compareByGeneratedPositionsInflated);
    this._sorted = true;
  }
  return this._array;
};

$m['source-map/lib/mapping-list.js#0.5.6'].exports.MappingList = _sourcemaplibmappinglistjs056_MappingList;
/*≠≠ node_modules/source-map/lib/mapping-list.js ≠≠*/

/*== node_modules/source-map/lib/array-set.js ==*/
$m['source-map/lib/array-set.js#0.5.6'] = { exports: {} };
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var _sourcemaplibarraysetjs056_util = $m['source-map/lib/util.js#0.5.6'].exports;
var _sourcemaplibarraysetjs056_has = Object.prototype.hasOwnProperty;

/**
 * A data structure which is a combination of an array and a set. Adding a new
 * member is O(1), testing for membership is O(1), and finding the index of an
 * element is O(1). Removing elements from the set is not supported. Only
 * strings are supported for membership.
 */
function _sourcemaplibarraysetjs056_ArraySet() {
  this._array = [];
  this._set = Object.create(null);
}

/**
 * Static method for creating ArraySet instances from an existing array.
 */
_sourcemaplibarraysetjs056_ArraySet.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
  var set = new _sourcemaplibarraysetjs056_ArraySet();
  for (var i = 0, len = aArray.length; i < len; i++) {
    set.add(aArray[i], aAllowDuplicates);
  }
  return set;
};

/**
 * Return how many unique items are in this ArraySet. If duplicates have been
 * added, than those do not count towards the size.
 *
 * @returns Number
 */
_sourcemaplibarraysetjs056_ArraySet.prototype.size = function ArraySet_size() {
  return Object.getOwnPropertyNames(this._set).length;
};

/**
 * Add the given string to this set.
 *
 * @param String aStr
 */
_sourcemaplibarraysetjs056_ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
  var sStr = _sourcemaplibarraysetjs056_util.toSetString(aStr);
  var isDuplicate = _sourcemaplibarraysetjs056_has.call(this._set, sStr);
  var idx = this._array.length;
  if (!isDuplicate || aAllowDuplicates) {
    this._array.push(aStr);
  }
  if (!isDuplicate) {
    this._set[sStr] = idx;
  }
};

/**
 * Is the given string a member of this set?
 *
 * @param String aStr
 */
_sourcemaplibarraysetjs056_ArraySet.prototype.has = function ArraySet_has(aStr) {
  var sStr = _sourcemaplibarraysetjs056_util.toSetString(aStr);
  return _sourcemaplibarraysetjs056_has.call(this._set, sStr);
};

/**
 * What is the index of the given string in the array?
 *
 * @param String aStr
 */
_sourcemaplibarraysetjs056_ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
  var sStr = _sourcemaplibarraysetjs056_util.toSetString(aStr);
  if (_sourcemaplibarraysetjs056_has.call(this._set, sStr)) {
    return this._set[sStr];
  }
  throw new Error('"' + aStr + '" is not in the set.');
};

/**
 * What is the element at the given index?
 *
 * @param Number aIdx
 */
_sourcemaplibarraysetjs056_ArraySet.prototype.at = function ArraySet_at(aIdx) {
  if (aIdx >= 0 && aIdx < this._array.length) {
    return this._array[aIdx];
  }
  throw new Error('No element indexed by ' + aIdx);
};

/**
 * Returns the array representation of this set (which has the proper indices
 * indicated by indexOf). Note that this is a copy of the internal array used
 * for storing the members so that no one can mess with internal state.
 */
_sourcemaplibarraysetjs056_ArraySet.prototype.toArray = function ArraySet_toArray() {
  return this._array.slice();
};

$m['source-map/lib/array-set.js#0.5.6'].exports.ArraySet = _sourcemaplibarraysetjs056_ArraySet;
/*≠≠ node_modules/source-map/lib/array-set.js ≠≠*/

/*== node_modules/source-map/lib/base64.js ==*/
$m['source-map/lib/base64.js#0.5.6'] = { exports: {} };
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var _sourcemaplibbase64js056_intToCharMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');

/**
 * Encode an integer in the range of 0 to 63 to a single base 64 digit.
 */
$m['source-map/lib/base64.js#0.5.6'].exports.encode = function (number) {
  if (0 <= number && number < _sourcemaplibbase64js056_intToCharMap.length) {
    return _sourcemaplibbase64js056_intToCharMap[number];
  }
  throw new TypeError("Must be between 0 and 63: " + number);
};

/**
 * Decode a single base 64 character code digit to an integer. Returns -1 on
 * failure.
 */
$m['source-map/lib/base64.js#0.5.6'].exports.decode = function (charCode) {
  var bigA = 65; // 'A'
  var bigZ = 90; // 'Z'

  var littleA = 97; // 'a'
  var littleZ = 122; // 'z'

  var zero = 48; // '0'
  var nine = 57; // '9'

  var plus = 43; // '+'
  var slash = 47; // '/'

  var littleOffset = 26;
  var numberOffset = 52;

  // 0 - 25: ABCDEFGHIJKLMNOPQRSTUVWXYZ
  if (bigA <= charCode && charCode <= bigZ) {
    return charCode - bigA;
  }

  // 26 - 51: abcdefghijklmnopqrstuvwxyz
  if (littleA <= charCode && charCode <= littleZ) {
    return charCode - littleA + littleOffset;
  }

  // 52 - 61: 0123456789
  if (zero <= charCode && charCode <= nine) {
    return charCode - zero + numberOffset;
  }

  // 62: +
  if (charCode == plus) {
    return 62;
  }

  // 63: /
  if (charCode == slash) {
    return 63;
  }

  // Invalid base64 digit.
  return -1;
};
/*≠≠ node_modules/source-map/lib/base64.js ≠≠*/

/*== node_modules/source-map/lib/base64-vlq.js ==*/
$m['source-map/lib/base64-vlq.js#0.5.6'] = { exports: {} };
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 *
 * Based on the Base 64 VLQ implementation in Closure Compiler:
 * https://code.google.com/p/closure-compiler/source/browse/trunk/src/com/google/debugging/sourcemap/Base64VLQ.java
 *
 * Copyright 2011 The Closure Compiler Authors. All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above
 *    copyright notice, this list of conditions and the following
 *    disclaimer in the documentation and/or other materials provided
 *    with the distribution.
 *  * Neither the name of Google Inc. nor the names of its
 *    contributors may be used to endorse or promote products derived
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var _sourcemaplibbase64vlqjs056_base64 = $m['source-map/lib/base64.js#0.5.6'].exports;

// A single base 64 digit can contain 6 bits of data. For the base 64 variable
// length quantities we use in the source map spec, the first bit is the sign,
// the next four bits are the actual value, and the 6th bit is the
// continuation bit. The continuation bit tells us whether there are more
// digits in this value following this digit.
//
//   Continuation
//   |    Sign
//   |    |
//   V    V
//   101011

var _sourcemaplibbase64vlqjs056_VLQ_BASE_SHIFT = 5;

// binary: 100000
var _sourcemaplibbase64vlqjs056_VLQ_BASE = 1 << _sourcemaplibbase64vlqjs056_VLQ_BASE_SHIFT;

// binary: 011111
var _sourcemaplibbase64vlqjs056_VLQ_BASE_MASK = _sourcemaplibbase64vlqjs056_VLQ_BASE - 1;

// binary: 100000
var _sourcemaplibbase64vlqjs056_VLQ_CONTINUATION_BIT = _sourcemaplibbase64vlqjs056_VLQ_BASE;

/**
 * Converts from a two-complement value to a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
 *   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
 */
function _sourcemaplibbase64vlqjs056_toVLQSigned(aValue) {
  return aValue < 0 ? (-aValue << 1) + 1 : (aValue << 1) + 0;
}

/**
 * Converts to a two-complement value from a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   2 (10 binary) becomes 1, 3 (11 binary) becomes -1
 *   4 (100 binary) becomes 2, 5 (101 binary) becomes -2
 */
function _sourcemaplibbase64vlqjs056_fromVLQSigned(aValue) {
  var isNegative = (aValue & 1) === 1;
  var shifted = aValue >> 1;
  return isNegative ? -shifted : shifted;
}

/**
 * Returns the base 64 VLQ encoded value.
 */
$m['source-map/lib/base64-vlq.js#0.5.6'].exports.encode = function base64VLQ_encode(aValue) {
  var encoded = "";
  var digit;

  var vlq = _sourcemaplibbase64vlqjs056_toVLQSigned(aValue);

  do {
    digit = vlq & _sourcemaplibbase64vlqjs056_VLQ_BASE_MASK;
    vlq >>>= _sourcemaplibbase64vlqjs056_VLQ_BASE_SHIFT;
    if (vlq > 0) {
      // There are still more digits in this value, so we must make sure the
      // continuation bit is marked.
      digit |= _sourcemaplibbase64vlqjs056_VLQ_CONTINUATION_BIT;
    }
    encoded += _sourcemaplibbase64vlqjs056_base64.encode(digit);
  } while (vlq > 0);

  return encoded;
};

/**
 * Decodes the next base 64 VLQ value from the given string and returns the
 * value and the rest of the string via the out parameter.
 */
$m['source-map/lib/base64-vlq.js#0.5.6'].exports.decode = function base64VLQ_decode(aStr, aIndex, aOutParam) {
  var strLen = aStr.length;
  var result = 0;
  var shift = 0;
  var continuation, digit;

  do {
    if (aIndex >= strLen) {
      throw new Error("Expected more digits in base 64 VLQ value.");
    }

    digit = _sourcemaplibbase64vlqjs056_base64.decode(aStr.charCodeAt(aIndex++));
    if (digit === -1) {
      throw new Error("Invalid base64 digit: " + aStr.charAt(aIndex - 1));
    }

    continuation = !!(digit & _sourcemaplibbase64vlqjs056_VLQ_CONTINUATION_BIT);
    digit &= _sourcemaplibbase64vlqjs056_VLQ_BASE_MASK;
    result = result + (digit << shift);
    shift += _sourcemaplibbase64vlqjs056_VLQ_BASE_SHIFT;
  } while (continuation);

  aOutParam.value = _sourcemaplibbase64vlqjs056_fromVLQSigned(result);
  aOutParam.rest = aIndex;
};
/*≠≠ node_modules/source-map/lib/base64-vlq.js ≠≠*/

/*== node_modules/source-map/lib/source-map-generator.js ==*/
$m['source-map/lib/source-map-generator.js#0.5.6'] = { exports: {} };
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var _sourcemaplibsourcemapgeneratorjs056_base64VLQ = $m['source-map/lib/base64-vlq.js#0.5.6'].exports;
var _sourcemaplibsourcemapgeneratorjs056_util = $m['source-map/lib/util.js#0.5.6'].exports;
var _sourcemaplibsourcemapgeneratorjs056_ArraySet = $m['source-map/lib/array-set.js#0.5.6'].exports.ArraySet;
var _sourcemaplibsourcemapgeneratorjs056_MappingList = $m['source-map/lib/mapping-list.js#0.5.6'].exports.MappingList;

/**
 * An instance of the SourceMapGenerator represents a source map which is
 * being built incrementally. You may pass an object with the following
 * properties:
 *
 *   - file: The filename of the generated source.
 *   - sourceRoot: A root for all relative URLs in this source map.
 */
function _sourcemaplibsourcemapgeneratorjs056_SourceMapGenerator(aArgs) {
  if (!aArgs) {
    aArgs = {};
  }
  this._file = _sourcemaplibsourcemapgeneratorjs056_util.getArg(aArgs, 'file', null);
  this._sourceRoot = _sourcemaplibsourcemapgeneratorjs056_util.getArg(aArgs, 'sourceRoot', null);
  this._skipValidation = _sourcemaplibsourcemapgeneratorjs056_util.getArg(aArgs, 'skipValidation', false);
  this._sources = new _sourcemaplibsourcemapgeneratorjs056_ArraySet();
  this._names = new _sourcemaplibsourcemapgeneratorjs056_ArraySet();
  this._mappings = new _sourcemaplibsourcemapgeneratorjs056_MappingList();
  this._sourcesContents = null;
}

_sourcemaplibsourcemapgeneratorjs056_SourceMapGenerator.prototype._version = 3;

/**
 * Creates a new SourceMapGenerator based on a SourceMapConsumer
 *
 * @param aSourceMapConsumer The SourceMap.
 */
_sourcemaplibsourcemapgeneratorjs056_SourceMapGenerator.fromSourceMap = function SourceMapGenerator_fromSourceMap(aSourceMapConsumer) {
  var sourceRoot = aSourceMapConsumer.sourceRoot;
  var generator = new _sourcemaplibsourcemapgeneratorjs056_SourceMapGenerator({
    file: aSourceMapConsumer.file,
    sourceRoot: sourceRoot
  });
  aSourceMapConsumer.eachMapping(function (mapping) {
    var newMapping = {
      generated: {
        line: mapping.generatedLine,
        column: mapping.generatedColumn
      }
    };

    if (mapping.source != null) {
      newMapping.source = mapping.source;
      if (sourceRoot != null) {
        newMapping.source = _sourcemaplibsourcemapgeneratorjs056_util.relative(sourceRoot, newMapping.source);
      }

      newMapping.original = {
        line: mapping.originalLine,
        column: mapping.originalColumn
      };

      if (mapping.name != null) {
        newMapping.name = mapping.name;
      }
    }

    generator.addMapping(newMapping);
  });
  aSourceMapConsumer.sources.forEach(function (sourceFile) {
    var content = aSourceMapConsumer.sourceContentFor(sourceFile);
    if (content != null) {
      generator.setSourceContent(sourceFile, content);
    }
  });
  return generator;
};

/**
 * Add a single mapping from original source line and column to the generated
 * source's line and column for this source map being created. The mapping
 * object should have the following properties:
 *
 *   - generated: An object with the generated line and column positions.
 *   - original: An object with the original line and column positions.
 *   - source: The original source file (relative to the sourceRoot).
 *   - name: An optional original token name for this mapping.
 */
_sourcemaplibsourcemapgeneratorjs056_SourceMapGenerator.prototype.addMapping = function SourceMapGenerator_addMapping(aArgs) {
  var generated = _sourcemaplibsourcemapgeneratorjs056_util.getArg(aArgs, 'generated');
  var original = _sourcemaplibsourcemapgeneratorjs056_util.getArg(aArgs, 'original', null);
  var source = _sourcemaplibsourcemapgeneratorjs056_util.getArg(aArgs, 'source', null);
  var name = _sourcemaplibsourcemapgeneratorjs056_util.getArg(aArgs, 'name', null);

  if (!this._skipValidation) {
    this._validateMapping(generated, original, source, name);
  }

  if (source != null) {
    source = String(source);
    if (!this._sources.has(source)) {
      this._sources.add(source);
    }
  }

  if (name != null) {
    name = String(name);
    if (!this._names.has(name)) {
      this._names.add(name);
    }
  }

  this._mappings.add({
    generatedLine: generated.line,
    generatedColumn: generated.column,
    originalLine: original != null && original.line,
    originalColumn: original != null && original.column,
    source: source,
    name: name
  });
};

/**
 * Set the source content for a source file.
 */
_sourcemaplibsourcemapgeneratorjs056_SourceMapGenerator.prototype.setSourceContent = function SourceMapGenerator_setSourceContent(aSourceFile, aSourceContent) {
  var source = aSourceFile;
  if (this._sourceRoot != null) {
    source = _sourcemaplibsourcemapgeneratorjs056_util.relative(this._sourceRoot, source);
  }

  if (aSourceContent != null) {
    // Add the source content to the _sourcesContents map.
    // Create a new _sourcesContents map if the property is null.
    if (!this._sourcesContents) {
      this._sourcesContents = Object.create(null);
    }
    this._sourcesContents[_sourcemaplibsourcemapgeneratorjs056_util.toSetString(source)] = aSourceContent;
  } else if (this._sourcesContents) {
    // Remove the source file from the _sourcesContents map.
    // If the _sourcesContents map is empty, set the property to null.
    delete this._sourcesContents[_sourcemaplibsourcemapgeneratorjs056_util.toSetString(source)];
    if (Object.keys(this._sourcesContents).length === 0) {
      this._sourcesContents = null;
    }
  }
};

/**
 * Applies the mappings of a sub-source-map for a specific source file to the
 * source map being generated. Each mapping to the supplied source file is
 * rewritten using the supplied source map. Note: The resolution for the
 * resulting mappings is the minimium of this map and the supplied map.
 *
 * @param aSourceMapConsumer The source map to be applied.
 * @param aSourceFile Optional. The filename of the source file.
 *        If omitted, SourceMapConsumer's file property will be used.
 * @param aSourceMapPath Optional. The dirname of the path to the source map
 *        to be applied. If relative, it is relative to the SourceMapConsumer.
 *        This parameter is needed when the two source maps aren't in the same
 *        directory, and the source map to be applied contains relative source
 *        paths. If so, those relative source paths need to be rewritten
 *        relative to the SourceMapGenerator.
 */
_sourcemaplibsourcemapgeneratorjs056_SourceMapGenerator.prototype.applySourceMap = function SourceMapGenerator_applySourceMap(aSourceMapConsumer, aSourceFile, aSourceMapPath) {
  var sourceFile = aSourceFile;
  // If aSourceFile is omitted, we will use the file property of the SourceMap
  if (aSourceFile == null) {
    if (aSourceMapConsumer.file == null) {
      throw new Error('SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, ' + 'or the source map\'s "file" property. Both were omitted.');
    }
    sourceFile = aSourceMapConsumer.file;
  }
  var sourceRoot = this._sourceRoot;
  // Make "sourceFile" relative if an absolute Url is passed.
  if (sourceRoot != null) {
    sourceFile = _sourcemaplibsourcemapgeneratorjs056_util.relative(sourceRoot, sourceFile);
  }
  // Applying the SourceMap can add and remove items from the sources and
  // the names array.
  var newSources = new _sourcemaplibsourcemapgeneratorjs056_ArraySet();
  var newNames = new _sourcemaplibsourcemapgeneratorjs056_ArraySet();

  // Find mappings for the "sourceFile"
  this._mappings.unsortedForEach(function (mapping) {
    if (mapping.source === sourceFile && mapping.originalLine != null) {
      // Check if it can be mapped by the source map, then update the mapping.
      var original = aSourceMapConsumer.originalPositionFor({
        line: mapping.originalLine,
        column: mapping.originalColumn
      });
      if (original.source != null) {
        // Copy mapping
        mapping.source = original.source;
        if (aSourceMapPath != null) {
          mapping.source = _sourcemaplibsourcemapgeneratorjs056_util.join(aSourceMapPath, mapping.source);
        }
        if (sourceRoot != null) {
          mapping.source = _sourcemaplibsourcemapgeneratorjs056_util.relative(sourceRoot, mapping.source);
        }
        mapping.originalLine = original.line;
        mapping.originalColumn = original.column;
        if (original.name != null) {
          mapping.name = original.name;
        }
      }
    }

    var source = mapping.source;
    if (source != null && !newSources.has(source)) {
      newSources.add(source);
    }

    var name = mapping.name;
    if (name != null && !newNames.has(name)) {
      newNames.add(name);
    }
  }, this);
  this._sources = newSources;
  this._names = newNames;

  // Copy sourcesContents of applied map.
  aSourceMapConsumer.sources.forEach(function (sourceFile) {
    var content = aSourceMapConsumer.sourceContentFor(sourceFile);
    if (content != null) {
      if (aSourceMapPath != null) {
        sourceFile = _sourcemaplibsourcemapgeneratorjs056_util.join(aSourceMapPath, sourceFile);
      }
      if (sourceRoot != null) {
        sourceFile = _sourcemaplibsourcemapgeneratorjs056_util.relative(sourceRoot, sourceFile);
      }
      this.setSourceContent(sourceFile, content);
    }
  }, this);
};

/**
 * A mapping can have one of the three levels of data:
 *
 *   1. Just the generated position.
 *   2. The Generated position, original position, and original source.
 *   3. Generated and original position, original source, as well as a name
 *      token.
 *
 * To maintain consistency, we validate that any new mapping being added falls
 * in to one of these categories.
 */
_sourcemaplibsourcemapgeneratorjs056_SourceMapGenerator.prototype._validateMapping = function SourceMapGenerator_validateMapping(aGenerated, aOriginal, aSource, aName) {
  if (aGenerated && 'line' in aGenerated && 'column' in aGenerated && aGenerated.line > 0 && aGenerated.column >= 0 && !aOriginal && !aSource && !aName) {
    // Case 1.
    return;
  } else if (aGenerated && 'line' in aGenerated && 'column' in aGenerated && aOriginal && 'line' in aOriginal && 'column' in aOriginal && aGenerated.line > 0 && aGenerated.column >= 0 && aOriginal.line > 0 && aOriginal.column >= 0 && aSource) {
    // Cases 2 and 3.
    return;
  } else {
    throw new Error('Invalid mapping: ' + JSON.stringify({
      generated: aGenerated,
      source: aSource,
      original: aOriginal,
      name: aName
    }));
  }
};

/**
 * Serialize the accumulated mappings in to the stream of base 64 VLQs
 * specified by the source map format.
 */
_sourcemaplibsourcemapgeneratorjs056_SourceMapGenerator.prototype._serializeMappings = function SourceMapGenerator_serializeMappings() {
  var previousGeneratedColumn = 0;
  var previousGeneratedLine = 1;
  var previousOriginalColumn = 0;
  var previousOriginalLine = 0;
  var previousName = 0;
  var previousSource = 0;
  var result = '';
  var next;
  var mapping;
  var nameIdx;
  var sourceIdx;

  var mappings = this._mappings.toArray();
  for (var i = 0, len = mappings.length; i < len; i++) {
    mapping = mappings[i];
    next = '';

    if (mapping.generatedLine !== previousGeneratedLine) {
      previousGeneratedColumn = 0;
      while (mapping.generatedLine !== previousGeneratedLine) {
        next += ';';
        previousGeneratedLine++;
      }
    } else {
      if (i > 0) {
        if (!_sourcemaplibsourcemapgeneratorjs056_util.compareByGeneratedPositionsInflated(mapping, mappings[i - 1])) {
          continue;
        }
        next += ',';
      }
    }

    next += _sourcemaplibsourcemapgeneratorjs056_base64VLQ.encode(mapping.generatedColumn - previousGeneratedColumn);
    previousGeneratedColumn = mapping.generatedColumn;

    if (mapping.source != null) {
      sourceIdx = this._sources.indexOf(mapping.source);
      next += _sourcemaplibsourcemapgeneratorjs056_base64VLQ.encode(sourceIdx - previousSource);
      previousSource = sourceIdx;

      // lines are stored 0-based in SourceMap spec version 3
      next += _sourcemaplibsourcemapgeneratorjs056_base64VLQ.encode(mapping.originalLine - 1 - previousOriginalLine);
      previousOriginalLine = mapping.originalLine - 1;

      next += _sourcemaplibsourcemapgeneratorjs056_base64VLQ.encode(mapping.originalColumn - previousOriginalColumn);
      previousOriginalColumn = mapping.originalColumn;

      if (mapping.name != null) {
        nameIdx = this._names.indexOf(mapping.name);
        next += _sourcemaplibsourcemapgeneratorjs056_base64VLQ.encode(nameIdx - previousName);
        previousName = nameIdx;
      }
    }

    result += next;
  }

  return result;
};

_sourcemaplibsourcemapgeneratorjs056_SourceMapGenerator.prototype._generateSourcesContent = function SourceMapGenerator_generateSourcesContent(aSources, aSourceRoot) {
  return aSources.map(function (source) {
    if (!this._sourcesContents) {
      return null;
    }
    if (aSourceRoot != null) {
      source = _sourcemaplibsourcemapgeneratorjs056_util.relative(aSourceRoot, source);
    }
    var key = _sourcemaplibsourcemapgeneratorjs056_util.toSetString(source);
    return Object.prototype.hasOwnProperty.call(this._sourcesContents, key) ? this._sourcesContents[key] : null;
  }, this);
};

/**
 * Externalize the source map.
 */
_sourcemaplibsourcemapgeneratorjs056_SourceMapGenerator.prototype.toJSON = function SourceMapGenerator_toJSON() {
  var map = {
    version: this._version,
    sources: this._sources.toArray(),
    names: this._names.toArray(),
    mappings: this._serializeMappings()
  };
  if (this._file != null) {
    map.file = this._file;
  }
  if (this._sourceRoot != null) {
    map.sourceRoot = this._sourceRoot;
  }
  if (this._sourcesContents) {
    map.sourcesContent = this._generateSourcesContent(map.sources, map.sourceRoot);
  }

  return map;
};

/**
 * Render the source map being generated to a string.
 */
_sourcemaplibsourcemapgeneratorjs056_SourceMapGenerator.prototype.toString = function SourceMapGenerator_toString() {
  return JSON.stringify(this.toJSON());
};

$m['source-map/lib/source-map-generator.js#0.5.6'].exports.SourceMapGenerator = _sourcemaplibsourcemapgeneratorjs056_SourceMapGenerator;
/*≠≠ node_modules/source-map/lib/source-map-generator.js ≠≠*/

/*== node_modules/source-map/lib/source-node.js ==*/
$m['source-map/lib/source-node.js#0.5.6'] = { exports: {} };
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var _sourcemaplibsourcenodejs056_SourceMapGenerator = $m['source-map/lib/source-map-generator.js#0.5.6'].exports.SourceMapGenerator;
var _sourcemaplibsourcenodejs056_util = $m['source-map/lib/util.js#0.5.6'].exports;

// Matches a Windows-style `\r\n` newline or a `\n` newline used by all other
// operating systems these days (capturing the result).
var _sourcemaplibsourcenodejs056_REGEX_NEWLINE = /(\r?\n)/;

// Newline character code for charCodeAt() comparisons
var _sourcemaplibsourcenodejs056_NEWLINE_CODE = 10;

// Private symbol for identifying `SourceNode`s when multiple versions of
// the source-map library are loaded. This MUST NOT CHANGE across
// versions!
var _sourcemaplibsourcenodejs056_isSourceNode = "$$$isSourceNode$$$";

/**
 * SourceNodes provide a way to abstract over interpolating/concatenating
 * snippets of generated JavaScript source code while maintaining the line and
 * column information associated with the original source code.
 *
 * @param aLine The original line number.
 * @param aColumn The original column number.
 * @param aSource The original source's filename.
 * @param aChunks Optional. An array of strings which are snippets of
 *        generated JS, or other SourceNodes.
 * @param aName The original identifier.
 */
function _sourcemaplibsourcenodejs056_SourceNode(aLine, aColumn, aSource, aChunks, aName) {
  this.children = [];
  this.sourceContents = {};
  this.line = aLine == null ? null : aLine;
  this.column = aColumn == null ? null : aColumn;
  this.source = aSource == null ? null : aSource;
  this.name = aName == null ? null : aName;
  this[_sourcemaplibsourcenodejs056_isSourceNode] = true;
  if (aChunks != null) this.add(aChunks);
}

/**
 * Creates a SourceNode from generated code and a SourceMapConsumer.
 *
 * @param aGeneratedCode The generated code
 * @param aSourceMapConsumer The SourceMap for the generated code
 * @param aRelativePath Optional. The path that relative sources in the
 *        SourceMapConsumer should be relative to.
 */
_sourcemaplibsourcenodejs056_SourceNode.fromStringWithSourceMap = function SourceNode_fromStringWithSourceMap(aGeneratedCode, aSourceMapConsumer, aRelativePath) {
  // The SourceNode we want to fill with the generated code
  // and the SourceMap
  var node = new _sourcemaplibsourcenodejs056_SourceNode();

  // All even indices of this array are one line of the generated code,
  // while all odd indices are the newlines between two adjacent lines
  // (since `REGEX_NEWLINE` captures its match).
  // Processed fragments are removed from this array, by calling `shiftNextLine`.
  var remainingLines = aGeneratedCode.split(_sourcemaplibsourcenodejs056_REGEX_NEWLINE);
  var shiftNextLine = function () {
    var lineContents = remainingLines.shift();
    // The last line of a file might not have a newline.
    var newLine = remainingLines.shift() || "";
    return lineContents + newLine;
  };

  // We need to remember the position of "remainingLines"
  var lastGeneratedLine = 1,
      lastGeneratedColumn = 0;

  // The generate SourceNodes we need a code range.
  // To extract it current and last mapping is used.
  // Here we store the last mapping.
  var lastMapping = null;

  aSourceMapConsumer.eachMapping(function (mapping) {
    if (lastMapping !== null) {
      // We add the code from "lastMapping" to "mapping":
      // First check if there is a new line in between.
      if (lastGeneratedLine < mapping.generatedLine) {
        // Associate first line with "lastMapping"
        addMappingWithCode(lastMapping, shiftNextLine());
        lastGeneratedLine++;
        lastGeneratedColumn = 0;
        // The remaining code is added without mapping
      } else {
        // There is no new line in between.
        // Associate the code between "lastGeneratedColumn" and
        // "mapping.generatedColumn" with "lastMapping"
        var nextLine = remainingLines[0];
        var code = nextLine.substr(0, mapping.generatedColumn - lastGeneratedColumn);
        remainingLines[0] = nextLine.substr(mapping.generatedColumn - lastGeneratedColumn);
        lastGeneratedColumn = mapping.generatedColumn;
        addMappingWithCode(lastMapping, code);
        // No more remaining code, continue
        lastMapping = mapping;
        return;
      }
    }
    // We add the generated code until the first mapping
    // to the SourceNode without any mapping.
    // Each line is added as separate string.
    while (lastGeneratedLine < mapping.generatedLine) {
      node.add(shiftNextLine());
      lastGeneratedLine++;
    }
    if (lastGeneratedColumn < mapping.generatedColumn) {
      var nextLine = remainingLines[0];
      node.add(nextLine.substr(0, mapping.generatedColumn));
      remainingLines[0] = nextLine.substr(mapping.generatedColumn);
      lastGeneratedColumn = mapping.generatedColumn;
    }
    lastMapping = mapping;
  }, this);
  // We have processed all mappings.
  if (remainingLines.length > 0) {
    if (lastMapping) {
      // Associate the remaining code in the current line with "lastMapping"
      addMappingWithCode(lastMapping, shiftNextLine());
    }
    // and add the remaining lines without any mapping
    node.add(remainingLines.join(""));
  }

  // Copy sourcesContent into SourceNode
  aSourceMapConsumer.sources.forEach(function (sourceFile) {
    var content = aSourceMapConsumer.sourceContentFor(sourceFile);
    if (content != null) {
      if (aRelativePath != null) {
        sourceFile = _sourcemaplibsourcenodejs056_util.join(aRelativePath, sourceFile);
      }
      node.setSourceContent(sourceFile, content);
    }
  });

  return node;

  function addMappingWithCode(mapping, code) {
    if (mapping === null || mapping.source === undefined) {
      node.add(code);
    } else {
      var source = aRelativePath ? _sourcemaplibsourcenodejs056_util.join(aRelativePath, mapping.source) : mapping.source;
      node.add(new _sourcemaplibsourcenodejs056_SourceNode(mapping.originalLine, mapping.originalColumn, source, code, mapping.name));
    }
  }
};

/**
 * Add a chunk of generated JS to this source node.
 *
 * @param aChunk A string snippet of generated JS code, another instance of
 *        SourceNode, or an array where each member is one of those things.
 */
_sourcemaplibsourcenodejs056_SourceNode.prototype.add = function SourceNode_add(aChunk) {
  if (Array.isArray(aChunk)) {
    aChunk.forEach(function (chunk) {
      this.add(chunk);
    }, this);
  } else if (aChunk[_sourcemaplibsourcenodejs056_isSourceNode] || typeof aChunk === "string") {
    if (aChunk) {
      this.children.push(aChunk);
    }
  } else {
    throw new TypeError("Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk);
  }
  return this;
};

/**
 * Add a chunk of generated JS to the beginning of this source node.
 *
 * @param aChunk A string snippet of generated JS code, another instance of
 *        SourceNode, or an array where each member is one of those things.
 */
_sourcemaplibsourcenodejs056_SourceNode.prototype.prepend = function SourceNode_prepend(aChunk) {
  if (Array.isArray(aChunk)) {
    for (var i = aChunk.length - 1; i >= 0; i--) {
      this.prepend(aChunk[i]);
    }
  } else if (aChunk[_sourcemaplibsourcenodejs056_isSourceNode] || typeof aChunk === "string") {
    this.children.unshift(aChunk);
  } else {
    throw new TypeError("Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk);
  }
  return this;
};

/**
 * Walk over the tree of JS snippets in this node and its children. The
 * walking function is called once for each snippet of JS and is passed that
 * snippet and the its original associated source's line/column location.
 *
 * @param aFn The traversal function.
 */
_sourcemaplibsourcenodejs056_SourceNode.prototype.walk = function SourceNode_walk(aFn) {
  var chunk;
  for (var i = 0, len = this.children.length; i < len; i++) {
    chunk = this.children[i];
    if (chunk[_sourcemaplibsourcenodejs056_isSourceNode]) {
      chunk.walk(aFn);
    } else {
      if (chunk !== '') {
        aFn(chunk, { source: this.source,
          line: this.line,
          column: this.column,
          name: this.name });
      }
    }
  }
};

/**
 * Like `String.prototype.join` except for SourceNodes. Inserts `aStr` between
 * each of `this.children`.
 *
 * @param aSep The separator.
 */
_sourcemaplibsourcenodejs056_SourceNode.prototype.join = function SourceNode_join(aSep) {
  var newChildren;
  var i;
  var len = this.children.length;
  if (len > 0) {
    newChildren = [];
    for (i = 0; i < len - 1; i++) {
      newChildren.push(this.children[i]);
      newChildren.push(aSep);
    }
    newChildren.push(this.children[i]);
    this.children = newChildren;
  }
  return this;
};

/**
 * Call String.prototype.replace on the very right-most source snippet. Useful
 * for trimming whitespace from the end of a source node, etc.
 *
 * @param aPattern The pattern to replace.
 * @param aReplacement The thing to replace the pattern with.
 */
_sourcemaplibsourcenodejs056_SourceNode.prototype.replaceRight = function SourceNode_replaceRight(aPattern, aReplacement) {
  var lastChild = this.children[this.children.length - 1];
  if (lastChild[_sourcemaplibsourcenodejs056_isSourceNode]) {
    lastChild.replaceRight(aPattern, aReplacement);
  } else if (typeof lastChild === 'string') {
    this.children[this.children.length - 1] = lastChild.replace(aPattern, aReplacement);
  } else {
    this.children.push(''.replace(aPattern, aReplacement));
  }
  return this;
};

/**
 * Set the source content for a source file. This will be added to the SourceMapGenerator
 * in the sourcesContent field.
 *
 * @param aSourceFile The filename of the source file
 * @param aSourceContent The content of the source file
 */
_sourcemaplibsourcenodejs056_SourceNode.prototype.setSourceContent = function SourceNode_setSourceContent(aSourceFile, aSourceContent) {
  this.sourceContents[_sourcemaplibsourcenodejs056_util.toSetString(aSourceFile)] = aSourceContent;
};

/**
 * Walk over the tree of SourceNodes. The walking function is called for each
 * source file content and is passed the filename and source content.
 *
 * @param aFn The traversal function.
 */
_sourcemaplibsourcenodejs056_SourceNode.prototype.walkSourceContents = function SourceNode_walkSourceContents(aFn) {
  for (var i = 0, len = this.children.length; i < len; i++) {
    if (this.children[i][_sourcemaplibsourcenodejs056_isSourceNode]) {
      this.children[i].walkSourceContents(aFn);
    }
  }

  var sources = Object.keys(this.sourceContents);
  for (var i = 0, len = sources.length; i < len; i++) {
    aFn(_sourcemaplibsourcenodejs056_util.fromSetString(sources[i]), this.sourceContents[sources[i]]);
  }
};

/**
 * Return the string representation of this source node. Walks over the tree
 * and concatenates all the various snippets together to one string.
 */
_sourcemaplibsourcenodejs056_SourceNode.prototype.toString = function SourceNode_toString() {
  var str = "";
  this.walk(function (chunk) {
    str += chunk;
  });
  return str;
};

/**
 * Returns the string representation of this source node along with a source
 * map.
 */
_sourcemaplibsourcenodejs056_SourceNode.prototype.toStringWithSourceMap = function SourceNode_toStringWithSourceMap(aArgs) {
  var generated = {
    code: "",
    line: 1,
    column: 0
  };
  var map = new _sourcemaplibsourcenodejs056_SourceMapGenerator(aArgs);
  var sourceMappingActive = false;
  var lastOriginalSource = null;
  var lastOriginalLine = null;
  var lastOriginalColumn = null;
  var lastOriginalName = null;
  this.walk(function (chunk, original) {
    generated.code += chunk;
    if (original.source !== null && original.line !== null && original.column !== null) {
      if (lastOriginalSource !== original.source || lastOriginalLine !== original.line || lastOriginalColumn !== original.column || lastOriginalName !== original.name) {
        map.addMapping({
          source: original.source,
          original: {
            line: original.line,
            column: original.column
          },
          generated: {
            line: generated.line,
            column: generated.column
          },
          name: original.name
        });
      }
      lastOriginalSource = original.source;
      lastOriginalLine = original.line;
      lastOriginalColumn = original.column;
      lastOriginalName = original.name;
      sourceMappingActive = true;
    } else if (sourceMappingActive) {
      map.addMapping({
        generated: {
          line: generated.line,
          column: generated.column
        }
      });
      lastOriginalSource = null;
      sourceMappingActive = false;
    }
    for (var idx = 0, length = chunk.length; idx < length; idx++) {
      if (chunk.charCodeAt(idx) === _sourcemaplibsourcenodejs056_NEWLINE_CODE) {
        generated.line++;
        generated.column = 0;
        // Mappings end at eol
        if (idx + 1 === length) {
          lastOriginalSource = null;
          sourceMappingActive = false;
        } else if (sourceMappingActive) {
          map.addMapping({
            source: original.source,
            original: {
              line: original.line,
              column: original.column
            },
            generated: {
              line: generated.line,
              column: generated.column
            },
            name: original.name
          });
        }
      } else {
        generated.column++;
      }
    }
  });
  this.walkSourceContents(function (sourceFile, sourceContent) {
    map.setSourceContent(sourceFile, sourceContent);
  });

  return { code: generated.code, map: map };
};

$m['source-map/lib/source-node.js#0.5.6'].exports.SourceNode = _sourcemaplibsourcenodejs056_SourceNode;
/*≠≠ node_modules/source-map/lib/source-node.js ≠≠*/

/*== node_modules/source-map/lib/quick-sort.js ==*/
$m['source-map/lib/quick-sort.js#0.5.6'] = { exports: {} };
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

// It turns out that some (most?) JavaScript engines don't self-host
// `Array.prototype.sort`. This makes sense because C++ will likely remain
// faster than JS when doing raw CPU-intensive sorting. However, when using a
// custom comparator function, calling back and forth between the VM's C++ and
// JIT'd JS is rather slow *and* loses JIT type information, resulting in
// worse generated code for the comparator function than would be optimal. In
// fact, when sorting with a comparator, these costs outweigh the benefits of
// sorting in C++. By using our own JS-implemented Quick Sort (below), we get
// a ~3500ms mean speed-up in `bench/bench.html`.

/**
 * Swap the elements indexed by `x` and `y` in the array `ary`.
 *
 * @param {Array} ary
 *        The array.
 * @param {Number} x
 *        The index of the first item.
 * @param {Number} y
 *        The index of the second item.
 */
function _sourcemaplibquicksortjs056_swap(ary, x, y) {
  var temp = ary[x];
  ary[x] = ary[y];
  ary[y] = temp;
}

/**
 * Returns a random integer within the range `low .. high` inclusive.
 *
 * @param {Number} low
 *        The lower bound on the range.
 * @param {Number} high
 *        The upper bound on the range.
 */
function _sourcemaplibquicksortjs056_randomIntInRange(low, high) {
  return Math.round(low + Math.random() * (high - low));
}

/**
 * The Quick Sort algorithm.
 *
 * @param {Array} ary
 *        An array to sort.
 * @param {function} comparator
 *        Function to use to compare two items.
 * @param {Number} p
 *        Start index of the array
 * @param {Number} r
 *        End index of the array
 */
function _sourcemaplibquicksortjs056_doQuickSort(ary, comparator, p, r) {
  // If our lower bound is less than our upper bound, we (1) partition the
  // array into two pieces and (2) recurse on each half. If it is not, this is
  // the empty array and our base case.

  if (p < r) {
    // (1) Partitioning.
    //
    // The partitioning chooses a pivot between `p` and `r` and moves all
    // elements that are less than or equal to the pivot to the before it, and
    // all the elements that are greater than it after it. The effect is that
    // once partition is done, the pivot is in the exact place it will be when
    // the array is put in sorted order, and it will not need to be moved
    // again. This runs in O(n) time.

    // Always choose a random pivot so that an input array which is reverse
    // sorted does not cause O(n^2) running time.
    var pivotIndex = _sourcemaplibquicksortjs056_randomIntInRange(p, r);
    var i = p - 1;

    _sourcemaplibquicksortjs056_swap(ary, pivotIndex, r);
    var pivot = ary[r];

    // Immediately after `j` is incremented in this loop, the following hold
    // true:
    //
    //   * Every element in `ary[p .. i]` is less than or equal to the pivot.
    //
    //   * Every element in `ary[i+1 .. j-1]` is greater than the pivot.
    for (var j = p; j < r; j++) {
      if (comparator(ary[j], pivot) <= 0) {
        i += 1;
        _sourcemaplibquicksortjs056_swap(ary, i, j);
      }
    }

    _sourcemaplibquicksortjs056_swap(ary, i + 1, j);
    var q = i + 1;

    // (2) Recurse on each half.

    _sourcemaplibquicksortjs056_doQuickSort(ary, comparator, p, q - 1);
    _sourcemaplibquicksortjs056_doQuickSort(ary, comparator, q + 1, r);
  }
}

/**
 * Sort the given array in-place with the given comparator function.
 *
 * @param {Array} ary
 *        An array to sort.
 * @param {function} comparator
 *        Function to use to compare two items.
 */
$m['source-map/lib/quick-sort.js#0.5.6'].exports.quickSort = function (ary, comparator) {
  _sourcemaplibquicksortjs056_doQuickSort(ary, comparator, 0, ary.length - 1);
};
/*≠≠ node_modules/source-map/lib/quick-sort.js ≠≠*/

/*== node_modules/source-map/lib/binary-search.js ==*/
$m['source-map/lib/binary-search.js#0.5.6'] = { exports: {} };
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

$m['source-map/lib/binary-search.js#0.5.6'].exports.GREATEST_LOWER_BOUND = 1;
$m['source-map/lib/binary-search.js#0.5.6'].exports.LEAST_UPPER_BOUND = 2;

/**
 * Recursive implementation of binary search.
 *
 * @param aLow Indices here and lower do not contain the needle.
 * @param aHigh Indices here and higher do not contain the needle.
 * @param aNeedle The element being searched for.
 * @param aHaystack The non-empty array being searched.
 * @param aCompare Function which takes two elements and returns -1, 0, or 1.
 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 */
function _sourcemaplibbinarysearchjs056_recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare, aBias) {
  // This function terminates when one of the following is true:
  //
  //   1. We find the exact element we are looking for.
  //
  //   2. We did not find the exact element, but we can return the index of
  //      the next-closest element.
  //
  //   3. We did not find the exact element, and there is no next-closest
  //      element than the one we are searching for, so we return -1.
  var mid = Math.floor((aHigh - aLow) / 2) + aLow;
  var cmp = aCompare(aNeedle, aHaystack[mid], true);
  if (cmp === 0) {
    // Found the element we are looking for.
    return mid;
  } else if (cmp > 0) {
    // Our needle is greater than aHaystack[mid].
    if (aHigh - mid > 1) {
      // The element is in the upper half.
      return _sourcemaplibbinarysearchjs056_recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare, aBias);
    }

    // The exact needle element was not found in this haystack. Determine if
    // we are in termination case (3) or (2) and return the appropriate thing.
    if (aBias == $m['source-map/lib/binary-search.js#0.5.6'].exports.LEAST_UPPER_BOUND) {
      return aHigh < aHaystack.length ? aHigh : -1;
    } else {
      return mid;
    }
  } else {
    // Our needle is less than aHaystack[mid].
    if (mid - aLow > 1) {
      // The element is in the lower half.
      return _sourcemaplibbinarysearchjs056_recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare, aBias);
    }

    // we are in termination case (3) or (2) and return the appropriate thing.
    if (aBias == $m['source-map/lib/binary-search.js#0.5.6'].exports.LEAST_UPPER_BOUND) {
      return mid;
    } else {
      return aLow < 0 ? -1 : aLow;
    }
  }
}

/**
 * This is an implementation of binary search which will always try and return
 * the index of the closest element if there is no exact hit. This is because
 * mappings between original and generated line/col pairs are single points,
 * and there is an implicit region between each of them, so a miss just means
 * that you aren't on the very start of a region.
 *
 * @param aNeedle The element you are looking for.
 * @param aHaystack The array that is being searched.
 * @param aCompare A function which takes the needle and an element in the
 *     array and returns -1, 0, or 1 depending on whether the needle is less
 *     than, equal to, or greater than the element, respectively.
 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'binarySearch.GREATEST_LOWER_BOUND'.
 */
$m['source-map/lib/binary-search.js#0.5.6'].exports.search = function search(aNeedle, aHaystack, aCompare, aBias) {
  if (aHaystack.length === 0) {
    return -1;
  }

  var index = _sourcemaplibbinarysearchjs056_recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack, aCompare, aBias || $m['source-map/lib/binary-search.js#0.5.6'].exports.GREATEST_LOWER_BOUND);
  if (index < 0) {
    return -1;
  }

  // We have found either the exact element, or the next-closest element than
  // the one we are searching for. However, there may be more than one such
  // element. Make sure we always return the smallest of these.
  while (index - 1 >= 0) {
    if (aCompare(aHaystack[index], aHaystack[index - 1], true) !== 0) {
      break;
    }
    --index;
  }

  return index;
};
/*≠≠ node_modules/source-map/lib/binary-search.js ≠≠*/

/*== node_modules/source-map/lib/source-map-consumer.js ==*/
$m['source-map/lib/source-map-consumer.js#0.5.6'] = { exports: {} };
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var _sourcemaplibsourcemapconsumerjs056_util = $m['source-map/lib/util.js#0.5.6'].exports;
var _sourcemaplibsourcemapconsumerjs056_binarySearch = $m['source-map/lib/binary-search.js#0.5.6'].exports;
var _sourcemaplibsourcemapconsumerjs056_ArraySet = $m['source-map/lib/array-set.js#0.5.6'].exports.ArraySet;
var _sourcemaplibsourcemapconsumerjs056_base64VLQ = $m['source-map/lib/base64-vlq.js#0.5.6'].exports;
var _sourcemaplibsourcemapconsumerjs056_quickSort = $m['source-map/lib/quick-sort.js#0.5.6'].exports.quickSort;

function _sourcemaplibsourcemapconsumerjs056_SourceMapConsumer(aSourceMap) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
  }

  return sourceMap.sections != null ? new _sourcemaplibsourcemapconsumerjs056_IndexedSourceMapConsumer(sourceMap) : new _sourcemaplibsourcemapconsumerjs056_BasicSourceMapConsumer(sourceMap);
}

_sourcemaplibsourcemapconsumerjs056_SourceMapConsumer.fromSourceMap = function (aSourceMap) {
  return _sourcemaplibsourcemapconsumerjs056_BasicSourceMapConsumer.fromSourceMap(aSourceMap);
};

/**
 * The version of the source mapping spec that we are consuming.
 */
_sourcemaplibsourcemapconsumerjs056_SourceMapConsumer.prototype._version = 3;

// `__generatedMappings` and `__originalMappings` are arrays that hold the
// parsed mapping coordinates from the source map's "mappings" attribute. They
// are lazily instantiated, accessed via the `_generatedMappings` and
// `_originalMappings` getters respectively, and we only parse the mappings
// and create these arrays once queried for a source location. We jump through
// these hoops because there can be many thousands of mappings, and parsing
// them is expensive, so we only want to do it if we must.
//
// Each object in the arrays is of the form:
//
//     {
//       generatedLine: The line number in the generated code,
//       generatedColumn: The column number in the generated code,
//       source: The path to the original source file that generated this
//               chunk of code,
//       originalLine: The line number in the original source that
//                     corresponds to this chunk of generated code,
//       originalColumn: The column number in the original source that
//                       corresponds to this chunk of generated code,
//       name: The name of the original symbol which generated this chunk of
//             code.
//     }
//
// All properties except for `generatedLine` and `generatedColumn` can be
// `null`.
//
// `_generatedMappings` is ordered by the generated positions.
//
// `_originalMappings` is ordered by the original positions.

_sourcemaplibsourcemapconsumerjs056_SourceMapConsumer.prototype.__generatedMappings = null;
Object.defineProperty(_sourcemaplibsourcemapconsumerjs056_SourceMapConsumer.prototype, '_generatedMappings', {
  get: function () {
    if (!this.__generatedMappings) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }

    return this.__generatedMappings;
  }
});

_sourcemaplibsourcemapconsumerjs056_SourceMapConsumer.prototype.__originalMappings = null;
Object.defineProperty(_sourcemaplibsourcemapconsumerjs056_SourceMapConsumer.prototype, '_originalMappings', {
  get: function () {
    if (!this.__originalMappings) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }

    return this.__originalMappings;
  }
});

_sourcemaplibsourcemapconsumerjs056_SourceMapConsumer.prototype._charIsMappingSeparator = function SourceMapConsumer_charIsMappingSeparator(aStr, index) {
  var c = aStr.charAt(index);
  return c === ";" || c === ",";
};

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
_sourcemaplibsourcemapconsumerjs056_SourceMapConsumer.prototype._parseMappings = function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
  throw new Error("Subclasses must implement _parseMappings");
};

_sourcemaplibsourcemapconsumerjs056_SourceMapConsumer.GENERATED_ORDER = 1;
_sourcemaplibsourcemapconsumerjs056_SourceMapConsumer.ORIGINAL_ORDER = 2;

_sourcemaplibsourcemapconsumerjs056_SourceMapConsumer.GREATEST_LOWER_BOUND = 1;
_sourcemaplibsourcemapconsumerjs056_SourceMapConsumer.LEAST_UPPER_BOUND = 2;

/**
 * Iterate over each mapping between an original source/line/column and a
 * generated line/column in this source map.
 *
 * @param Function aCallback
 *        The function that is called with each mapping.
 * @param Object aContext
 *        Optional. If specified, this object will be the value of `this` every
 *        time that `aCallback` is called.
 * @param aOrder
 *        Either `SourceMapConsumer.GENERATED_ORDER` or
 *        `SourceMapConsumer.ORIGINAL_ORDER`. Specifies whether you want to
 *        iterate over the mappings sorted by the generated file's line/column
 *        order or the original's source/line/column order, respectively. Defaults to
 *        `SourceMapConsumer.GENERATED_ORDER`.
 */
_sourcemaplibsourcemapconsumerjs056_SourceMapConsumer.prototype.eachMapping = function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
  var context = aContext || null;
  var order = aOrder || _sourcemaplibsourcemapconsumerjs056_SourceMapConsumer.GENERATED_ORDER;

  var mappings;
  switch (order) {
    case _sourcemaplibsourcemapconsumerjs056_SourceMapConsumer.GENERATED_ORDER:
      mappings = this._generatedMappings;
      break;
    case _sourcemaplibsourcemapconsumerjs056_SourceMapConsumer.ORIGINAL_ORDER:
      mappings = this._originalMappings;
      break;
    default:
      throw new Error("Unknown order of iteration.");
  }

  var sourceRoot = this.sourceRoot;
  mappings.map(function (mapping) {
    var source = mapping.source === null ? null : this._sources.at(mapping.source);
    if (source != null && sourceRoot != null) {
      source = _sourcemaplibsourcemapconsumerjs056_util.join(sourceRoot, source);
    }
    return {
      source: source,
      generatedLine: mapping.generatedLine,
      generatedColumn: mapping.generatedColumn,
      originalLine: mapping.originalLine,
      originalColumn: mapping.originalColumn,
      name: mapping.name === null ? null : this._names.at(mapping.name)
    };
  }, this).forEach(aCallback, context);
};

/**
 * Returns all generated line and column information for the original source,
 * line, and column provided. If no column is provided, returns all mappings
 * corresponding to a either the line we are searching for or the next
 * closest line that has any mappings. Otherwise, returns all mappings
 * corresponding to the given line and either the column we are searching for
 * or the next closest column that has any offsets.
 *
 * The only argument is an object with the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.
 *   - column: Optional. the column number in the original source.
 *
 * and an array of objects is returned, each with the following properties:
 *
 *   - line: The line number in the generated source, or null.
 *   - column: The column number in the generated source, or null.
 */
_sourcemaplibsourcemapconsumerjs056_SourceMapConsumer.prototype.allGeneratedPositionsFor = function SourceMapConsumer_allGeneratedPositionsFor(aArgs) {
  var line = _sourcemaplibsourcemapconsumerjs056_util.getArg(aArgs, 'line');

  // When there is no exact match, BasicSourceMapConsumer.prototype._findMapping
  // returns the index of the closest mapping less than the needle. By
  // setting needle.originalColumn to 0, we thus find the last mapping for
  // the given line, provided such a mapping exists.
  var needle = {
    source: _sourcemaplibsourcemapconsumerjs056_util.getArg(aArgs, 'source'),
    originalLine: line,
    originalColumn: _sourcemaplibsourcemapconsumerjs056_util.getArg(aArgs, 'column', 0)
  };

  if (this.sourceRoot != null) {
    needle.source = _sourcemaplibsourcemapconsumerjs056_util.relative(this.sourceRoot, needle.source);
  }
  if (!this._sources.has(needle.source)) {
    return [];
  }
  needle.source = this._sources.indexOf(needle.source);

  var mappings = [];

  var index = this._findMapping(needle, this._originalMappings, "originalLine", "originalColumn", _sourcemaplibsourcemapconsumerjs056_util.compareByOriginalPositions, _sourcemaplibsourcemapconsumerjs056_binarySearch.LEAST_UPPER_BOUND);
  if (index >= 0) {
    var mapping = this._originalMappings[index];

    if (aArgs.column === undefined) {
      var originalLine = mapping.originalLine;

      // Iterate until either we run out of mappings, or we run into
      // a mapping for a different line than the one we found. Since
      // mappings are sorted, this is guaranteed to find all mappings for
      // the line we found.
      while (mapping && mapping.originalLine === originalLine) {
        mappings.push({
          line: _sourcemaplibsourcemapconsumerjs056_util.getArg(mapping, 'generatedLine', null),
          column: _sourcemaplibsourcemapconsumerjs056_util.getArg(mapping, 'generatedColumn', null),
          lastColumn: _sourcemaplibsourcemapconsumerjs056_util.getArg(mapping, 'lastGeneratedColumn', null)
        });

        mapping = this._originalMappings[++index];
      }
    } else {
      var originalColumn = mapping.originalColumn;

      // Iterate until either we run out of mappings, or we run into
      // a mapping for a different line than the one we were searching for.
      // Since mappings are sorted, this is guaranteed to find all mappings for
      // the line we are searching for.
      while (mapping && mapping.originalLine === line && mapping.originalColumn == originalColumn) {
        mappings.push({
          line: _sourcemaplibsourcemapconsumerjs056_util.getArg(mapping, 'generatedLine', null),
          column: _sourcemaplibsourcemapconsumerjs056_util.getArg(mapping, 'generatedColumn', null),
          lastColumn: _sourcemaplibsourcemapconsumerjs056_util.getArg(mapping, 'lastGeneratedColumn', null)
        });

        mapping = this._originalMappings[++index];
      }
    }
  }

  return mappings;
};

$m['source-map/lib/source-map-consumer.js#0.5.6'].exports.SourceMapConsumer = _sourcemaplibsourcemapconsumerjs056_SourceMapConsumer;

/**
 * A BasicSourceMapConsumer instance represents a parsed source map which we can
 * query for information about the original file positions by giving it a file
 * position in the generated source.
 *
 * The only parameter is the raw source map (either as a JSON string, or
 * already parsed to an object). According to the spec, source maps have the
 * following attributes:
 *
 *   - version: Which version of the source map spec this map is following.
 *   - sources: An array of URLs to the original source files.
 *   - names: An array of identifiers which can be referrenced by individual mappings.
 *   - sourceRoot: Optional. The URL root from which all sources are relative.
 *   - sourcesContent: Optional. An array of contents of the original source files.
 *   - mappings: A string of base64 VLQs which contain the actual mappings.
 *   - file: Optional. The generated file this source map is associated with.
 *
 * Here is an example source map, taken from the source map spec[0]:
 *
 *     {
 *       version : 3,
 *       file: "out.js",
 *       sourceRoot : "",
 *       sources: ["foo.js", "bar.js"],
 *       names: ["src", "maps", "are", "fun"],
 *       mappings: "AA,AB;;ABCDE;"
 *     }
 *
 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#
 */
function _sourcemaplibsourcemapconsumerjs056_BasicSourceMapConsumer(aSourceMap) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
  }

  var version = _sourcemaplibsourcemapconsumerjs056_util.getArg(sourceMap, 'version');
  var sources = _sourcemaplibsourcemapconsumerjs056_util.getArg(sourceMap, 'sources');
  // Sass 3.3 leaves out the 'names' array, so we deviate from the spec (which
  // requires the array) to play nice here.
  var names = _sourcemaplibsourcemapconsumerjs056_util.getArg(sourceMap, 'names', []);
  var sourceRoot = _sourcemaplibsourcemapconsumerjs056_util.getArg(sourceMap, 'sourceRoot', null);
  var sourcesContent = _sourcemaplibsourcemapconsumerjs056_util.getArg(sourceMap, 'sourcesContent', null);
  var mappings = _sourcemaplibsourcemapconsumerjs056_util.getArg(sourceMap, 'mappings');
  var file = _sourcemaplibsourcemapconsumerjs056_util.getArg(sourceMap, 'file', null);

  // Once again, Sass deviates from the spec and supplies the version as a
  // string rather than a number, so we use loose equality checking here.
  if (version != this._version) {
    throw new Error('Unsupported version: ' + version);
  }

  sources = sources.map(String)
  // Some source maps produce relative source paths like "./foo.js" instead of
  // "foo.js".  Normalize these first so that future comparisons will succeed.
  // See bugzil.la/1090768.
  .map(_sourcemaplibsourcemapconsumerjs056_util.normalize)
  // Always ensure that absolute sources are internally stored relative to
  // the source root, if the source root is absolute. Not doing this would
  // be particularly problematic when the source root is a prefix of the
  // source (valid, but why??). See github issue #199 and bugzil.la/1188982.
  .map(function (source) {
    return sourceRoot && _sourcemaplibsourcemapconsumerjs056_util.isAbsolute(sourceRoot) && _sourcemaplibsourcemapconsumerjs056_util.isAbsolute(source) ? _sourcemaplibsourcemapconsumerjs056_util.relative(sourceRoot, source) : source;
  });

  // Pass `true` below to allow duplicate names and sources. While source maps
  // are intended to be compressed and deduplicated, the TypeScript compiler
  // sometimes generates source maps with duplicates in them. See Github issue
  // #72 and bugzil.la/889492.
  this._names = _sourcemaplibsourcemapconsumerjs056_ArraySet.fromArray(names.map(String), true);
  this._sources = _sourcemaplibsourcemapconsumerjs056_ArraySet.fromArray(sources, true);

  this.sourceRoot = sourceRoot;
  this.sourcesContent = sourcesContent;
  this._mappings = mappings;
  this.file = file;
}

_sourcemaplibsourcemapconsumerjs056_BasicSourceMapConsumer.prototype = Object.create(_sourcemaplibsourcemapconsumerjs056_SourceMapConsumer.prototype);
_sourcemaplibsourcemapconsumerjs056_BasicSourceMapConsumer.prototype.consumer = _sourcemaplibsourcemapconsumerjs056_SourceMapConsumer;

/**
 * Create a BasicSourceMapConsumer from a SourceMapGenerator.
 *
 * @param SourceMapGenerator aSourceMap
 *        The source map that will be consumed.
 * @returns BasicSourceMapConsumer
 */
_sourcemaplibsourcemapconsumerjs056_BasicSourceMapConsumer.fromSourceMap = function SourceMapConsumer_fromSourceMap(aSourceMap) {
  var smc = Object.create(_sourcemaplibsourcemapconsumerjs056_BasicSourceMapConsumer.prototype);

  var names = smc._names = _sourcemaplibsourcemapconsumerjs056_ArraySet.fromArray(aSourceMap._names.toArray(), true);
  var sources = smc._sources = _sourcemaplibsourcemapconsumerjs056_ArraySet.fromArray(aSourceMap._sources.toArray(), true);
  smc.sourceRoot = aSourceMap._sourceRoot;
  smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(), smc.sourceRoot);
  smc.file = aSourceMap._file;

  // Because we are modifying the entries (by converting string sources and
  // names to indices into the sources and names ArraySets), we have to make
  // a copy of the entry or else bad things happen. Shared mutable state
  // strikes again! See github issue #191.

  var generatedMappings = aSourceMap._mappings.toArray().slice();
  var destGeneratedMappings = smc.__generatedMappings = [];
  var destOriginalMappings = smc.__originalMappings = [];

  for (var i = 0, length = generatedMappings.length; i < length; i++) {
    var srcMapping = generatedMappings[i];
    var destMapping = new _sourcemaplibsourcemapconsumerjs056_Mapping();
    destMapping.generatedLine = srcMapping.generatedLine;
    destMapping.generatedColumn = srcMapping.generatedColumn;

    if (srcMapping.source) {
      destMapping.source = sources.indexOf(srcMapping.source);
      destMapping.originalLine = srcMapping.originalLine;
      destMapping.originalColumn = srcMapping.originalColumn;

      if (srcMapping.name) {
        destMapping.name = names.indexOf(srcMapping.name);
      }

      destOriginalMappings.push(destMapping);
    }

    destGeneratedMappings.push(destMapping);
  }

  _sourcemaplibsourcemapconsumerjs056_quickSort(smc.__originalMappings, _sourcemaplibsourcemapconsumerjs056_util.compareByOriginalPositions);

  return smc;
};

/**
 * The version of the source mapping spec that we are consuming.
 */
_sourcemaplibsourcemapconsumerjs056_BasicSourceMapConsumer.prototype._version = 3;

/**
 * The list of original sources.
 */
Object.defineProperty(_sourcemaplibsourcemapconsumerjs056_BasicSourceMapConsumer.prototype, 'sources', {
  get: function () {
    return this._sources.toArray().map(function (s) {
      return this.sourceRoot != null ? _sourcemaplibsourcemapconsumerjs056_util.join(this.sourceRoot, s) : s;
    }, this);
  }
});

/**
 * Provide the JIT with a nice shape / hidden class.
 */
function _sourcemaplibsourcemapconsumerjs056_Mapping() {
  this.generatedLine = 0;
  this.generatedColumn = 0;
  this.source = null;
  this.originalLine = null;
  this.originalColumn = null;
  this.name = null;
}

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
_sourcemaplibsourcemapconsumerjs056_BasicSourceMapConsumer.prototype._parseMappings = function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
  var generatedLine = 1;
  var previousGeneratedColumn = 0;
  var previousOriginalLine = 0;
  var previousOriginalColumn = 0;
  var previousSource = 0;
  var previousName = 0;
  var length = aStr.length;
  var index = 0;
  var cachedSegments = {};
  var temp = {};
  var originalMappings = [];
  var generatedMappings = [];
  var mapping, str, segment, end, value;

  while (index < length) {
    if (aStr.charAt(index) === ';') {
      generatedLine++;
      index++;
      previousGeneratedColumn = 0;
    } else if (aStr.charAt(index) === ',') {
      index++;
    } else {
      mapping = new _sourcemaplibsourcemapconsumerjs056_Mapping();
      mapping.generatedLine = generatedLine;

      // Because each offset is encoded relative to the previous one,
      // many segments often have the same encoding. We can exploit this
      // fact by caching the parsed variable length fields of each segment,
      // allowing us to avoid a second parse if we encounter the same
      // segment again.
      for (end = index; end < length; end++) {
        if (this._charIsMappingSeparator(aStr, end)) {
          break;
        }
      }
      str = aStr.slice(index, end);

      segment = cachedSegments[str];
      if (segment) {
        index += str.length;
      } else {
        segment = [];
        while (index < end) {
          _sourcemaplibsourcemapconsumerjs056_base64VLQ.decode(aStr, index, temp);
          value = temp.value;
          index = temp.rest;
          segment.push(value);
        }

        if (segment.length === 2) {
          throw new Error('Found a source, but no line and column');
        }

        if (segment.length === 3) {
          throw new Error('Found a source and line, but no column');
        }

        cachedSegments[str] = segment;
      }

      // Generated column.
      mapping.generatedColumn = previousGeneratedColumn + segment[0];
      previousGeneratedColumn = mapping.generatedColumn;

      if (segment.length > 1) {
        // Original source.
        mapping.source = previousSource + segment[1];
        previousSource += segment[1];

        // Original line.
        mapping.originalLine = previousOriginalLine + segment[2];
        previousOriginalLine = mapping.originalLine;
        // Lines are stored 0-based
        mapping.originalLine += 1;

        // Original column.
        mapping.originalColumn = previousOriginalColumn + segment[3];
        previousOriginalColumn = mapping.originalColumn;

        if (segment.length > 4) {
          // Original name.
          mapping.name = previousName + segment[4];
          previousName += segment[4];
        }
      }

      generatedMappings.push(mapping);
      if (typeof mapping.originalLine === 'number') {
        originalMappings.push(mapping);
      }
    }
  }

  _sourcemaplibsourcemapconsumerjs056_quickSort(generatedMappings, _sourcemaplibsourcemapconsumerjs056_util.compareByGeneratedPositionsDeflated);
  this.__generatedMappings = generatedMappings;

  _sourcemaplibsourcemapconsumerjs056_quickSort(originalMappings, _sourcemaplibsourcemapconsumerjs056_util.compareByOriginalPositions);
  this.__originalMappings = originalMappings;
};

/**
 * Find the mapping that best matches the hypothetical "needle" mapping that
 * we are searching for in the given "haystack" of mappings.
 */
_sourcemaplibsourcemapconsumerjs056_BasicSourceMapConsumer.prototype._findMapping = function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName, aColumnName, aComparator, aBias) {
  // To return the position we are searching for, we must first find the
  // mapping for the given position and then return the opposite position it
  // points to. Because the mappings are sorted, we can use binary search to
  // find the best mapping.

  if (aNeedle[aLineName] <= 0) {
    throw new TypeError('Line must be greater than or equal to 1, got ' + aNeedle[aLineName]);
  }
  if (aNeedle[aColumnName] < 0) {
    throw new TypeError('Column must be greater than or equal to 0, got ' + aNeedle[aColumnName]);
  }

  return _sourcemaplibsourcemapconsumerjs056_binarySearch.search(aNeedle, aMappings, aComparator, aBias);
};

/**
 * Compute the last column for each generated mapping. The last column is
 * inclusive.
 */
_sourcemaplibsourcemapconsumerjs056_BasicSourceMapConsumer.prototype.computeColumnSpans = function SourceMapConsumer_computeColumnSpans() {
  for (var index = 0; index < this._generatedMappings.length; ++index) {
    var mapping = this._generatedMappings[index];

    // Mappings do not contain a field for the last generated columnt. We
    // can come up with an optimistic estimate, however, by assuming that
    // mappings are contiguous (i.e. given two consecutive mappings, the
    // first mapping ends where the second one starts).
    if (index + 1 < this._generatedMappings.length) {
      var nextMapping = this._generatedMappings[index + 1];

      if (mapping.generatedLine === nextMapping.generatedLine) {
        mapping.lastGeneratedColumn = nextMapping.generatedColumn - 1;
        continue;
      }
    }

    // The last mapping for each line spans the entire line.
    mapping.lastGeneratedColumn = Infinity;
  }
};

/**
 * Returns the original source, line, and column information for the generated
 * source's line and column positions provided. The only argument is an object
 * with the following properties:
 *
 *   - line: The line number in the generated source.
 *   - column: The column number in the generated source.
 *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
 *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
 *
 * and an object is returned with the following properties:
 *
 *   - source: The original source file, or null.
 *   - line: The line number in the original source, or null.
 *   - column: The column number in the original source, or null.
 *   - name: The original identifier, or null.
 */
_sourcemaplibsourcemapconsumerjs056_BasicSourceMapConsumer.prototype.originalPositionFor = function SourceMapConsumer_originalPositionFor(aArgs) {
  var needle = {
    generatedLine: _sourcemaplibsourcemapconsumerjs056_util.getArg(aArgs, 'line'),
    generatedColumn: _sourcemaplibsourcemapconsumerjs056_util.getArg(aArgs, 'column')
  };

  var index = this._findMapping(needle, this._generatedMappings, "generatedLine", "generatedColumn", _sourcemaplibsourcemapconsumerjs056_util.compareByGeneratedPositionsDeflated, _sourcemaplibsourcemapconsumerjs056_util.getArg(aArgs, 'bias', _sourcemaplibsourcemapconsumerjs056_SourceMapConsumer.GREATEST_LOWER_BOUND));

  if (index >= 0) {
    var mapping = this._generatedMappings[index];

    if (mapping.generatedLine === needle.generatedLine) {
      var source = _sourcemaplibsourcemapconsumerjs056_util.getArg(mapping, 'source', null);
      if (source !== null) {
        source = this._sources.at(source);
        if (this.sourceRoot != null) {
          source = _sourcemaplibsourcemapconsumerjs056_util.join(this.sourceRoot, source);
        }
      }
      var name = _sourcemaplibsourcemapconsumerjs056_util.getArg(mapping, 'name', null);
      if (name !== null) {
        name = this._names.at(name);
      }
      return {
        source: source,
        line: _sourcemaplibsourcemapconsumerjs056_util.getArg(mapping, 'originalLine', null),
        column: _sourcemaplibsourcemapconsumerjs056_util.getArg(mapping, 'originalColumn', null),
        name: name
      };
    }
  }

  return {
    source: null,
    line: null,
    column: null,
    name: null
  };
};

/**
 * Return true if we have the source content for every source in the source
 * map, false otherwise.
 */
_sourcemaplibsourcemapconsumerjs056_BasicSourceMapConsumer.prototype.hasContentsOfAllSources = function BasicSourceMapConsumer_hasContentsOfAllSources() {
  if (!this.sourcesContent) {
    return false;
  }
  return this.sourcesContent.length >= this._sources.size() && !this.sourcesContent.some(function (sc) {
    return sc == null;
  });
};

/**
 * Returns the original source content. The only argument is the url of the
 * original source file. Returns null if no original source content is
 * available.
 */
_sourcemaplibsourcemapconsumerjs056_BasicSourceMapConsumer.prototype.sourceContentFor = function SourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
  if (!this.sourcesContent) {
    return null;
  }

  if (this.sourceRoot != null) {
    aSource = _sourcemaplibsourcemapconsumerjs056_util.relative(this.sourceRoot, aSource);
  }

  if (this._sources.has(aSource)) {
    return this.sourcesContent[this._sources.indexOf(aSource)];
  }

  var url;
  if (this.sourceRoot != null && (url = _sourcemaplibsourcemapconsumerjs056_util.urlParse(this.sourceRoot))) {
    // XXX: file:// URIs and absolute paths lead to unexpected behavior for
    // many users. We can help them out when they expect file:// URIs to
    // behave like it would if they were running a local HTTP server. See
    // https://bugzilla.mozilla.org/show_bug.cgi?id=885597.
    var fileUriAbsPath = aSource.replace(/^file:\/\//, "");
    if (url.scheme == "file" && this._sources.has(fileUriAbsPath)) {
      return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)];
    }

    if ((!url.path || url.path == "/") && this._sources.has("/" + aSource)) {
      return this.sourcesContent[this._sources.indexOf("/" + aSource)];
    }
  }

  // This function is used recursively from
  // IndexedSourceMapConsumer.prototype.sourceContentFor. In that case, we
  // don't want to throw if we can't find the source - we just want to
  // return null, so we provide a flag to exit gracefully.
  if (nullOnMissing) {
    return null;
  } else {
    throw new Error('"' + aSource + '" is not in the SourceMap.');
  }
};

/**
 * Returns the generated line and column information for the original source,
 * line, and column positions provided. The only argument is an object with
 * the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.
 *   - column: The column number in the original source.
 *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
 *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
 *
 * and an object is returned with the following properties:
 *
 *   - line: The line number in the generated source, or null.
 *   - column: The column number in the generated source, or null.
 */
_sourcemaplibsourcemapconsumerjs056_BasicSourceMapConsumer.prototype.generatedPositionFor = function SourceMapConsumer_generatedPositionFor(aArgs) {
  var source = _sourcemaplibsourcemapconsumerjs056_util.getArg(aArgs, 'source');
  if (this.sourceRoot != null) {
    source = _sourcemaplibsourcemapconsumerjs056_util.relative(this.sourceRoot, source);
  }
  if (!this._sources.has(source)) {
    return {
      line: null,
      column: null,
      lastColumn: null
    };
  }
  source = this._sources.indexOf(source);

  var needle = {
    source: source,
    originalLine: _sourcemaplibsourcemapconsumerjs056_util.getArg(aArgs, 'line'),
    originalColumn: _sourcemaplibsourcemapconsumerjs056_util.getArg(aArgs, 'column')
  };

  var index = this._findMapping(needle, this._originalMappings, "originalLine", "originalColumn", _sourcemaplibsourcemapconsumerjs056_util.compareByOriginalPositions, _sourcemaplibsourcemapconsumerjs056_util.getArg(aArgs, 'bias', _sourcemaplibsourcemapconsumerjs056_SourceMapConsumer.GREATEST_LOWER_BOUND));

  if (index >= 0) {
    var mapping = this._originalMappings[index];

    if (mapping.source === needle.source) {
      return {
        line: _sourcemaplibsourcemapconsumerjs056_util.getArg(mapping, 'generatedLine', null),
        column: _sourcemaplibsourcemapconsumerjs056_util.getArg(mapping, 'generatedColumn', null),
        lastColumn: _sourcemaplibsourcemapconsumerjs056_util.getArg(mapping, 'lastGeneratedColumn', null)
      };
    }
  }

  return {
    line: null,
    column: null,
    lastColumn: null
  };
};

$m['source-map/lib/source-map-consumer.js#0.5.6'].exports.BasicSourceMapConsumer = _sourcemaplibsourcemapconsumerjs056_BasicSourceMapConsumer;

/**
 * An IndexedSourceMapConsumer instance represents a parsed source map which
 * we can query for information. It differs from BasicSourceMapConsumer in
 * that it takes "indexed" source maps (i.e. ones with a "sections" field) as
 * input.
 *
 * The only parameter is a raw source map (either as a JSON string, or already
 * parsed to an object). According to the spec for indexed source maps, they
 * have the following attributes:
 *
 *   - version: Which version of the source map spec this map is following.
 *   - file: Optional. The generated file this source map is associated with.
 *   - sections: A list of section definitions.
 *
 * Each value under the "sections" field has two fields:
 *   - offset: The offset into the original specified at which this section
 *       begins to apply, defined as an object with a "line" and "column"
 *       field.
 *   - map: A source map definition. This source map could also be indexed,
 *       but doesn't have to be.
 *
 * Instead of the "map" field, it's also possible to have a "url" field
 * specifying a URL to retrieve a source map from, but that's currently
 * unsupported.
 *
 * Here's an example source map, taken from the source map spec[0], but
 * modified to omit a section which uses the "url" field.
 *
 *  {
 *    version : 3,
 *    file: "app.js",
 *    sections: [{
 *      offset: {line:100, column:10},
 *      map: {
 *        version : 3,
 *        file: "section.js",
 *        sources: ["foo.js", "bar.js"],
 *        names: ["src", "maps", "are", "fun"],
 *        mappings: "AAAA,E;;ABCDE;"
 *      }
 *    }],
 *  }
 *
 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit#heading=h.535es3xeprgt
 */
function _sourcemaplibsourcemapconsumerjs056_IndexedSourceMapConsumer(aSourceMap) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
  }

  var version = _sourcemaplibsourcemapconsumerjs056_util.getArg(sourceMap, 'version');
  var sections = _sourcemaplibsourcemapconsumerjs056_util.getArg(sourceMap, 'sections');

  if (version != this._version) {
    throw new Error('Unsupported version: ' + version);
  }

  this._sources = new _sourcemaplibsourcemapconsumerjs056_ArraySet();
  this._names = new _sourcemaplibsourcemapconsumerjs056_ArraySet();

  var lastOffset = {
    line: -1,
    column: 0
  };
  this._sections = sections.map(function (s) {
    if (s.url) {
      // The url field will require support for asynchronicity.
      // See https://github.com/mozilla/source-map/issues/16
      throw new Error('Support for url field in sections not implemented.');
    }
    var offset = _sourcemaplibsourcemapconsumerjs056_util.getArg(s, 'offset');
    var offsetLine = _sourcemaplibsourcemapconsumerjs056_util.getArg(offset, 'line');
    var offsetColumn = _sourcemaplibsourcemapconsumerjs056_util.getArg(offset, 'column');

    if (offsetLine < lastOffset.line || offsetLine === lastOffset.line && offsetColumn < lastOffset.column) {
      throw new Error('Section offsets must be ordered and non-overlapping.');
    }
    lastOffset = offset;

    return {
      generatedOffset: {
        // The offset fields are 0-based, but we use 1-based indices when
        // encoding/decoding from VLQ.
        generatedLine: offsetLine + 1,
        generatedColumn: offsetColumn + 1
      },
      consumer: new _sourcemaplibsourcemapconsumerjs056_SourceMapConsumer(_sourcemaplibsourcemapconsumerjs056_util.getArg(s, 'map'))
    };
  });
}

_sourcemaplibsourcemapconsumerjs056_IndexedSourceMapConsumer.prototype = Object.create(_sourcemaplibsourcemapconsumerjs056_SourceMapConsumer.prototype);
_sourcemaplibsourcemapconsumerjs056_IndexedSourceMapConsumer.prototype.constructor = _sourcemaplibsourcemapconsumerjs056_SourceMapConsumer;

/**
 * The version of the source mapping spec that we are consuming.
 */
_sourcemaplibsourcemapconsumerjs056_IndexedSourceMapConsumer.prototype._version = 3;

/**
 * The list of original sources.
 */
Object.defineProperty(_sourcemaplibsourcemapconsumerjs056_IndexedSourceMapConsumer.prototype, 'sources', {
  get: function () {
    var sources = [];
    for (var i = 0; i < this._sections.length; i++) {
      for (var j = 0; j < this._sections[i].consumer.sources.length; j++) {
        sources.push(this._sections[i].consumer.sources[j]);
      }
    }
    return sources;
  }
});

/**
 * Returns the original source, line, and column information for the generated
 * source's line and column positions provided. The only argument is an object
 * with the following properties:
 *
 *   - line: The line number in the generated source.
 *   - column: The column number in the generated source.
 *
 * and an object is returned with the following properties:
 *
 *   - source: The original source file, or null.
 *   - line: The line number in the original source, or null.
 *   - column: The column number in the original source, or null.
 *   - name: The original identifier, or null.
 */
_sourcemaplibsourcemapconsumerjs056_IndexedSourceMapConsumer.prototype.originalPositionFor = function IndexedSourceMapConsumer_originalPositionFor(aArgs) {
  var needle = {
    generatedLine: _sourcemaplibsourcemapconsumerjs056_util.getArg(aArgs, 'line'),
    generatedColumn: _sourcemaplibsourcemapconsumerjs056_util.getArg(aArgs, 'column')
  };

  // Find the section containing the generated position we're trying to map
  // to an original position.
  var sectionIndex = _sourcemaplibsourcemapconsumerjs056_binarySearch.search(needle, this._sections, function (needle, section) {
    var cmp = needle.generatedLine - section.generatedOffset.generatedLine;
    if (cmp) {
      return cmp;
    }

    return needle.generatedColumn - section.generatedOffset.generatedColumn;
  });
  var section = this._sections[sectionIndex];

  if (!section) {
    return {
      source: null,
      line: null,
      column: null,
      name: null
    };
  }

  return section.consumer.originalPositionFor({
    line: needle.generatedLine - (section.generatedOffset.generatedLine - 1),
    column: needle.generatedColumn - (section.generatedOffset.generatedLine === needle.generatedLine ? section.generatedOffset.generatedColumn - 1 : 0),
    bias: aArgs.bias
  });
};

/**
 * Return true if we have the source content for every source in the source
 * map, false otherwise.
 */
_sourcemaplibsourcemapconsumerjs056_IndexedSourceMapConsumer.prototype.hasContentsOfAllSources = function IndexedSourceMapConsumer_hasContentsOfAllSources() {
  return this._sections.every(function (s) {
    return s.consumer.hasContentsOfAllSources();
  });
};

/**
 * Returns the original source content. The only argument is the url of the
 * original source file. Returns null if no original source content is
 * available.
 */
_sourcemaplibsourcemapconsumerjs056_IndexedSourceMapConsumer.prototype.sourceContentFor = function IndexedSourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
  for (var i = 0; i < this._sections.length; i++) {
    var section = this._sections[i];

    var content = section.consumer.sourceContentFor(aSource, true);
    if (content) {
      return content;
    }
  }
  if (nullOnMissing) {
    return null;
  } else {
    throw new Error('"' + aSource + '" is not in the SourceMap.');
  }
};

/**
 * Returns the generated line and column information for the original source,
 * line, and column positions provided. The only argument is an object with
 * the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.
 *   - column: The column number in the original source.
 *
 * and an object is returned with the following properties:
 *
 *   - line: The line number in the generated source, or null.
 *   - column: The column number in the generated source, or null.
 */
_sourcemaplibsourcemapconsumerjs056_IndexedSourceMapConsumer.prototype.generatedPositionFor = function IndexedSourceMapConsumer_generatedPositionFor(aArgs) {
  for (var i = 0; i < this._sections.length; i++) {
    var section = this._sections[i];

    // Only consider this section if the requested source is in the list of
    // sources of the consumer.
    if (section.consumer.sources.indexOf(_sourcemaplibsourcemapconsumerjs056_util.getArg(aArgs, 'source')) === -1) {
      continue;
    }
    var generatedPosition = section.consumer.generatedPositionFor(aArgs);
    if (generatedPosition) {
      var ret = {
        line: generatedPosition.line + (section.generatedOffset.generatedLine - 1),
        column: generatedPosition.column + (section.generatedOffset.generatedLine === generatedPosition.line ? section.generatedOffset.generatedColumn - 1 : 0)
      };
      return ret;
    }
  }

  return {
    line: null,
    column: null
  };
};

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
_sourcemaplibsourcemapconsumerjs056_IndexedSourceMapConsumer.prototype._parseMappings = function IndexedSourceMapConsumer_parseMappings(aStr, aSourceRoot) {
  this.__generatedMappings = [];
  this.__originalMappings = [];
  for (var i = 0; i < this._sections.length; i++) {
    var section = this._sections[i];
    var sectionMappings = section.consumer._generatedMappings;
    for (var j = 0; j < sectionMappings.length; j++) {
      var mapping = sectionMappings[j];

      var source = section.consumer._sources.at(mapping.source);
      if (section.consumer.sourceRoot !== null) {
        source = _sourcemaplibsourcemapconsumerjs056_util.join(section.consumer.sourceRoot, source);
      }
      this._sources.add(source);
      source = this._sources.indexOf(source);

      var name = section.consumer._names.at(mapping.name);
      this._names.add(name);
      name = this._names.indexOf(name);

      // The mappings coming from the consumer for the section have
      // generated positions relative to the start of the section, so we
      // need to offset them to be relative to the start of the concatenated
      // generated file.
      var adjustedMapping = {
        source: source,
        generatedLine: mapping.generatedLine + (section.generatedOffset.generatedLine - 1),
        generatedColumn: mapping.generatedColumn + (section.generatedOffset.generatedLine === mapping.generatedLine ? section.generatedOffset.generatedColumn - 1 : 0),
        originalLine: mapping.originalLine,
        originalColumn: mapping.originalColumn,
        name: name
      };

      this.__generatedMappings.push(adjustedMapping);
      if (typeof adjustedMapping.originalLine === 'number') {
        this.__originalMappings.push(adjustedMapping);
      }
    }
  }

  _sourcemaplibsourcemapconsumerjs056_quickSort(this.__generatedMappings, _sourcemaplibsourcemapconsumerjs056_util.compareByGeneratedPositionsDeflated);
  _sourcemaplibsourcemapconsumerjs056_quickSort(this.__originalMappings, _sourcemaplibsourcemapconsumerjs056_util.compareByOriginalPositions);
};

$m['source-map/lib/source-map-consumer.js#0.5.6'].exports.IndexedSourceMapConsumer = _sourcemaplibsourcemapconsumerjs056_IndexedSourceMapConsumer;
/*≠≠ node_modules/source-map/lib/source-map-consumer.js ≠≠*/

/*== node_modules/source-map/source-map.js ==*/
$m['source-map/source-map.js#0.5.6'] = { exports: {} };
/*
 * Copyright 2009-2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE.txt or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
$m['source-map/source-map.js#0.5.6'].exports.SourceMapGenerator = $m['source-map/lib/source-map-generator.js#0.5.6'].exports.SourceMapGenerator;
$m['source-map/source-map.js#0.5.6'].exports.SourceMapConsumer = $m['source-map/lib/source-map-consumer.js#0.5.6'].exports.SourceMapConsumer;
$m['source-map/source-map.js#0.5.6'].exports.SourceNode = $m['source-map/lib/source-node.js#0.5.6'].exports.SourceNode;
/*≠≠ node_modules/source-map/source-map.js ≠≠*/

/*== node_modules/csso/lib/utils/translateWithSourceMap.js ==*/
$m['csso/lib/utils/translateWithSourceMap.js#2.2.1'] = { exports: {} };
var _cssolibutilstranslateWithSourceMapjs221_SourceMapGenerator = $m['source-map/source-map.js#0.5.6'].exports.SourceMapGenerator;
var _cssolibutilstranslateWithSourceMapjs221_SourceNode = $m['source-map/source-map.js#0.5.6'].exports.SourceNode;

// Our own implementation of SourceNode#toStringWithSourceMap,
// since SourceNode doesn't allow multiple references to original source.
// Also, as we know structure of result we could be optimize generation
// (currently it's ~40% faster).
function _cssolibutilstranslateWithSourceMapjs221_walk(node, fn) {
    for (var chunk, i = 0; i < node.children.length; i++) {
        chunk = node.children[i];

        if (chunk instanceof _cssolibutilstranslateWithSourceMapjs221_SourceNode) {
            // this is a hack, because source maps doesn't support for 1(generated):N(original)
            // if (chunk.merged) {
            //     fn('', chunk);
            // }

            _cssolibutilstranslateWithSourceMapjs221_walk(chunk, fn);
        } else {
            fn(chunk, node);
        }
    }
}

function _cssolibutilstranslateWithSourceMapjs221_generateSourceMap(root) {
    var map = new _cssolibutilstranslateWithSourceMapjs221_SourceMapGenerator();
    var css = '';
    var sourceMappingActive = false;
    var lastOriginalLine = null;
    var lastOriginalColumn = null;
    var lastIndexOfNewline;
    var generated = {
        line: 1,
        column: 0
    };
    var activatedMapping = {
        generated: generated
    };

    _cssolibutilstranslateWithSourceMapjs221_walk(root, function (chunk, original) {
        if (original.line !== null && original.column !== null) {
            if (lastOriginalLine !== original.line || lastOriginalColumn !== original.column) {
                map.addMapping({
                    source: original.source,
                    original: original,
                    generated: generated
                });
            }

            lastOriginalLine = original.line;
            lastOriginalColumn = original.column;
            sourceMappingActive = true;
        } else if (sourceMappingActive) {
            map.addMapping(activatedMapping);
            sourceMappingActive = false;
        }

        css += chunk;

        lastIndexOfNewline = chunk.lastIndexOf('\n');
        if (lastIndexOfNewline !== -1) {
            generated.line += chunk.match(/\n/g).length;
            generated.column = chunk.length - lastIndexOfNewline - 1;
        } else {
            generated.column += chunk.length;
        }
    });

    return {
        css: css,
        map: map
    };
}

function _cssolibutilstranslateWithSourceMapjs221_createAnonymousSourceNode(children) {
    return new _cssolibutilstranslateWithSourceMapjs221_SourceNode(null, null, null, children);
}

function _cssolibutilstranslateWithSourceMapjs221_createSourceNode(info, children) {
    if (info.primary) {
        // special marker node to add several references to original
        // var merged = createSourceNode(info.merged, []);
        // merged.merged = true;
        // children.unshift(merged);

        // use recursion, because primary can also has a primary/merged info
        return _cssolibutilstranslateWithSourceMapjs221_createSourceNode(info.primary, children);
    }

    return new _cssolibutilstranslateWithSourceMapjs221_SourceNode(info.line, info.column - 1, info.source, children);
}

function _cssolibutilstranslateWithSourceMapjs221_each(list) {
    if (list.head === null) {
        return '';
    }

    if (list.head === list.tail) {
        return _cssolibutilstranslateWithSourceMapjs221_translate(list.head.data);
    }

    return list.map(_cssolibutilstranslateWithSourceMapjs221_translate).join('');
}

function _cssolibutilstranslateWithSourceMapjs221_eachDelim(list, delimeter) {
    if (list.head === null) {
        return '';
    }

    if (list.head === list.tail) {
        return _cssolibutilstranslateWithSourceMapjs221_translate(list.head.data);
    }

    return list.map(_cssolibutilstranslateWithSourceMapjs221_translate).join(delimeter);
}

function _cssolibutilstranslateWithSourceMapjs221_translate(node) {
    switch (node.type) {
        case 'StyleSheet':
            return _cssolibutilstranslateWithSourceMapjs221_createAnonymousSourceNode(node.rules.map(_cssolibutilstranslateWithSourceMapjs221_translate));

        case 'Atrule':
            var nodes = ['@', node.name];

            if (node.expression && !node.expression.sequence.isEmpty()) {
                nodes.push(' ', _cssolibutilstranslateWithSourceMapjs221_translate(node.expression));
            }

            if (node.block) {
                nodes.push('{', _cssolibutilstranslateWithSourceMapjs221_translate(node.block), '}');
            } else {
                nodes.push(';');
            }

            return _cssolibutilstranslateWithSourceMapjs221_createSourceNode(node.info, nodes);

        case 'Ruleset':
            return _cssolibutilstranslateWithSourceMapjs221_createAnonymousSourceNode([_cssolibutilstranslateWithSourceMapjs221_translate(node.selector), '{', _cssolibutilstranslateWithSourceMapjs221_translate(node.block), '}']);

        case 'Selector':
            return _cssolibutilstranslateWithSourceMapjs221_createAnonymousSourceNode(node.selectors.map(_cssolibutilstranslateWithSourceMapjs221_translate)).join(',');

        case 'SimpleSelector':
            var nodes = node.sequence.map(function (node) {
                // add extra spaces around /deep/ combinator since comment beginning/ending may to be produced
                if (node.type === 'Combinator' && node.name === '/deep/') {
                    return ' ' + _cssolibutilstranslateWithSourceMapjs221_translate(node) + ' ';
                }

                return _cssolibutilstranslateWithSourceMapjs221_translate(node);
            });

            return _cssolibutilstranslateWithSourceMapjs221_createSourceNode(node.info, nodes);

        case 'Block':
            return _cssolibutilstranslateWithSourceMapjs221_createAnonymousSourceNode(node.declarations.map(_cssolibutilstranslateWithSourceMapjs221_translate)).join(';');

        case 'Declaration':
            return _cssolibutilstranslateWithSourceMapjs221_createSourceNode(node.info, [_cssolibutilstranslateWithSourceMapjs221_translate(node.property), ':', _cssolibutilstranslateWithSourceMapjs221_translate(node.value)]);

        case 'Property':
            return node.name;

        case 'Value':
            return node.important ? _cssolibutilstranslateWithSourceMapjs221_each(node.sequence) + '!important' : _cssolibutilstranslateWithSourceMapjs221_each(node.sequence);

        case 'Attribute':
            var result = _cssolibutilstranslateWithSourceMapjs221_translate(node.name);
            var flagsPrefix = ' ';

            if (node.operator !== null) {
                result += node.operator;

                if (node.value !== null) {
                    result += _cssolibutilstranslateWithSourceMapjs221_translate(node.value);

                    // space between string and flags is not required
                    if (node.value.type === 'String') {
                        flagsPrefix = '';
                    }
                }
            }

            if (node.flags !== null) {
                result += flagsPrefix + node.flags;
            }

            return '[' + result + ']';

        case 'FunctionalPseudo':
            return ':' + node.name + '(' + _cssolibutilstranslateWithSourceMapjs221_eachDelim(node.arguments, ',') + ')';

        case 'Function':
            return node.name + '(' + _cssolibutilstranslateWithSourceMapjs221_eachDelim(node.arguments, ',') + ')';

        case 'Negation':
            return ':not(' + _cssolibutilstranslateWithSourceMapjs221_eachDelim(node.sequence, ',') + ')';

        case 'Braces':
            return node.open + _cssolibutilstranslateWithSourceMapjs221_each(node.sequence) + node.close;

        case 'Argument':
        case 'AtruleExpression':
            return _cssolibutilstranslateWithSourceMapjs221_each(node.sequence);

        case 'Url':
            return 'url(' + _cssolibutilstranslateWithSourceMapjs221_translate(node.value) + ')';

        case 'Progid':
            return _cssolibutilstranslateWithSourceMapjs221_translate(node.value);

        case 'Combinator':
            return node.name;

        case 'Identifier':
            return node.name;

        case 'PseudoClass':
            return ':' + node.name;

        case 'PseudoElement':
            return '::' + node.name;

        case 'Class':
            return '.' + node.name;

        case 'Id':
            return '#' + node.name;

        case 'Hash':
            return '#' + node.value;

        case 'Dimension':
            return node.value + node.unit;

        case 'Nth':
            return node.value;

        case 'Number':
            return node.value;

        case 'String':
            return node.value;

        case 'Operator':
            return node.value;

        case 'Raw':
            return node.value;

        case 'Unknown':
            return node.value;

        case 'Percentage':
            return node.value + '%';

        case 'Space':
            return ' ';

        case 'Comment':
            return '/*' + node.value + '*/';

        default:
            throw new Error('Unknown node type: ' + node.type);
    }
}

$m['csso/lib/utils/translateWithSourceMap.js#2.2.1'].exports = function (node) {
    return _cssolibutilstranslateWithSourceMapjs221_generateSourceMap(_cssolibutilstranslateWithSourceMapjs221_createAnonymousSourceNode(_cssolibutilstranslateWithSourceMapjs221_translate(node)));
};
/*≠≠ node_modules/csso/lib/utils/translateWithSourceMap.js ≠≠*/

/*== node_modules/csso/lib/utils/translate.js ==*/
$m['csso/lib/utils/translate.js#2.2.1'] = { exports: {} };
function _cssolibutilstranslatejs221_each(list) {
    if (list.head === null) {
        return '';
    }

    if (list.head === list.tail) {
        return _cssolibutilstranslatejs221_translate(list.head.data);
    }

    return list.map(_cssolibutilstranslatejs221_translate).join('');
}

function _cssolibutilstranslatejs221_eachDelim(list, delimeter) {
    if (list.head === null) {
        return '';
    }

    if (list.head === list.tail) {
        return _cssolibutilstranslatejs221_translate(list.head.data);
    }

    return list.map(_cssolibutilstranslatejs221_translate).join(delimeter);
}

function _cssolibutilstranslatejs221_translate(node) {
    switch (node.type) {
        case 'StyleSheet':
            return _cssolibutilstranslatejs221_each(node.rules);

        case 'Atrule':
            var nodes = ['@', node.name];

            if (node.expression && !node.expression.sequence.isEmpty()) {
                nodes.push(' ', _cssolibutilstranslatejs221_translate(node.expression));
            }

            if (node.block) {
                nodes.push('{', _cssolibutilstranslatejs221_translate(node.block), '}');
            } else {
                nodes.push(';');
            }

            return nodes.join('');

        case 'Ruleset':
            return _cssolibutilstranslatejs221_translate(node.selector) + '{' + _cssolibutilstranslatejs221_translate(node.block) + '}';

        case 'Selector':
            return _cssolibutilstranslatejs221_eachDelim(node.selectors, ',');

        case 'SimpleSelector':
            var nodes = node.sequence.map(function (node) {
                // add extra spaces around /deep/ combinator since comment beginning/ending may to be produced
                if (node.type === 'Combinator' && node.name === '/deep/') {
                    return ' ' + _cssolibutilstranslatejs221_translate(node) + ' ';
                }

                return _cssolibutilstranslatejs221_translate(node);
            });

            return nodes.join('');

        case 'Block':
            return _cssolibutilstranslatejs221_eachDelim(node.declarations, ';');

        case 'Declaration':
            return _cssolibutilstranslatejs221_translate(node.property) + ':' + _cssolibutilstranslatejs221_translate(node.value);

        case 'Property':
            return node.name;

        case 'Value':
            return node.important ? _cssolibutilstranslatejs221_each(node.sequence) + '!important' : _cssolibutilstranslatejs221_each(node.sequence);

        case 'Attribute':
            var result = _cssolibutilstranslatejs221_translate(node.name);
            var flagsPrefix = ' ';

            if (node.operator !== null) {
                result += node.operator;

                if (node.value !== null) {
                    result += _cssolibutilstranslatejs221_translate(node.value);

                    // space between string and flags is not required
                    if (node.value.type === 'String') {
                        flagsPrefix = '';
                    }
                }
            }

            if (node.flags !== null) {
                result += flagsPrefix + node.flags;
            }

            return '[' + result + ']';

        case 'FunctionalPseudo':
            return ':' + node.name + '(' + _cssolibutilstranslatejs221_eachDelim(node.arguments, ',') + ')';

        case 'Function':
            return node.name + '(' + _cssolibutilstranslatejs221_eachDelim(node.arguments, ',') + ')';

        case 'Negation':
            return ':not(' + _cssolibutilstranslatejs221_eachDelim(node.sequence, ',') + ')';

        case 'Braces':
            return node.open + _cssolibutilstranslatejs221_each(node.sequence) + node.close;

        case 'Argument':
        case 'AtruleExpression':
            return _cssolibutilstranslatejs221_each(node.sequence);

        case 'Url':
            return 'url(' + _cssolibutilstranslatejs221_translate(node.value) + ')';

        case 'Progid':
            return _cssolibutilstranslatejs221_translate(node.value);

        case 'Combinator':
            return node.name;

        case 'Identifier':
            return node.name;

        case 'PseudoClass':
            return ':' + node.name;

        case 'PseudoElement':
            return '::' + node.name;

        case 'Class':
            return '.' + node.name;

        case 'Id':
            return '#' + node.name;

        case 'Hash':
            return '#' + node.value;

        case 'Dimension':
            return node.value + node.unit;

        case 'Nth':
            return node.value;

        case 'Number':
            return node.value;

        case 'String':
            return node.value;

        case 'Operator':
            return node.value;

        case 'Raw':
            return node.value;

        case 'Unknown':
            return node.value;

        case 'Percentage':
            return node.value + '%';

        case 'Space':
            return ' ';

        case 'Comment':
            return '/*' + node.value + '*/';

        default:
            throw new Error('Unknown node type: ' + node.type);
    }
}

$m['csso/lib/utils/translate.js#2.2.1'].exports = _cssolibutilstranslatejs221_translate;
/*≠≠ node_modules/csso/lib/utils/translate.js ≠≠*/

/*== node_modules/csso/lib/compressor/restructure/utils.js ==*/
$m['csso/lib/compressor/restructure/utils.js#2.2.1'] = { exports: {} };
var _cssolibcompressorrestructureutilsjs221_hasOwnProperty = Object.prototype.hasOwnProperty;

function _cssolibcompressorrestructureutilsjs221_isEqualLists(a, b) {
    var cursor1 = a.head;
    var cursor2 = b.head;

    while (cursor1 !== null && cursor2 !== null && cursor1.data.id === cursor2.data.id) {
        cursor1 = cursor1.next;
        cursor2 = cursor2.next;
    }

    return cursor1 === null && cursor2 === null;
}

function _cssolibcompressorrestructureutilsjs221_isEqualDeclarations(a, b) {
    var cursor1 = a.head;
    var cursor2 = b.head;

    while (cursor1 !== null && cursor2 !== null && cursor1.data.id === cursor2.data.id) {
        cursor1 = cursor1.next;
        cursor2 = cursor2.next;
    }

    return cursor1 === null && cursor2 === null;
}

function _cssolibcompressorrestructureutilsjs221_compareDeclarations(declarations1, declarations2) {
    var result = {
        eq: [],
        ne1: [],
        ne2: [],
        ne2overrided: []
    };

    var fingerprints = Object.create(null);
    var declarations2hash = Object.create(null);

    for (var cursor = declarations2.head; cursor; cursor = cursor.next) {
        declarations2hash[cursor.data.id] = true;
    }

    for (var cursor = declarations1.head; cursor; cursor = cursor.next) {
        var data = cursor.data;

        if (data.fingerprint) {
            fingerprints[data.fingerprint] = data.value.important;
        }

        if (declarations2hash[data.id]) {
            declarations2hash[data.id] = false;
            result.eq.push(data);
        } else {
            result.ne1.push(data);
        }
    }

    for (var cursor = declarations2.head; cursor; cursor = cursor.next) {
        var data = cursor.data;

        if (declarations2hash[data.id]) {
            // if declarations1 has overriding declaration, this is not a difference
            // but take in account !important - prev should be equal or greater than follow
            if (_cssolibcompressorrestructureutilsjs221_hasOwnProperty.call(fingerprints, data.fingerprint) && Number(fingerprints[data.fingerprint]) >= Number(data.value.important)) {
                result.ne2overrided.push(data);
            } else {
                result.ne2.push(data);
            }
        }
    }

    return result;
}

function _cssolibcompressorrestructureutilsjs221_addSelectors(dest, source) {
    source.each(function (sourceData) {
        var newStr = sourceData.id;
        var cursor = dest.head;

        while (cursor) {
            var nextStr = cursor.data.id;

            if (nextStr === newStr) {
                return;
            }

            if (nextStr > newStr) {
                break;
            }

            cursor = cursor.next;
        }

        dest.insert(dest.createItem(sourceData), cursor);
    });

    return dest;
}

// check if simpleselectors has no equal specificity and element selector
function _cssolibcompressorrestructureutilsjs221_hasSimilarSelectors(selectors1, selectors2) {
    return selectors1.some(function (a) {
        return selectors2.some(function (b) {
            return a.compareMarker === b.compareMarker;
        });
    });
}

// test node can't to be skipped
function _cssolibcompressorrestructureutilsjs221_unsafeToSkipNode(node) {
    switch (node.type) {
        case 'Ruleset':
            // unsafe skip ruleset with selector similarities
            return _cssolibcompressorrestructureutilsjs221_hasSimilarSelectors(node.selector.selectors, this);

        case 'Atrule':
            // can skip at-rules with blocks
            if (node.block) {
                // non-stylesheet blocks are safe to skip since have no selectors
                if (node.block.type !== 'StyleSheet') {
                    return false;
                }

                // unsafe skip at-rule if block contains something unsafe to skip
                return node.block.rules.some(_cssolibcompressorrestructureutilsjs221_unsafeToSkipNode, this);
            }
            break;
    }

    // unsafe by default
    return true;
}

$m['csso/lib/compressor/restructure/utils.js#2.2.1'].exports = {
    isEqualLists: _cssolibcompressorrestructureutilsjs221_isEqualLists,
    isEqualDeclarations: _cssolibcompressorrestructureutilsjs221_isEqualDeclarations,
    compareDeclarations: _cssolibcompressorrestructureutilsjs221_compareDeclarations,
    addSelectors: _cssolibcompressorrestructureutilsjs221_addSelectors,
    hasSimilarSelectors: _cssolibcompressorrestructureutilsjs221_hasSimilarSelectors,
    unsafeToSkipNode: _cssolibcompressorrestructureutilsjs221_unsafeToSkipNode
};
/*≠≠ node_modules/csso/lib/compressor/restructure/utils.js ≠≠*/

/*== node_modules/csso/lib/compress...structure/8-restructRuleset.js ==*/
$m['csso/lib/compressor/restructure/8-restructRuleset.js#2.2.1'] = { exports: {} };
var _cssolibcompressorrestructure8restructRulesetjs221_List = $m['csso/lib/utils/list.js#2.2.1'].exports;
var _cssolibcompressorrestructure8restructRulesetjs221_utils = $m['csso/lib/compressor/restructure/utils.js#2.2.1'].exports;
var _cssolibcompressorrestructure8restructRulesetjs221_walkRulesRight = $m['csso/lib/utils/walk.js#2.2.1'].exports.rulesRight;

function _cssolibcompressorrestructure8restructRulesetjs221_calcSelectorLength(list) {
    var length = 0;

    list.each(function (data) {
        length += data.id.length + 1;
    });

    return length - 1;
}

function _cssolibcompressorrestructure8restructRulesetjs221_calcDeclarationsLength(tokens) {
    var length = 0;

    for (var i = 0; i < tokens.length; i++) {
        length += tokens[i].length;
    }

    return length + // declarations
    tokens.length - 1 // delimeters
    ;
}

function _cssolibcompressorrestructure8restructRulesetjs221_processRuleset(node, item, list) {
    var avoidRulesMerge = this.stylesheet.avoidRulesMerge;
    var selectors = node.selector.selectors;
    var block = node.block;
    var disallowDownMarkers = Object.create(null);
    var allowMergeUp = true;
    var allowMergeDown = true;

    list.prevUntil(item.prev, function (prev, prevItem) {
        // skip non-ruleset node if safe
        if (prev.type !== 'Ruleset') {
            return _cssolibcompressorrestructure8restructRulesetjs221_utils.unsafeToSkipNode.call(selectors, prev);
        }

        var prevSelectors = prev.selector.selectors;
        var prevBlock = prev.block;

        if (node.pseudoSignature !== prev.pseudoSignature) {
            return true;
        }

        allowMergeDown = !prevSelectors.some(function (selector) {
            return selector.compareMarker in disallowDownMarkers;
        });

        // try prev ruleset if simpleselectors has no equal specifity and element selector
        if (!allowMergeDown && !allowMergeUp) {
            return true;
        }

        // try to join by selectors
        if (allowMergeUp && _cssolibcompressorrestructure8restructRulesetjs221_utils.isEqualLists(prevSelectors, selectors)) {
            prevBlock.declarations.appendList(block.declarations);
            list.remove(item);
            return true;
        }

        // try to join by properties
        var diff = _cssolibcompressorrestructure8restructRulesetjs221_utils.compareDeclarations(block.declarations, prevBlock.declarations);

        // console.log(diff.eq, diff.ne1, diff.ne2);

        if (diff.eq.length) {
            if (!diff.ne1.length && !diff.ne2.length) {
                // equal blocks
                if (allowMergeDown) {
                    _cssolibcompressorrestructure8restructRulesetjs221_utils.addSelectors(selectors, prevSelectors);
                    list.remove(prevItem);
                }

                return true;
            } else if (!avoidRulesMerge) {
                /* probably we don't need to prevent those merges for @keyframes
                   TODO: need to be checked */

                if (diff.ne1.length && !diff.ne2.length) {
                    // prevBlock is subset block
                    var selectorLength = _cssolibcompressorrestructure8restructRulesetjs221_calcSelectorLength(selectors);
                    var blockLength = _cssolibcompressorrestructure8restructRulesetjs221_calcDeclarationsLength(diff.eq); // declarations length

                    if (allowMergeUp && selectorLength < blockLength) {
                        _cssolibcompressorrestructure8restructRulesetjs221_utils.addSelectors(prevSelectors, selectors);
                        block.declarations = new _cssolibcompressorrestructure8restructRulesetjs221_List(diff.ne1);
                    }
                } else if (!diff.ne1.length && diff.ne2.length) {
                    // node is subset of prevBlock
                    var selectorLength = _cssolibcompressorrestructure8restructRulesetjs221_calcSelectorLength(prevSelectors);
                    var blockLength = _cssolibcompressorrestructure8restructRulesetjs221_calcDeclarationsLength(diff.eq); // declarations length

                    if (allowMergeDown && selectorLength < blockLength) {
                        _cssolibcompressorrestructure8restructRulesetjs221_utils.addSelectors(selectors, prevSelectors);
                        prevBlock.declarations = new _cssolibcompressorrestructure8restructRulesetjs221_List(diff.ne2);
                    }
                } else {
                    // diff.ne1.length && diff.ne2.length
                    // extract equal block
                    var newSelector = {
                        type: 'Selector',
                        info: {},
                        selectors: _cssolibcompressorrestructure8restructRulesetjs221_utils.addSelectors(prevSelectors.copy(), selectors)
                    };
                    var newBlockLength = _cssolibcompressorrestructure8restructRulesetjs221_calcSelectorLength(newSelector.selectors) + 2; // selectors length + curly braces length
                    var blockLength = _cssolibcompressorrestructure8restructRulesetjs221_calcDeclarationsLength(diff.eq); // declarations length

                    // create new ruleset if declarations length greater than
                    // ruleset description overhead
                    if (allowMergeDown && blockLength >= newBlockLength) {
                        var newRuleset = {
                            type: 'Ruleset',
                            info: {},
                            pseudoSignature: node.pseudoSignature,
                            selector: newSelector,
                            block: {
                                type: 'Block',
                                info: {},
                                declarations: new _cssolibcompressorrestructure8restructRulesetjs221_List(diff.eq)
                            }
                        };

                        block.declarations = new _cssolibcompressorrestructure8restructRulesetjs221_List(diff.ne1);
                        prevBlock.declarations = new _cssolibcompressorrestructure8restructRulesetjs221_List(diff.ne2.concat(diff.ne2overrided));
                        list.insert(list.createItem(newRuleset), prevItem);
                        return true;
                    }
                }
            }
        }

        if (allowMergeUp) {
            // TODO: disallow up merge only if any property interception only (i.e. diff.ne2overrided.length > 0);
            // await property families to find property interception correctly
            allowMergeUp = !prevSelectors.some(function (prevSelector) {
                return selectors.some(function (selector) {
                    return selector.compareMarker === prevSelector.compareMarker;
                });
            });
        }

        prevSelectors.each(function (data) {
            disallowDownMarkers[data.compareMarker] = true;
        });
    });
};

$m['csso/lib/compressor/restructure/8-restructRuleset.js#2.2.1'].exports = function restructRuleset(ast) {
    _cssolibcompressorrestructure8restructRulesetjs221_walkRulesRight(ast, function (node, item, list) {
        if (node.type === 'Ruleset') {
            _cssolibcompressorrestructure8restructRulesetjs221_processRuleset.call(this, node, item, list);
        }
    });
};
/*≠≠ node_modules/csso/lib/compress...structure/8-restructRuleset.js ≠≠*/

/*== node_modules/csso/lib/compressor/restructure/7-mergeRuleset.js ==*/
$m['csso/lib/compressor/restructure/7-mergeRuleset.js#2.2.1'] = { exports: {} };
var _cssolibcompressorrestructure7mergeRulesetjs221_utils = $m['csso/lib/compressor/restructure/utils.js#2.2.1'].exports;
var _cssolibcompressorrestructure7mergeRulesetjs221_walkRules = $m['csso/lib/utils/walk.js#2.2.1'].exports.rules;

/*
    At this step all rules has single simple selector. We try to join by equal
    declaration blocks to first rule, e.g.

    .a { color: red }
    b { ... }
    .b { color: red }
    ->
    .a, .b { color: red }
    b { ... }
*/

function _cssolibcompressorrestructure7mergeRulesetjs221_processRuleset(node, item, list) {
    var selectors = node.selector.selectors;
    var declarations = node.block.declarations;
    var nodeCompareMarker = selectors.first().compareMarker;
    var skippedCompareMarkers = {};

    list.nextUntil(item.next, function (next, nextItem) {
        // skip non-ruleset node if safe
        if (next.type !== 'Ruleset') {
            return _cssolibcompressorrestructure7mergeRulesetjs221_utils.unsafeToSkipNode.call(selectors, next);
        }

        if (node.pseudoSignature !== next.pseudoSignature) {
            return true;
        }

        var nextFirstSelector = next.selector.selectors.head;
        var nextDeclarations = next.block.declarations;
        var nextCompareMarker = nextFirstSelector.data.compareMarker;

        // if next ruleset has same marked as one of skipped then stop joining
        if (nextCompareMarker in skippedCompareMarkers) {
            return true;
        }

        // try to join by selectors
        if (selectors.head === selectors.tail) {
            if (selectors.first().id === nextFirstSelector.data.id) {
                declarations.appendList(nextDeclarations);
                list.remove(nextItem);
                return;
            }
        }

        // try to join by properties
        if (_cssolibcompressorrestructure7mergeRulesetjs221_utils.isEqualDeclarations(declarations, nextDeclarations)) {
            var nextStr = nextFirstSelector.data.id;

            selectors.some(function (data, item) {
                var curStr = data.id;

                if (nextStr < curStr) {
                    selectors.insert(nextFirstSelector, item);
                    return true;
                }

                if (!item.next) {
                    selectors.insert(nextFirstSelector);
                    return true;
                }
            });

            list.remove(nextItem);
            return;
        }

        // go to next ruleset if current one can be skipped (has no equal specificity nor element selector)
        if (nextCompareMarker === nodeCompareMarker) {
            return true;
        }

        skippedCompareMarkers[nextCompareMarker] = true;
    });
};

$m['csso/lib/compressor/restructure/7-mergeRuleset.js#2.2.1'].exports = function mergeRuleset(ast) {
    _cssolibcompressorrestructure7mergeRulesetjs221_walkRules(ast, function (node, item, list) {
        if (node.type === 'Ruleset') {
            _cssolibcompressorrestructure7mergeRulesetjs221_processRuleset(node, item, list);
        }
    });
};
/*≠≠ node_modules/csso/lib/compressor/restructure/7-mergeRuleset.js ≠≠*/

/*== node_modules/csso/lib/utils/names.js ==*/
$m['csso/lib/utils/names.js#2.2.1'] = { exports: {} };
var _cssolibutilsnamesjs221_hasOwnProperty = Object.prototype.hasOwnProperty;
var _cssolibutilsnamesjs221_knownKeywords = Object.create(null);
var _cssolibutilsnamesjs221_knownProperties = Object.create(null);

function _cssolibutilsnamesjs221_getVendorPrefix(string) {
    if (string[0] === '-') {
        // skip 2 chars to avoid wrong match with variables names
        var secondDashIndex = string.indexOf('-', 2);

        if (secondDashIndex !== -1) {
            return string.substr(0, secondDashIndex + 1);
        }
    }

    return '';
}

function _cssolibutilsnamesjs221_getKeywordInfo(keyword) {
    if (_cssolibutilsnamesjs221_hasOwnProperty.call(_cssolibutilsnamesjs221_knownKeywords, keyword)) {
        return _cssolibutilsnamesjs221_knownKeywords[keyword];
    }

    var lowerCaseKeyword = keyword.toLowerCase();
    var vendor = _cssolibutilsnamesjs221_getVendorPrefix(lowerCaseKeyword);
    var name = lowerCaseKeyword;

    if (vendor) {
        name = name.substr(vendor.length);
    }

    return _cssolibutilsnamesjs221_knownKeywords[keyword] = Object.freeze({
        vendor: vendor,
        prefix: vendor,
        name: name
    });
}

function _cssolibutilsnamesjs221_getPropertyInfo(property) {
    if (_cssolibutilsnamesjs221_hasOwnProperty.call(_cssolibutilsnamesjs221_knownProperties, property)) {
        return _cssolibutilsnamesjs221_knownProperties[property];
    }

    var lowerCaseProperty = property.toLowerCase();
    var hack = lowerCaseProperty[0];

    if (hack === '*' || hack === '_' || hack === '$') {
        lowerCaseProperty = lowerCaseProperty.substr(1);
    } else if (hack === '/' && property[1] === '/') {
        hack = '//';
        lowerCaseProperty = lowerCaseProperty.substr(2);
    } else {
        hack = '';
    }

    var vendor = _cssolibutilsnamesjs221_getVendorPrefix(lowerCaseProperty);
    var name = lowerCaseProperty;

    if (vendor) {
        name = name.substr(vendor.length);
    }

    return _cssolibutilsnamesjs221_knownProperties[property] = Object.freeze({
        hack: hack,
        vendor: vendor,
        prefix: hack + vendor,
        name: name
    });
}

$m['csso/lib/utils/names.js#2.2.1'].exports = {
    keyword: _cssolibutilsnamesjs221_getKeywordInfo,
    property: _cssolibutilsnamesjs221_getPropertyInfo
};
/*≠≠ node_modules/csso/lib/utils/names.js ≠≠*/

/*== node_modules/csso/lib/compressor/restructure/6-restructBlock.js ==*/
$m['csso/lib/compressor/restructure/6-restructBlock.js#2.2.1'] = { exports: {} };
var _cssolibcompressorrestructure6restructBlockjs221_resolveProperty = $m['csso/lib/utils/names.js#2.2.1'].exports.property;
var _cssolibcompressorrestructure6restructBlockjs221_resolveKeyword = $m['csso/lib/utils/names.js#2.2.1'].exports.keyword;
var _cssolibcompressorrestructure6restructBlockjs221_walkRulesRight = $m['csso/lib/utils/walk.js#2.2.1'].exports.rulesRight;
var _cssolibcompressorrestructure6restructBlockjs221_translate = $m['csso/lib/utils/translate.js#2.2.1'].exports;
var _cssolibcompressorrestructure6restructBlockjs221_dontRestructure = {
    'src': 1 // https://github.com/afelix/csso/issues/50
};

var _cssolibcompressorrestructure6restructBlockjs221_DONT_MIX_VALUE = {
    // https://developer.mozilla.org/en-US/docs/Web/CSS/display#Browser_compatibility
    'display': /table|ruby|flex|-(flex)?box$|grid|contents|run-in/i,
    // https://developer.mozilla.org/en/docs/Web/CSS/text-align
    'text-align': /^(start|end|match-parent|justify-all)$/i
};

var _cssolibcompressorrestructure6restructBlockjs221_CURSOR_SAFE_VALUE = ['auto', 'crosshair', 'default', 'move', 'text', 'wait', 'help', 'n-resize', 'e-resize', 's-resize', 'w-resize', 'ne-resize', 'nw-resize', 'se-resize', 'sw-resize', 'pointer', 'progress', 'not-allowed', 'no-drop', 'vertical-text', 'all-scroll', 'col-resize', 'row-resize'];

var _cssolibcompressorrestructure6restructBlockjs221_NEEDLESS_TABLE = {
    'border-width': ['border'],
    'border-style': ['border'],
    'border-color': ['border'],
    'border-top': ['border'],
    'border-right': ['border'],
    'border-bottom': ['border'],
    'border-left': ['border'],
    'border-top-width': ['border-top', 'border-width', 'border'],
    'border-right-width': ['border-right', 'border-width', 'border'],
    'border-bottom-width': ['border-bottom', 'border-width', 'border'],
    'border-left-width': ['border-left', 'border-width', 'border'],
    'border-top-style': ['border-top', 'border-style', 'border'],
    'border-right-style': ['border-right', 'border-style', 'border'],
    'border-bottom-style': ['border-bottom', 'border-style', 'border'],
    'border-left-style': ['border-left', 'border-style', 'border'],
    'border-top-color': ['border-top', 'border-color', 'border'],
    'border-right-color': ['border-right', 'border-color', 'border'],
    'border-bottom-color': ['border-bottom', 'border-color', 'border'],
    'border-left-color': ['border-left', 'border-color', 'border'],
    'margin-top': ['margin'],
    'margin-right': ['margin'],
    'margin-bottom': ['margin'],
    'margin-left': ['margin'],
    'padding-top': ['padding'],
    'padding-right': ['padding'],
    'padding-bottom': ['padding'],
    'padding-left': ['padding'],
    'font-style': ['font'],
    'font-variant': ['font'],
    'font-weight': ['font'],
    'font-size': ['font'],
    'font-family': ['font'],
    'list-style-type': ['list-style'],
    'list-style-position': ['list-style'],
    'list-style-image': ['list-style']
};

function _cssolibcompressorrestructure6restructBlockjs221_getPropertyFingerprint(propertyName, declaration, fingerprints) {
    var realName = _cssolibcompressorrestructure6restructBlockjs221_resolveProperty(propertyName).name;

    if (realName === 'background' || realName === 'filter' && declaration.value.sequence.first().type === 'Progid') {
        return propertyName + ':' + _cssolibcompressorrestructure6restructBlockjs221_translate(declaration.value);
    }

    var declarationId = declaration.id;
    var fingerprint = fingerprints[declarationId];

    if (!fingerprint) {
        var vendorId = '';
        var hack9 = '';
        var special = {};

        declaration.value.sequence.each(function walk(node) {
            switch (node.type) {
                case 'Argument':
                case 'Value':
                case 'Braces':
                    node.sequence.each(walk);
                    break;

                case 'Identifier':
                    var name = node.name;

                    if (!vendorId) {
                        vendorId = _cssolibcompressorrestructure6restructBlockjs221_resolveKeyword(name).vendor;
                    }

                    if (/\\9/.test(name)) {
                        hack9 = name;
                    }

                    if (realName === 'cursor') {
                        if (_cssolibcompressorrestructure6restructBlockjs221_CURSOR_SAFE_VALUE.indexOf(name) === -1) {
                            special[name] = true;
                        }
                    } else if (_cssolibcompressorrestructure6restructBlockjs221_DONT_MIX_VALUE.hasOwnProperty(realName)) {
                        if (_cssolibcompressorrestructure6restructBlockjs221_DONT_MIX_VALUE[realName].test(name)) {
                            special[name] = true;
                        }
                    }

                    break;

                case 'Function':
                    var name = node.name;

                    if (!vendorId) {
                        vendorId = _cssolibcompressorrestructure6restructBlockjs221_resolveKeyword(name).vendor;
                    }

                    if (name === 'rect') {
                        // there are 2 forms of rect:
                        //   rect(<top>, <right>, <bottom>, <left>) - standart
                        //   rect(<top> <right> <bottom> <left>) – backwards compatible syntax
                        // only the same form values can be merged
                        if (node.arguments.size < 4) {
                            name = 'rect-backward';
                        }
                    }

                    special[name + '()'] = true;

                    // check nested tokens too
                    node.arguments.each(walk);

                    break;

                case 'Dimension':
                    var unit = node.unit;

                    switch (unit) {
                        // is not supported until IE11
                        case 'rem':

                        // v* units is too buggy across browsers and better
                        // don't merge values with those units
                        case 'vw':
                        case 'vh':
                        case 'vmin':
                        case 'vmax':
                        case 'vm':
                            // IE9 supporting "vm" instead of "vmin".
                            special[unit] = true;
                            break;
                    }
                    break;
            }
        });

        fingerprint = '|' + Object.keys(special).sort() + '|' + hack9 + vendorId;

        fingerprints[declarationId] = fingerprint;
    }

    return propertyName + fingerprint;
}

function _cssolibcompressorrestructure6restructBlockjs221_needless(props, declaration, fingerprints) {
    var property = _cssolibcompressorrestructure6restructBlockjs221_resolveProperty(declaration.property.name);

    if (_cssolibcompressorrestructure6restructBlockjs221_NEEDLESS_TABLE.hasOwnProperty(property.name)) {
        var table = _cssolibcompressorrestructure6restructBlockjs221_NEEDLESS_TABLE[property.name];

        for (var i = 0; i < table.length; i++) {
            var ppre = _cssolibcompressorrestructure6restructBlockjs221_getPropertyFingerprint(property.prefix + table[i], declaration, fingerprints);
            var prev = props[ppre];

            if (prev && (!declaration.value.important || prev.item.data.value.important)) {
                return prev;
            }
        }
    }
}

function _cssolibcompressorrestructure6restructBlockjs221_processRuleset(ruleset, item, list, props, fingerprints) {
    var declarations = ruleset.block.declarations;

    declarations.eachRight(function (declaration, declarationItem) {
        var property = declaration.property.name;
        var fingerprint = _cssolibcompressorrestructure6restructBlockjs221_getPropertyFingerprint(property, declaration, fingerprints);
        var prev = props[fingerprint];

        if (prev && !_cssolibcompressorrestructure6restructBlockjs221_dontRestructure.hasOwnProperty(property)) {
            if (declaration.value.important && !prev.item.data.value.important) {
                props[fingerprint] = {
                    block: declarations,
                    item: declarationItem
                };

                prev.block.remove(prev.item);
                declaration.info = {
                    primary: declaration.info,
                    merged: prev.item.data.info
                };
            } else {
                declarations.remove(declarationItem);
                prev.item.data.info = {
                    primary: prev.item.data.info,
                    merged: declaration.info
                };
            }
        } else {
            var prev = _cssolibcompressorrestructure6restructBlockjs221_needless(props, declaration, fingerprints);

            if (prev) {
                declarations.remove(declarationItem);
                prev.item.data.info = {
                    primary: prev.item.data.info,
                    merged: declaration.info
                };
            } else {
                declaration.fingerprint = fingerprint;

                props[fingerprint] = {
                    block: declarations,
                    item: declarationItem
                };
            }
        }
    });

    if (declarations.isEmpty()) {
        list.remove(item);
    }
};

$m['csso/lib/compressor/restructure/6-restructBlock.js#2.2.1'].exports = function restructBlock(ast) {
    var stylesheetMap = {};
    var fingerprints = Object.create(null);

    _cssolibcompressorrestructure6restructBlockjs221_walkRulesRight(ast, function (node, item, list) {
        if (node.type !== 'Ruleset') {
            return;
        }

        var stylesheet = this.stylesheet;
        var rulesetId = (node.pseudoSignature || '') + '|' + node.selector.selectors.first().id;
        var rulesetMap;
        var props;

        if (!stylesheetMap.hasOwnProperty(stylesheet.id)) {
            rulesetMap = {};
            stylesheetMap[stylesheet.id] = rulesetMap;
        } else {
            rulesetMap = stylesheetMap[stylesheet.id];
        }

        if (rulesetMap.hasOwnProperty(rulesetId)) {
            props = rulesetMap[rulesetId];
        } else {
            props = {};
            rulesetMap[rulesetId] = props;
        }

        _cssolibcompressorrestructure6restructBlockjs221_processRuleset.call(this, node, item, list, props, fingerprints);
    });
};
/*≠≠ node_modules/csso/lib/compressor/restructure/6-restructBlock.js ≠≠*/

/*== node_modules/csso/lib/compress...ructure/4-restructShorthand.js ==*/
$m['csso/lib/compressor/restructure/4-restructShorthand.js#2.2.1'] = { exports: {} };
var _cssolibcompressorrestructure4restructShorthandjs221_List = $m['csso/lib/utils/list.js#2.2.1'].exports;
var _cssolibcompressorrestructure4restructShorthandjs221_translate = $m['csso/lib/utils/translate.js#2.2.1'].exports;
var _cssolibcompressorrestructure4restructShorthandjs221_walkRulesRight = $m['csso/lib/utils/walk.js#2.2.1'].exports.rulesRight;

var _cssolibcompressorrestructure4restructShorthandjs221_REPLACE = 1;
var _cssolibcompressorrestructure4restructShorthandjs221_REMOVE = 2;
var _cssolibcompressorrestructure4restructShorthandjs221_TOP = 0;
var _cssolibcompressorrestructure4restructShorthandjs221_RIGHT = 1;
var _cssolibcompressorrestructure4restructShorthandjs221_BOTTOM = 2;
var _cssolibcompressorrestructure4restructShorthandjs221_LEFT = 3;
var _cssolibcompressorrestructure4restructShorthandjs221_SIDES = ['top', 'right', 'bottom', 'left'];
var _cssolibcompressorrestructure4restructShorthandjs221_SIDE = {
    'margin-top': 'top',
    'margin-right': 'right',
    'margin-bottom': 'bottom',
    'margin-left': 'left',

    'padding-top': 'top',
    'padding-right': 'right',
    'padding-bottom': 'bottom',
    'padding-left': 'left',

    'border-top-color': 'top',
    'border-right-color': 'right',
    'border-bottom-color': 'bottom',
    'border-left-color': 'left',
    'border-top-width': 'top',
    'border-right-width': 'right',
    'border-bottom-width': 'bottom',
    'border-left-width': 'left',
    'border-top-style': 'top',
    'border-right-style': 'right',
    'border-bottom-style': 'bottom',
    'border-left-style': 'left'
};
var _cssolibcompressorrestructure4restructShorthandjs221_MAIN_PROPERTY = {
    'margin': 'margin',
    'margin-top': 'margin',
    'margin-right': 'margin',
    'margin-bottom': 'margin',
    'margin-left': 'margin',

    'padding': 'padding',
    'padding-top': 'padding',
    'padding-right': 'padding',
    'padding-bottom': 'padding',
    'padding-left': 'padding',

    'border-color': 'border-color',
    'border-top-color': 'border-color',
    'border-right-color': 'border-color',
    'border-bottom-color': 'border-color',
    'border-left-color': 'border-color',
    'border-width': 'border-width',
    'border-top-width': 'border-width',
    'border-right-width': 'border-width',
    'border-bottom-width': 'border-width',
    'border-left-width': 'border-width',
    'border-style': 'border-style',
    'border-top-style': 'border-style',
    'border-right-style': 'border-style',
    'border-bottom-style': 'border-style',
    'border-left-style': 'border-style'
};

function _cssolibcompressorrestructure4restructShorthandjs221_TRBL(name) {
    this.name = name;
    this.info = null;
    this.iehack = undefined;
    this.sides = {
        'top': null,
        'right': null,
        'bottom': null,
        'left': null
    };
}

_cssolibcompressorrestructure4restructShorthandjs221_TRBL.prototype.getValueSequence = function (value, count) {
    var values = [];
    var iehack = false;
    var hasBadValues = value.sequence.some(function (child) {
        var special = false;

        switch (child.type) {
            case 'Identifier':
                switch (child.name) {
                    case '\\9':
                        iehack = true;
                        return;

                    case 'inherit':
                    case 'initial':
                    case 'unset':
                    case 'revert':
                        special = child.name;
                        break;
                }
                break;

            case 'Dimension':
                switch (child.unit) {
                    // is not supported until IE11
                    case 'rem':

                    // v* units is too buggy across browsers and better
                    // don't merge values with those units
                    case 'vw':
                    case 'vh':
                    case 'vmin':
                    case 'vmax':
                    case 'vm':
                        // IE9 supporting "vm" instead of "vmin".
                        special = child.unit;
                        break;
                }
                break;

            case 'Hash': // color
            case 'Number':
            case 'Percentage':
                break;

            case 'Function':
                special = child.name;
                break;

            case 'Space':
                return false; // ignore space

            default:
                return true; // bad value
        }

        values.push({
            node: child,
            special: special,
            important: value.important
        });
    });

    if (hasBadValues || values.length > count) {
        return false;
    }

    if (typeof this.iehack === 'boolean' && this.iehack !== iehack) {
        return false;
    }

    this.iehack = iehack; // move outside

    return values;
};

_cssolibcompressorrestructure4restructShorthandjs221_TRBL.prototype.canOverride = function (side, value) {
    var currentValue = this.sides[side];

    return !currentValue || value.important && !currentValue.important;
};

_cssolibcompressorrestructure4restructShorthandjs221_TRBL.prototype.add = function (name, value, info) {
    function attemptToAdd() {
        var sides = this.sides;
        var side = _cssolibcompressorrestructure4restructShorthandjs221_SIDE[name];

        if (side) {
            if (side in sides === false) {
                return false;
            }

            var values = this.getValueSequence(value, 1);

            if (!values || !values.length) {
                return false;
            }

            // can mix only if specials are equal
            for (var key in sides) {
                if (sides[key] !== null && sides[key].special !== values[0].special) {
                    return false;
                }
            }

            if (!this.canOverride(side, values[0])) {
                return true;
            }

            sides[side] = values[0];
            return true;
        } else if (name === this.name) {
            var values = this.getValueSequence(value, 4);

            if (!values || !values.length) {
                return false;
            }

            switch (values.length) {
                case 1:
                    values[_cssolibcompressorrestructure4restructShorthandjs221_RIGHT] = values[_cssolibcompressorrestructure4restructShorthandjs221_TOP];
                    values[_cssolibcompressorrestructure4restructShorthandjs221_BOTTOM] = values[_cssolibcompressorrestructure4restructShorthandjs221_TOP];
                    values[_cssolibcompressorrestructure4restructShorthandjs221_LEFT] = values[_cssolibcompressorrestructure4restructShorthandjs221_TOP];
                    break;

                case 2:
                    values[_cssolibcompressorrestructure4restructShorthandjs221_BOTTOM] = values[_cssolibcompressorrestructure4restructShorthandjs221_TOP];
                    values[_cssolibcompressorrestructure4restructShorthandjs221_LEFT] = values[_cssolibcompressorrestructure4restructShorthandjs221_RIGHT];
                    break;

                case 3:
                    values[_cssolibcompressorrestructure4restructShorthandjs221_LEFT] = values[_cssolibcompressorrestructure4restructShorthandjs221_RIGHT];
                    break;
            }

            // can mix only if specials are equal
            for (var i = 0; i < 4; i++) {
                for (var key in sides) {
                    if (sides[key] !== null && sides[key].special !== values[i].special) {
                        return false;
                    }
                }
            }

            for (var i = 0; i < 4; i++) {
                if (this.canOverride(_cssolibcompressorrestructure4restructShorthandjs221_SIDES[i], values[i])) {
                    sides[_cssolibcompressorrestructure4restructShorthandjs221_SIDES[i]] = values[i];
                }
            }

            return true;
        }
    }

    if (!attemptToAdd.call(this)) {
        return false;
    }

    if (this.info) {
        this.info = {
            primary: this.info,
            merged: info
        };
    } else {
        this.info = info;
    }

    return true;
};

_cssolibcompressorrestructure4restructShorthandjs221_TRBL.prototype.isOkToMinimize = function () {
    var top = this.sides.top;
    var right = this.sides.right;
    var bottom = this.sides.bottom;
    var left = this.sides.left;

    if (top && right && bottom && left) {
        var important = top.important + right.important + bottom.important + left.important;

        return important === 0 || important === 4;
    }

    return false;
};

_cssolibcompressorrestructure4restructShorthandjs221_TRBL.prototype.getValue = function () {
    var result = [];
    var sides = this.sides;
    var values = [sides.top, sides.right, sides.bottom, sides.left];
    var stringValues = [_cssolibcompressorrestructure4restructShorthandjs221_translate(sides.top.node), _cssolibcompressorrestructure4restructShorthandjs221_translate(sides.right.node), _cssolibcompressorrestructure4restructShorthandjs221_translate(sides.bottom.node), _cssolibcompressorrestructure4restructShorthandjs221_translate(sides.left.node)];

    if (stringValues[_cssolibcompressorrestructure4restructShorthandjs221_LEFT] === stringValues[_cssolibcompressorrestructure4restructShorthandjs221_RIGHT]) {
        values.pop();
        if (stringValues[_cssolibcompressorrestructure4restructShorthandjs221_BOTTOM] === stringValues[_cssolibcompressorrestructure4restructShorthandjs221_TOP]) {
            values.pop();
            if (stringValues[_cssolibcompressorrestructure4restructShorthandjs221_RIGHT] === stringValues[_cssolibcompressorrestructure4restructShorthandjs221_TOP]) {
                values.pop();
            }
        }
    }

    for (var i = 0; i < values.length; i++) {
        if (i) {
            result.push({ type: 'Space' });
        }

        result.push(values[i].node);
    }

    if (this.iehack) {
        result.push({ type: 'Space' }, {
            type: 'Identifier',
            info: {},
            name: '\\9'
        });
    }

    return {
        type: 'Value',
        info: {},
        important: sides.top.important,
        sequence: new _cssolibcompressorrestructure4restructShorthandjs221_List(result)
    };
};

_cssolibcompressorrestructure4restructShorthandjs221_TRBL.prototype.getProperty = function () {
    return {
        type: 'Property',
        info: {},
        name: this.name
    };
};

function _cssolibcompressorrestructure4restructShorthandjs221_processRuleset(ruleset, shorts, shortDeclarations, lastShortSelector) {
    var declarations = ruleset.block.declarations;
    var selector = ruleset.selector.selectors.first().id;

    ruleset.block.declarations.eachRight(function (declaration, item) {
        var property = declaration.property.name;

        if (!_cssolibcompressorrestructure4restructShorthandjs221_MAIN_PROPERTY.hasOwnProperty(property)) {
            return;
        }

        var key = _cssolibcompressorrestructure4restructShorthandjs221_MAIN_PROPERTY[property];
        var shorthand;
        var operation;

        if (!lastShortSelector || selector === lastShortSelector) {
            if (key in shorts) {
                operation = _cssolibcompressorrestructure4restructShorthandjs221_REMOVE;
                shorthand = shorts[key];
            }
        }

        if (!shorthand || !shorthand.add(property, declaration.value, declaration.info)) {
            operation = _cssolibcompressorrestructure4restructShorthandjs221_REPLACE;
            shorthand = new _cssolibcompressorrestructure4restructShorthandjs221_TRBL(key);

            // if can't parse value ignore it and break shorthand sequence
            if (!shorthand.add(property, declaration.value, declaration.info)) {
                lastShortSelector = null;
                return;
            }
        }

        shorts[key] = shorthand;
        shortDeclarations.push({
            operation: operation,
            block: declarations,
            item: item,
            shorthand: shorthand
        });

        lastShortSelector = selector;
    });

    return lastShortSelector;
};

function _cssolibcompressorrestructure4restructShorthandjs221_processShorthands(shortDeclarations, markDeclaration) {
    shortDeclarations.forEach(function (item) {
        var shorthand = item.shorthand;

        if (!shorthand.isOkToMinimize()) {
            return;
        }

        if (item.operation === _cssolibcompressorrestructure4restructShorthandjs221_REPLACE) {
            item.item.data = markDeclaration({
                type: 'Declaration',
                info: shorthand.info,
                property: shorthand.getProperty(),
                value: shorthand.getValue(),
                id: 0,
                length: 0,
                fingerprint: null
            });
        } else {
            item.block.remove(item.item);
        }
    });
};

$m['csso/lib/compressor/restructure/4-restructShorthand.js#2.2.1'].exports = function restructBlock(ast, indexer) {
    var stylesheetMap = {};
    var shortDeclarations = [];

    _cssolibcompressorrestructure4restructShorthandjs221_walkRulesRight(ast, function (node) {
        if (node.type !== 'Ruleset') {
            return;
        }

        var stylesheet = this.stylesheet;
        var rulesetId = (node.pseudoSignature || '') + '|' + node.selector.selectors.first().id;
        var rulesetMap;
        var shorts;

        if (!stylesheetMap.hasOwnProperty(stylesheet.id)) {
            rulesetMap = {
                lastShortSelector: null
            };
            stylesheetMap[stylesheet.id] = rulesetMap;
        } else {
            rulesetMap = stylesheetMap[stylesheet.id];
        }

        if (rulesetMap.hasOwnProperty(rulesetId)) {
            shorts = rulesetMap[rulesetId];
        } else {
            shorts = {};
            rulesetMap[rulesetId] = shorts;
        }

        rulesetMap.lastShortSelector = _cssolibcompressorrestructure4restructShorthandjs221_processRuleset.call(this, node, shorts, shortDeclarations, rulesetMap.lastShortSelector);
    });

    _cssolibcompressorrestructure4restructShorthandjs221_processShorthands(shortDeclarations, indexer.declaration);
};
/*≠≠ node_modules/csso/lib/compress...ructure/4-restructShorthand.js ≠≠*/

/*== node_modules/csso/lib/compress...estructure/3-disjoinRuleset.js ==*/
$m['csso/lib/compressor/restructure/3-disjoinRuleset.js#2.2.1'] = { exports: {} };
var _cssolibcompressorrestructure3disjoinRulesetjs221_List = $m['csso/lib/utils/list.js#2.2.1'].exports;
var _cssolibcompressorrestructure3disjoinRulesetjs221_walkRulesRight = $m['csso/lib/utils/walk.js#2.2.1'].exports.rulesRight;

function _cssolibcompressorrestructure3disjoinRulesetjs221_processRuleset(node, item, list) {
    var selectors = node.selector.selectors;

    // generate new rule sets:
    // .a, .b { color: red; }
    // ->
    // .a { color: red; }
    // .b { color: red; }

    // while there are more than 1 simple selector split for rulesets
    while (selectors.head !== selectors.tail) {
        var newSelectors = new _cssolibcompressorrestructure3disjoinRulesetjs221_List();
        newSelectors.insert(selectors.remove(selectors.head));

        list.insert(list.createItem({
            type: 'Ruleset',
            info: node.info,
            pseudoSignature: node.pseudoSignature,
            selector: {
                type: 'Selector',
                info: node.selector.info,
                selectors: newSelectors
            },
            block: {
                type: 'Block',
                info: node.block.info,
                declarations: node.block.declarations.copy()
            }
        }), item);
    }
};

$m['csso/lib/compressor/restructure/3-disjoinRuleset.js#2.2.1'].exports = function disjoinRuleset(ast) {
    _cssolibcompressorrestructure3disjoinRulesetjs221_walkRulesRight(ast, function (node, item, list) {
        if (node.type === 'Ruleset') {
            _cssolibcompressorrestructure3disjoinRulesetjs221_processRuleset(node, item, list);
        }
    });
};
/*≠≠ node_modules/csso/lib/compress...estructure/3-disjoinRuleset.js ≠≠*/

/*== node_modules/csso/lib/compressor/restructure/2-mergeAtrule.js ==*/
$m['csso/lib/compressor/restructure/2-mergeAtrule.js#2.2.1'] = { exports: {} };
var _cssolibcompressorrestructure2mergeAtrulejs221_walkRulesRight = $m['csso/lib/utils/walk.js#2.2.1'].exports.rulesRight;

function _cssolibcompressorrestructure2mergeAtrulejs221_isMediaRule(node) {
    return node.type === 'Atrule' && node.name === 'media';
}

function _cssolibcompressorrestructure2mergeAtrulejs221_processAtrule(node, item, list) {
    if (!_cssolibcompressorrestructure2mergeAtrulejs221_isMediaRule(node)) {
        return;
    }

    var prev = item.prev && item.prev.data;

    if (!prev || !_cssolibcompressorrestructure2mergeAtrulejs221_isMediaRule(prev)) {
        return;
    }

    // merge @media with same query
    if (node.expression.id === prev.expression.id) {
        prev.block.rules.appendList(node.block.rules);
        prev.info = {
            primary: prev.info,
            merged: node.info
        };
        list.remove(item);
    }
};

$m['csso/lib/compressor/restructure/2-mergeAtrule.js#2.2.1'].exports = function rejoinAtrule(ast) {
    _cssolibcompressorrestructure2mergeAtrulejs221_walkRulesRight(ast, function (node, item, list) {
        if (node.type === 'Atrule') {
            _cssolibcompressorrestructure2mergeAtrulejs221_processAtrule(node, item, list);
        }
    });
};
/*≠≠ node_modules/csso/lib/compressor/restructure/2-mergeAtrule.js ≠≠*/

/*== node_modules/csso/lib/compress...cture/1-initialMergeRuleset.js ==*/
$m['csso/lib/compressor/restructure/1-initialMergeRuleset.js#2.2.1'] = { exports: {} };
var _cssolibcompressorrestructure1initialMergeRulesetjs221_utils = $m['csso/lib/compressor/restructure/utils.js#2.2.1'].exports;
var _cssolibcompressorrestructure1initialMergeRulesetjs221_walkRules = $m['csso/lib/utils/walk.js#2.2.1'].exports.rules;

function _cssolibcompressorrestructure1initialMergeRulesetjs221_processRuleset(node, item, list) {
    var selectors = node.selector.selectors;
    var declarations = node.block.declarations;

    list.prevUntil(item.prev, function (prev) {
        // skip non-ruleset node if safe
        if (prev.type !== 'Ruleset') {
            return _cssolibcompressorrestructure1initialMergeRulesetjs221_utils.unsafeToSkipNode.call(selectors, prev);
        }

        var prevSelectors = prev.selector.selectors;
        var prevDeclarations = prev.block.declarations;

        // try to join rulesets with equal pseudo signature
        if (node.pseudoSignature === prev.pseudoSignature) {
            // try to join by selectors
            if (_cssolibcompressorrestructure1initialMergeRulesetjs221_utils.isEqualLists(prevSelectors, selectors)) {
                prevDeclarations.appendList(declarations);
                list.remove(item);
                return true;
            }

            // try to join by declarations
            if (_cssolibcompressorrestructure1initialMergeRulesetjs221_utils.isEqualDeclarations(declarations, prevDeclarations)) {
                _cssolibcompressorrestructure1initialMergeRulesetjs221_utils.addSelectors(prevSelectors, selectors);
                list.remove(item);
                return true;
            }
        }

        // go to prev ruleset if has no selector similarities
        return _cssolibcompressorrestructure1initialMergeRulesetjs221_utils.hasSimilarSelectors(selectors, prevSelectors);
    });
};

// NOTE: direction should be left to right, since rulesets merge to left
// ruleset. When direction right to left unmerged rulesets may prevent lookup
// TODO: remove initial merge
$m['csso/lib/compressor/restructure/1-initialMergeRuleset.js#2.2.1'].exports = function initialMergeRuleset(ast) {
    _cssolibcompressorrestructure1initialMergeRulesetjs221_walkRules(ast, function (node, item, list) {
        if (node.type === 'Ruleset') {
            _cssolibcompressorrestructure1initialMergeRulesetjs221_processRuleset(node, item, list);
        }
    });
};
/*≠≠ node_modules/csso/lib/compress...cture/1-initialMergeRuleset.js ≠≠*/

/*== node_modules/csso/lib/compress...ructure/prepare/specificity.js ==*/
$m['csso/lib/compressor/restructure/prepare/specificity.js#2.2.1'] = { exports: {} };
$m['csso/lib/compressor/restructure/prepare/specificity.js#2.2.1'].exports = function specificity(simpleSelector) {
    var A = 0;
    var B = 0;
    var C = 0;

    simpleSelector.sequence.each(function walk(data) {
        switch (data.type) {
            case 'SimpleSelector':
            case 'Negation':
                data.sequence.each(walk);
                break;

            case 'Id':
                A++;
                break;

            case 'Class':
            case 'Attribute':
            case 'FunctionalPseudo':
                B++;
                break;

            case 'Identifier':
                if (data.name !== '*') {
                    C++;
                }
                break;

            case 'PseudoElement':
                C++;
                break;

            case 'PseudoClass':
                var name = data.name.toLowerCase();
                if (name === 'before' || name === 'after' || name === 'first-line' || name === 'first-letter') {
                    C++;
                } else {
                    B++;
                }
                break;
        }
    });

    return [A, B, C];
};
/*≠≠ node_modules/csso/lib/compress...ructure/prepare/specificity.js ≠≠*/

/*== node_modules/csso/lib/compress...ure/prepare/processSelector.js ==*/
$m['csso/lib/compressor/restructure/prepare/processSelector.js#2.2.1'] = { exports: {} };
var _cssolibcompressorrestructureprepareprocessSelectorjs221_translate = $m['csso/lib/utils/translate.js#2.2.1'].exports;
var _cssolibcompressorrestructureprepareprocessSelectorjs221_specificity = $m['csso/lib/compressor/restructure/prepare/specificity.js#2.2.1'].exports;

var _cssolibcompressorrestructureprepareprocessSelectorjs221_nonFreezePseudoElements = {
    'first-letter': true,
    'first-line': true,
    'after': true,
    'before': true
};
var _cssolibcompressorrestructureprepareprocessSelectorjs221_nonFreezePseudoClasses = {
    'link': true,
    'visited': true,
    'hover': true,
    'active': true,
    'first-letter': true,
    'first-line': true,
    'after': true,
    'before': true
};

$m['csso/lib/compressor/restructure/prepare/processSelector.js#2.2.1'].exports = function freeze(node, usageData) {
    var pseudos = Object.create(null);
    var hasPseudo = false;

    node.selector.selectors.each(function (simpleSelector) {
        var tagName = '*';
        var scope = 0;

        simpleSelector.sequence.some(function (node) {
            switch (node.type) {
                case 'Class':
                    if (usageData && usageData.scopes) {
                        var classScope = usageData.scopes[node.name] || 0;

                        if (scope !== 0 && classScope !== scope) {
                            throw new Error('Selector can\'t has classes from different scopes: ' + _cssolibcompressorrestructureprepareprocessSelectorjs221_translate(simpleSelector));
                        }

                        scope = classScope;
                    }
                    break;

                case 'PseudoClass':
                    if (!_cssolibcompressorrestructureprepareprocessSelectorjs221_nonFreezePseudoClasses.hasOwnProperty(node.name)) {
                        pseudos[node.name] = true;
                        hasPseudo = true;
                    }
                    break;

                case 'PseudoElement':
                    if (!_cssolibcompressorrestructureprepareprocessSelectorjs221_nonFreezePseudoElements.hasOwnProperty(node.name)) {
                        pseudos[node.name] = true;
                        hasPseudo = true;
                    }
                    break;

                case 'FunctionalPseudo':
                    pseudos[node.name] = true;
                    hasPseudo = true;
                    break;

                case 'Negation':
                    pseudos.not = true;
                    hasPseudo = true;
                    break;

                case 'Identifier':
                    tagName = node.name;
                    break;

                case 'Attribute':
                    if (node.flags) {
                        pseudos['[' + node.flags + ']'] = true;
                        hasPseudo = true;
                    }
                    break;

                case 'Combinator':
                    tagName = '*';
                    break;
            }
        });

        simpleSelector.id = _cssolibcompressorrestructureprepareprocessSelectorjs221_translate(simpleSelector);
        simpleSelector.compareMarker = _cssolibcompressorrestructureprepareprocessSelectorjs221_specificity(simpleSelector).toString();

        if (scope) {
            simpleSelector.compareMarker += ':' + scope;
        }

        if (tagName !== '*') {
            simpleSelector.compareMarker += ',' + tagName;
        }
    });

    if (hasPseudo) {
        node.pseudoSignature = Object.keys(pseudos).sort().join(',');
    }
};
/*≠≠ node_modules/csso/lib/compress...ure/prepare/processSelector.js ≠≠*/

/*== node_modules/csso/lib/compress...re/createDeclarationIndexer.js ==*/
$m['csso/lib/compressor/restructure/prepare/createDeclarationIndexer.js#2.2.1'] = { exports: {} };
var _cssolibcompressorrestructurepreparecreateDeclarationIndexerjs221_translate = $m['csso/lib/utils/translate.js#2.2.1'].exports;

function _cssolibcompressorrestructurepreparecreateDeclarationIndexerjs221_Index() {
    this.seed = 0;
    this.map = Object.create(null);
}

_cssolibcompressorrestructurepreparecreateDeclarationIndexerjs221_Index.prototype.resolve = function (str) {
    var index = this.map[str];

    if (!index) {
        index = ++this.seed;
        this.map[str] = index;
    }

    return index;
};

$m['csso/lib/compressor/restructure/prepare/createDeclarationIndexer.js#2.2.1'].exports = function createDeclarationIndexer() {
    var names = new _cssolibcompressorrestructurepreparecreateDeclarationIndexerjs221_Index();
    var values = new _cssolibcompressorrestructurepreparecreateDeclarationIndexerjs221_Index();

    return function markDeclaration(node) {
        var property = node.property.name;
        var value = _cssolibcompressorrestructurepreparecreateDeclarationIndexerjs221_translate(node.value);

        node.id = names.resolve(property) + (values.resolve(value) << 12);
        node.length = property.length + 1 + value.length;

        return node;
    };
};
/*≠≠ node_modules/csso/lib/compress...re/createDeclarationIndexer.js ≠≠*/

/*== node_modules/csso/lib/compressor/restructure/prepare/index.js ==*/
$m['csso/lib/compressor/restructure/prepare/index.js#2.2.1'] = { exports: {} };
var _cssolibcompressorrestructureprepareindexjs221_resolveKeyword = $m['csso/lib/utils/names.js#2.2.1'].exports.keyword;
var _cssolibcompressorrestructureprepareindexjs221_walkRules = $m['csso/lib/utils/walk.js#2.2.1'].exports.rules;
var _cssolibcompressorrestructureprepareindexjs221_translate = $m['csso/lib/utils/translate.js#2.2.1'].exports;
var _cssolibcompressorrestructureprepareindexjs221_createDeclarationIndexer = $m['csso/lib/compressor/restructure/prepare/createDeclarationIndexer.js#2.2.1'].exports;
var _cssolibcompressorrestructureprepareindexjs221_processSelector = $m['csso/lib/compressor/restructure/prepare/processSelector.js#2.2.1'].exports;

function _cssolibcompressorrestructureprepareindexjs221_walk(node, markDeclaration, usageData) {
    switch (node.type) {
        case 'Ruleset':
            node.block.declarations.each(markDeclaration);
            _cssolibcompressorrestructureprepareindexjs221_processSelector(node, usageData);
            break;

        case 'Atrule':
            if (node.expression) {
                node.expression.id = _cssolibcompressorrestructureprepareindexjs221_translate(node.expression);
            }

            // compare keyframe selectors by its values
            // NOTE: still no clarification about problems with keyframes selector grouping (issue #197)
            if (_cssolibcompressorrestructureprepareindexjs221_resolveKeyword(node.name).name === 'keyframes') {
                node.block.avoidRulesMerge = true; /* probably we don't need to prevent those merges for @keyframes
                                                      TODO: need to be checked */
                node.block.rules.each(function (ruleset) {
                    ruleset.selector.selectors.each(function (simpleselector) {
                        simpleselector.compareMarker = simpleselector.id;
                    });
                });
            }
            break;
    }
};

$m['csso/lib/compressor/restructure/prepare/index.js#2.2.1'].exports = function prepare(ast, usageData) {
    var markDeclaration = _cssolibcompressorrestructureprepareindexjs221_createDeclarationIndexer();

    _cssolibcompressorrestructureprepareindexjs221_walkRules(ast, function (node) {
        _cssolibcompressorrestructureprepareindexjs221_walk(node, markDeclaration, usageData);
    });

    return {
        declaration: markDeclaration
    };
};
/*≠≠ node_modules/csso/lib/compressor/restructure/prepare/index.js ≠≠*/

/*== node_modules/csso/lib/compressor/restructure/index.js ==*/
$m['csso/lib/compressor/restructure/index.js#2.2.1'] = { exports: {} };
var _cssolibcompressorrestructureindexjs221_prepare = $m['csso/lib/compressor/restructure/prepare/index.js#2.2.1'].exports;
var _cssolibcompressorrestructureindexjs221_initialMergeRuleset = $m['csso/lib/compressor/restructure/1-initialMergeRuleset.js#2.2.1'].exports;
var _cssolibcompressorrestructureindexjs221_mergeAtrule = $m['csso/lib/compressor/restructure/2-mergeAtrule.js#2.2.1'].exports;
var _cssolibcompressorrestructureindexjs221_disjoinRuleset = $m['csso/lib/compressor/restructure/3-disjoinRuleset.js#2.2.1'].exports;
var _cssolibcompressorrestructureindexjs221_restructShorthand = $m['csso/lib/compressor/restructure/4-restructShorthand.js#2.2.1'].exports;
var _cssolibcompressorrestructureindexjs221_restructBlock = $m['csso/lib/compressor/restructure/6-restructBlock.js#2.2.1'].exports;
var _cssolibcompressorrestructureindexjs221_mergeRuleset = $m['csso/lib/compressor/restructure/7-mergeRuleset.js#2.2.1'].exports;
var _cssolibcompressorrestructureindexjs221_restructRuleset = $m['csso/lib/compressor/restructure/8-restructRuleset.js#2.2.1'].exports;

$m['csso/lib/compressor/restructure/index.js#2.2.1'].exports = function (ast, usageData, debug) {
    // prepare ast for restructing
    var indexer = _cssolibcompressorrestructureindexjs221_prepare(ast, usageData);
    debug('prepare', ast);

    _cssolibcompressorrestructureindexjs221_initialMergeRuleset(ast);
    debug('initialMergeRuleset', ast);

    _cssolibcompressorrestructureindexjs221_mergeAtrule(ast);
    debug('mergeAtrule', ast);

    _cssolibcompressorrestructureindexjs221_disjoinRuleset(ast);
    debug('disjoinRuleset', ast);

    _cssolibcompressorrestructureindexjs221_restructShorthand(ast, indexer);
    debug('restructShorthand', ast);

    _cssolibcompressorrestructureindexjs221_restructBlock(ast);
    debug('restructBlock', ast);

    _cssolibcompressorrestructureindexjs221_mergeRuleset(ast);
    debug('mergeRuleset', ast);

    _cssolibcompressorrestructureindexjs221_restructRuleset(ast);
    debug('restructRuleset', ast);
};
/*≠≠ node_modules/csso/lib/compressor/restructure/index.js ≠≠*/

/*== node_modules/csso/lib/compressor/compress/Number.js ==*/
$m['csso/lib/compressor/compress/Number.js#2.2.1'] = { exports: {} };
function _cssolibcompressorcompressNumberjs221_packNumber(value) {
    // 100 -> '100'
    // 00100 -> '100'
    // +100 -> '100'
    // -100 -> '-100'
    // 0.123 -> '.123'
    // 0.12300 -> '.123'
    // 0.0 -> ''
    // 0 -> ''
    value = String(value).replace(/^(?:\+|(-))?0*(\d*)(?:\.0*|(\.\d*?)0*)?$/, '$1$2$3');

    if (value.length === 0 || value === '-') {
        value = '0';
    }

    return value;
};

$m['csso/lib/compressor/compress/Number.js#2.2.1'].exports = function (node) {
    node.value = _cssolibcompressorcompressNumberjs221_packNumber(node.value);
};
$m['csso/lib/compressor/compress/Number.js#2.2.1'].exports.pack = _cssolibcompressorcompressNumberjs221_packNumber;
/*≠≠ node_modules/csso/lib/compressor/compress/Number.js ≠≠*/

/*== node_modules/csso/lib/compressor/compress/color.js ==*/
$m['csso/lib/compressor/compress/color.js#2.2.1'] = { exports: {} };
var _cssolibcompressorcompresscolorjs221_List = $m['csso/lib/utils/list.js#2.2.1'].exports;
var _cssolibcompressorcompresscolorjs221_packNumber = $m['csso/lib/compressor/compress/Number.js#2.2.1'].exports.pack;

// http://www.w3.org/TR/css3-color/#svg-color
var _cssolibcompressorcompresscolorjs221_NAME_TO_HEX = {
    'aliceblue': 'f0f8ff',
    'antiquewhite': 'faebd7',
    'aqua': '0ff',
    'aquamarine': '7fffd4',
    'azure': 'f0ffff',
    'beige': 'f5f5dc',
    'bisque': 'ffe4c4',
    'black': '000',
    'blanchedalmond': 'ffebcd',
    'blue': '00f',
    'blueviolet': '8a2be2',
    'brown': 'a52a2a',
    'burlywood': 'deb887',
    'cadetblue': '5f9ea0',
    'chartreuse': '7fff00',
    'chocolate': 'd2691e',
    'coral': 'ff7f50',
    'cornflowerblue': '6495ed',
    'cornsilk': 'fff8dc',
    'crimson': 'dc143c',
    'cyan': '0ff',
    'darkblue': '00008b',
    'darkcyan': '008b8b',
    'darkgoldenrod': 'b8860b',
    'darkgray': 'a9a9a9',
    'darkgrey': 'a9a9a9',
    'darkgreen': '006400',
    'darkkhaki': 'bdb76b',
    'darkmagenta': '8b008b',
    'darkolivegreen': '556b2f',
    'darkorange': 'ff8c00',
    'darkorchid': '9932cc',
    'darkred': '8b0000',
    'darksalmon': 'e9967a',
    'darkseagreen': '8fbc8f',
    'darkslateblue': '483d8b',
    'darkslategray': '2f4f4f',
    'darkslategrey': '2f4f4f',
    'darkturquoise': '00ced1',
    'darkviolet': '9400d3',
    'deeppink': 'ff1493',
    'deepskyblue': '00bfff',
    'dimgray': '696969',
    'dimgrey': '696969',
    'dodgerblue': '1e90ff',
    'firebrick': 'b22222',
    'floralwhite': 'fffaf0',
    'forestgreen': '228b22',
    'fuchsia': 'f0f',
    'gainsboro': 'dcdcdc',
    'ghostwhite': 'f8f8ff',
    'gold': 'ffd700',
    'goldenrod': 'daa520',
    'gray': '808080',
    'grey': '808080',
    'green': '008000',
    'greenyellow': 'adff2f',
    'honeydew': 'f0fff0',
    'hotpink': 'ff69b4',
    'indianred': 'cd5c5c',
    'indigo': '4b0082',
    'ivory': 'fffff0',
    'khaki': 'f0e68c',
    'lavender': 'e6e6fa',
    'lavenderblush': 'fff0f5',
    'lawngreen': '7cfc00',
    'lemonchiffon': 'fffacd',
    'lightblue': 'add8e6',
    'lightcoral': 'f08080',
    'lightcyan': 'e0ffff',
    'lightgoldenrodyellow': 'fafad2',
    'lightgray': 'd3d3d3',
    'lightgrey': 'd3d3d3',
    'lightgreen': '90ee90',
    'lightpink': 'ffb6c1',
    'lightsalmon': 'ffa07a',
    'lightseagreen': '20b2aa',
    'lightskyblue': '87cefa',
    'lightslategray': '789',
    'lightslategrey': '789',
    'lightsteelblue': 'b0c4de',
    'lightyellow': 'ffffe0',
    'lime': '0f0',
    'limegreen': '32cd32',
    'linen': 'faf0e6',
    'magenta': 'f0f',
    'maroon': '800000',
    'mediumaquamarine': '66cdaa',
    'mediumblue': '0000cd',
    'mediumorchid': 'ba55d3',
    'mediumpurple': '9370db',
    'mediumseagreen': '3cb371',
    'mediumslateblue': '7b68ee',
    'mediumspringgreen': '00fa9a',
    'mediumturquoise': '48d1cc',
    'mediumvioletred': 'c71585',
    'midnightblue': '191970',
    'mintcream': 'f5fffa',
    'mistyrose': 'ffe4e1',
    'moccasin': 'ffe4b5',
    'navajowhite': 'ffdead',
    'navy': '000080',
    'oldlace': 'fdf5e6',
    'olive': '808000',
    'olivedrab': '6b8e23',
    'orange': 'ffa500',
    'orangered': 'ff4500',
    'orchid': 'da70d6',
    'palegoldenrod': 'eee8aa',
    'palegreen': '98fb98',
    'paleturquoise': 'afeeee',
    'palevioletred': 'db7093',
    'papayawhip': 'ffefd5',
    'peachpuff': 'ffdab9',
    'peru': 'cd853f',
    'pink': 'ffc0cb',
    'plum': 'dda0dd',
    'powderblue': 'b0e0e6',
    'purple': '800080',
    'rebeccapurple': '639',
    'red': 'f00',
    'rosybrown': 'bc8f8f',
    'royalblue': '4169e1',
    'saddlebrown': '8b4513',
    'salmon': 'fa8072',
    'sandybrown': 'f4a460',
    'seagreen': '2e8b57',
    'seashell': 'fff5ee',
    'sienna': 'a0522d',
    'silver': 'c0c0c0',
    'skyblue': '87ceeb',
    'slateblue': '6a5acd',
    'slategray': '708090',
    'slategrey': '708090',
    'snow': 'fffafa',
    'springgreen': '00ff7f',
    'steelblue': '4682b4',
    'tan': 'd2b48c',
    'teal': '008080',
    'thistle': 'd8bfd8',
    'tomato': 'ff6347',
    'turquoise': '40e0d0',
    'violet': 'ee82ee',
    'wheat': 'f5deb3',
    'white': 'fff',
    'whitesmoke': 'f5f5f5',
    'yellow': 'ff0',
    'yellowgreen': '9acd32'
};

var _cssolibcompressorcompresscolorjs221_HEX_TO_NAME = {
    '800000': 'maroon',
    '800080': 'purple',
    '808000': 'olive',
    '808080': 'gray',
    '00ffff': 'cyan',
    'f0ffff': 'azure',
    'f5f5dc': 'beige',
    'ffe4c4': 'bisque',
    '000000': 'black',
    '0000ff': 'blue',
    'a52a2a': 'brown',
    'ff7f50': 'coral',
    'ffd700': 'gold',
    '008000': 'green',
    '4b0082': 'indigo',
    'fffff0': 'ivory',
    'f0e68c': 'khaki',
    '00ff00': 'lime',
    'faf0e6': 'linen',
    '000080': 'navy',
    'ffa500': 'orange',
    'da70d6': 'orchid',
    'cd853f': 'peru',
    'ffc0cb': 'pink',
    'dda0dd': 'plum',
    'f00': 'red',
    'ff0000': 'red',
    'fa8072': 'salmon',
    'a0522d': 'sienna',
    'c0c0c0': 'silver',
    'fffafa': 'snow',
    'd2b48c': 'tan',
    '008080': 'teal',
    'ff6347': 'tomato',
    'ee82ee': 'violet',
    'f5deb3': 'wheat',
    'ffffff': 'white',
    'ffff00': 'yellow'
};

function _cssolibcompressorcompresscolorjs221_hueToRgb(p, q, t) {
    if (t < 0) {
        t += 1;
    }
    if (t > 1) {
        t -= 1;
    }
    if (t < 1 / 6) {
        return p + (q - p) * 6 * t;
    }
    if (t < 1 / 2) {
        return q;
    }
    if (t < 2 / 3) {
        return p + (q - p) * (2 / 3 - t) * 6;
    }
    return p;
}

function _cssolibcompressorcompresscolorjs221_hslToRgb(h, s, l, a) {
    var r;
    var g;
    var b;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;

        r = _cssolibcompressorcompresscolorjs221_hueToRgb(p, q, h + 1 / 3);
        g = _cssolibcompressorcompresscolorjs221_hueToRgb(p, q, h);
        b = _cssolibcompressorcompresscolorjs221_hueToRgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), a];
}

function _cssolibcompressorcompresscolorjs221_toHex(value) {
    value = value.toString(16);
    return value.length === 1 ? '0' + value : value;
}

function _cssolibcompressorcompresscolorjs221_parseFunctionArgs(functionArgs, count, rgb) {
    var argument = functionArgs.head;
    var args = [];

    while (argument !== null) {
        var argumentPart = argument.data.sequence.head;
        var wasValue = false;

        while (argumentPart !== null) {
            var value = argumentPart.data;
            var type = value.type;

            switch (type) {
                case 'Number':
                case 'Percentage':
                    if (wasValue) {
                        return;
                    }

                    wasValue = true;
                    args.push({
                        type: type,
                        value: Number(value.value)
                    });
                    break;

                case 'Operator':
                    if (wasValue || value.value !== '+') {
                        return;
                    }
                    break;

                default:
                    // something we couldn't understand
                    return;
            }

            argumentPart = argumentPart.next;
        }

        argument = argument.next;
    }

    if (args.length !== count) {
        // invalid arguments count
        // TODO: remove those tokens
        return;
    }

    if (args.length === 4) {
        if (args[3].type !== 'Number') {
            // 4th argument should be a number
            // TODO: remove those tokens
            return;
        }

        args[3].type = 'Alpha';
    }

    if (rgb) {
        if (args[0].type !== args[1].type || args[0].type !== args[2].type) {
            // invalid color, numbers and percentage shouldn't be mixed
            // TODO: remove those tokens
            return;
        }
    } else {
        if (args[0].type !== 'Number' || args[1].type !== 'Percentage' || args[2].type !== 'Percentage') {
            // invalid color, for hsl values should be: number, percentage, percentage
            // TODO: remove those tokens
            return;
        }

        args[0].type = 'Angle';
    }

    return args.map(function (arg) {
        var value = Math.max(0, arg.value);

        switch (arg.type) {
            case 'Number':
                // fit value to [0..255] range
                value = Math.min(value, 255);
                break;

            case 'Percentage':
                // convert 0..100% to value in [0..255] range
                value = Math.min(value, 100) / 100;

                if (!rgb) {
                    return value;
                }

                value = 255 * value;
                break;

            case 'Angle':
                // fit value to (-360..360) range
                return (value % 360 + 360) % 360 / 360;

            case 'Alpha':
                // fit value to [0..1] range
                return Math.min(value, 1);
        }

        return Math.round(value);
    });
}

function _cssolibcompressorcompresscolorjs221_compressFunction(node, item, list) {
    var functionName = node.name;
    var args;

    if (functionName === 'rgba' || functionName === 'hsla') {
        args = _cssolibcompressorcompresscolorjs221_parseFunctionArgs(node.arguments, 4, functionName === 'rgba');

        if (!args) {
            // something went wrong
            return;
        }

        if (functionName === 'hsla') {
            args = _cssolibcompressorcompresscolorjs221_hslToRgb.apply(null, args);
            node.name = 'rgba';
        }

        if (args[3] !== 1) {
            // replace argument values for normalized/interpolated
            node.arguments.each(function (argument) {
                var item = argument.sequence.head;

                if (item.data.type === 'Operator') {
                    item = item.next;
                }

                argument.sequence = new _cssolibcompressorcompresscolorjs221_List([{
                    type: 'Number',
                    info: item.data.info,
                    value: _cssolibcompressorcompresscolorjs221_packNumber(args.shift())
                }]);
            });

            return;
        }

        // otherwise convert to rgb, i.e. rgba(255, 0, 0, 1) -> rgb(255, 0, 0)
        functionName = 'rgb';
    }

    if (functionName === 'hsl') {
        args = args || _cssolibcompressorcompresscolorjs221_parseFunctionArgs(node.arguments, 3, false);

        if (!args) {
            // something went wrong
            return;
        }

        // convert to rgb
        args = _cssolibcompressorcompresscolorjs221_hslToRgb.apply(null, args);
        functionName = 'rgb';
    }

    if (functionName === 'rgb') {
        args = args || _cssolibcompressorcompresscolorjs221_parseFunctionArgs(node.arguments, 3, true);

        if (!args) {
            // something went wrong
            return;
        }

        // check if color is not at the end and not followed by space
        var next = item.next;
        if (next && next.data.type !== 'Space') {
            list.insert(list.createItem({
                type: 'Space'
            }), next);
        }

        item.data = {
            type: 'Hash',
            info: node.info,
            value: _cssolibcompressorcompresscolorjs221_toHex(args[0]) + _cssolibcompressorcompresscolorjs221_toHex(args[1]) + _cssolibcompressorcompresscolorjs221_toHex(args[2])
        };

        _cssolibcompressorcompresscolorjs221_compressHex(item.data, item);
    }
}

function _cssolibcompressorcompresscolorjs221_compressIdent(node, item) {
    if (this.declaration === null) {
        return;
    }

    var color = node.name.toLowerCase();

    if (_cssolibcompressorcompresscolorjs221_NAME_TO_HEX.hasOwnProperty(color)) {
        var hex = _cssolibcompressorcompresscolorjs221_NAME_TO_HEX[color];

        if (hex.length + 1 <= color.length) {
            // replace for shorter hex value
            item.data = {
                type: 'Hash',
                info: node.info,
                value: hex
            };
        } else {
            // special case for consistent colors
            if (color === 'grey') {
                color = 'gray';
            }

            // just replace value for lower cased name
            node.name = color;
        }
    }
}

function _cssolibcompressorcompresscolorjs221_compressHex(node, item) {
    var color = node.value.toLowerCase();

    // #112233 -> #123
    if (color.length === 6 && color[0] === color[1] && color[2] === color[3] && color[4] === color[5]) {
        color = color[0] + color[2] + color[4];
    }

    if (_cssolibcompressorcompresscolorjs221_HEX_TO_NAME[color]) {
        item.data = {
            type: 'Identifier',
            info: node.info,
            name: _cssolibcompressorcompresscolorjs221_HEX_TO_NAME[color]
        };
    } else {
        node.value = color;
    }
}

$m['csso/lib/compressor/compress/color.js#2.2.1'].exports = {
    compressFunction: _cssolibcompressorcompresscolorjs221_compressFunction,
    compressIdent: _cssolibcompressorcompresscolorjs221_compressIdent,
    compressHex: _cssolibcompressorcompresscolorjs221_compressHex
};
/*≠≠ node_modules/csso/lib/compressor/compress/color.js ≠≠*/

/*== node_modules/csso/lib/compressor/compress/Url.js ==*/
$m['csso/lib/compressor/compress/Url.js#2.2.1'] = { exports: {} };
var _cssolibcompressorcompressUrljs221_UNICODE = '\\\\[0-9a-f]{1,6}(\\r\\n|[ \\n\\r\\t\\f])?';
var _cssolibcompressorcompressUrljs221_ESCAPE = '(' + _cssolibcompressorcompressUrljs221_UNICODE + '|\\\\[^\\n\\r\\f0-9a-fA-F])';
var _cssolibcompressorcompressUrljs221_NONPRINTABLE = '\u0000\u0008\u000b\u000e-\u001f\u007f';
var _cssolibcompressorcompressUrljs221_SAFE_URL = new RegExp('^(' + _cssolibcompressorcompressUrljs221_ESCAPE + '|[^\"\'\\(\\)\\\\\\s' + _cssolibcompressorcompressUrljs221_NONPRINTABLE + '])*$', 'i');

$m['csso/lib/compressor/compress/Url.js#2.2.1'].exports = function (node) {
    var value = node.value;

    if (value.type !== 'String') {
        return;
    }

    var quote = value.value[0];
    var url = value.value.substr(1, value.value.length - 2);

    // convert `\\` to `/`
    url = url.replace(/\\\\/g, '/');

    // remove quotes when safe
    // https://www.w3.org/TR/css-syntax-3/#url-unquoted-diagram
    if (_cssolibcompressorcompressUrljs221_SAFE_URL.test(url)) {
        node.value = {
            type: 'Raw',
            info: node.value.info,
            value: url
        };
    } else {
        // use double quotes if string has no double quotes
        // otherwise use original quotes
        // TODO: make better quote type selection
        node.value.value = url.indexOf('"') === -1 ? '"' + url + '"' : quote + url + quote;
    }
};
/*≠≠ node_modules/csso/lib/compressor/compress/Url.js ≠≠*/

/*== node_modules/csso/lib/compressor/compress/String.js ==*/
$m['csso/lib/compressor/compress/String.js#2.2.1'] = { exports: {} };
$m['csso/lib/compressor/compress/String.js#2.2.1'].exports = function (node) {
    var value = node.value;

    // remove escaped \n, i.e.
    // .a { content: "foo\
    // bar"}
    // ->
    // .a { content: "foobar" }
    value = value.replace(/\\\n/g, '');

    node.value = value;
};
/*≠≠ node_modules/csso/lib/compressor/compress/String.js ≠≠*/

/*== node_modules/csso/lib/compressor/compress/Dimension.js ==*/
$m['csso/lib/compressor/compress/Dimension.js#2.2.1'] = { exports: {} };
var _cssolibcompressorcompressDimensionjs221_packNumber = $m['csso/lib/compressor/compress/Number.js#2.2.1'].exports.pack;
var _cssolibcompressorcompressDimensionjs221_LENGTH_UNIT = {
    // absolute length units
    'px': true,
    'mm': true,
    'cm': true,
    'in': true,
    'pt': true,
    'pc': true,

    // relative length units
    'em': true,
    'ex': true,
    'ch': true,
    'rem': true,

    // viewport-percentage lengths
    'vh': true,
    'vw': true,
    'vmin': true,
    'vmax': true,
    'vm': true
};

$m['csso/lib/compressor/compress/Dimension.js#2.2.1'].exports = function compressDimension(node, item) {
    var value = _cssolibcompressorcompressDimensionjs221_packNumber(node.value);

    node.value = value;

    if (value === '0' && this.declaration) {
        var unit = node.unit.toLowerCase();

        // only length values can be compressed
        if (!_cssolibcompressorcompressDimensionjs221_LENGTH_UNIT.hasOwnProperty(unit)) {
            return;
        }

        // issue #200: don't remove units in flex property as it could change value meaning
        if (this.declaration.property.name === 'flex') {
            return;
        }

        // issue #222: don't remove units inside calc
        if (this['function'] && this['function'].name === 'calc') {
            return;
        }

        item.data = {
            type: 'Number',
            info: node.info,
            value: value
        };
    }
};
/*≠≠ node_modules/csso/lib/compressor/compress/Dimension.js ≠≠*/

/*== node_modules/csso/lib/compress...ompress/property/background.js ==*/
$m['csso/lib/compressor/compress/property/background.js#2.2.1'] = { exports: {} };
var _cssolibcompressorcompresspropertybackgroundjs221_List = $m['csso/lib/utils/list.js#2.2.1'].exports;

$m['csso/lib/compressor/compress/property/background.js#2.2.1'].exports = function compressBackground(node) {
    function lastType() {
        if (buffer.length) {
            return buffer[buffer.length - 1].type;
        }
    }

    function flush() {
        if (lastType() === 'Space') {
            buffer.pop();
        }

        if (!buffer.length) {
            buffer.unshift({
                type: 'Number',
                value: '0'
            }, {
                type: 'Space'
            }, {
                type: 'Number',
                value: '0'
            });
        }

        newValue.push.apply(newValue, buffer);

        buffer = [];
    }

    var newValue = [];
    var buffer = [];

    node.sequence.each(function (node) {
        if (node.type === 'Operator' && node.value === ',') {
            flush();
            newValue.push(node);
            return;
        }

        // remove defaults
        if (node.type === 'Identifier') {
            if (node.name === 'transparent' || node.name === 'none' || node.name === 'repeat' || node.name === 'scroll') {
                return;
            }
        }

        // don't add redundant spaces
        if (node.type === 'Space' && (!buffer.length || lastType() === 'Space')) {
            return;
        }

        buffer.push(node);
    });

    flush();
    node.sequence = new _cssolibcompressorcompresspropertybackgroundjs221_List(newValue);
};
/*≠≠ node_modules/csso/lib/compress...ompress/property/background.js ≠≠*/

/*== node_modules/csso/lib/compress...mpress/property/font-weight.js ==*/
$m['csso/lib/compressor/compress/property/font-weight.js#2.2.1'] = { exports: {} };
$m['csso/lib/compressor/compress/property/font-weight.js#2.2.1'].exports = function compressFontWeight(node) {
    var value = node.sequence.head.data;

    if (value.type === 'Identifier') {
        switch (value.name) {
            case 'normal':
                node.sequence.head.data = {
                    type: 'Number',
                    info: value.info,
                    value: '400'
                };
                break;
            case 'bold':
                node.sequence.head.data = {
                    type: 'Number',
                    info: value.info,
                    value: '700'
                };
                break;
        }
    }
};
/*≠≠ node_modules/csso/lib/compress...mpress/property/font-weight.js ≠≠*/

/*== node_modules/csso/lib/compressor/compress/property/font.js ==*/
$m['csso/lib/compressor/compress/property/font.js#2.2.1'] = { exports: {} };
$m['csso/lib/compressor/compress/property/font.js#2.2.1'].exports = function compressFont(node) {
    var list = node.sequence;

    list.eachRight(function (node, item) {
        if (node.type === 'Identifier') {
            if (node.name === 'bold') {
                item.data = {
                    type: 'Number',
                    info: node.info,
                    value: '700'
                };
            } else if (node.name === 'normal') {
                var prev = item.prev;

                if (prev && prev.data.type === 'Operator' && prev.data.value === '/') {
                    this.remove(prev);
                }

                this.remove(item);
            } else if (node.name === 'medium') {
                var next = item.next;

                if (!next || next.data.type !== 'Operator') {
                    this.remove(item);
                }
            }
        }
    });

    // remove redundant spaces
    list.each(function (node, item) {
        if (node.type === 'Space') {
            if (!item.prev || !item.next || item.next.data.type === 'Space') {
                this.remove(item);
            }
        }
    });

    if (list.isEmpty()) {
        list.insert(list.createItem({
            type: 'Identifier',
            name: 'normal'
        }));
    }
};
/*≠≠ node_modules/csso/lib/compressor/compress/property/font.js ≠≠*/

/*== node_modules/csso/lib/compressor/compress/Value.js ==*/
$m['csso/lib/compressor/compress/Value.js#2.2.1'] = { exports: {} };
var _cssolibcompressorcompressValuejs221_resolveName = $m['csso/lib/utils/names.js#2.2.1'].exports.property;
var _cssolibcompressorcompressValuejs221_handlers = {
    'font': $m['csso/lib/compressor/compress/property/font.js#2.2.1'].exports,
    'font-weight': $m['csso/lib/compressor/compress/property/font-weight.js#2.2.1'].exports,
    'background': $m['csso/lib/compressor/compress/property/background.js#2.2.1'].exports
};

$m['csso/lib/compressor/compress/Value.js#2.2.1'].exports = function compressValue(node) {
    if (!this.declaration) {
        return;
    }

    var property = _cssolibcompressorcompressValuejs221_resolveName(this.declaration.property.name);

    if (_cssolibcompressorcompressValuejs221_handlers.hasOwnProperty(property.name)) {
        _cssolibcompressorcompressValuejs221_handlers[property.name](node);
    }
};
/*≠≠ node_modules/csso/lib/compressor/compress/Value.js ≠≠*/

/*== node_modules/csso/lib/compressor/compress/Attribute.js ==*/
$m['csso/lib/compressor/compress/Attribute.js#2.2.1'] = { exports: {} };
// Can unquote attribute detection
// Adopted implementation of Mathias Bynens
// https://github.com/mathiasbynens/mothereff.in/blob/master/unquoted-attributes/eff.js
var _cssolibcompressorcompressAttributejs221_escapesRx = /\\([0-9A-Fa-f]{1,6})[ \t\n\f\r]?|\\./g;
var _cssolibcompressorcompressAttributejs221_blockUnquoteRx = /^(-?\d|--)|[\u0000-\u002c\u002e\u002f\u003A-\u0040\u005B-\u005E\u0060\u007B-\u009f]/;

function _cssolibcompressorcompressAttributejs221_canUnquote(value) {
    if (value === '' || value === '-') {
        return;
    }

    // Escapes are valid, so replace them with a valid non-empty string
    value = value.replace(_cssolibcompressorcompressAttributejs221_escapesRx, 'a');

    return !_cssolibcompressorcompressAttributejs221_blockUnquoteRx.test(value);
}

$m['csso/lib/compressor/compress/Attribute.js#2.2.1'].exports = function (node) {
    var attrValue = node.value;

    if (!attrValue || attrValue.type !== 'String') {
        return;
    }

    var unquotedValue = attrValue.value.replace(/^(.)(.*)\1$/, '$2');
    if (_cssolibcompressorcompressAttributejs221_canUnquote(unquotedValue)) {
        node.value = {
            type: 'Identifier',
            info: attrValue.info,
            name: unquotedValue
        };
    }
};
/*≠≠ node_modules/csso/lib/compressor/compress/Attribute.js ≠≠*/

/*== node_modules/csso/lib/compressor/compress/atrule/keyframes.js ==*/
$m['csso/lib/compressor/compress/atrule/keyframes.js#2.2.1'] = { exports: {} };
$m['csso/lib/compressor/compress/atrule/keyframes.js#2.2.1'].exports = function (node) {
    node.block.rules.each(function (ruleset) {
        ruleset.selector.selectors.each(function (simpleselector) {
            simpleselector.sequence.each(function (data, item) {
                if (data.type === 'Percentage' && data.value === '100') {
                    item.data = {
                        type: 'Identifier',
                        info: data.info,
                        name: 'to'
                    };
                } else if (data.type === 'Identifier' && data.name === 'from') {
                    item.data = {
                        type: 'Percentage',
                        info: data.info,
                        value: '0'
                    };
                }
            });
        });
    });
};
/*≠≠ node_modules/csso/lib/compressor/compress/atrule/keyframes.js ≠≠*/

/*== node_modules/csso/lib/compressor/compress/Atrule.js ==*/
$m['csso/lib/compressor/compress/Atrule.js#2.2.1'] = { exports: {} };
var _cssolibcompressorcompressAtrulejs221_resolveKeyword = $m['csso/lib/utils/names.js#2.2.1'].exports.keyword;
var _cssolibcompressorcompressAtrulejs221_compressKeyframes = $m['csso/lib/compressor/compress/atrule/keyframes.js#2.2.1'].exports;

$m['csso/lib/compressor/compress/Atrule.js#2.2.1'].exports = function (node) {
    // compress @keyframe selectors
    if (_cssolibcompressorcompressAtrulejs221_resolveKeyword(node.name).name === 'keyframes') {
        _cssolibcompressorcompressAtrulejs221_compressKeyframes(node);
    }
};
/*≠≠ node_modules/csso/lib/compressor/compress/Atrule.js ≠≠*/

/*== node_modules/csso/lib/compressor/compress/index.js ==*/
$m['csso/lib/compressor/compress/index.js#2.2.1'] = { exports: {} };
var _cssolibcompressorcompressindexjs221_walk = $m['csso/lib/utils/walk.js#2.2.1'].exports.all;
var _cssolibcompressorcompressindexjs221_handlers = {
    Atrule: $m['csso/lib/compressor/compress/Atrule.js#2.2.1'].exports,
    Attribute: $m['csso/lib/compressor/compress/Attribute.js#2.2.1'].exports,
    Value: $m['csso/lib/compressor/compress/Value.js#2.2.1'].exports,
    Dimension: $m['csso/lib/compressor/compress/Dimension.js#2.2.1'].exports,
    Percentage: $m['csso/lib/compressor/compress/Number.js#2.2.1'].exports,
    Number: $m['csso/lib/compressor/compress/Number.js#2.2.1'].exports,
    String: $m['csso/lib/compressor/compress/String.js#2.2.1'].exports,
    Url: $m['csso/lib/compressor/compress/Url.js#2.2.1'].exports,
    Hash: $m['csso/lib/compressor/compress/color.js#2.2.1'].exports.compressHex,
    Identifier: $m['csso/lib/compressor/compress/color.js#2.2.1'].exports.compressIdent,
    Function: $m['csso/lib/compressor/compress/color.js#2.2.1'].exports.compressFunction
};

$m['csso/lib/compressor/compress/index.js#2.2.1'].exports = function (ast) {
    _cssolibcompressorcompressindexjs221_walk(ast, function (node, item, list) {
        if (_cssolibcompressorcompressindexjs221_handlers.hasOwnProperty(node.type)) {
            _cssolibcompressorcompressindexjs221_handlers[node.type].call(this, node, item, list);
        }
    });
};
/*≠≠ node_modules/csso/lib/compressor/compress/index.js ≠≠*/

/*== node_modules/csso/lib/compressor/clean/Comment.js ==*/
$m['csso/lib/compressor/clean/Comment.js#2.2.1'] = { exports: {} };
$m['csso/lib/compressor/clean/Comment.js#2.2.1'].exports = function cleanComment(data, item, list) {
    list.remove(item);
};
/*≠≠ node_modules/csso/lib/compressor/clean/Comment.js ≠≠*/

/*== node_modules/csso/lib/compressor/clean/Identifier.js ==*/
$m['csso/lib/compressor/clean/Identifier.js#2.2.1'] = { exports: {} };
$m['csso/lib/compressor/clean/Identifier.js#2.2.1'].exports = function cleanIdentifier(node, item, list) {
    // remove useless universal selector
    if (this.selector !== null && node.name === '*') {
        // remove when universal selector isn't last
        if (item.next && item.next.data.type !== 'Combinator') {
            list.remove(item);
        }
    }
};
/*≠≠ node_modules/csso/lib/compressor/clean/Identifier.js ≠≠*/

/*== node_modules/csso/lib/compressor/clean/Declaration.js ==*/
$m['csso/lib/compressor/clean/Declaration.js#2.2.1'] = { exports: {} };
$m['csso/lib/compressor/clean/Declaration.js#2.2.1'].exports = function cleanDeclartion(node, item, list) {
    if (node.value.sequence.isEmpty()) {
        list.remove(item);
    }
};
/*≠≠ node_modules/csso/lib/compressor/clean/Declaration.js ≠≠*/

/*== node_modules/csso/lib/compressor/clean/Ruleset.js ==*/
$m['csso/lib/compressor/clean/Ruleset.js#2.2.1'] = { exports: {} };
var _cssolibcompressorcleanRulesetjs221_hasOwnProperty = Object.prototype.hasOwnProperty;

function _cssolibcompressorcleanRulesetjs221_cleanUnused(node, usageData) {
    return node.selector.selectors.each(function (selector, item, list) {
        var hasUnused = selector.sequence.some(function (node) {
            switch (node.type) {
                case 'Class':
                    return usageData.classes && !_cssolibcompressorcleanRulesetjs221_hasOwnProperty.call(usageData.classes, node.name);

                case 'Id':
                    return usageData.ids && !_cssolibcompressorcleanRulesetjs221_hasOwnProperty.call(usageData.ids, node.name);

                case 'Identifier':
                    // ignore universal selector
                    if (node.name !== '*') {
                        // TODO: remove toLowerCase when type selectors will be normalized
                        return usageData.tags && !_cssolibcompressorcleanRulesetjs221_hasOwnProperty.call(usageData.tags, node.name.toLowerCase());
                    }

                    break;
            }
        });

        if (hasUnused) {
            list.remove(item);
        }
    });
}

$m['csso/lib/compressor/clean/Ruleset.js#2.2.1'].exports = function cleanRuleset(node, item, list, usageData) {
    if (usageData) {
        _cssolibcompressorcleanRulesetjs221_cleanUnused(node, usageData);
    }

    if (node.selector.selectors.isEmpty() || node.block.declarations.isEmpty()) {
        list.remove(item);
    }
};
/*≠≠ node_modules/csso/lib/compressor/clean/Ruleset.js ≠≠*/

/*== node_modules/csso/lib/compressor/clean/Atrule.js ==*/
$m['csso/lib/compressor/clean/Atrule.js#2.2.1'] = { exports: {} };
$m['csso/lib/compressor/clean/Atrule.js#2.2.1'].exports = function cleanAtrule(node, item, list) {
    if (node.block) {
        // otherwise removed at-rule don't prevent @import for removal
        this.root.firstAtrulesAllowed = false;

        if (node.block.type === 'Block' && node.block.declarations.isEmpty()) {
            list.remove(item);
            return;
        }

        if (node.block.type === 'StyleSheet' && node.block.rules.isEmpty()) {
            list.remove(item);
            return;
        }
    }

    switch (node.name) {
        case 'charset':
            if (node.expression.sequence.isEmpty()) {
                list.remove(item);
                return;
            }

            // if there is any rule before @charset -> remove it
            if (item.prev) {
                list.remove(item);
                return;
            }

            break;

        case 'import':
            if (!this.root.firstAtrulesAllowed) {
                list.remove(item);
                return;
            }

            // if there are some rules that not an @import or @charset before @import
            // remove it
            list.prevUntil(item.prev, function (rule) {
                if (rule.type === 'Atrule') {
                    if (rule.name === 'import' || rule.name === 'charset') {
                        return;
                    }
                }

                this.root.firstAtrulesAllowed = false;
                list.remove(item);
                return true;
            }, this);

            break;
    }
};
/*≠≠ node_modules/csso/lib/compressor/clean/Atrule.js ≠≠*/

/*== node_modules/csso/lib/compressor/clean/Space.js ==*/
$m['csso/lib/compressor/clean/Space.js#2.2.1'] = { exports: {} };
function _cssolibcompressorcleanSpacejs221_canCleanWhitespace(node) {
    if (node.type !== 'Operator') {
        return false;
    }

    return node.value !== '+' && node.value !== '-';
}

$m['csso/lib/compressor/clean/Space.js#2.2.1'].exports = function cleanWhitespace(node, item, list) {
    var prev = item.prev && item.prev.data;
    var next = item.next && item.next.data;

    if (_cssolibcompressorcleanSpacejs221_canCleanWhitespace(prev) || _cssolibcompressorcleanSpacejs221_canCleanWhitespace(next)) {
        list.remove(item);
    }
};
/*≠≠ node_modules/csso/lib/compressor/clean/Space.js ≠≠*/

/*== node_modules/csso/lib/compressor/clean/index.js ==*/
$m['csso/lib/compressor/clean/index.js#2.2.1'] = { exports: {} };
var _cssolibcompressorcleanindexjs221_walk = $m['csso/lib/utils/walk.js#2.2.1'].exports.all;
var _cssolibcompressorcleanindexjs221_handlers = {
    Space: $m['csso/lib/compressor/clean/Space.js#2.2.1'].exports,
    Atrule: $m['csso/lib/compressor/clean/Atrule.js#2.2.1'].exports,
    Ruleset: $m['csso/lib/compressor/clean/Ruleset.js#2.2.1'].exports,
    Declaration: $m['csso/lib/compressor/clean/Declaration.js#2.2.1'].exports,
    Identifier: $m['csso/lib/compressor/clean/Identifier.js#2.2.1'].exports,
    Comment: $m['csso/lib/compressor/clean/Comment.js#2.2.1'].exports
};

$m['csso/lib/compressor/clean/index.js#2.2.1'].exports = function (ast, usageData) {
    _cssolibcompressorcleanindexjs221_walk(ast, function (node, item, list) {
        if (_cssolibcompressorcleanindexjs221_handlers.hasOwnProperty(node.type)) {
            _cssolibcompressorcleanindexjs221_handlers[node.type].call(this, node, item, list, usageData);
        }
    });
};
/*≠≠ node_modules/csso/lib/compressor/clean/index.js ≠≠*/

/*== node_modules/csso/lib/compressor/usage.js ==*/
$m['csso/lib/compressor/usage.js#2.2.1'] = { exports: {} };
var _cssolibcompressorusagejs221_hasOwnProperty = Object.prototype.hasOwnProperty;

function _cssolibcompressorusagejs221_buildMap(list, caseInsensitive) {
    var map = Object.create(null);

    if (!Array.isArray(list)) {
        return false;
    }

    for (var i = 0; i < list.length; i++) {
        var name = list[i];

        if (caseInsensitive) {
            name = name.toLowerCase();
        }

        map[name] = true;
    }

    return map;
}

function _cssolibcompressorusagejs221_buildIndex(data) {
    var scopes = false;

    if (data.scopes && Array.isArray(data.scopes)) {
        scopes = Object.create(null);

        for (var i = 0; i < data.scopes.length; i++) {
            var list = data.scopes[i];

            if (!list || !Array.isArray(list)) {
                throw new Error('Wrong usage format');
            }

            for (var j = 0; j < list.length; j++) {
                var name = list[j];

                if (_cssolibcompressorusagejs221_hasOwnProperty.call(scopes, name)) {
                    throw new Error('Class can\'t be used for several scopes: ' + name);
                }

                scopes[name] = i + 1;
            }
        }
    }

    return {
        tags: _cssolibcompressorusagejs221_buildMap(data.tags, true),
        ids: _cssolibcompressorusagejs221_buildMap(data.ids),
        classes: _cssolibcompressorusagejs221_buildMap(data.classes),
        scopes: scopes
    };
}

$m['csso/lib/compressor/usage.js#2.2.1'].exports = {
    buildIndex: _cssolibcompressorusagejs221_buildIndex
};
/*≠≠ node_modules/csso/lib/compressor/usage.js ≠≠*/

/*== node_modules/csso/lib/compressor/index.js ==*/
$m['csso/lib/compressor/index.js#2.2.1'] = { exports: {} };
var _cssolibcompressorindexjs221_List = $m['csso/lib/utils/list.js#2.2.1'].exports;
var _cssolibcompressorindexjs221_clone = $m['csso/lib/utils/clone.js#2.2.1'].exports;
var _cssolibcompressorindexjs221_usageUtils = $m['csso/lib/compressor/usage.js#2.2.1'].exports;
var _cssolibcompressorindexjs221_clean = $m['csso/lib/compressor/clean/index.js#2.2.1'].exports;
var _cssolibcompressorindexjs221_compress = $m['csso/lib/compressor/compress/index.js#2.2.1'].exports;
var _cssolibcompressorindexjs221_restructureBlock = $m['csso/lib/compressor/restructure/index.js#2.2.1'].exports;
var _cssolibcompressorindexjs221_walkRules = $m['csso/lib/utils/walk.js#2.2.1'].exports.rules;

function _cssolibcompressorindexjs221_readRulesChunk(rules, specialComments) {
    var buffer = new _cssolibcompressorindexjs221_List();
    var nonSpaceTokenInBuffer = false;
    var protectedComment;

    rules.nextUntil(rules.head, function (node, item, list) {
        if (node.type === 'Comment') {
            if (!specialComments || node.value.charAt(0) !== '!') {
                list.remove(item);
                return;
            }

            if (nonSpaceTokenInBuffer || protectedComment) {
                return true;
            }

            list.remove(item);
            protectedComment = node;
            return;
        }

        if (node.type !== 'Space') {
            nonSpaceTokenInBuffer = true;
        }

        buffer.insert(list.remove(item));
    });

    return {
        comment: protectedComment,
        stylesheet: {
            type: 'StyleSheet',
            info: null,
            rules: buffer
        }
    };
}

function _cssolibcompressorindexjs221_compressChunk(ast, firstAtrulesAllowed, usageData, num, logger) {
    logger('Compress block #' + num, null, true);

    var seed = 1;
    _cssolibcompressorindexjs221_walkRules(ast, function markStylesheets() {
        if ('id' in this.stylesheet === false) {
            this.stylesheet.firstAtrulesAllowed = firstAtrulesAllowed;
            this.stylesheet.id = seed++;
        }
    });
    logger('init', ast);

    // remove redundant
    _cssolibcompressorindexjs221_clean(ast, usageData);
    logger('clean', ast);

    // compress nodes
    _cssolibcompressorindexjs221_compress(ast, usageData);
    logger('compress', ast);

    return ast;
}

function _cssolibcompressorindexjs221_getCommentsOption(options) {
    var comments = 'comments' in options ? options.comments : 'exclamation';

    if (typeof comments === 'boolean') {
        comments = comments ? 'exclamation' : false;
    } else if (comments !== 'exclamation' && comments !== 'first-exclamation') {
        comments = false;
    }

    return comments;
}

function _cssolibcompressorindexjs221_getRestructureOption(options) {
    return 'restructure' in options ? options.restructure : 'restructuring' in options ? options.restructuring : true;
}

function _cssolibcompressorindexjs221_wrapBlock(block) {
    return new _cssolibcompressorindexjs221_List([{
        type: 'Ruleset',
        selector: {
            type: 'Selector',
            selectors: new _cssolibcompressorindexjs221_List([{
                type: 'SimpleSelector',
                sequence: new _cssolibcompressorindexjs221_List([{
                    type: 'Identifier',
                    name: 'x'
                }])
            }])
        },
        block: block
    }]);
}

$m['csso/lib/compressor/index.js#2.2.1'].exports = function compress(ast, options) {
    ast = ast || { type: 'StyleSheet', info: null, rules: new _cssolibcompressorindexjs221_List() };
    options = options || {};

    var logger = typeof options.logger === 'function' ? options.logger : Function();
    var specialComments = _cssolibcompressorindexjs221_getCommentsOption(options);
    var restructuring = _cssolibcompressorindexjs221_getRestructureOption(options);
    var firstAtrulesAllowed = true;
    var usageData = false;
    var inputRules;
    var outputRules = new _cssolibcompressorindexjs221_List();
    var chunk;
    var chunkNum = 1;
    var chunkRules;

    if (options.clone) {
        ast = _cssolibcompressorindexjs221_clone(ast);
    }

    if (ast.type === 'StyleSheet') {
        inputRules = ast.rules;
        ast.rules = outputRules;
    } else {
        inputRules = _cssolibcompressorindexjs221_wrapBlock(ast);
    }

    if (options.usage) {
        usageData = _cssolibcompressorindexjs221_usageUtils.buildIndex(options.usage);
    }

    do {
        chunk = _cssolibcompressorindexjs221_readRulesChunk(inputRules, Boolean(specialComments));

        _cssolibcompressorindexjs221_compressChunk(chunk.stylesheet, firstAtrulesAllowed, usageData, chunkNum++, logger);

        // structure optimisations
        if (restructuring) {
            _cssolibcompressorindexjs221_restructureBlock(chunk.stylesheet, usageData, logger);
        }

        chunkRules = chunk.stylesheet.rules;

        if (chunk.comment) {
            // add \n before comment if there is another content in outputRules
            if (!outputRules.isEmpty()) {
                outputRules.insert(_cssolibcompressorindexjs221_List.createItem({
                    type: 'Raw',
                    value: '\n'
                }));
            }

            outputRules.insert(_cssolibcompressorindexjs221_List.createItem(chunk.comment));

            // add \n after comment if chunk is not empty
            if (!chunkRules.isEmpty()) {
                outputRules.insert(_cssolibcompressorindexjs221_List.createItem({
                    type: 'Raw',
                    value: '\n'
                }));
            }
        }

        if (firstAtrulesAllowed && !chunkRules.isEmpty()) {
            var lastRule = chunkRules.last();

            if (lastRule.type !== 'Atrule' || lastRule.name !== 'import' && lastRule.name !== 'charset') {
                firstAtrulesAllowed = false;
            }
        }

        if (specialComments !== 'exclamation') {
            specialComments = false;
        }

        outputRules.appendList(chunkRules);
    } while (!inputRules.isEmpty());

    return {
        ast: ast
    };
};
/*≠≠ node_modules/csso/lib/compressor/index.js ≠≠*/

/*== node_modules/csso/lib/parser/const.js ==*/
$m['csso/lib/parser/const.js#2.2.1'] = { exports: {} };
$m['csso/lib/parser/const.js#2.2.1'].exports.TokenType = {
    String: 'String',
    Comment: 'Comment',
    Unknown: 'Unknown',
    Newline: 'Newline',
    Space: 'Space',
    Tab: 'Tab',
    ExclamationMark: 'ExclamationMark', // !
    QuotationMark: 'QuotationMark', // "
    NumberSign: 'NumberSign', // #
    DollarSign: 'DollarSign', // $
    PercentSign: 'PercentSign', // %
    Ampersand: 'Ampersand', // &
    Apostrophe: 'Apostrophe', // '
    LeftParenthesis: 'LeftParenthesis', // (
    RightParenthesis: 'RightParenthesis', // )
    Asterisk: 'Asterisk', // *
    PlusSign: 'PlusSign', // +
    Comma: 'Comma', // ,
    HyphenMinus: 'HyphenMinus', // -
    FullStop: 'FullStop', // .
    Solidus: 'Solidus', // /
    Colon: 'Colon', // :
    Semicolon: 'Semicolon', // ;
    LessThanSign: 'LessThanSign', // <
    EqualsSign: 'EqualsSign', // =
    GreaterThanSign: 'GreaterThanSign', // >
    QuestionMark: 'QuestionMark', // ?
    CommercialAt: 'CommercialAt', // @
    LeftSquareBracket: 'LeftSquareBracket', // [
    ReverseSolidus: 'ReverseSolidus', // \
    RightSquareBracket: 'RightSquareBracket', // ]
    CircumflexAccent: 'CircumflexAccent', // ^
    LowLine: 'LowLine', // _
    LeftCurlyBracket: 'LeftCurlyBracket', // {
    VerticalLine: 'VerticalLine', // |
    RightCurlyBracket: 'RightCurlyBracket', // }
    Tilde: 'Tilde', // ~
    Identifier: 'Identifier',
    DecimalNumber: 'DecimalNumber'
};

// var i = 1;
// for (var key in exports.TokenType) {
//     exports.TokenType[key] = i++;
// }
/*≠≠ node_modules/csso/lib/parser/const.js ≠≠*/

/*== node_modules/csso/lib/parser/scanner.js ==*/
$m['csso/lib/parser/scanner.js#2.2.1'] = { exports: {} };
'use strict';

var _cssolibparserscannerjs221_TokenType = $m['csso/lib/parser/const.js#2.2.1'].exports.TokenType;

var _cssolibparserscannerjs221_TAB = 9;
var _cssolibparserscannerjs221_N = 10;
var _cssolibparserscannerjs221_F = 12;
var _cssolibparserscannerjs221_R = 13;
var _cssolibparserscannerjs221_SPACE = 32;
var _cssolibparserscannerjs221_DOUBLE_QUOTE = 34;
var _cssolibparserscannerjs221_QUOTE = 39;
var _cssolibparserscannerjs221_RIGHT_PARENTHESIS = 41;
var _cssolibparserscannerjs221_STAR = 42;
var _cssolibparserscannerjs221_SLASH = 47;
var _cssolibparserscannerjs221_BACK_SLASH = 92;
var _cssolibparserscannerjs221_UNDERSCORE = 95;
var _cssolibparserscannerjs221_LEFT_CURLY_BRACE = 123;
var _cssolibparserscannerjs221_RIGHT_CURLY_BRACE = 125;

var _cssolibparserscannerjs221_WHITESPACE = 1;
var _cssolibparserscannerjs221_PUNCTUATOR = 2;
var _cssolibparserscannerjs221_DIGIT = 3;
var _cssolibparserscannerjs221_STRING = 4;

var _cssolibparserscannerjs221_PUNCTUATION = {
    9: _cssolibparserscannerjs221_TokenType.Tab, // '\t'
    10: _cssolibparserscannerjs221_TokenType.Newline, // '\n'
    13: _cssolibparserscannerjs221_TokenType.Newline, // '\r'
    32: _cssolibparserscannerjs221_TokenType.Space, // ' '
    33: _cssolibparserscannerjs221_TokenType.ExclamationMark, // '!'
    34: _cssolibparserscannerjs221_TokenType.QuotationMark, // '"'
    35: _cssolibparserscannerjs221_TokenType.NumberSign, // '#'
    36: _cssolibparserscannerjs221_TokenType.DollarSign, // '$'
    37: _cssolibparserscannerjs221_TokenType.PercentSign, // '%'
    38: _cssolibparserscannerjs221_TokenType.Ampersand, // '&'
    39: _cssolibparserscannerjs221_TokenType.Apostrophe, // '\''
    40: _cssolibparserscannerjs221_TokenType.LeftParenthesis, // '('
    41: _cssolibparserscannerjs221_TokenType.RightParenthesis, // ')'
    42: _cssolibparserscannerjs221_TokenType.Asterisk, // '*'
    43: _cssolibparserscannerjs221_TokenType.PlusSign, // '+'
    44: _cssolibparserscannerjs221_TokenType.Comma, // ','
    45: _cssolibparserscannerjs221_TokenType.HyphenMinus, // '-'
    46: _cssolibparserscannerjs221_TokenType.FullStop, // '.'
    47: _cssolibparserscannerjs221_TokenType.Solidus, // '/'
    58: _cssolibparserscannerjs221_TokenType.Colon, // ':'
    59: _cssolibparserscannerjs221_TokenType.Semicolon, // ';'
    60: _cssolibparserscannerjs221_TokenType.LessThanSign, // '<'
    61: _cssolibparserscannerjs221_TokenType.EqualsSign, // '='
    62: _cssolibparserscannerjs221_TokenType.GreaterThanSign, // '>'
    63: _cssolibparserscannerjs221_TokenType.QuestionMark, // '?'
    64: _cssolibparserscannerjs221_TokenType.CommercialAt, // '@'
    91: _cssolibparserscannerjs221_TokenType.LeftSquareBracket, // '['
    93: _cssolibparserscannerjs221_TokenType.RightSquareBracket, // ']'
    94: _cssolibparserscannerjs221_TokenType.CircumflexAccent, // '^'
    95: _cssolibparserscannerjs221_TokenType.LowLine, // '_'
    123: _cssolibparserscannerjs221_TokenType.LeftCurlyBracket, // '{'
    124: _cssolibparserscannerjs221_TokenType.VerticalLine, // '|'
    125: _cssolibparserscannerjs221_TokenType.RightCurlyBracket, // '}'
    126: _cssolibparserscannerjs221_TokenType.Tilde // '~'
};
var _cssolibparserscannerjs221_SYMBOL_CATEGORY_LENGTH = Math.max.apply(null, Object.keys(_cssolibparserscannerjs221_PUNCTUATION)) + 1;
var _cssolibparserscannerjs221_SYMBOL_CATEGORY = new Uint32Array(_cssolibparserscannerjs221_SYMBOL_CATEGORY_LENGTH);
var _cssolibparserscannerjs221_IS_PUNCTUATOR = new Uint32Array(_cssolibparserscannerjs221_SYMBOL_CATEGORY_LENGTH);

// fill categories
Object.keys(_cssolibparserscannerjs221_PUNCTUATION).forEach(function (key) {
    _cssolibparserscannerjs221_SYMBOL_CATEGORY[Number(key)] = _cssolibparserscannerjs221_PUNCTUATOR;
    _cssolibparserscannerjs221_IS_PUNCTUATOR[Number(key)] = _cssolibparserscannerjs221_PUNCTUATOR;
}, _cssolibparserscannerjs221_SYMBOL_CATEGORY);

// don't treat as punctuator
_cssolibparserscannerjs221_IS_PUNCTUATOR[_cssolibparserscannerjs221_UNDERSCORE] = 0;

for (var _cssolibparserscannerjs221_i = 48; _cssolibparserscannerjs221_i <= 57; _cssolibparserscannerjs221_i++) {
    _cssolibparserscannerjs221_SYMBOL_CATEGORY[_cssolibparserscannerjs221_i] = _cssolibparserscannerjs221_DIGIT;
}

_cssolibparserscannerjs221_SYMBOL_CATEGORY[_cssolibparserscannerjs221_SPACE] = _cssolibparserscannerjs221_WHITESPACE;
_cssolibparserscannerjs221_SYMBOL_CATEGORY[_cssolibparserscannerjs221_TAB] = _cssolibparserscannerjs221_WHITESPACE;
_cssolibparserscannerjs221_SYMBOL_CATEGORY[_cssolibparserscannerjs221_N] = _cssolibparserscannerjs221_WHITESPACE;
_cssolibparserscannerjs221_SYMBOL_CATEGORY[_cssolibparserscannerjs221_R] = _cssolibparserscannerjs221_WHITESPACE;
_cssolibparserscannerjs221_SYMBOL_CATEGORY[_cssolibparserscannerjs221_F] = _cssolibparserscannerjs221_WHITESPACE;

_cssolibparserscannerjs221_SYMBOL_CATEGORY[_cssolibparserscannerjs221_QUOTE] = _cssolibparserscannerjs221_STRING;
_cssolibparserscannerjs221_SYMBOL_CATEGORY[_cssolibparserscannerjs221_DOUBLE_QUOTE] = _cssolibparserscannerjs221_STRING;

//
// scanner
//

var _cssolibparserscannerjs221_Scanner = function (source, initBlockMode, initLine, initColumn) {
    this.source = source;

    this.pos = source.charCodeAt(0) === 0xFEFF ? 1 : 0;
    this.eof = this.pos === this.source.length;
    this.line = typeof initLine === 'undefined' ? 1 : initLine;
    this.lineStartPos = typeof initColumn === 'undefined' ? -1 : -initColumn;

    this.minBlockMode = initBlockMode ? 1 : 0;
    this.blockMode = this.minBlockMode;
    this.urlMode = false;

    this.prevToken = null;
    this.token = null;
    this.buffer = [];
};

_cssolibparserscannerjs221_Scanner.prototype = {
    lookup: function (offset) {
        if (offset === 0) {
            return this.token;
        }

        for (var i = this.buffer.length; !this.eof && i < offset; i++) {
            this.buffer.push(this.getToken());
        }

        return offset <= this.buffer.length ? this.buffer[offset - 1] : null;
    },
    lookupType: function (offset, type) {
        var token = this.lookup(offset);

        return token !== null && token.type === type;
    },
    next: function () {
        var newToken = null;

        if (this.buffer.length !== 0) {
            newToken = this.buffer.shift();
        } else if (!this.eof) {
            newToken = this.getToken();
        }

        this.prevToken = this.token;
        this.token = newToken;

        return newToken;
    },

    tokenize: function () {
        var tokens = [];

        for (; this.pos < this.source.length; this.pos++) {
            tokens.push(this.getToken());
        }

        return tokens;
    },

    getToken: function () {
        var code = this.source.charCodeAt(this.pos);
        var line = this.line;
        var column = this.pos - this.lineStartPos;
        var offset = this.pos;
        var next;
        var type;
        var value;

        switch (code < _cssolibparserscannerjs221_SYMBOL_CATEGORY_LENGTH ? _cssolibparserscannerjs221_SYMBOL_CATEGORY[code] : 0) {
            case _cssolibparserscannerjs221_DIGIT:
                type = _cssolibparserscannerjs221_TokenType.DecimalNumber;
                value = this.readDecimalNumber();
                break;

            case _cssolibparserscannerjs221_STRING:
                type = _cssolibparserscannerjs221_TokenType.String;
                value = this.readString(code);
                break;

            case _cssolibparserscannerjs221_WHITESPACE:
                type = _cssolibparserscannerjs221_TokenType.Space;
                value = this.readSpaces();
                break;

            case _cssolibparserscannerjs221_PUNCTUATOR:
                if (code === _cssolibparserscannerjs221_SLASH) {
                    next = this.pos + 1 < this.source.length ? this.source.charCodeAt(this.pos + 1) : 0;

                    if (next === _cssolibparserscannerjs221_STAR) {
                        // /*
                        type = _cssolibparserscannerjs221_TokenType.Comment;
                        value = this.readComment();
                        break;
                    } else if (next === _cssolibparserscannerjs221_SLASH && !this.urlMode) {
                        // //
                        if (this.blockMode > 0) {
                            var skip = 2;

                            while (this.source.charCodeAt(this.pos + 2) === _cssolibparserscannerjs221_SLASH) {
                                skip++;
                            }

                            type = _cssolibparserscannerjs221_TokenType.Identifier;
                            value = this.readIdentifier(skip);

                            this.urlMode = this.urlMode || value === 'url';
                        } else {
                            type = _cssolibparserscannerjs221_TokenType.Unknown;
                            value = this.readUnknown();
                        }
                        break;
                    }
                }

                type = _cssolibparserscannerjs221_PUNCTUATION[code];
                value = String.fromCharCode(code);
                this.pos++;

                if (code === _cssolibparserscannerjs221_RIGHT_PARENTHESIS) {
                    this.urlMode = false;
                } else if (code === _cssolibparserscannerjs221_LEFT_CURLY_BRACE) {
                    this.blockMode++;
                } else if (code === _cssolibparserscannerjs221_RIGHT_CURLY_BRACE) {
                    if (this.blockMode > this.minBlockMode) {
                        this.blockMode--;
                    }
                }

                break;

            default:
                type = _cssolibparserscannerjs221_TokenType.Identifier;
                value = this.readIdentifier(0);

                this.urlMode = this.urlMode || value === 'url';
        }

        this.eof = this.pos === this.source.length;

        return {
            type: type,
            value: value,

            offset: offset,
            line: line,
            column: column
        };
    },

    isNewline: function (code) {
        if (code === _cssolibparserscannerjs221_N || code === _cssolibparserscannerjs221_F || code === _cssolibparserscannerjs221_R) {
            if (code === _cssolibparserscannerjs221_R && this.pos + 1 < this.source.length && this.source.charCodeAt(this.pos + 1) === _cssolibparserscannerjs221_N) {
                this.pos++;
            }

            this.line++;
            this.lineStartPos = this.pos;
            return true;
        }

        return false;
    },

    readSpaces: function () {
        var start = this.pos;

        for (; this.pos < this.source.length; this.pos++) {
            var code = this.source.charCodeAt(this.pos);

            if (!this.isNewline(code) && code !== _cssolibparserscannerjs221_SPACE && code !== _cssolibparserscannerjs221_TAB) {
                break;
            }
        }

        return this.source.substring(start, this.pos);
    },

    readComment: function () {
        var start = this.pos;

        for (this.pos += 2; this.pos < this.source.length; this.pos++) {
            var code = this.source.charCodeAt(this.pos);

            if (code === _cssolibparserscannerjs221_STAR) {
                // */
                if (this.source.charCodeAt(this.pos + 1) === _cssolibparserscannerjs221_SLASH) {
                    this.pos += 2;
                    break;
                }
            } else {
                this.isNewline(code);
            }
        }

        return this.source.substring(start, this.pos);
    },

    readUnknown: function () {
        var start = this.pos;

        for (this.pos += 2; this.pos < this.source.length; this.pos++) {
            if (this.isNewline(this.source.charCodeAt(this.pos), this.source)) {
                break;
            }
        }

        return this.source.substring(start, this.pos);
    },

    readString: function (quote) {
        var start = this.pos;
        var res = '';

        for (this.pos++; this.pos < this.source.length; this.pos++) {
            var code = this.source.charCodeAt(this.pos);

            if (code === _cssolibparserscannerjs221_BACK_SLASH) {
                var end = this.pos++;

                if (this.isNewline(this.source.charCodeAt(this.pos), this.source)) {
                    res += this.source.substring(start, end);
                    start = this.pos + 1;
                }
            } else if (code === quote) {
                this.pos++;
                break;
            }
        }

        return res + this.source.substring(start, this.pos);
    },

    readDecimalNumber: function () {
        var start = this.pos;
        var code;

        for (this.pos++; this.pos < this.source.length; this.pos++) {
            code = this.source.charCodeAt(this.pos);

            if (code < 48 || code > 57) {
                // 0 .. 9
                break;
            }
        }

        return this.source.substring(start, this.pos);
    },

    readIdentifier: function (skip) {
        var start = this.pos;

        for (this.pos += skip; this.pos < this.source.length; this.pos++) {
            var code = this.source.charCodeAt(this.pos);

            if (code === _cssolibparserscannerjs221_BACK_SLASH) {
                this.pos++;

                // skip escaped unicode sequence that can ends with space
                // [0-9a-f]{1,6}(\r\n|[ \n\r\t\f])?
                for (var i = 0; i < 7 && this.pos + i < this.source.length; i++) {
                    code = this.source.charCodeAt(this.pos + i);

                    if (i !== 6) {
                        if (code >= 48 && code <= 57 || // 0 .. 9
                        code >= 65 && code <= 70 || // A .. F
                        code >= 97 && code <= 102) {
                            // a .. f
                            continue;
                        }
                    }

                    if (i > 0) {
                        this.pos += i - 1;
                        if (code === _cssolibparserscannerjs221_SPACE || code === _cssolibparserscannerjs221_TAB || this.isNewline(code)) {
                            this.pos++;
                        }
                    }

                    break;
                }
            } else if (code < _cssolibparserscannerjs221_SYMBOL_CATEGORY_LENGTH && _cssolibparserscannerjs221_IS_PUNCTUATOR[code] === _cssolibparserscannerjs221_PUNCTUATOR) {
                break;
            }
        }

        return this.source.substring(start, this.pos);
    }
};

// warm up tokenizer to elimitate code branches that never execute
// fix soft deoptimizations (insufficient type feedback)
new _cssolibparserscannerjs221_Scanner('\n\r\r\n\f//""\'\'/**/1a;.{url(a)}').lookup(1e3);

$m['csso/lib/parser/scanner.js#2.2.1'].exports = _cssolibparserscannerjs221_Scanner;
/*≠≠ node_modules/csso/lib/parser/scanner.js ≠≠*/

/*== node_modules/csso/lib/parser/index.js ==*/
$m['csso/lib/parser/index.js#2.2.1'] = { exports: {} };
'use strict';

var _cssolibparserindexjs221_TokenType = $m['csso/lib/parser/const.js#2.2.1'].exports.TokenType;
var _cssolibparserindexjs221_Scanner = $m['csso/lib/parser/scanner.js#2.2.1'].exports;
var _cssolibparserindexjs221_List = $m['csso/lib/utils/list.js#2.2.1'].exports;
var _cssolibparserindexjs221_needPositions;
var _cssolibparserindexjs221_filename;
var _cssolibparserindexjs221_scanner;

var _cssolibparserindexjs221_SCOPE_ATRULE_EXPRESSION = 1;
var _cssolibparserindexjs221_SCOPE_SELECTOR = 2;
var _cssolibparserindexjs221_SCOPE_VALUE = 3;

var _cssolibparserindexjs221_specialFunctions = {};
_cssolibparserindexjs221_specialFunctions[_cssolibparserindexjs221_SCOPE_ATRULE_EXPRESSION] = {
    url: _cssolibparserindexjs221_getUri
};
_cssolibparserindexjs221_specialFunctions[_cssolibparserindexjs221_SCOPE_SELECTOR] = {
    url: _cssolibparserindexjs221_getUri,
    not: _cssolibparserindexjs221_getNotFunction
};
_cssolibparserindexjs221_specialFunctions[_cssolibparserindexjs221_SCOPE_VALUE] = {
    url: _cssolibparserindexjs221_getUri,
    expression: _cssolibparserindexjs221_getOldIEExpression,
    var: _cssolibparserindexjs221_getVarFunction
};

var _cssolibparserindexjs221_initialContext = {
    stylesheet: _cssolibparserindexjs221_getStylesheet,
    atrule: _cssolibparserindexjs221_getAtrule,
    atruleExpression: _cssolibparserindexjs221_getAtruleExpression,
    ruleset: _cssolibparserindexjs221_getRuleset,
    selector: _cssolibparserindexjs221_getSelector,
    simpleSelector: _cssolibparserindexjs221_getSimpleSelector,
    block: _cssolibparserindexjs221_getBlock,
    declaration: _cssolibparserindexjs221_getDeclaration,
    value: _cssolibparserindexjs221_getValue
};

var _cssolibparserindexjs221_blockMode = {
    'declaration': true,
    'property': true
};

function _cssolibparserindexjs221_parseError(message) {
    var error = new Error(message);
    var offset = 0;
    var line = 1;
    var column = 1;
    var lines;

    if (_cssolibparserindexjs221_scanner.token !== null) {
        offset = _cssolibparserindexjs221_scanner.token.offset;
        line = _cssolibparserindexjs221_scanner.token.line;
        column = _cssolibparserindexjs221_scanner.token.column;
    } else if (_cssolibparserindexjs221_scanner.prevToken !== null) {
        lines = _cssolibparserindexjs221_scanner.prevToken.value.trimRight();
        offset = _cssolibparserindexjs221_scanner.prevToken.offset + lines.length;
        lines = lines.split(/\n|\r\n?|\f/);
        line = _cssolibparserindexjs221_scanner.prevToken.line + lines.length - 1;
        column = lines.length > 1 ? lines[lines.length - 1].length + 1 : _cssolibparserindexjs221_scanner.prevToken.column + lines[lines.length - 1].length;
    }

    error.name = 'CssSyntaxError';
    error.parseError = {
        offset: offset,
        line: line,
        column: column
    };

    throw error;
}

function _cssolibparserindexjs221_eat(tokenType) {
    if (_cssolibparserindexjs221_scanner.token !== null && _cssolibparserindexjs221_scanner.token.type === tokenType) {
        _cssolibparserindexjs221_scanner.next();
        return true;
    }

    _cssolibparserindexjs221_parseError(tokenType + ' is expected');
}

function _cssolibparserindexjs221_expectIdentifier(name, eat) {
    if (_cssolibparserindexjs221_scanner.token !== null) {
        if (_cssolibparserindexjs221_scanner.token.type === _cssolibparserindexjs221_TokenType.Identifier && _cssolibparserindexjs221_scanner.token.value.toLowerCase() === name) {
            if (eat) {
                _cssolibparserindexjs221_scanner.next();
            }

            return true;
        }
    }

    _cssolibparserindexjs221_parseError('Identifier `' + name + '` is expected');
}

function _cssolibparserindexjs221_expectAny(what) {
    if (_cssolibparserindexjs221_scanner.token !== null) {
        for (var i = 1, type = _cssolibparserindexjs221_scanner.token.type; i < arguments.length; i++) {
            if (type === arguments[i]) {
                return true;
            }
        }
    }

    _cssolibparserindexjs221_parseError(what + ' is expected');
}

function _cssolibparserindexjs221_getInfo() {
    if (_cssolibparserindexjs221_needPositions && _cssolibparserindexjs221_scanner.token) {
        return {
            source: _cssolibparserindexjs221_filename,
            offset: _cssolibparserindexjs221_scanner.token.offset,
            line: _cssolibparserindexjs221_scanner.token.line,
            column: _cssolibparserindexjs221_scanner.token.column
        };
    }

    return null;
}

function _cssolibparserindexjs221_removeTrailingSpaces(list) {
    while (list.tail) {
        if (list.tail.data.type === 'Space') {
            list.remove(list.tail);
        } else {
            break;
        }
    }
}

function _cssolibparserindexjs221_getStylesheet(nested) {
    var child = null;
    var node = {
        type: 'StyleSheet',
        info: _cssolibparserindexjs221_getInfo(),
        rules: new _cssolibparserindexjs221_List()
    };

    scan: while (_cssolibparserindexjs221_scanner.token !== null) {
        switch (_cssolibparserindexjs221_scanner.token.type) {
            case _cssolibparserindexjs221_TokenType.Space:
                _cssolibparserindexjs221_scanner.next();
                child = null;
                break;

            case _cssolibparserindexjs221_TokenType.Comment:
                // ignore comments except exclamation comments on top level
                if (nested || _cssolibparserindexjs221_scanner.token.value.charAt(2) !== '!') {
                    _cssolibparserindexjs221_scanner.next();
                    child = null;
                } else {
                    child = _cssolibparserindexjs221_getComment();
                }
                break;

            case _cssolibparserindexjs221_TokenType.Unknown:
                child = _cssolibparserindexjs221_getUnknown();
                break;

            case _cssolibparserindexjs221_TokenType.CommercialAt:
                child = _cssolibparserindexjs221_getAtrule();
                break;

            case _cssolibparserindexjs221_TokenType.RightCurlyBracket:
                if (!nested) {
                    _cssolibparserindexjs221_parseError('Unexpected right curly brace');
                }

                break scan;

            default:
                child = _cssolibparserindexjs221_getRuleset();
        }

        if (child !== null) {
            node.rules.insert(_cssolibparserindexjs221_List.createItem(child));
        }
    }

    return node;
}

// '//' ...
// TODO: remove it as wrong thing
function _cssolibparserindexjs221_getUnknown() {
    var info = _cssolibparserindexjs221_getInfo();
    var value = _cssolibparserindexjs221_scanner.token.value;

    _cssolibparserindexjs221_eat(_cssolibparserindexjs221_TokenType.Unknown);

    return {
        type: 'Unknown',
        info: info,
        value: value
    };
}

function _cssolibparserindexjs221_isBlockAtrule() {
    for (var offset = 1, cursor; cursor = _cssolibparserindexjs221_scanner.lookup(offset); offset++) {
        var type = cursor.type;

        if (type === _cssolibparserindexjs221_TokenType.RightCurlyBracket) {
            return true;
        }

        if (type === _cssolibparserindexjs221_TokenType.LeftCurlyBracket || type === _cssolibparserindexjs221_TokenType.CommercialAt) {
            return false;
        }
    }

    return true;
}

function _cssolibparserindexjs221_getAtruleExpression() {
    var child = null;
    var node = {
        type: 'AtruleExpression',
        info: _cssolibparserindexjs221_getInfo(),
        sequence: new _cssolibparserindexjs221_List()
    };

    scan: while (_cssolibparserindexjs221_scanner.token !== null) {
        switch (_cssolibparserindexjs221_scanner.token.type) {
            case _cssolibparserindexjs221_TokenType.Semicolon:
                break scan;

            case _cssolibparserindexjs221_TokenType.LeftCurlyBracket:
                break scan;

            case _cssolibparserindexjs221_TokenType.Space:
                if (node.sequence.isEmpty()) {
                    _cssolibparserindexjs221_scanner.next(); // ignore spaces in beginning
                    child = null;
                } else {
                    child = _cssolibparserindexjs221_getS();
                }
                break;

            case _cssolibparserindexjs221_TokenType.Comment:
                // ignore comments
                _cssolibparserindexjs221_scanner.next();
                child = null;
                break;

            case _cssolibparserindexjs221_TokenType.Comma:
                child = _cssolibparserindexjs221_getOperator();
                break;

            case _cssolibparserindexjs221_TokenType.Colon:
                child = _cssolibparserindexjs221_getPseudo();
                break;

            case _cssolibparserindexjs221_TokenType.LeftParenthesis:
                child = _cssolibparserindexjs221_getBraces(_cssolibparserindexjs221_SCOPE_ATRULE_EXPRESSION);
                break;

            default:
                child = _cssolibparserindexjs221_getAny(_cssolibparserindexjs221_SCOPE_ATRULE_EXPRESSION);
        }

        if (child !== null) {
            node.sequence.insert(_cssolibparserindexjs221_List.createItem(child));
        }
    }

    _cssolibparserindexjs221_removeTrailingSpaces(node.sequence);

    return node;
}

function _cssolibparserindexjs221_getAtrule() {
    _cssolibparserindexjs221_eat(_cssolibparserindexjs221_TokenType.CommercialAt);

    var node = {
        type: 'Atrule',
        info: _cssolibparserindexjs221_getInfo(),
        name: _cssolibparserindexjs221_readIdent(false),
        expression: _cssolibparserindexjs221_getAtruleExpression(),
        block: null
    };

    if (_cssolibparserindexjs221_scanner.token !== null) {
        switch (_cssolibparserindexjs221_scanner.token.type) {
            case _cssolibparserindexjs221_TokenType.Semicolon:
                _cssolibparserindexjs221_scanner.next(); // {
                break;

            case _cssolibparserindexjs221_TokenType.LeftCurlyBracket:
                _cssolibparserindexjs221_scanner.next(); // {

                if (_cssolibparserindexjs221_isBlockAtrule()) {
                    node.block = _cssolibparserindexjs221_getBlock();
                } else {
                    node.block = _cssolibparserindexjs221_getStylesheet(true);
                }

                _cssolibparserindexjs221_eat(_cssolibparserindexjs221_TokenType.RightCurlyBracket);
                break;

            default:
                _cssolibparserindexjs221_parseError('Unexpected input');
        }
    }

    return node;
}

function _cssolibparserindexjs221_getRuleset() {
    return {
        type: 'Ruleset',
        info: _cssolibparserindexjs221_getInfo(),
        selector: _cssolibparserindexjs221_getSelector(),
        block: _cssolibparserindexjs221_getBlockWithBrackets()
    };
}

function _cssolibparserindexjs221_getSelector() {
    var isBadSelector = false;
    var lastComma = true;
    var node = {
        type: 'Selector',
        info: _cssolibparserindexjs221_getInfo(),
        selectors: new _cssolibparserindexjs221_List()
    };

    scan: while (_cssolibparserindexjs221_scanner.token !== null) {
        switch (_cssolibparserindexjs221_scanner.token.type) {
            case _cssolibparserindexjs221_TokenType.LeftCurlyBracket:
                break scan;

            case _cssolibparserindexjs221_TokenType.Comma:
                if (lastComma) {
                    isBadSelector = true;
                }

                lastComma = true;
                _cssolibparserindexjs221_scanner.next();
                break;

            default:
                if (!lastComma) {
                    isBadSelector = true;
                }

                lastComma = false;
                node.selectors.insert(_cssolibparserindexjs221_List.createItem(_cssolibparserindexjs221_getSimpleSelector()));

                if (node.selectors.tail.data.sequence.isEmpty()) {
                    isBadSelector = true;
                }
        }
    }

    if (lastComma) {
        isBadSelector = true;
        // parseError('Unexpected trailing comma');
    }

    if (isBadSelector) {
        node.selectors = new _cssolibparserindexjs221_List();
    }

    return node;
}

function _cssolibparserindexjs221_getSimpleSelector(nested) {
    var child = null;
    var combinator = null;
    var node = {
        type: 'SimpleSelector',
        info: _cssolibparserindexjs221_getInfo(),
        sequence: new _cssolibparserindexjs221_List()
    };

    scan: while (_cssolibparserindexjs221_scanner.token !== null) {
        switch (_cssolibparserindexjs221_scanner.token.type) {
            case _cssolibparserindexjs221_TokenType.Comma:
                break scan;

            case _cssolibparserindexjs221_TokenType.LeftCurlyBracket:
                if (nested) {
                    _cssolibparserindexjs221_parseError('Unexpected input');
                }

                break scan;

            case _cssolibparserindexjs221_TokenType.RightParenthesis:
                if (!nested) {
                    _cssolibparserindexjs221_parseError('Unexpected input');
                }

                break scan;

            case _cssolibparserindexjs221_TokenType.Comment:
                _cssolibparserindexjs221_scanner.next();
                child = null;
                break;

            case _cssolibparserindexjs221_TokenType.Space:
                child = null;
                if (!combinator && node.sequence.head) {
                    combinator = _cssolibparserindexjs221_getCombinator();
                } else {
                    _cssolibparserindexjs221_scanner.next();
                }
                break;

            case _cssolibparserindexjs221_TokenType.PlusSign:
            case _cssolibparserindexjs221_TokenType.GreaterThanSign:
            case _cssolibparserindexjs221_TokenType.Tilde:
            case _cssolibparserindexjs221_TokenType.Solidus:
                if (combinator && combinator.name !== ' ') {
                    _cssolibparserindexjs221_parseError('Unexpected combinator');
                }

                child = null;
                combinator = _cssolibparserindexjs221_getCombinator();
                break;

            case _cssolibparserindexjs221_TokenType.FullStop:
                child = _cssolibparserindexjs221_getClass();
                break;

            case _cssolibparserindexjs221_TokenType.LeftSquareBracket:
                child = _cssolibparserindexjs221_getAttribute();
                break;

            case _cssolibparserindexjs221_TokenType.NumberSign:
                child = _cssolibparserindexjs221_getShash();
                break;

            case _cssolibparserindexjs221_TokenType.Colon:
                child = _cssolibparserindexjs221_getPseudo();
                break;

            case _cssolibparserindexjs221_TokenType.LowLine:
            case _cssolibparserindexjs221_TokenType.Identifier:
            case _cssolibparserindexjs221_TokenType.Asterisk:
                child = _cssolibparserindexjs221_getNamespacedIdentifier(false);
                break;

            case _cssolibparserindexjs221_TokenType.HyphenMinus:
            case _cssolibparserindexjs221_TokenType.DecimalNumber:
                child = _cssolibparserindexjs221_tryGetPercentage() || _cssolibparserindexjs221_getNamespacedIdentifier(false);
                break;

            default:
                _cssolibparserindexjs221_parseError('Unexpected input');
        }

        if (child !== null) {
            if (combinator !== null) {
                node.sequence.insert(_cssolibparserindexjs221_List.createItem(combinator));
                combinator = null;
            }

            node.sequence.insert(_cssolibparserindexjs221_List.createItem(child));
        }
    }

    if (combinator && combinator.name !== ' ') {
        _cssolibparserindexjs221_parseError('Unexpected combinator');
    }

    return node;
}

function _cssolibparserindexjs221_getDeclarations() {
    var child = null;
    var declarations = new _cssolibparserindexjs221_List();

    scan: while (_cssolibparserindexjs221_scanner.token !== null) {
        switch (_cssolibparserindexjs221_scanner.token.type) {
            case _cssolibparserindexjs221_TokenType.RightCurlyBracket:
                break scan;

            case _cssolibparserindexjs221_TokenType.Space:
            case _cssolibparserindexjs221_TokenType.Comment:
                _cssolibparserindexjs221_scanner.next();
                child = null;
                break;

            case _cssolibparserindexjs221_TokenType.Semicolon:
                // ;
                _cssolibparserindexjs221_scanner.next();
                child = null;
                break;

            default:
                child = _cssolibparserindexjs221_getDeclaration();
        }

        if (child !== null) {
            declarations.insert(_cssolibparserindexjs221_List.createItem(child));
        }
    }

    return declarations;
}

function _cssolibparserindexjs221_getBlockWithBrackets() {
    var info = _cssolibparserindexjs221_getInfo();
    var node;

    _cssolibparserindexjs221_eat(_cssolibparserindexjs221_TokenType.LeftCurlyBracket);
    node = {
        type: 'Block',
        info: info,
        declarations: _cssolibparserindexjs221_getDeclarations()
    };
    _cssolibparserindexjs221_eat(_cssolibparserindexjs221_TokenType.RightCurlyBracket);

    return node;
}

function _cssolibparserindexjs221_getBlock() {
    return {
        type: 'Block',
        info: _cssolibparserindexjs221_getInfo(),
        declarations: _cssolibparserindexjs221_getDeclarations()
    };
}

function _cssolibparserindexjs221_getDeclaration(nested) {
    var info = _cssolibparserindexjs221_getInfo();
    var property = _cssolibparserindexjs221_getProperty();
    var value;

    _cssolibparserindexjs221_eat(_cssolibparserindexjs221_TokenType.Colon);

    // check it's a filter
    if (/filter$/.test(property.name.toLowerCase()) && _cssolibparserindexjs221_checkProgid()) {
        value = _cssolibparserindexjs221_getFilterValue();
    } else {
        value = _cssolibparserindexjs221_getValue(nested);
    }

    return {
        type: 'Declaration',
        info: info,
        property: property,
        value: value
    };
}

function _cssolibparserindexjs221_getProperty() {
    var name = '';
    var node = {
        type: 'Property',
        info: _cssolibparserindexjs221_getInfo(),
        name: null
    };

    for (; _cssolibparserindexjs221_scanner.token !== null; _cssolibparserindexjs221_scanner.next()) {
        var type = _cssolibparserindexjs221_scanner.token.type;

        if (type !== _cssolibparserindexjs221_TokenType.Solidus && type !== _cssolibparserindexjs221_TokenType.Asterisk && type !== _cssolibparserindexjs221_TokenType.DollarSign) {
            break;
        }

        name += _cssolibparserindexjs221_scanner.token.value;
    }

    node.name = name + _cssolibparserindexjs221_readIdent(true);

    _cssolibparserindexjs221_readSC();

    return node;
}

function _cssolibparserindexjs221_getValue(nested) {
    var child = null;
    var node = {
        type: 'Value',
        info: _cssolibparserindexjs221_getInfo(),
        important: false,
        sequence: new _cssolibparserindexjs221_List()
    };

    _cssolibparserindexjs221_readSC();

    scan: while (_cssolibparserindexjs221_scanner.token !== null) {
        switch (_cssolibparserindexjs221_scanner.token.type) {
            case _cssolibparserindexjs221_TokenType.RightCurlyBracket:
            case _cssolibparserindexjs221_TokenType.Semicolon:
                break scan;

            case _cssolibparserindexjs221_TokenType.RightParenthesis:
                if (!nested) {
                    _cssolibparserindexjs221_parseError('Unexpected input');
                }
                break scan;

            case _cssolibparserindexjs221_TokenType.Space:
                child = _cssolibparserindexjs221_getS();
                break;

            case _cssolibparserindexjs221_TokenType.Comment:
                // ignore comments
                _cssolibparserindexjs221_scanner.next();
                child = null;
                break;

            case _cssolibparserindexjs221_TokenType.NumberSign:
                child = _cssolibparserindexjs221_getVhash();
                break;

            case _cssolibparserindexjs221_TokenType.Solidus:
            case _cssolibparserindexjs221_TokenType.Comma:
                child = _cssolibparserindexjs221_getOperator();
                break;

            case _cssolibparserindexjs221_TokenType.LeftParenthesis:
            case _cssolibparserindexjs221_TokenType.LeftSquareBracket:
                child = _cssolibparserindexjs221_getBraces(_cssolibparserindexjs221_SCOPE_VALUE);
                break;

            case _cssolibparserindexjs221_TokenType.ExclamationMark:
                node.important = _cssolibparserindexjs221_getImportant();
                child = null;
                break;

            default:
                // check for unicode range: U+0F00, U+0F00-0FFF, u+0F00??
                if (_cssolibparserindexjs221_scanner.token.type === _cssolibparserindexjs221_TokenType.Identifier) {
                    var prefix = _cssolibparserindexjs221_scanner.token.value;
                    if (prefix === 'U' || prefix === 'u') {
                        if (_cssolibparserindexjs221_scanner.lookupType(1, _cssolibparserindexjs221_TokenType.PlusSign)) {
                            _cssolibparserindexjs221_scanner.next(); // U or u
                            _cssolibparserindexjs221_scanner.next(); // +

                            child = {
                                type: 'Identifier',
                                info: _cssolibparserindexjs221_getInfo(), // FIXME: wrong position
                                name: prefix + '+' + _cssolibparserindexjs221_readUnicodeRange(true)
                            };
                        }
                        break;
                    }
                }

                child = _cssolibparserindexjs221_getAny(_cssolibparserindexjs221_SCOPE_VALUE);
        }

        if (child !== null) {
            node.sequence.insert(_cssolibparserindexjs221_List.createItem(child));
        }
    }

    _cssolibparserindexjs221_removeTrailingSpaces(node.sequence);

    return node;
}

// any = string | percentage | dimension | number | uri | functionExpression | funktion | unary | operator | ident
function _cssolibparserindexjs221_getAny(scope) {
    switch (_cssolibparserindexjs221_scanner.token.type) {
        case _cssolibparserindexjs221_TokenType.String:
            return _cssolibparserindexjs221_getString();

        case _cssolibparserindexjs221_TokenType.LowLine:
        case _cssolibparserindexjs221_TokenType.Identifier:
            break;

        case _cssolibparserindexjs221_TokenType.FullStop:
        case _cssolibparserindexjs221_TokenType.DecimalNumber:
        case _cssolibparserindexjs221_TokenType.HyphenMinus:
        case _cssolibparserindexjs221_TokenType.PlusSign:
            var number = _cssolibparserindexjs221_tryGetNumber();

            if (number !== null) {
                if (_cssolibparserindexjs221_scanner.token !== null) {
                    if (_cssolibparserindexjs221_scanner.token.type === _cssolibparserindexjs221_TokenType.PercentSign) {
                        return _cssolibparserindexjs221_getPercentage(number);
                    } else if (_cssolibparserindexjs221_scanner.token.type === _cssolibparserindexjs221_TokenType.Identifier) {
                        return _cssolibparserindexjs221_getDimension(number.value);
                    }
                }

                return number;
            }

            if (_cssolibparserindexjs221_scanner.token.type === _cssolibparserindexjs221_TokenType.HyphenMinus) {
                var next = _cssolibparserindexjs221_scanner.lookup(1);
                if (next && (next.type === _cssolibparserindexjs221_TokenType.Identifier || next.type === _cssolibparserindexjs221_TokenType.HyphenMinus)) {
                    break;
                }
            }

            if (_cssolibparserindexjs221_scanner.token.type === _cssolibparserindexjs221_TokenType.HyphenMinus || _cssolibparserindexjs221_scanner.token.type === _cssolibparserindexjs221_TokenType.PlusSign) {
                return _cssolibparserindexjs221_getOperator();
            }

            _cssolibparserindexjs221_parseError('Unexpected input');

        default:
            _cssolibparserindexjs221_parseError('Unexpected input');
    }

    var ident = _cssolibparserindexjs221_getIdentifier(false);

    if (_cssolibparserindexjs221_scanner.token !== null && _cssolibparserindexjs221_scanner.token.type === _cssolibparserindexjs221_TokenType.LeftParenthesis) {
        return _cssolibparserindexjs221_getFunction(scope, ident);
    }

    return ident;
}

function _cssolibparserindexjs221_readAttrselector() {
    _cssolibparserindexjs221_expectAny('Attribute selector (=, ~=, ^=, $=, *=, |=)', _cssolibparserindexjs221_TokenType.EqualsSign, // =
    _cssolibparserindexjs221_TokenType.Tilde, // ~=
    _cssolibparserindexjs221_TokenType.CircumflexAccent, // ^=
    _cssolibparserindexjs221_TokenType.DollarSign, // $=
    _cssolibparserindexjs221_TokenType.Asterisk, // *=
    _cssolibparserindexjs221_TokenType.VerticalLine // |=
    );

    var name;

    if (_cssolibparserindexjs221_scanner.token.type === _cssolibparserindexjs221_TokenType.EqualsSign) {
        name = '=';
        _cssolibparserindexjs221_scanner.next();
    } else {
        name = _cssolibparserindexjs221_scanner.token.value + '=';
        _cssolibparserindexjs221_scanner.next();
        _cssolibparserindexjs221_eat(_cssolibparserindexjs221_TokenType.EqualsSign);
    }

    return name;
}

// '[' S* attrib_name ']'
// '[' S* attrib_name S* attrib_match S* [ IDENT | STRING ] S* attrib_flags? S* ']'
function _cssolibparserindexjs221_getAttribute() {
    var node = {
        type: 'Attribute',
        info: _cssolibparserindexjs221_getInfo(),
        name: null,
        operator: null,
        value: null,
        flags: null
    };

    _cssolibparserindexjs221_eat(_cssolibparserindexjs221_TokenType.LeftSquareBracket);

    _cssolibparserindexjs221_readSC();

    node.name = _cssolibparserindexjs221_getNamespacedIdentifier(true);

    _cssolibparserindexjs221_readSC();

    if (_cssolibparserindexjs221_scanner.token !== null && _cssolibparserindexjs221_scanner.token.type !== _cssolibparserindexjs221_TokenType.RightSquareBracket) {
        // avoid case `[name i]`
        if (_cssolibparserindexjs221_scanner.token.type !== _cssolibparserindexjs221_TokenType.Identifier) {
            node.operator = _cssolibparserindexjs221_readAttrselector();

            _cssolibparserindexjs221_readSC();

            if (_cssolibparserindexjs221_scanner.token !== null && _cssolibparserindexjs221_scanner.token.type === _cssolibparserindexjs221_TokenType.String) {
                node.value = _cssolibparserindexjs221_getString();
            } else {
                node.value = _cssolibparserindexjs221_getIdentifier(false);
            }

            _cssolibparserindexjs221_readSC();
        }

        // attribute flags
        if (_cssolibparserindexjs221_scanner.token !== null && _cssolibparserindexjs221_scanner.token.type === _cssolibparserindexjs221_TokenType.Identifier) {
            node.flags = _cssolibparserindexjs221_scanner.token.value;

            _cssolibparserindexjs221_scanner.next();
            _cssolibparserindexjs221_readSC();
        }
    }

    _cssolibparserindexjs221_eat(_cssolibparserindexjs221_TokenType.RightSquareBracket);

    return node;
}

function _cssolibparserindexjs221_getBraces(scope) {
    var close;
    var child = null;
    var node = {
        type: 'Braces',
        info: _cssolibparserindexjs221_getInfo(),
        open: _cssolibparserindexjs221_scanner.token.value,
        close: null,
        sequence: new _cssolibparserindexjs221_List()
    };

    if (_cssolibparserindexjs221_scanner.token.type === _cssolibparserindexjs221_TokenType.LeftParenthesis) {
        close = _cssolibparserindexjs221_TokenType.RightParenthesis;
    } else {
        close = _cssolibparserindexjs221_TokenType.RightSquareBracket;
    }

    // left brace
    _cssolibparserindexjs221_scanner.next();

    _cssolibparserindexjs221_readSC();

    scan: while (_cssolibparserindexjs221_scanner.token !== null) {
        switch (_cssolibparserindexjs221_scanner.token.type) {
            case close:
                node.close = _cssolibparserindexjs221_scanner.token.value;
                break scan;

            case _cssolibparserindexjs221_TokenType.Space:
                child = _cssolibparserindexjs221_getS();
                break;

            case _cssolibparserindexjs221_TokenType.Comment:
                _cssolibparserindexjs221_scanner.next();
                child = null;
                break;

            case _cssolibparserindexjs221_TokenType.NumberSign:
                // ??
                child = _cssolibparserindexjs221_getVhash();
                break;

            case _cssolibparserindexjs221_TokenType.LeftParenthesis:
            case _cssolibparserindexjs221_TokenType.LeftSquareBracket:
                child = _cssolibparserindexjs221_getBraces(scope);
                break;

            case _cssolibparserindexjs221_TokenType.Solidus:
            case _cssolibparserindexjs221_TokenType.Asterisk:
            case _cssolibparserindexjs221_TokenType.Comma:
            case _cssolibparserindexjs221_TokenType.Colon:
                child = _cssolibparserindexjs221_getOperator();
                break;

            default:
                child = _cssolibparserindexjs221_getAny(scope);
        }

        if (child !== null) {
            node.sequence.insert(_cssolibparserindexjs221_List.createItem(child));
        }
    }

    _cssolibparserindexjs221_removeTrailingSpaces(node.sequence);

    // right brace
    _cssolibparserindexjs221_eat(close);

    return node;
}

// '.' ident
function _cssolibparserindexjs221_getClass() {
    var info = _cssolibparserindexjs221_getInfo();

    _cssolibparserindexjs221_eat(_cssolibparserindexjs221_TokenType.FullStop);

    return {
        type: 'Class',
        info: info,
        name: _cssolibparserindexjs221_readIdent(false)
    };
}

// '#' ident
function _cssolibparserindexjs221_getShash() {
    var info = _cssolibparserindexjs221_getInfo();

    _cssolibparserindexjs221_eat(_cssolibparserindexjs221_TokenType.NumberSign);

    return {
        type: 'Id',
        info: info,
        name: _cssolibparserindexjs221_readIdent(false)
    };
}

// + | > | ~ | /deep/
function _cssolibparserindexjs221_getCombinator() {
    var info = _cssolibparserindexjs221_getInfo();
    var combinator;

    switch (_cssolibparserindexjs221_scanner.token.type) {
        case _cssolibparserindexjs221_TokenType.Space:
            combinator = ' ';
            _cssolibparserindexjs221_scanner.next();
            break;

        case _cssolibparserindexjs221_TokenType.PlusSign:
        case _cssolibparserindexjs221_TokenType.GreaterThanSign:
        case _cssolibparserindexjs221_TokenType.Tilde:
            combinator = _cssolibparserindexjs221_scanner.token.value;
            _cssolibparserindexjs221_scanner.next();
            break;

        case _cssolibparserindexjs221_TokenType.Solidus:
            combinator = '/deep/';
            _cssolibparserindexjs221_scanner.next();

            _cssolibparserindexjs221_expectIdentifier('deep', true);

            _cssolibparserindexjs221_eat(_cssolibparserindexjs221_TokenType.Solidus);
            break;

        default:
            _cssolibparserindexjs221_parseError('Combinator (+, >, ~, /deep/) is expected');
    }

    return {
        type: 'Combinator',
        info: info,
        name: combinator
    };
}

// '/*' .* '*/'
function _cssolibparserindexjs221_getComment() {
    var info = _cssolibparserindexjs221_getInfo();
    var value = _cssolibparserindexjs221_scanner.token.value;
    var len = value.length;

    if (len > 4 && value.charAt(len - 2) === '*' && value.charAt(len - 1) === '/') {
        len -= 2;
    }

    _cssolibparserindexjs221_scanner.next();

    return {
        type: 'Comment',
        info: info,
        value: value.substring(2, len)
    };
}

// special reader for units to avoid adjoined IE hacks (i.e. '1px\9')
function _cssolibparserindexjs221_readUnit() {
    if (_cssolibparserindexjs221_scanner.token !== null && _cssolibparserindexjs221_scanner.token.type === _cssolibparserindexjs221_TokenType.Identifier) {
        var unit = _cssolibparserindexjs221_scanner.token.value;
        var backSlashPos = unit.indexOf('\\');

        // no backslash in unit name
        if (backSlashPos === -1) {
            _cssolibparserindexjs221_scanner.next();
            return unit;
        }

        // patch token
        _cssolibparserindexjs221_scanner.token.value = unit.substr(backSlashPos);
        _cssolibparserindexjs221_scanner.token.offset += backSlashPos;
        _cssolibparserindexjs221_scanner.token.column += backSlashPos;

        // return unit w/o backslash part
        return unit.substr(0, backSlashPos);
    }

    _cssolibparserindexjs221_parseError('Identifier is expected');
}

// number ident
function _cssolibparserindexjs221_getDimension(number) {
    return {
        type: 'Dimension',
        info: _cssolibparserindexjs221_getInfo(),
        value: number || _cssolibparserindexjs221_readNumber(),
        unit: _cssolibparserindexjs221_readUnit()
    };
}

// number "%"
function _cssolibparserindexjs221_tryGetPercentage() {
    var number = _cssolibparserindexjs221_tryGetNumber();

    if (number && _cssolibparserindexjs221_scanner.token !== null && _cssolibparserindexjs221_scanner.token.type === _cssolibparserindexjs221_TokenType.PercentSign) {
        return _cssolibparserindexjs221_getPercentage(number);
    }

    return null;
}

function _cssolibparserindexjs221_getPercentage(number) {
    var info;

    if (!number) {
        info = _cssolibparserindexjs221_getInfo();
        number = _cssolibparserindexjs221_readNumber();
    } else {
        info = number.info;
        number = number.value;
    }

    _cssolibparserindexjs221_eat(_cssolibparserindexjs221_TokenType.PercentSign);

    return {
        type: 'Percentage',
        info: info,
        value: number
    };
}

// ident '(' functionBody ')' |
// not '(' <simpleSelector>* ')'
function _cssolibparserindexjs221_getFunction(scope, ident) {
    var defaultArguments = _cssolibparserindexjs221_getFunctionArguments;

    if (!ident) {
        ident = _cssolibparserindexjs221_getIdentifier(false);
    }

    // parse special functions
    var name = ident.name.toLowerCase();

    if (_cssolibparserindexjs221_specialFunctions.hasOwnProperty(scope)) {
        if (_cssolibparserindexjs221_specialFunctions[scope].hasOwnProperty(name)) {
            return _cssolibparserindexjs221_specialFunctions[scope][name](scope, ident);
        }
    }

    return _cssolibparserindexjs221_getFunctionInternal(defaultArguments, scope, ident);
}

function _cssolibparserindexjs221_getFunctionInternal(functionArgumentsReader, scope, ident) {
    var args;

    _cssolibparserindexjs221_eat(_cssolibparserindexjs221_TokenType.LeftParenthesis);
    args = functionArgumentsReader(scope);
    _cssolibparserindexjs221_eat(_cssolibparserindexjs221_TokenType.RightParenthesis);

    return {
        type: scope === _cssolibparserindexjs221_SCOPE_SELECTOR ? 'FunctionalPseudo' : 'Function',
        info: ident.info,
        name: ident.name,
        arguments: args
    };
}

function _cssolibparserindexjs221_getFunctionArguments(scope) {
    var args = new _cssolibparserindexjs221_List();
    var argument = null;
    var child = null;

    _cssolibparserindexjs221_readSC();

    scan: while (_cssolibparserindexjs221_scanner.token !== null) {
        switch (_cssolibparserindexjs221_scanner.token.type) {
            case _cssolibparserindexjs221_TokenType.RightParenthesis:
                break scan;

            case _cssolibparserindexjs221_TokenType.Space:
                child = _cssolibparserindexjs221_getS();
                break;

            case _cssolibparserindexjs221_TokenType.Comment:
                // ignore comments
                _cssolibparserindexjs221_scanner.next();
                child = null;
                break;

            case _cssolibparserindexjs221_TokenType.NumberSign:
                // TODO: not sure it should be here
                child = _cssolibparserindexjs221_getVhash();
                break;

            case _cssolibparserindexjs221_TokenType.LeftParenthesis:
            case _cssolibparserindexjs221_TokenType.LeftSquareBracket:
                child = _cssolibparserindexjs221_getBraces(scope);
                break;

            case _cssolibparserindexjs221_TokenType.Comma:
                _cssolibparserindexjs221_removeTrailingSpaces(argument.sequence);
                _cssolibparserindexjs221_scanner.next();
                _cssolibparserindexjs221_readSC();
                argument = null;
                child = null;
                break;

            case _cssolibparserindexjs221_TokenType.Solidus:
            case _cssolibparserindexjs221_TokenType.Asterisk:
            case _cssolibparserindexjs221_TokenType.Colon:
            case _cssolibparserindexjs221_TokenType.EqualsSign:
                child = _cssolibparserindexjs221_getOperator();
                break;

            default:
                child = _cssolibparserindexjs221_getAny(scope);
        }

        if (argument === null) {
            argument = {
                type: 'Argument',
                sequence: new _cssolibparserindexjs221_List()
            };
            args.insert(_cssolibparserindexjs221_List.createItem(argument));
        }

        if (child !== null) {
            argument.sequence.insert(_cssolibparserindexjs221_List.createItem(child));
        }
    }

    if (argument !== null) {
        _cssolibparserindexjs221_removeTrailingSpaces(argument.sequence);
    }

    return args;
}

function _cssolibparserindexjs221_getVarFunction(scope, ident) {
    return _cssolibparserindexjs221_getFunctionInternal(_cssolibparserindexjs221_getVarFunctionArguments, scope, ident);
}

function _cssolibparserindexjs221_getNotFunctionArguments() {
    var args = new _cssolibparserindexjs221_List();
    var wasSelector = false;

    scan: while (_cssolibparserindexjs221_scanner.token !== null) {
        switch (_cssolibparserindexjs221_scanner.token.type) {
            case _cssolibparserindexjs221_TokenType.RightParenthesis:
                if (!wasSelector) {
                    _cssolibparserindexjs221_parseError('Simple selector is expected');
                }

                break scan;

            case _cssolibparserindexjs221_TokenType.Comma:
                if (!wasSelector) {
                    _cssolibparserindexjs221_parseError('Simple selector is expected');
                }

                wasSelector = false;
                _cssolibparserindexjs221_scanner.next();
                break;

            default:
                wasSelector = true;
                args.insert(_cssolibparserindexjs221_List.createItem(_cssolibparserindexjs221_getSimpleSelector(true)));
        }
    }

    return args;
}

function _cssolibparserindexjs221_getNotFunction(scope, ident) {
    var args;

    _cssolibparserindexjs221_eat(_cssolibparserindexjs221_TokenType.LeftParenthesis);
    args = _cssolibparserindexjs221_getNotFunctionArguments(scope);
    _cssolibparserindexjs221_eat(_cssolibparserindexjs221_TokenType.RightParenthesis);

    return {
        type: 'Negation',
        info: ident.info,
        // name: ident.name,  // TODO: add name?
        sequence: args // FIXME: -> arguments?
    };
}

// var '(' ident (',' <declaration-value>)? ')'
function _cssolibparserindexjs221_getVarFunctionArguments() {
    // TODO: special type Variable?
    var args = new _cssolibparserindexjs221_List();

    _cssolibparserindexjs221_readSC();

    args.insert(_cssolibparserindexjs221_List.createItem({
        type: 'Argument',
        sequence: new _cssolibparserindexjs221_List([_cssolibparserindexjs221_getIdentifier(true)])
    }));

    _cssolibparserindexjs221_readSC();

    if (_cssolibparserindexjs221_scanner.token !== null && _cssolibparserindexjs221_scanner.token.type === _cssolibparserindexjs221_TokenType.Comma) {
        _cssolibparserindexjs221_eat(_cssolibparserindexjs221_TokenType.Comma);
        _cssolibparserindexjs221_readSC();

        args.insert(_cssolibparserindexjs221_List.createItem({
            type: 'Argument',
            sequence: new _cssolibparserindexjs221_List([_cssolibparserindexjs221_getValue(true)])
        }));

        _cssolibparserindexjs221_readSC();
    }

    return args;
}

// url '(' ws* (string | raw) ws* ')'
function _cssolibparserindexjs221_getUri(scope, ident) {
    var node = {
        type: 'Url',
        info: ident.info,
        // name: ident.name,
        value: null
    };

    _cssolibparserindexjs221_eat(_cssolibparserindexjs221_TokenType.LeftParenthesis); // (

    _cssolibparserindexjs221_readSC();

    if (_cssolibparserindexjs221_scanner.token.type === _cssolibparserindexjs221_TokenType.String) {
        node.value = _cssolibparserindexjs221_getString();
        _cssolibparserindexjs221_readSC();
    } else {
        var rawInfo = _cssolibparserindexjs221_getInfo();
        var raw = '';

        for (; _cssolibparserindexjs221_scanner.token !== null; _cssolibparserindexjs221_scanner.next()) {
            var type = _cssolibparserindexjs221_scanner.token.type;

            if (type === _cssolibparserindexjs221_TokenType.Space || type === _cssolibparserindexjs221_TokenType.LeftParenthesis || type === _cssolibparserindexjs221_TokenType.RightParenthesis) {
                break;
            }

            raw += _cssolibparserindexjs221_scanner.token.value;
        }

        node.value = {
            type: 'Raw',
            info: rawInfo,
            value: raw
        };

        _cssolibparserindexjs221_readSC();
    }

    _cssolibparserindexjs221_eat(_cssolibparserindexjs221_TokenType.RightParenthesis); // )

    return node;
}

// expression '(' raw ')'
function _cssolibparserindexjs221_getOldIEExpression(scope, ident) {
    var balance = 0;
    var raw = '';

    _cssolibparserindexjs221_eat(_cssolibparserindexjs221_TokenType.LeftParenthesis);

    for (; _cssolibparserindexjs221_scanner.token !== null; _cssolibparserindexjs221_scanner.next()) {
        if (_cssolibparserindexjs221_scanner.token.type === _cssolibparserindexjs221_TokenType.RightParenthesis) {
            if (balance === 0) {
                break;
            }

            balance--;
        } else if (_cssolibparserindexjs221_scanner.token.type === _cssolibparserindexjs221_TokenType.LeftParenthesis) {
            balance++;
        }

        raw += _cssolibparserindexjs221_scanner.token.value;
    }

    _cssolibparserindexjs221_eat(_cssolibparserindexjs221_TokenType.RightParenthesis);

    return {
        type: 'Function',
        info: ident.info,
        name: ident.name,
        arguments: new _cssolibparserindexjs221_List([{
            type: 'Argument',
            sequence: new _cssolibparserindexjs221_List([{
                type: 'Raw',
                value: raw
            }])
        }])
    };
}

function _cssolibparserindexjs221_readUnicodeRange(tryNext) {
    var hex = '';

    for (; _cssolibparserindexjs221_scanner.token !== null; _cssolibparserindexjs221_scanner.next()) {
        if (_cssolibparserindexjs221_scanner.token.type !== _cssolibparserindexjs221_TokenType.DecimalNumber && _cssolibparserindexjs221_scanner.token.type !== _cssolibparserindexjs221_TokenType.Identifier) {
            break;
        }

        hex += _cssolibparserindexjs221_scanner.token.value;
    }

    if (!/^[0-9a-f]{1,6}$/i.test(hex)) {
        _cssolibparserindexjs221_parseError('Unexpected input');
    }

    // U+abc???
    if (tryNext) {
        for (; hex.length < 6 && _cssolibparserindexjs221_scanner.token !== null; _cssolibparserindexjs221_scanner.next()) {
            if (_cssolibparserindexjs221_scanner.token.type !== _cssolibparserindexjs221_TokenType.QuestionMark) {
                break;
            }

            hex += _cssolibparserindexjs221_scanner.token.value;
            tryNext = false;
        }
    }

    // U+aaa-bbb
    if (tryNext) {
        if (_cssolibparserindexjs221_scanner.token !== null && _cssolibparserindexjs221_scanner.token.type === _cssolibparserindexjs221_TokenType.HyphenMinus) {
            _cssolibparserindexjs221_scanner.next();

            var next = _cssolibparserindexjs221_readUnicodeRange(false);

            if (!next) {
                _cssolibparserindexjs221_parseError('Unexpected input');
            }

            hex += '-' + next;
        }
    }

    return hex;
}

function _cssolibparserindexjs221_readIdent(varAllowed) {
    var name = '';

    // optional first -
    if (_cssolibparserindexjs221_scanner.token !== null && _cssolibparserindexjs221_scanner.token.type === _cssolibparserindexjs221_TokenType.HyphenMinus) {
        name = '-';
        _cssolibparserindexjs221_scanner.next();

        if (varAllowed && _cssolibparserindexjs221_scanner.token !== null && _cssolibparserindexjs221_scanner.token.type === _cssolibparserindexjs221_TokenType.HyphenMinus) {
            name = '--';
            _cssolibparserindexjs221_scanner.next();
        }
    }

    _cssolibparserindexjs221_expectAny('Identifier', _cssolibparserindexjs221_TokenType.LowLine, _cssolibparserindexjs221_TokenType.Identifier);

    if (_cssolibparserindexjs221_scanner.token !== null) {
        name += _cssolibparserindexjs221_scanner.token.value;
        _cssolibparserindexjs221_scanner.next();

        for (; _cssolibparserindexjs221_scanner.token !== null; _cssolibparserindexjs221_scanner.next()) {
            var type = _cssolibparserindexjs221_scanner.token.type;

            if (type !== _cssolibparserindexjs221_TokenType.LowLine && type !== _cssolibparserindexjs221_TokenType.Identifier && type !== _cssolibparserindexjs221_TokenType.DecimalNumber && type !== _cssolibparserindexjs221_TokenType.HyphenMinus) {
                break;
            }

            name += _cssolibparserindexjs221_scanner.token.value;
        }
    }

    return name;
}

function _cssolibparserindexjs221_getNamespacedIdentifier(checkColon) {
    if (_cssolibparserindexjs221_scanner.token === null) {
        _cssolibparserindexjs221_parseError('Unexpected end of input');
    }

    var info = _cssolibparserindexjs221_getInfo();
    var name;

    if (_cssolibparserindexjs221_scanner.token.type === _cssolibparserindexjs221_TokenType.Asterisk) {
        checkColon = false;
        name = '*';
        _cssolibparserindexjs221_scanner.next();
    } else {
        name = _cssolibparserindexjs221_readIdent(false);
    }

    if (_cssolibparserindexjs221_scanner.token !== null) {
        if (_cssolibparserindexjs221_scanner.token.type === _cssolibparserindexjs221_TokenType.VerticalLine && _cssolibparserindexjs221_scanner.lookupType(1, _cssolibparserindexjs221_TokenType.EqualsSign) === false) {
            name += '|';

            if (_cssolibparserindexjs221_scanner.next() !== null) {
                if (_cssolibparserindexjs221_scanner.token.type === _cssolibparserindexjs221_TokenType.HyphenMinus || _cssolibparserindexjs221_scanner.token.type === _cssolibparserindexjs221_TokenType.Identifier || _cssolibparserindexjs221_scanner.token.type === _cssolibparserindexjs221_TokenType.LowLine) {
                    name += _cssolibparserindexjs221_readIdent(false);
                } else if (_cssolibparserindexjs221_scanner.token.type === _cssolibparserindexjs221_TokenType.Asterisk) {
                    checkColon = false;
                    name += '*';
                    _cssolibparserindexjs221_scanner.next();
                }
            }
        }
    }

    if (checkColon && _cssolibparserindexjs221_scanner.token !== null && _cssolibparserindexjs221_scanner.token.type === _cssolibparserindexjs221_TokenType.Colon) {
        _cssolibparserindexjs221_scanner.next();
        name += ':' + _cssolibparserindexjs221_readIdent(false);
    }

    return {
        type: 'Identifier',
        info: info,
        name: name
    };
}

function _cssolibparserindexjs221_getIdentifier(varAllowed) {
    return {
        type: 'Identifier',
        info: _cssolibparserindexjs221_getInfo(),
        name: _cssolibparserindexjs221_readIdent(varAllowed)
    };
}

// ! ws* important
function _cssolibparserindexjs221_getImportant() {
    // TODO?
    // var info = getInfo();

    _cssolibparserindexjs221_eat(_cssolibparserindexjs221_TokenType.ExclamationMark);

    _cssolibparserindexjs221_readSC();

    // return {
    //     type: 'Identifier',
    //     info: info,
    //     name: readIdent(false)
    // };

    _cssolibparserindexjs221_expectIdentifier('important');

    _cssolibparserindexjs221_readIdent(false);

    // should return identifier in future for original source restoring as is
    // returns true for now since it's fit to optimizer purposes
    return true;
}

// odd | even | number? n
function _cssolibparserindexjs221_getNth() {
    _cssolibparserindexjs221_expectAny('Number, odd or even', _cssolibparserindexjs221_TokenType.Identifier, _cssolibparserindexjs221_TokenType.DecimalNumber);

    var info = _cssolibparserindexjs221_getInfo();
    var value = _cssolibparserindexjs221_scanner.token.value;
    var cmpValue;

    if (_cssolibparserindexjs221_scanner.token.type === _cssolibparserindexjs221_TokenType.DecimalNumber) {
        var next = _cssolibparserindexjs221_scanner.lookup(1);
        if (next !== null && next.type === _cssolibparserindexjs221_TokenType.Identifier && next.value.toLowerCase() === 'n') {
            value += next.value;
            _cssolibparserindexjs221_scanner.next();
        }
    } else {
        var cmpValue = value.toLowerCase();
        if (cmpValue !== 'odd' && cmpValue !== 'even' && cmpValue !== 'n') {
            _cssolibparserindexjs221_parseError('Unexpected identifier');
        }
    }

    _cssolibparserindexjs221_scanner.next();

    return {
        type: 'Nth',
        info: info,
        value: value
    };
}

function _cssolibparserindexjs221_getNthSelector() {
    var info = _cssolibparserindexjs221_getInfo();
    var sequence = new _cssolibparserindexjs221_List();
    var node;
    var child = null;

    _cssolibparserindexjs221_eat(_cssolibparserindexjs221_TokenType.Colon);
    _cssolibparserindexjs221_expectIdentifier('nth', false);

    node = {
        type: 'FunctionalPseudo',
        info: info,
        name: _cssolibparserindexjs221_readIdent(false),
        arguments: new _cssolibparserindexjs221_List([{
            type: 'Argument',
            sequence: sequence
        }])
    };

    _cssolibparserindexjs221_eat(_cssolibparserindexjs221_TokenType.LeftParenthesis);

    scan: while (_cssolibparserindexjs221_scanner.token !== null) {
        switch (_cssolibparserindexjs221_scanner.token.type) {
            case _cssolibparserindexjs221_TokenType.RightParenthesis:
                break scan;

            case _cssolibparserindexjs221_TokenType.Space:
            case _cssolibparserindexjs221_TokenType.Comment:
                _cssolibparserindexjs221_scanner.next();
                child = null;
                break;

            case _cssolibparserindexjs221_TokenType.HyphenMinus:
            case _cssolibparserindexjs221_TokenType.PlusSign:
                child = _cssolibparserindexjs221_getOperator();
                break;

            default:
                child = _cssolibparserindexjs221_getNth();
        }

        if (child !== null) {
            sequence.insert(_cssolibparserindexjs221_List.createItem(child));
        }
    }

    _cssolibparserindexjs221_eat(_cssolibparserindexjs221_TokenType.RightParenthesis);

    return node;
}

function _cssolibparserindexjs221_readNumber() {
    var wasDigits = false;
    var number = '';
    var offset = 0;

    if (_cssolibparserindexjs221_scanner.lookupType(offset, _cssolibparserindexjs221_TokenType.HyphenMinus)) {
        number = '-';
        offset++;
    }

    if (_cssolibparserindexjs221_scanner.lookupType(offset, _cssolibparserindexjs221_TokenType.DecimalNumber)) {
        wasDigits = true;
        number += _cssolibparserindexjs221_scanner.lookup(offset).value;
        offset++;
    }

    if (_cssolibparserindexjs221_scanner.lookupType(offset, _cssolibparserindexjs221_TokenType.FullStop)) {
        number += '.';
        offset++;
    }

    if (_cssolibparserindexjs221_scanner.lookupType(offset, _cssolibparserindexjs221_TokenType.DecimalNumber)) {
        wasDigits = true;
        number += _cssolibparserindexjs221_scanner.lookup(offset).value;
        offset++;
    }

    if (wasDigits) {
        while (offset--) {
            _cssolibparserindexjs221_scanner.next();
        }

        return number;
    }

    return null;
}

function _cssolibparserindexjs221_tryGetNumber() {
    var info = _cssolibparserindexjs221_getInfo();
    var number = _cssolibparserindexjs221_readNumber();

    if (number !== null) {
        return {
            type: 'Number',
            info: info,
            value: number
        };
    }

    return null;
}

// '/' | '*' | ',' | ':' | '=' | '+' | '-'
// TODO: remove '=' since it's wrong operator, but theat as operator
// to make old things like `filter: alpha(opacity=0)` works
function _cssolibparserindexjs221_getOperator() {
    var node = {
        type: 'Operator',
        info: _cssolibparserindexjs221_getInfo(),
        value: _cssolibparserindexjs221_scanner.token.value
    };

    _cssolibparserindexjs221_scanner.next();

    return node;
}

function _cssolibparserindexjs221_getFilterValue() {
    // TODO
    var progid;
    var node = {
        type: 'Value',
        info: _cssolibparserindexjs221_getInfo(),
        important: false,
        sequence: new _cssolibparserindexjs221_List()
    };

    while (progid = _cssolibparserindexjs221_checkProgid()) {
        node.sequence.insert(_cssolibparserindexjs221_List.createItem(_cssolibparserindexjs221_getProgid(progid)));
    }

    _cssolibparserindexjs221_readSC(node);

    if (_cssolibparserindexjs221_scanner.token !== null && _cssolibparserindexjs221_scanner.token.type === _cssolibparserindexjs221_TokenType.ExclamationMark) {
        node.important = _cssolibparserindexjs221_getImportant();
    }

    return node;
}

// 'progid:' ws* 'DXImageTransform.Microsoft.' ident ws* '(' .* ')'
function _cssolibparserindexjs221_checkProgid() {
    function checkSC(offset) {
        for (var cursor; cursor = _cssolibparserindexjs221_scanner.lookup(offset); offset++) {
            if (cursor.type !== _cssolibparserindexjs221_TokenType.Space && cursor.type !== _cssolibparserindexjs221_TokenType.Comment) {
                break;
            }
        }

        return offset;
    }

    var offset = checkSC(0);

    if (_cssolibparserindexjs221_scanner.lookup(offset + 1) === null || _cssolibparserindexjs221_scanner.lookup(offset + 0).value.toLowerCase() !== 'progid' || _cssolibparserindexjs221_scanner.lookup(offset + 1).type !== _cssolibparserindexjs221_TokenType.Colon) {
        return false; // fail
    }

    offset += 2;
    offset = checkSC(offset);

    if (_cssolibparserindexjs221_scanner.lookup(offset + 5) === null || _cssolibparserindexjs221_scanner.lookup(offset + 0).value.toLowerCase() !== 'dximagetransform' || _cssolibparserindexjs221_scanner.lookup(offset + 1).type !== _cssolibparserindexjs221_TokenType.FullStop || _cssolibparserindexjs221_scanner.lookup(offset + 2).value.toLowerCase() !== 'microsoft' || _cssolibparserindexjs221_scanner.lookup(offset + 3).type !== _cssolibparserindexjs221_TokenType.FullStop || _cssolibparserindexjs221_scanner.lookup(offset + 4).type !== _cssolibparserindexjs221_TokenType.Identifier) {
        return false; // fail
    }

    offset += 5;
    offset = checkSC(offset);

    if (_cssolibparserindexjs221_scanner.lookupType(offset, _cssolibparserindexjs221_TokenType.LeftParenthesis) === false) {
        return false; // fail
    }

    for (var cursor; cursor = _cssolibparserindexjs221_scanner.lookup(offset); offset++) {
        if (cursor.type === _cssolibparserindexjs221_TokenType.RightParenthesis) {
            return cursor;
        }
    }

    return false;
}

function _cssolibparserindexjs221_getProgid(progidEnd) {
    var value = '';
    var node = {
        type: 'Progid',
        info: _cssolibparserindexjs221_getInfo(),
        value: null
    };

    if (!progidEnd) {
        progidEnd = _cssolibparserindexjs221_checkProgid();
    }

    if (!progidEnd) {
        _cssolibparserindexjs221_parseError('progid is expected');
    }

    _cssolibparserindexjs221_readSC(node);

    var rawInfo = _cssolibparserindexjs221_getInfo();
    for (; _cssolibparserindexjs221_scanner.token && _cssolibparserindexjs221_scanner.token !== progidEnd; _cssolibparserindexjs221_scanner.next()) {
        value += _cssolibparserindexjs221_scanner.token.value;
    }

    _cssolibparserindexjs221_eat(_cssolibparserindexjs221_TokenType.RightParenthesis);
    value += ')';

    node.value = {
        type: 'Raw',
        info: rawInfo,
        value: value
    };

    _cssolibparserindexjs221_readSC(node);

    return node;
}

// <pseudo-element> | <nth-selector> | <pseudo-class>
function _cssolibparserindexjs221_getPseudo() {
    var next = _cssolibparserindexjs221_scanner.lookup(1);

    if (next === null) {
        _cssolibparserindexjs221_scanner.next();
        _cssolibparserindexjs221_parseError('Colon or identifier is expected');
    }

    if (next.type === _cssolibparserindexjs221_TokenType.Colon) {
        return _cssolibparserindexjs221_getPseudoElement();
    }

    if (next.type === _cssolibparserindexjs221_TokenType.Identifier && next.value.toLowerCase() === 'nth') {
        return _cssolibparserindexjs221_getNthSelector();
    }

    return _cssolibparserindexjs221_getPseudoClass();
}

// :: ident
function _cssolibparserindexjs221_getPseudoElement() {
    var info = _cssolibparserindexjs221_getInfo();

    _cssolibparserindexjs221_eat(_cssolibparserindexjs221_TokenType.Colon);
    _cssolibparserindexjs221_eat(_cssolibparserindexjs221_TokenType.Colon);

    return {
        type: 'PseudoElement',
        info: info,
        name: _cssolibparserindexjs221_readIdent(false)
    };
}

// : ( ident | function )
function _cssolibparserindexjs221_getPseudoClass() {
    var info = _cssolibparserindexjs221_getInfo();
    var ident = _cssolibparserindexjs221_eat(_cssolibparserindexjs221_TokenType.Colon) && _cssolibparserindexjs221_getIdentifier(false);

    if (_cssolibparserindexjs221_scanner.token !== null && _cssolibparserindexjs221_scanner.token.type === _cssolibparserindexjs221_TokenType.LeftParenthesis) {
        return _cssolibparserindexjs221_getFunction(_cssolibparserindexjs221_SCOPE_SELECTOR, ident);
    }

    return {
        type: 'PseudoClass',
        info: info,
        name: ident.name
    };
}

// ws
function _cssolibparserindexjs221_getS() {
    var node = {
        type: 'Space'
        // value: scanner.token.value
    };

    _cssolibparserindexjs221_scanner.next();

    return node;
}

function _cssolibparserindexjs221_readSC() {
    // var nodes = [];

    scan: while (_cssolibparserindexjs221_scanner.token !== null) {
        switch (_cssolibparserindexjs221_scanner.token.type) {
            case _cssolibparserindexjs221_TokenType.Space:
                _cssolibparserindexjs221_scanner.next();
                // nodes.push(getS());
                break;

            case _cssolibparserindexjs221_TokenType.Comment:
                _cssolibparserindexjs221_scanner.next();
                // nodes.push(getComment());
                break;

            default:
                break scan;
        }
    }

    return null;

    // return nodes.length ? new List(nodes) : null;
}

// node: String
function _cssolibparserindexjs221_getString() {
    var node = {
        type: 'String',
        info: _cssolibparserindexjs221_getInfo(),
        value: _cssolibparserindexjs221_scanner.token.value
    };

    _cssolibparserindexjs221_scanner.next();

    return node;
}

// # ident
function _cssolibparserindexjs221_getVhash() {
    var info = _cssolibparserindexjs221_getInfo();
    var value;

    _cssolibparserindexjs221_eat(_cssolibparserindexjs221_TokenType.NumberSign);

    _cssolibparserindexjs221_expectAny('Number or identifier', _cssolibparserindexjs221_TokenType.DecimalNumber, _cssolibparserindexjs221_TokenType.Identifier);

    value = _cssolibparserindexjs221_scanner.token.value;

    if (_cssolibparserindexjs221_scanner.token.type === _cssolibparserindexjs221_TokenType.DecimalNumber && _cssolibparserindexjs221_scanner.lookupType(1, _cssolibparserindexjs221_TokenType.Identifier)) {
        _cssolibparserindexjs221_scanner.next();
        value += _cssolibparserindexjs221_scanner.token.value;
    }

    _cssolibparserindexjs221_scanner.next();

    return {
        type: 'Hash',
        info: info,
        value: value
    };
}

$m['csso/lib/parser/index.js#2.2.1'].exports = function parse(source, options) {
    var ast;

    if (!options || typeof options !== 'object') {
        options = {};
    }

    var context = options.context || 'stylesheet';
    _cssolibparserindexjs221_needPositions = Boolean(options.positions);
    _cssolibparserindexjs221_filename = options.filename || '<unknown>';

    if (!_cssolibparserindexjs221_initialContext.hasOwnProperty(context)) {
        throw new Error('Unknown context `' + context + '`');
    }

    _cssolibparserindexjs221_scanner = new _cssolibparserindexjs221_Scanner(source, _cssolibparserindexjs221_blockMode.hasOwnProperty(context), options.line, options.column);
    _cssolibparserindexjs221_scanner.next();
    ast = _cssolibparserindexjs221_initialContext[context]();

    _cssolibparserindexjs221_scanner = null;

    // console.log(JSON.stringify(ast, null, 4));
    return ast;
};
/*≠≠ node_modules/csso/lib/parser/index.js ≠≠*/

/*== node_modules/csso/lib/index.js ==*/
$m['csso/lib/index.js#2.2.1'] = { exports: {} };
var _cssolibindexjs221_parse = $m['csso/lib/parser/index.js#2.2.1'].exports;
var _cssolibindexjs221_compress = $m['csso/lib/compressor/index.js#2.2.1'].exports;
var _cssolibindexjs221_translate = $m['csso/lib/utils/translate.js#2.2.1'].exports;
var _cssolibindexjs221_translateWithSourceMap = $m['csso/lib/utils/translateWithSourceMap.js#2.2.1'].exports;
var _cssolibindexjs221_walkers = $m['csso/lib/utils/walk.js#2.2.1'].exports;
var _cssolibindexjs221_clone = $m['csso/lib/utils/clone.js#2.2.1'].exports;
var _cssolibindexjs221_List = $m['csso/lib/utils/list.js#2.2.1'].exports;

function _cssolibindexjs221_debugOutput(name, options, startTime, data) {
  if (options.debug) {
    console.error('## ' + name + ' done in %d ms\n', Date.now() - startTime);
  }

  return data;
}

function _cssolibindexjs221_createDefaultLogger(level) {
  var lastDebug;

  return function logger(title, ast) {
    var line = title;

    if (ast) {
      line = '[' + ((Date.now() - lastDebug) / 1000).toFixed(3) + 's] ' + line;
    }

    if (level > 1 && ast) {
      var css = _cssolibindexjs221_translate(ast, true);

      // when level 2, limit css to 256 symbols
      if (level === 2 && css.length > 256) {
        css = css.substr(0, 256) + '...';
      }

      line += '\n  ' + css + '\n';
    }

    console.error(line);
    lastDebug = Date.now();
  };
}

function _cssolibindexjs221_copy(obj) {
  var result = {};

  for (var key in obj) {
    result[key] = obj[key];
  }

  return result;
}

function _cssolibindexjs221_buildCompressOptions(options) {
  options = _cssolibindexjs221_copy(options);

  if (typeof options.logger !== 'function' && options.debug) {
    options.logger = _cssolibindexjs221_createDefaultLogger(options.debug);
  }

  return options;
}

function _cssolibindexjs221_minify(context, source, options) {
  options = options || {};

  var filename = options.filename || '<unknown>';
  var result;

  // parse
  var ast = _cssolibindexjs221_debugOutput('parsing', options, Date.now(), _cssolibindexjs221_parse(source, {
    context: context,
    filename: filename,
    positions: Boolean(options.sourceMap)
  }));

  // compress
  var compressResult = _cssolibindexjs221_debugOutput('compress', options, Date.now(), _cssolibindexjs221_compress(ast, _cssolibindexjs221_buildCompressOptions(options)));

  // translate
  if (options.sourceMap) {
    result = _cssolibindexjs221_debugOutput('translateWithSourceMap', options, Date.now(), function () {
      var tmp = _cssolibindexjs221_translateWithSourceMap(compressResult.ast);
      tmp.map._file = filename; // since other tools can relay on file in source map transform chain
      tmp.map.setSourceContent(filename, source);
      return tmp;
    }());
  } else {
    result = _cssolibindexjs221_debugOutput('translate', options, Date.now(), {
      css: _cssolibindexjs221_translate(compressResult.ast),
      map: null
    });
  }

  return result;
}

function _cssolibindexjs221_minifyStylesheet(source, options) {
  return _cssolibindexjs221_minify('stylesheet', source, options);
};

function _cssolibindexjs221_minifyBlock(source, options) {
  return _cssolibindexjs221_minify('block', source, options);
}

$m['csso/lib/index.js#2.2.1'].exports = {
  version: {
    "_args": [[{
      "raw": "csso@2.2.1",
      "scope": null,
      "escapedName": "csso",
      "name": "csso",
      "rawSpec": "2.2.1",
      "spec": "2.2.1",
      "type": "version"
    }, "/Users/n23618/PROJECTS/buddy/packages/buddy-plugin-csso"]],
    "_from": "csso@2.2.1",
    "_id": "csso@2.2.1",
    "_inCache": true,
    "_location": "/csso",
    "_nodeVersion": "6.2.1",
    "_npmOperationalInternal": {
      "host": "packages-12-west.internal.npmjs.com",
      "tmp": "tmp/csso-2.2.1.tgz_1469398647720_0.4500888998154551"
    },
    "_npmUser": {
      "name": "lahmatiy",
      "email": "rdvornov@gmail.com"
    },
    "_npmVersion": "3.10.4",
    "_phantomChildren": {},
    "_requested": {
      "raw": "csso@2.2.1",
      "scope": null,
      "escapedName": "csso",
      "name": "csso",
      "rawSpec": "2.2.1",
      "spec": "2.2.1",
      "type": "version"
    },
    "_requiredBy": ["#USER", "/"],
    "_resolved": "https://registry.npmjs.org/csso/-/csso-2.2.1.tgz",
    "_shasum": "51fbb5347e50e81e6ed51668a48490ae6fe2afe2",
    "_shrinkwrap": null,
    "_spec": "csso@2.2.1",
    "_where": "/Users/n23618/PROJECTS/buddy/packages/buddy-plugin-csso",
    "author": {
      "name": "Sergey Kryzhanovsky",
      "email": "skryzhanovsky@ya.ru",
      "url": "https://github.com/afelix"
    },
    "bin": {
      "csso": "./bin/csso"
    },
    "bugs": {
      "url": "https://github.com/css/csso/issues"
    },
    "dependencies": {
      "clap": "^1.0.9",
      "source-map": "^0.5.3"
    },
    "description": "CSSO (CSS Optimizer) is a CSS minifier with structural optimisations",
    "devDependencies": {
      "browserify": "^13.0.0",
      "coveralls": "^2.11.6",
      "eslint": "^2.2.0",
      "istanbul": "^0.4.2",
      "jscs": "~2.10.0",
      "mocha": "~2.4.2",
      "uglify-js": "^2.6.1"
    },
    "directories": {},
    "dist": {
      "shasum": "51fbb5347e50e81e6ed51668a48490ae6fe2afe2",
      "tarball": "https://registry.npmjs.org/csso/-/csso-2.2.1.tgz"
    },
    "engines": {
      "node": ">=0.10.0"
    },
    "eslintConfig": {
      "env": {
        "node": true,
        "mocha": true,
        "es6": true
      },
      "rules": {
        "no-duplicate-case": 2,
        "no-undef": 2,
        "no-unused-vars": [2, {
          "vars": "all",
          "args": "after-used"
        }]
      }
    },
    "files": ["bin", "dist/csso-browser.js", "lib", "HISTORY.md", "LICENSE", "README.md"],
    "gitHead": "62bf7207f117e4726decc8f1da272e77ac0f3ea5",
    "homepage": "https://github.com/css/csso",
    "keywords": ["css", "minifier", "minify", "compress", "optimisation"],
    "license": "MIT",
    "main": "./lib/index",
    "maintainers": [{
      "name": "afelix",
      "email": "skryzhanovsky@gmail.com"
    }, {
      "name": "lahmatiy",
      "email": "rdvornov@gmail.com"
    }, {
      "name": "tadatuta",
      "email": "i@tadatuta.com"
    }],
    "name": "csso",
    "optionalDependencies": {},
    "readme": "ERROR: No README data found!",
    "repository": {
      "type": "git",
      "url": "git+https://github.com/css/csso.git"
    },
    "scripts": {
      "browserify": "browserify --standalone csso lib/index.js | uglifyjs --compress --mangle -o dist/csso-browser.js",
      "codestyle": "jscs lib && eslint lib test",
      "codestyle-and-test": "npm run codestyle && npm test",
      "coverage": "istanbul cover _mocha -- -R dot",
      "coveralls": "istanbul cover _mocha --report lcovonly -- -R dot && cat ./coverage/lcov.info | coveralls",
      "gh-pages": "git clone -b gh-pages https://github.com/css/csso.git .gh-pages && npm run browserify && cp dist/csso-browser.js .gh-pages/ && cd .gh-pages && git commit -am \"update\" && git push && cd .. && rm -rf .gh-pages",
      "hydrogen": "node --trace-hydrogen --trace-phase=Z --trace-deopt --code-comments --hydrogen-track-positions --redirect-code-traces --redirect-code-traces-to=code.asm --trace_hydrogen_file=code.cfg --print-opt-code bin/csso --stat -o /dev/null",
      "prepublish": "npm run browserify",
      "test": "mocha --reporter dot",
      "travis": "npm run codestyle-and-test && npm run coveralls"
    },
    "version": "2.2.1"
  }.version,

  // classes
  List: _cssolibindexjs221_List,

  // main methods
  minify: _cssolibindexjs221_minifyStylesheet,
  minifyBlock: _cssolibindexjs221_minifyBlock,

  // step by step
  parse: _cssolibindexjs221_parse,
  compress: _cssolibindexjs221_compress,
  translate: _cssolibindexjs221_translate,
  translateWithSourceMap: _cssolibindexjs221_translateWithSourceMap,

  // walkers
  walk: _cssolibindexjs221_walkers.all,
  walkRules: _cssolibindexjs221_walkers.rules,
  walkRulesRight: _cssolibindexjs221_walkers.rulesRight,

  // utils
  clone: _cssolibindexjs221_clone
};
/*≠≠ node_modules/csso/lib/index.js ≠≠*/

/*== src/index.js ==*/
$m['src/index.js'] = { exports: {} };
'use strict';

const _srcindexjs_csso = $m['csso/lib/index.js#2.2.1'].exports;

module.exports = {
  name: 'csso',
  type: 'css',

  /**
   * Register plugin
   * @param {Config} config
   */
  register(config) {
    config.extendFileDefinitionForExtensionsOrType(_srcindexjs_extend, null, this.type);
  }
};

/**
 * Extend 'prototype' with new behaviour
 * @param {Object} prototype
 * @param {Object} utils
 */
function _srcindexjs_extend(prototype, utils) {
  const { debug, strong } = utils.cnsl;

  /**
   * Compress file contents
   * @param {Object} buildOptions
   *  - {Boolean} bootstrap
   *  - {Boolean} boilerplate
   *  - {Boolean} browser
   *  - {Boolean} bundle
   *  - {Boolean} compress
   *  - {Array} ignoredFiles
   *  - {Boolean} helpers
   *  - {Boolean} watchOnly
   * @param {Function} fn(err)
   * @returns {null}
   */
  prototype.compress = function compress(buildOptions, fn) {
    try {
      const options = this.options.pluginOptions.csso || {};
      const content = _srcindexjs_csso.minify(this.content, options).css;

      debug(`compress: ${ strong(this.relpath) }`, 4);
      this.content = content;
    } catch (err) {
      return fn(err);
    }
    fn();
  };
}
/*≠≠ src/index.js ≠≠*/