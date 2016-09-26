var $m = {};
!(function () {
/*== node_modules/lodash/_setToArray.js ==*/
$m['lodash/_setToArray.js#4.15.0'] = {};
/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function _lodashsetToArrayjs4150_setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function (value) {
    result[++index] = value;
  });
  return result;
}

$m['lodash/_setToArray.js#4.15.0'] = _lodashsetToArrayjs4150_setToArray;

/*== node_modules/lodash/noop.js ==*/
$m['lodash/noop.js#4.15.0'] = {};
/**
 * This method returns `undefined`.
 *
 * @static
 * @memberOf _
 * @since 2.3.0
 * @category Util
 * @example
 *
 * _.times(2, _.noop);
 * // => [undefined, undefined]
 */
function _lodashnoopjs4150_noop() {
  // No operation performed.
}

$m['lodash/noop.js#4.15.0'] = _lodashnoopjs4150_noop;

/*== node_modules/lodash/_freeGlobal.js ==*/
$m['lodash/_freeGlobal.js#4.15.0'] = {};
/** Detect free variable `global` from Node.js. */
var _lodashfreeGlobaljs4150_freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

$m['lodash/_freeGlobal.js#4.15.0'] = _lodashfreeGlobaljs4150_freeGlobal;

/*== node_modules/lodash/_root.js ==*/
$m['lodash/_root.js#4.15.0'] = {};
var _lodashrootjs4150_freeGlobal = $m['lodash/_freeGlobal.js#4.15.0'];

/** Detect free variable `self`. */
var _lodashrootjs4150_freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var _lodashrootjs4150_root = _lodashrootjs4150_freeGlobal || _lodashrootjs4150_freeSelf || Function('return this')();

$m['lodash/_root.js#4.15.0'] = _lodashrootjs4150_root;

/*== node_modules/lodash/_getValue.js ==*/
$m['lodash/_getValue.js#4.15.0'] = {};
/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function _lodashgetValuejs4150_getValue(object, key) {
  return object == null ? undefined : object[key];
}

$m['lodash/_getValue.js#4.15.0'] = _lodashgetValuejs4150_getValue;

/*== node_modules/lodash/_toSource.js ==*/
$m['lodash/_toSource.js#4.15.0'] = {};
/** Used for built-in method references. */
var _lodashtoSourcejs4150_funcProto = Function.prototype;

/** Used to resolve the decompiled source of functions. */
var _lodashtoSourcejs4150_funcToString = _lodashtoSourcejs4150_funcProto.toString;

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to process.
 * @returns {string} Returns the source code.
 */
function _lodashtoSourcejs4150_toSource(func) {
  if (func != null) {
    try {
      return _lodashtoSourcejs4150_funcToString.call(func);
    } catch (e) {}
    try {
      return func + '';
    } catch (e) {}
  }
  return '';
}

$m['lodash/_toSource.js#4.15.0'] = _lodashtoSourcejs4150_toSource;

/*== node_modules/lodash/isObject.js ==*/
$m['lodash/isObject.js#4.15.0'] = {};
/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function _lodashisObjectjs4150_isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

$m['lodash/isObject.js#4.15.0'] = _lodashisObjectjs4150_isObject;

/*== node_modules/lodash/_coreJsData.js ==*/
$m['lodash/_coreJsData.js#4.15.0'] = {};
var _lodashcoreJsDatajs4150_root = $m['lodash/_root.js#4.15.0'];

/** Used to detect overreaching core-js shims. */
var _lodashcoreJsDatajs4150_coreJsData = _lodashcoreJsDatajs4150_root['__core-js_shared__'];

$m['lodash/_coreJsData.js#4.15.0'] = _lodashcoreJsDatajs4150_coreJsData;

/*== node_modules/lodash/_isMasked.js ==*/
$m['lodash/_isMasked.js#4.15.0'] = {};
var _lodashisMaskedjs4150_coreJsData = $m['lodash/_coreJsData.js#4.15.0'];

/** Used to detect methods masquerading as native. */
var _lodashisMaskedjs4150_maskSrcKey = function () {
  var uid = /[^.]+$/.exec(_lodashisMaskedjs4150_coreJsData && _lodashisMaskedjs4150_coreJsData.keys && _lodashisMaskedjs4150_coreJsData.keys.IE_PROTO || '');
  return uid ? 'Symbol(src)_1.' + uid : '';
}();

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function _lodashisMaskedjs4150_isMasked(func) {
  return !!_lodashisMaskedjs4150_maskSrcKey && _lodashisMaskedjs4150_maskSrcKey in func;
}

$m['lodash/_isMasked.js#4.15.0'] = _lodashisMaskedjs4150_isMasked;

/*== node_modules/lodash/_isHostObject.js ==*/
$m['lodash/_isHostObject.js#4.15.0'] = {};
/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function _lodashisHostObjectjs4150_isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

$m['lodash/_isHostObject.js#4.15.0'] = _lodashisHostObjectjs4150_isHostObject;

/*== node_modules/lodash/isFunction.js ==*/
$m['lodash/isFunction.js#4.15.0'] = {};
var _lodashisFunctionjs4150_isObject = $m['lodash/isObject.js#4.15.0'];

/** `Object#toString` result references. */
var _lodashisFunctionjs4150_funcTag = '[object Function]',
    _lodashisFunctionjs4150_genTag = '[object GeneratorFunction]';

/** Used for built-in method references. */
var _lodashisFunctionjs4150_objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var _lodashisFunctionjs4150_objectToString = _lodashisFunctionjs4150_objectProto.toString;

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function _lodashisFunctionjs4150_isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = _lodashisFunctionjs4150_isObject(value) ? _lodashisFunctionjs4150_objectToString.call(value) : '';
  return tag == _lodashisFunctionjs4150_funcTag || tag == _lodashisFunctionjs4150_genTag;
}

$m['lodash/isFunction.js#4.15.0'] = _lodashisFunctionjs4150_isFunction;

/*== node_modules/lodash/_baseIsNative.js ==*/
$m['lodash/_baseIsNative.js#4.15.0'] = {};
var _lodashbaseIsNativejs4150_isFunction = $m['lodash/isFunction.js#4.15.0'],
    _lodashbaseIsNativejs4150_isHostObject = $m['lodash/_isHostObject.js#4.15.0'],
    _lodashbaseIsNativejs4150_isMasked = $m['lodash/_isMasked.js#4.15.0'],
    _lodashbaseIsNativejs4150_isObject = $m['lodash/isObject.js#4.15.0'],
    _lodashbaseIsNativejs4150_toSource = $m['lodash/_toSource.js#4.15.0'];

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var _lodashbaseIsNativejs4150_reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var _lodashbaseIsNativejs4150_reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used for built-in method references. */
var _lodashbaseIsNativejs4150_funcProto = Function.prototype,
    _lodashbaseIsNativejs4150_objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var _lodashbaseIsNativejs4150_funcToString = _lodashbaseIsNativejs4150_funcProto.toString;

/** Used to check objects for own properties. */
var _lodashbaseIsNativejs4150_hasOwnProperty = _lodashbaseIsNativejs4150_objectProto.hasOwnProperty;

/** Used to detect if a method is native. */
var _lodashbaseIsNativejs4150_reIsNative = RegExp('^' + _lodashbaseIsNativejs4150_funcToString.call(_lodashbaseIsNativejs4150_hasOwnProperty).replace(_lodashbaseIsNativejs4150_reRegExpChar, '\\$&').replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$');

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function _lodashbaseIsNativejs4150_baseIsNative(value) {
  if (!_lodashbaseIsNativejs4150_isObject(value) || _lodashbaseIsNativejs4150_isMasked(value)) {
    return false;
  }
  var pattern = _lodashbaseIsNativejs4150_isFunction(value) || _lodashbaseIsNativejs4150_isHostObject(value) ? _lodashbaseIsNativejs4150_reIsNative : _lodashbaseIsNativejs4150_reIsHostCtor;
  return pattern.test(_lodashbaseIsNativejs4150_toSource(value));
}

$m['lodash/_baseIsNative.js#4.15.0'] = _lodashbaseIsNativejs4150_baseIsNative;

/*== node_modules/lodash/_getNative.js ==*/
$m['lodash/_getNative.js#4.15.0'] = {};
var _lodashgetNativejs4150_baseIsNative = $m['lodash/_baseIsNative.js#4.15.0'],
    _lodashgetNativejs4150_getValue = $m['lodash/_getValue.js#4.15.0'];

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function _lodashgetNativejs4150_getNative(object, key) {
  var value = _lodashgetNativejs4150_getValue(object, key);
  return _lodashgetNativejs4150_baseIsNative(value) ? value : undefined;
}

$m['lodash/_getNative.js#4.15.0'] = _lodashgetNativejs4150_getNative;

/*== node_modules/lodash/_Set.js ==*/
$m['lodash/_Set.js#4.15.0'] = {};
var _lodashSetjs4150_getNative = $m['lodash/_getNative.js#4.15.0'],
    _lodashSetjs4150_root = $m['lodash/_root.js#4.15.0'];

/* Built-in method references that are verified to be native. */
var _lodashSetjs4150_Set = _lodashSetjs4150_getNative(_lodashSetjs4150_root, 'Set');

$m['lodash/_Set.js#4.15.0'] = _lodashSetjs4150_Set;

/*== node_modules/lodash/_createSet.js ==*/
$m['lodash/_createSet.js#4.15.0'] = {};
var _lodashcreateSetjs4150_Set = $m['lodash/_Set.js#4.15.0'],
    _lodashcreateSetjs4150_noop = $m['lodash/noop.js#4.15.0'],
    _lodashcreateSetjs4150_setToArray = $m['lodash/_setToArray.js#4.15.0'];

/** Used as references for various `Number` constants. */
var _lodashcreateSetjs4150_INFINITY = 1 / 0;

/**
 * Creates a set object of `values`.
 *
 * @private
 * @param {Array} values The values to add to the set.
 * @returns {Object} Returns the new set.
 */
var _lodashcreateSetjs4150_createSet = !(_lodashcreateSetjs4150_Set && 1 / _lodashcreateSetjs4150_setToArray(new _lodashcreateSetjs4150_Set([, -0]))[1] == _lodashcreateSetjs4150_INFINITY) ? _lodashcreateSetjs4150_noop : function (values) {
  return new _lodashcreateSetjs4150_Set(values);
};

$m['lodash/_createSet.js#4.15.0'] = _lodashcreateSetjs4150_createSet;

/*== node_modules/lodash/_cacheHas.js ==*/
$m['lodash/_cacheHas.js#4.15.0'] = {};
/**
 * Checks if a cache value for `key` exists.
 *
 * @private
 * @param {Object} cache The cache to query.
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function _lodashcacheHasjs4150_cacheHas(cache, key) {
  return cache.has(key);
}

$m['lodash/_cacheHas.js#4.15.0'] = _lodashcacheHasjs4150_cacheHas;

/*== node_modules/lodash/_arrayIncludesWith.js ==*/
$m['lodash/_arrayIncludesWith.js#4.15.0'] = {};
/**
 * This function is like `arrayIncludes` except that it accepts a comparator.
 *
 * @private
 * @param {Array} [array] The array to inspect.
 * @param {*} target The value to search for.
 * @param {Function} comparator The comparator invoked per element.
 * @returns {boolean} Returns `true` if `target` is found, else `false`.
 */
function _lodasharrayIncludesWithjs4150_arrayIncludesWith(array, value, comparator) {
  var index = -1,
      length = array ? array.length : 0;

  while (++index < length) {
    if (comparator(value, array[index])) {
      return true;
    }
  }
  return false;
}

$m['lodash/_arrayIncludesWith.js#4.15.0'] = _lodasharrayIncludesWithjs4150_arrayIncludesWith;

/*== node_modules/lodash/_baseIsNaN.js ==*/
$m['lodash/_baseIsNaN.js#4.15.0'] = {};
/**
 * The base implementation of `_.isNaN` without support for number objects.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
 */
function _lodashbaseIsNaNjs4150_baseIsNaN(value) {
  return value !== value;
}

$m['lodash/_baseIsNaN.js#4.15.0'] = _lodashbaseIsNaNjs4150_baseIsNaN;

/*== node_modules/lodash/_baseFindIndex.js ==*/
$m['lodash/_baseFindIndex.js#4.15.0'] = {};
/**
 * The base implementation of `_.findIndex` and `_.findLastIndex` without
 * support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} predicate The function invoked per iteration.
 * @param {number} fromIndex The index to search from.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function _lodashbaseFindIndexjs4150_baseFindIndex(array, predicate, fromIndex, fromRight) {
  var length = array.length,
      index = fromIndex + (fromRight ? 1 : -1);

  while (fromRight ? index-- : ++index < length) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }
  return -1;
}

$m['lodash/_baseFindIndex.js#4.15.0'] = _lodashbaseFindIndexjs4150_baseFindIndex;

/*== node_modules/lodash/_baseIndexOf.js ==*/
$m['lodash/_baseIndexOf.js#4.15.0'] = {};
var _lodashbaseIndexOfjs4150_baseFindIndex = $m['lodash/_baseFindIndex.js#4.15.0'],
    _lodashbaseIndexOfjs4150_baseIsNaN = $m['lodash/_baseIsNaN.js#4.15.0'];

/**
 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function _lodashbaseIndexOfjs4150_baseIndexOf(array, value, fromIndex) {
  if (value !== value) {
    return _lodashbaseIndexOfjs4150_baseFindIndex(array, _lodashbaseIndexOfjs4150_baseIsNaN, fromIndex);
  }
  var index = fromIndex - 1,
      length = array.length;

  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}

$m['lodash/_baseIndexOf.js#4.15.0'] = _lodashbaseIndexOfjs4150_baseIndexOf;

/*== node_modules/lodash/_arrayIncludes.js ==*/
$m['lodash/_arrayIncludes.js#4.15.0'] = {};
var _lodasharrayIncludesjs4150_baseIndexOf = $m['lodash/_baseIndexOf.js#4.15.0'];

/**
 * A specialized version of `_.includes` for arrays without support for
 * specifying an index to search from.
 *
 * @private
 * @param {Array} [array] The array to inspect.
 * @param {*} target The value to search for.
 * @returns {boolean} Returns `true` if `target` is found, else `false`.
 */
function _lodasharrayIncludesjs4150_arrayIncludes(array, value) {
  var length = array ? array.length : 0;
  return !!length && _lodasharrayIncludesjs4150_baseIndexOf(array, value, 0) > -1;
}

$m['lodash/_arrayIncludes.js#4.15.0'] = _lodasharrayIncludesjs4150_arrayIncludes;

/*== node_modules/lodash/_setCacheHas.js ==*/
$m['lodash/_setCacheHas.js#4.15.0'] = {};
/**
 * Checks if `value` is in the array cache.
 *
 * @private
 * @name has
 * @memberOf SetCache
 * @param {*} value The value to search for.
 * @returns {number} Returns `true` if `value` is found, else `false`.
 */
function _lodashsetCacheHasjs4150_setCacheHas(value) {
  return this.__data__.has(value);
}

$m['lodash/_setCacheHas.js#4.15.0'] = _lodashsetCacheHasjs4150_setCacheHas;

/*== node_modules/lodash/_setCacheAdd.js ==*/
$m['lodash/_setCacheAdd.js#4.15.0'] = {};
/** Used to stand-in for `undefined` hash values. */
var _lodashsetCacheAddjs4150_HASH_UNDEFINED = '__lodash_hash_undefined__';

/**
 * Adds `value` to the array cache.
 *
 * @private
 * @name add
 * @memberOf SetCache
 * @alias push
 * @param {*} value The value to cache.
 * @returns {Object} Returns the cache instance.
 */
function _lodashsetCacheAddjs4150_setCacheAdd(value) {
  this.__data__.set(value, _lodashsetCacheAddjs4150_HASH_UNDEFINED);
  return this;
}

$m['lodash/_setCacheAdd.js#4.15.0'] = _lodashsetCacheAddjs4150_setCacheAdd;

/*== node_modules/lodash/_isKeyable.js ==*/
$m['lodash/_isKeyable.js#4.15.0'] = {};
/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function _lodashisKeyablejs4150_isKeyable(value) {
  var type = typeof value;
  return type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean' ? value !== '__proto__' : value === null;
}

$m['lodash/_isKeyable.js#4.15.0'] = _lodashisKeyablejs4150_isKeyable;

/*== node_modules/lodash/_getMapData.js ==*/
$m['lodash/_getMapData.js#4.15.0'] = {};
var _lodashgetMapDatajs4150_isKeyable = $m['lodash/_isKeyable.js#4.15.0'];

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function _lodashgetMapDatajs4150_getMapData(map, key) {
  var data = map.__data__;
  return _lodashgetMapDatajs4150_isKeyable(key) ? data[typeof key == 'string' ? 'string' : 'hash'] : data.map;
}

$m['lodash/_getMapData.js#4.15.0'] = _lodashgetMapDatajs4150_getMapData;

/*== node_modules/lodash/_mapCacheSet.js ==*/
$m['lodash/_mapCacheSet.js#4.15.0'] = {};
var _lodashmapCacheSetjs4150_getMapData = $m['lodash/_getMapData.js#4.15.0'];

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function _lodashmapCacheSetjs4150_mapCacheSet(key, value) {
  _lodashmapCacheSetjs4150_getMapData(this, key).set(key, value);
  return this;
}

$m['lodash/_mapCacheSet.js#4.15.0'] = _lodashmapCacheSetjs4150_mapCacheSet;

/*== node_modules/lodash/_mapCacheHas.js ==*/
$m['lodash/_mapCacheHas.js#4.15.0'] = {};
var _lodashmapCacheHasjs4150_getMapData = $m['lodash/_getMapData.js#4.15.0'];

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function _lodashmapCacheHasjs4150_mapCacheHas(key) {
  return _lodashmapCacheHasjs4150_getMapData(this, key).has(key);
}

$m['lodash/_mapCacheHas.js#4.15.0'] = _lodashmapCacheHasjs4150_mapCacheHas;

/*== node_modules/lodash/_mapCacheGet.js ==*/
$m['lodash/_mapCacheGet.js#4.15.0'] = {};
var _lodashmapCacheGetjs4150_getMapData = $m['lodash/_getMapData.js#4.15.0'];

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function _lodashmapCacheGetjs4150_mapCacheGet(key) {
  return _lodashmapCacheGetjs4150_getMapData(this, key).get(key);
}

$m['lodash/_mapCacheGet.js#4.15.0'] = _lodashmapCacheGetjs4150_mapCacheGet;

/*== node_modules/lodash/_mapCacheDelete.js ==*/
$m['lodash/_mapCacheDelete.js#4.15.0'] = {};
var _lodashmapCacheDeletejs4150_getMapData = $m['lodash/_getMapData.js#4.15.0'];

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function _lodashmapCacheDeletejs4150_mapCacheDelete(key) {
  return _lodashmapCacheDeletejs4150_getMapData(this, key)['delete'](key);
}

$m['lodash/_mapCacheDelete.js#4.15.0'] = _lodashmapCacheDeletejs4150_mapCacheDelete;

/*== node_modules/lodash/_Map.js ==*/
$m['lodash/_Map.js#4.15.0'] = {};
var _lodashMapjs4150_getNative = $m['lodash/_getNative.js#4.15.0'],
    _lodashMapjs4150_root = $m['lodash/_root.js#4.15.0'];

/* Built-in method references that are verified to be native. */
var _lodashMapjs4150_Map = _lodashMapjs4150_getNative(_lodashMapjs4150_root, 'Map');

$m['lodash/_Map.js#4.15.0'] = _lodashMapjs4150_Map;

/*== node_modules/lodash/eq.js ==*/
$m['lodash/eq.js#4.15.0'] = {};
/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function _lodasheqjs4150_eq(value, other) {
  return value === other || value !== value && other !== other;
}

$m['lodash/eq.js#4.15.0'] = _lodasheqjs4150_eq;

/*== node_modules/lodash/_assocIndexOf.js ==*/
$m['lodash/_assocIndexOf.js#4.15.0'] = {};
var _lodashassocIndexOfjs4150_eq = $m['lodash/eq.js#4.15.0'];

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function _lodashassocIndexOfjs4150_assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (_lodashassocIndexOfjs4150_eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

$m['lodash/_assocIndexOf.js#4.15.0'] = _lodashassocIndexOfjs4150_assocIndexOf;

/*== node_modules/lodash/_listCacheSet.js ==*/
$m['lodash/_listCacheSet.js#4.15.0'] = {};
var _lodashlistCacheSetjs4150_assocIndexOf = $m['lodash/_assocIndexOf.js#4.15.0'];

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function _lodashlistCacheSetjs4150_listCacheSet(key, value) {
  var data = this.__data__,
      index = _lodashlistCacheSetjs4150_assocIndexOf(data, key);

  if (index < 0) {
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

$m['lodash/_listCacheSet.js#4.15.0'] = _lodashlistCacheSetjs4150_listCacheSet;

/*== node_modules/lodash/_listCacheHas.js ==*/
$m['lodash/_listCacheHas.js#4.15.0'] = {};
var _lodashlistCacheHasjs4150_assocIndexOf = $m['lodash/_assocIndexOf.js#4.15.0'];

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function _lodashlistCacheHasjs4150_listCacheHas(key) {
  return _lodashlistCacheHasjs4150_assocIndexOf(this.__data__, key) > -1;
}

$m['lodash/_listCacheHas.js#4.15.0'] = _lodashlistCacheHasjs4150_listCacheHas;

/*== node_modules/lodash/_listCacheGet.js ==*/
$m['lodash/_listCacheGet.js#4.15.0'] = {};
var _lodashlistCacheGetjs4150_assocIndexOf = $m['lodash/_assocIndexOf.js#4.15.0'];

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function _lodashlistCacheGetjs4150_listCacheGet(key) {
  var data = this.__data__,
      index = _lodashlistCacheGetjs4150_assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

$m['lodash/_listCacheGet.js#4.15.0'] = _lodashlistCacheGetjs4150_listCacheGet;

/*== node_modules/lodash/_listCacheDelete.js ==*/
$m['lodash/_listCacheDelete.js#4.15.0'] = {};
var _lodashlistCacheDeletejs4150_assocIndexOf = $m['lodash/_assocIndexOf.js#4.15.0'];

/** Used for built-in method references. */
var _lodashlistCacheDeletejs4150_arrayProto = Array.prototype;

/** Built-in value references. */
var _lodashlistCacheDeletejs4150_splice = _lodashlistCacheDeletejs4150_arrayProto.splice;

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function _lodashlistCacheDeletejs4150_listCacheDelete(key) {
  var data = this.__data__,
      index = _lodashlistCacheDeletejs4150_assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    _lodashlistCacheDeletejs4150_splice.call(data, index, 1);
  }
  return true;
}

$m['lodash/_listCacheDelete.js#4.15.0'] = _lodashlistCacheDeletejs4150_listCacheDelete;

/*== node_modules/lodash/_listCacheClear.js ==*/
$m['lodash/_listCacheClear.js#4.15.0'] = {};
/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function _lodashlistCacheClearjs4150_listCacheClear() {
  this.__data__ = [];
}

$m['lodash/_listCacheClear.js#4.15.0'] = _lodashlistCacheClearjs4150_listCacheClear;

/*== node_modules/lodash/_ListCache.js ==*/
$m['lodash/_ListCache.js#4.15.0'] = {};
var _lodashListCachejs4150_listCacheClear = $m['lodash/_listCacheClear.js#4.15.0'],
    _lodashListCachejs4150_listCacheDelete = $m['lodash/_listCacheDelete.js#4.15.0'],
    _lodashListCachejs4150_listCacheGet = $m['lodash/_listCacheGet.js#4.15.0'],
    _lodashListCachejs4150_listCacheHas = $m['lodash/_listCacheHas.js#4.15.0'],
    _lodashListCachejs4150_listCacheSet = $m['lodash/_listCacheSet.js#4.15.0'];

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function _lodashListCachejs4150_ListCache(entries) {
    var index = -1,
        length = entries ? entries.length : 0;

    this.clear();
    while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
    }
}

// Add methods to `ListCache`.
_lodashListCachejs4150_ListCache.prototype.clear = _lodashListCachejs4150_listCacheClear;
_lodashListCachejs4150_ListCache.prototype['delete'] = _lodashListCachejs4150_listCacheDelete;
_lodashListCachejs4150_ListCache.prototype.get = _lodashListCachejs4150_listCacheGet;
_lodashListCachejs4150_ListCache.prototype.has = _lodashListCachejs4150_listCacheHas;
_lodashListCachejs4150_ListCache.prototype.set = _lodashListCachejs4150_listCacheSet;

$m['lodash/_ListCache.js#4.15.0'] = _lodashListCachejs4150_ListCache;

/*== node_modules/lodash/_nativeCreate.js ==*/
$m['lodash/_nativeCreate.js#4.15.0'] = {};
var _lodashnativeCreatejs4150_getNative = $m['lodash/_getNative.js#4.15.0'];

/* Built-in method references that are verified to be native. */
var _lodashnativeCreatejs4150_nativeCreate = _lodashnativeCreatejs4150_getNative(Object, 'create');

$m['lodash/_nativeCreate.js#4.15.0'] = _lodashnativeCreatejs4150_nativeCreate;

/*== node_modules/lodash/_hashSet.js ==*/
$m['lodash/_hashSet.js#4.15.0'] = {};
var _lodashhashSetjs4150_nativeCreate = $m['lodash/_nativeCreate.js#4.15.0'];

/** Used to stand-in for `undefined` hash values. */
var _lodashhashSetjs4150_HASH_UNDEFINED = '__lodash_hash_undefined__';

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function _lodashhashSetjs4150_hashSet(key, value) {
  var data = this.__data__;
  data[key] = _lodashhashSetjs4150_nativeCreate && value === undefined ? _lodashhashSetjs4150_HASH_UNDEFINED : value;
  return this;
}

$m['lodash/_hashSet.js#4.15.0'] = _lodashhashSetjs4150_hashSet;

/*== node_modules/lodash/_hashHas.js ==*/
$m['lodash/_hashHas.js#4.15.0'] = {};
var _lodashhashHasjs4150_nativeCreate = $m['lodash/_nativeCreate.js#4.15.0'];

/** Used for built-in method references. */
var _lodashhashHasjs4150_objectProto = Object.prototype;

/** Used to check objects for own properties. */
var _lodashhashHasjs4150_hasOwnProperty = _lodashhashHasjs4150_objectProto.hasOwnProperty;

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function _lodashhashHasjs4150_hashHas(key) {
  var data = this.__data__;
  return _lodashhashHasjs4150_nativeCreate ? data[key] !== undefined : _lodashhashHasjs4150_hasOwnProperty.call(data, key);
}

$m['lodash/_hashHas.js#4.15.0'] = _lodashhashHasjs4150_hashHas;

/*== node_modules/lodash/_hashGet.js ==*/
$m['lodash/_hashGet.js#4.15.0'] = {};
var _lodashhashGetjs4150_nativeCreate = $m['lodash/_nativeCreate.js#4.15.0'];

/** Used to stand-in for `undefined` hash values. */
var _lodashhashGetjs4150_HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used for built-in method references. */
var _lodashhashGetjs4150_objectProto = Object.prototype;

/** Used to check objects for own properties. */
var _lodashhashGetjs4150_hasOwnProperty = _lodashhashGetjs4150_objectProto.hasOwnProperty;

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function _lodashhashGetjs4150_hashGet(key) {
  var data = this.__data__;
  if (_lodashhashGetjs4150_nativeCreate) {
    var result = data[key];
    return result === _lodashhashGetjs4150_HASH_UNDEFINED ? undefined : result;
  }
  return _lodashhashGetjs4150_hasOwnProperty.call(data, key) ? data[key] : undefined;
}

$m['lodash/_hashGet.js#4.15.0'] = _lodashhashGetjs4150_hashGet;

/*== node_modules/lodash/_hashDelete.js ==*/
$m['lodash/_hashDelete.js#4.15.0'] = {};
/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function _lodashhashDeletejs4150_hashDelete(key) {
  return this.has(key) && delete this.__data__[key];
}

$m['lodash/_hashDelete.js#4.15.0'] = _lodashhashDeletejs4150_hashDelete;

/*== node_modules/lodash/_hashClear.js ==*/
$m['lodash/_hashClear.js#4.15.0'] = {};
var _lodashhashClearjs4150_nativeCreate = $m['lodash/_nativeCreate.js#4.15.0'];

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function _lodashhashClearjs4150_hashClear() {
  this.__data__ = _lodashhashClearjs4150_nativeCreate ? _lodashhashClearjs4150_nativeCreate(null) : {};
}

$m['lodash/_hashClear.js#4.15.0'] = _lodashhashClearjs4150_hashClear;

/*== node_modules/lodash/_Hash.js ==*/
$m['lodash/_Hash.js#4.15.0'] = {};
var _lodashHashjs4150_hashClear = $m['lodash/_hashClear.js#4.15.0'],
    _lodashHashjs4150_hashDelete = $m['lodash/_hashDelete.js#4.15.0'],
    _lodashHashjs4150_hashGet = $m['lodash/_hashGet.js#4.15.0'],
    _lodashHashjs4150_hashHas = $m['lodash/_hashHas.js#4.15.0'],
    _lodashHashjs4150_hashSet = $m['lodash/_hashSet.js#4.15.0'];

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function _lodashHashjs4150_Hash(entries) {
    var index = -1,
        length = entries ? entries.length : 0;

    this.clear();
    while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
    }
}

// Add methods to `Hash`.
_lodashHashjs4150_Hash.prototype.clear = _lodashHashjs4150_hashClear;
_lodashHashjs4150_Hash.prototype['delete'] = _lodashHashjs4150_hashDelete;
_lodashHashjs4150_Hash.prototype.get = _lodashHashjs4150_hashGet;
_lodashHashjs4150_Hash.prototype.has = _lodashHashjs4150_hashHas;
_lodashHashjs4150_Hash.prototype.set = _lodashHashjs4150_hashSet;

$m['lodash/_Hash.js#4.15.0'] = _lodashHashjs4150_Hash;

/*== node_modules/lodash/_mapCacheClear.js ==*/
$m['lodash/_mapCacheClear.js#4.15.0'] = {};
var _lodashmapCacheClearjs4150_Hash = $m['lodash/_Hash.js#4.15.0'],
    _lodashmapCacheClearjs4150_ListCache = $m['lodash/_ListCache.js#4.15.0'],
    _lodashmapCacheClearjs4150_Map = $m['lodash/_Map.js#4.15.0'];

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function _lodashmapCacheClearjs4150_mapCacheClear() {
  this.__data__ = {
    'hash': new _lodashmapCacheClearjs4150_Hash(),
    'map': new (_lodashmapCacheClearjs4150_Map || _lodashmapCacheClearjs4150_ListCache)(),
    'string': new _lodashmapCacheClearjs4150_Hash()
  };
}

$m['lodash/_mapCacheClear.js#4.15.0'] = _lodashmapCacheClearjs4150_mapCacheClear;

/*== node_modules/lodash/_MapCache.js ==*/
$m['lodash/_MapCache.js#4.15.0'] = {};
var _lodashMapCachejs4150_mapCacheClear = $m['lodash/_mapCacheClear.js#4.15.0'],
    _lodashMapCachejs4150_mapCacheDelete = $m['lodash/_mapCacheDelete.js#4.15.0'],
    _lodashMapCachejs4150_mapCacheGet = $m['lodash/_mapCacheGet.js#4.15.0'],
    _lodashMapCachejs4150_mapCacheHas = $m['lodash/_mapCacheHas.js#4.15.0'],
    _lodashMapCachejs4150_mapCacheSet = $m['lodash/_mapCacheSet.js#4.15.0'];

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function _lodashMapCachejs4150_MapCache(entries) {
    var index = -1,
        length = entries ? entries.length : 0;

    this.clear();
    while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
    }
}

// Add methods to `MapCache`.
_lodashMapCachejs4150_MapCache.prototype.clear = _lodashMapCachejs4150_mapCacheClear;
_lodashMapCachejs4150_MapCache.prototype['delete'] = _lodashMapCachejs4150_mapCacheDelete;
_lodashMapCachejs4150_MapCache.prototype.get = _lodashMapCachejs4150_mapCacheGet;
_lodashMapCachejs4150_MapCache.prototype.has = _lodashMapCachejs4150_mapCacheHas;
_lodashMapCachejs4150_MapCache.prototype.set = _lodashMapCachejs4150_mapCacheSet;

$m['lodash/_MapCache.js#4.15.0'] = _lodashMapCachejs4150_MapCache;

/*== node_modules/lodash/_SetCache.js ==*/
$m['lodash/_SetCache.js#4.15.0'] = {};
var _lodashSetCachejs4150_MapCache = $m['lodash/_MapCache.js#4.15.0'],
    _lodashSetCachejs4150_setCacheAdd = $m['lodash/_setCacheAdd.js#4.15.0'],
    _lodashSetCachejs4150_setCacheHas = $m['lodash/_setCacheHas.js#4.15.0'];

/**
 *
 * Creates an array cache object to store unique values.
 *
 * @private
 * @constructor
 * @param {Array} [values] The values to cache.
 */
function _lodashSetCachejs4150_SetCache(values) {
    var index = -1,
        length = values ? values.length : 0;

    this.__data__ = new _lodashSetCachejs4150_MapCache();
    while (++index < length) {
        this.add(values[index]);
    }
}

// Add methods to `SetCache`.
_lodashSetCachejs4150_SetCache.prototype.add = _lodashSetCachejs4150_SetCache.prototype.push = _lodashSetCachejs4150_setCacheAdd;
_lodashSetCachejs4150_SetCache.prototype.has = _lodashSetCachejs4150_setCacheHas;

$m['lodash/_SetCache.js#4.15.0'] = _lodashSetCachejs4150_SetCache;

/*== node_modules/lodash/_baseUniq.js ==*/
$m['lodash/_baseUniq.js#4.15.0'] = {};
var _lodashbaseUniqjs4150_SetCache = $m['lodash/_SetCache.js#4.15.0'],
    _lodashbaseUniqjs4150_arrayIncludes = $m['lodash/_arrayIncludes.js#4.15.0'],
    _lodashbaseUniqjs4150_arrayIncludesWith = $m['lodash/_arrayIncludesWith.js#4.15.0'],
    _lodashbaseUniqjs4150_cacheHas = $m['lodash/_cacheHas.js#4.15.0'],
    _lodashbaseUniqjs4150_createSet = $m['lodash/_createSet.js#4.15.0'],
    _lodashbaseUniqjs4150_setToArray = $m['lodash/_setToArray.js#4.15.0'];

/** Used as the size to enable large array optimizations. */
var _lodashbaseUniqjs4150_LARGE_ARRAY_SIZE = 200;

/**
 * The base implementation of `_.uniqBy` without support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} [iteratee] The iteratee invoked per element.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns the new duplicate free array.
 */
function _lodashbaseUniqjs4150_baseUniq(array, iteratee, comparator) {
  var index = -1,
      includes = _lodashbaseUniqjs4150_arrayIncludes,
      length = array.length,
      isCommon = true,
      result = [],
      seen = result;

  if (comparator) {
    isCommon = false;
    includes = _lodashbaseUniqjs4150_arrayIncludesWith;
  } else if (length >= _lodashbaseUniqjs4150_LARGE_ARRAY_SIZE) {
    var set = iteratee ? null : _lodashbaseUniqjs4150_createSet(array);
    if (set) {
      return _lodashbaseUniqjs4150_setToArray(set);
    }
    isCommon = false;
    includes = _lodashbaseUniqjs4150_cacheHas;
    seen = new _lodashbaseUniqjs4150_SetCache();
  } else {
    seen = iteratee ? [] : result;
  }
  outer: while (++index < length) {
    var value = array[index],
        computed = iteratee ? iteratee(value) : value;

    value = comparator || value !== 0 ? value : 0;
    if (isCommon && computed === computed) {
      var seenIndex = seen.length;
      while (seenIndex--) {
        if (seen[seenIndex] === computed) {
          continue outer;
        }
      }
      if (iteratee) {
        seen.push(computed);
      }
      result.push(value);
    } else if (!includes(seen, computed, comparator)) {
      if (seen !== result) {
        seen.push(computed);
      }
      result.push(value);
    }
  }
  return result;
}

$m['lodash/_baseUniq.js#4.15.0'] = _lodashbaseUniqjs4150_baseUniq;

/*== node_modules/lodash/uniqWith.js ==*/
$m['lodash/uniqWith.js#4.15.0'] = {};
var _lodashuniqWithjs4150_baseUniq = $m['lodash/_baseUniq.js#4.15.0'];

/**
 * This method is like `_.uniq` except that it accepts `comparator` which
 * is invoked to compare elements of `array`. The comparator is invoked with
 * two arguments: (arrVal, othVal).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Array
 * @param {Array} array The array to inspect.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns the new duplicate free array.
 * @example
 *
 * var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }, { 'x': 1, 'y': 2 }];
 *
 * _.uniqWith(objects, _.isEqual);
 * // => [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }]
 */
function _lodashuniqWithjs4150_uniqWith(array, comparator) {
  return array && array.length ? _lodashuniqWithjs4150_baseUniq(array, undefined, comparator) : [];
}

$m['lodash/uniqWith.js#4.15.0'] = _lodashuniqWithjs4150_uniqWith;

/*== node_modules/lodash/isObjectLike.js ==*/
$m['lodash/isObjectLike.js#4.15.0'] = {};
/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function _lodashisObjectLikejs4150_isObjectLike(value) {
  return !!value && typeof value == 'object';
}

$m['lodash/isObjectLike.js#4.15.0'] = _lodashisObjectLikejs4150_isObjectLike;

/*== node_modules/lodash/_nodeUtil.js ==*/
$m['lodash/_nodeUtil.js#4.15.0'] = {};
var _lodashnodeUtiljs4150_freeGlobal = $m['lodash/_freeGlobal.js#4.15.0'];

/** Detect free variable `exports`. */
var _lodashnodeUtiljs4150_freeExports = typeof exports == 'object' && exports && !$m['lodash/_nodeUtil.js#4.15.0'].nodeType && exports;

/** Detect free variable `module`. */
var _lodashnodeUtiljs4150_freeModule = _lodashnodeUtiljs4150_freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var _lodashnodeUtiljs4150_moduleExports = _lodashnodeUtiljs4150_freeModule && _lodashnodeUtiljs4150_freeModule.exports === _lodashnodeUtiljs4150_freeExports;

/** Detect free variable `process` from Node.js. */
var _lodashnodeUtiljs4150_freeProcess = _lodashnodeUtiljs4150_moduleExports && _lodashnodeUtiljs4150_freeGlobal.process;

/** Used to access faster Node.js helpers. */
var _lodashnodeUtiljs4150_nodeUtil = function () {
  try {
    return _lodashnodeUtiljs4150_freeProcess && _lodashnodeUtiljs4150_freeProcess.binding('util');
  } catch (e) {}
}();

$m['lodash/_nodeUtil.js#4.15.0'] = _lodashnodeUtiljs4150_nodeUtil;

/*== node_modules/lodash/_baseUnary.js ==*/
$m['lodash/_baseUnary.js#4.15.0'] = {};
/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function _lodashbaseUnaryjs4150_baseUnary(func) {
  return function (value) {
    return func(value);
  };
}

$m['lodash/_baseUnary.js#4.15.0'] = _lodashbaseUnaryjs4150_baseUnary;

/*== node_modules/lodash/isLength.js ==*/
$m['lodash/isLength.js#4.15.0'] = {};
/** Used as references for various `Number` constants. */
var _lodashisLengthjs4150_MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function _lodashisLengthjs4150_isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= _lodashisLengthjs4150_MAX_SAFE_INTEGER;
}

$m['lodash/isLength.js#4.15.0'] = _lodashisLengthjs4150_isLength;

/*== node_modules/lodash/_baseIsTypedArray.js ==*/
$m['lodash/_baseIsTypedArray.js#4.15.0'] = {};
var _lodashbaseIsTypedArrayjs4150_isLength = $m['lodash/isLength.js#4.15.0'],
    _lodashbaseIsTypedArrayjs4150_isObjectLike = $m['lodash/isObjectLike.js#4.15.0'];

/** `Object#toString` result references. */
var _lodashbaseIsTypedArrayjs4150_argsTag = '[object Arguments]',
    _lodashbaseIsTypedArrayjs4150_arrayTag = '[object Array]',
    _lodashbaseIsTypedArrayjs4150_boolTag = '[object Boolean]',
    _lodashbaseIsTypedArrayjs4150_dateTag = '[object Date]',
    _lodashbaseIsTypedArrayjs4150_errorTag = '[object Error]',
    _lodashbaseIsTypedArrayjs4150_funcTag = '[object Function]',
    _lodashbaseIsTypedArrayjs4150_mapTag = '[object Map]',
    _lodashbaseIsTypedArrayjs4150_numberTag = '[object Number]',
    _lodashbaseIsTypedArrayjs4150_objectTag = '[object Object]',
    _lodashbaseIsTypedArrayjs4150_regexpTag = '[object RegExp]',
    _lodashbaseIsTypedArrayjs4150_setTag = '[object Set]',
    _lodashbaseIsTypedArrayjs4150_stringTag = '[object String]',
    _lodashbaseIsTypedArrayjs4150_weakMapTag = '[object WeakMap]';

var _lodashbaseIsTypedArrayjs4150_arrayBufferTag = '[object ArrayBuffer]',
    _lodashbaseIsTypedArrayjs4150_dataViewTag = '[object DataView]',
    _lodashbaseIsTypedArrayjs4150_float32Tag = '[object Float32Array]',
    _lodashbaseIsTypedArrayjs4150_float64Tag = '[object Float64Array]',
    _lodashbaseIsTypedArrayjs4150_int8Tag = '[object Int8Array]',
    _lodashbaseIsTypedArrayjs4150_int16Tag = '[object Int16Array]',
    _lodashbaseIsTypedArrayjs4150_int32Tag = '[object Int32Array]',
    _lodashbaseIsTypedArrayjs4150_uint8Tag = '[object Uint8Array]',
    _lodashbaseIsTypedArrayjs4150_uint8ClampedTag = '[object Uint8ClampedArray]',
    _lodashbaseIsTypedArrayjs4150_uint16Tag = '[object Uint16Array]',
    _lodashbaseIsTypedArrayjs4150_uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var _lodashbaseIsTypedArrayjs4150_typedArrayTags = {};
_lodashbaseIsTypedArrayjs4150_typedArrayTags[_lodashbaseIsTypedArrayjs4150_float32Tag] = _lodashbaseIsTypedArrayjs4150_typedArrayTags[_lodashbaseIsTypedArrayjs4150_float64Tag] = _lodashbaseIsTypedArrayjs4150_typedArrayTags[_lodashbaseIsTypedArrayjs4150_int8Tag] = _lodashbaseIsTypedArrayjs4150_typedArrayTags[_lodashbaseIsTypedArrayjs4150_int16Tag] = _lodashbaseIsTypedArrayjs4150_typedArrayTags[_lodashbaseIsTypedArrayjs4150_int32Tag] = _lodashbaseIsTypedArrayjs4150_typedArrayTags[_lodashbaseIsTypedArrayjs4150_uint8Tag] = _lodashbaseIsTypedArrayjs4150_typedArrayTags[_lodashbaseIsTypedArrayjs4150_uint8ClampedTag] = _lodashbaseIsTypedArrayjs4150_typedArrayTags[_lodashbaseIsTypedArrayjs4150_uint16Tag] = _lodashbaseIsTypedArrayjs4150_typedArrayTags[_lodashbaseIsTypedArrayjs4150_uint32Tag] = true;
_lodashbaseIsTypedArrayjs4150_typedArrayTags[_lodashbaseIsTypedArrayjs4150_argsTag] = _lodashbaseIsTypedArrayjs4150_typedArrayTags[_lodashbaseIsTypedArrayjs4150_arrayTag] = _lodashbaseIsTypedArrayjs4150_typedArrayTags[_lodashbaseIsTypedArrayjs4150_arrayBufferTag] = _lodashbaseIsTypedArrayjs4150_typedArrayTags[_lodashbaseIsTypedArrayjs4150_boolTag] = _lodashbaseIsTypedArrayjs4150_typedArrayTags[_lodashbaseIsTypedArrayjs4150_dataViewTag] = _lodashbaseIsTypedArrayjs4150_typedArrayTags[_lodashbaseIsTypedArrayjs4150_dateTag] = _lodashbaseIsTypedArrayjs4150_typedArrayTags[_lodashbaseIsTypedArrayjs4150_errorTag] = _lodashbaseIsTypedArrayjs4150_typedArrayTags[_lodashbaseIsTypedArrayjs4150_funcTag] = _lodashbaseIsTypedArrayjs4150_typedArrayTags[_lodashbaseIsTypedArrayjs4150_mapTag] = _lodashbaseIsTypedArrayjs4150_typedArrayTags[_lodashbaseIsTypedArrayjs4150_numberTag] = _lodashbaseIsTypedArrayjs4150_typedArrayTags[_lodashbaseIsTypedArrayjs4150_objectTag] = _lodashbaseIsTypedArrayjs4150_typedArrayTags[_lodashbaseIsTypedArrayjs4150_regexpTag] = _lodashbaseIsTypedArrayjs4150_typedArrayTags[_lodashbaseIsTypedArrayjs4150_setTag] = _lodashbaseIsTypedArrayjs4150_typedArrayTags[_lodashbaseIsTypedArrayjs4150_stringTag] = _lodashbaseIsTypedArrayjs4150_typedArrayTags[_lodashbaseIsTypedArrayjs4150_weakMapTag] = false;

/** Used for built-in method references. */
var _lodashbaseIsTypedArrayjs4150_objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var _lodashbaseIsTypedArrayjs4150_objectToString = _lodashbaseIsTypedArrayjs4150_objectProto.toString;

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function _lodashbaseIsTypedArrayjs4150_baseIsTypedArray(value) {
    return _lodashbaseIsTypedArrayjs4150_isObjectLike(value) && _lodashbaseIsTypedArrayjs4150_isLength(value.length) && !!_lodashbaseIsTypedArrayjs4150_typedArrayTags[_lodashbaseIsTypedArrayjs4150_objectToString.call(value)];
}

$m['lodash/_baseIsTypedArray.js#4.15.0'] = _lodashbaseIsTypedArrayjs4150_baseIsTypedArray;

/*== node_modules/lodash/isTypedArray.js ==*/
$m['lodash/isTypedArray.js#4.15.0'] = {};
var _lodashisTypedArrayjs4150_baseIsTypedArray = $m['lodash/_baseIsTypedArray.js#4.15.0'],
    _lodashisTypedArrayjs4150_baseUnary = $m['lodash/_baseUnary.js#4.15.0'],
    _lodashisTypedArrayjs4150_nodeUtil = $m['lodash/_nodeUtil.js#4.15.0'];

/* Node.js helper references. */
var _lodashisTypedArrayjs4150_nodeIsTypedArray = _lodashisTypedArrayjs4150_nodeUtil && _lodashisTypedArrayjs4150_nodeUtil.isTypedArray;

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var _lodashisTypedArrayjs4150_isTypedArray = _lodashisTypedArrayjs4150_nodeIsTypedArray ? _lodashisTypedArrayjs4150_baseUnary(_lodashisTypedArrayjs4150_nodeIsTypedArray) : _lodashisTypedArrayjs4150_baseIsTypedArray;

$m['lodash/isTypedArray.js#4.15.0'] = _lodashisTypedArrayjs4150_isTypedArray;

/*== node_modules/lodash/isArray.js ==*/
$m['lodash/isArray.js#4.15.0'] = {};
/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var _lodashisArrayjs4150_isArray = Array.isArray;

$m['lodash/isArray.js#4.15.0'] = _lodashisArrayjs4150_isArray;

/*== node_modules/lodash/_baseGetTag.js ==*/
$m['lodash/_baseGetTag.js#4.15.0'] = {};
/** Used for built-in method references. */
var _lodashbaseGetTagjs4150_objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var _lodashbaseGetTagjs4150_objectToString = _lodashbaseGetTagjs4150_objectProto.toString;

/**
 * The base implementation of `getTag`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function _lodashbaseGetTagjs4150_baseGetTag(value) {
  return _lodashbaseGetTagjs4150_objectToString.call(value);
}

$m['lodash/_baseGetTag.js#4.15.0'] = _lodashbaseGetTagjs4150_baseGetTag;

/*== node_modules/lodash/_WeakMap.js ==*/
$m['lodash/_WeakMap.js#4.15.0'] = {};
var _lodashWeakMapjs4150_getNative = $m['lodash/_getNative.js#4.15.0'],
    _lodashWeakMapjs4150_root = $m['lodash/_root.js#4.15.0'];

/* Built-in method references that are verified to be native. */
var _lodashWeakMapjs4150_WeakMap = _lodashWeakMapjs4150_getNative(_lodashWeakMapjs4150_root, 'WeakMap');

$m['lodash/_WeakMap.js#4.15.0'] = _lodashWeakMapjs4150_WeakMap;

/*== node_modules/lodash/_Promise.js ==*/
$m['lodash/_Promise.js#4.15.0'] = {};
var _lodashPromisejs4150_getNative = $m['lodash/_getNative.js#4.15.0'],
    _lodashPromisejs4150_root = $m['lodash/_root.js#4.15.0'];

/* Built-in method references that are verified to be native. */
var _lodashPromisejs4150_Promise = _lodashPromisejs4150_getNative(_lodashPromisejs4150_root, 'Promise');

$m['lodash/_Promise.js#4.15.0'] = _lodashPromisejs4150_Promise;

/*== node_modules/lodash/_DataView.js ==*/
$m['lodash/_DataView.js#4.15.0'] = {};
var _lodashDataViewjs4150_getNative = $m['lodash/_getNative.js#4.15.0'],
    _lodashDataViewjs4150_root = $m['lodash/_root.js#4.15.0'];

/* Built-in method references that are verified to be native. */
var _lodashDataViewjs4150_DataView = _lodashDataViewjs4150_getNative(_lodashDataViewjs4150_root, 'DataView');

$m['lodash/_DataView.js#4.15.0'] = _lodashDataViewjs4150_DataView;

/*== node_modules/lodash/_getTag.js ==*/
$m['lodash/_getTag.js#4.15.0'] = {};
var _lodashgetTagjs4150_DataView = $m['lodash/_DataView.js#4.15.0'],
    _lodashgetTagjs4150_Map = $m['lodash/_Map.js#4.15.0'],
    _lodashgetTagjs4150_Promise = $m['lodash/_Promise.js#4.15.0'],
    _lodashgetTagjs4150_Set = $m['lodash/_Set.js#4.15.0'],
    _lodashgetTagjs4150_WeakMap = $m['lodash/_WeakMap.js#4.15.0'],
    _lodashgetTagjs4150_baseGetTag = $m['lodash/_baseGetTag.js#4.15.0'],
    _lodashgetTagjs4150_toSource = $m['lodash/_toSource.js#4.15.0'];

/** `Object#toString` result references. */
var _lodashgetTagjs4150_mapTag = '[object Map]',
    _lodashgetTagjs4150_objectTag = '[object Object]',
    _lodashgetTagjs4150_promiseTag = '[object Promise]',
    _lodashgetTagjs4150_setTag = '[object Set]',
    _lodashgetTagjs4150_weakMapTag = '[object WeakMap]';

var _lodashgetTagjs4150_dataViewTag = '[object DataView]';

/** Used for built-in method references. */
var _lodashgetTagjs4150_objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var _lodashgetTagjs4150_objectToString = _lodashgetTagjs4150_objectProto.toString;

/** Used to detect maps, sets, and weakmaps. */
var _lodashgetTagjs4150_dataViewCtorString = _lodashgetTagjs4150_toSource(_lodashgetTagjs4150_DataView),
    _lodashgetTagjs4150_mapCtorString = _lodashgetTagjs4150_toSource(_lodashgetTagjs4150_Map),
    _lodashgetTagjs4150_promiseCtorString = _lodashgetTagjs4150_toSource(_lodashgetTagjs4150_Promise),
    _lodashgetTagjs4150_setCtorString = _lodashgetTagjs4150_toSource(_lodashgetTagjs4150_Set),
    _lodashgetTagjs4150_weakMapCtorString = _lodashgetTagjs4150_toSource(_lodashgetTagjs4150_WeakMap);

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var _lodashgetTagjs4150_getTag = _lodashgetTagjs4150_baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11,
// for data views in Edge < 14, and promises in Node.js.
if (_lodashgetTagjs4150_DataView && _lodashgetTagjs4150_getTag(new _lodashgetTagjs4150_DataView(new ArrayBuffer(1))) != _lodashgetTagjs4150_dataViewTag || _lodashgetTagjs4150_Map && _lodashgetTagjs4150_getTag(new _lodashgetTagjs4150_Map()) != _lodashgetTagjs4150_mapTag || _lodashgetTagjs4150_Promise && _lodashgetTagjs4150_getTag(_lodashgetTagjs4150_Promise.resolve()) != _lodashgetTagjs4150_promiseTag || _lodashgetTagjs4150_Set && _lodashgetTagjs4150_getTag(new _lodashgetTagjs4150_Set()) != _lodashgetTagjs4150_setTag || _lodashgetTagjs4150_WeakMap && _lodashgetTagjs4150_getTag(new _lodashgetTagjs4150_WeakMap()) != _lodashgetTagjs4150_weakMapTag) {
    _lodashgetTagjs4150_getTag = function (value) {
        var result = _lodashgetTagjs4150_objectToString.call(value),
            Ctor = result == _lodashgetTagjs4150_objectTag ? value.constructor : undefined,
            ctorString = Ctor ? _lodashgetTagjs4150_toSource(Ctor) : undefined;

        if (ctorString) {
            switch (ctorString) {
                case _lodashgetTagjs4150_dataViewCtorString:
                    return _lodashgetTagjs4150_dataViewTag;
                case _lodashgetTagjs4150_mapCtorString:
                    return _lodashgetTagjs4150_mapTag;
                case _lodashgetTagjs4150_promiseCtorString:
                    return _lodashgetTagjs4150_promiseTag;
                case _lodashgetTagjs4150_setCtorString:
                    return _lodashgetTagjs4150_setTag;
                case _lodashgetTagjs4150_weakMapCtorString:
                    return _lodashgetTagjs4150_weakMapTag;
            }
        }
        return result;
    };
}

$m['lodash/_getTag.js#4.15.0'] = _lodashgetTagjs4150_getTag;

/*== node_modules/lodash/isArrayLike.js ==*/
$m['lodash/isArrayLike.js#4.15.0'] = {};
var _lodashisArrayLikejs4150_isFunction = $m['lodash/isFunction.js#4.15.0'],
    _lodashisArrayLikejs4150_isLength = $m['lodash/isLength.js#4.15.0'];

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function _lodashisArrayLikejs4150_isArrayLike(value) {
  return value != null && _lodashisArrayLikejs4150_isLength(value.length) && !_lodashisArrayLikejs4150_isFunction(value);
}

$m['lodash/isArrayLike.js#4.15.0'] = _lodashisArrayLikejs4150_isArrayLike;

/*== node_modules/lodash/_overArg.js ==*/
$m['lodash/_overArg.js#4.15.0'] = {};
/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function _lodashoverArgjs4150_overArg(func, transform) {
  return function (arg) {
    return func(transform(arg));
  };
}

$m['lodash/_overArg.js#4.15.0'] = _lodashoverArgjs4150_overArg;

/*== node_modules/lodash/_nativeKeys.js ==*/
$m['lodash/_nativeKeys.js#4.15.0'] = {};
var _lodashnativeKeysjs4150_overArg = $m['lodash/_overArg.js#4.15.0'];

/* Built-in method references for those with the same name as other `lodash` methods. */
var _lodashnativeKeysjs4150_nativeKeys = _lodashnativeKeysjs4150_overArg(Object.keys, Object);

$m['lodash/_nativeKeys.js#4.15.0'] = _lodashnativeKeysjs4150_nativeKeys;

/*== node_modules/lodash/_isPrototype.js ==*/
$m['lodash/_isPrototype.js#4.15.0'] = {};
/** Used for built-in method references. */
var _lodashisPrototypejs4150_objectProto = Object.prototype;

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function _lodashisPrototypejs4150_isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = typeof Ctor == 'function' && Ctor.prototype || _lodashisPrototypejs4150_objectProto;

  return value === proto;
}

$m['lodash/_isPrototype.js#4.15.0'] = _lodashisPrototypejs4150_isPrototype;

/*== node_modules/lodash/_baseKeys.js ==*/
$m['lodash/_baseKeys.js#4.15.0'] = {};
var _lodashbaseKeysjs4150_isPrototype = $m['lodash/_isPrototype.js#4.15.0'],
    _lodashbaseKeysjs4150_nativeKeys = $m['lodash/_nativeKeys.js#4.15.0'];

/** Used for built-in method references. */
var _lodashbaseKeysjs4150_objectProto = Object.prototype;

/** Used to check objects for own properties. */
var _lodashbaseKeysjs4150_hasOwnProperty = _lodashbaseKeysjs4150_objectProto.hasOwnProperty;

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function _lodashbaseKeysjs4150_baseKeys(object) {
  if (!_lodashbaseKeysjs4150_isPrototype(object)) {
    return _lodashbaseKeysjs4150_nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (_lodashbaseKeysjs4150_hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

$m['lodash/_baseKeys.js#4.15.0'] = _lodashbaseKeysjs4150_baseKeys;

/*== node_modules/lodash/_isIndex.js ==*/
$m['lodash/_isIndex.js#4.15.0'] = {};
/** Used as references for various `Number` constants. */
var _lodashisIndexjs4150_MAX_SAFE_INTEGER = 9007199254740991;

/** Used to detect unsigned integer values. */
var _lodashisIndexjs4150_reIsUint = /^(?:0|[1-9]\d*)$/;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function _lodashisIndexjs4150_isIndex(value, length) {
  length = length == null ? _lodashisIndexjs4150_MAX_SAFE_INTEGER : length;
  return !!length && (typeof value == 'number' || _lodashisIndexjs4150_reIsUint.test(value)) && value > -1 && value % 1 == 0 && value < length;
}

$m['lodash/_isIndex.js#4.15.0'] = _lodashisIndexjs4150_isIndex;

/*== node_modules/lodash/isArrayLikeObject.js ==*/
$m['lodash/isArrayLikeObject.js#4.15.0'] = {};
var _lodashisArrayLikeObjectjs4150_isArrayLike = $m['lodash/isArrayLike.js#4.15.0'],
    _lodashisArrayLikeObjectjs4150_isObjectLike = $m['lodash/isObjectLike.js#4.15.0'];

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function _lodashisArrayLikeObjectjs4150_isArrayLikeObject(value) {
  return _lodashisArrayLikeObjectjs4150_isObjectLike(value) && _lodashisArrayLikeObjectjs4150_isArrayLike(value);
}

$m['lodash/isArrayLikeObject.js#4.15.0'] = _lodashisArrayLikeObjectjs4150_isArrayLikeObject;

/*== node_modules/lodash/isArguments.js ==*/
$m['lodash/isArguments.js#4.15.0'] = {};
var _lodashisArgumentsjs4150_isArrayLikeObject = $m['lodash/isArrayLikeObject.js#4.15.0'];

/** `Object#toString` result references. */
var _lodashisArgumentsjs4150_argsTag = '[object Arguments]';

/** Used for built-in method references. */
var _lodashisArgumentsjs4150_objectProto = Object.prototype;

/** Used to check objects for own properties. */
var _lodashisArgumentsjs4150_hasOwnProperty = _lodashisArgumentsjs4150_objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var _lodashisArgumentsjs4150_objectToString = _lodashisArgumentsjs4150_objectProto.toString;

/** Built-in value references. */
var _lodashisArgumentsjs4150_propertyIsEnumerable = _lodashisArgumentsjs4150_objectProto.propertyIsEnumerable;

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function _lodashisArgumentsjs4150_isArguments(value) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  return _lodashisArgumentsjs4150_isArrayLikeObject(value) && _lodashisArgumentsjs4150_hasOwnProperty.call(value, 'callee') && (!_lodashisArgumentsjs4150_propertyIsEnumerable.call(value, 'callee') || _lodashisArgumentsjs4150_objectToString.call(value) == _lodashisArgumentsjs4150_argsTag);
}

$m['lodash/isArguments.js#4.15.0'] = _lodashisArgumentsjs4150_isArguments;

/*== node_modules/lodash/_baseTimes.js ==*/
$m['lodash/_baseTimes.js#4.15.0'] = {};
/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function _lodashbaseTimesjs4150_baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

$m['lodash/_baseTimes.js#4.15.0'] = _lodashbaseTimesjs4150_baseTimes;

/*== node_modules/lodash/_arrayLikeKeys.js ==*/
$m['lodash/_arrayLikeKeys.js#4.15.0'] = {};
var _lodasharrayLikeKeysjs4150_baseTimes = $m['lodash/_baseTimes.js#4.15.0'],
    _lodasharrayLikeKeysjs4150_isArguments = $m['lodash/isArguments.js#4.15.0'],
    _lodasharrayLikeKeysjs4150_isArray = $m['lodash/isArray.js#4.15.0'],
    _lodasharrayLikeKeysjs4150_isIndex = $m['lodash/_isIndex.js#4.15.0'];

/** Used for built-in method references. */
var _lodasharrayLikeKeysjs4150_objectProto = Object.prototype;

/** Used to check objects for own properties. */
var _lodasharrayLikeKeysjs4150_hasOwnProperty = _lodasharrayLikeKeysjs4150_objectProto.hasOwnProperty;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function _lodasharrayLikeKeysjs4150_arrayLikeKeys(value, inherited) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  // Safari 9 makes `arguments.length` enumerable in strict mode.
  var result = _lodasharrayLikeKeysjs4150_isArray(value) || _lodasharrayLikeKeysjs4150_isArguments(value) ? _lodasharrayLikeKeysjs4150_baseTimes(value.length, String) : [];

  var length = result.length,
      skipIndexes = !!length;

  for (var key in value) {
    if ((inherited || _lodasharrayLikeKeysjs4150_hasOwnProperty.call(value, key)) && !(skipIndexes && (key == 'length' || _lodasharrayLikeKeysjs4150_isIndex(key, length)))) {
      result.push(key);
    }
  }
  return result;
}

$m['lodash/_arrayLikeKeys.js#4.15.0'] = _lodasharrayLikeKeysjs4150_arrayLikeKeys;

/*== node_modules/lodash/keys.js ==*/
$m['lodash/keys.js#4.15.0'] = {};
var _lodashkeysjs4150_arrayLikeKeys = $m['lodash/_arrayLikeKeys.js#4.15.0'],
    _lodashkeysjs4150_baseKeys = $m['lodash/_baseKeys.js#4.15.0'],
    _lodashkeysjs4150_isArrayLike = $m['lodash/isArrayLike.js#4.15.0'];

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function _lodashkeysjs4150_keys(object) {
  return _lodashkeysjs4150_isArrayLike(object) ? _lodashkeysjs4150_arrayLikeKeys(object) : _lodashkeysjs4150_baseKeys(object);
}

$m['lodash/keys.js#4.15.0'] = _lodashkeysjs4150_keys;

/*== node_modules/lodash/_equalObjects.js ==*/
$m['lodash/_equalObjects.js#4.15.0'] = {};
var _lodashequalObjectsjs4150_keys = $m['lodash/keys.js#4.15.0'];

/** Used to compose bitmasks for comparison styles. */
var _lodashequalObjectsjs4150_PARTIAL_COMPARE_FLAG = 2;

/** Used for built-in method references. */
var _lodashequalObjectsjs4150_objectProto = Object.prototype;

/** Used to check objects for own properties. */
var _lodashequalObjectsjs4150_hasOwnProperty = _lodashequalObjectsjs4150_objectProto.hasOwnProperty;

/**
 * A specialized version of `baseIsEqualDeep` for objects with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} customizer The function to customize comparisons.
 * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
 *  for more details.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function _lodashequalObjectsjs4150_equalObjects(object, other, equalFunc, customizer, bitmask, stack) {
  var isPartial = bitmask & _lodashequalObjectsjs4150_PARTIAL_COMPARE_FLAG,
      objProps = _lodashequalObjectsjs4150_keys(object),
      objLength = objProps.length,
      othProps = _lodashequalObjectsjs4150_keys(other),
      othLength = othProps.length;

  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isPartial ? key in other : _lodashequalObjectsjs4150_hasOwnProperty.call(other, key))) {
      return false;
    }
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(object);
  if (stacked && stack.get(other)) {
    return stacked == other;
  }
  var result = true;
  stack.set(object, other);
  stack.set(other, object);

  var skipCtor = isPartial;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key],
        othValue = other[key];

    if (customizer) {
      var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
    }
    // Recursively compare objects (susceptible to call stack limits).
    if (!(compared === undefined ? objValue === othValue || equalFunc(objValue, othValue, customizer, bitmask, stack) : compared)) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = key == 'constructor');
  }
  if (result && !skipCtor) {
    var objCtor = object.constructor,
        othCtor = other.constructor;

    // Non `Object` object instances with different constructors are not equal.
    if (objCtor != othCtor && 'constructor' in object && 'constructor' in other && !(typeof objCtor == 'function' && objCtor instanceof objCtor && typeof othCtor == 'function' && othCtor instanceof othCtor)) {
      result = false;
    }
  }
  stack['delete'](object);
  stack['delete'](other);
  return result;
}

$m['lodash/_equalObjects.js#4.15.0'] = _lodashequalObjectsjs4150_equalObjects;

/*== node_modules/lodash/_mapToArray.js ==*/
$m['lodash/_mapToArray.js#4.15.0'] = {};
/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function _lodashmapToArrayjs4150_mapToArray(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function (value, key) {
    result[++index] = [key, value];
  });
  return result;
}

$m['lodash/_mapToArray.js#4.15.0'] = _lodashmapToArrayjs4150_mapToArray;

/*== node_modules/lodash/_arraySome.js ==*/
$m['lodash/_arraySome.js#4.15.0'] = {};
/**
 * A specialized version of `_.some` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {boolean} Returns `true` if any element passes the predicate check,
 *  else `false`.
 */
function _lodasharraySomejs4150_arraySome(array, predicate) {
  var index = -1,
      length = array ? array.length : 0;

  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }
  return false;
}

$m['lodash/_arraySome.js#4.15.0'] = _lodasharraySomejs4150_arraySome;

/*== node_modules/lodash/_equalArrays.js ==*/
$m['lodash/_equalArrays.js#4.15.0'] = {};
var _lodashequalArraysjs4150_SetCache = $m['lodash/_SetCache.js#4.15.0'],
    _lodashequalArraysjs4150_arraySome = $m['lodash/_arraySome.js#4.15.0'];

/** Used to compose bitmasks for comparison styles. */
var _lodashequalArraysjs4150_UNORDERED_COMPARE_FLAG = 1,
    _lodashequalArraysjs4150_PARTIAL_COMPARE_FLAG = 2;

/**
 * A specialized version of `baseIsEqualDeep` for arrays with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Array} array The array to compare.
 * @param {Array} other The other array to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} customizer The function to customize comparisons.
 * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
 *  for more details.
 * @param {Object} stack Tracks traversed `array` and `other` objects.
 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
 */
function _lodashequalArraysjs4150_equalArrays(array, other, equalFunc, customizer, bitmask, stack) {
  var isPartial = bitmask & _lodashequalArraysjs4150_PARTIAL_COMPARE_FLAG,
      arrLength = array.length,
      othLength = other.length;

  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(array);
  if (stacked && stack.get(other)) {
    return stacked == other;
  }
  var index = -1,
      result = true,
      seen = bitmask & _lodashequalArraysjs4150_UNORDERED_COMPARE_FLAG ? new _lodashequalArraysjs4150_SetCache() : undefined;

  stack.set(array, other);
  stack.set(other, array);

  // Ignore non-index properties.
  while (++index < arrLength) {
    var arrValue = array[index],
        othValue = other[index];

    if (customizer) {
      var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
    }
    if (compared !== undefined) {
      if (compared) {
        continue;
      }
      result = false;
      break;
    }
    // Recursively compare arrays (susceptible to call stack limits).
    if (seen) {
      if (!_lodashequalArraysjs4150_arraySome(other, function (othValue, othIndex) {
        if (!seen.has(othIndex) && (arrValue === othValue || equalFunc(arrValue, othValue, customizer, bitmask, stack))) {
          return seen.add(othIndex);
        }
      })) {
        result = false;
        break;
      }
    } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, customizer, bitmask, stack))) {
      result = false;
      break;
    }
  }
  stack['delete'](array);
  stack['delete'](other);
  return result;
}

$m['lodash/_equalArrays.js#4.15.0'] = _lodashequalArraysjs4150_equalArrays;

/*== node_modules/lodash/_Uint8Array.js ==*/
$m['lodash/_Uint8Array.js#4.15.0'] = {};
var _lodashUint8Arrayjs4150_root = $m['lodash/_root.js#4.15.0'];

/** Built-in value references. */
var _lodashUint8Arrayjs4150_Uint8Array = _lodashUint8Arrayjs4150_root.Uint8Array;

$m['lodash/_Uint8Array.js#4.15.0'] = _lodashUint8Arrayjs4150_Uint8Array;

/*== node_modules/lodash/_Symbol.js ==*/
$m['lodash/_Symbol.js#4.15.0'] = {};
var _lodashSymboljs4150_root = $m['lodash/_root.js#4.15.0'];

/** Built-in value references. */
var _lodashSymboljs4150_Symbol = _lodashSymboljs4150_root.Symbol;

$m['lodash/_Symbol.js#4.15.0'] = _lodashSymboljs4150_Symbol;

/*== node_modules/lodash/_equalByTag.js ==*/
$m['lodash/_equalByTag.js#4.15.0'] = {};
var _lodashequalByTagjs4150_Symbol = $m['lodash/_Symbol.js#4.15.0'],
    _lodashequalByTagjs4150_Uint8Array = $m['lodash/_Uint8Array.js#4.15.0'],
    _lodashequalByTagjs4150_eq = $m['lodash/eq.js#4.15.0'],
    _lodashequalByTagjs4150_equalArrays = $m['lodash/_equalArrays.js#4.15.0'],
    _lodashequalByTagjs4150_mapToArray = $m['lodash/_mapToArray.js#4.15.0'],
    _lodashequalByTagjs4150_setToArray = $m['lodash/_setToArray.js#4.15.0'];

/** Used to compose bitmasks for comparison styles. */
var _lodashequalByTagjs4150_UNORDERED_COMPARE_FLAG = 1,
    _lodashequalByTagjs4150_PARTIAL_COMPARE_FLAG = 2;

/** `Object#toString` result references. */
var _lodashequalByTagjs4150_boolTag = '[object Boolean]',
    _lodashequalByTagjs4150_dateTag = '[object Date]',
    _lodashequalByTagjs4150_errorTag = '[object Error]',
    _lodashequalByTagjs4150_mapTag = '[object Map]',
    _lodashequalByTagjs4150_numberTag = '[object Number]',
    _lodashequalByTagjs4150_regexpTag = '[object RegExp]',
    _lodashequalByTagjs4150_setTag = '[object Set]',
    _lodashequalByTagjs4150_stringTag = '[object String]',
    _lodashequalByTagjs4150_symbolTag = '[object Symbol]';

var _lodashequalByTagjs4150_arrayBufferTag = '[object ArrayBuffer]',
    _lodashequalByTagjs4150_dataViewTag = '[object DataView]';

/** Used to convert symbols to primitives and strings. */
var _lodashequalByTagjs4150_symbolProto = _lodashequalByTagjs4150_Symbol ? _lodashequalByTagjs4150_Symbol.prototype : undefined,
    _lodashequalByTagjs4150_symbolValueOf = _lodashequalByTagjs4150_symbolProto ? _lodashequalByTagjs4150_symbolProto.valueOf : undefined;

/**
 * A specialized version of `baseIsEqualDeep` for comparing objects of
 * the same `toStringTag`.
 *
 * **Note:** This function only supports comparing values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {string} tag The `toStringTag` of the objects to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} customizer The function to customize comparisons.
 * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
 *  for more details.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function _lodashequalByTagjs4150_equalByTag(object, other, tag, equalFunc, customizer, bitmask, stack) {
  switch (tag) {
    case _lodashequalByTagjs4150_dataViewTag:
      if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;

    case _lodashequalByTagjs4150_arrayBufferTag:
      if (object.byteLength != other.byteLength || !equalFunc(new _lodashequalByTagjs4150_Uint8Array(object), new _lodashequalByTagjs4150_Uint8Array(other))) {
        return false;
      }
      return true;

    case _lodashequalByTagjs4150_boolTag:
    case _lodashequalByTagjs4150_dateTag:
    case _lodashequalByTagjs4150_numberTag:
      // Coerce booleans to `1` or `0` and dates to milliseconds.
      // Invalid dates are coerced to `NaN`.
      return _lodashequalByTagjs4150_eq(+object, +other);

    case _lodashequalByTagjs4150_errorTag:
      return object.name == other.name && object.message == other.message;

    case _lodashequalByTagjs4150_regexpTag:
    case _lodashequalByTagjs4150_stringTag:
      // Coerce regexes to strings and treat strings, primitives and objects,
      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
      // for more details.
      return object == other + '';

    case _lodashequalByTagjs4150_mapTag:
      var convert = _lodashequalByTagjs4150_mapToArray;

    case _lodashequalByTagjs4150_setTag:
      var isPartial = bitmask & _lodashequalByTagjs4150_PARTIAL_COMPARE_FLAG;
      convert || (convert = _lodashequalByTagjs4150_setToArray);

      if (object.size != other.size && !isPartial) {
        return false;
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= _lodashequalByTagjs4150_UNORDERED_COMPARE_FLAG;

      // Recursively compare objects (susceptible to call stack limits).
      stack.set(object, other);
      var result = _lodashequalByTagjs4150_equalArrays(convert(object), convert(other), equalFunc, customizer, bitmask, stack);
      stack['delete'](object);
      return result;

    case _lodashequalByTagjs4150_symbolTag:
      if (_lodashequalByTagjs4150_symbolValueOf) {
        return _lodashequalByTagjs4150_symbolValueOf.call(object) == _lodashequalByTagjs4150_symbolValueOf.call(other);
      }
  }
  return false;
}

$m['lodash/_equalByTag.js#4.15.0'] = _lodashequalByTagjs4150_equalByTag;

/*== node_modules/lodash/_stackSet.js ==*/
$m['lodash/_stackSet.js#4.15.0'] = {};
var _lodashstackSetjs4150_ListCache = $m['lodash/_ListCache.js#4.15.0'],
    _lodashstackSetjs4150_Map = $m['lodash/_Map.js#4.15.0'],
    _lodashstackSetjs4150_MapCache = $m['lodash/_MapCache.js#4.15.0'];

/** Used as the size to enable large array optimizations. */
var _lodashstackSetjs4150_LARGE_ARRAY_SIZE = 200;

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function _lodashstackSetjs4150_stackSet(key, value) {
  var cache = this.__data__;
  if (cache instanceof _lodashstackSetjs4150_ListCache) {
    var pairs = cache.__data__;
    if (!_lodashstackSetjs4150_Map || pairs.length < _lodashstackSetjs4150_LARGE_ARRAY_SIZE - 1) {
      pairs.push([key, value]);
      return this;
    }
    cache = this.__data__ = new _lodashstackSetjs4150_MapCache(pairs);
  }
  cache.set(key, value);
  return this;
}

$m['lodash/_stackSet.js#4.15.0'] = _lodashstackSetjs4150_stackSet;

/*== node_modules/lodash/_stackHas.js ==*/
$m['lodash/_stackHas.js#4.15.0'] = {};
/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function _lodashstackHasjs4150_stackHas(key) {
  return this.__data__.has(key);
}

$m['lodash/_stackHas.js#4.15.0'] = _lodashstackHasjs4150_stackHas;

/*== node_modules/lodash/_stackGet.js ==*/
$m['lodash/_stackGet.js#4.15.0'] = {};
/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function _lodashstackGetjs4150_stackGet(key) {
  return this.__data__.get(key);
}

$m['lodash/_stackGet.js#4.15.0'] = _lodashstackGetjs4150_stackGet;

/*== node_modules/lodash/_stackDelete.js ==*/
$m['lodash/_stackDelete.js#4.15.0'] = {};
/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function _lodashstackDeletejs4150_stackDelete(key) {
  return this.__data__['delete'](key);
}

$m['lodash/_stackDelete.js#4.15.0'] = _lodashstackDeletejs4150_stackDelete;

/*== node_modules/lodash/_stackClear.js ==*/
$m['lodash/_stackClear.js#4.15.0'] = {};
var _lodashstackClearjs4150_ListCache = $m['lodash/_ListCache.js#4.15.0'];

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function _lodashstackClearjs4150_stackClear() {
  this.__data__ = new _lodashstackClearjs4150_ListCache();
}

$m['lodash/_stackClear.js#4.15.0'] = _lodashstackClearjs4150_stackClear;

/*== node_modules/lodash/_Stack.js ==*/
$m['lodash/_Stack.js#4.15.0'] = {};
var _lodashStackjs4150_ListCache = $m['lodash/_ListCache.js#4.15.0'],
    _lodashStackjs4150_stackClear = $m['lodash/_stackClear.js#4.15.0'],
    _lodashStackjs4150_stackDelete = $m['lodash/_stackDelete.js#4.15.0'],
    _lodashStackjs4150_stackGet = $m['lodash/_stackGet.js#4.15.0'],
    _lodashStackjs4150_stackHas = $m['lodash/_stackHas.js#4.15.0'],
    _lodashStackjs4150_stackSet = $m['lodash/_stackSet.js#4.15.0'];

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function _lodashStackjs4150_Stack(entries) {
  this.__data__ = new _lodashStackjs4150_ListCache(entries);
}

// Add methods to `Stack`.
_lodashStackjs4150_Stack.prototype.clear = _lodashStackjs4150_stackClear;
_lodashStackjs4150_Stack.prototype['delete'] = _lodashStackjs4150_stackDelete;
_lodashStackjs4150_Stack.prototype.get = _lodashStackjs4150_stackGet;
_lodashStackjs4150_Stack.prototype.has = _lodashStackjs4150_stackHas;
_lodashStackjs4150_Stack.prototype.set = _lodashStackjs4150_stackSet;

$m['lodash/_Stack.js#4.15.0'] = _lodashStackjs4150_Stack;

/*== node_modules/lodash/_baseIsEqualDeep.js ==*/
$m['lodash/_baseIsEqualDeep.js#4.15.0'] = {};
var _lodashbaseIsEqualDeepjs4150_Stack = $m['lodash/_Stack.js#4.15.0'],
    _lodashbaseIsEqualDeepjs4150_equalArrays = $m['lodash/_equalArrays.js#4.15.0'],
    _lodashbaseIsEqualDeepjs4150_equalByTag = $m['lodash/_equalByTag.js#4.15.0'],
    _lodashbaseIsEqualDeepjs4150_equalObjects = $m['lodash/_equalObjects.js#4.15.0'],
    _lodashbaseIsEqualDeepjs4150_getTag = $m['lodash/_getTag.js#4.15.0'],
    _lodashbaseIsEqualDeepjs4150_isArray = $m['lodash/isArray.js#4.15.0'],
    _lodashbaseIsEqualDeepjs4150_isHostObject = $m['lodash/_isHostObject.js#4.15.0'],
    _lodashbaseIsEqualDeepjs4150_isTypedArray = $m['lodash/isTypedArray.js#4.15.0'];

/** Used to compose bitmasks for comparison styles. */
var _lodashbaseIsEqualDeepjs4150_PARTIAL_COMPARE_FLAG = 2;

/** `Object#toString` result references. */
var _lodashbaseIsEqualDeepjs4150_argsTag = '[object Arguments]',
    _lodashbaseIsEqualDeepjs4150_arrayTag = '[object Array]',
    _lodashbaseIsEqualDeepjs4150_objectTag = '[object Object]';

/** Used for built-in method references. */
var _lodashbaseIsEqualDeepjs4150_objectProto = Object.prototype;

/** Used to check objects for own properties. */
var _lodashbaseIsEqualDeepjs4150_hasOwnProperty = _lodashbaseIsEqualDeepjs4150_objectProto.hasOwnProperty;

/**
 * A specialized version of `baseIsEqual` for arrays and objects which performs
 * deep comparisons and tracks traversed objects enabling objects with circular
 * references to be compared.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {number} [bitmask] The bitmask of comparison flags. See `baseIsEqual`
 *  for more details.
 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function _lodashbaseIsEqualDeepjs4150_baseIsEqualDeep(object, other, equalFunc, customizer, bitmask, stack) {
  var objIsArr = _lodashbaseIsEqualDeepjs4150_isArray(object),
      othIsArr = _lodashbaseIsEqualDeepjs4150_isArray(other),
      objTag = _lodashbaseIsEqualDeepjs4150_arrayTag,
      othTag = _lodashbaseIsEqualDeepjs4150_arrayTag;

  if (!objIsArr) {
    objTag = _lodashbaseIsEqualDeepjs4150_getTag(object);
    objTag = objTag == _lodashbaseIsEqualDeepjs4150_argsTag ? _lodashbaseIsEqualDeepjs4150_objectTag : objTag;
  }
  if (!othIsArr) {
    othTag = _lodashbaseIsEqualDeepjs4150_getTag(other);
    othTag = othTag == _lodashbaseIsEqualDeepjs4150_argsTag ? _lodashbaseIsEqualDeepjs4150_objectTag : othTag;
  }
  var objIsObj = objTag == _lodashbaseIsEqualDeepjs4150_objectTag && !_lodashbaseIsEqualDeepjs4150_isHostObject(object),
      othIsObj = othTag == _lodashbaseIsEqualDeepjs4150_objectTag && !_lodashbaseIsEqualDeepjs4150_isHostObject(other),
      isSameTag = objTag == othTag;

  if (isSameTag && !objIsObj) {
    stack || (stack = new _lodashbaseIsEqualDeepjs4150_Stack());
    return objIsArr || _lodashbaseIsEqualDeepjs4150_isTypedArray(object) ? _lodashbaseIsEqualDeepjs4150_equalArrays(object, other, equalFunc, customizer, bitmask, stack) : _lodashbaseIsEqualDeepjs4150_equalByTag(object, other, objTag, equalFunc, customizer, bitmask, stack);
  }
  if (!(bitmask & _lodashbaseIsEqualDeepjs4150_PARTIAL_COMPARE_FLAG)) {
    var objIsWrapped = objIsObj && _lodashbaseIsEqualDeepjs4150_hasOwnProperty.call(object, '__wrapped__'),
        othIsWrapped = othIsObj && _lodashbaseIsEqualDeepjs4150_hasOwnProperty.call(other, '__wrapped__');

    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object,
          othUnwrapped = othIsWrapped ? other.value() : other;

      stack || (stack = new _lodashbaseIsEqualDeepjs4150_Stack());
      return equalFunc(objUnwrapped, othUnwrapped, customizer, bitmask, stack);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack || (stack = new _lodashbaseIsEqualDeepjs4150_Stack());
  return _lodashbaseIsEqualDeepjs4150_equalObjects(object, other, equalFunc, customizer, bitmask, stack);
}

$m['lodash/_baseIsEqualDeep.js#4.15.0'] = _lodashbaseIsEqualDeepjs4150_baseIsEqualDeep;

/*== node_modules/lodash/_baseIsEqual.js ==*/
$m['lodash/_baseIsEqual.js#4.15.0'] = {};
var _lodashbaseIsEqualjs4150_baseIsEqualDeep = $m['lodash/_baseIsEqualDeep.js#4.15.0'],
    _lodashbaseIsEqualjs4150_isObject = $m['lodash/isObject.js#4.15.0'],
    _lodashbaseIsEqualjs4150_isObjectLike = $m['lodash/isObjectLike.js#4.15.0'];

/**
 * The base implementation of `_.isEqual` which supports partial comparisons
 * and tracks traversed objects.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {boolean} [bitmask] The bitmask of comparison flags.
 *  The bitmask may be composed of the following flags:
 *     1 - Unordered comparison
 *     2 - Partial comparison
 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */
function _lodashbaseIsEqualjs4150_baseIsEqual(value, other, customizer, bitmask, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || !_lodashbaseIsEqualjs4150_isObject(value) && !_lodashbaseIsEqualjs4150_isObjectLike(other)) {
    return value !== value && other !== other;
  }
  return _lodashbaseIsEqualjs4150_baseIsEqualDeep(value, other, _lodashbaseIsEqualjs4150_baseIsEqual, customizer, bitmask, stack);
}

$m['lodash/_baseIsEqual.js#4.15.0'] = _lodashbaseIsEqualjs4150_baseIsEqual;

/*== node_modules/lodash/isEqual.js ==*/
$m['lodash/isEqual.js#4.15.0'] = {};
var _lodashisEqualjs4150_baseIsEqual = $m['lodash/_baseIsEqual.js#4.15.0'];

/**
 * Performs a deep comparison between two values to determine if they are
 * equivalent.
 *
 * **Note:** This method supports comparing arrays, array buffers, booleans,
 * date objects, error objects, maps, numbers, `Object` objects, regexes,
 * sets, strings, symbols, and typed arrays. `Object` objects are compared
 * by their own, not inherited, enumerable properties. Functions and DOM
 * nodes are **not** supported.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.isEqual(object, other);
 * // => true
 *
 * object === other;
 * // => false
 */
function _lodashisEqualjs4150_isEqual(value, other) {
  return _lodashisEqualjs4150_baseIsEqual(value, other);
}

$m['lodash/isEqual.js#4.15.0'] = _lodashisEqualjs4150_isEqual;

/*== lib/utils/string.js ==*/
$m['lib/utils/string.js'] = {};
'use strict';

const _libutilsstringjs_isEqual = $m['lodash/isEqual.js#4.15.0'];
const _libutilsstringjs_unique = $m['lodash/uniqWith.js#4.15.0'];

// Line starting with '//'
const _libutilsstringjs_RE_COMMENT_SINGLE_LINE = /^\s*(?:\/\/|#).+$/gm;
// Multi line block '/** ... */'
const _libutilsstringjs_RE_COMMENT_MULTI_LINES = /((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/))$/gm;
const _libutilsstringjs_SEG_LENGTH = 30;

$m['lib/utils/string.js'] = {
  /**
   * Strip comments from 'str'
   * @param {String} str
   * @returns {String}
   */
  commentStrip(str) {
    // Remove commented lines
    str = str.replace(_libutilsstringjs_RE_COMMENT_SINGLE_LINE, '');
    str = str.replace(_libutilsstringjs_RE_COMMENT_MULTI_LINES, '');
    return str;
  },

  /**
   * Wrap 'str' in comment based on 'type'
   * @param {String} str
   * @param {String} type
   * @returns {String}
   */
  commentWrap(str, type) {
    let open, close;

    if (type == 'html') {
      open = '<!-- ';
      close = ' -->';
    } else {
      open = '/* ';
      close = ' */';
    }

    return open + str + close;
  },

  /**
   * Match unique occurrences in 'str'
   * @param {String} str
   * @param {RegExp} regexp
   * @returns {Array}
   */
  uniqueMatch(str, regexp) {
    let results = [];
    let match;

    while (match = regexp.exec(str)) {
      results.push({
        context: match[0],
        match: match[1] || ''
      });
    }

    // Filter duplicates
    return _libutilsstringjs_unique(results, _libutilsstringjs_isEqual);
  },

  /**
   * Escape 'str' for use in RegExp constructor
   * @param {String} str
   * @returns {String}
   */
  regexpEscape(str) {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  },

  /**
   * Truncate 'str'
   * @param {String} str
   * @returns {String}
   */
  truncate(str) {
    if (str.length > _libutilsstringjs_SEG_LENGTH * 2 + 3) {
      return str.slice(0, _libutilsstringjs_SEG_LENGTH) + '...' + str.slice(-_libutilsstringjs_SEG_LENGTH);
    }

    return str;
  }
};

/*== lib/utils/env.js ==*/
$m['lib/utils/env.js'] = {};
'use strict';

const _libutilsenvjs_path = require('path');

const _libutilsenvjs_RE_ILLEGAL_ID = /[\- .*]/g;

/**
 * Set BUDDY env 'key'
 * @param {String} key
 * @param {String|Array} value
 * @param {String} [id]
 */
$m['lib/utils/env.js'] = function env(key, value, id) {
  id = id != null ? id.replace(_libutilsenvjs_RE_ILLEGAL_ID, '').toUpperCase() + '_' : '';

  if (Array.isArray(value)) {
    value = value.reduce((value, item) => {
      const isFile = 'object' == typeof item && 'extension' in item;

      switch (key) {
        case 'INPUT':
          value += isFile ? _libutilsenvjs_path.relative(process.cwd(), item.filepath) : item;
          break;
        case 'INPUT_HASH':
          value += isFile ? item.hash : item;
          break;
        case 'INPUT_DATE':
          value += isFile ? item.date : item;
          break;
        case 'OUTPUT':
          value += _libutilsenvjs_path.relative(process.cwd(), item);
          break;
        case 'OUTPUT_HASH':
        case 'OUTPUT_DATE':
          value += item;
          break;
      }

      return value;
    }, '');
  }

  process.env[`BUDDY_${ id }${ key }`] = value;
};

/*== node_modules/supports-color/index.js ==*/
$m['supports-color/index.js#2.0.0'] = {};
'use strict';

var _supportscolorindexjs200_argv = process.argv;

var _supportscolorindexjs200_terminator = _supportscolorindexjs200_argv.indexOf('--');
var _supportscolorindexjs200_hasFlag = function (flag) {
	flag = '--' + flag;
	var pos = _supportscolorindexjs200_argv.indexOf(flag);
	return pos !== -1 && (_supportscolorindexjs200_terminator !== -1 ? pos < _supportscolorindexjs200_terminator : true);
};

$m['supports-color/index.js#2.0.0'] = function () {
	if ('FORCE_COLOR' in process.env) {
		return true;
	}

	if (_supportscolorindexjs200_hasFlag('no-color') || _supportscolorindexjs200_hasFlag('no-colors') || _supportscolorindexjs200_hasFlag('color=false')) {
		return false;
	}

	if (_supportscolorindexjs200_hasFlag('color') || _supportscolorindexjs200_hasFlag('colors') || _supportscolorindexjs200_hasFlag('color=true') || _supportscolorindexjs200_hasFlag('color=always')) {
		return true;
	}

	if (process.stdout && !process.stdout.isTTY) {
		return false;
	}

	if (process.platform === 'win32') {
		return true;
	}

	if ('COLORTERM' in process.env) {
		return true;
	}

	if (process.env.TERM === 'dumb') {
		return false;
	}

	if (/^screen|^xterm|^vt100|color|ansi|cygwin|linux/i.test(process.env.TERM)) {
		return true;
	}

	return false;
}();

/*== node_modules/ansi-regex/index.js ==*/
$m['ansi-regex/index.js#2.0.0'] = {};
'use strict';

$m['ansi-regex/index.js#2.0.0'] = function () {
	return (/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g
	);
};

/*== node_modules/has-ansi/index.js ==*/
$m['has-ansi/index.js#2.0.0'] = {};
'use strict';

var _hasansiindexjs200_ansiRegex = $m['ansi-regex/index.js#2.0.0'];
var _hasansiindexjs200_re = new RegExp(_hasansiindexjs200_ansiRegex().source); // remove the `g` flag
$m['has-ansi/index.js#2.0.0'] = _hasansiindexjs200_re.test.bind(_hasansiindexjs200_re);

/*== node_modules/strip-ansi/index.js ==*/
$m['strip-ansi/index.js#3.0.1'] = {};
'use strict';

var _stripansiindexjs301_ansiRegex = $m['ansi-regex/index.js#2.0.0']();

$m['strip-ansi/index.js#3.0.1'] = function (str) {
	return typeof str === 'string' ? str.replace(_stripansiindexjs301_ansiRegex, '') : str;
};

/*== node_modules/ansi-styles/index.js ==*/
$m['ansi-styles/index.js#2.2.1'] = {};
'use strict';

function _ansistylesindexjs221_assembleStyles() {
	var styles = {
		modifiers: {
			reset: [0, 0],
			bold: [1, 22], // 21 isn't widely supported and 22 does the same thing
			dim: [2, 22],
			italic: [3, 23],
			underline: [4, 24],
			inverse: [7, 27],
			hidden: [8, 28],
			strikethrough: [9, 29]
		},
		colors: {
			black: [30, 39],
			red: [31, 39],
			green: [32, 39],
			yellow: [33, 39],
			blue: [34, 39],
			magenta: [35, 39],
			cyan: [36, 39],
			white: [37, 39],
			gray: [90, 39]
		},
		bgColors: {
			bgBlack: [40, 49],
			bgRed: [41, 49],
			bgGreen: [42, 49],
			bgYellow: [43, 49],
			bgBlue: [44, 49],
			bgMagenta: [45, 49],
			bgCyan: [46, 49],
			bgWhite: [47, 49]
		}
	};

	// fix humans
	styles.colors.grey = styles.colors.gray;

	Object.keys(styles).forEach(function (groupName) {
		var group = styles[groupName];

		Object.keys(group).forEach(function (styleName) {
			var style = group[styleName];

			styles[styleName] = group[styleName] = {
				open: '\u001b[' + style[0] + 'm',
				close: '\u001b[' + style[1] + 'm'
			};
		});

		Object.defineProperty(styles, groupName, {
			value: group,
			enumerable: false
		});
	});

	return styles;
}

Object.defineProperty(module, 'exports', {
	enumerable: true,
	get: _ansistylesindexjs221_assembleStyles
});

/*== node_modules/escape-string-regexp/index.js ==*/
$m['escape-string-regexp/index.js#1.0.5'] = {};
'use strict';

var _escapestringregexpindexjs105_matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;

$m['escape-string-regexp/index.js#1.0.5'] = function (str) {
	if (typeof str !== 'string') {
		throw new TypeError('Expected a string');
	}

	return str.replace(_escapestringregexpindexjs105_matchOperatorsRe, '\\$&');
};

/*== node_modules/chalk/index.js ==*/
$m['chalk/index.js#1.1.3'] = {};
'use strict';

var _chalkindexjs113_escapeStringRegexp = $m['escape-string-regexp/index.js#1.0.5'];
var _chalkindexjs113_ansiStyles = $m['ansi-styles/index.js#2.2.1'];
var _chalkindexjs113_stripAnsi = $m['strip-ansi/index.js#3.0.1'];
var _chalkindexjs113_hasAnsi = $m['has-ansi/index.js#2.0.0'];
var _chalkindexjs113_supportsColor = $m['supports-color/index.js#2.0.0'];
var _chalkindexjs113_defineProps = Object.defineProperties;
var _chalkindexjs113_isSimpleWindowsTerm = process.platform === 'win32' && !/^xterm/i.test(process.env.TERM);

function _chalkindexjs113_Chalk(options) {
	// detect mode if not set manually
	this.enabled = !options || options.enabled === undefined ? _chalkindexjs113_supportsColor : options.enabled;
}

// use bright blue on Windows as the normal blue color is illegible
if (_chalkindexjs113_isSimpleWindowsTerm) {
	_chalkindexjs113_ansiStyles.blue.open = '\u001b[94m';
}

var _chalkindexjs113_styles = function () {
	var ret = {};

	Object.keys(_chalkindexjs113_ansiStyles).forEach(function (key) {
		_chalkindexjs113_ansiStyles[key].closeRe = new RegExp(_chalkindexjs113_escapeStringRegexp(_chalkindexjs113_ansiStyles[key].close), 'g');

		ret[key] = {
			get: function () {
				return _chalkindexjs113_build.call(this, this._styles.concat(key));
			}
		};
	});

	return ret;
}();

var _chalkindexjs113_proto = _chalkindexjs113_defineProps(function chalk() {}, _chalkindexjs113_styles);

function _chalkindexjs113_build(_styles) {
	var builder = function () {
		return _chalkindexjs113_applyStyle.apply(builder, arguments);
	};

	builder._styles = _styles;
	builder.enabled = this.enabled;
	// __proto__ is used because we must return a function, but there is
	// no way to create a function with a different prototype.
	/* eslint-disable no-proto */
	builder.__proto__ = _chalkindexjs113_proto;

	return builder;
}

function _chalkindexjs113_applyStyle() {
	// support varags, but simply cast to string in case there's only one arg
	var args = arguments;
	var argsLen = args.length;
	var str = argsLen !== 0 && String(arguments[0]);

	if (argsLen > 1) {
		// don't slice `arguments`, it prevents v8 optimizations
		for (var a = 1; a < argsLen; a++) {
			str += ' ' + args[a];
		}
	}

	if (!this.enabled || !str) {
		return str;
	}

	var nestedStyles = this._styles;
	var i = nestedStyles.length;

	// Turns out that on Windows dimmed gray text becomes invisible in cmd.exe,
	// see https://github.com/chalk/chalk/issues/58
	// If we're on Windows and we're dealing with a gray color, temporarily make 'dim' a noop.
	var originalDim = _chalkindexjs113_ansiStyles.dim.open;
	if (_chalkindexjs113_isSimpleWindowsTerm && (nestedStyles.indexOf('gray') !== -1 || nestedStyles.indexOf('grey') !== -1)) {
		_chalkindexjs113_ansiStyles.dim.open = '';
	}

	while (i--) {
		var code = _chalkindexjs113_ansiStyles[nestedStyles[i]];

		// Replace any instances already present with a re-opening code
		// otherwise only the part of the string until said closing code
		// will be colored, and the rest will simply be 'plain'.
		str = code.open + str.replace(code.closeRe, code.open) + code.close;
	}

	// Reset the original 'dim' if we changed it to work around the Windows dimmed gray issue.
	_chalkindexjs113_ansiStyles.dim.open = originalDim;

	return str;
}

function _chalkindexjs113_init() {
	var ret = {};

	Object.keys(_chalkindexjs113_styles).forEach(function (name) {
		ret[name] = {
			get: function () {
				return _chalkindexjs113_build.call(this, [name]);
			}
		};
	});

	return ret;
}

_chalkindexjs113_defineProps(_chalkindexjs113_Chalk.prototype, _chalkindexjs113_init());

$m['chalk/index.js#1.1.3'] = new _chalkindexjs113_Chalk();
$m['chalk/index.js#1.1.3'].styles = _chalkindexjs113_ansiStyles;
$m['chalk/index.js#1.1.3'].hasColor = _chalkindexjs113_hasAnsi;
$m['chalk/index.js#1.1.3'].stripColor = _chalkindexjs113_stripAnsi;
$m['chalk/index.js#1.1.3'].supportsColor = _chalkindexjs113_supportsColor;

/*== lib/utils/cnsl.js ==*/
$m['lib/utils/cnsl.js'] = {};
'use strict';

const _libutilscnsljs_chalk = $m['chalk/index.js#1.1.3'];

const _libutilscnsljs_TOO_LONG = 10;

const _libutilscnsljs_start = process.hrtime();
let _libutilscnsljs_last = null;
let _libutilscnsljs_timers = {};

$m['lib/utils/cnsl.js'].BELL = '\x07';
// Silent during testing by default
$m['lib/utils/cnsl.js'].silent = process.env.NODE_ENV == 'test';
$m['lib/utils/cnsl.js'].verbose = false;

/**
 * Start tracking duration of event 'id'
 * @param {String} id
 */
$m['lib/utils/cnsl.js'].start = function (id) {
  _libutilscnsljs_timers[id] = process.hrtime();
};

/**
 * Stop tracking duration of event 'id'
 * @param {String} id
 * @returns {Number}
 */
$m['lib/utils/cnsl.js'].stop = function (id) {
  const ms = _libutilscnsljs_msDiff(process.hrtime(), _libutilscnsljs_timers[id]);

  delete _libutilscnsljs_timers[id];

  return ms;
};

/**
 * Print 'msg' to console, with indentation level
 * @param {String} msg
 * @param {Int} column
 */
$m['lib/utils/cnsl.js'].print = function (msg, column) {
  if (column == null) column = 0;
  if (!$m['lib/utils/cnsl.js'].silent) console.log($m['lib/utils/cnsl.js'].indent(msg, column));
};

/**
 * Print 'err' to console, with error colour and indentation level
 * @param {Object|String} err
 * @param {Int} column
 * @param {Boolean} throws
 */
$m['lib/utils/cnsl.js'].error = function (err, column, throws) {
  if (column == null) column = 0;
  if (throws == null) throws = true;
  if ('string' == typeof err) err = new Error(err);
  // Add beep when not throwing
  if (!throws) err.message += $m['lib/utils/cnsl.js'].BELL;
  $m['lib/utils/cnsl.js'].print(_libutilscnsljs_chalk.bold.red('error ') + err.message + (err.filepath ? ' in ' + _libutilscnsljs_chalk.bold.grey(err.filepath) : ''), column);
  if (throws && !$m['lib/utils/cnsl.js'].silent) throw err;
};

/**
 * Print 'msg' to console, with warning colour and indentation level
 * @param {String} msg
 * @param {Int} column
 */
$m['lib/utils/cnsl.js'].warn = function (msg, column) {
  if (column == null) column = 0;
  if ('string' instanceof Error) msg = msg.message;
  $m['lib/utils/cnsl.js'].print(_libutilscnsljs_chalk.bold.yellow('warning ') + msg, column);
};

/**
 * Print 'msg' to console, with debug colour and indentation level
 * @param {String} msg
 * @param {Int} column
 */
$m['lib/utils/cnsl.js'].debug = function (msg, column) {
  const now = process.hrtime();

  if (!_libutilscnsljs_last) _libutilscnsljs_last = now;

  const ellapsed = _libutilscnsljs_msDiff(now, _libutilscnsljs_last);

  if (column == null) column = 0;
  if ($m['lib/utils/cnsl.js'].verbose) {
    msg = _libutilscnsljs_chalk.cyan('+') + _libutilscnsljs_chalk.bold.grey((ellapsed > _libutilscnsljs_TOO_LONG ? _libutilscnsljs_chalk.red(ellapsed) : ellapsed) + 'ms') + _libutilscnsljs_chalk.cyan('::') + _libutilscnsljs_chalk.bold.grey(_libutilscnsljs_msDiff(now, _libutilscnsljs_start) + 'ms') + _libutilscnsljs_chalk.cyan('=') + msg;
    $m['lib/utils/cnsl.js'].print(msg, column);
  }
  _libutilscnsljs_last = now;
};

/**
 * Colourize 'string' for emphasis
 * @param {String} string
 * @returns {String}
 */
$m['lib/utils/cnsl.js'].strong = function (string) {
  return _libutilscnsljs_chalk.bold.grey(string);
};

/**
 * Indent the given 'string' a specific number of spaces
 * @param {String} string
 * @param {Int} column
 * @returns {String}
 */
$m['lib/utils/cnsl.js'].indent = function (string, column) {
  const spaces = new Array(++column).join('  ');

  return string.replace(/^/gm, spaces);
};

/**
 * Retrieve difference in ms
 * @param {Array} t1
 * @param {Array} t2
 * @returns {Number}
 */
function _libutilscnsljs_msDiff(t1, t2) {
  t1 = (t1[0] * 1e9 + t1[1]) / 1e6;
  t2 = (t2[0] * 1e9 + t2[1]) / 1e6;
  return Math.ceil((t1 - t2) * 100) / 100;
}

/*== lib/utils/callable.js ==*/
$m['lib/utils/callable.js'] = {};
'use strict';

/**
 * Retrieve callable function 'fn' with 'context' and optional 'args'
 * @param {Object} context
 * @param {Function} fn
 * @param {Array} args
 * @returns {Function}
 */

$m['lib/utils/callable.js'] = function callable(context, fn, ...args) {
  return function callableFunction(...moreArgs) {
    context[fn].call(context, ...args, ...moreArgs);
  };
};

/*== lib/utils/index.js ==*/
$m['lib/utils/index.js'] = {};
'use strict';

$m['lib/utils/index.js'] = {
  callable: $m['lib/utils/callable.js'],
  cnsl: $m['lib/utils/cnsl.js'],
  env: $m['lib/utils/env.js'],
  string: $m['lib/utils/string.js']
};

/*== node_modules/lodash/_isFlattenable.js ==*/
$m['lodash/_isFlattenable.js#4.15.0'] = {};
var _lodashisFlattenablejs4150_Symbol = $m['lodash/_Symbol.js#4.15.0'],
    _lodashisFlattenablejs4150_isArguments = $m['lodash/isArguments.js#4.15.0'],
    _lodashisFlattenablejs4150_isArray = $m['lodash/isArray.js#4.15.0'];

/** Built-in value references. */
var _lodashisFlattenablejs4150_spreadableSymbol = _lodashisFlattenablejs4150_Symbol ? _lodashisFlattenablejs4150_Symbol.isConcatSpreadable : undefined;

/**
 * Checks if `value` is a flattenable `arguments` object or array.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
 */
function _lodashisFlattenablejs4150_isFlattenable(value) {
    return _lodashisFlattenablejs4150_isArray(value) || _lodashisFlattenablejs4150_isArguments(value) || !!(_lodashisFlattenablejs4150_spreadableSymbol && value && value[_lodashisFlattenablejs4150_spreadableSymbol]);
}

$m['lodash/_isFlattenable.js#4.15.0'] = _lodashisFlattenablejs4150_isFlattenable;

/*== node_modules/lodash/_arrayPush.js ==*/
$m['lodash/_arrayPush.js#4.15.0'] = {};
/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function _lodasharrayPushjs4150_arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

$m['lodash/_arrayPush.js#4.15.0'] = _lodasharrayPushjs4150_arrayPush;

/*== node_modules/lodash/_baseFlatten.js ==*/
$m['lodash/_baseFlatten.js#4.15.0'] = {};
var _lodashbaseFlattenjs4150_arrayPush = $m['lodash/_arrayPush.js#4.15.0'],
    _lodashbaseFlattenjs4150_isFlattenable = $m['lodash/_isFlattenable.js#4.15.0'];

/**
 * The base implementation of `_.flatten` with support for restricting flattening.
 *
 * @private
 * @param {Array} array The array to flatten.
 * @param {number} depth The maximum recursion depth.
 * @param {boolean} [predicate=isFlattenable] The function invoked per iteration.
 * @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.
 * @param {Array} [result=[]] The initial result value.
 * @returns {Array} Returns the new flattened array.
 */
function _lodashbaseFlattenjs4150_baseFlatten(array, depth, predicate, isStrict, result) {
  var index = -1,
      length = array.length;

  predicate || (predicate = _lodashbaseFlattenjs4150_isFlattenable);
  result || (result = []);

  while (++index < length) {
    var value = array[index];
    if (depth > 0 && predicate(value)) {
      if (depth > 1) {
        // Recursively flatten arrays (susceptible to call stack limits).
        _lodashbaseFlattenjs4150_baseFlatten(value, depth - 1, predicate, isStrict, result);
      } else {
        _lodashbaseFlattenjs4150_arrayPush(result, value);
      }
    } else if (!isStrict) {
      result[result.length] = value;
    }
  }
  return result;
}

$m['lodash/_baseFlatten.js#4.15.0'] = _lodashbaseFlattenjs4150_baseFlatten;

/*== node_modules/lodash/flatten.js ==*/
$m['lodash/flatten.js#4.15.0'] = {};
var _lodashflattenjs4150_baseFlatten = $m['lodash/_baseFlatten.js#4.15.0'];

/**
 * Flattens `array` a single level deep.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to flatten.
 * @returns {Array} Returns the new flattened array.
 * @example
 *
 * _.flatten([1, [2, [3, [4]], 5]]);
 * // => [1, 2, [3, [4]], 5]
 */
function _lodashflattenjs4150_flatten(array) {
  var length = array ? array.length : 0;
  return length ? _lodashflattenjs4150_baseFlatten(array, 1) : [];
}

$m['lodash/flatten.js#4.15.0'] = _lodashflattenjs4150_flatten;

/*== lib/config/pluginLoader.js ==*/
$m['lib/config/pluginLoader.js'] = {};
'use strict';

const { error: _libconfigpluginLoaderjs_error, print: _libconfigpluginLoaderjs_print, strong: _libconfigpluginLoaderjs_strong, warn: _libconfigpluginLoaderjs_warn } = $m['lib/utils/cnsl.js'];
const { execSync: _libconfigpluginLoaderjs_exec } = require('child_process');
const _libconfigpluginLoaderjs_fs = require('fs');
const _libconfigpluginLoaderjs_path = require('path');

const _libconfigpluginLoaderjs_BABEL_PRESET_2016 = ['babel-plugin-syntax-trailing-function-commas', 'babel-plugin-transform-async-to-generator'];
const _libconfigpluginLoaderjs_BABEL_PRESET_2015 = ['babel-plugin-transform-exponentiation-operator'];
const _libconfigpluginLoaderjs_BABEL_PRESET_ES5 = ['babel-plugin-transform-es5-property-mutators', 'babel-plugin-transform-es2015-arrow-functions', 'babel-plugin-transform-es2015-block-scoped-functions', 'babel-plugin-transform-es2015-block-scoping', ['babel-plugin-transform-es2015-classes', { loose: true }], ['babel-plugin-transform-es2015-computed-properties', { loose: true }], ['babel-plugin-transform-es2015-destructuring', { loose: true }], 'babel-plugin-transform-es2015-duplicate-keys', ['babel-plugin-transform-es2015-for-of', { loose: true }], 'babel-plugin-transform-es2015-function-name', 'babel-plugin-transform-es2015-literals', ['babel-plugin-transform-es2015-modules-commonjs', { loose: true }], 'babel-plugin-transform-es2015-object-super', 'babel-plugin-transform-es2015-parameters', 'babel-plugin-transform-es2015-shorthand-properties', ['babel-plugin-transform-es2015-spread', { loose: true }], 'babel-plugin-transform-es2015-sticky-regex', ['babel-plugin-transform-es2015-template-literals', { loose: true }],
// babel-plugin-transform-es2015-typeof-symbol,
'babel-plugin-transform-es2015-unicode-regex'
// babel-plugin-transform-regenerator
];
const _libconfigpluginLoaderjs_BABEL_PRESET_NODE6 = [['babel-plugin-transform-es2015-modules-commonjs', { loose: true }]];
const _libconfigpluginLoaderjs_BABEL_PRESET_NODE4 = [['babel-plugin-transform-es2015-destructuring', { loose: true }], 'babel-plugin-transform-es2015-function-name', ['babel-plugin-transform-es2015-modules-commonjs', { loose: true }], 'babel-plugin-transform-es2015-parameters', 'babel-plugin-transform-es2015-shorthand-properties', ['babel-plugin-transform-es2015-spread', { loose: true }], 'babel-plugin-transform-es2015-sticky-regex', 'babel-plugin-transform-es2015-unicode-regex'];
const _libconfigpluginLoaderjs_BABEL_PRESET_DEFAULT = ['babel-plugin-external-helpers'];
const _libconfigpluginLoaderjs_POSTCSS_PRESET_DEFAULT = [];
const _libconfigpluginLoaderjs_RE_JS_FILE = /\.js$/;
const _libconfigpluginLoaderjs_RE_NODE_VERSION = /^node|^server/;
const _libconfigpluginLoaderjs_RE_PLUGIN = /^buddy-plugin-/;

const _libconfigpluginLoaderjs_babel = {
  default: _libconfigpluginLoaderjs_BABEL_PRESET_DEFAULT,
  es5: _libconfigpluginLoaderjs_BABEL_PRESET_ES5.concat(_libconfigpluginLoaderjs_BABEL_PRESET_2015, _libconfigpluginLoaderjs_BABEL_PRESET_2016),
  es2015: _libconfigpluginLoaderjs_BABEL_PRESET_2015.concat(_libconfigpluginLoaderjs_BABEL_PRESET_2016),
  es2016: _libconfigpluginLoaderjs_BABEL_PRESET_2016,
  node4: _libconfigpluginLoaderjs_BABEL_PRESET_NODE4,
  node6: _libconfigpluginLoaderjs_BABEL_PRESET_NODE6
};
const _libconfigpluginLoaderjs_postcss = {
  default: _libconfigpluginLoaderjs_POSTCSS_PRESET_DEFAULT
};

// Alias
_libconfigpluginLoaderjs_babel.es6 = _libconfigpluginLoaderjs_babel.es2015;
_libconfigpluginLoaderjs_babel.es7 = _libconfigpluginLoaderjs_babel.es2016;

$m['lib/config/pluginLoader.js'] = {
  /**
   * Add 'preset' definition for 'type'
   * @param {String} type
   * @param {String} name
   * @param {Array} preset
   */
  addPreset(type, name, preset) {
    if (type == 'babel') {
      _libconfigpluginLoaderjs_babel[name] = preset;
    } else if (type == 'postcss') {
      _libconfigpluginLoaderjs_postcss[name] = preset;
    }
  },

  /**
   * Load default/global buddy plugins
   * @param {Object} config
   * @param {Array} [additionalPluginModules]
   */
  loadPluginModules(config, additionalPluginModules = []) {
    const cwd = process.cwd();
    const defaultPluginModules = _libconfigpluginLoaderjs_path.resolve(__dirname, '../plugins');
    const projectModules = _libconfigpluginLoaderjs_path.join(cwd, 'node_modules');
    const projectPluginModules = _libconfigpluginLoaderjs_path.join(cwd, 'buddy-plugins');

    // Load default file definitions
    _libconfigpluginLoaderjs_loadPluginModulesFromDir(defaultPluginModules, config);
    // Load from project node_modules dir
    _libconfigpluginLoaderjs_loadPluginModulesFromDir(projectModules, config);
    // Load from project buddy-plugins dir
    if (_libconfigpluginLoaderjs_fs.existsSync(projectPluginModules)) _libconfigpluginLoaderjs_loadPluginModulesFromDir(projectPluginModules, config);
    // Load any additional modules
    additionalPluginModules.forEach(module => {
      _libconfigpluginLoaderjs_registerPluginModule(module, config);
    });
  },

  /**
   * Load external plugins based on build target 'version' and 'options'
   * @param {Object} options
   * @param {Array} version
   * @returns {Boolean}
   */
  loadBuildPlugins(options, version = []) {
    if (!Array.isArray(version)) version = [version];
    options.babel = options.babel || {};
    options.babel.plugins = options.babel.plugins || [];

    let browser = true;
    // Add Babel plugins based on version preset
    let plugins = version.reduce((plugins, preset) => {
      preset = preset.toLowerCase();
      // Flag node builds
      if (_libconfigpluginLoaderjs_RE_NODE_VERSION.test(preset)) browser = false;
      // Ignore generic without warning
      if (preset == 'node' || preset == 'server') return plugins;
      if (!_libconfigpluginLoaderjs_babel[preset]) {
        _libconfigpluginLoaderjs_warn(`${ _libconfigpluginLoaderjs_strong(preset) } is not a recognised build target version. Additional versions can be installed with npm`);
        return plugins;
      }
      return plugins.concat(_libconfigpluginLoaderjs_babel[preset]);
    }, _libconfigpluginLoaderjs_babel.default.slice());

    options.babel.plugins.forEach(plugin => {
      const pluginName = Array.isArray(plugin) ? plugin[0] : plugin;
      let exists = false;

      plugins.some((existingPlugin, idx) => {
        const existingPluginName = Array.isArray(existingPlugin) ? existingPlugin[0] : existingPlugin;

        // Overwrite if exists
        if (pluginName == existingPluginName) {
          plugins[idx] = plugin;
          exists = true;
        }

        return exists;
      });

      if (!exists) plugins.push(plugin);
    });
    options.babel.plugins = plugins;

    let dependencies = [];

    for (const prop in options) {
      dependencies = dependencies.concat(_libconfigpluginLoaderjs_extractDependencyStrings(options[prop]));
    }

    const missingDependenciesString = dependencies.filter(dependency => {
      try {
        require.resolve(dependency);
        return false;
      } catch (err) {
        return true;
      }
    }).join(' ');

    if (missingDependenciesString) {
      try {
        _libconfigpluginLoaderjs_print(`installing the following missing dependencies: ${ _libconfigpluginLoaderjs_strong(missingDependenciesString) }`);
        _libconfigpluginLoaderjs_exec(`npm --save-dev --save-exact install ${ missingDependenciesString }`);
      } catch (err) {
        _libconfigpluginLoaderjs_error(err);
      }
    }

    for (const prop in options) {
      _libconfigpluginLoaderjs_resolveDependecyStrings(options[prop]);
    }

    return browser;
  }
};

/**
 * Load plugins in 'dir'
 * @param {String} dir
 * @param {Object} config
 */
function _libconfigpluginLoaderjs_loadPluginModulesFromDir(dir, config) {
  if (!_libconfigpluginLoaderjs_fs.existsSync(dir)) return;

  _libconfigpluginLoaderjs_fs.readdirSync(dir).filter(resource => {
    if (_libconfigpluginLoaderjs_path.basename(dir) != 'plugins') return _libconfigpluginLoaderjs_RE_PLUGIN.test(resource);
    return _libconfigpluginLoaderjs_RE_JS_FILE.test(resource) || _libconfigpluginLoaderjs_fs.statSync(_libconfigpluginLoaderjs_path.join(dir, resource)).isDirectory();
  }).forEach(resource => {
    _libconfigpluginLoaderjs_registerPluginModule(_libconfigpluginLoaderjs_path.join(dir, resource), config);
  });
}

/**
 * Register plugin 'resource'
 * @param {String} resource
 * @param {Object} config
 * @returns {null}
 */
function _libconfigpluginLoaderjs_registerPluginModule(resource, config) {
  let module;

  try {
    module = 'string' == typeof resource ? require(resource) : resource;
  } catch (err) {
    return _libconfigpluginLoaderjs_warn(`unable to load plugin ${ _libconfigpluginLoaderjs_strong(resource) }`);
  }

  if (!('register' in module)) return _libconfigpluginLoaderjs_warn(`invalid plugin ${ _libconfigpluginLoaderjs_strong(resource) }`);

  module.register(config);
  _libconfigpluginLoaderjs_print(`registered plugin ${ _libconfigpluginLoaderjs_strong(module.name) }`, 0);
}

/**
 * Extract dependency strings from 'optionsItem'
 * @param {Object} optionsItem
 * @returns {Array}
 */
function _libconfigpluginLoaderjs_extractDependencyStrings(optionsItem) {
  let dependencies = [];

  function extract(items) {
    // Invalid if not Array
    if (Array.isArray(items)) {
      items.reduce((dependencies, item) => {
        // Items can be Array with depedency as first param
        const dep = Array.isArray(item) ? item[0] : item;

        // Only gather string references, not functions/modules
        if ('string' == typeof dep) dependencies.push(dep);
        return dependencies;
      }, dependencies);
    }
  }

  if (optionsItem.plugins) extract(optionsItem.plugins);
  if (optionsItem.presets) extract(optionsItem.presets);

  return dependencies;
}

/**
 * Resolve dependency strings in 'optionsItem' to modules
 * @param {Object} optionsItem
 */
function _libconfigpluginLoaderjs_resolveDependecyStrings(optionsItem) {
  function resolve(items) {
    // Invalid if not Array
    if (Array.isArray(items)) {
      items.forEach((item, idx, items) => {
        if (Array.isArray(item) && 'string' == typeof item[0]) {
          item[0] = require(item[0]);
        } else if ('string' == typeof item) {
          items[idx] = require(item);
        }
      });
    }
  }

  if (optionsItem.plugins) resolve(optionsItem.plugins);
  if (optionsItem.presets) resolve(optionsItem.presets);
}

/*== node_modules/lodash/_isIterateeCall.js ==*/
$m['lodash/_isIterateeCall.js#4.15.0'] = {};
var _lodashisIterateeCalljs4150_eq = $m['lodash/eq.js#4.15.0'],
    _lodashisIterateeCalljs4150_isArrayLike = $m['lodash/isArrayLike.js#4.15.0'],
    _lodashisIterateeCalljs4150_isIndex = $m['lodash/_isIndex.js#4.15.0'],
    _lodashisIterateeCalljs4150_isObject = $m['lodash/isObject.js#4.15.0'];

/**
 * Checks if the given arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
 *  else `false`.
 */
function _lodashisIterateeCalljs4150_isIterateeCall(value, index, object) {
  if (!_lodashisIterateeCalljs4150_isObject(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number' ? _lodashisIterateeCalljs4150_isArrayLike(object) && _lodashisIterateeCalljs4150_isIndex(index, object.length) : type == 'string' && index in object) {
    return _lodashisIterateeCalljs4150_eq(object[index], value);
  }
  return false;
}

$m['lodash/_isIterateeCall.js#4.15.0'] = _lodashisIterateeCalljs4150_isIterateeCall;

/*== node_modules/lodash/_apply.js ==*/
$m['lodash/_apply.js#4.15.0'] = {};
/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */
function _lodashapplyjs4150_apply(func, thisArg, args) {
  switch (args.length) {
    case 0:
      return func.call(thisArg);
    case 1:
      return func.call(thisArg, args[0]);
    case 2:
      return func.call(thisArg, args[0], args[1]);
    case 3:
      return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}

$m['lodash/_apply.js#4.15.0'] = _lodashapplyjs4150_apply;

/*== node_modules/lodash/_baseRest.js ==*/
$m['lodash/_baseRest.js#4.15.0'] = {};
var _lodashbaseRestjs4150_apply = $m['lodash/_apply.js#4.15.0'];

/* Built-in method references for those with the same name as other `lodash` methods. */
var _lodashbaseRestjs4150_nativeMax = Math.max;

/**
 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 */
function _lodashbaseRestjs4150_baseRest(func, start) {
  start = _lodashbaseRestjs4150_nativeMax(start === undefined ? func.length - 1 : start, 0);
  return function () {
    var args = arguments,
        index = -1,
        length = _lodashbaseRestjs4150_nativeMax(args.length - start, 0),
        array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = array;
    return _lodashbaseRestjs4150_apply(func, this, otherArgs);
  };
}

$m['lodash/_baseRest.js#4.15.0'] = _lodashbaseRestjs4150_baseRest;

/*== node_modules/lodash/_createAssigner.js ==*/
$m['lodash/_createAssigner.js#4.15.0'] = {};
var _lodashcreateAssignerjs4150_baseRest = $m['lodash/_baseRest.js#4.15.0'],
    _lodashcreateAssignerjs4150_isIterateeCall = $m['lodash/_isIterateeCall.js#4.15.0'];

/**
 * Creates a function like `_.assign`.
 *
 * @private
 * @param {Function} assigner The function to assign values.
 * @returns {Function} Returns the new assigner function.
 */
function _lodashcreateAssignerjs4150_createAssigner(assigner) {
  return _lodashcreateAssignerjs4150_baseRest(function (object, sources) {
    var index = -1,
        length = sources.length,
        customizer = length > 1 ? sources[length - 1] : undefined,
        guard = length > 2 ? sources[2] : undefined;

    customizer = assigner.length > 3 && typeof customizer == 'function' ? (length--, customizer) : undefined;

    if (guard && _lodashcreateAssignerjs4150_isIterateeCall(sources[0], sources[1], guard)) {
      customizer = length < 3 ? undefined : customizer;
      length = 1;
    }
    object = Object(object);
    while (++index < length) {
      var source = sources[index];
      if (source) {
        assigner(object, source, index, customizer);
      }
    }
    return object;
  });
}

$m['lodash/_createAssigner.js#4.15.0'] = _lodashcreateAssignerjs4150_createAssigner;

/*== node_modules/lodash/_nativeKeysIn.js ==*/
$m['lodash/_nativeKeysIn.js#4.15.0'] = {};
/**
 * This function is like
 * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * except that it includes inherited enumerable properties.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function _lodashnativeKeysInjs4150_nativeKeysIn(object) {
  var result = [];
  if (object != null) {
    for (var key in Object(object)) {
      result.push(key);
    }
  }
  return result;
}

$m['lodash/_nativeKeysIn.js#4.15.0'] = _lodashnativeKeysInjs4150_nativeKeysIn;

/*== node_modules/lodash/_baseKeysIn.js ==*/
$m['lodash/_baseKeysIn.js#4.15.0'] = {};
var _lodashbaseKeysInjs4150_isObject = $m['lodash/isObject.js#4.15.0'],
    _lodashbaseKeysInjs4150_isPrototype = $m['lodash/_isPrototype.js#4.15.0'],
    _lodashbaseKeysInjs4150_nativeKeysIn = $m['lodash/_nativeKeysIn.js#4.15.0'];

/** Used for built-in method references. */
var _lodashbaseKeysInjs4150_objectProto = Object.prototype;

/** Used to check objects for own properties. */
var _lodashbaseKeysInjs4150_hasOwnProperty = _lodashbaseKeysInjs4150_objectProto.hasOwnProperty;

/**
 * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function _lodashbaseKeysInjs4150_baseKeysIn(object) {
  if (!_lodashbaseKeysInjs4150_isObject(object)) {
    return _lodashbaseKeysInjs4150_nativeKeysIn(object);
  }
  var isProto = _lodashbaseKeysInjs4150_isPrototype(object),
      result = [];

  for (var key in object) {
    if (!(key == 'constructor' && (isProto || !_lodashbaseKeysInjs4150_hasOwnProperty.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

$m['lodash/_baseKeysIn.js#4.15.0'] = _lodashbaseKeysInjs4150_baseKeysIn;

/*== node_modules/lodash/keysIn.js ==*/
$m['lodash/keysIn.js#4.15.0'] = {};
var _lodashkeysInjs4150_arrayLikeKeys = $m['lodash/_arrayLikeKeys.js#4.15.0'],
    _lodashkeysInjs4150_baseKeysIn = $m['lodash/_baseKeysIn.js#4.15.0'],
    _lodashkeysInjs4150_isArrayLike = $m['lodash/isArrayLike.js#4.15.0'];

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function _lodashkeysInjs4150_keysIn(object) {
  return _lodashkeysInjs4150_isArrayLike(object) ? _lodashkeysInjs4150_arrayLikeKeys(object, true) : _lodashkeysInjs4150_baseKeysIn(object);
}

$m['lodash/keysIn.js#4.15.0'] = _lodashkeysInjs4150_keysIn;

/*== node_modules/lodash/_assignValue.js ==*/
$m['lodash/_assignValue.js#4.15.0'] = {};
var _lodashassignValuejs4150_eq = $m['lodash/eq.js#4.15.0'];

/** Used for built-in method references. */
var _lodashassignValuejs4150_objectProto = Object.prototype;

/** Used to check objects for own properties. */
var _lodashassignValuejs4150_hasOwnProperty = _lodashassignValuejs4150_objectProto.hasOwnProperty;

/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function _lodashassignValuejs4150_assignValue(object, key, value) {
  var objValue = object[key];
  if (!(_lodashassignValuejs4150_hasOwnProperty.call(object, key) && _lodashassignValuejs4150_eq(objValue, value)) || value === undefined && !(key in object)) {
    object[key] = value;
  }
}

$m['lodash/_assignValue.js#4.15.0'] = _lodashassignValuejs4150_assignValue;

/*== node_modules/lodash/_copyObject.js ==*/
$m['lodash/_copyObject.js#4.15.0'] = {};
var _lodashcopyObjectjs4150_assignValue = $m['lodash/_assignValue.js#4.15.0'];

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */
function _lodashcopyObjectjs4150_copyObject(source, props, object, customizer) {
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];

    var newValue = customizer ? customizer(object[key], source[key], key, object, source) : undefined;

    _lodashcopyObjectjs4150_assignValue(object, key, newValue === undefined ? source[key] : newValue);
  }
  return object;
}

$m['lodash/_copyObject.js#4.15.0'] = _lodashcopyObjectjs4150_copyObject;

/*== node_modules/lodash/toPlainObject.js ==*/
$m['lodash/toPlainObject.js#4.15.0'] = {};
var _lodashtoPlainObjectjs4150_copyObject = $m['lodash/_copyObject.js#4.15.0'],
    _lodashtoPlainObjectjs4150_keysIn = $m['lodash/keysIn.js#4.15.0'];

/**
 * Converts `value` to a plain object flattening inherited enumerable string
 * keyed properties of `value` to own properties of the plain object.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {Object} Returns the converted plain object.
 * @example
 *
 * function Foo() {
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.assign({ 'a': 1 }, new Foo);
 * // => { 'a': 1, 'b': 2 }
 *
 * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
 * // => { 'a': 1, 'b': 2, 'c': 3 }
 */
function _lodashtoPlainObjectjs4150_toPlainObject(value) {
  return _lodashtoPlainObjectjs4150_copyObject(value, _lodashtoPlainObjectjs4150_keysIn(value));
}

$m['lodash/toPlainObject.js#4.15.0'] = _lodashtoPlainObjectjs4150_toPlainObject;

/*== node_modules/lodash/_getPrototype.js ==*/
$m['lodash/_getPrototype.js#4.15.0'] = {};
var _lodashgetPrototypejs4150_overArg = $m['lodash/_overArg.js#4.15.0'];

/** Built-in value references. */
var _lodashgetPrototypejs4150_getPrototype = _lodashgetPrototypejs4150_overArg(Object.getPrototypeOf, Object);

$m['lodash/_getPrototype.js#4.15.0'] = _lodashgetPrototypejs4150_getPrototype;

/*== node_modules/lodash/isPlainObject.js ==*/
$m['lodash/isPlainObject.js#4.15.0'] = {};
var _lodashisPlainObjectjs4150_getPrototype = $m['lodash/_getPrototype.js#4.15.0'],
    _lodashisPlainObjectjs4150_isHostObject = $m['lodash/_isHostObject.js#4.15.0'],
    _lodashisPlainObjectjs4150_isObjectLike = $m['lodash/isObjectLike.js#4.15.0'];

/** `Object#toString` result references. */
var _lodashisPlainObjectjs4150_objectTag = '[object Object]';

/** Used for built-in method references. */
var _lodashisPlainObjectjs4150_funcProto = Function.prototype,
    _lodashisPlainObjectjs4150_objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var _lodashisPlainObjectjs4150_funcToString = _lodashisPlainObjectjs4150_funcProto.toString;

/** Used to check objects for own properties. */
var _lodashisPlainObjectjs4150_hasOwnProperty = _lodashisPlainObjectjs4150_objectProto.hasOwnProperty;

/** Used to infer the `Object` constructor. */
var _lodashisPlainObjectjs4150_objectCtorString = _lodashisPlainObjectjs4150_funcToString.call(Object);

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var _lodashisPlainObjectjs4150_objectToString = _lodashisPlainObjectjs4150_objectProto.toString;

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function _lodashisPlainObjectjs4150_isPlainObject(value) {
    if (!_lodashisPlainObjectjs4150_isObjectLike(value) || _lodashisPlainObjectjs4150_objectToString.call(value) != _lodashisPlainObjectjs4150_objectTag || _lodashisPlainObjectjs4150_isHostObject(value)) {
        return false;
    }
    var proto = _lodashisPlainObjectjs4150_getPrototype(value);
    if (proto === null) {
        return true;
    }
    var Ctor = _lodashisPlainObjectjs4150_hasOwnProperty.call(proto, 'constructor') && proto.constructor;
    return typeof Ctor == 'function' && Ctor instanceof Ctor && _lodashisPlainObjectjs4150_funcToString.call(Ctor) == _lodashisPlainObjectjs4150_objectCtorString;
}

$m['lodash/isPlainObject.js#4.15.0'] = _lodashisPlainObjectjs4150_isPlainObject;

/*== node_modules/lodash/_copyArray.js ==*/
$m['lodash/_copyArray.js#4.15.0'] = {};
/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function _lodashcopyArrayjs4150_copyArray(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

$m['lodash/_copyArray.js#4.15.0'] = _lodashcopyArrayjs4150_copyArray;

/*== node_modules/lodash/stubFalse.js ==*/
$m['lodash/stubFalse.js#4.15.0'] = {};
/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function _lodashstubFalsejs4150_stubFalse() {
  return false;
}

$m['lodash/stubFalse.js#4.15.0'] = _lodashstubFalsejs4150_stubFalse;

/*== node_modules/lodash/isBuffer.js ==*/
$m['lodash/isBuffer.js#4.15.0'] = {};
var _lodashisBufferjs4150_root = $m['lodash/_root.js#4.15.0'],
    _lodashisBufferjs4150_stubFalse = $m['lodash/stubFalse.js#4.15.0'];

/** Detect free variable `exports`. */
var _lodashisBufferjs4150_freeExports = typeof exports == 'object' && exports && !$m['lodash/isBuffer.js#4.15.0'].nodeType && exports;

/** Detect free variable `module`. */
var _lodashisBufferjs4150_freeModule = _lodashisBufferjs4150_freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var _lodashisBufferjs4150_moduleExports = _lodashisBufferjs4150_freeModule && _lodashisBufferjs4150_freeModule.exports === _lodashisBufferjs4150_freeExports;

/** Built-in value references. */
var _lodashisBufferjs4150_Buffer = _lodashisBufferjs4150_moduleExports ? _lodashisBufferjs4150_root.Buffer : undefined;

/* Built-in method references for those with the same name as other `lodash` methods. */
var _lodashisBufferjs4150_nativeIsBuffer = _lodashisBufferjs4150_Buffer ? _lodashisBufferjs4150_Buffer.isBuffer : undefined;

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var _lodashisBufferjs4150_isBuffer = _lodashisBufferjs4150_nativeIsBuffer || _lodashisBufferjs4150_stubFalse;

$m['lodash/isBuffer.js#4.15.0'] = _lodashisBufferjs4150_isBuffer;

/*== node_modules/lodash/_baseCreate.js ==*/
$m['lodash/_baseCreate.js#4.15.0'] = {};
var _lodashbaseCreatejs4150_isObject = $m['lodash/isObject.js#4.15.0'];

/** Built-in value references. */
var _lodashbaseCreatejs4150_objectCreate = Object.create;

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} prototype The object to inherit from.
 * @returns {Object} Returns the new object.
 */
function _lodashbaseCreatejs4150_baseCreate(proto) {
  return _lodashbaseCreatejs4150_isObject(proto) ? _lodashbaseCreatejs4150_objectCreate(proto) : {};
}

$m['lodash/_baseCreate.js#4.15.0'] = _lodashbaseCreatejs4150_baseCreate;

/*== node_modules/lodash/_initCloneObject.js ==*/
$m['lodash/_initCloneObject.js#4.15.0'] = {};
var _lodashinitCloneObjectjs4150_baseCreate = $m['lodash/_baseCreate.js#4.15.0'],
    _lodashinitCloneObjectjs4150_getPrototype = $m['lodash/_getPrototype.js#4.15.0'],
    _lodashinitCloneObjectjs4150_isPrototype = $m['lodash/_isPrototype.js#4.15.0'];

/**
 * Initializes an object clone.
 *
 * @private
 * @param {Object} object The object to clone.
 * @returns {Object} Returns the initialized clone.
 */
function _lodashinitCloneObjectjs4150_initCloneObject(object) {
    return typeof object.constructor == 'function' && !_lodashinitCloneObjectjs4150_isPrototype(object) ? _lodashinitCloneObjectjs4150_baseCreate(_lodashinitCloneObjectjs4150_getPrototype(object)) : {};
}

$m['lodash/_initCloneObject.js#4.15.0'] = _lodashinitCloneObjectjs4150_initCloneObject;

/*== node_modules/lodash/_cloneArrayBuffer.js ==*/
$m['lodash/_cloneArrayBuffer.js#4.15.0'] = {};
var _lodashcloneArrayBufferjs4150_Uint8Array = $m['lodash/_Uint8Array.js#4.15.0'];

/**
 * Creates a clone of `arrayBuffer`.
 *
 * @private
 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
 * @returns {ArrayBuffer} Returns the cloned array buffer.
 */
function _lodashcloneArrayBufferjs4150_cloneArrayBuffer(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new _lodashcloneArrayBufferjs4150_Uint8Array(result).set(new _lodashcloneArrayBufferjs4150_Uint8Array(arrayBuffer));
  return result;
}

$m['lodash/_cloneArrayBuffer.js#4.15.0'] = _lodashcloneArrayBufferjs4150_cloneArrayBuffer;

/*== node_modules/lodash/_cloneTypedArray.js ==*/
$m['lodash/_cloneTypedArray.js#4.15.0'] = {};
var _lodashcloneTypedArrayjs4150_cloneArrayBuffer = $m['lodash/_cloneArrayBuffer.js#4.15.0'];

/**
 * Creates a clone of `typedArray`.
 *
 * @private
 * @param {Object} typedArray The typed array to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned typed array.
 */
function _lodashcloneTypedArrayjs4150_cloneTypedArray(typedArray, isDeep) {
  var buffer = isDeep ? _lodashcloneTypedArrayjs4150_cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}

$m['lodash/_cloneTypedArray.js#4.15.0'] = _lodashcloneTypedArrayjs4150_cloneTypedArray;

/*== node_modules/lodash/_cloneSymbol.js ==*/
$m['lodash/_cloneSymbol.js#4.15.0'] = {};
var _lodashcloneSymboljs4150_Symbol = $m['lodash/_Symbol.js#4.15.0'];

/** Used to convert symbols to primitives and strings. */
var _lodashcloneSymboljs4150_symbolProto = _lodashcloneSymboljs4150_Symbol ? _lodashcloneSymboljs4150_Symbol.prototype : undefined,
    _lodashcloneSymboljs4150_symbolValueOf = _lodashcloneSymboljs4150_symbolProto ? _lodashcloneSymboljs4150_symbolProto.valueOf : undefined;

/**
 * Creates a clone of the `symbol` object.
 *
 * @private
 * @param {Object} symbol The symbol object to clone.
 * @returns {Object} Returns the cloned symbol object.
 */
function _lodashcloneSymboljs4150_cloneSymbol(symbol) {
  return _lodashcloneSymboljs4150_symbolValueOf ? Object(_lodashcloneSymboljs4150_symbolValueOf.call(symbol)) : {};
}

$m['lodash/_cloneSymbol.js#4.15.0'] = _lodashcloneSymboljs4150_cloneSymbol;

/*== node_modules/lodash/_arrayReduce.js ==*/
$m['lodash/_arrayReduce.js#4.15.0'] = {};
/**
 * A specialized version of `_.reduce` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {*} [accumulator] The initial value.
 * @param {boolean} [initAccum] Specify using the first element of `array` as
 *  the initial value.
 * @returns {*} Returns the accumulated value.
 */
function _lodasharrayReducejs4150_arrayReduce(array, iteratee, accumulator, initAccum) {
  var index = -1,
      length = array ? array.length : 0;

  if (initAccum && length) {
    accumulator = array[++index];
  }
  while (++index < length) {
    accumulator = iteratee(accumulator, array[index], index, array);
  }
  return accumulator;
}

$m['lodash/_arrayReduce.js#4.15.0'] = _lodasharrayReducejs4150_arrayReduce;

/*== node_modules/lodash/_addSetEntry.js ==*/
$m['lodash/_addSetEntry.js#4.15.0'] = {};
/**
 * Adds `value` to `set`.
 *
 * @private
 * @param {Object} set The set to modify.
 * @param {*} value The value to add.
 * @returns {Object} Returns `set`.
 */
function _lodashaddSetEntryjs4150_addSetEntry(set, value) {
  // Don't return `set.add` because it's not chainable in IE 11.
  set.add(value);
  return set;
}

$m['lodash/_addSetEntry.js#4.15.0'] = _lodashaddSetEntryjs4150_addSetEntry;

/*== node_modules/lodash/_cloneSet.js ==*/
$m['lodash/_cloneSet.js#4.15.0'] = {};
var _lodashcloneSetjs4150_addSetEntry = $m['lodash/_addSetEntry.js#4.15.0'],
    _lodashcloneSetjs4150_arrayReduce = $m['lodash/_arrayReduce.js#4.15.0'],
    _lodashcloneSetjs4150_setToArray = $m['lodash/_setToArray.js#4.15.0'];

/**
 * Creates a clone of `set`.
 *
 * @private
 * @param {Object} set The set to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned set.
 */
function _lodashcloneSetjs4150_cloneSet(set, isDeep, cloneFunc) {
  var array = isDeep ? cloneFunc(_lodashcloneSetjs4150_setToArray(set), true) : _lodashcloneSetjs4150_setToArray(set);
  return _lodashcloneSetjs4150_arrayReduce(array, _lodashcloneSetjs4150_addSetEntry, new set.constructor());
}

$m['lodash/_cloneSet.js#4.15.0'] = _lodashcloneSetjs4150_cloneSet;

/*== node_modules/lodash/_cloneRegExp.js ==*/
$m['lodash/_cloneRegExp.js#4.15.0'] = {};
/** Used to match `RegExp` flags from their coerced string values. */
var _lodashcloneRegExpjs4150_reFlags = /\w*$/;

/**
 * Creates a clone of `regexp`.
 *
 * @private
 * @param {Object} regexp The regexp to clone.
 * @returns {Object} Returns the cloned regexp.
 */
function _lodashcloneRegExpjs4150_cloneRegExp(regexp) {
  var result = new regexp.constructor(regexp.source, _lodashcloneRegExpjs4150_reFlags.exec(regexp));
  result.lastIndex = regexp.lastIndex;
  return result;
}

$m['lodash/_cloneRegExp.js#4.15.0'] = _lodashcloneRegExpjs4150_cloneRegExp;

/*== node_modules/lodash/_addMapEntry.js ==*/
$m['lodash/_addMapEntry.js#4.15.0'] = {};
/**
 * Adds the key-value `pair` to `map`.
 *
 * @private
 * @param {Object} map The map to modify.
 * @param {Array} pair The key-value pair to add.
 * @returns {Object} Returns `map`.
 */
function _lodashaddMapEntryjs4150_addMapEntry(map, pair) {
  // Don't return `map.set` because it's not chainable in IE 11.
  map.set(pair[0], pair[1]);
  return map;
}

$m['lodash/_addMapEntry.js#4.15.0'] = _lodashaddMapEntryjs4150_addMapEntry;

/*== node_modules/lodash/_cloneMap.js ==*/
$m['lodash/_cloneMap.js#4.15.0'] = {};
var _lodashcloneMapjs4150_addMapEntry = $m['lodash/_addMapEntry.js#4.15.0'],
    _lodashcloneMapjs4150_arrayReduce = $m['lodash/_arrayReduce.js#4.15.0'],
    _lodashcloneMapjs4150_mapToArray = $m['lodash/_mapToArray.js#4.15.0'];

/**
 * Creates a clone of `map`.
 *
 * @private
 * @param {Object} map The map to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned map.
 */
function _lodashcloneMapjs4150_cloneMap(map, isDeep, cloneFunc) {
  var array = isDeep ? cloneFunc(_lodashcloneMapjs4150_mapToArray(map), true) : _lodashcloneMapjs4150_mapToArray(map);
  return _lodashcloneMapjs4150_arrayReduce(array, _lodashcloneMapjs4150_addMapEntry, new map.constructor());
}

$m['lodash/_cloneMap.js#4.15.0'] = _lodashcloneMapjs4150_cloneMap;

/*== node_modules/lodash/_cloneDataView.js ==*/
$m['lodash/_cloneDataView.js#4.15.0'] = {};
var _lodashcloneDataViewjs4150_cloneArrayBuffer = $m['lodash/_cloneArrayBuffer.js#4.15.0'];

/**
 * Creates a clone of `dataView`.
 *
 * @private
 * @param {Object} dataView The data view to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned data view.
 */
function _lodashcloneDataViewjs4150_cloneDataView(dataView, isDeep) {
  var buffer = isDeep ? _lodashcloneDataViewjs4150_cloneArrayBuffer(dataView.buffer) : dataView.buffer;
  return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
}

$m['lodash/_cloneDataView.js#4.15.0'] = _lodashcloneDataViewjs4150_cloneDataView;

/*== node_modules/lodash/_initCloneByTag.js ==*/
$m['lodash/_initCloneByTag.js#4.15.0'] = {};
var _lodashinitCloneByTagjs4150_cloneArrayBuffer = $m['lodash/_cloneArrayBuffer.js#4.15.0'],
    _lodashinitCloneByTagjs4150_cloneDataView = $m['lodash/_cloneDataView.js#4.15.0'],
    _lodashinitCloneByTagjs4150_cloneMap = $m['lodash/_cloneMap.js#4.15.0'],
    _lodashinitCloneByTagjs4150_cloneRegExp = $m['lodash/_cloneRegExp.js#4.15.0'],
    _lodashinitCloneByTagjs4150_cloneSet = $m['lodash/_cloneSet.js#4.15.0'],
    _lodashinitCloneByTagjs4150_cloneSymbol = $m['lodash/_cloneSymbol.js#4.15.0'],
    _lodashinitCloneByTagjs4150_cloneTypedArray = $m['lodash/_cloneTypedArray.js#4.15.0'];

/** `Object#toString` result references. */
var _lodashinitCloneByTagjs4150_boolTag = '[object Boolean]',
    _lodashinitCloneByTagjs4150_dateTag = '[object Date]',
    _lodashinitCloneByTagjs4150_mapTag = '[object Map]',
    _lodashinitCloneByTagjs4150_numberTag = '[object Number]',
    _lodashinitCloneByTagjs4150_regexpTag = '[object RegExp]',
    _lodashinitCloneByTagjs4150_setTag = '[object Set]',
    _lodashinitCloneByTagjs4150_stringTag = '[object String]',
    _lodashinitCloneByTagjs4150_symbolTag = '[object Symbol]';

var _lodashinitCloneByTagjs4150_arrayBufferTag = '[object ArrayBuffer]',
    _lodashinitCloneByTagjs4150_dataViewTag = '[object DataView]',
    _lodashinitCloneByTagjs4150_float32Tag = '[object Float32Array]',
    _lodashinitCloneByTagjs4150_float64Tag = '[object Float64Array]',
    _lodashinitCloneByTagjs4150_int8Tag = '[object Int8Array]',
    _lodashinitCloneByTagjs4150_int16Tag = '[object Int16Array]',
    _lodashinitCloneByTagjs4150_int32Tag = '[object Int32Array]',
    _lodashinitCloneByTagjs4150_uint8Tag = '[object Uint8Array]',
    _lodashinitCloneByTagjs4150_uint8ClampedTag = '[object Uint8ClampedArray]',
    _lodashinitCloneByTagjs4150_uint16Tag = '[object Uint16Array]',
    _lodashinitCloneByTagjs4150_uint32Tag = '[object Uint32Array]';

/**
 * Initializes an object clone based on its `toStringTag`.
 *
 * **Note:** This function only supports cloning values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to clone.
 * @param {string} tag The `toStringTag` of the object to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the initialized clone.
 */
function _lodashinitCloneByTagjs4150_initCloneByTag(object, tag, cloneFunc, isDeep) {
  var Ctor = object.constructor;
  switch (tag) {
    case _lodashinitCloneByTagjs4150_arrayBufferTag:
      return _lodashinitCloneByTagjs4150_cloneArrayBuffer(object);

    case _lodashinitCloneByTagjs4150_boolTag:
    case _lodashinitCloneByTagjs4150_dateTag:
      return new Ctor(+object);

    case _lodashinitCloneByTagjs4150_dataViewTag:
      return _lodashinitCloneByTagjs4150_cloneDataView(object, isDeep);

    case _lodashinitCloneByTagjs4150_float32Tag:case _lodashinitCloneByTagjs4150_float64Tag:
    case _lodashinitCloneByTagjs4150_int8Tag:case _lodashinitCloneByTagjs4150_int16Tag:case _lodashinitCloneByTagjs4150_int32Tag:
    case _lodashinitCloneByTagjs4150_uint8Tag:case _lodashinitCloneByTagjs4150_uint8ClampedTag:case _lodashinitCloneByTagjs4150_uint16Tag:case _lodashinitCloneByTagjs4150_uint32Tag:
      return _lodashinitCloneByTagjs4150_cloneTypedArray(object, isDeep);

    case _lodashinitCloneByTagjs4150_mapTag:
      return _lodashinitCloneByTagjs4150_cloneMap(object, isDeep, cloneFunc);

    case _lodashinitCloneByTagjs4150_numberTag:
    case _lodashinitCloneByTagjs4150_stringTag:
      return new Ctor(object);

    case _lodashinitCloneByTagjs4150_regexpTag:
      return _lodashinitCloneByTagjs4150_cloneRegExp(object);

    case _lodashinitCloneByTagjs4150_setTag:
      return _lodashinitCloneByTagjs4150_cloneSet(object, isDeep, cloneFunc);

    case _lodashinitCloneByTagjs4150_symbolTag:
      return _lodashinitCloneByTagjs4150_cloneSymbol(object);
  }
}

$m['lodash/_initCloneByTag.js#4.15.0'] = _lodashinitCloneByTagjs4150_initCloneByTag;

/*== node_modules/lodash/_initCloneArray.js ==*/
$m['lodash/_initCloneArray.js#4.15.0'] = {};
/** Used for built-in method references. */
var _lodashinitCloneArrayjs4150_objectProto = Object.prototype;

/** Used to check objects for own properties. */
var _lodashinitCloneArrayjs4150_hasOwnProperty = _lodashinitCloneArrayjs4150_objectProto.hasOwnProperty;

/**
 * Initializes an array clone.
 *
 * @private
 * @param {Array} array The array to clone.
 * @returns {Array} Returns the initialized clone.
 */
function _lodashinitCloneArrayjs4150_initCloneArray(array) {
  var length = array.length,
      result = array.constructor(length);

  // Add properties assigned by `RegExp#exec`.
  if (length && typeof array[0] == 'string' && _lodashinitCloneArrayjs4150_hasOwnProperty.call(array, 'index')) {
    result.index = array.index;
    result.input = array.input;
  }
  return result;
}

$m['lodash/_initCloneArray.js#4.15.0'] = _lodashinitCloneArrayjs4150_initCloneArray;

/*== node_modules/lodash/stubArray.js ==*/
$m['lodash/stubArray.js#4.15.0'] = {};
/**
 * This method returns a new empty array.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {Array} Returns the new empty array.
 * @example
 *
 * var arrays = _.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */
function _lodashstubArrayjs4150_stubArray() {
  return [];
}

$m['lodash/stubArray.js#4.15.0'] = _lodashstubArrayjs4150_stubArray;

/*== node_modules/lodash/_getSymbols.js ==*/
$m['lodash/_getSymbols.js#4.15.0'] = {};
var _lodashgetSymbolsjs4150_overArg = $m['lodash/_overArg.js#4.15.0'],
    _lodashgetSymbolsjs4150_stubArray = $m['lodash/stubArray.js#4.15.0'];

/* Built-in method references for those with the same name as other `lodash` methods. */
var _lodashgetSymbolsjs4150_nativeGetSymbols = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own enumerable symbol properties of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var _lodashgetSymbolsjs4150_getSymbols = _lodashgetSymbolsjs4150_nativeGetSymbols ? _lodashgetSymbolsjs4150_overArg(_lodashgetSymbolsjs4150_nativeGetSymbols, Object) : _lodashgetSymbolsjs4150_stubArray;

$m['lodash/_getSymbols.js#4.15.0'] = _lodashgetSymbolsjs4150_getSymbols;

/*== node_modules/lodash/_baseGetAllKeys.js ==*/
$m['lodash/_baseGetAllKeys.js#4.15.0'] = {};
var _lodashbaseGetAllKeysjs4150_arrayPush = $m['lodash/_arrayPush.js#4.15.0'],
    _lodashbaseGetAllKeysjs4150_isArray = $m['lodash/isArray.js#4.15.0'];

/**
 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @param {Function} symbolsFunc The function to get the symbols of `object`.
 * @returns {Array} Returns the array of property names and symbols.
 */
function _lodashbaseGetAllKeysjs4150_baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return _lodashbaseGetAllKeysjs4150_isArray(object) ? result : _lodashbaseGetAllKeysjs4150_arrayPush(result, symbolsFunc(object));
}

$m['lodash/_baseGetAllKeys.js#4.15.0'] = _lodashbaseGetAllKeysjs4150_baseGetAllKeys;

/*== node_modules/lodash/_getAllKeys.js ==*/
$m['lodash/_getAllKeys.js#4.15.0'] = {};
var _lodashgetAllKeysjs4150_baseGetAllKeys = $m['lodash/_baseGetAllKeys.js#4.15.0'],
    _lodashgetAllKeysjs4150_getSymbols = $m['lodash/_getSymbols.js#4.15.0'],
    _lodashgetAllKeysjs4150_keys = $m['lodash/keys.js#4.15.0'];

/**
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function _lodashgetAllKeysjs4150_getAllKeys(object) {
  return _lodashgetAllKeysjs4150_baseGetAllKeys(object, _lodashgetAllKeysjs4150_keys, _lodashgetAllKeysjs4150_getSymbols);
}

$m['lodash/_getAllKeys.js#4.15.0'] = _lodashgetAllKeysjs4150_getAllKeys;

/*== node_modules/lodash/_copySymbols.js ==*/
$m['lodash/_copySymbols.js#4.15.0'] = {};
var _lodashcopySymbolsjs4150_copyObject = $m['lodash/_copyObject.js#4.15.0'],
    _lodashcopySymbolsjs4150_getSymbols = $m['lodash/_getSymbols.js#4.15.0'];

/**
 * Copies own symbol properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function _lodashcopySymbolsjs4150_copySymbols(source, object) {
  return _lodashcopySymbolsjs4150_copyObject(source, _lodashcopySymbolsjs4150_getSymbols(source), object);
}

$m['lodash/_copySymbols.js#4.15.0'] = _lodashcopySymbolsjs4150_copySymbols;

/*== node_modules/lodash/_cloneBuffer.js ==*/
$m['lodash/_cloneBuffer.js#4.15.0'] = {};
/**
 * Creates a clone of  `buffer`.
 *
 * @private
 * @param {Buffer} buffer The buffer to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Buffer} Returns the cloned buffer.
 */
function _lodashcloneBufferjs4150_cloneBuffer(buffer, isDeep) {
  if (isDeep) {
    return buffer.slice();
  }
  var result = new buffer.constructor(buffer.length);
  buffer.copy(result);
  return result;
}

$m['lodash/_cloneBuffer.js#4.15.0'] = _lodashcloneBufferjs4150_cloneBuffer;

/*== node_modules/lodash/_baseAssign.js ==*/
$m['lodash/_baseAssign.js#4.15.0'] = {};
var _lodashbaseAssignjs4150_copyObject = $m['lodash/_copyObject.js#4.15.0'],
    _lodashbaseAssignjs4150_keys = $m['lodash/keys.js#4.15.0'];

/**
 * The base implementation of `_.assign` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function _lodashbaseAssignjs4150_baseAssign(object, source) {
  return object && _lodashbaseAssignjs4150_copyObject(source, _lodashbaseAssignjs4150_keys(source), object);
}

$m['lodash/_baseAssign.js#4.15.0'] = _lodashbaseAssignjs4150_baseAssign;

/*== node_modules/lodash/_arrayEach.js ==*/
$m['lodash/_arrayEach.js#4.15.0'] = {};
/**
 * A specialized version of `_.forEach` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function _lodasharrayEachjs4150_arrayEach(array, iteratee) {
  var index = -1,
      length = array ? array.length : 0;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

$m['lodash/_arrayEach.js#4.15.0'] = _lodasharrayEachjs4150_arrayEach;

/*== node_modules/lodash/_baseClone.js ==*/
$m['lodash/_baseClone.js#4.15.0'] = {};
var _lodashbaseClonejs4150_Stack = $m['lodash/_Stack.js#4.15.0'],
    _lodashbaseClonejs4150_arrayEach = $m['lodash/_arrayEach.js#4.15.0'],
    _lodashbaseClonejs4150_assignValue = $m['lodash/_assignValue.js#4.15.0'],
    _lodashbaseClonejs4150_baseAssign = $m['lodash/_baseAssign.js#4.15.0'],
    _lodashbaseClonejs4150_cloneBuffer = $m['lodash/_cloneBuffer.js#4.15.0'],
    _lodashbaseClonejs4150_copyArray = $m['lodash/_copyArray.js#4.15.0'],
    _lodashbaseClonejs4150_copySymbols = $m['lodash/_copySymbols.js#4.15.0'],
    _lodashbaseClonejs4150_getAllKeys = $m['lodash/_getAllKeys.js#4.15.0'],
    _lodashbaseClonejs4150_getTag = $m['lodash/_getTag.js#4.15.0'],
    _lodashbaseClonejs4150_initCloneArray = $m['lodash/_initCloneArray.js#4.15.0'],
    _lodashbaseClonejs4150_initCloneByTag = $m['lodash/_initCloneByTag.js#4.15.0'],
    _lodashbaseClonejs4150_initCloneObject = $m['lodash/_initCloneObject.js#4.15.0'],
    _lodashbaseClonejs4150_isArray = $m['lodash/isArray.js#4.15.0'],
    _lodashbaseClonejs4150_isBuffer = $m['lodash/isBuffer.js#4.15.0'],
    _lodashbaseClonejs4150_isHostObject = $m['lodash/_isHostObject.js#4.15.0'],
    _lodashbaseClonejs4150_isObject = $m['lodash/isObject.js#4.15.0'],
    _lodashbaseClonejs4150_keys = $m['lodash/keys.js#4.15.0'];

/** `Object#toString` result references. */
var _lodashbaseClonejs4150_argsTag = '[object Arguments]',
    _lodashbaseClonejs4150_arrayTag = '[object Array]',
    _lodashbaseClonejs4150_boolTag = '[object Boolean]',
    _lodashbaseClonejs4150_dateTag = '[object Date]',
    _lodashbaseClonejs4150_errorTag = '[object Error]',
    _lodashbaseClonejs4150_funcTag = '[object Function]',
    _lodashbaseClonejs4150_genTag = '[object GeneratorFunction]',
    _lodashbaseClonejs4150_mapTag = '[object Map]',
    _lodashbaseClonejs4150_numberTag = '[object Number]',
    _lodashbaseClonejs4150_objectTag = '[object Object]',
    _lodashbaseClonejs4150_regexpTag = '[object RegExp]',
    _lodashbaseClonejs4150_setTag = '[object Set]',
    _lodashbaseClonejs4150_stringTag = '[object String]',
    _lodashbaseClonejs4150_symbolTag = '[object Symbol]',
    _lodashbaseClonejs4150_weakMapTag = '[object WeakMap]';

var _lodashbaseClonejs4150_arrayBufferTag = '[object ArrayBuffer]',
    _lodashbaseClonejs4150_dataViewTag = '[object DataView]',
    _lodashbaseClonejs4150_float32Tag = '[object Float32Array]',
    _lodashbaseClonejs4150_float64Tag = '[object Float64Array]',
    _lodashbaseClonejs4150_int8Tag = '[object Int8Array]',
    _lodashbaseClonejs4150_int16Tag = '[object Int16Array]',
    _lodashbaseClonejs4150_int32Tag = '[object Int32Array]',
    _lodashbaseClonejs4150_uint8Tag = '[object Uint8Array]',
    _lodashbaseClonejs4150_uint8ClampedTag = '[object Uint8ClampedArray]',
    _lodashbaseClonejs4150_uint16Tag = '[object Uint16Array]',
    _lodashbaseClonejs4150_uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values supported by `_.clone`. */
var _lodashbaseClonejs4150_cloneableTags = {};
_lodashbaseClonejs4150_cloneableTags[_lodashbaseClonejs4150_argsTag] = _lodashbaseClonejs4150_cloneableTags[_lodashbaseClonejs4150_arrayTag] = _lodashbaseClonejs4150_cloneableTags[_lodashbaseClonejs4150_arrayBufferTag] = _lodashbaseClonejs4150_cloneableTags[_lodashbaseClonejs4150_dataViewTag] = _lodashbaseClonejs4150_cloneableTags[_lodashbaseClonejs4150_boolTag] = _lodashbaseClonejs4150_cloneableTags[_lodashbaseClonejs4150_dateTag] = _lodashbaseClonejs4150_cloneableTags[_lodashbaseClonejs4150_float32Tag] = _lodashbaseClonejs4150_cloneableTags[_lodashbaseClonejs4150_float64Tag] = _lodashbaseClonejs4150_cloneableTags[_lodashbaseClonejs4150_int8Tag] = _lodashbaseClonejs4150_cloneableTags[_lodashbaseClonejs4150_int16Tag] = _lodashbaseClonejs4150_cloneableTags[_lodashbaseClonejs4150_int32Tag] = _lodashbaseClonejs4150_cloneableTags[_lodashbaseClonejs4150_mapTag] = _lodashbaseClonejs4150_cloneableTags[_lodashbaseClonejs4150_numberTag] = _lodashbaseClonejs4150_cloneableTags[_lodashbaseClonejs4150_objectTag] = _lodashbaseClonejs4150_cloneableTags[_lodashbaseClonejs4150_regexpTag] = _lodashbaseClonejs4150_cloneableTags[_lodashbaseClonejs4150_setTag] = _lodashbaseClonejs4150_cloneableTags[_lodashbaseClonejs4150_stringTag] = _lodashbaseClonejs4150_cloneableTags[_lodashbaseClonejs4150_symbolTag] = _lodashbaseClonejs4150_cloneableTags[_lodashbaseClonejs4150_uint8Tag] = _lodashbaseClonejs4150_cloneableTags[_lodashbaseClonejs4150_uint8ClampedTag] = _lodashbaseClonejs4150_cloneableTags[_lodashbaseClonejs4150_uint16Tag] = _lodashbaseClonejs4150_cloneableTags[_lodashbaseClonejs4150_uint32Tag] = true;
_lodashbaseClonejs4150_cloneableTags[_lodashbaseClonejs4150_errorTag] = _lodashbaseClonejs4150_cloneableTags[_lodashbaseClonejs4150_funcTag] = _lodashbaseClonejs4150_cloneableTags[_lodashbaseClonejs4150_weakMapTag] = false;

/**
 * The base implementation of `_.clone` and `_.cloneDeep` which tracks
 * traversed objects.
 *
 * @private
 * @param {*} value The value to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @param {boolean} [isFull] Specify a clone including symbols.
 * @param {Function} [customizer] The function to customize cloning.
 * @param {string} [key] The key of `value`.
 * @param {Object} [object] The parent object of `value`.
 * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
 * @returns {*} Returns the cloned value.
 */
function _lodashbaseClonejs4150_baseClone(value, isDeep, isFull, customizer, key, object, stack) {
  var result;
  if (customizer) {
    result = object ? customizer(value, key, object, stack) : customizer(value);
  }
  if (result !== undefined) {
    return result;
  }
  if (!_lodashbaseClonejs4150_isObject(value)) {
    return value;
  }
  var isArr = _lodashbaseClonejs4150_isArray(value);
  if (isArr) {
    result = _lodashbaseClonejs4150_initCloneArray(value);
    if (!isDeep) {
      return _lodashbaseClonejs4150_copyArray(value, result);
    }
  } else {
    var tag = _lodashbaseClonejs4150_getTag(value),
        isFunc = tag == _lodashbaseClonejs4150_funcTag || tag == _lodashbaseClonejs4150_genTag;

    if (_lodashbaseClonejs4150_isBuffer(value)) {
      return _lodashbaseClonejs4150_cloneBuffer(value, isDeep);
    }
    if (tag == _lodashbaseClonejs4150_objectTag || tag == _lodashbaseClonejs4150_argsTag || isFunc && !object) {
      if (_lodashbaseClonejs4150_isHostObject(value)) {
        return object ? value : {};
      }
      result = _lodashbaseClonejs4150_initCloneObject(isFunc ? {} : value);
      if (!isDeep) {
        return _lodashbaseClonejs4150_copySymbols(value, _lodashbaseClonejs4150_baseAssign(result, value));
      }
    } else {
      if (!_lodashbaseClonejs4150_cloneableTags[tag]) {
        return object ? value : {};
      }
      result = _lodashbaseClonejs4150_initCloneByTag(value, tag, _lodashbaseClonejs4150_baseClone, isDeep);
    }
  }
  // Check for circular references and return its corresponding clone.
  stack || (stack = new _lodashbaseClonejs4150_Stack());
  var stacked = stack.get(value);
  if (stacked) {
    return stacked;
  }
  stack.set(value, result);

  if (!isArr) {
    var props = isFull ? _lodashbaseClonejs4150_getAllKeys(value) : _lodashbaseClonejs4150_keys(value);
  }
  _lodashbaseClonejs4150_arrayEach(props || value, function (subValue, key) {
    if (props) {
      key = subValue;
      subValue = value[key];
    }
    // Recursively populate clone (susceptible to call stack limits).
    _lodashbaseClonejs4150_assignValue(result, key, _lodashbaseClonejs4150_baseClone(subValue, isDeep, isFull, customizer, key, value, stack));
  });
  return result;
}

$m['lodash/_baseClone.js#4.15.0'] = _lodashbaseClonejs4150_baseClone;

/*== node_modules/lodash/_assignMergeValue.js ==*/
$m['lodash/_assignMergeValue.js#4.15.0'] = {};
var _lodashassignMergeValuejs4150_eq = $m['lodash/eq.js#4.15.0'];

/**
 * This function is like `assignValue` except that it doesn't assign
 * `undefined` values.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function _lodashassignMergeValuejs4150_assignMergeValue(object, key, value) {
  if (value !== undefined && !_lodashassignMergeValuejs4150_eq(object[key], value) || typeof key == 'number' && value === undefined && !(key in object)) {
    object[key] = value;
  }
}

$m['lodash/_assignMergeValue.js#4.15.0'] = _lodashassignMergeValuejs4150_assignMergeValue;

/*== node_modules/lodash/_baseMergeDeep.js ==*/
$m['lodash/_baseMergeDeep.js#4.15.0'] = {};
var _lodashbaseMergeDeepjs4150_assignMergeValue = $m['lodash/_assignMergeValue.js#4.15.0'],
    _lodashbaseMergeDeepjs4150_baseClone = $m['lodash/_baseClone.js#4.15.0'],
    _lodashbaseMergeDeepjs4150_copyArray = $m['lodash/_copyArray.js#4.15.0'],
    _lodashbaseMergeDeepjs4150_isArguments = $m['lodash/isArguments.js#4.15.0'],
    _lodashbaseMergeDeepjs4150_isArray = $m['lodash/isArray.js#4.15.0'],
    _lodashbaseMergeDeepjs4150_isArrayLikeObject = $m['lodash/isArrayLikeObject.js#4.15.0'],
    _lodashbaseMergeDeepjs4150_isFunction = $m['lodash/isFunction.js#4.15.0'],
    _lodashbaseMergeDeepjs4150_isObject = $m['lodash/isObject.js#4.15.0'],
    _lodashbaseMergeDeepjs4150_isPlainObject = $m['lodash/isPlainObject.js#4.15.0'],
    _lodashbaseMergeDeepjs4150_isTypedArray = $m['lodash/isTypedArray.js#4.15.0'],
    _lodashbaseMergeDeepjs4150_toPlainObject = $m['lodash/toPlainObject.js#4.15.0'];

/**
 * A specialized version of `baseMerge` for arrays and objects which performs
 * deep merges and tracks traversed objects enabling objects with circular
 * references to be merged.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {string} key The key of the value to merge.
 * @param {number} srcIndex The index of `source`.
 * @param {Function} mergeFunc The function to merge values.
 * @param {Function} [customizer] The function to customize assigned values.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 */
function _lodashbaseMergeDeepjs4150_baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
  var objValue = object[key],
      srcValue = source[key],
      stacked = stack.get(srcValue);

  if (stacked) {
    _lodashbaseMergeDeepjs4150_assignMergeValue(object, key, stacked);
    return;
  }
  var newValue = customizer ? customizer(objValue, srcValue, key + '', object, source, stack) : undefined;

  var isCommon = newValue === undefined;

  if (isCommon) {
    newValue = srcValue;
    if (_lodashbaseMergeDeepjs4150_isArray(srcValue) || _lodashbaseMergeDeepjs4150_isTypedArray(srcValue)) {
      if (_lodashbaseMergeDeepjs4150_isArray(objValue)) {
        newValue = objValue;
      } else if (_lodashbaseMergeDeepjs4150_isArrayLikeObject(objValue)) {
        newValue = _lodashbaseMergeDeepjs4150_copyArray(objValue);
      } else {
        isCommon = false;
        newValue = _lodashbaseMergeDeepjs4150_baseClone(srcValue, true);
      }
    } else if (_lodashbaseMergeDeepjs4150_isPlainObject(srcValue) || _lodashbaseMergeDeepjs4150_isArguments(srcValue)) {
      if (_lodashbaseMergeDeepjs4150_isArguments(objValue)) {
        newValue = _lodashbaseMergeDeepjs4150_toPlainObject(objValue);
      } else if (!_lodashbaseMergeDeepjs4150_isObject(objValue) || srcIndex && _lodashbaseMergeDeepjs4150_isFunction(objValue)) {
        isCommon = false;
        newValue = _lodashbaseMergeDeepjs4150_baseClone(srcValue, true);
      } else {
        newValue = objValue;
      }
    } else {
      isCommon = false;
    }
  }
  if (isCommon) {
    // Recursively merge objects and arrays (susceptible to call stack limits).
    stack.set(srcValue, newValue);
    mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
    stack['delete'](srcValue);
  }
  _lodashbaseMergeDeepjs4150_assignMergeValue(object, key, newValue);
}

$m['lodash/_baseMergeDeep.js#4.15.0'] = _lodashbaseMergeDeepjs4150_baseMergeDeep;

/*== node_modules/lodash/_baseMerge.js ==*/
$m['lodash/_baseMerge.js#4.15.0'] = {};
var _lodashbaseMergejs4150_Stack = $m['lodash/_Stack.js#4.15.0'],
    _lodashbaseMergejs4150_arrayEach = $m['lodash/_arrayEach.js#4.15.0'],
    _lodashbaseMergejs4150_assignMergeValue = $m['lodash/_assignMergeValue.js#4.15.0'],
    _lodashbaseMergejs4150_baseKeysIn = $m['lodash/_baseKeysIn.js#4.15.0'],
    _lodashbaseMergejs4150_baseMergeDeep = $m['lodash/_baseMergeDeep.js#4.15.0'],
    _lodashbaseMergejs4150_isArray = $m['lodash/isArray.js#4.15.0'],
    _lodashbaseMergejs4150_isObject = $m['lodash/isObject.js#4.15.0'],
    _lodashbaseMergejs4150_isTypedArray = $m['lodash/isTypedArray.js#4.15.0'];

/**
 * The base implementation of `_.merge` without support for multiple sources.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {number} srcIndex The index of `source`.
 * @param {Function} [customizer] The function to customize merged values.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 */
function _lodashbaseMergejs4150_baseMerge(object, source, srcIndex, customizer, stack) {
  if (object === source) {
    return;
  }
  if (!(_lodashbaseMergejs4150_isArray(source) || _lodashbaseMergejs4150_isTypedArray(source))) {
    var props = _lodashbaseMergejs4150_baseKeysIn(source);
  }
  _lodashbaseMergejs4150_arrayEach(props || source, function (srcValue, key) {
    if (props) {
      key = srcValue;
      srcValue = source[key];
    }
    if (_lodashbaseMergejs4150_isObject(srcValue)) {
      stack || (stack = new _lodashbaseMergejs4150_Stack());
      _lodashbaseMergejs4150_baseMergeDeep(object, source, key, srcIndex, _lodashbaseMergejs4150_baseMerge, customizer, stack);
    } else {
      var newValue = customizer ? customizer(object[key], srcValue, key + '', object, source, stack) : undefined;

      if (newValue === undefined) {
        newValue = srcValue;
      }
      _lodashbaseMergejs4150_assignMergeValue(object, key, newValue);
    }
  });
}

$m['lodash/_baseMerge.js#4.15.0'] = _lodashbaseMergejs4150_baseMerge;

/*== node_modules/lodash/merge.js ==*/
$m['lodash/merge.js#4.15.0'] = {};
var _lodashmergejs4150_baseMerge = $m['lodash/_baseMerge.js#4.15.0'],
    _lodashmergejs4150_createAssigner = $m['lodash/_createAssigner.js#4.15.0'];

/**
 * This method is like `_.assign` except that it recursively merges own and
 * inherited enumerable string keyed properties of source objects into the
 * destination object. Source properties that resolve to `undefined` are
 * skipped if a destination value exists. Array and plain object properties
 * are merged recursively. Other objects and value types are overridden by
 * assignment. Source objects are applied from left to right. Subsequent
 * sources overwrite property assignments of previous sources.
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @memberOf _
 * @since 0.5.0
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @example
 *
 * var object = {
 *   'a': [{ 'b': 2 }, { 'd': 4 }]
 * };
 *
 * var other = {
 *   'a': [{ 'c': 3 }, { 'e': 5 }]
 * };
 *
 * _.merge(object, other);
 * // => { 'a': [{ 'b': 2, 'c': 3 }, { 'd': 4, 'e': 5 }] }
 */
var _lodashmergejs4150_merge = _lodashmergejs4150_createAssigner(function (object, source, srcIndex) {
  _lodashmergejs4150_baseMerge(object, source, srcIndex);
});

$m['lodash/merge.js#4.15.0'] = _lodashmergejs4150_merge;

/*== lib/config/filetype.js ==*/
$m['lib/config/filetype.js'] = {};
'use strict';

const _libconfigfiletypejs_path = require('path');

/**
 * Determine type of 'filepath'
 * @param {String} filepath
 * @param {Object} fileExtensions
 * @returns {String}
 */
$m['lib/config/filetype.js'] = function filetype(filepath, fileExtensions) {
  const ext = _libconfigfiletypejs_path.extname(filepath).slice(1);

  // Match input extension to type
  for (const t in fileExtensions) {
    const exts = fileExtensions[t];

    for (let i = 0, n = exts.length; i < n; i++) {
      if (ext == exts[i]) return t;
    }
  }

  return 'unknown';
};

/*== node_modules/lodash/union.js ==*/
$m['lodash/union.js#4.15.0'] = {};
var _lodashunionjs4150_baseFlatten = $m['lodash/_baseFlatten.js#4.15.0'],
    _lodashunionjs4150_baseRest = $m['lodash/_baseRest.js#4.15.0'],
    _lodashunionjs4150_baseUniq = $m['lodash/_baseUniq.js#4.15.0'],
    _lodashunionjs4150_isArrayLikeObject = $m['lodash/isArrayLikeObject.js#4.15.0'];

/**
 * Creates an array of unique values, in order, from all given arrays using
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {...Array} [arrays] The arrays to inspect.
 * @returns {Array} Returns the new array of combined values.
 * @example
 *
 * _.union([2], [1, 2]);
 * // => [2, 1]
 */
var _lodashunionjs4150_union = _lodashunionjs4150_baseRest(function (arrays) {
  return _lodashunionjs4150_baseUniq(_lodashunionjs4150_baseFlatten(arrays, 1, _lodashunionjs4150_isArrayLikeObject, true));
});

$m['lodash/union.js#4.15.0'] = _lodashunionjs4150_union;

/*== lib/identify-resource/config.js ==*/
$m['lib/identify-resource/config.js'] = {};
'use strict';

const _libidentifyresourceconfigjs_path = require('path');
const _libidentifyresourceconfigjs_union = $m['lodash/union.js#4.15.0'];

const _libidentifyresourceconfigjs_DEFAULT_EXTENSIONS = {
  js: ['js', 'json'],
  css: ['css'],
  html: ['html']
};
const _libidentifyresourceconfigjs_NATIVE_MODULES = require('repl')._builtinLibs.concat('repl');

/**
 * Parse and format 'options'
 * @param {Object} [options]
 * @returns {Object}
 */
$m['lib/identify-resource/config.js'] = function config(options) {
  options = options || {};
  options.fileExtensions = options.fileExtensions || {};

  return {
    fileExtensions: {
      js: _libidentifyresourceconfigjs_union(options.fileExtensions.js || [], _libidentifyresourceconfigjs_DEFAULT_EXTENSIONS.js),
      css: _libidentifyresourceconfigjs_union(options.fileExtensions.css || [], _libidentifyresourceconfigjs_DEFAULT_EXTENSIONS.css),
      html: _libidentifyresourceconfigjs_union(options.fileExtensions.html || [], _libidentifyresourceconfigjs_DEFAULT_EXTENSIONS.html)
    },
    nativeModules: _libidentifyresourceconfigjs_NATIVE_MODULES,
    sources: (options.sources || []).map(source => _libidentifyresourceconfigjs_path.resolve(source))
  };
};

// Expose
$m['lib/identify-resource/config.js'].VERSION_DELIMITER = '#';
$m['lib/identify-resource/config.js'].nativeModules = _libidentifyresourceconfigjs_NATIVE_MODULES;

/*== lib/identify-resource/cache.js ==*/
$m['lib/identify-resource/cache.js'] = {};
'use strict';

const { VERSION_DELIMITER: _libidentifyresourcecachejs_VERSION_DELIMITER } = $m['lib/identify-resource/config.js'];
let _libidentifyresourcecachejs_packageCache = {};
let _libidentifyresourcecachejs_versionedFileCache = {};
let _libidentifyresourcecachejs_fileCache = {};

$m['lib/identify-resource/cache.js'] = {
  /**
   * Retrieve id or filepath for 'key'
   * @param {String} key
   * @returns {String}
   */
  getFile(key) {
    return _libidentifyresourcecachejs_fileCache[key];
  },

  /**
   * Add 'file' to cache
   * @param {Object} file
   */
  setFile(file) {
    // Make sure not to overwrite
    if (file.path && file.id && !_libidentifyresourcecachejs_fileCache[file.path] && !_libidentifyresourcecachejs_fileCache[file.id]) {
      _libidentifyresourcecachejs_fileCache[file.path] = file.id;
      _libidentifyresourcecachejs_fileCache[file.id] = file.path;
      // Store in versioned cash to enable multiple version check
      if (~file.id.indexOf(_libidentifyresourcecachejs_VERSION_DELIMITER)) {
        const name = file.id.split(_libidentifyresourcecachejs_VERSION_DELIMITER)[0];

        if (!_libidentifyresourcecachejs_versionedFileCache[name]) {
          _libidentifyresourcecachejs_versionedFileCache[name] = 1;
        } else {
          _libidentifyresourcecachejs_versionedFileCache[name]++;
        }
      }
    }
  },

  /**
   * Retrieve package details for 'key',
   * where 'key' is one of pakcage id or path
   * @param {String} key
   * @returns {Object}
   */
  getPackage(key) {
    return _libidentifyresourcecachejs_packageCache[key];
  },

  /**
   * Add 'pkg' to cache
   * @param {Object} pkg
   */
  setPackage(pkg) {
    // Make sure not to overwrite
    if (!_libidentifyresourcecachejs_packageCache[pkg.pkgpath] && !_libidentifyresourcecachejs_packageCache[pkg.id]) {
      _libidentifyresourcecachejs_packageCache[pkg.pkgpath] = pkg;
      _libidentifyresourcecachejs_packageCache[pkg.id] = pkg;
    }
  },

  /**
   * Determine if there is more than one version of 'id'
   * @param {String} id
   * @returns {Boolean}
   */
  hasMultipleVersions(id) {
    if (~id.indexOf(_libidentifyresourcecachejs_VERSION_DELIMITER)) {
      return _libidentifyresourcecachejs_versionedFileCache[id.split(_libidentifyresourcecachejs_VERSION_DELIMITER)[0]] > 1;
    }
    return false;
  },

  /**
   * Clear the cache
   */
  clear() {
    _libidentifyresourcecachejs_fileCache = {};
    _libidentifyresourcecachejs_packageCache = {};
    _libidentifyresourcecachejs_versionedFileCache = {};
  }
};

/*== node_modules/yaw/index.js ==*/
$m['yaw/index.js#0.1.1'] = {};
var _yawindexjs011_fs = require('fs'),
    _yawindexjs011_path = require('path'),
    _yawindexjs011_util = require("util"),
    _yawindexjs011_EventEmitter = require('events').EventEmitter,
    _yawindexjs011_existsSync = _yawindexjs011_fs.existsSync || _yawindexjs011_path.existsSync,
    _yawindexjs011_RE_IGNORE = /^[.~]|~$/,
    _yawindexjs011_THROTTLE_TIMEOUT = 100;

$m['yaw/index.js#0.1.1'] = _yawindexjs011_Watcher;

/**
 * Constructor
 */
function _yawindexjs011_Watcher() {
	_yawindexjs011_EventEmitter.call(this);

	this.watchers = {};
	this._throttling = {
		'create': 0,
		'delete': 0,
		'change': 0
	};
}

// Inherit
_yawindexjs011_util.inherits(_yawindexjs011_Watcher, _yawindexjs011_EventEmitter);

/**
 * Watch a 'source' file or directory for changes
 * @param {String} source
 */
_yawindexjs011_Watcher.prototype.watch = function (source) {
	var self = this;

	if (!_yawindexjs011_RE_IGNORE.test(_yawindexjs011_path.basename(source))) {
		_yawindexjs011_fs.stat(source, function (err, stats) {
			var lastChange;
			if (err) {
				self.emit('error', err);
			} else {
				lastChange = stats.mtime.getTime();
				// Recursively parse items in directory
				if (stats.isDirectory()) {
					_yawindexjs011_fs.readdir(source, function (err, files) {
						if (err) self.emit('error', err);
						files.forEach(function (file) {
							self.watch(_yawindexjs011_path.resolve(source, file));
						});
					});
				}
			}

			// Store watcher objects
			self.watchers[source] = _yawindexjs011_fs.watch(source, function (evt, filename) {
				if (_yawindexjs011_existsSync(source)) {
					_yawindexjs011_fs.stat(source, function (err, stats) {
						if (err) {
							self.emit('error', err);
						} else {
							if (stats.isFile()) {
								// Notify if changed
								if (stats.mtime.getTime() !== lastChange) {
									self._throttleEvent('change', source, stats);
								}
								lastChange = stats.mtime.getTime();
							} else if (stats.isDirectory()) {
								_yawindexjs011_fs.readdir(source, function (err, files) {
									if (err) {
										self.emit('error', err);
									} else {
										files.forEach(function (file) {
											var item = _yawindexjs011_path.resolve(source, file);
											// New file or directory
											if (!_yawindexjs011_RE_IGNORE.test(_yawindexjs011_path.basename(item)) && !self.watchers[item]) {
												_yawindexjs011_fs.stat(item, function (err, stats) {
													self._throttleEvent('create', item, stats);
													self.watch(item);
												});
											}
										});
									}
								});
							}
						}
					});
					// Deleted
				} else {
					self.unwatch(source);
					self._throttleEvent('delete', source);
				}
			});
		});
	}
};

/**
 * Stop watching a 'source' file or directory for changes
 * @param {String} source
 */
_yawindexjs011_Watcher.prototype.unwatch = function (source) {
	var watcher = this.watchers[source];
	if (watcher) {
		delete this.watchers[source];
		try {
			watcher.close();
		} catch (err) {}
	}
};

/**
 * Stop watching all sources for changes
 */
_yawindexjs011_Watcher.prototype.clean = function () {
	for (var source in this.watchers) {
		this.unwatch(source);
	}
	for (var type in this._throttling) {
		clearInterval(this._throttling[type]);
		this._throttling[type] = 0;
	}
};

/**
 * Protect against mutiple event emits
 * @param {String} type
 * @param [props]
 */
_yawindexjs011_Watcher.prototype._throttleEvent = function (type) {
	var self = this,
	    props = 2 <= arguments.length ? Array.prototype.slice.call(arguments, 1) : [];
	if (!this._throttling[type]) {
		this.emit.apply(this, [type].concat(props));
		this._throttling[type] = setTimeout(function () {
			self._throttling[type] = 0;
		}, _yawindexjs011_THROTTLE_TIMEOUT);
	}
};

/*== lib/config/fileCache.js ==*/
$m['lib/config/fileCache.js'] = {};
'use strict';

const _libconfigfileCachejs_EventEmitter = require('events').EventEmitter;
const _libconfigfileCachejs_path = require('path');
const _libconfigfileCachejs_Watcher = $m['yaw/index.js#0.1.1'];

// Export
$m['lib/config/fileCache.js'] = function fileCacheFactory(watch) {
  return new _libconfigfileCachejs_FileCache(watch);
};

class _libconfigfileCachejs_FileCache extends _libconfigfileCachejs_EventEmitter {
  /**
   * Constructor
   * @param {Boolean} watch
   */
  constructor(watch) {
    super();

    this._cache = {};
    this._dirs = [];
    this.watching = watch;

    if (watch) {
      this.watcher = new _libconfigfileCachejs_Watcher();
      this.watcher.on('change', this.onWatchChange.bind(this));
      this.watcher.on('delete', this.onWatchDelete.bind(this));
      this.watcher.on('error', this.onWatchError.bind(this));
    }
  }

  /**
   * Store a 'file' in the cache
   * @param {File} file
   * @returns {File}
   */
  addFile(file) {
    if (!this._cache[file.filepath]) {
      const dir = _libconfigfileCachejs_path.dirname(file.filepath);

      this._cache[file.filepath] = file;
      if (!~this._dirs.indexOf(dir)) this._dirs.push(dir);
      if (this.watching) this.watcher.watch(file.filepath);
    }

    return file;
  }

  /**
   * Remove a file from the cache by it's 'filepath'
   * @param {Object} file
   * @returns {File}
   */
  removeFile(file) {
    delete this._cache[file.filepath];
    if (this.watching) this.watcher.unwatch(file.filepath);
    return file;
  }

  /**
   * Retrieve a file from the cache by 'key' (filepath or type:id)
   * @param {String} key
   * @returns {Object}
   */
  getFile(key) {
    return this._cache[key];
  }

  /**
   * Determine if the cache contains a file by 'key' (filepath or type:id)
   * @param {String} key
   * @returns {Boolean}
   */
  hasFile(key) {
    return this._cache[key] != null;
  }

  /**
   * Retrieve all file paths
   * @returns {Array}
   */
  getPaths() {
    return Object.keys(this._cache);
  }

  /**
   * Retrieve all unique directories
   * @returns {Array}
   */
  getDirs() {
    return this._dirs;
  }

  /**
   * Flush the cache
   */
  flush() {
    if (this.watching) this.watcher.clean();
    this._cache = {};
    this._dirs = [];
  }

  /**
   * Handle changes to watched files
   * @param {String} filepath
   * @param {Stats} stats
   */
  onWatchChange(filepath, stats) {
    const file = this._cache[filepath];

    // Reset file
    if (file) {
      // Hard reset
      file.reset(true);
      this.emit('change', file);
    }
  }

  /**
   * Handle deleted watched files
   * @param {String} filepath
   */
  onWatchDelete(filepath) {
    const file = this._cache[filepath];

    // Destroy file
    if (file) {
      file.destroy();
      this.removeFile(file);
    }
  }

  /**
   * Handle error watching files
   * @param {Error} err
   */
  onWatchError(err) {
    this.emit('error', err);
  }
}

/*== node_modules/lodash/uniq.js ==*/
$m['lodash/uniq.js#4.15.0'] = {};
var _lodashuniqjs4150_baseUniq = $m['lodash/_baseUniq.js#4.15.0'];

/**
 * Creates a duplicate-free version of an array, using
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons, in which only the first occurrence of each
 * element is kept.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to inspect.
 * @returns {Array} Returns the new duplicate free array.
 * @example
 *
 * _.uniq([2, 1, 2]);
 * // => [2, 1]
 */
function _lodashuniqjs4150_uniq(array) {
  return array && array.length ? _lodashuniqjs4150_baseUniq(array) : [];
}

$m['lodash/uniq.js#4.15.0'] = _lodashuniqjs4150_uniq;

/*== node_modules/is-buffer/index.js ==*/
$m['is-buffer/index.js#1.1.4'] = {};
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
$m['is-buffer/index.js#1.1.4'] = function (obj) {
  return obj != null && (_isbufferindexjs114_isBuffer(obj) || _isbufferindexjs114_isSlowBuffer(obj) || !!obj._isBuffer);
};

function _isbufferindexjs114_isBuffer(obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj);
}

// For Node v0.10 support. Remove this eventually.
function _isbufferindexjs114_isSlowBuffer(obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && _isbufferindexjs114_isBuffer(obj.slice(0, 0));
}

/*== node_modules/charenc/charenc.js ==*/
$m['charenc/charenc.js#0.0.1'] = {};
var _charenccharencjs001_charenc = {
  // UTF-8 encoding
  utf8: {
    // Convert a string to a byte array
    stringToBytes: function (str) {
      return _charenccharencjs001_charenc.bin.stringToBytes(unescape(encodeURIComponent(str)));
    },

    // Convert a byte array to a string
    bytesToString: function (bytes) {
      return decodeURIComponent(escape(_charenccharencjs001_charenc.bin.bytesToString(bytes)));
    }
  },

  // Binary encoding
  bin: {
    // Convert a string to a byte array
    stringToBytes: function (str) {
      for (var bytes = [], i = 0; i < str.length; i++) bytes.push(str.charCodeAt(i) & 0xFF);
      return bytes;
    },

    // Convert a byte array to a string
    bytesToString: function (bytes) {
      for (var str = [], i = 0; i < bytes.length; i++) str.push(String.fromCharCode(bytes[i]));
      return str.join('');
    }
  }
};

$m['charenc/charenc.js#0.0.1'] = _charenccharencjs001_charenc;

/*== node_modules/crypt/crypt.js ==*/
$m['crypt/crypt.js#0.0.1'] = {};
(function () {
  var base64map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
      crypt = {
    // Bit-wise rotation left
    rotl: function (n, b) {
      return n << b | n >>> 32 - b;
    },

    // Bit-wise rotation right
    rotr: function (n, b) {
      return n << 32 - b | n >>> b;
    },

    // Swap big-endian to little-endian and vice versa
    endian: function (n) {
      // If number given, swap endian
      if (n.constructor == Number) {
        return crypt.rotl(n, 8) & 0x00FF00FF | crypt.rotl(n, 24) & 0xFF00FF00;
      }

      // Else, assume array and swap all items
      for (var i = 0; i < n.length; i++) n[i] = crypt.endian(n[i]);
      return n;
    },

    // Generate an array of any length of random bytes
    randomBytes: function (n) {
      for (var bytes = []; n > 0; n--) bytes.push(Math.floor(Math.random() * 256));
      return bytes;
    },

    // Convert a byte array to big-endian 32-bit words
    bytesToWords: function (bytes) {
      for (var words = [], i = 0, b = 0; i < bytes.length; i++, b += 8) words[b >>> 5] |= bytes[i] << 24 - b % 32;
      return words;
    },

    // Convert big-endian 32-bit words to a byte array
    wordsToBytes: function (words) {
      for (var bytes = [], b = 0; b < words.length * 32; b += 8) bytes.push(words[b >>> 5] >>> 24 - b % 32 & 0xFF);
      return bytes;
    },

    // Convert a byte array to a hex string
    bytesToHex: function (bytes) {
      for (var hex = [], i = 0; i < bytes.length; i++) {
        hex.push((bytes[i] >>> 4).toString(16));
        hex.push((bytes[i] & 0xF).toString(16));
      }
      return hex.join('');
    },

    // Convert a hex string to a byte array
    hexToBytes: function (hex) {
      for (var bytes = [], c = 0; c < hex.length; c += 2) bytes.push(parseInt(hex.substr(c, 2), 16));
      return bytes;
    },

    // Convert a byte array to a base-64 string
    bytesToBase64: function (bytes) {
      for (var base64 = [], i = 0; i < bytes.length; i += 3) {
        var triplet = bytes[i] << 16 | bytes[i + 1] << 8 | bytes[i + 2];
        for (var j = 0; j < 4; j++) if (i * 8 + j * 6 <= bytes.length * 8) base64.push(base64map.charAt(triplet >>> 6 * (3 - j) & 0x3F));else base64.push('=');
      }
      return base64.join('');
    },

    // Convert a base-64 string to a byte array
    base64ToBytes: function (base64) {
      // Remove non-base-64 characters
      base64 = base64.replace(/[^A-Z0-9+\/]/ig, '');

      for (var bytes = [], i = 0, imod4 = 0; i < base64.length; imod4 = ++i % 4) {
        if (imod4 == 0) continue;
        bytes.push((base64map.indexOf(base64.charAt(i - 1)) & Math.pow(2, -2 * imod4 + 8) - 1) << imod4 * 2 | base64map.indexOf(base64.charAt(i)) >>> 6 - imod4 * 2);
      }
      return bytes;
    }
  };

  $m['crypt/crypt.js#0.0.1'] = crypt;
})();

/*== node_modules/md5/md5.js ==*/
$m['md5/md5.js#2.2.1'] = {};
(function () {
  var crypt = $m['crypt/crypt.js#0.0.1'],
      utf8 = $m['charenc/charenc.js#0.0.1'].utf8,
      isBuffer = $m['is-buffer/index.js#1.1.4'],
      bin = $m['charenc/charenc.js#0.0.1'].bin,


  // The core
  md5 = function (message, options) {
    // Convert to byte array
    if (message.constructor == String) {
      if (options && options.encoding === 'binary') message = bin.stringToBytes(message);else message = utf8.stringToBytes(message);
    } else if (isBuffer(message)) message = Array.prototype.slice.call(message, 0);else if (!Array.isArray(message)) message = message.toString();
    // else, assume byte array already

    var m = crypt.bytesToWords(message),
        l = message.length * 8,
        a = 1732584193,
        b = -271733879,
        c = -1732584194,
        d = 271733878;

    // Swap endian
    for (var i = 0; i < m.length; i++) {
      m[i] = (m[i] << 8 | m[i] >>> 24) & 0x00FF00FF | (m[i] << 24 | m[i] >>> 8) & 0xFF00FF00;
    }

    // Padding
    m[l >>> 5] |= 0x80 << l % 32;
    m[(l + 64 >>> 9 << 4) + 14] = l;

    // Method shortcuts
    var FF = md5._ff,
        GG = md5._gg,
        HH = md5._hh,
        II = md5._ii;

    for (var i = 0; i < m.length; i += 16) {

      var aa = a,
          bb = b,
          cc = c,
          dd = d;

      a = FF(a, b, c, d, m[i + 0], 7, -680876936);
      d = FF(d, a, b, c, m[i + 1], 12, -389564586);
      c = FF(c, d, a, b, m[i + 2], 17, 606105819);
      b = FF(b, c, d, a, m[i + 3], 22, -1044525330);
      a = FF(a, b, c, d, m[i + 4], 7, -176418897);
      d = FF(d, a, b, c, m[i + 5], 12, 1200080426);
      c = FF(c, d, a, b, m[i + 6], 17, -1473231341);
      b = FF(b, c, d, a, m[i + 7], 22, -45705983);
      a = FF(a, b, c, d, m[i + 8], 7, 1770035416);
      d = FF(d, a, b, c, m[i + 9], 12, -1958414417);
      c = FF(c, d, a, b, m[i + 10], 17, -42063);
      b = FF(b, c, d, a, m[i + 11], 22, -1990404162);
      a = FF(a, b, c, d, m[i + 12], 7, 1804603682);
      d = FF(d, a, b, c, m[i + 13], 12, -40341101);
      c = FF(c, d, a, b, m[i + 14], 17, -1502002290);
      b = FF(b, c, d, a, m[i + 15], 22, 1236535329);

      a = GG(a, b, c, d, m[i + 1], 5, -165796510);
      d = GG(d, a, b, c, m[i + 6], 9, -1069501632);
      c = GG(c, d, a, b, m[i + 11], 14, 643717713);
      b = GG(b, c, d, a, m[i + 0], 20, -373897302);
      a = GG(a, b, c, d, m[i + 5], 5, -701558691);
      d = GG(d, a, b, c, m[i + 10], 9, 38016083);
      c = GG(c, d, a, b, m[i + 15], 14, -660478335);
      b = GG(b, c, d, a, m[i + 4], 20, -405537848);
      a = GG(a, b, c, d, m[i + 9], 5, 568446438);
      d = GG(d, a, b, c, m[i + 14], 9, -1019803690);
      c = GG(c, d, a, b, m[i + 3], 14, -187363961);
      b = GG(b, c, d, a, m[i + 8], 20, 1163531501);
      a = GG(a, b, c, d, m[i + 13], 5, -1444681467);
      d = GG(d, a, b, c, m[i + 2], 9, -51403784);
      c = GG(c, d, a, b, m[i + 7], 14, 1735328473);
      b = GG(b, c, d, a, m[i + 12], 20, -1926607734);

      a = HH(a, b, c, d, m[i + 5], 4, -378558);
      d = HH(d, a, b, c, m[i + 8], 11, -2022574463);
      c = HH(c, d, a, b, m[i + 11], 16, 1839030562);
      b = HH(b, c, d, a, m[i + 14], 23, -35309556);
      a = HH(a, b, c, d, m[i + 1], 4, -1530992060);
      d = HH(d, a, b, c, m[i + 4], 11, 1272893353);
      c = HH(c, d, a, b, m[i + 7], 16, -155497632);
      b = HH(b, c, d, a, m[i + 10], 23, -1094730640);
      a = HH(a, b, c, d, m[i + 13], 4, 681279174);
      d = HH(d, a, b, c, m[i + 0], 11, -358537222);
      c = HH(c, d, a, b, m[i + 3], 16, -722521979);
      b = HH(b, c, d, a, m[i + 6], 23, 76029189);
      a = HH(a, b, c, d, m[i + 9], 4, -640364487);
      d = HH(d, a, b, c, m[i + 12], 11, -421815835);
      c = HH(c, d, a, b, m[i + 15], 16, 530742520);
      b = HH(b, c, d, a, m[i + 2], 23, -995338651);

      a = II(a, b, c, d, m[i + 0], 6, -198630844);
      d = II(d, a, b, c, m[i + 7], 10, 1126891415);
      c = II(c, d, a, b, m[i + 14], 15, -1416354905);
      b = II(b, c, d, a, m[i + 5], 21, -57434055);
      a = II(a, b, c, d, m[i + 12], 6, 1700485571);
      d = II(d, a, b, c, m[i + 3], 10, -1894986606);
      c = II(c, d, a, b, m[i + 10], 15, -1051523);
      b = II(b, c, d, a, m[i + 1], 21, -2054922799);
      a = II(a, b, c, d, m[i + 8], 6, 1873313359);
      d = II(d, a, b, c, m[i + 15], 10, -30611744);
      c = II(c, d, a, b, m[i + 6], 15, -1560198380);
      b = II(b, c, d, a, m[i + 13], 21, 1309151649);
      a = II(a, b, c, d, m[i + 4], 6, -145523070);
      d = II(d, a, b, c, m[i + 11], 10, -1120210379);
      c = II(c, d, a, b, m[i + 2], 15, 718787259);
      b = II(b, c, d, a, m[i + 9], 21, -343485551);

      a = a + aa >>> 0;
      b = b + bb >>> 0;
      c = c + cc >>> 0;
      d = d + dd >>> 0;
    }

    return crypt.endian([a, b, c, d]);
  };

  // Auxiliary functions
  md5._ff = function (a, b, c, d, x, s, t) {
    var n = a + (b & c | ~b & d) + (x >>> 0) + t;
    return (n << s | n >>> 32 - s) + b;
  };
  md5._gg = function (a, b, c, d, x, s, t) {
    var n = a + (b & d | c & ~d) + (x >>> 0) + t;
    return (n << s | n >>> 32 - s) + b;
  };
  md5._hh = function (a, b, c, d, x, s, t) {
    var n = a + (b ^ c ^ d) + (x >>> 0) + t;
    return (n << s | n >>> 32 - s) + b;
  };
  md5._ii = function (a, b, c, d, x, s, t) {
    var n = a + (c ^ (b | ~d)) + (x >>> 0) + t;
    return (n << s | n >>> 32 - s) + b;
  };

  // Package private blocksize
  md5._blocksize = 16;
  md5._digestsize = 16;

  $m['md5/md5.js#2.2.1'] = function (message, options) {
    if (message === undefined || message === null) throw new Error('Illegal argument ' + message);

    var digestbytes = crypt.wordsToBytes(md5(message, options));
    return options && options.asBytes ? digestbytes : options && options.asString ? bin.bytesToString(digestbytes) : crypt.bytesToHex(digestbytes);
  };
})();

/*== node_modules/recur-fs/lib/walk.js ==*/
$m['recur-fs/lib/walk.js#2.2.3'] = {};
var _recurfslibwalkjs223_fs = require('fs'),
    _recurfslibwalkjs223_path = require('path');

/**
 * Walk directory tree from 'dir', passing all resources to 'visitor'.
 * Stops walking if 'visitor' calls next(true), or root directory reached.
 * @param {String} dir
 * @param {Function} visitor(resource, stat, next)
 * @param {Function} fn(err)
 */
$m['recur-fs/lib/walk.js#2.2.3'] = function walk(dir, visitor, fn) {
	dir = _recurfslibwalkjs223_path.resolve(dir);

	function visit(dir) {
		function next(finished) {
			var parent = _recurfslibwalkjs223_path.resolve(dir, '..');

			// Stop if finished or we can no longer go up a level
			if (finished || parent.toLowerCase() === dir.toLowerCase()) return fn();

			// Up one level
			visit(parent);
		}

		_recurfslibwalkjs223_fs.readdir(dir, function (err, files) {
			if (err) return fn(err);

			var outstanding = files.length,
			    finished = false;

			files.forEach(function (file) {
				file = _recurfslibwalkjs223_path.join(dir, file);
				_recurfslibwalkjs223_fs.stat(file, function (err, stat) {
					if (!finished) {
						// Skip on error
						if (err) return ! --outstanding ? next(finished) : null;

						visitor(file, stat, function (stop) {
							if (stop === true) finished = true;

							if (! --outstanding) next(finished);
						});

						// Already finished
					} else {
						if (! --outstanding) return fn();
					}
				});
			});
		});
	}

	visit(dir);
};

/**
 * Synchronously walk directory tree from 'directory', passing all resources to 'visitor'.
 * Stops walking when root directory reached or `true` is returned from 'visitor'.
 * @param {String} dir
 * @param {Function} visitor(resource)
 */
$m['recur-fs/lib/walk.js#2.2.3'].sync = function walkSync(directory, visitor) {
	directory = _recurfslibwalkjs223_path.resolve(directory);

	function visit(dir) {
		function next() {
			var parent = _recurfslibwalkjs223_path.resolve(dir, '..');

			// Stop if we can no longer go up a level
			if (parent.toLowerCase() === dir.toLowerCase()) return;

			// Up one level
			visit(parent);
		}

		var files = _recurfslibwalkjs223_fs.readdirSync(dir),
		    outstanding = files.length,
		    finished = false;

		files.forEach(function (file) {
			file = _recurfslibwalkjs223_path.join(dir, file);
			try {
				var stat = _recurfslibwalkjs223_fs.statSync(file);
			} catch (err) {
				// Skip if error
				return ! --outstanding ? next() : null;
			}

			if (!finished) {
				var stop = visitor(file, stat);
				if (stop === true) finished = true;
				if (! --outstanding && !finished) return next();
			}
		});
	}

	visit(directory);
};

/*== node_modules/balanced-match/index.js ==*/
$m['balanced-match/index.js#0.4.2'] = {};
$m['balanced-match/index.js#0.4.2'] = _balancedmatchindexjs042_balanced;
function _balancedmatchindexjs042_balanced(a, b, str) {
  if (a instanceof RegExp) a = _balancedmatchindexjs042_maybeMatch(a, str);
  if (b instanceof RegExp) b = _balancedmatchindexjs042_maybeMatch(b, str);

  var r = _balancedmatchindexjs042_range(a, b, str);

  return r && {
    start: r[0],
    end: r[1],
    pre: str.slice(0, r[0]),
    body: str.slice(r[0] + a.length, r[1]),
    post: str.slice(r[1] + b.length)
  };
}

function _balancedmatchindexjs042_maybeMatch(reg, str) {
  var m = str.match(reg);
  return m ? m[0] : null;
}

_balancedmatchindexjs042_balanced.range = _balancedmatchindexjs042_range;
function _balancedmatchindexjs042_range(a, b, str) {
  var begs, beg, left, right, result;
  var ai = str.indexOf(a);
  var bi = str.indexOf(b, ai + 1);
  var i = ai;

  if (ai >= 0 && bi > 0) {
    begs = [];
    left = str.length;

    while (i >= 0 && !result) {
      if (i == ai) {
        begs.push(i);
        ai = str.indexOf(a, i + 1);
      } else if (begs.length == 1) {
        result = [begs.pop(), bi];
      } else {
        beg = begs.pop();
        if (beg < left) {
          left = beg;
          right = bi;
        }

        bi = str.indexOf(b, i + 1);
      }

      i = ai < bi && ai >= 0 ? ai : bi;
    }

    if (begs.length) {
      result = [left, right];
    }
  }

  return result;
}

/*== node_modules/concat-map/index.js ==*/
$m['concat-map/index.js#0.0.1'] = {};
$m['concat-map/index.js#0.0.1'] = function (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        var x = fn(xs[i], i);
        if (_concatmapindexjs001_isArray(x)) res.push.apply(res, x);else res.push(x);
    }
    return res;
};

var _concatmapindexjs001_isArray = Array.isArray || function (xs) {
    return Object.prototype.toString.call(xs) === '[object Array]';
};

/*== node_modules/brace-expansion/index.js ==*/
$m['brace-expansion/index.js#1.1.6'] = {};
var _braceexpansionindexjs116_concatMap = $m['concat-map/index.js#0.0.1'];
var _braceexpansionindexjs116_balanced = $m['balanced-match/index.js#0.4.2'];

$m['brace-expansion/index.js#1.1.6'] = _braceexpansionindexjs116_expandTop;

var _braceexpansionindexjs116_escSlash = '\0SLASH' + Math.random() + '\0';
var _braceexpansionindexjs116_escOpen = '\0OPEN' + Math.random() + '\0';
var _braceexpansionindexjs116_escClose = '\0CLOSE' + Math.random() + '\0';
var _braceexpansionindexjs116_escComma = '\0COMMA' + Math.random() + '\0';
var _braceexpansionindexjs116_escPeriod = '\0PERIOD' + Math.random() + '\0';

function _braceexpansionindexjs116_numeric(str) {
  return parseInt(str, 10) == str ? parseInt(str, 10) : str.charCodeAt(0);
}

function _braceexpansionindexjs116_escapeBraces(str) {
  return str.split('\\\\').join(_braceexpansionindexjs116_escSlash).split('\\{').join(_braceexpansionindexjs116_escOpen).split('\\}').join(_braceexpansionindexjs116_escClose).split('\\,').join(_braceexpansionindexjs116_escComma).split('\\.').join(_braceexpansionindexjs116_escPeriod);
}

function _braceexpansionindexjs116_unescapeBraces(str) {
  return str.split(_braceexpansionindexjs116_escSlash).join('\\').split(_braceexpansionindexjs116_escOpen).join('{').split(_braceexpansionindexjs116_escClose).join('}').split(_braceexpansionindexjs116_escComma).join(',').split(_braceexpansionindexjs116_escPeriod).join('.');
}

// Basically just str.split(","), but handling cases
// where we have nested braced sections, which should be
// treated as individual members, like {a,{b,c},d}
function _braceexpansionindexjs116_parseCommaParts(str) {
  if (!str) return [''];

  var parts = [];
  var m = _braceexpansionindexjs116_balanced('{', '}', str);

  if (!m) return str.split(',');

  var pre = m.pre;
  var body = m.body;
  var post = m.post;
  var p = pre.split(',');

  p[p.length - 1] += '{' + body + '}';
  var postParts = _braceexpansionindexjs116_parseCommaParts(post);
  if (post.length) {
    p[p.length - 1] += postParts.shift();
    p.push.apply(p, postParts);
  }

  parts.push.apply(parts, p);

  return parts;
}

function _braceexpansionindexjs116_expandTop(str) {
  if (!str) return [];

  // I don't know why Bash 4.3 does this, but it does.
  // Anything starting with {} will have the first two bytes preserved
  // but *only* at the top level, so {},a}b will not expand to anything,
  // but a{},b}c will be expanded to [a}c,abc].
  // One could argue that this is a bug in Bash, but since the goal of
  // this module is to match Bash's rules, we escape a leading {}
  if (str.substr(0, 2) === '{}') {
    str = '\\{\\}' + str.substr(2);
  }

  return _braceexpansionindexjs116_expand(_braceexpansionindexjs116_escapeBraces(str), true).map(_braceexpansionindexjs116_unescapeBraces);
}

function _braceexpansionindexjs116_identity(e) {
  return e;
}

function _braceexpansionindexjs116_embrace(str) {
  return '{' + str + '}';
}
function _braceexpansionindexjs116_isPadded(el) {
  return (/^-?0\d/.test(el)
  );
}

function _braceexpansionindexjs116_lte(i, y) {
  return i <= y;
}
function _braceexpansionindexjs116_gte(i, y) {
  return i >= y;
}

function _braceexpansionindexjs116_expand(str, isTop) {
  var expansions = [];

  var m = _braceexpansionindexjs116_balanced('{', '}', str);
  if (!m || /\$$/.test(m.pre)) return [str];

  var isNumericSequence = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(m.body);
  var isAlphaSequence = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(m.body);
  var isSequence = isNumericSequence || isAlphaSequence;
  var isOptions = /^(.*,)+(.+)?$/.test(m.body);
  if (!isSequence && !isOptions) {
    // {a},b}
    if (m.post.match(/,.*\}/)) {
      str = m.pre + '{' + m.body + _braceexpansionindexjs116_escClose + m.post;
      return _braceexpansionindexjs116_expand(str);
    }
    return [str];
  }

  var n;
  if (isSequence) {
    n = m.body.split(/\.\./);
  } else {
    n = _braceexpansionindexjs116_parseCommaParts(m.body);
    if (n.length === 1) {
      // x{{a,b}}y ==> x{a}y x{b}y
      n = _braceexpansionindexjs116_expand(n[0], false).map(_braceexpansionindexjs116_embrace);
      if (n.length === 1) {
        var post = m.post.length ? _braceexpansionindexjs116_expand(m.post, false) : [''];
        return post.map(function (p) {
          return m.pre + n[0] + p;
        });
      }
    }
  }

  // at this point, n is the parts, and we know it's not a comma set
  // with a single entry.

  // no need to expand pre, since it is guaranteed to be free of brace-sets
  var pre = m.pre;
  var post = m.post.length ? _braceexpansionindexjs116_expand(m.post, false) : [''];

  var N;

  if (isSequence) {
    var x = _braceexpansionindexjs116_numeric(n[0]);
    var y = _braceexpansionindexjs116_numeric(n[1]);
    var width = Math.max(n[0].length, n[1].length);
    var incr = n.length == 3 ? Math.abs(_braceexpansionindexjs116_numeric(n[2])) : 1;
    var test = _braceexpansionindexjs116_lte;
    var reverse = y < x;
    if (reverse) {
      incr *= -1;
      test = _braceexpansionindexjs116_gte;
    }
    var pad = n.some(_braceexpansionindexjs116_isPadded);

    N = [];

    for (var i = x; test(i, y); i += incr) {
      var c;
      if (isAlphaSequence) {
        c = String.fromCharCode(i);
        if (c === '\\') c = '';
      } else {
        c = String(i);
        if (pad) {
          var need = width - c.length;
          if (need > 0) {
            var z = new Array(need + 1).join('0');
            if (i < 0) c = '-' + z + c.slice(1);else c = z + c;
          }
        }
      }
      N.push(c);
    }
  } else {
    N = _braceexpansionindexjs116_concatMap(n, function (el) {
      return _braceexpansionindexjs116_expand(el, false);
    });
  }

  for (var j = 0; j < N.length; j++) {
    for (var k = 0; k < post.length; k++) {
      var expansion = pre + N[j] + post[k];
      if (!isTop || isSequence || expansion) expansions.push(expansion);
    }
  }

  return expansions;
}

/*== node_modules/recur-fs/node_modules/minimatch/minimatch.js ==*/
$m['minimatch/minimatch.js#3.0.2'] = {};
$m['minimatch/minimatch.js#3.0.2'] = _minimatchminimatchjs302_minimatch;
_minimatchminimatchjs302_minimatch.Minimatch = _minimatchminimatchjs302_Minimatch;

var _minimatchminimatchjs302_path = { sep: '/' };
try {
  _minimatchminimatchjs302_path = require('path');
} catch (er) {}

var _minimatchminimatchjs302_GLOBSTAR = _minimatchminimatchjs302_minimatch.GLOBSTAR = _minimatchminimatchjs302_Minimatch.GLOBSTAR = {};
var _minimatchminimatchjs302_expand = $m['brace-expansion/index.js#1.1.6'];

// any single thing other than /
// don't need to escape / when using new RegExp()
var _minimatchminimatchjs302_qmark = '[^/]';

// * => any number of characters
var _minimatchminimatchjs302_star = _minimatchminimatchjs302_qmark + '*?';

// ** when dots are allowed.  Anything goes, except .. and .
// not (^ or / followed by one or two dots followed by $ or /),
// followed by anything, any number of times.
var _minimatchminimatchjs302_twoStarDot = '(?:(?!(?:\\\/|^)(?:\\.{1,2})($|\\\/)).)*?';

// not a ^ or / followed by a dot,
// followed by anything, any number of times.
var _minimatchminimatchjs302_twoStarNoDot = '(?:(?!(?:\\\/|^)\\.).)*?';

// characters that need to be escaped in RegExp.
var _minimatchminimatchjs302_reSpecials = _minimatchminimatchjs302_charSet('().*{}+?[]^$\\!');

// "abc" -> { a:true, b:true, c:true }
function _minimatchminimatchjs302_charSet(s) {
  return s.split('').reduce(function (set, c) {
    set[c] = true;
    return set;
  }, {});
}

// normalizes slashes.
var _minimatchminimatchjs302_slashSplit = /\/+/;

_minimatchminimatchjs302_minimatch.filter = _minimatchminimatchjs302_filter;
function _minimatchminimatchjs302_filter(pattern, options) {
  options = options || {};
  return function (p, i, list) {
    return _minimatchminimatchjs302_minimatch(p, pattern, options);
  };
}

function _minimatchminimatchjs302_ext(a, b) {
  a = a || {};
  b = b || {};
  var t = {};
  Object.keys(b).forEach(function (k) {
    t[k] = b[k];
  });
  Object.keys(a).forEach(function (k) {
    t[k] = a[k];
  });
  return t;
}

_minimatchminimatchjs302_minimatch.defaults = function (def) {
  if (!def || !Object.keys(def).length) return _minimatchminimatchjs302_minimatch;

  var orig = _minimatchminimatchjs302_minimatch;

  var m = function minimatch(p, pattern, options) {
    return orig.minimatch(p, pattern, _minimatchminimatchjs302_ext(def, options));
  };

  m.Minimatch = function Minimatch(pattern, options) {
    return new orig.Minimatch(pattern, _minimatchminimatchjs302_ext(def, options));
  };

  return m;
};

_minimatchminimatchjs302_Minimatch.defaults = function (def) {
  if (!def || !Object.keys(def).length) return _minimatchminimatchjs302_Minimatch;
  return _minimatchminimatchjs302_minimatch.defaults(def).Minimatch;
};

function _minimatchminimatchjs302_minimatch(p, pattern, options) {
  if (typeof pattern !== 'string') {
    throw new TypeError('glob pattern string required');
  }

  if (!options) options = {};

  // shortcut: comments match nothing.
  if (!options.nocomment && pattern.charAt(0) === '#') {
    return false;
  }

  // "" only matches ""
  if (pattern.trim() === '') return p === '';

  return new _minimatchminimatchjs302_Minimatch(pattern, options).match(p);
}

function _minimatchminimatchjs302_Minimatch(pattern, options) {
  if (!(this instanceof _minimatchminimatchjs302_Minimatch)) {
    return new _minimatchminimatchjs302_Minimatch(pattern, options);
  }

  if (typeof pattern !== 'string') {
    throw new TypeError('glob pattern string required');
  }

  if (!options) options = {};
  pattern = pattern.trim();

  // windows support: need to use /, not \
  if (_minimatchminimatchjs302_path.sep !== '/') {
    pattern = pattern.split(_minimatchminimatchjs302_path.sep).join('/');
  }

  this.options = options;
  this.set = [];
  this.pattern = pattern;
  this.regexp = null;
  this.negate = false;
  this.comment = false;
  this.empty = false;

  // make the set of regexps etc.
  this.make();
}

_minimatchminimatchjs302_Minimatch.prototype.debug = function () {};

_minimatchminimatchjs302_Minimatch.prototype.make = _minimatchminimatchjs302_make;
function _minimatchminimatchjs302_make() {
  // don't do it more than once.
  if (this._made) return;

  var pattern = this.pattern;
  var options = this.options;

  // empty patterns and comments match nothing.
  if (!options.nocomment && pattern.charAt(0) === '#') {
    this.comment = true;
    return;
  }
  if (!pattern) {
    this.empty = true;
    return;
  }

  // step 1: figure out negation, etc.
  this.parseNegate();

  // step 2: expand braces
  var set = this.globSet = this.braceExpand();

  if (options.debug) this.debug = console.error;

  this.debug(this.pattern, set);

  // step 3: now we have a set, so turn each one into a series of path-portion
  // matching patterns.
  // These will be regexps, except in the case of "**", which is
  // set to the GLOBSTAR object for globstar behavior,
  // and will not contain any / characters
  set = this.globParts = set.map(function (s) {
    return s.split(_minimatchminimatchjs302_slashSplit);
  });

  this.debug(this.pattern, set);

  // glob --> regexps
  set = set.map(function (s, si, set) {
    return s.map(this.parse, this);
  }, this);

  this.debug(this.pattern, set);

  // filter out everything that didn't compile properly.
  set = set.filter(function (s) {
    return s.indexOf(false) === -1;
  });

  this.debug(this.pattern, set);

  this.set = set;
}

_minimatchminimatchjs302_Minimatch.prototype.parseNegate = _minimatchminimatchjs302_parseNegate;
function _minimatchminimatchjs302_parseNegate() {
  var pattern = this.pattern;
  var negate = false;
  var options = this.options;
  var negateOffset = 0;

  if (options.nonegate) return;

  for (var i = 0, l = pattern.length; i < l && pattern.charAt(i) === '!'; i++) {
    negate = !negate;
    negateOffset++;
  }

  if (negateOffset) this.pattern = pattern.substr(negateOffset);
  this.negate = negate;
}

// Brace expansion:
// a{b,c}d -> abd acd
// a{b,}c -> abc ac
// a{0..3}d -> a0d a1d a2d a3d
// a{b,c{d,e}f}g -> abg acdfg acefg
// a{b,c}d{e,f}g -> abdeg acdeg abdeg abdfg
//
// Invalid sets are not expanded.
// a{2..}b -> a{2..}b
// a{b}c -> a{b}c
_minimatchminimatchjs302_minimatch.braceExpand = function (pattern, options) {
  return _minimatchminimatchjs302_braceExpand(pattern, options);
};

_minimatchminimatchjs302_Minimatch.prototype.braceExpand = _minimatchminimatchjs302_braceExpand;

function _minimatchminimatchjs302_braceExpand(pattern, options) {
  if (!options) {
    if (this instanceof _minimatchminimatchjs302_Minimatch) {
      options = this.options;
    } else {
      options = {};
    }
  }

  pattern = typeof pattern === 'undefined' ? this.pattern : pattern;

  if (typeof pattern === 'undefined') {
    throw new TypeError('undefined pattern');
  }

  if (options.nobrace || !pattern.match(/\{.*\}/)) {
    // shortcut. no need to expand.
    return [pattern];
  }

  return _minimatchminimatchjs302_expand(pattern);
}

// parse a component of the expanded set.
// At this point, no pattern may contain "/" in it
// so we're going to return a 2d array, where each entry is the full
// pattern, split on '/', and then turned into a regular expression.
// A regexp is made at the end which joins each array with an
// escaped /, and another full one which joins each regexp with |.
//
// Following the lead of Bash 4.1, note that "**" only has special meaning
// when it is the *only* thing in a path portion.  Otherwise, any series
// of * is equivalent to a single *.  Globstar behavior is enabled by
// default, and can be disabled by setting options.noglobstar.
_minimatchminimatchjs302_Minimatch.prototype.parse = _minimatchminimatchjs302_parse;
var _minimatchminimatchjs302_SUBPARSE = {};
function _minimatchminimatchjs302_parse(pattern, isSub) {
  if (pattern.length > 1024 * 64) {
    throw new TypeError('pattern is too long');
  }

  var options = this.options;

  // shortcuts
  if (!options.noglobstar && pattern === '**') return _minimatchminimatchjs302_GLOBSTAR;
  if (pattern === '') return '';

  var re = '';
  var hasMagic = !!options.nocase;
  var escaping = false;
  // ? => one single character
  var patternListStack = [];
  var negativeLists = [];
  var plType;
  var stateChar;
  var inClass = false;
  var reClassStart = -1;
  var classStart = -1;
  // . and .. never match anything that doesn't start with .,
  // even when options.dot is set.
  var patternStart = pattern.charAt(0) === '.' ? '' // anything
  // not (start or / followed by . or .. followed by / or end)
  : options.dot ? '(?!(?:^|\\\/)\\.{1,2}(?:$|\\\/))' : '(?!\\.)';
  var self = this;

  function clearStateChar() {
    if (stateChar) {
      // we had some state-tracking character
      // that wasn't consumed by this pass.
      switch (stateChar) {
        case '*':
          re += _minimatchminimatchjs302_star;
          hasMagic = true;
          break;
        case '?':
          re += _minimatchminimatchjs302_qmark;
          hasMagic = true;
          break;
        default:
          re += '\\' + stateChar;
          break;
      }
      self.debug('clearStateChar %j %j', stateChar, re);
      stateChar = false;
    }
  }

  for (var i = 0, len = pattern.length, c; i < len && (c = pattern.charAt(i)); i++) {
    this.debug('%s\t%s %s %j', pattern, i, re, c);

    // skip over any that are escaped.
    if (escaping && _minimatchminimatchjs302_reSpecials[c]) {
      re += '\\' + c;
      escaping = false;
      continue;
    }

    switch (c) {
      case '/':
        // completely not allowed, even escaped.
        // Should already be path-split by now.
        return false;

      case '\\':
        clearStateChar();
        escaping = true;
        continue;

      // the various stateChar values
      // for the "extglob" stuff.
      case '?':
      case '*':
      case '+':
      case '@':
      case '!':
        this.debug('%s\t%s %s %j <-- stateChar', pattern, i, re, c);

        // all of those are literals inside a class, except that
        // the glob [!a] means [^a] in regexp
        if (inClass) {
          this.debug('  in class');
          if (c === '!' && i === classStart + 1) c = '^';
          re += c;
          continue;
        }

        // if we already have a stateChar, then it means
        // that there was something like ** or +? in there.
        // Handle the stateChar, then proceed with this one.
        self.debug('call clearStateChar %j', stateChar);
        clearStateChar();
        stateChar = c;
        // if extglob is disabled, then +(asdf|foo) isn't a thing.
        // just clear the statechar *now*, rather than even diving into
        // the patternList stuff.
        if (options.noext) clearStateChar();
        continue;

      case '(':
        if (inClass) {
          re += '(';
          continue;
        }

        if (!stateChar) {
          re += '\\(';
          continue;
        }

        plType = stateChar;
        patternListStack.push({
          type: plType,
          start: i - 1,
          reStart: re.length
        });
        // negation is (?:(?!js)[^/]*)
        re += stateChar === '!' ? '(?:(?!(?:' : '(?:';
        this.debug('plType %j %j', stateChar, re);
        stateChar = false;
        continue;

      case ')':
        if (inClass || !patternListStack.length) {
          re += '\\)';
          continue;
        }

        clearStateChar();
        hasMagic = true;
        re += ')';
        var pl = patternListStack.pop();
        plType = pl.type;
        // negation is (?:(?!js)[^/]*)
        // The others are (?:<pattern>)<type>
        switch (plType) {
          case '!':
            negativeLists.push(pl);
            re += ')[^/]*?)';
            pl.reEnd = re.length;
            break;
          case '?':
          case '+':
          case '*':
            re += plType;
            break;
          case '@':
            break; // the default anyway
        }
        continue;

      case '|':
        if (inClass || !patternListStack.length || escaping) {
          re += '\\|';
          escaping = false;
          continue;
        }

        clearStateChar();
        re += '|';
        continue;

      // these are mostly the same in regexp and glob
      case '[':
        // swallow any state-tracking char before the [
        clearStateChar();

        if (inClass) {
          re += '\\' + c;
          continue;
        }

        inClass = true;
        classStart = i;
        reClassStart = re.length;
        re += c;
        continue;

      case ']':
        //  a right bracket shall lose its special
        //  meaning and represent itself in
        //  a bracket expression if it occurs
        //  first in the list.  -- POSIX.2 2.8.3.2
        if (i === classStart + 1 || !inClass) {
          re += '\\' + c;
          escaping = false;
          continue;
        }

        // handle the case where we left a class open.
        // "[z-a]" is valid, equivalent to "\[z-a\]"
        if (inClass) {
          // split where the last [ was, make sure we don't have
          // an invalid re. if so, re-walk the contents of the
          // would-be class to re-translate any characters that
          // were passed through as-is
          // TODO: It would probably be faster to determine this
          // without a try/catch and a new RegExp, but it's tricky
          // to do safely.  For now, this is safe and works.
          var cs = pattern.substring(classStart + 1, i);
          try {
            RegExp('[' + cs + ']');
          } catch (er) {
            // not a valid class!
            var sp = this.parse(cs, _minimatchminimatchjs302_SUBPARSE);
            re = re.substr(0, reClassStart) + '\\[' + sp[0] + '\\]';
            hasMagic = hasMagic || sp[1];
            inClass = false;
            continue;
          }
        }

        // finish up the class.
        hasMagic = true;
        inClass = false;
        re += c;
        continue;

      default:
        // swallow any state char that wasn't consumed
        clearStateChar();

        if (escaping) {
          // no need
          escaping = false;
        } else if (_minimatchminimatchjs302_reSpecials[c] && !(c === '^' && inClass)) {
          re += '\\';
        }

        re += c;

    } // switch
  } // for

  // handle the case where we left a class open.
  // "[abc" is valid, equivalent to "\[abc"
  if (inClass) {
    // split where the last [ was, and escape it
    // this is a huge pita.  We now have to re-walk
    // the contents of the would-be class to re-translate
    // any characters that were passed through as-is
    cs = pattern.substr(classStart + 1);
    sp = this.parse(cs, _minimatchminimatchjs302_SUBPARSE);
    re = re.substr(0, reClassStart) + '\\[' + sp[0];
    hasMagic = hasMagic || sp[1];
  }

  // handle the case where we had a +( thing at the *end*
  // of the pattern.
  // each pattern list stack adds 3 chars, and we need to go through
  // and escape any | chars that were passed through as-is for the regexp.
  // Go through and escape them, taking care not to double-escape any
  // | chars that were already escaped.
  for (pl = patternListStack.pop(); pl; pl = patternListStack.pop()) {
    var tail = re.slice(pl.reStart + 3);
    // maybe some even number of \, then maybe 1 \, followed by a |
    tail = tail.replace(/((?:\\{2}){0,64})(\\?)\|/g, function (_, $1, $2) {
      if (!$2) {
        // the | isn't already escaped, so escape it.
        $2 = '\\';
      }

      // need to escape all those slashes *again*, without escaping the
      // one that we need for escaping the | character.  As it works out,
      // escaping an even number of slashes can be done by simply repeating
      // it exactly after itself.  That's why this trick works.
      //
      // I am sorry that you have to see this.
      return $1 + $1 + $2 + '|';
    });

    this.debug('tail=%j\n   %s', tail, tail);
    var t = pl.type === '*' ? _minimatchminimatchjs302_star : pl.type === '?' ? _minimatchminimatchjs302_qmark : '\\' + pl.type;

    hasMagic = true;
    re = re.slice(0, pl.reStart) + t + '\\(' + tail;
  }

  // handle trailing things that only matter at the very end.
  clearStateChar();
  if (escaping) {
    // trailing \\
    re += '\\\\';
  }

  // only need to apply the nodot start if the re starts with
  // something that could conceivably capture a dot
  var addPatternStart = false;
  switch (re.charAt(0)) {
    case '.':
    case '[':
    case '(':
      addPatternStart = true;
  }

  // Hack to work around lack of negative lookbehind in JS
  // A pattern like: *.!(x).!(y|z) needs to ensure that a name
  // like 'a.xyz.yz' doesn't match.  So, the first negative
  // lookahead, has to look ALL the way ahead, to the end of
  // the pattern.
  for (var n = negativeLists.length - 1; n > -1; n--) {
    var nl = negativeLists[n];

    var nlBefore = re.slice(0, nl.reStart);
    var nlFirst = re.slice(nl.reStart, nl.reEnd - 8);
    var nlLast = re.slice(nl.reEnd - 8, nl.reEnd);
    var nlAfter = re.slice(nl.reEnd);

    nlLast += nlAfter;

    // Handle nested stuff like *(*.js|!(*.json)), where open parens
    // mean that we should *not* include the ) in the bit that is considered
    // "after" the negated section.
    var openParensBefore = nlBefore.split('(').length - 1;
    var cleanAfter = nlAfter;
    for (i = 0; i < openParensBefore; i++) {
      cleanAfter = cleanAfter.replace(/\)[+*?]?/, '');
    }
    nlAfter = cleanAfter;

    var dollar = '';
    if (nlAfter === '' && isSub !== _minimatchminimatchjs302_SUBPARSE) {
      dollar = '$';
    }
    var newRe = nlBefore + nlFirst + nlAfter + dollar + nlLast;
    re = newRe;
  }

  // if the re is not "" at this point, then we need to make sure
  // it doesn't match against an empty path part.
  // Otherwise a/* will match a/, which it should not.
  if (re !== '' && hasMagic) {
    re = '(?=.)' + re;
  }

  if (addPatternStart) {
    re = patternStart + re;
  }

  // parsing just a piece of a larger pattern.
  if (isSub === _minimatchminimatchjs302_SUBPARSE) {
    return [re, hasMagic];
  }

  // skip the regexp for non-magical patterns
  // unescape anything in it, though, so that it'll be
  // an exact match against a file etc.
  if (!hasMagic) {
    return _minimatchminimatchjs302_globUnescape(pattern);
  }

  var flags = options.nocase ? 'i' : '';
  try {
    var regExp = new RegExp('^' + re + '$', flags);
  } catch (er) {
    // If it was an invalid regular expression, then it can't match
    // anything.  This trick looks for a character after the end of
    // the string, which is of course impossible, except in multi-line
    // mode, but it's not a /m regex.
    return new RegExp('$.');
  }

  regExp._glob = pattern;
  regExp._src = re;

  return regExp;
}

_minimatchminimatchjs302_minimatch.makeRe = function (pattern, options) {
  return new _minimatchminimatchjs302_Minimatch(pattern, options || {}).makeRe();
};

_minimatchminimatchjs302_Minimatch.prototype.makeRe = _minimatchminimatchjs302_makeRe;
function _minimatchminimatchjs302_makeRe() {
  if (this.regexp || this.regexp === false) return this.regexp;

  // at this point, this.set is a 2d array of partial
  // pattern strings, or "**".
  //
  // It's better to use .match().  This function shouldn't
  // be used, really, but it's pretty convenient sometimes,
  // when you just want to work with a regex.
  var set = this.set;

  if (!set.length) {
    this.regexp = false;
    return this.regexp;
  }
  var options = this.options;

  var twoStar = options.noglobstar ? _minimatchminimatchjs302_star : options.dot ? _minimatchminimatchjs302_twoStarDot : _minimatchminimatchjs302_twoStarNoDot;
  var flags = options.nocase ? 'i' : '';

  var re = set.map(function (pattern) {
    return pattern.map(function (p) {
      return p === _minimatchminimatchjs302_GLOBSTAR ? twoStar : typeof p === 'string' ? _minimatchminimatchjs302_regExpEscape(p) : p._src;
    }).join('\\\/');
  }).join('|');

  // must match entire pattern
  // ending in a * or ** will make it less strict.
  re = '^(?:' + re + ')$';

  // can match anything, as long as it's not this.
  if (this.negate) re = '^(?!' + re + ').*$';

  try {
    this.regexp = new RegExp(re, flags);
  } catch (ex) {
    this.regexp = false;
  }
  return this.regexp;
}

_minimatchminimatchjs302_minimatch.match = function (list, pattern, options) {
  options = options || {};
  var mm = new _minimatchminimatchjs302_Minimatch(pattern, options);
  list = list.filter(function (f) {
    return mm.match(f);
  });
  if (mm.options.nonull && !list.length) {
    list.push(pattern);
  }
  return list;
};

_minimatchminimatchjs302_Minimatch.prototype.match = _minimatchminimatchjs302_match;
function _minimatchminimatchjs302_match(f, partial) {
  this.debug('match', f, this.pattern);
  // short-circuit in the case of busted things.
  // comments, etc.
  if (this.comment) return false;
  if (this.empty) return f === '';

  if (f === '/' && partial) return true;

  var options = this.options;

  // windows: need to use /, not \
  if (_minimatchminimatchjs302_path.sep !== '/') {
    f = f.split(_minimatchminimatchjs302_path.sep).join('/');
  }

  // treat the test path as a set of pathparts.
  f = f.split(_minimatchminimatchjs302_slashSplit);
  this.debug(this.pattern, 'split', f);

  // just ONE of the pattern sets in this.set needs to match
  // in order for it to be valid.  If negating, then just one
  // match means that we have failed.
  // Either way, return on the first hit.

  var set = this.set;
  this.debug(this.pattern, 'set', set);

  // Find the basename of the path by looking for the last non-empty segment
  var filename;
  var i;
  for (i = f.length - 1; i >= 0; i--) {
    filename = f[i];
    if (filename) break;
  }

  for (i = 0; i < set.length; i++) {
    var pattern = set[i];
    var file = f;
    if (options.matchBase && pattern.length === 1) {
      file = [filename];
    }
    var hit = this.matchOne(file, pattern, partial);
    if (hit) {
      if (options.flipNegate) return true;
      return !this.negate;
    }
  }

  // didn't get any hits.  this is success if it's a negative
  // pattern, failure otherwise.
  if (options.flipNegate) return false;
  return this.negate;
}

// set partial to true to test if, for example,
// "/a/b" matches the start of "/*/b/*/d"
// Partial means, if you run out of file before you run
// out of pattern, then that's fine, as long as all
// the parts match.
_minimatchminimatchjs302_Minimatch.prototype.matchOne = function (file, pattern, partial) {
  var options = this.options;

  this.debug('matchOne', { 'this': this, file: file, pattern: pattern });

  this.debug('matchOne', file.length, pattern.length);

  for (var fi = 0, pi = 0, fl = file.length, pl = pattern.length; fi < fl && pi < pl; fi++, pi++) {
    this.debug('matchOne loop');
    var p = pattern[pi];
    var f = file[fi];

    this.debug(pattern, p, f);

    // should be impossible.
    // some invalid regexp stuff in the set.
    if (p === false) return false;

    if (p === _minimatchminimatchjs302_GLOBSTAR) {
      this.debug('GLOBSTAR', [pattern, p, f]);

      // "**"
      // a/**/b/**/c would match the following:
      // a/b/x/y/z/c
      // a/x/y/z/b/c
      // a/b/x/b/x/c
      // a/b/c
      // To do this, take the rest of the pattern after
      // the **, and see if it would match the file remainder.
      // If so, return success.
      // If not, the ** "swallows" a segment, and try again.
      // This is recursively awful.
      //
      // a/**/b/**/c matching a/b/x/y/z/c
      // - a matches a
      // - doublestar
      //   - matchOne(b/x/y/z/c, b/**/c)
      //     - b matches b
      //     - doublestar
      //       - matchOne(x/y/z/c, c) -> no
      //       - matchOne(y/z/c, c) -> no
      //       - matchOne(z/c, c) -> no
      //       - matchOne(c, c) yes, hit
      var fr = fi;
      var pr = pi + 1;
      if (pr === pl) {
        this.debug('** at the end');
        // a ** at the end will just swallow the rest.
        // We have found a match.
        // however, it will not swallow /.x, unless
        // options.dot is set.
        // . and .. are *never* matched by **, for explosively
        // exponential reasons.
        for (; fi < fl; fi++) {
          if (file[fi] === '.' || file[fi] === '..' || !options.dot && file[fi].charAt(0) === '.') return false;
        }
        return true;
      }

      // ok, let's see if we can swallow whatever we can.
      while (fr < fl) {
        var swallowee = file[fr];

        this.debug('\nglobstar while', file, fr, pattern, pr, swallowee);

        // XXX remove this slice.  Just pass the start index.
        if (this.matchOne(file.slice(fr), pattern.slice(pr), partial)) {
          this.debug('globstar found match!', fr, fl, swallowee);
          // found a match.
          return true;
        } else {
          // can't swallow "." or ".." ever.
          // can only swallow ".foo" when explicitly asked.
          if (swallowee === '.' || swallowee === '..' || !options.dot && swallowee.charAt(0) === '.') {
            this.debug('dot detected!', file, fr, pattern, pr);
            break;
          }

          // ** swallows a segment, and continue.
          this.debug('globstar swallow a segment, and continue');
          fr++;
        }
      }

      // no match was found.
      // However, in partial mode, we can't say this is necessarily over.
      // If there's more *pattern* left, then
      if (partial) {
        // ran out of file
        this.debug('\n>>> no match, partial?', file, fr, pattern, pr);
        if (fr === fl) return true;
      }
      return false;
    }

    // something other than **
    // non-magic patterns just have to match exactly
    // patterns with magic have been turned into regexps.
    var hit;
    if (typeof p === 'string') {
      if (options.nocase) {
        hit = f.toLowerCase() === p.toLowerCase();
      } else {
        hit = f === p;
      }
      this.debug('string match', p, f, hit);
    } else {
      hit = f.match(p);
      this.debug('pattern match', p, f, hit);
    }

    if (!hit) return false;
  }

  // Note: ending in / means that we'll get a final ""
  // at the end of the pattern.  This can only match a
  // corresponding "" at the end of the file.
  // If the file ends in /, then it can only match a
  // a pattern that ends in /, unless the pattern just
  // doesn't have any more for it. But, a/b/ should *not*
  // match "a/b/*", even though "" matches against the
  // [^/]*? pattern, except in partial mode, where it might
  // simply not be reached yet.
  // However, a/b/ should still satisfy a/*

  // now either we fell off the end of the pattern, or we're done.
  if (fi === fl && pi === pl) {
    // ran out of pattern and filename at the same time.
    // an exact hit!
    return true;
  } else if (fi === fl) {
    // ran out of file, but still had pattern left.
    // this is ok if we're doing the match as part of
    // a glob fs traversal.
    return partial;
  } else if (pi === pl) {
    // ran out of pattern, still have file left.
    // this is only acceptable if we're on the very last
    // empty segment of a file with a trailing slash.
    // a/* should match a/b/
    var emptyFileEnd = fi === fl - 1 && file[fi] === '';
    return emptyFileEnd;
  }

  // should be unreachable.
  throw new Error('wtf?');
};

// replace stuff like \* with *
function _minimatchminimatchjs302_globUnescape(s) {
  return s.replace(/\\(.)/g, '$1');
}

function _minimatchminimatchjs302_regExpEscape(s) {
  return s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

/*== node_modules/recur-fs/lib/hunt.js ==*/
$m['recur-fs/lib/hunt.js#2.2.3'] = {};
var _recurfslibhuntjs223_fs = require('fs'),
    _recurfslibhuntjs223_Minimatch = $m['minimatch/minimatch.js#3.0.2'].Minimatch,
    _recurfslibhuntjs223_path = require('path'),
    _recurfslibhuntjs223_walk = $m['recur-fs/lib/walk.js#2.2.3'];

/**
 * Walk directory tree from 'directory', returning all resources matching 'matcher'.
 * 'matcher' can be glob string, or function that returns 'isMatch'.
 * Stops walking when root directory reached, on first match if 'stopOnFirstMatch',
 * or if "true" is returned as second argument from 'next'.
 * @param {String} directory
 * @param {String|Function} matcher(resource, stat, next)
 * @param {Boolean} stopOnFirstMatch
 * @param {Function} fn(err, matches)
 */
$m['recur-fs/lib/hunt.js#2.2.3'] = function hunt(directory, matcher, stopOnFirstMatch, fn) {
	directory = _recurfslibhuntjs223_path.resolve(directory);

	// Convert glob string to async matcher function
	if ('string' == typeof matcher) {
		var match = new _recurfslibhuntjs223_Minimatch(matcher, { matchBase: true });
		matcher = function matcher(resource, stat, done) {
			done(match.match(resource));
		};
	}

	var matches = [],
	    finished = false;

	// Walk and match each resource
	_recurfslibhuntjs223_walk(directory, function (resource, stat, next) {
		if (!finished) {
			matcher(resource, stat, function (isMatch, stop) {
				if (isMatch) {
					matches.push(resource);
					finished = stopOnFirstMatch;
				}

				if (stop === true) finished = true;

				// Stop walking if finished
				next(finished);
			});
		}
	}, function (err) {
		if (err) return fn(err);
		return fn(null, stopOnFirstMatch ? matches[0] : matches);
	});
};

/**
 * Synchronously walk directory tree from 'directory', returning all resources matching 'matcher'.
 * 'matcher' can be glob string, or function that returns 'isMatch'.
 * Stops walking when root directory reached, or on first match if 'stopOnFirstMatch'.
 * @param {String} directory
 * @param {String|Function} matcher(resource, next)
 * @param {Boolean} stopOnFirstMatch
 * @returns (Array|String}
 */
$m['recur-fs/lib/hunt.js#2.2.3'].sync = function huntSync(directory, matcher, stopOnFirstMatch) {
	directory = _recurfslibhuntjs223_path.resolve(directory);

	if ('string' == typeof matcher) {
		var match = new _recurfslibhuntjs223_Minimatch(matcher, { matchBase: true });
		matcher = function matcher(resource) {
			return match.match(resource);
		};
	}

	var matches = [],
	    finished = false;

	// Walk and match each resource
	_recurfslibhuntjs223_walk.sync(directory, function (resource, stat) {
		if (!finished) {
			var isMatch = matcher(resource, stat);
			if (isMatch) {
				matches.push(resource);
				finished = stopOnFirstMatch;
				if (finished) return true;
			}
		}
	});

	return stopOnFirstMatch ? matches[0] : matches;
};

/*== node_modules/wrappy/wrappy.js ==*/
$m['wrappy/wrappy.js#1.0.2'] = {};
// Returns a wrapper function that returns a wrapped callback
// The wrapper function should do some stuff, and return a
// presumably different callback function.
// This makes sure that own properties are retained, so that
// decorations and such are not lost along the way.
$m['wrappy/wrappy.js#1.0.2'] = _wrappywrappyjs102_wrappy;
function _wrappywrappyjs102_wrappy(fn, cb) {
  if (fn && cb) return _wrappywrappyjs102_wrappy(fn)(cb);

  if (typeof fn !== 'function') throw new TypeError('need wrapper function');

  Object.keys(fn).forEach(function (k) {
    wrapper[k] = fn[k];
  });

  return wrapper;

  function wrapper() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    var ret = fn.apply(this, args);
    var cb = args[args.length - 1];
    if (typeof ret === 'function' && ret !== cb) {
      Object.keys(cb).forEach(function (k) {
        ret[k] = cb[k];
      });
    }
    return ret;
  }
}

/*== node_modules/once/once.js ==*/
$m['once/once.js#1.4.0'] = {};
var _onceoncejs140_wrappy = $m['wrappy/wrappy.js#1.0.2'];
$m['once/once.js#1.4.0'] = _onceoncejs140_wrappy(_onceoncejs140_once);
$m['once/once.js#1.4.0'].strict = _onceoncejs140_wrappy(_onceoncejs140_onceStrict);

_onceoncejs140_once.proto = _onceoncejs140_once(function () {
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return _onceoncejs140_once(this);
    },
    configurable: true
  });

  Object.defineProperty(Function.prototype, 'onceStrict', {
    value: function () {
      return _onceoncejs140_onceStrict(this);
    },
    configurable: true
  });
});

function _onceoncejs140_once(fn) {
  var f = function () {
    if (f.called) return f.value;
    f.called = true;
    return f.value = fn.apply(this, arguments);
  };
  f.called = false;
  return f;
}

function _onceoncejs140_onceStrict(fn) {
  var f = function () {
    if (f.called) throw new Error(f.onceError);
    f.called = true;
    return f.value = fn.apply(this, arguments);
  };
  var name = fn.name || 'Function wrapped with `once`';
  f.onceError = name + " shouldn't be called more than once";
  f.called = false;
  return f;
}

/*== node_modules/inflight/inflight.js ==*/
$m['inflight/inflight.js#1.0.5'] = {};
var _inflightinflightjs105_wrappy = $m['wrappy/wrappy.js#1.0.2'];
var _inflightinflightjs105_reqs = Object.create(null);
var _inflightinflightjs105_once = $m['once/once.js#1.4.0'];

$m['inflight/inflight.js#1.0.5'] = _inflightinflightjs105_wrappy(_inflightinflightjs105_inflight);

function _inflightinflightjs105_inflight(key, cb) {
  if (_inflightinflightjs105_reqs[key]) {
    _inflightinflightjs105_reqs[key].push(cb);
    return null;
  } else {
    _inflightinflightjs105_reqs[key] = [cb];
    return _inflightinflightjs105_makeres(key);
  }
}

function _inflightinflightjs105_makeres(key) {
  return _inflightinflightjs105_once(function RES() {
    var cbs = _inflightinflightjs105_reqs[key];
    var len = cbs.length;
    var args = _inflightinflightjs105_slice(arguments);
    for (var i = 0; i < len; i++) {
      cbs[i].apply(null, args);
    }
    if (cbs.length > len) {
      // added more in the interim.
      // de-zalgo, just in case, but don't call again.
      cbs.splice(0, len);
      process.nextTick(function () {
        RES.apply(null, args);
      });
    } else {
      delete _inflightinflightjs105_reqs[key];
    }
  });
}

function _inflightinflightjs105_slice(args) {
  var length = args.length;
  var array = [];

  for (var i = 0; i < length; i++) array[i] = args[i];
  return array;
}

/*== node_modules/path-is-absolute/index.js ==*/
$m['path-is-absolute/index.js#1.0.0'] = {};
'use strict';

function _pathisabsoluteindexjs100_posix(path) {
	return path.charAt(0) === '/';
};

function _pathisabsoluteindexjs100_win32(path) {
	// https://github.com/joyent/node/blob/b3fcc245fb25539909ef1d5eaa01dbf92e168633/lib/path.js#L56
	var splitDeviceRe = /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/;
	var result = splitDeviceRe.exec(path);
	var device = result[1] || '';
	var isUnc = !!device && device.charAt(1) !== ':';

	// UNC paths are always absolute
	return !!result[2] || isUnc;
};

$m['path-is-absolute/index.js#1.0.0'] = process.platform === 'win32' ? _pathisabsoluteindexjs100_win32 : _pathisabsoluteindexjs100_posix;
$m['path-is-absolute/index.js#1.0.0'].posix = _pathisabsoluteindexjs100_posix;
$m['path-is-absolute/index.js#1.0.0'].win32 = _pathisabsoluteindexjs100_win32;

/*== node_modules/minimatch/minimatch.js ==*/
$m['minimatch/minimatch.js#3.0.3'] = {};
$m['minimatch/minimatch.js#3.0.3'] = _minimatchminimatchjs303_minimatch;
_minimatchminimatchjs303_minimatch.Minimatch = _minimatchminimatchjs303_Minimatch;

var _minimatchminimatchjs303_path = { sep: '/' };
try {
  _minimatchminimatchjs303_path = require('path');
} catch (er) {}

var _minimatchminimatchjs303_GLOBSTAR = _minimatchminimatchjs303_minimatch.GLOBSTAR = _minimatchminimatchjs303_Minimatch.GLOBSTAR = {};
var _minimatchminimatchjs303_expand = $m['brace-expansion/index.js#1.1.6'];

var _minimatchminimatchjs303_plTypes = {
  '!': { open: '(?:(?!(?:', close: '))[^/]*?)' },
  '?': { open: '(?:', close: ')?' },
  '+': { open: '(?:', close: ')+' },
  '*': { open: '(?:', close: ')*' },
  '@': { open: '(?:', close: ')' }
};

// any single thing other than /
// don't need to escape / when using new RegExp()
var _minimatchminimatchjs303_qmark = '[^/]';

// * => any number of characters
var _minimatchminimatchjs303_star = _minimatchminimatchjs303_qmark + '*?';

// ** when dots are allowed.  Anything goes, except .. and .
// not (^ or / followed by one or two dots followed by $ or /),
// followed by anything, any number of times.
var _minimatchminimatchjs303_twoStarDot = '(?:(?!(?:\\\/|^)(?:\\.{1,2})($|\\\/)).)*?';

// not a ^ or / followed by a dot,
// followed by anything, any number of times.
var _minimatchminimatchjs303_twoStarNoDot = '(?:(?!(?:\\\/|^)\\.).)*?';

// characters that need to be escaped in RegExp.
var _minimatchminimatchjs303_reSpecials = _minimatchminimatchjs303_charSet('().*{}+?[]^$\\!');

// "abc" -> { a:true, b:true, c:true }
function _minimatchminimatchjs303_charSet(s) {
  return s.split('').reduce(function (set, c) {
    set[c] = true;
    return set;
  }, {});
}

// normalizes slashes.
var _minimatchminimatchjs303_slashSplit = /\/+/;

_minimatchminimatchjs303_minimatch.filter = _minimatchminimatchjs303_filter;
function _minimatchminimatchjs303_filter(pattern, options) {
  options = options || {};
  return function (p, i, list) {
    return _minimatchminimatchjs303_minimatch(p, pattern, options);
  };
}

function _minimatchminimatchjs303_ext(a, b) {
  a = a || {};
  b = b || {};
  var t = {};
  Object.keys(b).forEach(function (k) {
    t[k] = b[k];
  });
  Object.keys(a).forEach(function (k) {
    t[k] = a[k];
  });
  return t;
}

_minimatchminimatchjs303_minimatch.defaults = function (def) {
  if (!def || !Object.keys(def).length) return _minimatchminimatchjs303_minimatch;

  var orig = _minimatchminimatchjs303_minimatch;

  var m = function minimatch(p, pattern, options) {
    return orig.minimatch(p, pattern, _minimatchminimatchjs303_ext(def, options));
  };

  m.Minimatch = function Minimatch(pattern, options) {
    return new orig.Minimatch(pattern, _minimatchminimatchjs303_ext(def, options));
  };

  return m;
};

_minimatchminimatchjs303_Minimatch.defaults = function (def) {
  if (!def || !Object.keys(def).length) return _minimatchminimatchjs303_Minimatch;
  return _minimatchminimatchjs303_minimatch.defaults(def).Minimatch;
};

function _minimatchminimatchjs303_minimatch(p, pattern, options) {
  if (typeof pattern !== 'string') {
    throw new TypeError('glob pattern string required');
  }

  if (!options) options = {};

  // shortcut: comments match nothing.
  if (!options.nocomment && pattern.charAt(0) === '#') {
    return false;
  }

  // "" only matches ""
  if (pattern.trim() === '') return p === '';

  return new _minimatchminimatchjs303_Minimatch(pattern, options).match(p);
}

function _minimatchminimatchjs303_Minimatch(pattern, options) {
  if (!(this instanceof _minimatchminimatchjs303_Minimatch)) {
    return new _minimatchminimatchjs303_Minimatch(pattern, options);
  }

  if (typeof pattern !== 'string') {
    throw new TypeError('glob pattern string required');
  }

  if (!options) options = {};
  pattern = pattern.trim();

  // windows support: need to use /, not \
  if (_minimatchminimatchjs303_path.sep !== '/') {
    pattern = pattern.split(_minimatchminimatchjs303_path.sep).join('/');
  }

  this.options = options;
  this.set = [];
  this.pattern = pattern;
  this.regexp = null;
  this.negate = false;
  this.comment = false;
  this.empty = false;

  // make the set of regexps etc.
  this.make();
}

_minimatchminimatchjs303_Minimatch.prototype.debug = function () {};

_minimatchminimatchjs303_Minimatch.prototype.make = _minimatchminimatchjs303_make;
function _minimatchminimatchjs303_make() {
  // don't do it more than once.
  if (this._made) return;

  var pattern = this.pattern;
  var options = this.options;

  // empty patterns and comments match nothing.
  if (!options.nocomment && pattern.charAt(0) === '#') {
    this.comment = true;
    return;
  }
  if (!pattern) {
    this.empty = true;
    return;
  }

  // step 1: figure out negation, etc.
  this.parseNegate();

  // step 2: expand braces
  var set = this.globSet = this.braceExpand();

  if (options.debug) this.debug = console.error;

  this.debug(this.pattern, set);

  // step 3: now we have a set, so turn each one into a series of path-portion
  // matching patterns.
  // These will be regexps, except in the case of "**", which is
  // set to the GLOBSTAR object for globstar behavior,
  // and will not contain any / characters
  set = this.globParts = set.map(function (s) {
    return s.split(_minimatchminimatchjs303_slashSplit);
  });

  this.debug(this.pattern, set);

  // glob --> regexps
  set = set.map(function (s, si, set) {
    return s.map(this.parse, this);
  }, this);

  this.debug(this.pattern, set);

  // filter out everything that didn't compile properly.
  set = set.filter(function (s) {
    return s.indexOf(false) === -1;
  });

  this.debug(this.pattern, set);

  this.set = set;
}

_minimatchminimatchjs303_Minimatch.prototype.parseNegate = _minimatchminimatchjs303_parseNegate;
function _minimatchminimatchjs303_parseNegate() {
  var pattern = this.pattern;
  var negate = false;
  var options = this.options;
  var negateOffset = 0;

  if (options.nonegate) return;

  for (var i = 0, l = pattern.length; i < l && pattern.charAt(i) === '!'; i++) {
    negate = !negate;
    negateOffset++;
  }

  if (negateOffset) this.pattern = pattern.substr(negateOffset);
  this.negate = negate;
}

// Brace expansion:
// a{b,c}d -> abd acd
// a{b,}c -> abc ac
// a{0..3}d -> a0d a1d a2d a3d
// a{b,c{d,e}f}g -> abg acdfg acefg
// a{b,c}d{e,f}g -> abdeg acdeg abdeg abdfg
//
// Invalid sets are not expanded.
// a{2..}b -> a{2..}b
// a{b}c -> a{b}c
_minimatchminimatchjs303_minimatch.braceExpand = function (pattern, options) {
  return _minimatchminimatchjs303_braceExpand(pattern, options);
};

_minimatchminimatchjs303_Minimatch.prototype.braceExpand = _minimatchminimatchjs303_braceExpand;

function _minimatchminimatchjs303_braceExpand(pattern, options) {
  if (!options) {
    if (this instanceof _minimatchminimatchjs303_Minimatch) {
      options = this.options;
    } else {
      options = {};
    }
  }

  pattern = typeof pattern === 'undefined' ? this.pattern : pattern;

  if (typeof pattern === 'undefined') {
    throw new TypeError('undefined pattern');
  }

  if (options.nobrace || !pattern.match(/\{.*\}/)) {
    // shortcut. no need to expand.
    return [pattern];
  }

  return _minimatchminimatchjs303_expand(pattern);
}

// parse a component of the expanded set.
// At this point, no pattern may contain "/" in it
// so we're going to return a 2d array, where each entry is the full
// pattern, split on '/', and then turned into a regular expression.
// A regexp is made at the end which joins each array with an
// escaped /, and another full one which joins each regexp with |.
//
// Following the lead of Bash 4.1, note that "**" only has special meaning
// when it is the *only* thing in a path portion.  Otherwise, any series
// of * is equivalent to a single *.  Globstar behavior is enabled by
// default, and can be disabled by setting options.noglobstar.
_minimatchminimatchjs303_Minimatch.prototype.parse = _minimatchminimatchjs303_parse;
var _minimatchminimatchjs303_SUBPARSE = {};
function _minimatchminimatchjs303_parse(pattern, isSub) {
  if (pattern.length > 1024 * 64) {
    throw new TypeError('pattern is too long');
  }

  var options = this.options;

  // shortcuts
  if (!options.noglobstar && pattern === '**') return _minimatchminimatchjs303_GLOBSTAR;
  if (pattern === '') return '';

  var re = '';
  var hasMagic = !!options.nocase;
  var escaping = false;
  // ? => one single character
  var patternListStack = [];
  var negativeLists = [];
  var stateChar;
  var inClass = false;
  var reClassStart = -1;
  var classStart = -1;
  // . and .. never match anything that doesn't start with .,
  // even when options.dot is set.
  var patternStart = pattern.charAt(0) === '.' ? '' // anything
  // not (start or / followed by . or .. followed by / or end)
  : options.dot ? '(?!(?:^|\\\/)\\.{1,2}(?:$|\\\/))' : '(?!\\.)';
  var self = this;

  function clearStateChar() {
    if (stateChar) {
      // we had some state-tracking character
      // that wasn't consumed by this pass.
      switch (stateChar) {
        case '*':
          re += _minimatchminimatchjs303_star;
          hasMagic = true;
          break;
        case '?':
          re += _minimatchminimatchjs303_qmark;
          hasMagic = true;
          break;
        default:
          re += '\\' + stateChar;
          break;
      }
      self.debug('clearStateChar %j %j', stateChar, re);
      stateChar = false;
    }
  }

  for (var i = 0, len = pattern.length, c; i < len && (c = pattern.charAt(i)); i++) {
    this.debug('%s\t%s %s %j', pattern, i, re, c);

    // skip over any that are escaped.
    if (escaping && _minimatchminimatchjs303_reSpecials[c]) {
      re += '\\' + c;
      escaping = false;
      continue;
    }

    switch (c) {
      case '/':
        // completely not allowed, even escaped.
        // Should already be path-split by now.
        return false;

      case '\\':
        clearStateChar();
        escaping = true;
        continue;

      // the various stateChar values
      // for the "extglob" stuff.
      case '?':
      case '*':
      case '+':
      case '@':
      case '!':
        this.debug('%s\t%s %s %j <-- stateChar', pattern, i, re, c);

        // all of those are literals inside a class, except that
        // the glob [!a] means [^a] in regexp
        if (inClass) {
          this.debug('  in class');
          if (c === '!' && i === classStart + 1) c = '^';
          re += c;
          continue;
        }

        // if we already have a stateChar, then it means
        // that there was something like ** or +? in there.
        // Handle the stateChar, then proceed with this one.
        self.debug('call clearStateChar %j', stateChar);
        clearStateChar();
        stateChar = c;
        // if extglob is disabled, then +(asdf|foo) isn't a thing.
        // just clear the statechar *now*, rather than even diving into
        // the patternList stuff.
        if (options.noext) clearStateChar();
        continue;

      case '(':
        if (inClass) {
          re += '(';
          continue;
        }

        if (!stateChar) {
          re += '\\(';
          continue;
        }

        patternListStack.push({
          type: stateChar,
          start: i - 1,
          reStart: re.length,
          open: _minimatchminimatchjs303_plTypes[stateChar].open,
          close: _minimatchminimatchjs303_plTypes[stateChar].close
        });
        // negation is (?:(?!js)[^/]*)
        re += stateChar === '!' ? '(?:(?!(?:' : '(?:';
        this.debug('plType %j %j', stateChar, re);
        stateChar = false;
        continue;

      case ')':
        if (inClass || !patternListStack.length) {
          re += '\\)';
          continue;
        }

        clearStateChar();
        hasMagic = true;
        var pl = patternListStack.pop();
        // negation is (?:(?!js)[^/]*)
        // The others are (?:<pattern>)<type>
        re += pl.close;
        if (pl.type === '!') {
          negativeLists.push(pl);
        }
        pl.reEnd = re.length;
        continue;

      case '|':
        if (inClass || !patternListStack.length || escaping) {
          re += '\\|';
          escaping = false;
          continue;
        }

        clearStateChar();
        re += '|';
        continue;

      // these are mostly the same in regexp and glob
      case '[':
        // swallow any state-tracking char before the [
        clearStateChar();

        if (inClass) {
          re += '\\' + c;
          continue;
        }

        inClass = true;
        classStart = i;
        reClassStart = re.length;
        re += c;
        continue;

      case ']':
        //  a right bracket shall lose its special
        //  meaning and represent itself in
        //  a bracket expression if it occurs
        //  first in the list.  -- POSIX.2 2.8.3.2
        if (i === classStart + 1 || !inClass) {
          re += '\\' + c;
          escaping = false;
          continue;
        }

        // handle the case where we left a class open.
        // "[z-a]" is valid, equivalent to "\[z-a\]"
        if (inClass) {
          // split where the last [ was, make sure we don't have
          // an invalid re. if so, re-walk the contents of the
          // would-be class to re-translate any characters that
          // were passed through as-is
          // TODO: It would probably be faster to determine this
          // without a try/catch and a new RegExp, but it's tricky
          // to do safely.  For now, this is safe and works.
          var cs = pattern.substring(classStart + 1, i);
          try {
            RegExp('[' + cs + ']');
          } catch (er) {
            // not a valid class!
            var sp = this.parse(cs, _minimatchminimatchjs303_SUBPARSE);
            re = re.substr(0, reClassStart) + '\\[' + sp[0] + '\\]';
            hasMagic = hasMagic || sp[1];
            inClass = false;
            continue;
          }
        }

        // finish up the class.
        hasMagic = true;
        inClass = false;
        re += c;
        continue;

      default:
        // swallow any state char that wasn't consumed
        clearStateChar();

        if (escaping) {
          // no need
          escaping = false;
        } else if (_minimatchminimatchjs303_reSpecials[c] && !(c === '^' && inClass)) {
          re += '\\';
        }

        re += c;

    } // switch
  } // for

  // handle the case where we left a class open.
  // "[abc" is valid, equivalent to "\[abc"
  if (inClass) {
    // split where the last [ was, and escape it
    // this is a huge pita.  We now have to re-walk
    // the contents of the would-be class to re-translate
    // any characters that were passed through as-is
    cs = pattern.substr(classStart + 1);
    sp = this.parse(cs, _minimatchminimatchjs303_SUBPARSE);
    re = re.substr(0, reClassStart) + '\\[' + sp[0];
    hasMagic = hasMagic || sp[1];
  }

  // handle the case where we had a +( thing at the *end*
  // of the pattern.
  // each pattern list stack adds 3 chars, and we need to go through
  // and escape any | chars that were passed through as-is for the regexp.
  // Go through and escape them, taking care not to double-escape any
  // | chars that were already escaped.
  for (pl = patternListStack.pop(); pl; pl = patternListStack.pop()) {
    var tail = re.slice(pl.reStart + pl.open.length);
    this.debug('setting tail', re, pl);
    // maybe some even number of \, then maybe 1 \, followed by a |
    tail = tail.replace(/((?:\\{2}){0,64})(\\?)\|/g, function (_, $1, $2) {
      if (!$2) {
        // the | isn't already escaped, so escape it.
        $2 = '\\';
      }

      // need to escape all those slashes *again*, without escaping the
      // one that we need for escaping the | character.  As it works out,
      // escaping an even number of slashes can be done by simply repeating
      // it exactly after itself.  That's why this trick works.
      //
      // I am sorry that you have to see this.
      return $1 + $1 + $2 + '|';
    });

    this.debug('tail=%j\n   %s', tail, tail, pl, re);
    var t = pl.type === '*' ? _minimatchminimatchjs303_star : pl.type === '?' ? _minimatchminimatchjs303_qmark : '\\' + pl.type;

    hasMagic = true;
    re = re.slice(0, pl.reStart) + t + '\\(' + tail;
  }

  // handle trailing things that only matter at the very end.
  clearStateChar();
  if (escaping) {
    // trailing \\
    re += '\\\\';
  }

  // only need to apply the nodot start if the re starts with
  // something that could conceivably capture a dot
  var addPatternStart = false;
  switch (re.charAt(0)) {
    case '.':
    case '[':
    case '(':
      addPatternStart = true;
  }

  // Hack to work around lack of negative lookbehind in JS
  // A pattern like: *.!(x).!(y|z) needs to ensure that a name
  // like 'a.xyz.yz' doesn't match.  So, the first negative
  // lookahead, has to look ALL the way ahead, to the end of
  // the pattern.
  for (var n = negativeLists.length - 1; n > -1; n--) {
    var nl = negativeLists[n];

    var nlBefore = re.slice(0, nl.reStart);
    var nlFirst = re.slice(nl.reStart, nl.reEnd - 8);
    var nlLast = re.slice(nl.reEnd - 8, nl.reEnd);
    var nlAfter = re.slice(nl.reEnd);

    nlLast += nlAfter;

    // Handle nested stuff like *(*.js|!(*.json)), where open parens
    // mean that we should *not* include the ) in the bit that is considered
    // "after" the negated section.
    var openParensBefore = nlBefore.split('(').length - 1;
    var cleanAfter = nlAfter;
    for (i = 0; i < openParensBefore; i++) {
      cleanAfter = cleanAfter.replace(/\)[+*?]?/, '');
    }
    nlAfter = cleanAfter;

    var dollar = '';
    if (nlAfter === '' && isSub !== _minimatchminimatchjs303_SUBPARSE) {
      dollar = '$';
    }
    var newRe = nlBefore + nlFirst + nlAfter + dollar + nlLast;
    re = newRe;
  }

  // if the re is not "" at this point, then we need to make sure
  // it doesn't match against an empty path part.
  // Otherwise a/* will match a/, which it should not.
  if (re !== '' && hasMagic) {
    re = '(?=.)' + re;
  }

  if (addPatternStart) {
    re = patternStart + re;
  }

  // parsing just a piece of a larger pattern.
  if (isSub === _minimatchminimatchjs303_SUBPARSE) {
    return [re, hasMagic];
  }

  // skip the regexp for non-magical patterns
  // unescape anything in it, though, so that it'll be
  // an exact match against a file etc.
  if (!hasMagic) {
    return _minimatchminimatchjs303_globUnescape(pattern);
  }

  var flags = options.nocase ? 'i' : '';
  try {
    var regExp = new RegExp('^' + re + '$', flags);
  } catch (er) {
    // If it was an invalid regular expression, then it can't match
    // anything.  This trick looks for a character after the end of
    // the string, which is of course impossible, except in multi-line
    // mode, but it's not a /m regex.
    return new RegExp('$.');
  }

  regExp._glob = pattern;
  regExp._src = re;

  return regExp;
}

_minimatchminimatchjs303_minimatch.makeRe = function (pattern, options) {
  return new _minimatchminimatchjs303_Minimatch(pattern, options || {}).makeRe();
};

_minimatchminimatchjs303_Minimatch.prototype.makeRe = _minimatchminimatchjs303_makeRe;
function _minimatchminimatchjs303_makeRe() {
  if (this.regexp || this.regexp === false) return this.regexp;

  // at this point, this.set is a 2d array of partial
  // pattern strings, or "**".
  //
  // It's better to use .match().  This function shouldn't
  // be used, really, but it's pretty convenient sometimes,
  // when you just want to work with a regex.
  var set = this.set;

  if (!set.length) {
    this.regexp = false;
    return this.regexp;
  }
  var options = this.options;

  var twoStar = options.noglobstar ? _minimatchminimatchjs303_star : options.dot ? _minimatchminimatchjs303_twoStarDot : _minimatchminimatchjs303_twoStarNoDot;
  var flags = options.nocase ? 'i' : '';

  var re = set.map(function (pattern) {
    return pattern.map(function (p) {
      return p === _minimatchminimatchjs303_GLOBSTAR ? twoStar : typeof p === 'string' ? _minimatchminimatchjs303_regExpEscape(p) : p._src;
    }).join('\\\/');
  }).join('|');

  // must match entire pattern
  // ending in a * or ** will make it less strict.
  re = '^(?:' + re + ')$';

  // can match anything, as long as it's not this.
  if (this.negate) re = '^(?!' + re + ').*$';

  try {
    this.regexp = new RegExp(re, flags);
  } catch (ex) {
    this.regexp = false;
  }
  return this.regexp;
}

_minimatchminimatchjs303_minimatch.match = function (list, pattern, options) {
  options = options || {};
  var mm = new _minimatchminimatchjs303_Minimatch(pattern, options);
  list = list.filter(function (f) {
    return mm.match(f);
  });
  if (mm.options.nonull && !list.length) {
    list.push(pattern);
  }
  return list;
};

_minimatchminimatchjs303_Minimatch.prototype.match = _minimatchminimatchjs303_match;
function _minimatchminimatchjs303_match(f, partial) {
  this.debug('match', f, this.pattern);
  // short-circuit in the case of busted things.
  // comments, etc.
  if (this.comment) return false;
  if (this.empty) return f === '';

  if (f === '/' && partial) return true;

  var options = this.options;

  // windows: need to use /, not \
  if (_minimatchminimatchjs303_path.sep !== '/') {
    f = f.split(_minimatchminimatchjs303_path.sep).join('/');
  }

  // treat the test path as a set of pathparts.
  f = f.split(_minimatchminimatchjs303_slashSplit);
  this.debug(this.pattern, 'split', f);

  // just ONE of the pattern sets in this.set needs to match
  // in order for it to be valid.  If negating, then just one
  // match means that we have failed.
  // Either way, return on the first hit.

  var set = this.set;
  this.debug(this.pattern, 'set', set);

  // Find the basename of the path by looking for the last non-empty segment
  var filename;
  var i;
  for (i = f.length - 1; i >= 0; i--) {
    filename = f[i];
    if (filename) break;
  }

  for (i = 0; i < set.length; i++) {
    var pattern = set[i];
    var file = f;
    if (options.matchBase && pattern.length === 1) {
      file = [filename];
    }
    var hit = this.matchOne(file, pattern, partial);
    if (hit) {
      if (options.flipNegate) return true;
      return !this.negate;
    }
  }

  // didn't get any hits.  this is success if it's a negative
  // pattern, failure otherwise.
  if (options.flipNegate) return false;
  return this.negate;
}

// set partial to true to test if, for example,
// "/a/b" matches the start of "/*/b/*/d"
// Partial means, if you run out of file before you run
// out of pattern, then that's fine, as long as all
// the parts match.
_minimatchminimatchjs303_Minimatch.prototype.matchOne = function (file, pattern, partial) {
  var options = this.options;

  this.debug('matchOne', { 'this': this, file: file, pattern: pattern });

  this.debug('matchOne', file.length, pattern.length);

  for (var fi = 0, pi = 0, fl = file.length, pl = pattern.length; fi < fl && pi < pl; fi++, pi++) {
    this.debug('matchOne loop');
    var p = pattern[pi];
    var f = file[fi];

    this.debug(pattern, p, f);

    // should be impossible.
    // some invalid regexp stuff in the set.
    if (p === false) return false;

    if (p === _minimatchminimatchjs303_GLOBSTAR) {
      this.debug('GLOBSTAR', [pattern, p, f]);

      // "**"
      // a/**/b/**/c would match the following:
      // a/b/x/y/z/c
      // a/x/y/z/b/c
      // a/b/x/b/x/c
      // a/b/c
      // To do this, take the rest of the pattern after
      // the **, and see if it would match the file remainder.
      // If so, return success.
      // If not, the ** "swallows" a segment, and try again.
      // This is recursively awful.
      //
      // a/**/b/**/c matching a/b/x/y/z/c
      // - a matches a
      // - doublestar
      //   - matchOne(b/x/y/z/c, b/**/c)
      //     - b matches b
      //     - doublestar
      //       - matchOne(x/y/z/c, c) -> no
      //       - matchOne(y/z/c, c) -> no
      //       - matchOne(z/c, c) -> no
      //       - matchOne(c, c) yes, hit
      var fr = fi;
      var pr = pi + 1;
      if (pr === pl) {
        this.debug('** at the end');
        // a ** at the end will just swallow the rest.
        // We have found a match.
        // however, it will not swallow /.x, unless
        // options.dot is set.
        // . and .. are *never* matched by **, for explosively
        // exponential reasons.
        for (; fi < fl; fi++) {
          if (file[fi] === '.' || file[fi] === '..' || !options.dot && file[fi].charAt(0) === '.') return false;
        }
        return true;
      }

      // ok, let's see if we can swallow whatever we can.
      while (fr < fl) {
        var swallowee = file[fr];

        this.debug('\nglobstar while', file, fr, pattern, pr, swallowee);

        // XXX remove this slice.  Just pass the start index.
        if (this.matchOne(file.slice(fr), pattern.slice(pr), partial)) {
          this.debug('globstar found match!', fr, fl, swallowee);
          // found a match.
          return true;
        } else {
          // can't swallow "." or ".." ever.
          // can only swallow ".foo" when explicitly asked.
          if (swallowee === '.' || swallowee === '..' || !options.dot && swallowee.charAt(0) === '.') {
            this.debug('dot detected!', file, fr, pattern, pr);
            break;
          }

          // ** swallows a segment, and continue.
          this.debug('globstar swallow a segment, and continue');
          fr++;
        }
      }

      // no match was found.
      // However, in partial mode, we can't say this is necessarily over.
      // If there's more *pattern* left, then
      if (partial) {
        // ran out of file
        this.debug('\n>>> no match, partial?', file, fr, pattern, pr);
        if (fr === fl) return true;
      }
      return false;
    }

    // something other than **
    // non-magic patterns just have to match exactly
    // patterns with magic have been turned into regexps.
    var hit;
    if (typeof p === 'string') {
      if (options.nocase) {
        hit = f.toLowerCase() === p.toLowerCase();
      } else {
        hit = f === p;
      }
      this.debug('string match', p, f, hit);
    } else {
      hit = f.match(p);
      this.debug('pattern match', p, f, hit);
    }

    if (!hit) return false;
  }

  // Note: ending in / means that we'll get a final ""
  // at the end of the pattern.  This can only match a
  // corresponding "" at the end of the file.
  // If the file ends in /, then it can only match a
  // a pattern that ends in /, unless the pattern just
  // doesn't have any more for it. But, a/b/ should *not*
  // match "a/b/*", even though "" matches against the
  // [^/]*? pattern, except in partial mode, where it might
  // simply not be reached yet.
  // However, a/b/ should still satisfy a/*

  // now either we fell off the end of the pattern, or we're done.
  if (fi === fl && pi === pl) {
    // ran out of pattern and filename at the same time.
    // an exact hit!
    return true;
  } else if (fi === fl) {
    // ran out of file, but still had pattern left.
    // this is ok if we're doing the match as part of
    // a glob fs traversal.
    return partial;
  } else if (pi === pl) {
    // ran out of pattern, still have file left.
    // this is only acceptable if we're on the very last
    // empty segment of a file with a trailing slash.
    // a/* should match a/b/
    var emptyFileEnd = fi === fl - 1 && file[fi] === '';
    return emptyFileEnd;
  }

  // should be unreachable.
  throw new Error('wtf?');
};

// replace stuff like \* with *
function _minimatchminimatchjs303_globUnescape(s) {
  return s.replace(/\\(.)/g, '$1');
}

function _minimatchminimatchjs303_regExpEscape(s) {
  return s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

/*== node_modules/glob/common.js ==*/
$m['glob/common.js#7.0.6'] = {};
$m['glob/common.js#7.0.6'].alphasort = _globcommonjs706_alphasort;
$m['glob/common.js#7.0.6'].alphasorti = _globcommonjs706_alphasorti;
$m['glob/common.js#7.0.6'].setopts = _globcommonjs706_setopts;
$m['glob/common.js#7.0.6'].ownProp = _globcommonjs706_ownProp;
$m['glob/common.js#7.0.6'].makeAbs = _globcommonjs706_makeAbs;
$m['glob/common.js#7.0.6'].finish = _globcommonjs706_finish;
$m['glob/common.js#7.0.6'].mark = _globcommonjs706_mark;
$m['glob/common.js#7.0.6'].isIgnored = _globcommonjs706_isIgnored;
$m['glob/common.js#7.0.6'].childrenIgnored = _globcommonjs706_childrenIgnored;

function _globcommonjs706_ownProp(obj, field) {
  return Object.prototype.hasOwnProperty.call(obj, field);
}

var _globcommonjs706_path = require("path");
var _globcommonjs706_minimatch = $m['minimatch/minimatch.js#3.0.3'];
var _globcommonjs706_isAbsolute = $m['path-is-absolute/index.js#1.0.0'];
var _globcommonjs706_Minimatch = _globcommonjs706_minimatch.Minimatch;

function _globcommonjs706_alphasorti(a, b) {
  return a.toLowerCase().localeCompare(b.toLowerCase());
}

function _globcommonjs706_alphasort(a, b) {
  return a.localeCompare(b);
}

function _globcommonjs706_setupIgnores(self, options) {
  self.ignore = options.ignore || [];

  if (!Array.isArray(self.ignore)) self.ignore = [self.ignore];

  if (self.ignore.length) {
    self.ignore = self.ignore.map(_globcommonjs706_ignoreMap);
  }
}

// ignore patterns are always in dot:true mode.
function _globcommonjs706_ignoreMap(pattern) {
  var gmatcher = null;
  if (pattern.slice(-3) === '/**') {
    var gpattern = pattern.replace(/(\/\*\*)+$/, '');
    gmatcher = new _globcommonjs706_Minimatch(gpattern, { dot: true });
  }

  return {
    matcher: new _globcommonjs706_Minimatch(pattern, { dot: true }),
    gmatcher: gmatcher
  };
}

function _globcommonjs706_setopts(self, pattern, options) {
  if (!options) options = {};

  // base-matching: just use globstar for that.
  if (options.matchBase && -1 === pattern.indexOf("/")) {
    if (options.noglobstar) {
      throw new Error("base matching requires globstar");
    }
    pattern = "**/" + pattern;
  }

  self.silent = !!options.silent;
  self.pattern = pattern;
  self.strict = options.strict !== false;
  self.realpath = !!options.realpath;
  self.realpathCache = options.realpathCache || Object.create(null);
  self.follow = !!options.follow;
  self.dot = !!options.dot;
  self.mark = !!options.mark;
  self.nodir = !!options.nodir;
  if (self.nodir) self.mark = true;
  self.sync = !!options.sync;
  self.nounique = !!options.nounique;
  self.nonull = !!options.nonull;
  self.nosort = !!options.nosort;
  self.nocase = !!options.nocase;
  self.stat = !!options.stat;
  self.noprocess = !!options.noprocess;

  self.maxLength = options.maxLength || Infinity;
  self.cache = options.cache || Object.create(null);
  self.statCache = options.statCache || Object.create(null);
  self.symlinks = options.symlinks || Object.create(null);

  _globcommonjs706_setupIgnores(self, options);

  self.changedCwd = false;
  var cwd = process.cwd();
  if (!_globcommonjs706_ownProp(options, "cwd")) self.cwd = cwd;else {
    self.cwd = _globcommonjs706_path.resolve(options.cwd);
    self.changedCwd = self.cwd !== cwd;
  }

  self.root = options.root || _globcommonjs706_path.resolve(self.cwd, "/");
  self.root = _globcommonjs706_path.resolve(self.root);
  if (process.platform === "win32") self.root = self.root.replace(/\\/g, "/");

  self.cwdAbs = _globcommonjs706_makeAbs(self, self.cwd);
  self.nomount = !!options.nomount;

  // disable comments and negation in Minimatch.
  // Note that they are not supported in Glob itself anyway.
  options.nonegate = true;
  options.nocomment = true;

  self.minimatch = new _globcommonjs706_Minimatch(pattern, options);
  self.options = self.minimatch.options;
}

function _globcommonjs706_finish(self) {
  var nou = self.nounique;
  var all = nou ? [] : Object.create(null);

  for (var i = 0, l = self.matches.length; i < l; i++) {
    var matches = self.matches[i];
    if (!matches || Object.keys(matches).length === 0) {
      if (self.nonull) {
        // do like the shell, and spit out the literal glob
        var literal = self.minimatch.globSet[i];
        if (nou) all.push(literal);else all[literal] = true;
      }
    } else {
      // had matches
      var m = Object.keys(matches);
      if (nou) all.push.apply(all, m);else m.forEach(function (m) {
        all[m] = true;
      });
    }
  }

  if (!nou) all = Object.keys(all);

  if (!self.nosort) all = all.sort(self.nocase ? _globcommonjs706_alphasorti : _globcommonjs706_alphasort);

  // at *some* point we statted all of these
  if (self.mark) {
    for (var i = 0; i < all.length; i++) {
      all[i] = self._mark(all[i]);
    }
    if (self.nodir) {
      all = all.filter(function (e) {
        var notDir = !/\/$/.test(e);
        var c = self.cache[e] || self.cache[_globcommonjs706_makeAbs(self, e)];
        if (notDir && c) notDir = c !== 'DIR' && !Array.isArray(c);
        return notDir;
      });
    }
  }

  if (self.ignore.length) all = all.filter(function (m) {
    return !_globcommonjs706_isIgnored(self, m);
  });

  self.found = all;
}

function _globcommonjs706_mark(self, p) {
  var abs = _globcommonjs706_makeAbs(self, p);
  var c = self.cache[abs];
  var m = p;
  if (c) {
    var isDir = c === 'DIR' || Array.isArray(c);
    var slash = p.slice(-1) === '/';

    if (isDir && !slash) m += '/';else if (!isDir && slash) m = m.slice(0, -1);

    if (m !== p) {
      var mabs = _globcommonjs706_makeAbs(self, m);
      self.statCache[mabs] = self.statCache[abs];
      self.cache[mabs] = self.cache[abs];
    }
  }

  return m;
}

// lotta situps...
function _globcommonjs706_makeAbs(self, f) {
  var abs = f;
  if (f.charAt(0) === '/') {
    abs = _globcommonjs706_path.join(self.root, f);
  } else if (_globcommonjs706_isAbsolute(f) || f === '') {
    abs = f;
  } else if (self.changedCwd) {
    abs = _globcommonjs706_path.resolve(self.cwd, f);
  } else {
    abs = _globcommonjs706_path.resolve(f);
  }

  if (process.platform === 'win32') abs = abs.replace(/\\/g, '/');

  return abs;
}

// Return true, if pattern ends with globstar '**', for the accompanying parent directory.
// Ex:- If node_modules/** is the pattern, add 'node_modules' to ignore list along with it's contents
function _globcommonjs706_isIgnored(self, path) {
  if (!self.ignore.length) return false;

  return self.ignore.some(function (item) {
    return item.matcher.match(path) || !!(item.gmatcher && item.gmatcher.match(path));
  });
}

function _globcommonjs706_childrenIgnored(self, path) {
  if (!self.ignore.length) return false;

  return self.ignore.some(function (item) {
    return !!(item.gmatcher && item.gmatcher.match(path));
  });
}

/*== node_modules/fs.realpath/old.js ==*/
$m['fs.realpath/old.js#1.0.0'] = {};
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var _fsrealpatholdjs100_pathModule = require('path');
var _fsrealpatholdjs100_isWindows = process.platform === 'win32';
var _fsrealpatholdjs100_fs = require('fs');

// JavaScript implementation of realpath, ported from node pre-v6

var _fsrealpatholdjs100_DEBUG = process.env.NODE_DEBUG && /fs/.test(process.env.NODE_DEBUG);

function _fsrealpatholdjs100_rethrow() {
  // Only enable in debug mode. A backtrace uses ~1000 bytes of heap space and
  // is fairly slow to generate.
  var callback;
  if (_fsrealpatholdjs100_DEBUG) {
    var backtrace = new Error();
    callback = debugCallback;
  } else callback = missingCallback;

  return callback;

  function debugCallback(err) {
    if (err) {
      backtrace.message = err.message;
      err = backtrace;
      missingCallback(err);
    }
  }

  function missingCallback(err) {
    if (err) {
      if (process.throwDeprecation) throw err; // Forgot a callback but don't know where? Use NODE_DEBUG=fs
      else if (!process.noDeprecation) {
          var msg = 'fs: missing callback ' + (err.stack || err.message);
          if (process.traceDeprecation) console.trace(msg);else console.error(msg);
        }
    }
  }
}

function _fsrealpatholdjs100_maybeCallback(cb) {
  return typeof cb === 'function' ? cb : _fsrealpatholdjs100_rethrow();
}

var _fsrealpatholdjs100_normalize = _fsrealpatholdjs100_pathModule.normalize;

// Regexp that finds the next partion of a (partial) path
// result is [base_with_slash, base], e.g. ['somedir/', 'somedir']
if (_fsrealpatholdjs100_isWindows) {
  var _fsrealpatholdjs100_nextPartRe = /(.*?)(?:[\/\\]+|$)/g;
} else {
  var _fsrealpatholdjs100_nextPartRe = /(.*?)(?:[\/]+|$)/g;
}

// Regex to find the device root, including trailing slash. E.g. 'c:\\'.
if (_fsrealpatholdjs100_isWindows) {
  var _fsrealpatholdjs100_splitRootRe = /^(?:[a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/][^\\\/]+)?[\\\/]*/;
} else {
  var _fsrealpatholdjs100_splitRootRe = /^[\/]*/;
}

$m['fs.realpath/old.js#1.0.0'].realpathSync = function realpathSync(p, cache) {
  // make p is absolute
  p = _fsrealpatholdjs100_pathModule.resolve(p);

  if (cache && Object.prototype.hasOwnProperty.call(cache, p)) {
    return cache[p];
  }

  var original = p,
      seenLinks = {},
      knownHard = {};

  // current character position in p
  var pos;
  // the partial path so far, including a trailing slash if any
  var current;
  // the partial path without a trailing slash (except when pointing at a root)
  var base;
  // the partial path scanned in the previous round, with slash
  var previous;

  start();

  function start() {
    // Skip over roots
    var m = _fsrealpatholdjs100_splitRootRe.exec(p);
    pos = m[0].length;
    current = m[0];
    base = m[0];
    previous = '';

    // On windows, check that the root exists. On unix there is no need.
    if (_fsrealpatholdjs100_isWindows && !knownHard[base]) {
      _fsrealpatholdjs100_fs.lstatSync(base);
      knownHard[base] = true;
    }
  }

  // walk down the path, swapping out linked pathparts for their real
  // values
  // NB: p.length changes.
  while (pos < p.length) {
    // find the next part
    _fsrealpatholdjs100_nextPartRe.lastIndex = pos;
    var result = _fsrealpatholdjs100_nextPartRe.exec(p);
    previous = current;
    current += result[0];
    base = previous + result[1];
    pos = _fsrealpatholdjs100_nextPartRe.lastIndex;

    // continue if not a symlink
    if (knownHard[base] || cache && cache[base] === base) {
      continue;
    }

    var resolvedLink;
    if (cache && Object.prototype.hasOwnProperty.call(cache, base)) {
      // some known symbolic link.  no need to stat again.
      resolvedLink = cache[base];
    } else {
      var stat = _fsrealpatholdjs100_fs.lstatSync(base);
      if (!stat.isSymbolicLink()) {
        knownHard[base] = true;
        if (cache) cache[base] = base;
        continue;
      }

      // read the link if it wasn't read before
      // dev/ino always return 0 on windows, so skip the check.
      var linkTarget = null;
      if (!_fsrealpatholdjs100_isWindows) {
        var id = stat.dev.toString(32) + ':' + stat.ino.toString(32);
        if (seenLinks.hasOwnProperty(id)) {
          linkTarget = seenLinks[id];
        }
      }
      if (linkTarget === null) {
        _fsrealpatholdjs100_fs.statSync(base);
        linkTarget = _fsrealpatholdjs100_fs.readlinkSync(base);
      }
      resolvedLink = _fsrealpatholdjs100_pathModule.resolve(previous, linkTarget);
      // track this, if given a cache.
      if (cache) cache[base] = resolvedLink;
      if (!_fsrealpatholdjs100_isWindows) seenLinks[id] = linkTarget;
    }

    // resolve the link, then start over
    p = _fsrealpatholdjs100_pathModule.resolve(resolvedLink, p.slice(pos));
    start();
  }

  if (cache) cache[original] = p;

  return p;
};

$m['fs.realpath/old.js#1.0.0'].realpath = function realpath(p, cache, cb) {
  if (typeof cb !== 'function') {
    cb = _fsrealpatholdjs100_maybeCallback(cache);
    cache = null;
  }

  // make p is absolute
  p = _fsrealpatholdjs100_pathModule.resolve(p);

  if (cache && Object.prototype.hasOwnProperty.call(cache, p)) {
    return process.nextTick(cb.bind(null, null, cache[p]));
  }

  var original = p,
      seenLinks = {},
      knownHard = {};

  // current character position in p
  var pos;
  // the partial path so far, including a trailing slash if any
  var current;
  // the partial path without a trailing slash (except when pointing at a root)
  var base;
  // the partial path scanned in the previous round, with slash
  var previous;

  start();

  function start() {
    // Skip over roots
    var m = _fsrealpatholdjs100_splitRootRe.exec(p);
    pos = m[0].length;
    current = m[0];
    base = m[0];
    previous = '';

    // On windows, check that the root exists. On unix there is no need.
    if (_fsrealpatholdjs100_isWindows && !knownHard[base]) {
      _fsrealpatholdjs100_fs.lstat(base, function (err) {
        if (err) return cb(err);
        knownHard[base] = true;
        LOOP();
      });
    } else {
      process.nextTick(LOOP);
    }
  }

  // walk down the path, swapping out linked pathparts for their real
  // values
  function LOOP() {
    // stop if scanned past end of path
    if (pos >= p.length) {
      if (cache) cache[original] = p;
      return cb(null, p);
    }

    // find the next part
    _fsrealpatholdjs100_nextPartRe.lastIndex = pos;
    var result = _fsrealpatholdjs100_nextPartRe.exec(p);
    previous = current;
    current += result[0];
    base = previous + result[1];
    pos = _fsrealpatholdjs100_nextPartRe.lastIndex;

    // continue if not a symlink
    if (knownHard[base] || cache && cache[base] === base) {
      return process.nextTick(LOOP);
    }

    if (cache && Object.prototype.hasOwnProperty.call(cache, base)) {
      // known symbolic link.  no need to stat again.
      return gotResolvedLink(cache[base]);
    }

    return _fsrealpatholdjs100_fs.lstat(base, gotStat);
  }

  function gotStat(err, stat) {
    if (err) return cb(err);

    // if not a symlink, skip to the next path part
    if (!stat.isSymbolicLink()) {
      knownHard[base] = true;
      if (cache) cache[base] = base;
      return process.nextTick(LOOP);
    }

    // stat & read the link if not read before
    // call gotTarget as soon as the link target is known
    // dev/ino always return 0 on windows, so skip the check.
    if (!_fsrealpatholdjs100_isWindows) {
      var id = stat.dev.toString(32) + ':' + stat.ino.toString(32);
      if (seenLinks.hasOwnProperty(id)) {
        return gotTarget(null, seenLinks[id], base);
      }
    }
    _fsrealpatholdjs100_fs.stat(base, function (err) {
      if (err) return cb(err);

      _fsrealpatholdjs100_fs.readlink(base, function (err, target) {
        if (!_fsrealpatholdjs100_isWindows) seenLinks[id] = target;
        gotTarget(err, target);
      });
    });
  }

  function gotTarget(err, target, base) {
    if (err) return cb(err);

    var resolvedLink = _fsrealpatholdjs100_pathModule.resolve(previous, target);
    if (cache) cache[base] = resolvedLink;
    gotResolvedLink(resolvedLink);
  }

  function gotResolvedLink(resolvedLink) {
    // resolve the link, then start over
    p = _fsrealpatholdjs100_pathModule.resolve(resolvedLink, p.slice(pos));
    start();
  }
};

/*== node_modules/fs.realpath/index.js ==*/
$m['fs.realpath/index.js#1.0.0'] = {};
$m['fs.realpath/index.js#1.0.0'] = _fsrealpathindexjs100_realpath;
_fsrealpathindexjs100_realpath.realpath = _fsrealpathindexjs100_realpath;
_fsrealpathindexjs100_realpath.sync = _fsrealpathindexjs100_realpathSync;
_fsrealpathindexjs100_realpath.realpathSync = _fsrealpathindexjs100_realpathSync;
_fsrealpathindexjs100_realpath.monkeypatch = _fsrealpathindexjs100_monkeypatch;
_fsrealpathindexjs100_realpath.unmonkeypatch = _fsrealpathindexjs100_unmonkeypatch;

var _fsrealpathindexjs100_fs = require('fs');
var _fsrealpathindexjs100_origRealpath = _fsrealpathindexjs100_fs.realpath;
var _fsrealpathindexjs100_origRealpathSync = _fsrealpathindexjs100_fs.realpathSync;

var _fsrealpathindexjs100_version = process.version;
var _fsrealpathindexjs100_ok = /^v[0-5]\./.test(_fsrealpathindexjs100_version);
var _fsrealpathindexjs100_old = $m['fs.realpath/old.js#1.0.0'];

function _fsrealpathindexjs100_newError(er) {
  return er && er.syscall === 'realpath' && (er.code === 'ELOOP' || er.code === 'ENOMEM' || er.code === 'ENAMETOOLONG');
}

function _fsrealpathindexjs100_realpath(p, cache, cb) {
  if (_fsrealpathindexjs100_ok) {
    return _fsrealpathindexjs100_origRealpath(p, cache, cb);
  }

  if (typeof cache === 'function') {
    cb = cache;
    cache = null;
  }
  _fsrealpathindexjs100_origRealpath(p, cache, function (er, result) {
    if (_fsrealpathindexjs100_newError(er)) {
      _fsrealpathindexjs100_old.realpath(p, cache, cb);
    } else {
      cb(er, result);
    }
  });
}

function _fsrealpathindexjs100_realpathSync(p, cache) {
  if (_fsrealpathindexjs100_ok) {
    return _fsrealpathindexjs100_origRealpathSync(p, cache);
  }

  try {
    return _fsrealpathindexjs100_origRealpathSync(p, cache);
  } catch (er) {
    if (_fsrealpathindexjs100_newError(er)) {
      return _fsrealpathindexjs100_old.realpathSync(p, cache);
    } else {
      throw er;
    }
  }
}

function _fsrealpathindexjs100_monkeypatch() {
  _fsrealpathindexjs100_fs.realpath = _fsrealpathindexjs100_realpath;
  _fsrealpathindexjs100_fs.realpathSync = _fsrealpathindexjs100_realpathSync;
}

function _fsrealpathindexjs100_unmonkeypatch() {
  _fsrealpathindexjs100_fs.realpath = _fsrealpathindexjs100_origRealpath;
  _fsrealpathindexjs100_fs.realpathSync = _fsrealpathindexjs100_origRealpathSync;
}

/*== node_modules/glob/sync.js ==*/
$m['glob/sync.js#7.0.6'] = {};
$m['glob/sync.js#7.0.6'] = _globsyncjs706_globSync;
_globsyncjs706_globSync.GlobSync = _globsyncjs706_GlobSync;

var _globsyncjs706_fs = require('fs');
var _globsyncjs706_rp = $m['fs.realpath/index.js#1.0.0'];
var _globsyncjs706_minimatch = $m['minimatch/minimatch.js#3.0.3'];
var _globsyncjs706_Minimatch = _globsyncjs706_minimatch.Minimatch;
var _globsyncjs706_Glob = require('glob/glob.js#7.0.6').Glob;
var _globsyncjs706_util = require('util');
var _globsyncjs706_path = require('path');
var _globsyncjs706_assert = require('assert');
var _globsyncjs706_isAbsolute = $m['path-is-absolute/index.js#1.0.0'];
var _globsyncjs706_common = $m['glob/common.js#7.0.6'];
var _globsyncjs706_alphasort = _globsyncjs706_common.alphasort;
var _globsyncjs706_alphasorti = _globsyncjs706_common.alphasorti;
var _globsyncjs706_setopts = _globsyncjs706_common.setopts;
var _globsyncjs706_ownProp = _globsyncjs706_common.ownProp;
var _globsyncjs706_childrenIgnored = _globsyncjs706_common.childrenIgnored;

function _globsyncjs706_globSync(pattern, options) {
  if (typeof options === 'function' || arguments.length === 3) throw new TypeError('callback provided to sync glob\n' + 'See: https://github.com/isaacs/node-glob/issues/167');

  return new _globsyncjs706_GlobSync(pattern, options).found;
}

function _globsyncjs706_GlobSync(pattern, options) {
  if (!pattern) throw new Error('must provide pattern');

  if (typeof options === 'function' || arguments.length === 3) throw new TypeError('callback provided to sync glob\n' + 'See: https://github.com/isaacs/node-glob/issues/167');

  if (!(this instanceof _globsyncjs706_GlobSync)) return new _globsyncjs706_GlobSync(pattern, options);

  _globsyncjs706_setopts(this, pattern, options);

  if (this.noprocess) return this;

  var n = this.minimatch.set.length;
  this.matches = new Array(n);
  for (var i = 0; i < n; i++) {
    this._process(this.minimatch.set[i], i, false);
  }
  this._finish();
}

_globsyncjs706_GlobSync.prototype._finish = function () {
  _globsyncjs706_assert(this instanceof _globsyncjs706_GlobSync);
  if (this.realpath) {
    var self = this;
    this.matches.forEach(function (matchset, index) {
      var set = self.matches[index] = Object.create(null);
      for (var p in matchset) {
        try {
          p = self._makeAbs(p);
          var real = _globsyncjs706_rp.realpathSync(p, self.realpathCache);
          set[real] = true;
        } catch (er) {
          if (er.syscall === 'stat') set[self._makeAbs(p)] = true;else throw er;
        }
      }
    });
  }
  _globsyncjs706_common.finish(this);
};

_globsyncjs706_GlobSync.prototype._process = function (pattern, index, inGlobStar) {
  _globsyncjs706_assert(this instanceof _globsyncjs706_GlobSync);

  // Get the first [n] parts of pattern that are all strings.
  var n = 0;
  while (typeof pattern[n] === 'string') {
    n++;
  }
  // now n is the index of the first one that is *not* a string.

  // See if there's anything else
  var prefix;
  switch (n) {
    // if not, then this is rather simple
    case pattern.length:
      this._processSimple(pattern.join('/'), index);
      return;

    case 0:
      // pattern *starts* with some non-trivial item.
      // going to readdir(cwd), but not include the prefix in matches.
      prefix = null;
      break;

    default:
      // pattern has some string bits in the front.
      // whatever it starts with, whether that's 'absolute' like /foo/bar,
      // or 'relative' like '../baz'
      prefix = pattern.slice(0, n).join('/');
      break;
  }

  var remain = pattern.slice(n);

  // get the list of entries.
  var read;
  if (prefix === null) read = '.';else if (_globsyncjs706_isAbsolute(prefix) || _globsyncjs706_isAbsolute(pattern.join('/'))) {
    if (!prefix || !_globsyncjs706_isAbsolute(prefix)) prefix = '/' + prefix;
    read = prefix;
  } else read = prefix;

  var abs = this._makeAbs(read);

  //if ignored, skip processing
  if (_globsyncjs706_childrenIgnored(this, read)) return;

  var isGlobStar = remain[0] === _globsyncjs706_minimatch.GLOBSTAR;
  if (isGlobStar) this._processGlobStar(prefix, read, abs, remain, index, inGlobStar);else this._processReaddir(prefix, read, abs, remain, index, inGlobStar);
};

_globsyncjs706_GlobSync.prototype._processReaddir = function (prefix, read, abs, remain, index, inGlobStar) {
  var entries = this._readdir(abs, inGlobStar);

  // if the abs isn't a dir, then nothing can match!
  if (!entries) return;

  // It will only match dot entries if it starts with a dot, or if
  // dot is set.  Stuff like @(.foo|.bar) isn't allowed.
  var pn = remain[0];
  var negate = !!this.minimatch.negate;
  var rawGlob = pn._glob;
  var dotOk = this.dot || rawGlob.charAt(0) === '.';

  var matchedEntries = [];
  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    if (e.charAt(0) !== '.' || dotOk) {
      var m;
      if (negate && !prefix) {
        m = !e.match(pn);
      } else {
        m = e.match(pn);
      }
      if (m) matchedEntries.push(e);
    }
  }

  var len = matchedEntries.length;
  // If there are no matched entries, then nothing matches.
  if (len === 0) return;

  // if this is the last remaining pattern bit, then no need for
  // an additional stat *unless* the user has specified mark or
  // stat explicitly.  We know they exist, since readdir returned
  // them.

  if (remain.length === 1 && !this.mark && !this.stat) {
    if (!this.matches[index]) this.matches[index] = Object.create(null);

    for (var i = 0; i < len; i++) {
      var e = matchedEntries[i];
      if (prefix) {
        if (prefix.slice(-1) !== '/') e = prefix + '/' + e;else e = prefix + e;
      }

      if (e.charAt(0) === '/' && !this.nomount) {
        e = _globsyncjs706_path.join(this.root, e);
      }
      this.matches[index][e] = true;
    }
    // This was the last one, and no stats were needed
    return;
  }

  // now test all matched entries as stand-ins for that part
  // of the pattern.
  remain.shift();
  for (var i = 0; i < len; i++) {
    var e = matchedEntries[i];
    var newPattern;
    if (prefix) newPattern = [prefix, e];else newPattern = [e];
    this._process(newPattern.concat(remain), index, inGlobStar);
  }
};

_globsyncjs706_GlobSync.prototype._emitMatch = function (index, e) {
  var abs = this._makeAbs(e);
  if (this.mark) e = this._mark(e);

  if (this.matches[index][e]) return;

  if (this.nodir) {
    var c = this.cache[this._makeAbs(e)];
    if (c === 'DIR' || Array.isArray(c)) return;
  }

  this.matches[index][e] = true;
  if (this.stat) this._stat(e);
};

_globsyncjs706_GlobSync.prototype._readdirInGlobStar = function (abs) {
  // follow all symlinked directories forever
  // just proceed as if this is a non-globstar situation
  if (this.follow) return this._readdir(abs, false);

  var entries;
  var lstat;
  var stat;
  try {
    lstat = _globsyncjs706_fs.lstatSync(abs);
  } catch (er) {
    // lstat failed, doesn't exist
    return null;
  }

  var isSym = lstat.isSymbolicLink();
  this.symlinks[abs] = isSym;

  // If it's not a symlink or a dir, then it's definitely a regular file.
  // don't bother doing a readdir in that case.
  if (!isSym && !lstat.isDirectory()) this.cache[abs] = 'FILE';else entries = this._readdir(abs, false);

  return entries;
};

_globsyncjs706_GlobSync.prototype._readdir = function (abs, inGlobStar) {
  var entries;

  if (inGlobStar && !_globsyncjs706_ownProp(this.symlinks, abs)) return this._readdirInGlobStar(abs);

  if (_globsyncjs706_ownProp(this.cache, abs)) {
    var c = this.cache[abs];
    if (!c || c === 'FILE') return null;

    if (Array.isArray(c)) return c;
  }

  try {
    return this._readdirEntries(abs, _globsyncjs706_fs.readdirSync(abs));
  } catch (er) {
    this._readdirError(abs, er);
    return null;
  }
};

_globsyncjs706_GlobSync.prototype._readdirEntries = function (abs, entries) {
  // if we haven't asked to stat everything, then just
  // assume that everything in there exists, so we can avoid
  // having to stat it a second time.
  if (!this.mark && !this.stat) {
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      if (abs === '/') e = abs + e;else e = abs + '/' + e;
      this.cache[e] = true;
    }
  }

  this.cache[abs] = entries;

  // mark and cache dir-ness
  return entries;
};

_globsyncjs706_GlobSync.prototype._readdirError = function (f, er) {
  // handle errors, and cache the information
  switch (er.code) {
    case 'ENOTSUP': // https://github.com/isaacs/node-glob/issues/205
    case 'ENOTDIR':
      // totally normal. means it *does* exist.
      var abs = this._makeAbs(f);
      this.cache[abs] = 'FILE';
      if (abs === this.cwdAbs) {
        var error = new Error(er.code + ' invalid cwd ' + this.cwd);
        error.path = this.cwd;
        error.code = er.code;
        throw error;
      }
      break;

    case 'ENOENT': // not terribly unusual
    case 'ELOOP':
    case 'ENAMETOOLONG':
    case 'UNKNOWN':
      this.cache[this._makeAbs(f)] = false;
      break;

    default:
      // some unusual error.  Treat as failure.
      this.cache[this._makeAbs(f)] = false;
      if (this.strict) throw er;
      if (!this.silent) console.error('glob error', er);
      break;
  }
};

_globsyncjs706_GlobSync.prototype._processGlobStar = function (prefix, read, abs, remain, index, inGlobStar) {

  var entries = this._readdir(abs, inGlobStar);

  // no entries means not a dir, so it can never have matches
  // foo.txt/** doesn't match foo.txt
  if (!entries) return;

  // test without the globstar, and with every child both below
  // and replacing the globstar.
  var remainWithoutGlobStar = remain.slice(1);
  var gspref = prefix ? [prefix] : [];
  var noGlobStar = gspref.concat(remainWithoutGlobStar);

  // the noGlobStar pattern exits the inGlobStar state
  this._process(noGlobStar, index, false);

  var len = entries.length;
  var isSym = this.symlinks[abs];

  // If it's a symlink, and we're in a globstar, then stop
  if (isSym && inGlobStar) return;

  for (var i = 0; i < len; i++) {
    var e = entries[i];
    if (e.charAt(0) === '.' && !this.dot) continue;

    // these two cases enter the inGlobStar state
    var instead = gspref.concat(entries[i], remainWithoutGlobStar);
    this._process(instead, index, true);

    var below = gspref.concat(entries[i], remain);
    this._process(below, index, true);
  }
};

_globsyncjs706_GlobSync.prototype._processSimple = function (prefix, index) {
  // XXX review this.  Shouldn't it be doing the mounting etc
  // before doing stat?  kinda weird?
  var exists = this._stat(prefix);

  if (!this.matches[index]) this.matches[index] = Object.create(null);

  // If it doesn't exist, then just mark the lack of results
  if (!exists) return;

  if (prefix && _globsyncjs706_isAbsolute(prefix) && !this.nomount) {
    var trail = /[\/\\]$/.test(prefix);
    if (prefix.charAt(0) === '/') {
      prefix = _globsyncjs706_path.join(this.root, prefix);
    } else {
      prefix = _globsyncjs706_path.resolve(this.root, prefix);
      if (trail) prefix += '/';
    }
  }

  if (process.platform === 'win32') prefix = prefix.replace(/\\/g, '/');

  // Mark this as a match
  this.matches[index][prefix] = true;
};

// Returns either 'DIR', 'FILE', or false
_globsyncjs706_GlobSync.prototype._stat = function (f) {
  var abs = this._makeAbs(f);
  var needDir = f.slice(-1) === '/';

  if (f.length > this.maxLength) return false;

  if (!this.stat && _globsyncjs706_ownProp(this.cache, abs)) {
    var c = this.cache[abs];

    if (Array.isArray(c)) c = 'DIR';

    // It exists, but maybe not how we need it
    if (!needDir || c === 'DIR') return c;

    if (needDir && c === 'FILE') return false;

    // otherwise we have to stat, because maybe c=true
    // if we know it exists, but not what it is.
  }

  var exists;
  var stat = this.statCache[abs];
  if (!stat) {
    var lstat;
    try {
      lstat = _globsyncjs706_fs.lstatSync(abs);
    } catch (er) {
      return false;
    }

    if (lstat.isSymbolicLink()) {
      try {
        stat = _globsyncjs706_fs.statSync(abs);
      } catch (er) {
        stat = lstat;
      }
    } else {
      stat = lstat;
    }
  }

  this.statCache[abs] = stat;

  var c = stat.isDirectory() ? 'DIR' : 'FILE';
  this.cache[abs] = this.cache[abs] || c;

  if (needDir && c !== 'DIR') return false;

  return c;
};

_globsyncjs706_GlobSync.prototype._mark = function (p) {
  return _globsyncjs706_common.mark(this, p);
};

_globsyncjs706_GlobSync.prototype._makeAbs = function (f) {
  return _globsyncjs706_common.makeAbs(this, f);
};

/*== node_modules/inherits/inherits_browser.js ==*/
$m['inherits/inherits_browser.js#2.0.3'] = {};
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  $m['inherits/inherits_browser.js#2.0.3'] = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  $m['inherits/inherits_browser.js#2.0.3'] = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor;
    var TempCtor = function () {};
    TempCtor.prototype = superCtor.prototype;
    ctor.prototype = new TempCtor();
    ctor.prototype.constructor = ctor;
  };
}

/*== node_modules/glob/glob.js ==*/
$m['glob/glob.js#7.0.6'] = {};
// Approach:
//
// 1. Get the minimatch set
// 2. For each pattern in the set, PROCESS(pattern, false)
// 3. Store matches per-set, then uniq them
//
// PROCESS(pattern, inGlobStar)
// Get the first [n] items from pattern that are all strings
// Join these together.  This is PREFIX.
//   If there is no more remaining, then stat(PREFIX) and
//   add to matches if it succeeds.  END.
//
// If inGlobStar and PREFIX is symlink and points to dir
//   set ENTRIES = []
// else readdir(PREFIX) as ENTRIES
//   If fail, END
//
// with ENTRIES
//   If pattern[n] is GLOBSTAR
//     // handle the case where the globstar match is empty
//     // by pruning it out, and testing the resulting pattern
//     PROCESS(pattern[0..n] + pattern[n+1 .. $], false)
//     // handle other cases.
//     for ENTRY in ENTRIES (not dotfiles)
//       // attach globstar + tail onto the entry
//       // Mark that this entry is a globstar match
//       PROCESS(pattern[0..n] + ENTRY + pattern[n .. $], true)
//
//   else // not globstar
//     for ENTRY in ENTRIES (not dotfiles, unless pattern[n] is dot)
//       Test ENTRY against pattern[n]
//       If fails, continue
//       If passes, PROCESS(pattern[0..n] + item + pattern[n+1 .. $])
//
// Caveat:
//   Cache all stats and readdirs results to minimize syscall.  Since all
//   we ever care about is existence and directory-ness, we can just keep
//   `true` for files, and [children,...] for directories, or `false` for
//   things that don't exist.

$m['glob/glob.js#7.0.6'] = _globglobjs706_glob;

var _globglobjs706_fs = require('fs');
var _globglobjs706_rp = $m['fs.realpath/index.js#1.0.0'];
var _globglobjs706_minimatch = $m['minimatch/minimatch.js#3.0.3'];
var _globglobjs706_Minimatch = _globglobjs706_minimatch.Minimatch;
var _globglobjs706_inherits = $m['inherits/inherits_browser.js#2.0.3'];
var _globglobjs706_EE = require('events').EventEmitter;
var _globglobjs706_path = require('path');
var _globglobjs706_assert = require('assert');
var _globglobjs706_isAbsolute = $m['path-is-absolute/index.js#1.0.0'];
var _globglobjs706_globSync = $m['glob/sync.js#7.0.6'];
var _globglobjs706_common = $m['glob/common.js#7.0.6'];
var _globglobjs706_alphasort = _globglobjs706_common.alphasort;
var _globglobjs706_alphasorti = _globglobjs706_common.alphasorti;
var _globglobjs706_setopts = _globglobjs706_common.setopts;
var _globglobjs706_ownProp = _globglobjs706_common.ownProp;
var _globglobjs706_inflight = $m['inflight/inflight.js#1.0.5'];
var _globglobjs706_util = require('util');
var _globglobjs706_childrenIgnored = _globglobjs706_common.childrenIgnored;
var _globglobjs706_isIgnored = _globglobjs706_common.isIgnored;

var _globglobjs706_once = $m['once/once.js#1.4.0'];

function _globglobjs706_glob(pattern, options, cb) {
  if (typeof options === 'function') cb = options, options = {};
  if (!options) options = {};

  if (options.sync) {
    if (cb) throw new TypeError('callback provided to sync glob');
    return _globglobjs706_globSync(pattern, options);
  }

  return new _globglobjs706_Glob(pattern, options, cb);
}

_globglobjs706_glob.sync = _globglobjs706_globSync;
var _globglobjs706_GlobSync = _globglobjs706_glob.GlobSync = _globglobjs706_globSync.GlobSync;

// old api surface
_globglobjs706_glob.glob = _globglobjs706_glob;

function _globglobjs706_extend(origin, add) {
  if (add === null || typeof add !== 'object') {
    return origin;
  }

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
}

_globglobjs706_glob.hasMagic = function (pattern, options_) {
  var options = _globglobjs706_extend({}, options_);
  options.noprocess = true;

  var g = new _globglobjs706_Glob(pattern, options);
  var set = g.minimatch.set;

  if (!pattern) return false;

  if (set.length > 1) return true;

  for (var j = 0; j < set[0].length; j++) {
    if (typeof set[0][j] !== 'string') return true;
  }

  return false;
};

_globglobjs706_glob.Glob = _globglobjs706_Glob;
_globglobjs706_inherits(_globglobjs706_Glob, _globglobjs706_EE);
function _globglobjs706_Glob(pattern, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = null;
  }

  if (options && options.sync) {
    if (cb) throw new TypeError('callback provided to sync glob');
    return new _globglobjs706_GlobSync(pattern, options);
  }

  if (!(this instanceof _globglobjs706_Glob)) return new _globglobjs706_Glob(pattern, options, cb);

  _globglobjs706_setopts(this, pattern, options);
  this._didRealPath = false;

  // process each pattern in the minimatch set
  var n = this.minimatch.set.length;

  // The matches are stored as {<filename>: true,...} so that
  // duplicates are automagically pruned.
  // Later, we do an Object.keys() on these.
  // Keep them as a list so we can fill in when nonull is set.
  this.matches = new Array(n);

  if (typeof cb === 'function') {
    cb = _globglobjs706_once(cb);
    this.on('error', cb);
    this.on('end', function (matches) {
      cb(null, matches);
    });
  }

  var self = this;
  var n = this.minimatch.set.length;
  this._processing = 0;
  this.matches = new Array(n);

  this._emitQueue = [];
  this._processQueue = [];
  this.paused = false;

  if (this.noprocess) return this;

  if (n === 0) return done();

  var sync = true;
  for (var i = 0; i < n; i++) {
    this._process(this.minimatch.set[i], i, false, done);
  }
  sync = false;

  function done() {
    --self._processing;
    if (self._processing <= 0) {
      if (sync) {
        process.nextTick(function () {
          self._finish();
        });
      } else {
        self._finish();
      }
    }
  }
}

_globglobjs706_Glob.prototype._finish = function () {
  _globglobjs706_assert(this instanceof _globglobjs706_Glob);
  if (this.aborted) return;

  if (this.realpath && !this._didRealpath) return this._realpath();

  _globglobjs706_common.finish(this);
  this.emit('end', this.found);
};

_globglobjs706_Glob.prototype._realpath = function () {
  if (this._didRealpath) return;

  this._didRealpath = true;

  var n = this.matches.length;
  if (n === 0) return this._finish();

  var self = this;
  for (var i = 0; i < this.matches.length; i++) this._realpathSet(i, next);

  function next() {
    if (--n === 0) self._finish();
  }
};

_globglobjs706_Glob.prototype._realpathSet = function (index, cb) {
  var matchset = this.matches[index];
  if (!matchset) return cb();

  var found = Object.keys(matchset);
  var self = this;
  var n = found.length;

  if (n === 0) return cb();

  var set = this.matches[index] = Object.create(null);
  found.forEach(function (p, i) {
    // If there's a problem with the stat, then it means that
    // one or more of the links in the realpath couldn't be
    // resolved.  just return the abs value in that case.
    p = self._makeAbs(p);
    _globglobjs706_rp.realpath(p, self.realpathCache, function (er, real) {
      if (!er) set[real] = true;else if (er.syscall === 'stat') set[p] = true;else self.emit('error', er); // srsly wtf right here

      if (--n === 0) {
        self.matches[index] = set;
        cb();
      }
    });
  });
};

_globglobjs706_Glob.prototype._mark = function (p) {
  return _globglobjs706_common.mark(this, p);
};

_globglobjs706_Glob.prototype._makeAbs = function (f) {
  return _globglobjs706_common.makeAbs(this, f);
};

_globglobjs706_Glob.prototype.abort = function () {
  this.aborted = true;
  this.emit('abort');
};

_globglobjs706_Glob.prototype.pause = function () {
  if (!this.paused) {
    this.paused = true;
    this.emit('pause');
  }
};

_globglobjs706_Glob.prototype.resume = function () {
  if (this.paused) {
    this.emit('resume');
    this.paused = false;
    if (this._emitQueue.length) {
      var eq = this._emitQueue.slice(0);
      this._emitQueue.length = 0;
      for (var i = 0; i < eq.length; i++) {
        var e = eq[i];
        this._emitMatch(e[0], e[1]);
      }
    }
    if (this._processQueue.length) {
      var pq = this._processQueue.slice(0);
      this._processQueue.length = 0;
      for (var i = 0; i < pq.length; i++) {
        var p = pq[i];
        this._processing--;
        this._process(p[0], p[1], p[2], p[3]);
      }
    }
  }
};

_globglobjs706_Glob.prototype._process = function (pattern, index, inGlobStar, cb) {
  _globglobjs706_assert(this instanceof _globglobjs706_Glob);
  _globglobjs706_assert(typeof cb === 'function');

  if (this.aborted) return;

  this._processing++;
  if (this.paused) {
    this._processQueue.push([pattern, index, inGlobStar, cb]);
    return;
  }

  //console.error('PROCESS %d', this._processing, pattern)

  // Get the first [n] parts of pattern that are all strings.
  var n = 0;
  while (typeof pattern[n] === 'string') {
    n++;
  }
  // now n is the index of the first one that is *not* a string.

  // see if there's anything else
  var prefix;
  switch (n) {
    // if not, then this is rather simple
    case pattern.length:
      this._processSimple(pattern.join('/'), index, cb);
      return;

    case 0:
      // pattern *starts* with some non-trivial item.
      // going to readdir(cwd), but not include the prefix in matches.
      prefix = null;
      break;

    default:
      // pattern has some string bits in the front.
      // whatever it starts with, whether that's 'absolute' like /foo/bar,
      // or 'relative' like '../baz'
      prefix = pattern.slice(0, n).join('/');
      break;
  }

  var remain = pattern.slice(n);

  // get the list of entries.
  var read;
  if (prefix === null) read = '.';else if (_globglobjs706_isAbsolute(prefix) || _globglobjs706_isAbsolute(pattern.join('/'))) {
    if (!prefix || !_globglobjs706_isAbsolute(prefix)) prefix = '/' + prefix;
    read = prefix;
  } else read = prefix;

  var abs = this._makeAbs(read);

  //if ignored, skip _processing
  if (_globglobjs706_childrenIgnored(this, read)) return cb();

  var isGlobStar = remain[0] === _globglobjs706_minimatch.GLOBSTAR;
  if (isGlobStar) this._processGlobStar(prefix, read, abs, remain, index, inGlobStar, cb);else this._processReaddir(prefix, read, abs, remain, index, inGlobStar, cb);
};

_globglobjs706_Glob.prototype._processReaddir = function (prefix, read, abs, remain, index, inGlobStar, cb) {
  var self = this;
  this._readdir(abs, inGlobStar, function (er, entries) {
    return self._processReaddir2(prefix, read, abs, remain, index, inGlobStar, entries, cb);
  });
};

_globglobjs706_Glob.prototype._processReaddir2 = function (prefix, read, abs, remain, index, inGlobStar, entries, cb) {

  // if the abs isn't a dir, then nothing can match!
  if (!entries) return cb();

  // It will only match dot entries if it starts with a dot, or if
  // dot is set.  Stuff like @(.foo|.bar) isn't allowed.
  var pn = remain[0];
  var negate = !!this.minimatch.negate;
  var rawGlob = pn._glob;
  var dotOk = this.dot || rawGlob.charAt(0) === '.';

  var matchedEntries = [];
  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    if (e.charAt(0) !== '.' || dotOk) {
      var m;
      if (negate && !prefix) {
        m = !e.match(pn);
      } else {
        m = e.match(pn);
      }
      if (m) matchedEntries.push(e);
    }
  }

  //console.error('prd2', prefix, entries, remain[0]._glob, matchedEntries)

  var len = matchedEntries.length;
  // If there are no matched entries, then nothing matches.
  if (len === 0) return cb();

  // if this is the last remaining pattern bit, then no need for
  // an additional stat *unless* the user has specified mark or
  // stat explicitly.  We know they exist, since readdir returned
  // them.

  if (remain.length === 1 && !this.mark && !this.stat) {
    if (!this.matches[index]) this.matches[index] = Object.create(null);

    for (var i = 0; i < len; i++) {
      var e = matchedEntries[i];
      if (prefix) {
        if (prefix !== '/') e = prefix + '/' + e;else e = prefix + e;
      }

      if (e.charAt(0) === '/' && !this.nomount) {
        e = _globglobjs706_path.join(this.root, e);
      }
      this._emitMatch(index, e);
    }
    // This was the last one, and no stats were needed
    return cb();
  }

  // now test all matched entries as stand-ins for that part
  // of the pattern.
  remain.shift();
  for (var i = 0; i < len; i++) {
    var e = matchedEntries[i];
    var newPattern;
    if (prefix) {
      if (prefix !== '/') e = prefix + '/' + e;else e = prefix + e;
    }
    this._process([e].concat(remain), index, inGlobStar, cb);
  }
  cb();
};

_globglobjs706_Glob.prototype._emitMatch = function (index, e) {
  if (this.aborted) return;

  if (this.matches[index][e]) return;

  if (_globglobjs706_isIgnored(this, e)) return;

  if (this.paused) {
    this._emitQueue.push([index, e]);
    return;
  }

  var abs = this._makeAbs(e);

  if (this.nodir) {
    var c = this.cache[abs];
    if (c === 'DIR' || Array.isArray(c)) return;
  }

  if (this.mark) e = this._mark(e);

  this.matches[index][e] = true;

  var st = this.statCache[abs];
  if (st) this.emit('stat', e, st);

  this.emit('match', e);
};

_globglobjs706_Glob.prototype._readdirInGlobStar = function (abs, cb) {
  if (this.aborted) return;

  // follow all symlinked directories forever
  // just proceed as if this is a non-globstar situation
  if (this.follow) return this._readdir(abs, false, cb);

  var lstatkey = 'lstat\0' + abs;
  var self = this;
  var lstatcb = _globglobjs706_inflight(lstatkey, lstatcb_);

  if (lstatcb) _globglobjs706_fs.lstat(abs, lstatcb);

  function lstatcb_(er, lstat) {
    if (er) return cb();

    var isSym = lstat.isSymbolicLink();
    self.symlinks[abs] = isSym;

    // If it's not a symlink or a dir, then it's definitely a regular file.
    // don't bother doing a readdir in that case.
    if (!isSym && !lstat.isDirectory()) {
      self.cache[abs] = 'FILE';
      cb();
    } else self._readdir(abs, false, cb);
  }
};

_globglobjs706_Glob.prototype._readdir = function (abs, inGlobStar, cb) {
  if (this.aborted) return;

  cb = _globglobjs706_inflight('readdir\0' + abs + '\0' + inGlobStar, cb);
  if (!cb) return;

  //console.error('RD %j %j', +inGlobStar, abs)
  if (inGlobStar && !_globglobjs706_ownProp(this.symlinks, abs)) return this._readdirInGlobStar(abs, cb);

  if (_globglobjs706_ownProp(this.cache, abs)) {
    var c = this.cache[abs];
    if (!c || c === 'FILE') return cb();

    if (Array.isArray(c)) return cb(null, c);
  }

  var self = this;
  _globglobjs706_fs.readdir(abs, _globglobjs706_readdirCb(this, abs, cb));
};

function _globglobjs706_readdirCb(self, abs, cb) {
  return function (er, entries) {
    if (er) self._readdirError(abs, er, cb);else self._readdirEntries(abs, entries, cb);
  };
}

_globglobjs706_Glob.prototype._readdirEntries = function (abs, entries, cb) {
  if (this.aborted) return;

  // if we haven't asked to stat everything, then just
  // assume that everything in there exists, so we can avoid
  // having to stat it a second time.
  if (!this.mark && !this.stat) {
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      if (abs === '/') e = abs + e;else e = abs + '/' + e;
      this.cache[e] = true;
    }
  }

  this.cache[abs] = entries;
  return cb(null, entries);
};

_globglobjs706_Glob.prototype._readdirError = function (f, er, cb) {
  if (this.aborted) return;

  // handle errors, and cache the information
  switch (er.code) {
    case 'ENOTSUP': // https://github.com/isaacs/node-glob/issues/205
    case 'ENOTDIR':
      // totally normal. means it *does* exist.
      var abs = this._makeAbs(f);
      this.cache[abs] = 'FILE';
      if (abs === this.cwdAbs) {
        var error = new Error(er.code + ' invalid cwd ' + this.cwd);
        error.path = this.cwd;
        error.code = er.code;
        this.emit('error', error);
        this.abort();
      }
      break;

    case 'ENOENT': // not terribly unusual
    case 'ELOOP':
    case 'ENAMETOOLONG':
    case 'UNKNOWN':
      this.cache[this._makeAbs(f)] = false;
      break;

    default:
      // some unusual error.  Treat as failure.
      this.cache[this._makeAbs(f)] = false;
      if (this.strict) {
        this.emit('error', er);
        // If the error is handled, then we abort
        // if not, we threw out of here
        this.abort();
      }
      if (!this.silent) console.error('glob error', er);
      break;
  }

  return cb();
};

_globglobjs706_Glob.prototype._processGlobStar = function (prefix, read, abs, remain, index, inGlobStar, cb) {
  var self = this;
  this._readdir(abs, inGlobStar, function (er, entries) {
    self._processGlobStar2(prefix, read, abs, remain, index, inGlobStar, entries, cb);
  });
};

_globglobjs706_Glob.prototype._processGlobStar2 = function (prefix, read, abs, remain, index, inGlobStar, entries, cb) {
  //console.error('pgs2', prefix, remain[0], entries)

  // no entries means not a dir, so it can never have matches
  // foo.txt/** doesn't match foo.txt
  if (!entries) return cb();

  // test without the globstar, and with every child both below
  // and replacing the globstar.
  var remainWithoutGlobStar = remain.slice(1);
  var gspref = prefix ? [prefix] : [];
  var noGlobStar = gspref.concat(remainWithoutGlobStar);

  // the noGlobStar pattern exits the inGlobStar state
  this._process(noGlobStar, index, false, cb);

  var isSym = this.symlinks[abs];
  var len = entries.length;

  // If it's a symlink, and we're in a globstar, then stop
  if (isSym && inGlobStar) return cb();

  for (var i = 0; i < len; i++) {
    var e = entries[i];
    if (e.charAt(0) === '.' && !this.dot) continue;

    // these two cases enter the inGlobStar state
    var instead = gspref.concat(entries[i], remainWithoutGlobStar);
    this._process(instead, index, true, cb);

    var below = gspref.concat(entries[i], remain);
    this._process(below, index, true, cb);
  }

  cb();
};

_globglobjs706_Glob.prototype._processSimple = function (prefix, index, cb) {
  // XXX review this.  Shouldn't it be doing the mounting etc
  // before doing stat?  kinda weird?
  var self = this;
  this._stat(prefix, function (er, exists) {
    self._processSimple2(prefix, index, er, exists, cb);
  });
};
_globglobjs706_Glob.prototype._processSimple2 = function (prefix, index, er, exists, cb) {

  //console.error('ps2', prefix, exists)

  if (!this.matches[index]) this.matches[index] = Object.create(null);

  // If it doesn't exist, then just mark the lack of results
  if (!exists) return cb();

  if (prefix && _globglobjs706_isAbsolute(prefix) && !this.nomount) {
    var trail = /[\/\\]$/.test(prefix);
    if (prefix.charAt(0) === '/') {
      prefix = _globglobjs706_path.join(this.root, prefix);
    } else {
      prefix = _globglobjs706_path.resolve(this.root, prefix);
      if (trail) prefix += '/';
    }
  }

  if (process.platform === 'win32') prefix = prefix.replace(/\\/g, '/');

  // Mark this as a match
  this._emitMatch(index, prefix);
  cb();
};

// Returns either 'DIR', 'FILE', or false
_globglobjs706_Glob.prototype._stat = function (f, cb) {
  var abs = this._makeAbs(f);
  var needDir = f.slice(-1) === '/';

  if (f.length > this.maxLength) return cb();

  if (!this.stat && _globglobjs706_ownProp(this.cache, abs)) {
    var c = this.cache[abs];

    if (Array.isArray(c)) c = 'DIR';

    // It exists, but maybe not how we need it
    if (!needDir || c === 'DIR') return cb(null, c);

    if (needDir && c === 'FILE') return cb();

    // otherwise we have to stat, because maybe c=true
    // if we know it exists, but not what it is.
  }

  var exists;
  var stat = this.statCache[abs];
  if (stat !== undefined) {
    if (stat === false) return cb(null, stat);else {
      var type = stat.isDirectory() ? 'DIR' : 'FILE';
      if (needDir && type === 'FILE') return cb();else return cb(null, type, stat);
    }
  }

  var self = this;
  var statcb = _globglobjs706_inflight('stat\0' + abs, lstatcb_);
  if (statcb) _globglobjs706_fs.lstat(abs, statcb);

  function lstatcb_(er, lstat) {
    if (lstat && lstat.isSymbolicLink()) {
      // If it's a symlink, then treat it as the target, unless
      // the target does not exist, then treat it as a file.
      return _globglobjs706_fs.stat(abs, function (er, stat) {
        if (er) self._stat2(f, abs, null, lstat, cb);else self._stat2(f, abs, er, stat, cb);
      });
    } else {
      self._stat2(f, abs, er, lstat, cb);
    }
  }
};

_globglobjs706_Glob.prototype._stat2 = function (f, abs, er, stat, cb) {
  if (er) {
    this.statCache[abs] = false;
    return cb();
  }

  var needDir = f.slice(-1) === '/';
  this.statCache[abs] = stat;

  if (abs.slice(-1) === '/' && !stat.isDirectory()) return cb(null, false, stat);

  var c = stat.isDirectory() ? 'DIR' : 'FILE';
  this.cache[abs] = this.cache[abs] || c;

  if (needDir && c !== 'DIR') return cb();

  return cb(null, c, stat);
};

/*== node_modules/recur-fs/node_modules/rimraf/rimraf.js ==*/
$m['rimraf/rimraf.js#2.5.2'] = {};
$m['rimraf/rimraf.js#2.5.2'] = _rimrafrimrafjs252_rimraf;
_rimrafrimrafjs252_rimraf.sync = _rimrafrimrafjs252_rimrafSync;

var _rimrafrimrafjs252_assert = require("assert");
var _rimrafrimrafjs252_path = require("path");
var _rimrafrimrafjs252_fs = require("fs");
var _rimrafrimrafjs252_glob = $m['glob/glob.js#7.0.6'];

var _rimrafrimrafjs252_defaultGlobOpts = {
  nosort: true,
  silent: true
};

// for EMFILE handling
var _rimrafrimrafjs252_timeout = 0;

var _rimrafrimrafjs252_isWindows = process.platform === "win32";

function _rimrafrimrafjs252_defaults(options) {
  var methods = ['unlink', 'chmod', 'stat', 'lstat', 'rmdir', 'readdir'];
  methods.forEach(function (m) {
    options[m] = options[m] || _rimrafrimrafjs252_fs[m];
    m = m + 'Sync';
    options[m] = options[m] || _rimrafrimrafjs252_fs[m];
  });

  options.maxBusyTries = options.maxBusyTries || 3;
  options.emfileWait = options.emfileWait || 1000;
  if (options.glob === false) {
    options.disableGlob = true;
  }
  options.disableGlob = options.disableGlob || false;
  options.glob = options.glob || _rimrafrimrafjs252_defaultGlobOpts;
}

function _rimrafrimrafjs252_rimraf(p, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  _rimrafrimrafjs252_assert(p, 'rimraf: missing path');
  _rimrafrimrafjs252_assert.equal(typeof p, 'string', 'rimraf: path should be a string');
  _rimrafrimrafjs252_assert(options, 'rimraf: missing options');
  _rimrafrimrafjs252_assert.equal(typeof options, 'object', 'rimraf: options should be object');
  _rimrafrimrafjs252_assert.equal(typeof cb, 'function', 'rimraf: callback function required');

  _rimrafrimrafjs252_defaults(options);

  var busyTries = 0;
  var errState = null;
  var n = 0;

  if (options.disableGlob || !_rimrafrimrafjs252_glob.hasMagic(p)) return afterGlob(null, [p]);

  _rimrafrimrafjs252_fs.lstat(p, function (er, stat) {
    if (!er) return afterGlob(null, [p]);

    _rimrafrimrafjs252_glob(p, options.glob, afterGlob);
  });

  function next(er) {
    errState = errState || er;
    if (--n === 0) cb(errState);
  }

  function afterGlob(er, results) {
    if (er) return cb(er);

    n = results.length;
    if (n === 0) return cb();

    results.forEach(function (p) {
      _rimrafrimrafjs252_rimraf_(p, options, function CB(er) {
        if (er) {
          if (_rimrafrimrafjs252_isWindows && (er.code === "EBUSY" || er.code === "ENOTEMPTY" || er.code === "EPERM") && busyTries < options.maxBusyTries) {
            busyTries++;
            var time = busyTries * 100;
            // try again, with the same exact callback as this one.
            return setTimeout(function () {
              _rimrafrimrafjs252_rimraf_(p, options, CB);
            }, time);
          }

          // this one won't happen if graceful-fs is used.
          if (er.code === "EMFILE" && _rimrafrimrafjs252_timeout < options.emfileWait) {
            return setTimeout(function () {
              _rimrafrimrafjs252_rimraf_(p, options, CB);
            }, _rimrafrimrafjs252_timeout++);
          }

          // already gone
          if (er.code === "ENOENT") er = null;
        }

        _rimrafrimrafjs252_timeout = 0;
        next(er);
      });
    });
  }
}

// Two possible strategies.
// 1. Assume it's a file.  unlink it, then do the dir stuff on EPERM or EISDIR
// 2. Assume it's a directory.  readdir, then do the file stuff on ENOTDIR
//
// Both result in an extra syscall when you guess wrong.  However, there
// are likely far more normal files in the world than directories.  This
// is based on the assumption that a the average number of files per
// directory is >= 1.
//
// If anyone ever complains about this, then I guess the strategy could
// be made configurable somehow.  But until then, YAGNI.
function _rimrafrimrafjs252_rimraf_(p, options, cb) {
  _rimrafrimrafjs252_assert(p);
  _rimrafrimrafjs252_assert(options);
  _rimrafrimrafjs252_assert(typeof cb === 'function');

  // sunos lets the root user unlink directories, which is... weird.
  // so we have to lstat here and make sure it's not a dir.
  options.lstat(p, function (er, st) {
    if (er && er.code === "ENOENT") return cb(null);

    if (st && st.isDirectory()) return _rimrafrimrafjs252_rmdir(p, options, er, cb);

    options.unlink(p, function (er) {
      if (er) {
        if (er.code === "ENOENT") return cb(null);
        if (er.code === "EPERM") return _rimrafrimrafjs252_isWindows ? _rimrafrimrafjs252_fixWinEPERM(p, options, er, cb) : _rimrafrimrafjs252_rmdir(p, options, er, cb);
        if (er.code === "EISDIR") return _rimrafrimrafjs252_rmdir(p, options, er, cb);
      }
      return cb(er);
    });
  });
}

function _rimrafrimrafjs252_fixWinEPERM(p, options, er, cb) {
  _rimrafrimrafjs252_assert(p);
  _rimrafrimrafjs252_assert(options);
  _rimrafrimrafjs252_assert(typeof cb === 'function');
  if (er) _rimrafrimrafjs252_assert(er instanceof Error);

  options.chmod(p, 666, function (er2) {
    if (er2) cb(er2.code === "ENOENT" ? null : er);else options.stat(p, function (er3, stats) {
      if (er3) cb(er3.code === "ENOENT" ? null : er);else if (stats.isDirectory()) _rimrafrimrafjs252_rmdir(p, options, er, cb);else options.unlink(p, cb);
    });
  });
}

function _rimrafrimrafjs252_fixWinEPERMSync(p, options, er) {
  _rimrafrimrafjs252_assert(p);
  _rimrafrimrafjs252_assert(options);
  if (er) _rimrafrimrafjs252_assert(er instanceof Error);

  try {
    options.chmodSync(p, 666);
  } catch (er2) {
    if (er2.code === "ENOENT") return;else throw er;
  }

  try {
    var stats = options.statSync(p);
  } catch (er3) {
    if (er3.code === "ENOENT") return;else throw er;
  }

  if (stats.isDirectory()) _rimrafrimrafjs252_rmdirSync(p, options, er);else options.unlinkSync(p);
}

function _rimrafrimrafjs252_rmdir(p, options, originalEr, cb) {
  _rimrafrimrafjs252_assert(p);
  _rimrafrimrafjs252_assert(options);
  if (originalEr) _rimrafrimrafjs252_assert(originalEr instanceof Error);
  _rimrafrimrafjs252_assert(typeof cb === 'function');

  // try to rmdir first, and only readdir on ENOTEMPTY or EEXIST (SunOS)
  // if we guessed wrong, and it's not a directory, then
  // raise the original error.
  options.rmdir(p, function (er) {
    if (er && (er.code === "ENOTEMPTY" || er.code === "EEXIST" || er.code === "EPERM")) _rimrafrimrafjs252_rmkids(p, options, cb);else if (er && er.code === "ENOTDIR") cb(originalEr);else cb(er);
  });
}

function _rimrafrimrafjs252_rmkids(p, options, cb) {
  _rimrafrimrafjs252_assert(p);
  _rimrafrimrafjs252_assert(options);
  _rimrafrimrafjs252_assert(typeof cb === 'function');

  options.readdir(p, function (er, files) {
    if (er) return cb(er);
    var n = files.length;
    if (n === 0) return options.rmdir(p, cb);
    var errState;
    files.forEach(function (f) {
      _rimrafrimrafjs252_rimraf(_rimrafrimrafjs252_path.join(p, f), options, function (er) {
        if (errState) return;
        if (er) return cb(errState = er);
        if (--n === 0) options.rmdir(p, cb);
      });
    });
  });
}

// this looks simpler, and is strictly *faster*, but will
// tie up the JavaScript thread and fail on excessively
// deep directory trees.
function _rimrafrimrafjs252_rimrafSync(p, options) {
  options = options || {};
  _rimrafrimrafjs252_defaults(options);

  _rimrafrimrafjs252_assert(p, 'rimraf: missing path');
  _rimrafrimrafjs252_assert.equal(typeof p, 'string', 'rimraf: path should be a string');
  _rimrafrimrafjs252_assert(options, 'rimraf: missing options');
  _rimrafrimrafjs252_assert.equal(typeof options, 'object', 'rimraf: options should be object');

  var results;

  if (options.disableGlob || !_rimrafrimrafjs252_glob.hasMagic(p)) {
    results = [p];
  } else {
    try {
      _rimrafrimrafjs252_fs.lstatSync(p);
      results = [p];
    } catch (er) {
      results = _rimrafrimrafjs252_glob.sync(p, options.glob);
    }
  }

  if (!results.length) return;

  for (var i = 0; i < results.length; i++) {
    var p = results[i];

    try {
      var st = options.lstatSync(p);
    } catch (er) {
      if (er.code === "ENOENT") return;
    }

    try {
      // sunos lets the root user unlink directories, which is... weird.
      if (st && st.isDirectory()) _rimrafrimrafjs252_rmdirSync(p, options, null);else options.unlinkSync(p);
    } catch (er) {
      if (er.code === "ENOENT") return;
      if (er.code === "EPERM") return _rimrafrimrafjs252_isWindows ? _rimrafrimrafjs252_fixWinEPERMSync(p, options, er) : _rimrafrimrafjs252_rmdirSync(p, options, er);
      if (er.code !== "EISDIR") throw er;
      _rimrafrimrafjs252_rmdirSync(p, options, er);
    }
  }
}

function _rimrafrimrafjs252_rmdirSync(p, options, originalEr) {
  _rimrafrimrafjs252_assert(p);
  _rimrafrimrafjs252_assert(options);
  if (originalEr) _rimrafrimrafjs252_assert(originalEr instanceof Error);

  try {
    options.rmdirSync(p);
  } catch (er) {
    if (er.code === "ENOENT") return;
    if (er.code === "ENOTDIR") throw originalEr;
    if (er.code === "ENOTEMPTY" || er.code === "EEXIST" || er.code === "EPERM") _rimrafrimrafjs252_rmkidsSync(p, options);
  }
}

function _rimrafrimrafjs252_rmkidsSync(p, options) {
  _rimrafrimrafjs252_assert(p);
  _rimrafrimrafjs252_assert(options);
  options.readdirSync(p).forEach(function (f) {
    _rimrafrimrafjs252_rimrafSync(_rimrafrimrafjs252_path.join(p, f), options);
  });
  options.rmdirSync(p, options);
}

/*== node_modules/recur-fs/lib/rm.js ==*/
$m['recur-fs/lib/rm.js#2.2.3'] = {};
var _recurfslibrmjs223_fs = require('fs'),
    _recurfslibrmjs223_rimraf = $m['rimraf/rimraf.js#2.5.2'];

/**
 * Recursive remove file or directory
 * Makes sure only project sources are removed
 * @param {String} source
 * @param {Function} fn(err)
 */
$m['recur-fs/lib/rm.js#2.2.3'] = function rm(source, fn) {
	if (_recurfslibrmjs223_fs.existsSync(source)) {
		if (~source.indexOf(process.cwd())) {
			_recurfslibrmjs223_rimraf(source, function (err) {
				if (err) return fn(err);else return fn();
			});
		} else {
			fn(new Error('cannot rm source outside of project path: ' + source));
		}
	} else {
		fn(new Error('cannot rm non-existant source: ' + source));
	}
};

/**
 * Synchronously recursive remove file or directory
 * Makes sure only project sources are removed
 * @param {String} source
 */
$m['recur-fs/lib/rm.js#2.2.3'].sync = function rmSync(source) {
	if (_recurfslibrmjs223_fs.existsSync(source)) {
		if (~source.indexOf(process.cwd())) {
			_recurfslibrmjs223_rimraf.sync(source);
		} else {
			throw new Error('cannot rm source outside of project path: ' + source);
		}
	} else {
		throw new Error('cannot rm non-existant source: ' + source);
	}
};

/*== node_modules/recur-fs/lib/readdir.js ==*/
$m['recur-fs/lib/readdir.js#2.2.3'] = {};
var _recurfslibreaddirjs223_fs = require('fs'),
    _recurfslibreaddirjs223_path = require('path');

/**
 * Read the contents of 'directory', returning all resources.
 * 'visitor' is optional function called on each resource,
 * and resource is skipped if next() returns "false"
 * @param {String} dir
 * @param {Function} [visitor(resource, stat, next)]
 * @param {Function} fn(err, resources)
 */
$m['recur-fs/lib/readdir.js#2.2.3'] = function readdir(directory, visitor, fn) {
	if (arguments.length == 2) {
		fn = visitor;
		// Noop
		visitor = function (resource, stat, next) {
			next();
		};
	}

	var resources = [],
	    outstanding = 0,
	    done = function () {
		if (! --outstanding) fn(null, resources);
	};

	function visit(dir) {
		outstanding++;

		_recurfslibreaddirjs223_fs.readdir(dir, function (err, files) {
			if (err) {
				// Skip if not found, otherwise exit
				if (err.code === 'ENOENT') return done();
				return fn(err);
			}

			// Include dir
			outstanding += files.length - 1;

			files.forEach(function (file) {
				file = _recurfslibreaddirjs223_path.join(dir, file);
				_recurfslibreaddirjs223_fs.stat(file, function (err, stat) {
					if (err) {
						// Skip if not found, otherwise exit
						if (err.code === 'ENOENT') return done();
						return fn(err);
					}

					visitor(file, stat, function next(include) {
						// Store
						if (include !== false) resources.push(file);
						// Recurse child directory
						if (stat.isDirectory()) visit(file);
						done();
					});
				});
			});
		});
	}

	visit(directory);
};

/**
 * Synchronously read the contents of 'directory', returning all resources.
 * 'visitor' is optional function called on each resource,
 * and resource is skipped if visitor returns "false"
 * @param {String} dir
 * @param {Function} [visitor(resource, stat)]
 * @returns {Array}
 */
$m['recur-fs/lib/readdir.js#2.2.3'].sync = function readdirSync(directory, visitor) {
	visitor = visitor || function (resource, stat, next) {};

	var resources = [];

	function visit(dir) {
		if (_recurfslibreaddirjs223_fs.existsSync(dir)) {
			_recurfslibreaddirjs223_fs.readdirSync(dir).forEach(function (file) {
				file = _recurfslibreaddirjs223_path.resolve(dir, file);
				try {
					var stat = _recurfslibreaddirjs223_fs.statSync(file);
				} catch (err) {
					// Skip if file not found, otherwise throw
					if (err.code === 'ENOENT') {
						return;
					} else {
						throw err;
					}
				}

				// Store
				var include = visitor(file, stat);
				if (include !== false) resources.push(file);

				// Recurse child directory
				if (stat.isDirectory()) visit(file);
			});
		}
	}

	visit(directory);

	return resources;
};

/*== node_modules/mkdirp/index.js ==*/
$m['mkdirp/index.js#0.5.1'] = {};
var _mkdirpindexjs051_path = require('path');
var _mkdirpindexjs051_fs = require('fs');
var _mkdirpindexjs051__0777 = parseInt('0777', 8);

$m['mkdirp/index.js#0.5.1'] = _mkdirpindexjs051_mkdirP.mkdirp = _mkdirpindexjs051_mkdirP.mkdirP = _mkdirpindexjs051_mkdirP;

function _mkdirpindexjs051_mkdirP(p, opts, f, made) {
    if (typeof opts === 'function') {
        f = opts;
        opts = {};
    } else if (!opts || typeof opts !== 'object') {
        opts = { mode: opts };
    }

    var mode = opts.mode;
    var xfs = opts.fs || _mkdirpindexjs051_fs;

    if (mode === undefined) {
        mode = _mkdirpindexjs051__0777 & ~process.umask();
    }
    if (!made) made = null;

    var cb = f || function () {};
    p = _mkdirpindexjs051_path.resolve(p);

    xfs.mkdir(p, mode, function (er) {
        if (!er) {
            made = made || p;
            return cb(null, made);
        }
        switch (er.code) {
            case 'ENOENT':
                _mkdirpindexjs051_mkdirP(_mkdirpindexjs051_path.dirname(p), opts, function (er, made) {
                    if (er) cb(er, made);else _mkdirpindexjs051_mkdirP(p, opts, cb, made);
                });
                break;

            // In the case of any other error, just see if there's a dir
            // there already.  If so, then hooray!  If not, then something
            // is borked.
            default:
                xfs.stat(p, function (er2, stat) {
                    // if the stat fails, then that's super weird.
                    // let the original error be the failure reason.
                    if (er2 || !stat.isDirectory()) cb(er, made);else cb(null, made);
                });
                break;
        }
    });
}

_mkdirpindexjs051_mkdirP.sync = function sync(p, opts, made) {
    if (!opts || typeof opts !== 'object') {
        opts = { mode: opts };
    }

    var mode = opts.mode;
    var xfs = opts.fs || _mkdirpindexjs051_fs;

    if (mode === undefined) {
        mode = _mkdirpindexjs051__0777 & ~process.umask();
    }
    if (!made) made = null;

    p = _mkdirpindexjs051_path.resolve(p);

    try {
        xfs.mkdirSync(p, mode);
        made = made || p;
    } catch (err0) {
        switch (err0.code) {
            case 'ENOENT':
                made = sync(_mkdirpindexjs051_path.dirname(p), opts, made);
                sync(p, opts, made);
                break;

            // In the case of any other error, just see if there's a dir
            // there already.  If so, then hooray!  If not, then something
            // is borked.
            default:
                var stat;
                try {
                    stat = xfs.statSync(p);
                } catch (err1) {
                    throw err0;
                }
                if (!stat.isDirectory()) throw err0;
                break;
        }
    }

    return made;
};

/*== node_modules/recur-fs/lib/mkdir.js ==*/
$m['recur-fs/lib/mkdir.js#2.2.3'] = {};
var _recurfslibmkdirjs223_fs = require('fs'),
    _recurfslibmkdirjs223_mkdirp = $m['mkdirp/index.js#0.5.1'],
    _recurfslibmkdirjs223_path = require('path');

/**
 * Recursively create 'directory'
 * @param {String} directory
 * @param {Function} fn(err)
 */
$m['recur-fs/lib/mkdir.js#2.2.3'] = function mkdir(directory, fn) {
	// Resolve directory name if passed a file
	directory = _recurfslibmkdirjs223_path.extname(directory) ? _recurfslibmkdirjs223_path.dirname(directory) : directory;

	if (!_recurfslibmkdirjs223_fs.existsSync(directory)) {
		_recurfslibmkdirjs223_mkdirp(directory, function (err) {
			if (err) return fn(err);
			return fn();
		});
	} else {
		return fn();
	}
};

/**
 * Synchronously create 'directory'
 * @param {String} directory
 */
$m['recur-fs/lib/mkdir.js#2.2.3'].sync = function mkdirSync(directory) {
	// Resolve directory name if passed a file
	directory = _recurfslibmkdirjs223_path.extname(directory) ? _recurfslibmkdirjs223_path.dirname(directory) : directory;

	if (!_recurfslibmkdirjs223_fs.existsSync(directory)) {
		_recurfslibmkdirjs223_mkdirp.sync(directory);
	}
};

/*== node_modules/recur-fs/lib/mv.js ==*/
$m['recur-fs/lib/mv.js#2.2.3'] = {};
var _recurfslibmvjs223_fs = require('fs'),
    _recurfslibmvjs223_mkdir = $m['recur-fs/lib/mkdir.js#2.2.3'],
    _recurfslibmvjs223_path = require('path'),
    _recurfslibmvjs223_rm = $m['recur-fs/lib/rm.js#2.2.3'];

/**
 * Move file or directory 'source' to 'destination'
 * @param {String} source
 * @param {String} destination
 * @param {Boolean} force
 * @param {Function} fn(err, filepath)
 */
$m['recur-fs/lib/mv.js#2.2.3'] = function mv(source, destination, force, fn) {
	if (force == null) force = false;

	_recurfslibmvjs223_mkdir(destination, function (err) {
		if (err) {
			return fn(err);
		} else {
			var filepath = _recurfslibmvjs223_path.resolve(destination, _recurfslibmvjs223_path.basename(source));

			if (!force && _recurfslibmvjs223_fs.existsSync(filepath)) {
				return fn(null, filepath);
			} else {
				_recurfslibmvjs223_rm(filepath, function (err) {
					// Ignore rm errors
					_recurfslibmvjs223_fs.rename(source, filepath, function (err) {
						if (err) return fn(err);
						return fn(null, filepath);
					});
				});
			}
		}
	});
};

/**
 * Synchronously move file or directory 'source' to 'destination'
 * @param {String} source
 * @param {String} destination
 * @param {Boolean} force
 * @returns {String}
 */
$m['recur-fs/lib/mv.js#2.2.3'].sync = function mvSync(source, destination, force) {
	if (force == null) force = false;

	if (!_recurfslibmvjs223_fs.existsSync(destination)) _recurfslibmvjs223_mkdir.sync(destination);

	var filepath = _recurfslibmvjs223_path.resolve(destination, _recurfslibmvjs223_path.basename(source));

	if (_recurfslibmvjs223_fs.existsSync(filepath)) {
		if (!force) return filepath;
		_recurfslibmvjs223_rm.sync(filepath);
	}
	_recurfslibmvjs223_fs.renameSync(source, filepath);

	return filepath;
};

/*== node_modules/recur-fs/lib/indir.js ==*/
$m['recur-fs/lib/indir.js#2.2.3'] = {};
var _recurfslibindirjs223_path = require('path');

/**
 * Check that a 'filepath' is likely a child of a given directory
 * Applies to nested directories
 * Only makes String comparison. Does not check for existance
 * @param {String} directory
 * @param {String} filepath
 * @returns {Boolean}
 */
$m['recur-fs/lib/indir.js#2.2.3'] = function indir(directory, filepath) {
	if (directory && filepath) {
		directory = _recurfslibindirjs223_path.resolve(directory);
		filepath = _recurfslibindirjs223_path.resolve(filepath);

		if (~filepath.indexOf(directory)) {
			return !~_recurfslibindirjs223_path.relative(directory, filepath).indexOf('..');
		}
	}

	return false;
};

/*== node_modules/recur-fs/lib/cp.js ==*/
$m['recur-fs/lib/cp.js#2.2.3'] = {};
var _recurfslibcpjs223_fs = require('fs'),
    _recurfslibcpjs223_mkdir = $m['recur-fs/lib/mkdir.js#2.2.3'],
    _recurfslibcpjs223_path = require('path'),
    _recurfslibcpjs223_rm = $m['recur-fs/lib/rm.js#2.2.3'];

/**
 * Copy file or directory 'source' to 'destination'
 * Copies contents of 'source' if directory and ends in trailing '/'
 * @param {String} source
 * @param {String} destination
 * @param {Boolean} force
 * @param {Function} fn(err, filepath)
 */
$m['recur-fs/lib/cp.js#2.2.3'] = function cp(source, destination, force, fn) {
	var filepath = '',
	    first = true,
	    outstanding = 0;

	if (force == null) force = false;

	function copy(source, destination) {
		outstanding++;
		_recurfslibcpjs223_fs.stat(source, function (err, stat) {
			var isDestFile;
			outstanding--;
			// Exit if proper error, otherwise skip
			if (err) {
				if (err.code === 'ENOENT') return;
				return fn(err);
			} else {
				isDestFile = _recurfslibcpjs223_path.extname(destination).length;
				// File
				if (stat.isFile()) {
					// Handle file or directory as destination
					var destDir = isDestFile ? _recurfslibcpjs223_path.dirname(destination) : destination,
					    destName = isDestFile ? _recurfslibcpjs223_path.basename(destination) : _recurfslibcpjs223_path.basename(source),
					    filepath = _recurfslibcpjs223_path.resolve(destDir, destName);
					// Write file if it doesn't already exist
					if (!force && _recurfslibcpjs223_fs.existsSync(filepath)) {
						if (!outstanding) return fn(null, filepath);
					} else {
						_recurfslibcpjs223_rm(filepath, function (err) {
							// Ignore rm errors
							var file;
							outstanding++;
							// Return the new path for the first source
							if (first) {
								filepath = filepath;
								first = false;
							}
							// Pipe stream
							_recurfslibcpjs223_fs.createReadStream(source).pipe(file = _recurfslibcpjs223_fs.createWriteStream(filepath));
							file.on('error', function (err) {
								return fn(err);
							});
							file.on('close', function () {
								outstanding--;
								// Return if no outstanding
								if (!outstanding) return fn(null, filepath);
							});
						});
					}
					// Directory
				} else {
					// Guard against invalid directory to file copy
					if (isDestFile) {
						fn(new Error('invalid destination for copy: ' + destination));
					} else {
						// Copy contents only if source ends in '/'
						var contentsOnly = first && /\\$|\/$/.test(source),
						    dest = contentsOnly ? destination : _recurfslibcpjs223_path.resolve(destination, _recurfslibcpjs223_path.basename(source));

						// Create in destination
						outstanding++;
						_recurfslibcpjs223_mkdir(dest, function (err) {
							outstanding--;
							if (err) {
								return fn(err);
							} else {
								// Loop through contents
								outstanding++;
								_recurfslibcpjs223_fs.readdir(source, function (err, files) {
									outstanding--;
									// Exit if proper error, otherwise skip
									if (err) {
										if (err.code === 'ENOENT') return;else return fn(err);
									} else {
										// Return the new path for the first source
										if (first) {
											filepath = dest;
											first = false;
										}
										// Loop through files and cp
										files.forEach(function (file) {
											copy(_recurfslibcpjs223_path.resolve(source, file), dest);
										});
										// Return if no outstanding
										if (!outstanding) return fn(null, filepath);
									}
								});
							}
						});
					}
				}
			}
		});
		// Return if no outstanding
		if (!outstanding) return fn(null, filepath);
	};

	return copy(source, destination);
};

/**
 * Synchronously copy file or directory 'source' to 'destination'
 * Copies contents of 'source' if directory and ends in trailing '/'
 * @param {String} source
 * @param {String} destination
 * @param {Boolean} force
 * @returns {String}
 */
$m['recur-fs/lib/cp.js#2.2.3'].sync = function cpSync(source, destination, force) {
	var filepath = '',
	    first = true;

	if (force == null) force = false;

	function copy(source, destination) {
		if (_recurfslibcpjs223_fs.existsSync(source)) {
			var stat = _recurfslibcpjs223_fs.statSync(source),
			    isDestFile = _recurfslibcpjs223_path.extname(destination).length;

			// File
			if (stat.isFile()) {
				// Handle file or directory as destination
				var destDir = isDestFile ? _recurfslibcpjs223_path.dirname(destination) : destination,
				    destName = isDestFile ? _recurfslibcpjs223_path.basename(destination) : _recurfslibcpjs223_path.basename(source),
				    filepath = _recurfslibcpjs223_path.resolve(destDir, destName);

				// Return the new path for the first source
				if (first) {
					filepath = filepath;
					first = false;
				}
				// Write file only if it doesn't already exist
				if (_recurfslibcpjs223_fs.existsSync(filepath)) {
					if (!force) return filepath;
					_recurfslibcpjs223_rm.sync(filepath);
				}
				_recurfslibcpjs223_fs.writeFileSync(filepath, _recurfslibcpjs223_fs.readFileSync(source));

				// Directory
			} else {
				// Guard against invalid directory to file copy
				if (isDestFile) throw new Error('invalid destination for copy: ' + destination);
				// Copy contents only if source ends in '/'
				var contentsOnly = first && /\\$|\/$/.test(source),
				    dest = contentsOnly ? destination : _recurfslibcpjs223_path.resolve(destination, _recurfslibcpjs223_path.basename(source));

				// Return the new path for the first source
				if (first) {
					filepath = dest;
					first = false;
				}
				// Create in destination
				_recurfslibcpjs223_mkdir.sync(dest);
				// Loop through files and copy
				var files = _recurfslibcpjs223_fs.readdirSync(source);
				files.forEach(function (file) {
					copy(_recurfslibcpjs223_path.resolve(source, file), dest);
				});
			}
		}
		return filepath;
	};

	return copy(source, destination);
};

/*== node_modules/recur-fs/index.js ==*/
$m['recur-fs/index.js#2.2.3'] = {};
$m['recur-fs/index.js#2.2.3'].cp = $m['recur-fs/lib/cp.js#2.2.3'];
$m['recur-fs/index.js#2.2.3'].indir = $m['recur-fs/lib/indir.js#2.2.3'];
$m['recur-fs/index.js#2.2.3'].mkdir = $m['recur-fs/lib/mkdir.js#2.2.3'];
$m['recur-fs/index.js#2.2.3'].mv = $m['recur-fs/lib/mv.js#2.2.3'];
$m['recur-fs/index.js#2.2.3'].readdir = $m['recur-fs/lib/readdir.js#2.2.3'];
$m['recur-fs/index.js#2.2.3'].rm = $m['recur-fs/lib/rm.js#2.2.3'];
$m['recur-fs/index.js#2.2.3'].walk = $m['recur-fs/lib/walk.js#2.2.3'];
$m['recur-fs/index.js#2.2.3'].hunt = $m['recur-fs/lib/hunt.js#2.2.3'];

/*== lib/identify-resource/utils.js ==*/
$m['lib/identify-resource/utils.js'] = {};
'use strict';

const _libidentifyresourceutilsjs_fs = require('fs');
const _libidentifyresourceutilsjs_path = require('path');

/**
 * Determine if 'filepath' is relative
 * @param {String} filepath
 * @returns {Boolean}
 */
$m['lib/identify-resource/utils.js'].isRelativeFilepath = function (filepath) {
  return 'string' == typeof filepath && filepath.charAt(0) == '.';
};

/**
 * Determine if 'filepath' is absolute
 * @param {String} filepath
 * @returns {Boolean}
 */
$m['lib/identify-resource/utils.js'].isAbsoluteFilepath = function (filepath) {
  return 'string' == typeof filepath && _libidentifyresourceutilsjs_path.resolve(filepath) == filepath;
};

/**
 * Determine if 'str' is a filepath or package reference
 * @param {String} str
 * @returns {Boolean}
 */
$m['lib/identify-resource/utils.js'].isFilepath = function (str) {
  return $m['lib/identify-resource/utils.js'].isAbsoluteFilepath(str) || $m['lib/identify-resource/utils.js'].isRelativeFilepath(str);
};

/**
 * Determine file type for 'filepath'
 * @param {String} filepath
 * @param {Object} fileExtensions
 * @returns {String}
 */
$m['lib/identify-resource/utils.js'].deriveType = function (filepath, fileExtensions) {
  const ext = _libidentifyresourceutilsjs_path.extname(filepath).slice(1);

  // Match input extension to type
  for (const type in fileExtensions) {
    const exts = fileExtensions[type];

    for (let i = 0, n = exts.length; i < n; i++) {
      if (ext == exts[i]) return type;
    }
  }
};

/**
 * Check the location of 'filepath'
 * @param {String} filepath
 * @param {String} type
 * @param {Array} fileExtensions
 * @returns {String}
 */
$m['lib/identify-resource/utils.js'].findFile = function (filepath, type, fileExtensions) {
  if ('string' == typeof filepath) {
    // Already have full filepath
    if (_libidentifyresourceutilsjs_path.extname(filepath)) {
      try {
        if (_libidentifyresourceutilsjs_fs.statSync(filepath).isFile()) return filepath;
      } catch (err) {/* File doesn't exist */}
    }

    let ext, fp;

    // Loop through fileExtensions and locate file
    for (let i = 0, n = fileExtensions[type].length; i < n; i++) {
      ext = fileExtensions[type][i];
      // Add extension
      fp = filepath + '.' + ext;
      if (_libidentifyresourceutilsjs_fs.existsSync(fp)) return fp;
      // Try 'index' + extension
      fp = _libidentifyresourceutilsjs_path.resolve(filepath, 'index.' + ext);
      if (_libidentifyresourceutilsjs_fs.existsSync(fp)) return fp;
    }

    return '';
  }

  return filepath;
};

/*== lib/identify-resource/package.js ==*/
$m['lib/identify-resource/package.js'] = {};
'use strict';

const { isRelativeFilepath: _libidentifyresourcepackagejs_isRelativeFilepath } = $m['lib/identify-resource/utils.js'];
const { VERSION_DELIMITER: _libidentifyresourcepackagejs_VERSION_DELIMITER } = $m['lib/identify-resource/config.js'];
const _libidentifyresourcepackagejs_cache = $m['lib/identify-resource/cache.js'];
const _libidentifyresourcepackagejs_fs = require('fs');
const _libidentifyresourcepackagejs_path = require('path');

const _libidentifyresourcepackagejs_RE_TRAILING = /\/+$|\\+$/g;

$m['lib/identify-resource/package.js'] = {
  resolveId: _libidentifyresourcepackagejs_resolveId,
  resolveName: _libidentifyresourcepackagejs_resolveName,
  resolvePath: _libidentifyresourcepackagejs_resolvePath,

  /**
   * Retrieve package details for 'filepath'
   * @param {String} filepath
   * @param {Object} options
   * @returns {Object}
   */
  getDetails(filepath, options) {
    options = options || {};

    const pkgpath = _libidentifyresourcepackagejs_resolvePath(filepath);
    const pkgname = _libidentifyresourcepackagejs_resolveName(pkgpath);
    const manifestpath = _libidentifyresourcepackagejs_path.resolve(pkgpath, 'package.json');
    let details, existingPkg, json;

    if (!_libidentifyresourcepackagejs_fs.existsSync(pkgpath)) return;

    // Pull from cache
    if (details = _libidentifyresourcepackagejs_cache.getPackage(pkgpath)) return details;

    details = {
      aliases: {},
      dirname: _libidentifyresourcepackagejs_path.dirname(pkgpath),
      id: '',
      isRoot: pkgpath == process.cwd(),
      manifestpath: '',
      main: '',
      name: pkgname,
      paths: [pkgpath],
      pkgpath: pkgpath,
      version: ''
    };

    // Parse manifest
    if (_libidentifyresourcepackagejs_fs.existsSync(manifestpath)) {
      try {
        json = require(manifestpath);
      } catch (err) {/* no file */}

      if (json) {
        details.manifestpath = manifestpath;
        details.name = json.name || pkgname;
        details.version = json.version;
        if (json.main) {
          details.main = _libidentifyresourcepackagejs_path.resolve(pkgpath, json.main);
        } else {
          const fp = _libidentifyresourcepackagejs_path.join(pkgpath, 'index.js');

          if (_libidentifyresourcepackagejs_fs.existsSync(fp)) details.main = fp;
        }
        // Resolve json.browser aliasing
        if (json.browser) {
          if ('string' == typeof json.browser) {
            details.main = _libidentifyresourcepackagejs_path.resolve(pkgpath, json.browser);
          } else {
            for (const key in json.browser) {
              const value = json.browser[key];
              let rKey = _libidentifyresourcepackagejs_path.resolve(pkgpath, key);
              let rValue;

              // Fix for missing relative path prefix
              if (!_libidentifyresourcepackagejs_isRelativeFilepath(key) && !_libidentifyresourcepackagejs_fs.existsSync(rKey)) rKey = key;
              if ('string' == typeof value) {
                rValue = _libidentifyresourcepackagejs_path.resolve(pkgpath, value);
                if (!_libidentifyresourcepackagejs_isRelativeFilepath(value) && !_libidentifyresourcepackagejs_fs.existsSync(rValue)) rValue = value;
              } else {
                rValue = value;
              }

              details.aliases[key] = value;
              // Resolve relative
              if (key != rKey || value != rValue) details.aliases[rKey] = rValue;
              // Handle 'main' aliasing
              if (details.main == rKey) details.main = rValue;
            }
          }
        }
        // Store main as alias
        if (details.main) details.aliases[pkgpath] = details.main;
      }
    }

    // Set id
    // Ignore version if root package
    details.id = details.name + (!details.isRoot && details.version ? _libidentifyresourcepackagejs_VERSION_DELIMITER + details.version : '');

    // Retrieve existing pkg with same id
    if (existingPkg = _libidentifyresourcepackagejs_cache.getPackage(details.id)) return existingPkg;

    // Handle scoped
    if (_libidentifyresourcepackagejs_path.basename(details.dirname).indexOf('@') == 0) details.dirname = _libidentifyresourcepackagejs_path.dirname(details.dirname);

    // Parse reachable paths
    details.paths = _libidentifyresourcepackagejs_parseNodeModules(pkgpath);
    if (pkgpath == process.cwd()) details.paths = details.paths.concat(options.sources);

    // Cache
    _libidentifyresourcepackagejs_cache.setPackage(details);

    return details;
  }
};

/**
 * Resolve package path from 'filepath'
 * @param {String} filepath
 * @returns {String}
 */
function _libidentifyresourcepackagejs_resolvePath(filepath) {
  filepath = filepath.replace(_libidentifyresourcepackagejs_RE_TRAILING, '');

  const cwd = process.cwd();

  if (~filepath.indexOf('node_modules')) {
    const parts = filepath.split(_libidentifyresourcepackagejs_path.sep);
    let idx = parts.lastIndexOf('node_modules');

    if (idx < parts.length - 1) idx += 2;
    // Handle scoped
    if (parts[idx - 1].charAt(0) == '@') idx++;

    return parts.slice(0, idx).join(_libidentifyresourcepackagejs_path.sep);
  } else if (~filepath.indexOf(cwd)) {
    return cwd;
  }

  // TODO: handle files from outside project path?
  return filepath;
}

/**
 * Resolve package name from 'pkgpath'
 * @param {String} pkgpath
 * @returns {String}
 */
function _libidentifyresourcepackagejs_resolveName(pkgpath) {
  pkgpath = pkgpath.replace(_libidentifyresourcepackagejs_RE_TRAILING, '');

  const parts = pkgpath.split(_libidentifyresourcepackagejs_path.sep);
  const len = parts.length;
  // Handle scoped
  const idx = parts[len - 2].charAt(0) == '@' ? 2 : 1;

  return parts.slice(len - idx).join(_libidentifyresourcepackagejs_path.sep);
}

/**
 * Resolve id for 'filepath'
 * @param {Object} details
 * @param {String} filepath
 * @returns {String}
 */
function _libidentifyresourcepackagejs_resolveId(details, filepath) {
  let name = '';

  if ('string' == typeof filepath) {
    if (details.isRoot && filepath == details.main) return details.id;

    const version = !details.isRoot && details.version ? _libidentifyresourcepackagejs_VERSION_DELIMITER + details.version : '';

    for (let i = details.paths.length - 1; i >= 0; i--) {
      if (~filepath.indexOf(details.paths[i])) {
        name = _libidentifyresourcepackagejs_path.relative(details.paths[i], filepath);
        break;
      }
    }

    name = (process.platform == 'win32' ? name.replace(/\\/g, '/') : name) + version;
  }

  return name;
}

/**
 * Gather all node_modules directories reachable from 'pkgpath'
 * @param {String} pkgpath
 * @returns {Array}
 */
function _libidentifyresourcepackagejs_parseNodeModules(pkgpath) {
  const root = _libidentifyresourcepackagejs_path.dirname(process.cwd());
  let dir = pkgpath;
  let dirs = [];
  let parent, nodeModulespath;

  while (true) {
    parent = _libidentifyresourcepackagejs_path.dirname(dir);
    // Stop if we are out of project directory or file system root
    // Convert to lowercase to fix problems on Windows
    if (dir.toLowerCase() === root.toLowerCase() || parent.toLowerCase() === dir.toLowerCase()) {
      break;
    }

    nodeModulespath = _libidentifyresourcepackagejs_path.resolve(dir, 'node_modules');
    if (_libidentifyresourcepackagejs_fs.existsSync(nodeModulespath)) dirs.push(nodeModulespath);

    // Walk
    dir = parent;
  }

  dirs.push(pkgpath);

  return dirs.reverse();
}

/*== lib/identify-resource/resolve.js ==*/
$m['lib/identify-resource/resolve.js'] = {};
'use strict';

const { deriveType: _libidentifyresourceresolvejs_deriveType, isAbsoluteFilepath: _libidentifyresourceresolvejs_isAbsoluteFilepath, isRelativeFilepath: _libidentifyresourceresolvejs_isRelativeFilepath, findFile: _libidentifyresourceresolvejs_findFile } = $m['lib/identify-resource/utils.js'];
const _libidentifyresourceresolvejs_cache = $m['lib/identify-resource/cache.js'];
const _libidentifyresourceresolvejs_config = $m['lib/identify-resource/config.js'];
const _libidentifyresourceresolvejs_fs = require('fs');
const _libidentifyresourceresolvejs_pkg = $m['lib/identify-resource/package.js'];
const _libidentifyresourceresolvejs_path = require('path');

/**
 * Resolve the path for 'id' from 'sourcepath'
 * @param {String} sourcepath
 * @param {String} id
 * @param {Object} [options]
 * @returns {String|Boolean}
 */
$m['lib/identify-resource/resolve.js'] = function resolve(sourcepath, id, options) {
  if (!_libidentifyresourceresolvejs_fs.existsSync(sourcepath)) return '';

  options = _libidentifyresourceresolvejs_config(options);

  const type = _libidentifyresourceresolvejs_deriveType(sourcepath, options.fileExtensions);
  const sourcedir = _libidentifyresourceresolvejs_path.dirname(sourcepath);
  let filepath = '';

  // Implied relative path for css/html
  if (type != 'js' && !_libidentifyresourceresolvejs_isRelativeFilepath(id)) {
    filepath = _libidentifyresourceresolvejs_find(`./${ id }`, type, sourcedir, options);
  }

  if (filepath === '') filepath = _libidentifyresourceresolvejs_find(id, type, sourcedir, options);

  return filepath;
};

/**
 * Find filepath for 'id' in 'sourcedir' directory
 * @param {String} id
 * @param {String} type
 * @param {String} sourcedir
 * @param {Object} options
 *  - {Object} fileExtensions
 *  - {Array} nativeModules
 *  - {Array} sources
 * @returns {String|Boolean}
 */
function _libidentifyresourceresolvejs_find(id, type, sourcedir, options) {
  const details = _libidentifyresourceresolvejs_pkg.getDetails(sourcedir, options);
  let filepath;

  // Resolve relative paths,
  if (_libidentifyresourceresolvejs_isRelativeFilepath(id)) id = _libidentifyresourceresolvejs_path.resolve(sourcedir, id);

  // Redirect if cached version
  if (details && !~sourcedir.indexOf(details.pkgpath)) {
    // Replace source path root with details root
    id = _libidentifyresourceresolvejs_path.resolve(details.dirname, _libidentifyresourceresolvejs_path.relative(_libidentifyresourceresolvejs_path.dirname(_libidentifyresourceresolvejs_pkg.resolvePath(sourcedir)), sourcedir));
  }

  // Handle aliases
  // console.log(details.aliases, id)
  if (details && id in details.aliases) id = details.aliases[id];
  // Handle root package shortcut id
  if (details && details.isRoot && details.id == id) return details.main;
  // Handle disabled or native modules
  if (id === false || ~options.nativeModules.indexOf(id)) return false;

  if (_libidentifyresourceresolvejs_isAbsoluteFilepath(id)) {
    filepath = _libidentifyresourceresolvejs_findFile(id, type, options.fileExtensions);
    if (details && filepath in details.aliases) filepath = details.aliases[filepath];
    // File doesn't exist or is disabled
    if (filepath == '' || filepath === false) return filepath;
    // File found
    if (_libidentifyresourceresolvejs_isAbsoluteFilepath(filepath)) {
      // Cache
      _libidentifyresourceresolvejs_cache.setFile({
        path: filepath,
        id: _libidentifyresourceresolvejs_pkg.resolveId(details, filepath)
      });

      return filepath;
    }

    // Continue
    id = filepath;
  }

  // Search source paths for matches
  let fp;

  for (let i = details.paths.length - 1; i >= 0; i--) {
    const src = details.paths[i];

    if (id && sourcedir != src) {
      fp = _libidentifyresourceresolvejs_path.resolve(src, id);
      fp = _libidentifyresourceresolvejs_find(fp, type, fp, options);
      if (fp !== '') return fp;
    }
  }

  return '';
}

/*== lib/identify-resource/identify.js ==*/
$m['lib/identify-resource/identify.js'] = {};
'use strict';

const { isAbsoluteFilepath: _libidentifyresourceidentifyjs_isAbsoluteFilepath } = $m['lib/identify-resource/utils.js'];
const _libidentifyresourceidentifyjs_cache = $m['lib/identify-resource/cache.js'];
const _libidentifyresourceidentifyjs_config = $m['lib/identify-resource/config.js'];
const _libidentifyresourceidentifyjs_fs = require('fs');
const _libidentifyresourceidentifyjs_pkg = $m['lib/identify-resource/package.js'];

/**
 * Retrieve id for 'filepath'
 * @param {String} filepath
 * @param {Object} [options]
 * @returns {String}
 */
$m['lib/identify-resource/identify.js'] = function indentify(filepath, options) {
  options = _libidentifyresourceidentifyjs_config(options);

  let id = '';

  if (!_libidentifyresourceidentifyjs_fs.existsSync(filepath) || !_libidentifyresourceidentifyjs_isAbsoluteFilepath(filepath)) return id;

  // Return from cache
  if (id = _libidentifyresourceidentifyjs_cache.getFile(filepath)) return id;

  const pkgDetails = _libidentifyresourceidentifyjs_pkg.getDetails(filepath, options);

  // Handle aliases
  if (filepath in pkgDetails.aliases) {
    const fp = pkgDetails.aliases[filepath];

    // Only follow alias if not disabled
    if (fp !== false) filepath = fp;
  }

  if (id = _libidentifyresourceidentifyjs_pkg.resolveId(pkgDetails, filepath)) {
    if (process.platform == 'win32') id = id.replace(/\\/g, '/');
    // Cache
    _libidentifyresourceidentifyjs_cache.setFile({ path: filepath, id });
  }

  return id;
};

/*== lib/identify-resource/index.js ==*/
$m['lib/identify-resource/index.js'] = {};
'use strict';

const { clear: _libidentifyresourceindexjs_clear, hasMultipleVersions: _libidentifyresourceindexjs_hasMultipleVersions } = $m['lib/identify-resource/cache.js'];

$m['lib/identify-resource/index.js'].identify = $m['lib/identify-resource/identify.js'];
$m['lib/identify-resource/index.js'].resolve = $m['lib/identify-resource/resolve.js'];
$m['lib/identify-resource/index.js'].hasMultipleVersions = _libidentifyresourceindexjs_hasMultipleVersions;
$m['lib/identify-resource/index.js'].clearCache = _libidentifyresourceindexjs_clear;

/*== node_modules/async/dist/async.js ==*/
$m['async/dist/async.js#2.0.1'] = {};
(function(global,factory){typeof exports==='object'&&typeof module!=='undefined'?factory(exports):typeof define==='function'&&define.amd?define(['exports'],factory):factory(global.async=global.async||{});})(this,function(exports){'use strict';/**
     * A faster alternative to `Function#apply`, this function invokes `func`
     * with the `this` binding of `thisArg` and the arguments of `args`.
     *
     * @private
     * @param {Function} func The function to invoke.
     * @param {*} thisArg The `this` binding of `func`.
     * @param {Array} args The arguments to invoke `func` with.
     * @returns {*} Returns the result of `func`.
     */function apply(func,thisArg,args){var length=args.length;switch(length){case 0:return func.call(thisArg);case 1:return func.call(thisArg,args[0]);case 2:return func.call(thisArg,args[0],args[1]);case 3:return func.call(thisArg,args[0],args[1],args[2]);}return func.apply(thisArg,args);}/**
     * Checks if `value` is the
     * [language type](http://www.ecma-international.org/ecma-262/6.0/#sec-ecmascript-language-types)
     * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(_.noop);
     * // => true
     *
     * _.isObject(null);
     * // => false
     */function isObject(value){var type=typeof value;return!!value&&(type=='object'||type=='function');}var funcTag='[object Function]';var genTag='[object GeneratorFunction]';/** Used for built-in method references. */var objectProto=Object.prototype;/**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
     * of values.
     */var objectToString=objectProto.toString;/**
     * Checks if `value` is classified as a `Function` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified,
     *  else `false`.
     * @example
     *
     * _.isFunction(_);
     * // => true
     *
     * _.isFunction(/abc/);
     * // => false
     */function isFunction(value){// The use of `Object#toString` avoids issues with the `typeof` operator
// in Safari 8 which returns 'object' for typed array and weak map constructors,
// and PhantomJS 1.9 which returns 'function' for `NodeList` instances.
var tag=isObject(value)?objectToString.call(value):'';return tag==funcTag||tag==genTag;}/**
     * Checks if `value` is object-like. A value is object-like if it's not `null`
     * and has a `typeof` result of "object".
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
     * @example
     *
     * _.isObjectLike({});
     * // => true
     *
     * _.isObjectLike([1, 2, 3]);
     * // => true
     *
     * _.isObjectLike(_.noop);
     * // => false
     *
     * _.isObjectLike(null);
     * // => false
     */function isObjectLike(value){return!!value&&typeof value=='object';}/** `Object#toString` result references. */var symbolTag='[object Symbol]';/** Used for built-in method references. */var objectProto$1=Object.prototype;/**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
     * of values.
     */var objectToString$1=objectProto$1.toString;/**
     * Checks if `value` is classified as a `Symbol` primitive or object.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified,
     *  else `false`.
     * @example
     *
     * _.isSymbol(Symbol.iterator);
     * // => true
     *
     * _.isSymbol('abc');
     * // => false
     */function isSymbol(value){return typeof value=='symbol'||isObjectLike(value)&&objectToString$1.call(value)==symbolTag;}/** Used as references for various `Number` constants. */var NAN=0/0;/** Used to match leading and trailing whitespace. */var reTrim=/^\s+|\s+$/g;/** Used to detect bad signed hexadecimal string values. */var reIsBadHex=/^[-+]0x[0-9a-f]+$/i;/** Used to detect binary string values. */var reIsBinary=/^0b[01]+$/i;/** Used to detect octal string values. */var reIsOctal=/^0o[0-7]+$/i;/** Built-in method references without a dependency on `root`. */var freeParseInt=parseInt;/**
     * Converts `value` to a number.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to process.
     * @returns {number} Returns the number.
     * @example
     *
     * _.toNumber(3.2);
     * // => 3.2
     *
     * _.toNumber(Number.MIN_VALUE);
     * // => 5e-324
     *
     * _.toNumber(Infinity);
     * // => Infinity
     *
     * _.toNumber('3.2');
     * // => 3.2
     */function toNumber(value){if(typeof value=='number'){return value;}if(isSymbol(value)){return NAN;}if(isObject(value)){var other=isFunction(value.valueOf)?value.valueOf():value;value=isObject(other)?other+'':other;}if(typeof value!='string'){return value===0?value:+value;}value=value.replace(reTrim,'');var isBinary=reIsBinary.test(value);return isBinary||reIsOctal.test(value)?freeParseInt(value.slice(2),isBinary?2:8):reIsBadHex.test(value)?NAN:+value;}var INFINITY=1/0;var MAX_INTEGER=1.7976931348623157e+308;/**
     * Converts `value` to a finite number.
     *
     * @static
     * @memberOf _
     * @since 4.12.0
     * @category Lang
     * @param {*} value The value to convert.
     * @returns {number} Returns the converted number.
     * @example
     *
     * _.toFinite(3.2);
     * // => 3.2
     *
     * _.toFinite(Number.MIN_VALUE);
     * // => 5e-324
     *
     * _.toFinite(Infinity);
     * // => 1.7976931348623157e+308
     *
     * _.toFinite('3.2');
     * // => 3.2
     */function toFinite(value){if(!value){return value===0?value:0;}value=toNumber(value);if(value===INFINITY||value===-INFINITY){var sign=value<0?-1:1;return sign*MAX_INTEGER;}return value===value?value:0;}/**
     * Converts `value` to an integer.
     *
     * **Note:** This method is loosely based on
     * [`ToInteger`](http://www.ecma-international.org/ecma-262/6.0/#sec-tointeger).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to convert.
     * @returns {number} Returns the converted integer.
     * @example
     *
     * _.toInteger(3.2);
     * // => 3
     *
     * _.toInteger(Number.MIN_VALUE);
     * // => 0
     *
     * _.toInteger(Infinity);
     * // => 1.7976931348623157e+308
     *
     * _.toInteger('3.2');
     * // => 3
     */function toInteger(value){var result=toFinite(value),remainder=result%1;return result===result?remainder?result-remainder:result:0;}/** Used as the `TypeError` message for "Functions" methods. */var FUNC_ERROR_TEXT='Expected a function';/* Built-in method references for those with the same name as other `lodash` methods. */var nativeMax=Math.max;/**
     * Creates a function that invokes `func` with the `this` binding of the
     * created function and arguments from `start` and beyond provided as
     * an array.
     *
     * **Note:** This method is based on the
     * [rest parameter](https://mdn.io/rest_parameters).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Function
     * @param {Function} func The function to apply a rest parameter to.
     * @param {number} [start=func.length-1] The start position of the rest parameter.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var say = _.rest(function(what, names) {
     *   return what + ' ' + _.initial(names).join(', ') +
     *     (_.size(names) > 1 ? ', & ' : '') + _.last(names);
     * });
     *
     * say('hello', 'fred', 'barney', 'pebbles');
     * // => 'hello fred, barney, & pebbles'
     */function rest(func,start){if(typeof func!='function'){throw new TypeError(FUNC_ERROR_TEXT);}start=nativeMax(start===undefined?func.length-1:toInteger(start),0);return function(){var args=arguments,index=-1,length=nativeMax(args.length-start,0),array=Array(length);while(++index<length){array[index]=args[start+index];}switch(start){case 0:return func.call(this,array);case 1:return func.call(this,args[0],array);case 2:return func.call(this,args[0],args[1],array);}var otherArgs=Array(start+1);index=-1;while(++index<start){otherArgs[index]=args[index];}otherArgs[start]=array;return apply(func,this,otherArgs);};}function initialParams(fn){return rest(function(args/*..., callback*/){var callback=args.pop();fn.call(this,args,callback);});}function applyEach$1(eachfn){return rest(function(fns,args){var go=initialParams(function(args,callback){var that=this;return eachfn(fns,function(fn,cb){fn.apply(that,args.concat([cb]));},callback);});if(args.length){return go.apply(this,args);}else{return go;}});}/**
     * The base implementation of `_.property` without support for deep paths.
     *
     * @private
     * @param {string} key The key of the property to get.
     * @returns {Function} Returns the new accessor function.
     */function baseProperty(key){return function(object){return object==null?undefined:object[key];};}/**
     * Gets the "length" property value of `object`.
     *
     * **Note:** This function is used to avoid a
     * [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792) that affects
     * Safari on at least iOS 8.1-8.3 ARM64.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {*} Returns the "length" value.
     */var getLength=baseProperty('length');/** Used as references for various `Number` constants. */var MAX_SAFE_INTEGER=9007199254740991;/**
     * Checks if `value` is a valid array-like length.
     *
     * **Note:** This function is loosely based on
     * [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a valid length,
     *  else `false`.
     * @example
     *
     * _.isLength(3);
     * // => true
     *
     * _.isLength(Number.MIN_VALUE);
     * // => false
     *
     * _.isLength(Infinity);
     * // => false
     *
     * _.isLength('3');
     * // => false
     */function isLength(value){return typeof value=='number'&&value>-1&&value%1==0&&value<=MAX_SAFE_INTEGER;}/**
     * Checks if `value` is array-like. A value is considered array-like if it's
     * not a function and has a `value.length` that's an integer greater than or
     * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
     * @example
     *
     * _.isArrayLike([1, 2, 3]);
     * // => true
     *
     * _.isArrayLike(document.body.children);
     * // => true
     *
     * _.isArrayLike('abc');
     * // => true
     *
     * _.isArrayLike(_.noop);
     * // => false
     */function isArrayLike(value){return value!=null&&isLength(getLength(value))&&!isFunction(value);}/**
     * A method that returns `undefined`.
     *
     * @static
     * @memberOf _
     * @since 2.3.0
     * @category Util
     * @example
     *
     * _.times(2, _.noop);
     * // => [undefined, undefined]
     */function noop(){// No operation performed.
}function once(fn){return function(){if(fn===null)return;var callFn=fn;fn=null;callFn.apply(this,arguments);};}var iteratorSymbol=typeof Symbol==='function'&&Symbol.iterator;function getIterator(coll){return iteratorSymbol&&coll[iteratorSymbol]&&coll[iteratorSymbol]();}/* Built-in method references for those with the same name as other `lodash` methods. */var nativeGetPrototype=Object.getPrototypeOf;/**
     * Gets the `[[Prototype]]` of `value`.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {null|Object} Returns the `[[Prototype]]`.
     */function getPrototype(value){return nativeGetPrototype(Object(value));}/** Used for built-in method references. */var objectProto$2=Object.prototype;/** Used to check objects for own properties. */var hasOwnProperty=objectProto$2.hasOwnProperty;/**
     * The base implementation of `_.has` without support for deep paths.
     *
     * @private
     * @param {Object} [object] The object to query.
     * @param {Array|string} key The key to check.
     * @returns {boolean} Returns `true` if `key` exists, else `false`.
     */function baseHas(object,key){// Avoid a bug in IE 10-11 where objects with a [[Prototype]] of `null`,
// that are composed entirely of index properties, return `false` for
// `hasOwnProperty` checks of them.
return object!=null&&(hasOwnProperty.call(object,key)||typeof object=='object'&&key in object&&getPrototype(object)===null);}/* Built-in method references for those with the same name as other `lodash` methods. */var nativeKeys=Object.keys;/**
     * The base implementation of `_.keys` which doesn't skip the constructor
     * property of prototypes or treat sparse arrays as dense.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     */function baseKeys(object){return nativeKeys(Object(object));}/**
     * The base implementation of `_.times` without support for iteratee shorthands
     * or max array length checks.
     *
     * @private
     * @param {number} n The number of times to invoke `iteratee`.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the array of results.
     */function baseTimes(n,iteratee){var index=-1,result=Array(n);while(++index<n){result[index]=iteratee(index);}return result;}/**
     * This method is like `_.isArrayLike` except that it also checks if `value`
     * is an object.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an array-like object,
     *  else `false`.
     * @example
     *
     * _.isArrayLikeObject([1, 2, 3]);
     * // => true
     *
     * _.isArrayLikeObject(document.body.children);
     * // => true
     *
     * _.isArrayLikeObject('abc');
     * // => false
     *
     * _.isArrayLikeObject(_.noop);
     * // => false
     */function isArrayLikeObject(value){return isObjectLike(value)&&isArrayLike(value);}/** `Object#toString` result references. */var argsTag='[object Arguments]';/** Used for built-in method references. */var objectProto$3=Object.prototype;/** Used to check objects for own properties. */var hasOwnProperty$1=objectProto$3.hasOwnProperty;/**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
     * of values.
     */var objectToString$2=objectProto$3.toString;/** Built-in value references. */var propertyIsEnumerable=objectProto$3.propertyIsEnumerable;/**
     * Checks if `value` is likely an `arguments` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified,
     *  else `false`.
     * @example
     *
     * _.isArguments(function() { return arguments; }());
     * // => true
     *
     * _.isArguments([1, 2, 3]);
     * // => false
     */function isArguments(value){// Safari 8.1 incorrectly makes `arguments.callee` enumerable in strict mode.
return isArrayLikeObject(value)&&hasOwnProperty$1.call(value,'callee')&&(!propertyIsEnumerable.call(value,'callee')||objectToString$2.call(value)==argsTag);}/**
     * Checks if `value` is classified as an `Array` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @type {Function}
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified,
     *  else `false`.
     * @example
     *
     * _.isArray([1, 2, 3]);
     * // => true
     *
     * _.isArray(document.body.children);
     * // => false
     *
     * _.isArray('abc');
     * // => false
     *
     * _.isArray(_.noop);
     * // => false
     */var isArray=Array.isArray;/** `Object#toString` result references. */var stringTag='[object String]';/** Used for built-in method references. */var objectProto$4=Object.prototype;/**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
     * of values.
     */var objectToString$3=objectProto$4.toString;/**
     * Checks if `value` is classified as a `String` primitive or object.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified,
     *  else `false`.
     * @example
     *
     * _.isString('abc');
     * // => true
     *
     * _.isString(1);
     * // => false
     */function isString(value){return typeof value=='string'||!isArray(value)&&isObjectLike(value)&&objectToString$3.call(value)==stringTag;}/**
     * Creates an array of index keys for `object` values of arrays,
     * `arguments` objects, and strings, otherwise `null` is returned.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array|null} Returns index keys, else `null`.
     */function indexKeys(object){var length=object?object.length:undefined;if(isLength(length)&&(isArray(object)||isString(object)||isArguments(object))){return baseTimes(length,String);}return null;}/** Used as references for various `Number` constants. */var MAX_SAFE_INTEGER$1=9007199254740991;/** Used to detect unsigned integer values. */var reIsUint=/^(?:0|[1-9]\d*)$/;/**
     * Checks if `value` is a valid array-like index.
     *
     * @private
     * @param {*} value The value to check.
     * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
     * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
     */function isIndex(value,length){length=length==null?MAX_SAFE_INTEGER$1:length;return!!length&&(typeof value=='number'||reIsUint.test(value))&&value>-1&&value%1==0&&value<length;}/** Used for built-in method references. */var objectProto$5=Object.prototype;/**
     * Checks if `value` is likely a prototype object.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
     */function isPrototype(value){var Ctor=value&&value.constructor,proto=typeof Ctor=='function'&&Ctor.prototype||objectProto$5;return value===proto;}/**
     * Creates an array of the own enumerable property names of `object`.
     *
     * **Note:** Non-object values are coerced to objects. See the
     * [ES spec](http://ecma-international.org/ecma-262/6.0/#sec-object.keys)
     * for more details.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.keys(new Foo);
     * // => ['a', 'b'] (iteration order is not guaranteed)
     *
     * _.keys('hi');
     * // => ['0', '1']
     */function keys(object){var isProto=isPrototype(object);if(!(isProto||isArrayLike(object))){return baseKeys(object);}var indexes=indexKeys(object),skipIndexes=!!indexes,result=indexes||[],length=result.length;for(var key in object){if(baseHas(object,key)&&!(skipIndexes&&(key=='length'||isIndex(key,length)))&&!(isProto&&key=='constructor')){result.push(key);}}return result;}function createArrayIterator(coll){var i=-1;var len=coll.length;return function next(){return++i<len?{value:coll[i],key:i}:null;};}function createES2015Iterator(iterator){var i=-1;return function next(){var item=iterator.next();if(item.done)return null;i++;return{value:item.value,key:i};};}function createObjectIterator(obj){var okeys=keys(obj);var i=-1;var len=okeys.length;return function next(){var key=okeys[++i];return i<len?{value:obj[key],key:key}:null;};}function iterator(coll){if(isArrayLike(coll)){return createArrayIterator(coll);}var iterator=getIterator(coll);return iterator?createES2015Iterator(iterator):createObjectIterator(coll);}function onlyOnce(fn){return function(){if(fn===null)throw new Error("Callback was already called.");var callFn=fn;fn=null;callFn.apply(this,arguments);};}function _eachOfLimit(limit){return function(obj,iteratee,callback){callback=once(callback||noop);if(limit<=0||!obj){return callback(null);}var nextElem=iterator(obj);var done=false;var running=0;function iterateeCallback(err){running-=1;if(err){done=true;callback(err);}else if(done&&running<=0){return callback(null);}else{replenish();}}function replenish(){while(running<limit&&!done){var elem=nextElem();if(elem===null){done=true;if(running<=0){callback(null);}return;}running+=1;iteratee(elem.value,elem.key,onlyOnce(iterateeCallback));}}replenish();};}/**
     * The same as [`eachOf`]{@link module:Collections.eachOf} but runs a maximum of `limit` async operations at a
     * time.
     *
     * @name eachOfLimit
     * @static
     * @memberOf module:Collections
     * @method
     * @see [async.eachOf]{@link module:Collections.eachOf}
     * @alias forEachOfLimit
     * @category Collection
     * @param {Array|Iterable|Object} coll - A collection to iterate over.
     * @param {number} limit - The maximum number of async operations at a time.
     * @param {Function} iteratee - A function to apply to each
     * item in `coll`. The `key` is the item's key, or index in the case of an
     * array. The iteratee is passed a `callback(err)` which must be called once it
     * has completed. If no error has occurred, the callback should be run without
     * arguments or with an explicit `null` argument. Invoked with
     * (item, key, callback).
     * @param {Function} [callback] - A callback which is called when all
     * `iteratee` functions have finished, or an error occurs. Invoked with (err).
     */function eachOfLimit(coll,limit,iteratee,callback){_eachOfLimit(limit)(coll,iteratee,callback);}function doLimit(fn,limit){return function(iterable,iteratee,callback){return fn(iterable,limit,iteratee,callback);};}/** Used as the `TypeError` message for "Functions" methods. */var FUNC_ERROR_TEXT$1='Expected a function';/**
     * Creates a function that invokes `func`, with the `this` binding and arguments
     * of the created function, while it's called less than `n` times. Subsequent
     * calls to the created function return the result of the last `func` invocation.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Function
     * @param {number} n The number of calls at which `func` is no longer invoked.
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * jQuery(element).on('click', _.before(5, addContactToList));
     * // => allows adding up to 4 contacts to the list
     */function before(n,func){var result;if(typeof func!='function'){throw new TypeError(FUNC_ERROR_TEXT$1);}n=toInteger(n);return function(){if(--n>0){result=func.apply(this,arguments);}if(n<=1){func=undefined;}return result;};}/**
     * Creates a function that is restricted to invoking `func` once. Repeat calls
     * to the function return the value of the first invocation. The `func` is
     * invoked with the `this` binding and arguments of the created function.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Function
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * var initialize = _.once(createApplication);
     * initialize();
     * initialize();
     * // `initialize` invokes `createApplication` once
     */function once$1(func){return before(2,func);}// eachOf implementation optimized for array-likes
function eachOfArrayLike(coll,iteratee,callback){callback=once$1(callback||noop);var index=0,completed=0,length=coll.length;if(length===0){callback(null);}function iteratorCallback(err){if(err){callback(err);}else if(++completed===length){callback(null);}}for(;index<length;index++){iteratee(coll[index],index,onlyOnce(iteratorCallback));}}// a generic version of eachOf which can handle array, object, and iterator cases.
var eachOfGeneric=doLimit(eachOfLimit,Infinity);/**
     * Like [`each`]{@link module:Collections.each}, except that it passes the key (or index) as the second argument
     * to the iteratee.
     *
     * @name eachOf
     * @static
     * @memberOf module:Collections
     * @method
     * @alias forEachOf
     * @category Collection
     * @see [async.each]{@link module:Collections.each}
     * @param {Array|Iterable|Object} coll - A collection to iterate over.
     * @param {Function} iteratee - A function to apply to each
     * item in `coll`. The `key` is the item's key, or index in the case of an
     * array. The iteratee is passed a `callback(err)` which must be called once it
     * has completed. If no error has occurred, the callback should be run without
     * arguments or with an explicit `null` argument. Invoked with
     * (item, key, callback).
     * @param {Function} [callback] - A callback which is called when all
     * `iteratee` functions have finished, or an error occurs. Invoked with (err).
     * @example
     *
     * var obj = {dev: "/dev.json", test: "/test.json", prod: "/prod.json"};
     * var configs = {};
     *
     * async.forEachOf(obj, function (value, key, callback) {
     *     fs.readFile(__dirname + value, "utf8", function (err, data) {
     *         if (err) return callback(err);
     *         try {
     *             configs[key] = JSON.parse(data);
     *         } catch (e) {
     *             return callback(e);
     *         }
     *         callback();
     *     });
     * }, function (err) {
     *     if (err) console.error(err.message);
     *     // configs is now a map of JSON data
     *     doSomethingWith(configs);
     * });
     */function eachOf(coll,iteratee,callback){var eachOfImplementation=isArrayLike(coll)?eachOfArrayLike:eachOfGeneric;eachOfImplementation(coll,iteratee,callback);}function doParallel(fn){return function(obj,iteratee,callback){return fn(eachOf,obj,iteratee,callback);};}function _asyncMap(eachfn,arr,iteratee,callback){callback=once(callback||noop);arr=arr||[];var results=[];var counter=0;eachfn(arr,function(value,_,callback){var index=counter++;iteratee(value,function(err,v){results[index]=v;callback(err);});},function(err){callback(err,results);});}/**
     * Produces a new collection of values by mapping each value in `coll` through
     * the `iteratee` function. The `iteratee` is called with an item from `coll`
     * and a callback for when it has finished processing. Each of these callback
     * takes 2 arguments: an `error`, and the transformed item from `coll`. If
     * `iteratee` passes an error to its callback, the main `callback` (for the
     * `map` function) is immediately called with the error.
     *
     * Note, that since this function applies the `iteratee` to each item in
     * parallel, there is no guarantee that the `iteratee` functions will complete
     * in order. However, the results array will be in the same order as the
     * original `coll`.
     *
     * If `map` is passed an Object, the results will be an Array.  The results
     * will roughly be in the order of the original Objects' keys (but this can
     * vary across JavaScript engines)
     *
     * @name map
     * @static
     * @memberOf module:Collections
     * @method
     * @category Collection
     * @param {Array|Iterable|Object} coll - A collection to iterate over.
     * @param {Function} iteratee - A function to apply to each item in `coll`.
     * The iteratee is passed a `callback(err, transformed)` which must be called
     * once it has completed with an error (which can be `null`) and a
     * transformed item. Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called when all `iteratee`
     * functions have finished, or an error occurs. Results is an Array of the
     * transformed items from the `coll`. Invoked with (err, results).
     * @example
     *
     * async.map(['file1','file2','file3'], fs.stat, function(err, results) {
     *     // results is now an array of stats for each file
     * });
     */var map=doParallel(_asyncMap);/**
     * Applies the provided arguments to each function in the array, calling
     * `callback` after all functions have completed. If you only provide the first
     * argument, then it will return a function which lets you pass in the
     * arguments as if it were a single function call.
     *
     * @name applyEach
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @category Control Flow
     * @param {Array|Iterable|Object} fns - A collection of asynchronous functions to all
     * call with the same arguments
     * @param {...*} [args] - any number of separate arguments to pass to the
     * function.
     * @param {Function} [callback] - the final argument should be the callback,
     * called when all functions have completed processing.
     * @returns {Function} - If only the first argument is provided, it will return
     * a function which lets you pass in the arguments as if it were a single
     * function call.
     * @example
     *
     * async.applyEach([enableSearch, updateSchema], 'bucket', callback);
     *
     * // partial application example:
     * async.each(
     *     buckets,
     *     async.applyEach([enableSearch, updateSchema]),
     *     callback
     * );
     */var applyEach=applyEach$1(map);function doParallelLimit(fn){return function(obj,limit,iteratee,callback){return fn(_eachOfLimit(limit),obj,iteratee,callback);};}/**
     * The same as [`map`]{@link module:Collections.map} but runs a maximum of `limit` async operations at a time.
     *
     * @name mapLimit
     * @static
     * @memberOf module:Collections
     * @method
     * @see [async.map]{@link module:Collections.map}
     * @category Collection
     * @param {Array|Iterable|Object} coll - A collection to iterate over.
     * @param {number} limit - The maximum number of async operations at a time.
     * @param {Function} iteratee - A function to apply to each item in `coll`.
     * The iteratee is passed a `callback(err, transformed)` which must be called
     * once it has completed with an error (which can be `null`) and a transformed
     * item. Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called when all `iteratee`
     * functions have finished, or an error occurs. Results is an array of the
     * transformed items from the `coll`. Invoked with (err, results).
     */var mapLimit=doParallelLimit(_asyncMap);/**
     * The same as [`map`]{@link module:Collections.map} but runs only a single async operation at a time.
     *
     * @name mapSeries
     * @static
     * @memberOf module:Collections
     * @method
     * @see [async.map]{@link module:Collections.map}
     * @category Collection
     * @param {Array|Iterable|Object} coll - A collection to iterate over.
     * @param {Function} iteratee - A function to apply to each item in `coll`.
     * The iteratee is passed a `callback(err, transformed)` which must be called
     * once it has completed with an error (which can be `null`) and a
     * transformed item. Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called when all `iteratee`
     * functions have finished, or an error occurs. Results is an array of the
     * transformed items from the `coll`. Invoked with (err, results).
     */var mapSeries=doLimit(mapLimit,1);/**
     * The same as [`applyEach`]{@link module:ControlFlow.applyEach} but runs only a single async operation at a time.
     *
     * @name applyEachSeries
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @see [async.applyEach]{@link module:ControlFlow.applyEach}
     * @category Control Flow
     * @param {Array|Iterable|Object} fns - A collection of asynchronous functions to all
     * call with the same arguments
     * @param {...*} [args] - any number of separate arguments to pass to the
     * function.
     * @param {Function} [callback] - the final argument should be the callback,
     * called when all functions have completed processing.
     * @returns {Function} - If only the first argument is provided, it will return
     * a function which lets you pass in the arguments as if it were a single
     * function call.
     */var applyEachSeries=applyEach$1(mapSeries);/**
     * Creates a continuation function with some arguments already applied.
     *
     * Useful as a shorthand when combined with other control flow functions. Any
     * arguments passed to the returned function are added to the arguments
     * originally passed to apply.
     *
     * @name apply
     * @static
     * @memberOf module:Utils
     * @method
     * @category Util
     * @param {Function} function - The function you want to eventually apply all
     * arguments to. Invokes with (arguments...).
     * @param {...*} arguments... - Any number of arguments to automatically apply
     * when the continuation is called.
     * @example
     *
     * // using apply
     * async.parallel([
     *     async.apply(fs.writeFile, 'testfile1', 'test1'),
     *     async.apply(fs.writeFile, 'testfile2', 'test2')
     * ]);
     *
     *
     * // the same process without using apply
     * async.parallel([
     *     function(callback) {
     *         fs.writeFile('testfile1', 'test1', callback);
     *     },
     *     function(callback) {
     *         fs.writeFile('testfile2', 'test2', callback);
     *     }
     * ]);
     *
     * // It's possible to pass any number of additional arguments when calling the
     * // continuation:
     *
     * node> var fn = async.apply(sys.puts, 'one');
     * node> fn('two', 'three');
     * one
     * two
     * three
     */var apply$1=rest(function(fn,args){return rest(function(callArgs){return fn.apply(null,args.concat(callArgs));});});/**
     * Take a sync function and make it async, passing its return value to a
     * callback. This is useful for plugging sync functions into a waterfall,
     * series, or other async functions. Any arguments passed to the generated
     * function will be passed to the wrapped function (except for the final
     * callback argument). Errors thrown will be passed to the callback.
     *
     * If the function passed to `asyncify` returns a Promise, that promises's
     * resolved/rejected state will be used to call the callback, rather than simply
     * the synchronous return value.
     *
     * This also means you can asyncify ES2016 `async` functions.
     *
     * @name asyncify
     * @static
     * @memberOf module:Utils
     * @method
     * @alias wrapSync
     * @category Util
     * @param {Function} func - The synchronous function to convert to an
     * asynchronous function.
     * @returns {Function} An asynchronous wrapper of the `func`. To be invoked with
     * (callback).
     * @example
     *
     * // passing a regular synchronous function
     * async.waterfall([
     *     async.apply(fs.readFile, filename, "utf8"),
     *     async.asyncify(JSON.parse),
     *     function (data, next) {
     *         // data is the result of parsing the text.
     *         // If there was a parsing error, it would have been caught.
     *     }
     * ], callback);
     *
     * // passing a function returning a promise
     * async.waterfall([
     *     async.apply(fs.readFile, filename, "utf8"),
     *     async.asyncify(function (contents) {
     *         return db.model.create(contents);
     *     }),
     *     function (model, next) {
     *         // `model` is the instantiated model object.
     *         // If there was an error, this function would be skipped.
     *     }
     * ], callback);
     *
     * // es6 example
     * var q = async.queue(async.asyncify(async function(file) {
     *     var intermediateStep = await processFile(file);
     *     return await somePromise(intermediateStep)
     * }));
     *
     * q.push(files);
     */function asyncify(func){return initialParams(function(args,callback){var result;try{result=func.apply(this,args);}catch(e){return callback(e);}// if result is Promise object
if(isObject(result)&&typeof result.then==='function'){result.then(function(value){callback(null,value);},function(err){callback(err.message?err:new Error(err));});}else{callback(null,result);}});}/**
     * A specialized version of `_.forEach` for arrays without support for
     * iteratee shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns `array`.
     */function arrayEach(array,iteratee){var index=-1,length=array?array.length:0;while(++index<length){if(iteratee(array[index],index,array)===false){break;}}return array;}/**
     * Creates a base function for methods like `_.forIn` and `_.forOwn`.
     *
     * @private
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {Function} Returns the new base function.
     */function createBaseFor(fromRight){return function(object,iteratee,keysFunc){var index=-1,iterable=Object(object),props=keysFunc(object),length=props.length;while(length--){var key=props[fromRight?length:++index];if(iteratee(iterable[key],key,iterable)===false){break;}}return object;};}/**
     * The base implementation of `baseForOwn` which iterates over `object`
     * properties returned by `keysFunc` and invokes `iteratee` for each property.
     * Iteratee functions may exit iteration early by explicitly returning `false`.
     *
     * @private
     * @param {Object} object The object to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @param {Function} keysFunc The function to get the keys of `object`.
     * @returns {Object} Returns `object`.
     */var baseFor=createBaseFor();/**
     * The base implementation of `_.forOwn` without support for iteratee shorthands.
     *
     * @private
     * @param {Object} object The object to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Object} Returns `object`.
     */function baseForOwn(object,iteratee){return object&&baseFor(object,iteratee,keys);}/**
     * Gets the index at which the first occurrence of `NaN` is found in `array`.
     *
     * @private
     * @param {Array} array The array to search.
     * @param {number} fromIndex The index to search from.
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {number} Returns the index of the matched `NaN`, else `-1`.
     */function indexOfNaN(array,fromIndex,fromRight){var length=array.length,index=fromIndex+(fromRight?1:-1);while(fromRight?index--:++index<length){var other=array[index];if(other!==other){return index;}}return-1;}/**
     * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
     *
     * @private
     * @param {Array} array The array to search.
     * @param {*} value The value to search for.
     * @param {number} fromIndex The index to search from.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */function baseIndexOf(array,value,fromIndex){if(value!==value){return indexOfNaN(array,fromIndex);}var index=fromIndex-1,length=array.length;while(++index<length){if(array[index]===value){return index;}}return-1;}/**
     * Determines the best order for running the functions in `tasks`, based on
     * their requirements. Each function can optionally depend on other functions
     * being completed first, and each function is run as soon as its requirements
     * are satisfied.
     *
     * If any of the functions pass an error to their callback, the `auto` sequence
     * will stop. Further tasks will not execute (so any other functions depending
     * on it will not run), and the main `callback` is immediately called with the
     * error.
     *
     * Functions also receive an object containing the results of functions which
     * have completed so far as the first argument, if they have dependencies. If a
     * task function has no dependencies, it will only be passed a callback.
     *
     * @name auto
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @category Control Flow
     * @param {Object} tasks - An object. Each of its properties is either a
     * function or an array of requirements, with the function itself the last item
     * in the array. The object's key of a property serves as the name of the task
     * defined by that property, i.e. can be used when specifying requirements for
     * other tasks. The function receives one or two arguments:
     * * a `results` object, containing the results of the previously executed
     *   functions, only passed if the task has any dependencies,
     * * a `callback(err, result)` function, which must be called when finished,
     *   passing an `error` (which can be `null`) and the result of the function's
     *   execution.
     * @param {number} [concurrency=Infinity] - An optional `integer` for
     * determining the maximum number of tasks that can be run in parallel. By
     * default, as many as possible.
     * @param {Function} [callback] - An optional callback which is called when all
     * the tasks have been completed. It receives the `err` argument if any `tasks`
     * pass an error to their callback. Results are always returned; however, if an
     * error occurs, no further `tasks` will be performed, and the results object
     * will only contain partial results. Invoked with (err, results).
     * @returns undefined
     * @example
     *
     * async.auto({
     *     // this function will just be passed a callback
     *     readData: async.apply(fs.readFile, 'data.txt', 'utf-8'),
     *     showData: ['readData', function(results, cb) {
     *         // results.readData is the file's contents
     *         // ...
     *     }]
     * }, callback);
     *
     * async.auto({
     *     get_data: function(callback) {
     *         console.log('in get_data');
     *         // async code to get some data
     *         callback(null, 'data', 'converted to array');
     *     },
     *     make_folder: function(callback) {
     *         console.log('in make_folder');
     *         // async code to create a directory to store a file in
     *         // this is run at the same time as getting the data
     *         callback(null, 'folder');
     *     },
     *     write_file: ['get_data', 'make_folder', function(results, callback) {
     *         console.log('in write_file', JSON.stringify(results));
     *         // once there is some data and the directory exists,
     *         // write the data to a file in the directory
     *         callback(null, 'filename');
     *     }],
     *     email_link: ['write_file', function(results, callback) {
     *         console.log('in email_link', JSON.stringify(results));
     *         // once the file is written let's email a link to it...
     *         // results.write_file contains the filename returned by write_file.
     *         callback(null, {'file':results.write_file, 'email':'user@example.com'});
     *     }]
     * }, function(err, results) {
     *     console.log('err = ', err);
     *     console.log('results = ', results);
     * });
     */function auto(tasks,concurrency,callback){if(typeof concurrency==='function'){// concurrency is optional, shift the args.
callback=concurrency;concurrency=null;}callback=once(callback||noop);var keys$$=keys(tasks);var numTasks=keys$$.length;if(!numTasks){return callback(null);}if(!concurrency){concurrency=numTasks;}var results={};var runningTasks=0;var hasError=false;var listeners={};var readyTasks=[];// for cycle detection:
var readyToCheck=[];// tasks that have been identified as reachable
// without the possibility of returning to an ancestor task
var uncheckedDependencies={};baseForOwn(tasks,function(task,key){if(!isArray(task)){// no dependencies
enqueueTask(key,[task]);readyToCheck.push(key);return;}var dependencies=task.slice(0,task.length-1);var remainingDependencies=dependencies.length;if(remainingDependencies===0){enqueueTask(key,task);readyToCheck.push(key);return;}uncheckedDependencies[key]=remainingDependencies;arrayEach(dependencies,function(dependencyName){if(!tasks[dependencyName]){throw new Error('async.auto task `'+key+'` has a non-existent dependency in '+dependencies.join(', '));}addListener(dependencyName,function(){remainingDependencies--;if(remainingDependencies===0){enqueueTask(key,task);}});});});checkForDeadlocks();processQueue();function enqueueTask(key,task){readyTasks.push(function(){runTask(key,task);});}function processQueue(){if(readyTasks.length===0&&runningTasks===0){return callback(null,results);}while(readyTasks.length&&runningTasks<concurrency){var run=readyTasks.shift();run();}}function addListener(taskName,fn){var taskListeners=listeners[taskName];if(!taskListeners){taskListeners=listeners[taskName]=[];}taskListeners.push(fn);}function taskComplete(taskName){var taskListeners=listeners[taskName]||[];arrayEach(taskListeners,function(fn){fn();});processQueue();}function runTask(key,task){if(hasError)return;var taskCallback=onlyOnce(rest(function(err,args){runningTasks--;if(args.length<=1){args=args[0];}if(err){var safeResults={};baseForOwn(results,function(val,rkey){safeResults[rkey]=val;});safeResults[key]=args;hasError=true;listeners=[];callback(err,safeResults);}else{results[key]=args;taskComplete(key);}}));runningTasks++;var taskFn=task[task.length-1];if(task.length>1){taskFn(results,taskCallback);}else{taskFn(taskCallback);}}function checkForDeadlocks(){// Kahn's algorithm
// https://en.wikipedia.org/wiki/Topological_sorting#Kahn.27s_algorithm
// http://connalle.blogspot.com/2013/10/topological-sortingkahn-algorithm.html
var currentTask;var counter=0;while(readyToCheck.length){currentTask=readyToCheck.pop();counter++;arrayEach(getDependents(currentTask),function(dependent){if(--uncheckedDependencies[dependent]===0){readyToCheck.push(dependent);}});}if(counter!==numTasks){throw new Error('async.auto cannot execute tasks due to a recursive dependency');}}function getDependents(taskName){var result=[];baseForOwn(tasks,function(task,key){if(isArray(task)&&baseIndexOf(task,taskName,0)>=0){result.push(key);}});return result;}}/**
     * A specialized version of `_.map` for arrays without support for iteratee
     * shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the new mapped array.
     */function arrayMap(array,iteratee){var index=-1,length=array?array.length:0,result=Array(length);while(++index<length){result[index]=iteratee(array[index],index,array);}return result;}/**
     * Copies the values of `source` to `array`.
     *
     * @private
     * @param {Array} source The array to copy values from.
     * @param {Array} [array=[]] The array to copy values to.
     * @returns {Array} Returns `array`.
     */function copyArray(source,array){var index=-1,length=source.length;array||(array=Array(length));while(++index<length){array[index]=source[index];}return array;}/**
     * Checks if `value` is a global object.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {null|Object} Returns `value` if it's a global object, else `null`.
     */function checkGlobal(value){return value&&value.Object===Object?value:null;}/** Detect free variable `global` from Node.js. */var freeGlobal=checkGlobal(typeof global=='object'&&global);/** Detect free variable `self`. */var freeSelf=checkGlobal(typeof self=='object'&&self);/** Detect `this` as the global object. */var thisGlobal=checkGlobal(typeof this=='object'&&this);/** Used as a reference to the global object. */var root=freeGlobal||freeSelf||thisGlobal||Function('return this')();/** Built-in value references. */var Symbol$1=root.Symbol;/** Used as references for various `Number` constants. */var INFINITY$1=1/0;/** Used to convert symbols to primitives and strings. */var symbolProto=Symbol$1?Symbol$1.prototype:undefined;var symbolToString=symbolProto?symbolProto.toString:undefined;/**
     * The base implementation of `_.toString` which doesn't convert nullish
     * values to empty strings.
     *
     * @private
     * @param {*} value The value to process.
     * @returns {string} Returns the string.
     */function baseToString(value){// Exit early for strings to avoid a performance hit in some environments.
if(typeof value=='string'){return value;}if(isSymbol(value)){return symbolToString?symbolToString.call(value):'';}var result=value+'';return result=='0'&&1/value==-INFINITY$1?'-0':result;}/**
     * The base implementation of `_.slice` without an iteratee call guard.
     *
     * @private
     * @param {Array} array The array to slice.
     * @param {number} [start=0] The start position.
     * @param {number} [end=array.length] The end position.
     * @returns {Array} Returns the slice of `array`.
     */function baseSlice(array,start,end){var index=-1,length=array.length;if(start<0){start=-start>length?0:length+start;}end=end>length?length:end;if(end<0){end+=length;}length=start>end?0:end-start>>>0;start>>>=0;var result=Array(length);while(++index<length){result[index]=array[index+start];}return result;}/**
     * Casts `array` to a slice if it's needed.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {number} start The start position.
     * @param {number} [end=array.length] The end position.
     * @returns {Array} Returns the cast slice.
     */function castSlice(array,start,end){var length=array.length;end=end===undefined?length:end;return!start&&end>=length?array:baseSlice(array,start,end);}/**
     * Used by `_.trim` and `_.trimEnd` to get the index of the last string symbol
     * that is not found in the character symbols.
     *
     * @private
     * @param {Array} strSymbols The string symbols to inspect.
     * @param {Array} chrSymbols The character symbols to find.
     * @returns {number} Returns the index of the last unmatched string symbol.
     */function charsEndIndex(strSymbols,chrSymbols){var index=strSymbols.length;while(index--&&baseIndexOf(chrSymbols,strSymbols[index],0)>-1){}return index;}/**
     * Used by `_.trim` and `_.trimStart` to get the index of the first string symbol
     * that is not found in the character symbols.
     *
     * @private
     * @param {Array} strSymbols The string symbols to inspect.
     * @param {Array} chrSymbols The character symbols to find.
     * @returns {number} Returns the index of the first unmatched string symbol.
     */function charsStartIndex(strSymbols,chrSymbols){var index=-1,length=strSymbols.length;while(++index<length&&baseIndexOf(chrSymbols,strSymbols[index],0)>-1){}return index;}/** Used to compose unicode character classes. */var rsAstralRange='\\ud800-\\udfff';var rsComboMarksRange='\\u0300-\\u036f\\ufe20-\\ufe23';var rsComboSymbolsRange='\\u20d0-\\u20f0';var rsVarRange='\\ufe0e\\ufe0f';var rsAstral='['+rsAstralRange+']';var rsCombo='['+rsComboMarksRange+rsComboSymbolsRange+']';var rsFitz='\\ud83c[\\udffb-\\udfff]';var rsModifier='(?:'+rsCombo+'|'+rsFitz+')';var rsNonAstral='[^'+rsAstralRange+']';var rsRegional='(?:\\ud83c[\\udde6-\\uddff]){2}';var rsSurrPair='[\\ud800-\\udbff][\\udc00-\\udfff]';var rsZWJ='\\u200d';var reOptMod=rsModifier+'?';var rsOptVar='['+rsVarRange+']?';var rsOptJoin='(?:'+rsZWJ+'(?:'+[rsNonAstral,rsRegional,rsSurrPair].join('|')+')'+rsOptVar+reOptMod+')*';var rsSeq=rsOptVar+reOptMod+rsOptJoin;var rsSymbol='(?:'+[rsNonAstral+rsCombo+'?',rsCombo,rsRegional,rsSurrPair,rsAstral].join('|')+')';/** Used to match [string symbols](https://mathiasbynens.be/notes/javascript-unicode). */var reComplexSymbol=RegExp(rsFitz+'(?='+rsFitz+')|'+rsSymbol+rsSeq,'g');/**
     * Converts `string` to an array.
     *
     * @private
     * @param {string} string The string to convert.
     * @returns {Array} Returns the converted array.
     */function stringToArray(string){return string.match(reComplexSymbol);}/**
     * Converts `value` to a string. An empty string is returned for `null`
     * and `undefined` values. The sign of `-0` is preserved.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to process.
     * @returns {string} Returns the string.
     * @example
     *
     * _.toString(null);
     * // => ''
     *
     * _.toString(-0);
     * // => '-0'
     *
     * _.toString([1, 2, 3]);
     * // => '1,2,3'
     */function toString(value){return value==null?'':baseToString(value);}/** Used to match leading and trailing whitespace. */var reTrim$1=/^\s+|\s+$/g;/**
     * Removes leading and trailing whitespace or specified characters from `string`.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category String
     * @param {string} [string=''] The string to trim.
     * @param {string} [chars=whitespace] The characters to trim.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
     * @returns {string} Returns the trimmed string.
     * @example
     *
     * _.trim('  abc  ');
     * // => 'abc'
     *
     * _.trim('-_-abc-_-', '_-');
     * // => 'abc'
     *
     * _.map(['  foo  ', '  bar  '], _.trim);
     * // => ['foo', 'bar']
     */function trim(string,chars,guard){string=toString(string);if(string&&(guard||chars===undefined)){return string.replace(reTrim$1,'');}if(!string||!(chars=baseToString(chars))){return string;}var strSymbols=stringToArray(string),chrSymbols=stringToArray(chars),start=charsStartIndex(strSymbols,chrSymbols),end=charsEndIndex(strSymbols,chrSymbols)+1;return castSlice(strSymbols,start,end).join('');}var FN_ARGS=/^(function)?\s*[^\(]*\(\s*([^\)]*)\)/m;var FN_ARG_SPLIT=/,/;var FN_ARG=/(=.+)?(\s*)$/;var STRIP_COMMENTS=/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;function parseParams(func){func=func.toString().replace(STRIP_COMMENTS,'');func=func.match(FN_ARGS)[2].replace(' ','');func=func?func.split(FN_ARG_SPLIT):[];func=func.map(function(arg){return trim(arg.replace(FN_ARG,''));});return func;}/**
     * A dependency-injected version of the [async.auto]{@link module:ControlFlow.auto} function. Dependent
     * tasks are specified as parameters to the function, after the usual callback
     * parameter, with the parameter names matching the names of the tasks it
     * depends on. This can provide even more readable task graphs which can be
     * easier to maintain.
     *
     * If a final callback is specified, the task results are similarly injected,
     * specified as named parameters after the initial error parameter.
     *
     * The autoInject function is purely syntactic sugar and its semantics are
     * otherwise equivalent to [async.auto]{@link module:ControlFlow.auto}.
     *
     * @name autoInject
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @see [async.auto]{@link module:ControlFlow.auto}
     * @category Control Flow
     * @param {Object} tasks - An object, each of whose properties is a function of
     * the form 'func([dependencies...], callback). The object's key of a property
     * serves as the name of the task defined by that property, i.e. can be used
     * when specifying requirements for other tasks.
     * * The `callback` parameter is a `callback(err, result)` which must be called
     *   when finished, passing an `error` (which can be `null`) and the result of
     *   the function's execution. The remaining parameters name other tasks on
     *   which the task is dependent, and the results from those tasks are the
     *   arguments of those parameters.
     * @param {Function} [callback] - An optional callback which is called when all
     * the tasks have been completed. It receives the `err` argument if any `tasks`
     * pass an error to their callback, and a `results` object with any completed
     * task results, similar to `auto`.
     * @example
     *
     * //  The example from `auto` can be rewritten as follows:
     * async.autoInject({
     *     get_data: function(callback) {
     *         // async code to get some data
     *         callback(null, 'data', 'converted to array');
     *     },
     *     make_folder: function(callback) {
     *         // async code to create a directory to store a file in
     *         // this is run at the same time as getting the data
     *         callback(null, 'folder');
     *     },
     *     write_file: function(get_data, make_folder, callback) {
     *         // once there is some data and the directory exists,
     *         // write the data to a file in the directory
     *         callback(null, 'filename');
     *     },
     *     email_link: function(write_file, callback) {
     *         // once the file is written let's email a link to it...
     *         // write_file contains the filename returned by write_file.
     *         callback(null, {'file':write_file, 'email':'user@example.com'});
     *     }
     * }, function(err, results) {
     *     console.log('err = ', err);
     *     console.log('email_link = ', results.email_link);
     * });
     *
     * // If you are using a JS minifier that mangles parameter names, `autoInject`
     * // will not work with plain functions, since the parameter names will be
     * // collapsed to a single letter identifier.  To work around this, you can
     * // explicitly specify the names of the parameters your task function needs
     * // in an array, similar to Angular.js dependency injection.
     *
     * // This still has an advantage over plain `auto`, since the results a task
     * // depends on are still spread into arguments.
     * async.autoInject({
     *     //...
     *     write_file: ['get_data', 'make_folder', function(get_data, make_folder, callback) {
     *         callback(null, 'filename');
     *     }],
     *     email_link: ['write_file', function(write_file, callback) {
     *         callback(null, {'file':write_file, 'email':'user@example.com'});
     *     }]
     *     //...
     * }, function(err, results) {
     *     console.log('err = ', err);
     *     console.log('email_link = ', results.email_link);
     * });
     */function autoInject(tasks,callback){var newTasks={};baseForOwn(tasks,function(taskFn,key){var params;if(isArray(taskFn)){params=copyArray(taskFn);taskFn=params.pop();newTasks[key]=params.concat(params.length>0?newTask:taskFn);}else if(taskFn.length===1){// no dependencies, use the function as-is
newTasks[key]=taskFn;}else{params=parseParams(taskFn);if(taskFn.length===0&&params.length===0){throw new Error("autoInject task functions require explicit parameters.");}params.pop();newTasks[key]=params.concat(newTask);}function newTask(results,taskCb){var newArgs=arrayMap(params,function(name){return results[name];});newArgs.push(taskCb);taskFn.apply(null,newArgs);}});auto(newTasks,callback);}var hasSetImmediate=typeof setImmediate==='function'&&setImmediate;var hasNextTick=typeof process==='object'&&typeof process.nextTick==='function';function fallback(fn){setTimeout(fn,0);}function wrap(defer){return rest(function(fn,args){defer(function(){fn.apply(null,args);});});}var _defer;if(hasSetImmediate){_defer=setImmediate;}else if(hasNextTick){_defer=process.nextTick;}else{_defer=fallback;}var setImmediate$1=wrap(_defer);// Simple doubly linked list (https://en.wikipedia.org/wiki/Doubly_linked_list) implementation
// used for queues. This implementation assumes that the node provided by the user can be modified
// to adjust the next and last properties. We implement only the minimal functionality
// for queue support.
function DLL(){this.head=this.tail=null;this.length=0;}function setInitial(dll,node){dll.length=1;dll.head=dll.tail=node;}DLL.prototype.removeLink=function(node){if(node.prev)node.prev.next=node.next;else this.head=node.next;if(node.next)node.next.prev=node.prev;else this.tail=node.prev;node.prev=node.next=null;this.length-=1;return node;};DLL.prototype.empty=DLL;DLL.prototype.insertAfter=function(node,newNode){newNode.prev=node;newNode.next=node.next;if(node.next)node.next.prev=newNode;else this.tail=newNode;node.next=newNode;this.length+=1;};DLL.prototype.insertBefore=function(node,newNode){newNode.prev=node.prev;newNode.next=node;if(node.prev)node.prev.next=newNode;else this.head=newNode;node.prev=newNode;this.length+=1;};DLL.prototype.unshift=function(node){if(this.head)this.insertBefore(this.head,node);else setInitial(this,node);};DLL.prototype.push=function(node){if(this.tail)this.insertAfter(this.tail,node);else setInitial(this,node);};DLL.prototype.shift=function(){return this.head&&this.removeLink(this.head);};DLL.prototype.pop=function(){return this.tail&&this.removeLink(this.tail);};function queue(worker,concurrency,payload){if(concurrency==null){concurrency=1;}else if(concurrency===0){throw new Error('Concurrency must not be zero');}function _insert(data,insertAtFront,callback){if(callback!=null&&typeof callback!=='function'){throw new Error('task callback must be a function');}q.started=true;if(!isArray(data)){data=[data];}if(data.length===0&&q.idle()){// call drain immediately if there are no tasks
return setImmediate$1(function(){q.drain();});}arrayEach(data,function(task){var item={data:task,callback:callback||noop};if(insertAtFront){q._tasks.unshift(item);}else{q._tasks.push(item);}});setImmediate$1(q.process);}function _next(tasks){return rest(function(args){workers-=1;arrayEach(tasks,function(task){arrayEach(workersList,function(worker,index){if(worker===task){workersList.splice(index,1);return false;}});task.callback.apply(task,args);if(args[0]!=null){q.error(args[0],task.data);}});if(workers<=q.concurrency-q.buffer){q.unsaturated();}if(q.idle()){q.drain();}q.process();});}var workers=0;var workersList=[];var q={_tasks:new DLL(),concurrency:concurrency,payload:payload,saturated:noop,unsaturated:noop,buffer:concurrency/4,empty:noop,drain:noop,error:noop,started:false,paused:false,push:function(data,callback){_insert(data,false,callback);},kill:function(){q.drain=noop;q._tasks.empty();},unshift:function(data,callback){_insert(data,true,callback);},process:function(){while(!q.paused&&workers<q.concurrency&&q._tasks.length){var tasks=[],data=[];var l=q._tasks.length;if(q.payload)l=Math.min(l,q.payload);for(var i=0;i<l;i++){var node=q._tasks.shift();tasks.push(node);data.push(node.data);}if(q._tasks.length===0){q.empty();}workers+=1;workersList.push(tasks[0]);if(workers===q.concurrency){q.saturated();}var cb=onlyOnce(_next(tasks));worker(data,cb);}},length:function(){return q._tasks.length;},running:function(){return workers;},workersList:function(){return workersList;},idle:function(){return q._tasks.length+workers===0;},pause:function(){q.paused=true;},resume:function(){if(q.paused===false){return;}q.paused=false;var resumeCount=Math.min(q.concurrency,q._tasks.length);// Need to call q.process once per concurrent
// worker to preserve full concurrency after pause
for(var w=1;w<=resumeCount;w++){setImmediate$1(q.process);}}};return q;}/**
     * A cargo of tasks for the worker function to complete. Cargo inherits all of
     * the same methods and event callbacks as [`queue`]{@link module:ControlFlow.queue}.
     * @typedef {Object} CargoObject
     * @memberOf module:ControlFlow
     * @property {Function} length - A function returning the number of items
     * waiting to be processed. Invoke like `cargo.length()`.
     * @property {number} payload - An `integer` for determining how many tasks
     * should be process per round. This property can be changed after a `cargo` is
     * created to alter the payload on-the-fly.
     * @property {Function} push - Adds `task` to the `queue`. The callback is
     * called once the `worker` has finished processing the task. Instead of a
     * single task, an array of `tasks` can be submitted. The respective callback is
     * used for every task in the list. Invoke like `cargo.push(task, [callback])`.
     * @property {Function} saturated - A callback that is called when the
     * `queue.length()` hits the concurrency and further tasks will be queued.
     * @property {Function} empty - A callback that is called when the last item
     * from the `queue` is given to a `worker`.
     * @property {Function} drain - A callback that is called when the last item
     * from the `queue` has returned from the `worker`.
     * @property {Function} idle - a function returning false if there are items
     * waiting or being processed, or true if not. Invoke like `cargo.idle()`.
     * @property {Function} pause - a function that pauses the processing of tasks
     * until `resume()` is called. Invoke like `cargo.pause()`.
     * @property {Function} resume - a function that resumes the processing of
     * queued tasks when the queue is paused. Invoke like `cargo.resume()`.
     * @property {Function} kill - a function that removes the `drain` callback and
     * empties remaining tasks from the queue forcing it to go idle. Invoke like `cargo.kill()`.
     *//**
     * Creates a `cargo` object with the specified payload. Tasks added to the
     * cargo will be processed altogether (up to the `payload` limit). If the
     * `worker` is in progress, the task is queued until it becomes available. Once
     * the `worker` has completed some tasks, each callback of those tasks is
     * called. Check out [these](https://camo.githubusercontent.com/6bbd36f4cf5b35a0f11a96dcd2e97711ffc2fb37/68747470733a2f2f662e636c6f75642e6769746875622e636f6d2f6173736574732f313637363837312f36383130382f62626330636662302d356632392d313165322d393734662d3333393763363464633835382e676966) [animations](https://camo.githubusercontent.com/f4810e00e1c5f5f8addbe3e9f49064fd5d102699/68747470733a2f2f662e636c6f75642e6769746875622e636f6d2f6173736574732f313637363837312f36383130312f38346339323036362d356632392d313165322d383134662d3964336430323431336266642e676966)
     * for how `cargo` and `queue` work.
     *
     * While [`queue`]{@link module:ControlFlow.queue} passes only one task to one of a group of workers
     * at a time, cargo passes an array of tasks to a single worker, repeating
     * when the worker is finished.
     *
     * @name cargo
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @see [async.queue]{@link module:ControlFlow.queue}
     * @category Control Flow
     * @param {Function} worker - An asynchronous function for processing an array
     * of queued tasks, which must call its `callback(err)` argument when finished,
     * with an optional `err` argument. Invoked with `(tasks, callback)`.
     * @param {number} [payload=Infinity] - An optional `integer` for determining
     * how many tasks should be processed per round; if omitted, the default is
     * unlimited.
     * @returns {module:ControlFlow.CargoObject} A cargo object to manage the tasks. Callbacks can
     * attached as certain properties to listen for specific events during the
     * lifecycle of the cargo and inner queue.
     * @example
     *
     * // create a cargo object with payload 2
     * var cargo = async.cargo(function(tasks, callback) {
     *     for (var i=0; i<tasks.length; i++) {
     *         console.log('hello ' + tasks[i].name);
     *     }
     *     callback();
     * }, 2);
     *
     * // add some items
     * cargo.push({name: 'foo'}, function(err) {
     *     console.log('finished processing foo');
     * });
     * cargo.push({name: 'bar'}, function(err) {
     *     console.log('finished processing bar');
     * });
     * cargo.push({name: 'baz'}, function(err) {
     *     console.log('finished processing baz');
     * });
     */function cargo(worker,payload){return queue(worker,1,payload);}/**
     * The same as [`eachOf`]{@link module:Collections.eachOf} but runs only a single async operation at a time.
     *
     * @name eachOfSeries
     * @static
     * @memberOf module:Collections
     * @method
     * @see [async.eachOf]{@link module:Collections.eachOf}
     * @alias forEachOfSeries
     * @category Collection
     * @param {Array|Iterable|Object} coll - A collection to iterate over.
     * @param {Function} iteratee - A function to apply to each item in `coll`. The
     * `key` is the item's key, or index in the case of an array. The iteratee is
     * passed a `callback(err)` which must be called once it has completed. If no
     * error has occurred, the callback should be run without arguments or with an
     * explicit `null` argument. Invoked with (item, key, callback).
     * @param {Function} [callback] - A callback which is called when all `iteratee`
     * functions have finished, or an error occurs. Invoked with (err).
     */var eachOfSeries=doLimit(eachOfLimit,1);/**
     * Reduces `coll` into a single value using an async `iteratee` to return each
     * successive step. `memo` is the initial state of the reduction. This function
     * only operates in series.
     *
     * For performance reasons, it may make sense to split a call to this function
     * into a parallel map, and then use the normal `Array.prototype.reduce` on the
     * results. This function is for situations where each step in the reduction
     * needs to be async; if you can get the data before reducing it, then it's
     * probably a good idea to do so.
     *
     * @name reduce
     * @static
     * @memberOf module:Collections
     * @method
     * @alias inject
     * @alias foldl
     * @category Collection
     * @param {Array|Iterable|Object} coll - A collection to iterate over.
     * @param {*} memo - The initial state of the reduction.
     * @param {Function} iteratee - A function applied to each item in the
     * array to produce the next step in the reduction. The `iteratee` is passed a
     * `callback(err, reduction)` which accepts an optional error as its first
     * argument, and the state of the reduction as the second. If an error is
     * passed to the callback, the reduction is stopped and the main `callback` is
     * immediately called with the error. Invoked with (memo, item, callback).
     * @param {Function} [callback] - A callback which is called after all the
     * `iteratee` functions have finished. Result is the reduced value. Invoked with
     * (err, result).
     * @example
     *
     * async.reduce([1,2,3], 0, function(memo, item, callback) {
     *     // pointless async:
     *     process.nextTick(function() {
     *         callback(null, memo + item)
     *     });
     * }, function(err, result) {
     *     // result is now equal to the last value of memo, which is 6
     * });
     */function reduce(coll,memo,iteratee,callback){callback=once(callback||noop);eachOfSeries(coll,function(x,i,callback){iteratee(memo,x,function(err,v){memo=v;callback(err);});},function(err){callback(err,memo);});}/**
     * Version of the compose function that is more natural to read. Each function
     * consumes the return value of the previous function. It is the equivalent of
     * [compose]{@link module:ControlFlow.compose} with the arguments reversed.
     *
     * Each function is executed with the `this` binding of the composed function.
     *
     * @name seq
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @see [async.compose]{@link module:ControlFlow.compose}
     * @category Control Flow
     * @param {...Function} functions - the asynchronous functions to compose
     * @returns {Function} a function that composes the `functions` in order
     * @example
     *
     * // Requires lodash (or underscore), express3 and dresende's orm2.
     * // Part of an app, that fetches cats of the logged user.
     * // This example uses `seq` function to avoid overnesting and error
     * // handling clutter.
     * app.get('/cats', function(request, response) {
     *     var User = request.models.User;
     *     async.seq(
     *         _.bind(User.get, User),  // 'User.get' has signature (id, callback(err, data))
     *         function(user, fn) {
     *             user.getCats(fn);      // 'getCats' has signature (callback(err, data))
     *         }
     *     )(req.session.user_id, function (err, cats) {
     *         if (err) {
     *             console.error(err);
     *             response.json({ status: 'error', message: err.message });
     *         } else {
     *             response.json({ status: 'ok', message: 'Cats found', data: cats });
     *         }
     *     });
     * });
     */var seq=rest(function seq(functions){return rest(function(args){var that=this;var cb=args[args.length-1];if(typeof cb=='function'){args.pop();}else{cb=noop;}reduce(functions,args,function(newargs,fn,cb){fn.apply(that,newargs.concat([rest(function(err,nextargs){cb(err,nextargs);})]));},function(err,results){cb.apply(that,[err].concat(results));});});});/**
     * Creates a function which is a composition of the passed asynchronous
     * functions. Each function consumes the return value of the function that
     * follows. Composing functions `f()`, `g()`, and `h()` would produce the result
     * of `f(g(h()))`, only this version uses callbacks to obtain the return values.
     *
     * Each function is executed with the `this` binding of the composed function.
     *
     * @name compose
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @category Control Flow
     * @param {...Function} functions - the asynchronous functions to compose
     * @returns {Function} an asynchronous function that is the composed
     * asynchronous `functions`
     * @example
     *
     * function add1(n, callback) {
     *     setTimeout(function () {
     *         callback(null, n + 1);
     *     }, 10);
     * }
     *
     * function mul3(n, callback) {
     *     setTimeout(function () {
     *         callback(null, n * 3);
     *     }, 10);
     * }
     *
     * var add1mul3 = async.compose(mul3, add1);
     * add1mul3(4, function (err, result) {
     *     // result now equals 15
     * });
     */var compose=rest(function(args){return seq.apply(null,args.reverse());});function concat$1(eachfn,arr,fn,callback){var result=[];eachfn(arr,function(x,index,cb){fn(x,function(err,y){result=result.concat(y||[]);cb(err);});},function(err){callback(err,result);});}/**
     * Applies `iteratee` to each item in `coll`, concatenating the results. Returns
     * the concatenated list. The `iteratee`s are called in parallel, and the
     * results are concatenated as they return. There is no guarantee that the
     * results array will be returned in the original order of `coll` passed to the
     * `iteratee` function.
     *
     * @name concat
     * @static
     * @memberOf module:Collections
     * @method
     * @category Collection
     * @param {Array|Iterable|Object} coll - A collection to iterate over.
     * @param {Function} iteratee - A function to apply to each item in `coll`.
     * The iteratee is passed a `callback(err, results)` which must be called once
     * it has completed with an error (which can be `null`) and an array of results.
     * Invoked with (item, callback).
     * @param {Function} [callback(err)] - A callback which is called after all the
     * `iteratee` functions have finished, or an error occurs. Results is an array
     * containing the concatenated results of the `iteratee` function. Invoked with
     * (err, results).
     * @example
     *
     * async.concat(['dir1','dir2','dir3'], fs.readdir, function(err, files) {
     *     // files is now a list of filenames that exist in the 3 directories
     * });
     */var concat=doParallel(concat$1);function doSeries(fn){return function(obj,iteratee,callback){return fn(eachOfSeries,obj,iteratee,callback);};}/**
     * The same as [`concat`]{@link module:Collections.concat} but runs only a single async operation at a time.
     *
     * @name concatSeries
     * @static
     * @memberOf module:Collections
     * @method
     * @see [async.concat]{@link module:Collections.concat}
     * @category Collection
     * @param {Array|Iterable|Object} coll - A collection to iterate over.
     * @param {Function} iteratee - A function to apply to each item in `coll`.
     * The iteratee is passed a `callback(err, results)` which must be called once
     * it has completed with an error (which can be `null`) and an array of results.
     * Invoked with (item, callback).
     * @param {Function} [callback(err)] - A callback which is called after all the
     * `iteratee` functions have finished, or an error occurs. Results is an array
     * containing the concatenated results of the `iteratee` function. Invoked with
     * (err, results).
     */var concatSeries=doSeries(concat$1);/**
     * Returns a function that when called, calls-back with the values provided.
     * Useful as the first function in a [`waterfall`]{@link module:ControlFlow.waterfall}, or for plugging values in to
     * [`auto`]{@link module:ControlFlow.auto}.
     *
     * @name constant
     * @static
     * @memberOf module:Utils
     * @method
     * @category Util
     * @param {...*} arguments... - Any number of arguments to automatically invoke
     * callback with.
     * @returns {Function} Returns a function that when invoked, automatically
     * invokes the callback with the previous given arguments.
     * @example
     *
     * async.waterfall([
     *     async.constant(42),
     *     function (value, next) {
     *         // value === 42
     *     },
     *     //...
     * ], callback);
     *
     * async.waterfall([
     *     async.constant(filename, "utf8"),
     *     fs.readFile,
     *     function (fileData, next) {
     *         //...
     *     }
     *     //...
     * ], callback);
     *
     * async.auto({
     *     hostname: async.constant("https://server.net/"),
     *     port: findFreePort,
     *     launchServer: ["hostname", "port", function (options, cb) {
     *         startServer(options, cb);
     *     }],
     *     //...
     * }, callback);
     */var constant=rest(function(values){var args=[null].concat(values);return initialParams(function(ignoredArgs,callback){return callback.apply(this,args);});});/**
     * This method returns the first argument given to it.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Util
     * @param {*} value Any value.
     * @returns {*} Returns `value`.
     * @example
     *
     * var object = { 'user': 'fred' };
     *
     * console.log(_.identity(object) === object);
     * // => true
     */function identity(value){return value;}function _createTester(eachfn,check,getResult){return function(arr,limit,iteratee,cb){function done(err){if(cb){if(err){cb(err);}else{cb(null,getResult(false));}}}function wrappedIteratee(x,_,callback){if(!cb)return callback();iteratee(x,function(err,v){if(cb){if(err){cb(err);cb=iteratee=false;}else if(check(v)){cb(null,getResult(true,x));cb=iteratee=false;}}callback();});}if(arguments.length>3){cb=cb||noop;eachfn(arr,limit,wrappedIteratee,done);}else{cb=iteratee;cb=cb||noop;iteratee=limit;eachfn(arr,wrappedIteratee,done);}};}function _findGetResult(v,x){return x;}/**
     * Returns the first value in `coll` that passes an async truth test. The
     * `iteratee` is applied in parallel, meaning the first iteratee to return
     * `true` will fire the detect `callback` with that result. That means the
     * result might not be the first item in the original `coll` (in terms of order)
     * that passes the test.

     * If order within the original `coll` is important, then look at
     * [`detectSeries`]{@link module:Collections.detectSeries}.
     *
     * @name detect
     * @static
     * @memberOf module:Collections
     * @method
     * @alias find
     * @category Collections
     * @param {Array|Iterable|Object} coll - A collection to iterate over.
     * @param {Function} iteratee - A truth test to apply to each item in `coll`.
     * The iteratee is passed a `callback(err, truthValue)` which must be called
     * with a boolean argument once it has completed. Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called as soon as any
     * iteratee returns `true`, or after all the `iteratee` functions have finished.
     * Result will be the first item in the array that passes the truth test
     * (iteratee) or the value `undefined` if none passed. Invoked with
     * (err, result).
     * @example
     *
     * async.detect(['file1','file2','file3'], function(filePath, callback) {
     *     fs.access(filePath, function(err) {
     *         callback(null, !err)
     *     });
     * }, function(err, result) {
     *     // result now equals the first file in the list that exists
     * });
     */var detect=_createTester(eachOf,identity,_findGetResult);/**
     * The same as [`detect`]{@link module:Collections.detect} but runs a maximum of `limit` async operations at a
     * time.
     *
     * @name detectLimit
     * @static
     * @memberOf module:Collections
     * @method
     * @see [async.detect]{@link module:Collections.detect}
     * @alias findLimit
     * @category Collections
     * @param {Array|Iterable|Object} coll - A collection to iterate over.
     * @param {number} limit - The maximum number of async operations at a time.
     * @param {Function} iteratee - A truth test to apply to each item in `coll`.
     * The iteratee is passed a `callback(err, truthValue)` which must be called
     * with a boolean argument once it has completed. Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called as soon as any
     * iteratee returns `true`, or after all the `iteratee` functions have finished.
     * Result will be the first item in the array that passes the truth test
     * (iteratee) or the value `undefined` if none passed. Invoked with
     * (err, result).
     */var detectLimit=_createTester(eachOfLimit,identity,_findGetResult);/**
     * The same as [`detect`]{@link module:Collections.detect} but runs only a single async operation at a time.
     *
     * @name detectSeries
     * @static
     * @memberOf module:Collections
     * @method
     * @see [async.detect]{@link module:Collections.detect}
     * @alias findSeries
     * @category Collections
     * @param {Array|Iterable|Object} coll - A collection to iterate over.
     * @param {Function} iteratee - A truth test to apply to each item in `coll`.
     * The iteratee is passed a `callback(err, truthValue)` which must be called
     * with a boolean argument once it has completed. Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called as soon as any
     * iteratee returns `true`, or after all the `iteratee` functions have finished.
     * Result will be the first item in the array that passes the truth test
     * (iteratee) or the value `undefined` if none passed. Invoked with
     * (err, result).
     */var detectSeries=_createTester(eachOfSeries,identity,_findGetResult);function consoleFunc(name){return rest(function(fn,args){fn.apply(null,args.concat([rest(function(err,args){if(typeof console==='object'){if(err){if(console.error){console.error(err);}}else if(console[name]){arrayEach(args,function(x){console[name](x);});}}})]));});}/**
     * Logs the result of an `async` function to the `console` using `console.dir`
     * to display the properties of the resulting object. Only works in Node.js or
     * in browsers that support `console.dir` and `console.error` (such as FF and
     * Chrome). If multiple arguments are returned from the async function,
     * `console.dir` is called on each argument in order.
     *
     * @name dir
     * @static
     * @memberOf module:Utils
     * @method
     * @category Util
     * @param {Function} function - The function you want to eventually apply all
     * arguments to.
     * @param {...*} arguments... - Any number of arguments to apply to the function.
     * @example
     *
     * // in a module
     * var hello = function(name, callback) {
     *     setTimeout(function() {
     *         callback(null, {hello: name});
     *     }, 1000);
     * };
     *
     * // in the node repl
     * node> async.dir(hello, 'world');
     * {hello: 'world'}
     */var dir=consoleFunc('dir');/**
     * The post-check version of [`during`]{@link module:ControlFlow.during}. To reflect the difference in
     * the order of operations, the arguments `test` and `fn` are switched.
     *
     * Also a version of [`doWhilst`]{@link module:ControlFlow.doWhilst} with asynchronous `test` function.
     * @name doDuring
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @see [async.during]{@link module:ControlFlow.during}
     * @category Control Flow
     * @param {Function} fn - A function which is called each time `test` passes.
     * The function is passed a `callback(err)`, which must be called once it has
     * completed with an optional `err` argument. Invoked with (callback).
     * @param {Function} test - asynchronous truth test to perform before each
     * execution of `fn`. Invoked with (...args, callback), where `...args` are the
     * non-error args from the previous callback of `fn`.
     * @param {Function} [callback] - A callback which is called after the test
     * function has failed and repeated execution of `fn` has stopped. `callback`
     * will be passed an error if one occured, otherwise `null`.
     */function doDuring(fn,test,callback){callback=onlyOnce(callback||noop);var next=rest(function(err,args){if(err)return callback(err);args.push(check);test.apply(this,args);});function check(err,truth){if(err)return callback(err);if(!truth)return callback(null);fn(next);}check(null,true);}/**
     * The post-check version of [`whilst`]{@link module:ControlFlow.whilst}. To reflect the difference in
     * the order of operations, the arguments `test` and `iteratee` are switched.
     *
     * `doWhilst` is to `whilst` as `do while` is to `while` in plain JavaScript.
     *
     * @name doWhilst
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @see [async.whilst]{@link module:ControlFlow.whilst}
     * @category Control Flow
     * @param {Function} iteratee - A function which is called each time `test`
     * passes. The function is passed a `callback(err)`, which must be called once
     * it has completed with an optional `err` argument. Invoked with (callback).
     * @param {Function} test - synchronous truth test to perform after each
     * execution of `iteratee`. Invoked with Invoked with the non-error callback
     * results of `iteratee`.
     * @param {Function} [callback] - A callback which is called after the test
     * function has failed and repeated execution of `iteratee` has stopped.
     * `callback` will be passed an error and any arguments passed to the final
     * `iteratee`'s callback. Invoked with (err, [results]);
     */function doWhilst(iteratee,test,callback){callback=onlyOnce(callback||noop);var next=rest(function(err,args){if(err)return callback(err);if(test.apply(this,args))return iteratee(next);callback.apply(null,[null].concat(args));});iteratee(next);}/**
     * Like ['doWhilst']{@link module:ControlFlow.doWhilst}, except the `test` is inverted. Note the
     * argument ordering differs from `until`.
     *
     * @name doUntil
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @see [async.doWhilst]{@link module:ControlFlow.doWhilst}
     * @category Control Flow
     * @param {Function} fn - A function which is called each time `test` fails.
     * The function is passed a `callback(err)`, which must be called once it has
     * completed with an optional `err` argument. Invoked with (callback).
     * @param {Function} test - synchronous truth test to perform after each
     * execution of `fn`. Invoked with the non-error callback results of `fn`.
     * @param {Function} [callback] - A callback which is called after the test
     * function has passed and repeated execution of `fn` has stopped. `callback`
     * will be passed an error and any arguments passed to the final `fn`'s
     * callback. Invoked with (err, [results]);
     */function doUntil(fn,test,callback){doWhilst(fn,function(){return!test.apply(this,arguments);},callback);}/**
     * Like [`whilst`]{@link module:ControlFlow.whilst}, except the `test` is an asynchronous function that
     * is passed a callback in the form of `function (err, truth)`. If error is
     * passed to `test` or `fn`, the main callback is immediately called with the
     * value of the error.
     *
     * @name during
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @see [async.whilst]{@link module:ControlFlow.whilst}
     * @category Control Flow
     * @param {Function} test - asynchronous truth test to perform before each
     * execution of `fn`. Invoked with (callback).
     * @param {Function} fn - A function which is called each time `test` passes.
     * The function is passed a `callback(err)`, which must be called once it has
     * completed with an optional `err` argument. Invoked with (callback).
     * @param {Function} [callback] - A callback which is called after the test
     * function has failed and repeated execution of `fn` has stopped. `callback`
     * will be passed an error, if one occured, otherwise `null`.
     * @example
     *
     * var count = 0;
     *
     * async.during(
     *     function (callback) {
     *         return callback(null, count < 5);
     *     },
     *     function (callback) {
     *         count++;
     *         setTimeout(callback, 1000);
     *     },
     *     function (err) {
     *         // 5 seconds have passed
     *     }
     * );
     */function during(test,fn,callback){callback=onlyOnce(callback||noop);function next(err){if(err)return callback(err);test(check);}function check(err,truth){if(err)return callback(err);if(!truth)return callback(null);fn(next);}test(check);}function _withoutIndex(iteratee){return function(value,index,callback){return iteratee(value,callback);};}/**
     * Applies the function `iteratee` to each item in `coll`, in parallel.
     * The `iteratee` is called with an item from the list, and a callback for when
     * it has finished. If the `iteratee` passes an error to its `callback`, the
     * main `callback` (for the `each` function) is immediately called with the
     * error.
     *
     * Note, that since this function applies `iteratee` to each item in parallel,
     * there is no guarantee that the iteratee functions will complete in order.
     *
     * @name each
     * @static
     * @memberOf module:Collections
     * @method
     * @alias forEach
     * @category Collection
     * @param {Array|Iterable|Object} coll - A collection to iterate over.
     * @param {Function} iteratee - A function to apply to each item
     * in `coll`. The iteratee is passed a `callback(err)` which must be called once
     * it has completed. If no error has occurred, the `callback` should be run
     * without arguments or with an explicit `null` argument. The array index is not
     * passed to the iteratee. Invoked with (item, callback). If you need the index,
     * use `eachOf`.
     * @param {Function} [callback] - A callback which is called when all
     * `iteratee` functions have finished, or an error occurs. Invoked with (err).
     * @example
     *
     * // assuming openFiles is an array of file names and saveFile is a function
     * // to save the modified contents of that file:
     *
     * async.each(openFiles, saveFile, function(err){
     *   // if any of the saves produced an error, err would equal that error
     * });
     *
     * // assuming openFiles is an array of file names
     * async.each(openFiles, function(file, callback) {
     *
     *     // Perform operation on file here.
     *     console.log('Processing file ' + file);
     *
     *     if( file.length > 32 ) {
     *       console.log('This file name is too long');
     *       callback('File name too long');
     *     } else {
     *       // Do work to process file here
     *       console.log('File processed');
     *       callback();
     *     }
     * }, function(err) {
     *     // if any of the file processing produced an error, err would equal that error
     *     if( err ) {
     *       // One of the iterations produced an error.
     *       // All processing will now stop.
     *       console.log('A file failed to process');
     *     } else {
     *       console.log('All files have been processed successfully');
     *     }
     * });
     */function eachLimit(coll,iteratee,callback){eachOf(coll,_withoutIndex(iteratee),callback);}/**
     * The same as [`each`]{@link module:Collections.each} but runs a maximum of `limit` async operations at a time.
     *
     * @name eachLimit
     * @static
     * @memberOf module:Collections
     * @method
     * @see [async.each]{@link module:Collections.each}
     * @alias forEachLimit
     * @category Collection
     * @param {Array|Iterable|Object} coll - A colleciton to iterate over.
     * @param {number} limit - The maximum number of async operations at a time.
     * @param {Function} iteratee - A function to apply to each item in `coll`. The
     * iteratee is passed a `callback(err)` which must be called once it has
     * completed. If no error has occurred, the `callback` should be run without
     * arguments or with an explicit `null` argument. The array index is not passed
     * to the iteratee. Invoked with (item, callback). If you need the index, use
     * `eachOfLimit`.
     * @param {Function} [callback] - A callback which is called when all
     * `iteratee` functions have finished, or an error occurs. Invoked with (err).
     */function eachLimit$1(coll,limit,iteratee,callback){_eachOfLimit(limit)(coll,_withoutIndex(iteratee),callback);}/**
     * The same as [`each`]{@link module:Collections.each} but runs only a single async operation at a time.
     *
     * @name eachSeries
     * @static
     * @memberOf module:Collections
     * @method
     * @see [async.each]{@link module:Collections.each}
     * @alias forEachSeries
     * @category Collection
     * @param {Array|Iterable|Object} coll - A collection to iterate over.
     * @param {Function} iteratee - A function to apply to each
     * item in `coll`. The iteratee is passed a `callback(err)` which must be called
     * once it has completed. If no error has occurred, the `callback` should be run
     * without arguments or with an explicit `null` argument. The array index is
     * not passed to the iteratee. Invoked with (item, callback). If you need the
     * index, use `eachOfSeries`.
     * @param {Function} [callback] - A callback which is called when all
     * `iteratee` functions have finished, or an error occurs. Invoked with (err).
     */var eachSeries=doLimit(eachLimit$1,1);/**
     * Wrap an async function and ensure it calls its callback on a later tick of
     * the event loop.  If the function already calls its callback on a next tick,
     * no extra deferral is added. This is useful for preventing stack overflows
     * (`RangeError: Maximum call stack size exceeded`) and generally keeping
     * [Zalgo](http://blog.izs.me/post/59142742143/designing-apis-for-asynchrony)
     * contained.
     *
     * @name ensureAsync
     * @static
     * @memberOf module:Utils
     * @method
     * @category Util
     * @param {Function} fn - an async function, one that expects a node-style
     * callback as its last argument.
     * @returns {Function} Returns a wrapped function with the exact same call
     * signature as the function passed in.
     * @example
     *
     * function sometimesAsync(arg, callback) {
     *     if (cache[arg]) {
     *         return callback(null, cache[arg]); // this would be synchronous!!
     *     } else {
     *         doSomeIO(arg, callback); // this IO would be asynchronous
     *     }
     * }
     *
     * // this has a risk of stack overflows if many results are cached in a row
     * async.mapSeries(args, sometimesAsync, done);
     *
     * // this will defer sometimesAsync's callback if necessary,
     * // preventing stack overflows
     * async.mapSeries(args, async.ensureAsync(sometimesAsync), done);
     */function ensureAsync(fn){return initialParams(function(args,callback){var sync=true;args.push(function(){var innerArgs=arguments;if(sync){setImmediate$1(function(){callback.apply(null,innerArgs);});}else{callback.apply(null,innerArgs);}});fn.apply(this,args);sync=false;});}function notId(v){return!v;}/**
     * Returns `true` if every element in `coll` satisfies an async test. If any
     * iteratee call returns `false`, the main `callback` is immediately called.
     *
     * @name every
     * @static
     * @memberOf module:Collections
     * @method
     * @alias all
     * @category Collection
     * @param {Array|Iterable|Object} coll - A collection to iterate over.
     * @param {Function} iteratee - A truth test to apply to each item in the
     * collection in parallel. The iteratee is passed a `callback(err, truthValue)`
     * which must be called with a  boolean argument once it has completed. Invoked
     * with (item, callback).
     * @param {Function} [callback] - A callback which is called after all the
     * `iteratee` functions have finished. Result will be either `true` or `false`
     * depending on the values of the async tests. Invoked with (err, result).
     * @example
     *
     * async.every(['file1','file2','file3'], function(filePath, callback) {
     *     fs.access(filePath, function(err) {
     *         callback(null, !err)
     *     });
     * }, function(err, result) {
     *     // if result is true then every file exists
     * });
     */var every=_createTester(eachOf,notId,notId);/**
     * The same as [`every`]{@link module:Collections.every} but runs a maximum of `limit` async operations at a time.
     *
     * @name everyLimit
     * @static
     * @memberOf module:Collections
     * @method
     * @see [async.every]{@link module:Collections.every}
     * @alias allLimit
     * @category Collection
     * @param {Array|Iterable|Object} coll - A collection to iterate over.
     * @param {number} limit - The maximum number of async operations at a time.
     * @param {Function} iteratee - A truth test to apply to each item in the
     * collection in parallel. The iteratee is passed a `callback(err, truthValue)`
     * which must be called with a  boolean argument once it has completed. Invoked
     * with (item, callback).
     * @param {Function} [callback] - A callback which is called after all the
     * `iteratee` functions have finished. Result will be either `true` or `false`
     * depending on the values of the async tests. Invoked with (err, result).
     */var everyLimit=_createTester(eachOfLimit,notId,notId);/**
     * The same as [`every`]{@link module:Collections.every} but runs only a single async operation at a time.
     *
     * @name everySeries
     * @static
     * @memberOf module:Collections
     * @method
     * @see [async.every]{@link module:Collections.every}
     * @alias allSeries
     * @category Collection
     * @param {Array|Iterable|Object} coll - A collection to iterate over.
     * @param {Function} iteratee - A truth test to apply to each item in the
     * collection in parallel. The iteratee is passed a `callback(err, truthValue)`
     * which must be called with a  boolean argument once it has completed. Invoked
     * with (item, callback).
     * @param {Function} [callback] - A callback which is called after all the
     * `iteratee` functions have finished. Result will be either `true` or `false`
     * depending on the values of the async tests. Invoked with (err, result).
     */var everySeries=doLimit(everyLimit,1);function _filter(eachfn,arr,iteratee,callback){callback=once(callback||noop);var results=[];eachfn(arr,function(x,index,callback){iteratee(x,function(err,v){if(err){callback(err);}else{if(v){results.push({index:index,value:x});}callback();}});},function(err){if(err){callback(err);}else{callback(null,arrayMap(results.sort(function(a,b){return a.index-b.index;}),baseProperty('value')));}});}/**
     * Returns a new array of all the values in `coll` which pass an async truth
     * test. This operation is performed in parallel, but the results array will be
     * in the same order as the original.
     *
     * @name filter
     * @static
     * @memberOf module:Collections
     * @method
     * @alias select
     * @category Collection
     * @param {Array|Iterable|Object} coll - A collection to iterate over.
     * @param {Function} iteratee - A truth test to apply to each item in `coll`.
     * The `iteratee` is passed a `callback(err, truthValue)`, which must be called
     * with a boolean argument once it has completed. Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called after all the
     * `iteratee` functions have finished. Invoked with (err, results).
     * @example
     *
     * async.filter(['file1','file2','file3'], function(filePath, callback) {
     *     fs.access(filePath, function(err) {
     *         callback(null, !err)
     *     });
     * }, function(err, results) {
     *     // results now equals an array of the existing files
     * });
     */var filter=doParallel(_filter);/**
     * The same as [`filter`]{@link module:Collections.filter} but runs a maximum of `limit` async operations at a
     * time.
     *
     * @name filterLimit
     * @static
     * @memberOf module:Collections
     * @method
     * @see [async.filter]{@link module:Collections.filter}
     * @alias selectLimit
     * @category Collection
     * @param {Array|Iterable|Object} coll - A collection to iterate over.
     * @param {number} limit - The maximum number of async operations at a time.
     * @param {Function} iteratee - A truth test to apply to each item in `coll`.
     * The `iteratee` is passed a `callback(err, truthValue)`, which must be called
     * with a boolean argument once it has completed. Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called after all the
     * `iteratee` functions have finished. Invoked with (err, results).
     */var filterLimit=doParallelLimit(_filter);/**
     * The same as [`filter`]{@link module:Collections.filter} but runs only a single async operation at a time.
     *
     * @name filterSeries
     * @static
     * @memberOf module:Collections
     * @method
     * @see [async.filter]{@link module:Collections.filter}
     * @alias selectSeries
     * @category Collection
     * @param {Array|Iterable|Object} coll - A collection to iterate over.
     * @param {Function} iteratee - A truth test to apply to each item in `coll`.
     * The `iteratee` is passed a `callback(err, truthValue)`, which must be called
     * with a boolean argument once it has completed. Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called after all the
     * `iteratee` functions have finished. Invoked with (err, results)
     */var filterSeries=doLimit(filterLimit,1);/**
     * Calls the asynchronous function `fn` with a callback parameter that allows it
     * to call itself again, in series, indefinitely.

     * If an error is passed to the
     * callback then `errback` is called with the error, and execution stops,
     * otherwise it will never be called.
     *
     * @name forever
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @category Control Flow
     * @param {Function} fn - a function to call repeatedly. Invoked with (next).
     * @param {Function} [errback] - when `fn` passes an error to it's callback,
     * this function will be called, and execution stops. Invoked with (err).
     * @example
     *
     * async.forever(
     *     function(next) {
     *         // next is suitable for passing to things that need a callback(err [, whatever]);
     *         // it will result in this function being called again.
     *     },
     *     function(err) {
     *         // if next is called with a value in its first parameter, it will appear
     *         // in here as 'err', and execution will stop.
     *     }
     * );
     */function forever(fn,errback){var done=onlyOnce(errback||noop);var task=ensureAsync(fn);function next(err){if(err)return done(err);task(next);}next();}/**
     * Logs the result of an `async` function to the `console`. Only works in
     * Node.js or in browsers that support `console.log` and `console.error` (such
     * as FF and Chrome). If multiple arguments are returned from the async
     * function, `console.log` is called on each argument in order.
     *
     * @name log
     * @static
     * @memberOf module:Utils
     * @method
     * @category Util
     * @param {Function} function - The function you want to eventually apply all
     * arguments to.
     * @param {...*} arguments... - Any number of arguments to apply to the function.
     * @example
     *
     * // in a module
     * var hello = function(name, callback) {
     *     setTimeout(function() {
     *         callback(null, 'hello ' + name);
     *     }, 1000);
     * };
     *
     * // in the node repl
     * node> async.log(hello, 'world');
     * 'hello world'
     */var log=consoleFunc('log');/**
     * The same as [`mapValues`]{@link module:Collections.mapValues} but runs a maximum of `limit` async operations at a
     * time.
     *
     * @name mapValuesLimit
     * @static
     * @memberOf module:Collections
     * @method
     * @see [async.mapValues]{@link module:Collections.mapValues}
     * @category Collection
     * @param {Object} obj - A collection to iterate over.
     * @param {number} limit - The maximum number of async operations at a time.
     * @param {Function} iteratee - A function to apply to each value in `obj`.
     * The iteratee is passed a `callback(err, transformed)` which must be called
     * once it has completed with an error (which can be `null`) and a
     * transformed value. Invoked with (value, key, callback).
     * @param {Function} [callback] - A callback which is called when all `iteratee`
     * functions have finished, or an error occurs. Result is an object of the
     * transformed values from the `obj`. Invoked with (err, result).
     */function mapValuesLimit(obj,limit,iteratee,callback){callback=once(callback||noop);var newObj={};eachOfLimit(obj,limit,function(val,key,next){iteratee(val,key,function(err,result){if(err)return next(err);newObj[key]=result;next();});},function(err){callback(err,newObj);});}/**
     * A relative of [`map`]{@link module:Collections.map}, designed for use with objects.
     *
     * Produces a new Object by mapping each value of `obj` through the `iteratee`
     * function. The `iteratee` is called each `value` and `key` from `obj` and a
     * callback for when it has finished processing. Each of these callbacks takes
     * two arguments: an `error`, and the transformed item from `obj`. If `iteratee`
     * passes an error to its callback, the main `callback` (for the `mapValues`
     * function) is immediately called with the error.
     *
     * Note, the order of the keys in the result is not guaranteed.  The keys will
     * be roughly in the order they complete, (but this is very engine-specific)
     *
     * @name mapValues
     * @static
     * @memberOf module:Collections
     * @method
     * @category Collection
     * @param {Object} obj - A collection to iterate over.
     * @param {Function} iteratee - A function to apply to each value and key in
     * `coll`. The iteratee is passed a `callback(err, transformed)` which must be
     * called once it has completed with an error (which can be `null`) and a
     * transformed value. Invoked with (value, key, callback).
     * @param {Function} [callback] - A callback which is called when all `iteratee`
     * functions have finished, or an error occurs. Results is an array of the
     * transformed items from the `obj`. Invoked with (err, result).
     * @example
     *
     * async.mapValues({
     *     f1: 'file1',
     *     f2: 'file2',
     *     f3: 'file3'
     * }, function (file, key, callback) {
     *   fs.stat(file, callback);
     * }, function(err, result) {
     *     // results is now a map of stats for each file, e.g.
     *     // {
     *     //     f1: [stats for file1],
     *     //     f2: [stats for file2],
     *     //     f3: [stats for file3]
     *     // }
     * });
     */var mapValues=doLimit(mapValuesLimit,Infinity);/**
     * The same as [`mapValues`]{@link module:Collections.mapValues} but runs only a single async operation at a time.
     *
     * @name mapValuesSeries
     * @static
     * @memberOf module:Collections
     * @method
     * @see [async.mapValues]{@link module:Collections.mapValues}
     * @category Collection
     * @param {Object} obj - A collection to iterate over.
     * @param {Function} iteratee - A function to apply to each value in `obj`.
     * The iteratee is passed a `callback(err, transformed)` which must be called
     * once it has completed with an error (which can be `null`) and a
     * transformed value. Invoked with (value, key, callback).
     * @param {Function} [callback] - A callback which is called when all `iteratee`
     * functions have finished, or an error occurs. Result is an object of the
     * transformed values from the `obj`. Invoked with (err, result).
     */var mapValuesSeries=doLimit(mapValuesLimit,1);function has(obj,key){return key in obj;}/**
     * Caches the results of an `async` function. When creating a hash to store
     * function results against, the callback is omitted from the hash and an
     * optional hash function can be used.
     *
     * If no hash function is specified, the first argument is used as a hash key,
     * which may work reasonably if it is a string or a data type that converts to a
     * distinct string. Note that objects and arrays will not behave reasonably.
     * Neither will cases where the other arguments are significant. In such cases,
     * specify your own hash function.
     *
     * The cache of results is exposed as the `memo` property of the function
     * returned by `memoize`.
     *
     * @name memoize
     * @static
     * @memberOf module:Utils
     * @method
     * @category Util
     * @param {Function} fn - The function to proxy and cache results from.
     * @param {Function} hasher - An optional function for generating a custom hash
     * for storing results. It has all the arguments applied to it apart from the
     * callback, and must be synchronous.
     * @returns {Function} a memoized version of `fn`
     * @example
     *
     * var slow_fn = function(name, callback) {
     *     // do something
     *     callback(null, result);
     * };
     * var fn = async.memoize(slow_fn);
     *
     * // fn can now be used as if it were slow_fn
     * fn('some name', function() {
     *     // callback
     * });
     */function memoize(fn,hasher){var memo=Object.create(null);var queues=Object.create(null);hasher=hasher||identity;var memoized=initialParams(function memoized(args,callback){var key=hasher.apply(null,args);if(has(memo,key)){setImmediate$1(function(){callback.apply(null,memo[key]);});}else if(has(queues,key)){queues[key].push(callback);}else{queues[key]=[callback];fn.apply(null,args.concat([rest(function(args){memo[key]=args;var q=queues[key];delete queues[key];for(var i=0,l=q.length;i<l;i++){q[i].apply(null,args);}})]));}});memoized.memo=memo;memoized.unmemoized=fn;return memoized;}/**
     * Calls `callback` on a later loop around the event loop. In Node.js this just
     * calls `setImmediate`.  In the browser it will use `setImmediate` if
     * available, otherwise `setTimeout(callback, 0)`, which means other higher
     * priority events may precede the execution of `callback`.
     *
     * This is used internally for browser-compatibility purposes.
     *
     * @name nextTick
     * @static
     * @memberOf module:Utils
     * @method
     * @alias setImmediate
     * @category Util
     * @param {Function} callback - The function to call on a later loop around
     * the event loop. Invoked with (args...).
     * @param {...*} args... - any number of additional arguments to pass to the
     * callback on the next tick.
     * @example
     *
     * var call_order = [];
     * async.nextTick(function() {
     *     call_order.push('two');
     *     // call_order now equals ['one','two']
     * });
     * call_order.push('one');
     *
     * async.setImmediate(function (a, b, c) {
     *     // a, b, and c equal 1, 2, and 3
     * }, 1, 2, 3);
     */var _defer$1;if(hasNextTick){_defer$1=process.nextTick;}else if(hasSetImmediate){_defer$1=setImmediate;}else{_defer$1=fallback;}var nextTick=wrap(_defer$1);function _parallel(eachfn,tasks,callback){callback=callback||noop;var results=isArrayLike(tasks)?[]:{};eachfn(tasks,function(task,key,callback){task(rest(function(err,args){if(args.length<=1){args=args[0];}results[key]=args;callback(err);}));},function(err){callback(err,results);});}/**
     * Run the `tasks` collection of functions in parallel, without waiting until
     * the previous function has completed. If any of the functions pass an error to
     * its callback, the main `callback` is immediately called with the value of the
     * error. Once the `tasks` have completed, the results are passed to the final
     * `callback` as an array.
     *
     * **Note:** `parallel` is about kicking-off I/O tasks in parallel, not about
     * parallel execution of code.  If your tasks do not use any timers or perform
     * any I/O, they will actually be executed in series.  Any synchronous setup
     * sections for each task will happen one after the other.  JavaScript remains
     * single-threaded.
     *
     * It is also possible to use an object instead of an array. Each property will
     * be run as a function and the results will be passed to the final `callback`
     * as an object instead of an array. This can be a more readable way of handling
     * results from {@link async.parallel}.
     *
     * @name parallel
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @category Control Flow
     * @param {Array|Iterable|Object} tasks - A collection containing functions to run.
     * Each function is passed a `callback(err, result)` which it must call on
     * completion with an error `err` (which can be `null`) and an optional `result`
     * value.
     * @param {Function} [callback] - An optional callback to run once all the
     * functions have completed successfully. This function gets a results array
     * (or object) containing all the result arguments passed to the task callbacks.
     * Invoked with (err, results).
     * @example
     * async.parallel([
     *     function(callback) {
     *         setTimeout(function() {
     *             callback(null, 'one');
     *         }, 200);
     *     },
     *     function(callback) {
     *         setTimeout(function() {
     *             callback(null, 'two');
     *         }, 100);
     *     }
     * ],
     * // optional callback
     * function(err, results) {
     *     // the results array will equal ['one','two'] even though
     *     // the second function had a shorter timeout.
     * });
     *
     * // an example using an object instead of an array
     * async.parallel({
     *     one: function(callback) {
     *         setTimeout(function() {
     *             callback(null, 1);
     *         }, 200);
     *     },
     *     two: function(callback) {
     *         setTimeout(function() {
     *             callback(null, 2);
     *         }, 100);
     *     }
     * }, function(err, results) {
     *     // results is now equals to: {one: 1, two: 2}
     * });
     */function parallelLimit(tasks,callback){_parallel(eachOf,tasks,callback);}/**
     * The same as [`parallel`]{@link module:ControlFlow.parallel} but runs a maximum of `limit` async operations at a
     * time.
     *
     * @name parallelLimit
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @see [async.parallel]{@link module:ControlFlow.parallel}
     * @category Control Flow
     * @param {Array|Collection} tasks - A collection containing functions to run.
     * Each function is passed a `callback(err, result)` which it must call on
     * completion with an error `err` (which can be `null`) and an optional `result`
     * value.
     * @param {number} limit - The maximum number of async operations at a time.
     * @param {Function} [callback] - An optional callback to run once all the
     * functions have completed successfully. This function gets a results array
     * (or object) containing all the result arguments passed to the task callbacks.
     * Invoked with (err, results).
     */function parallelLimit$1(tasks,limit,callback){_parallel(_eachOfLimit(limit),tasks,callback);}/**
     * A queue of tasks for the worker function to complete.
     * @typedef {Object} QueueObject
     * @memberOf module:ControlFlow
     * @property {Function} length - a function returning the number of items
     * waiting to be processed. Invoke with `queue.length()`.
     * @property {boolean} started - a boolean indicating whether or not any
     * items have been pushed and processed by the queue.
     * @property {Function} running - a function returning the number of items
     * currently being processed. Invoke with `queue.running()`.
     * @property {Function} workersList - a function returning the array of items
     * currently being processed. Invoke with `queue.workersList()`.
     * @property {Function} idle - a function returning false if there are items
     * waiting or being processed, or true if not. Invoke with `queue.idle()`.
     * @property {number} concurrency - an integer for determining how many `worker`
     * functions should be run in parallel. This property can be changed after a
     * `queue` is created to alter the concurrency on-the-fly.
     * @property {Function} push - add a new task to the `queue`. Calls `callback`
     * once the `worker` has finished processing the task. Instead of a single task,
     * a `tasks` array can be submitted. The respective callback is used for every
     * task in the list. Invoke with `queue.push(task, [callback])`,
     * @property {Function} unshift - add a new task to the front of the `queue`.
     * Invoke with `queue.unshift(task, [callback])`.
     * @property {Function} saturated - a callback that is called when the number of
     * running workers hits the `concurrency` limit, and further tasks will be
     * queued.
     * @property {Function} unsaturated - a callback that is called when the number
     * of running workers is less than the `concurrency` & `buffer` limits, and
     * further tasks will not be queued.
     * @property {number} buffer - A minimum threshold buffer in order to say that
     * the `queue` is `unsaturated`.
     * @property {Function} empty - a callback that is called when the last item
     * from the `queue` is given to a `worker`.
     * @property {Function} drain - a callback that is called when the last item
     * from the `queue` has returned from the `worker`.
     * @property {Function} error - a callback that is called when a task errors.
     * Has the signature `function(error, task)`.
     * @property {boolean} paused - a boolean for determining whether the queue is
     * in a paused state.
     * @property {Function} pause - a function that pauses the processing of tasks
     * until `resume()` is called. Invoke with `queue.pause()`.
     * @property {Function} resume - a function that resumes the processing of
     * queued tasks when the queue is paused. Invoke with `queue.resume()`.
     * @property {Function} kill - a function that removes the `drain` callback and
     * empties remaining tasks from the queue forcing it to go idle. Invoke with `queue.kill()`.
     *//**
     * Creates a `queue` object with the specified `concurrency`. Tasks added to the
     * `queue` are processed in parallel (up to the `concurrency` limit). If all
     * `worker`s are in progress, the task is queued until one becomes available.
     * Once a `worker` completes a `task`, that `task`'s callback is called.
     *
     * @name queue
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @category Control Flow
     * @param {Function} worker - An asynchronous function for processing a queued
     * task, which must call its `callback(err)` argument when finished, with an
     * optional `error` as an argument.  If you want to handle errors from an
     * individual task, pass a callback to `q.push()`. Invoked with
     * (task, callback).
     * @param {number} [concurrency=1] - An `integer` for determining how many
     * `worker` functions should be run in parallel.  If omitted, the concurrency
     * defaults to `1`.  If the concurrency is `0`, an error is thrown.
     * @returns {module:ControlFlow.QueueObject} A queue object to manage the tasks. Callbacks can
     * attached as certain properties to listen for specific events during the
     * lifecycle of the queue.
     * @example
     *
     * // create a queue object with concurrency 2
     * var q = async.queue(function(task, callback) {
     *     console.log('hello ' + task.name);
     *     callback();
     * }, 2);
     *
     * // assign a callback
     * q.drain = function() {
     *     console.log('all items have been processed');
     * };
     *
     * // add some items to the queue
     * q.push({name: 'foo'}, function(err) {
     *     console.log('finished processing foo');
     * });
     * q.push({name: 'bar'}, function (err) {
     *     console.log('finished processing bar');
     * });
     *
     * // add some items to the queue (batch-wise)
     * q.push([{name: 'baz'},{name: 'bay'},{name: 'bax'}], function(err) {
     *     console.log('finished processing item');
     * });
     *
     * // add some items to the front of the queue
     * q.unshift({name: 'bar'}, function (err) {
     *     console.log('finished processing bar');
     * });
     */function queue$1(worker,concurrency){return queue(function(items,cb){worker(items[0],cb);},concurrency,1);}/**
     * The same as [async.queue]{@link module:ControlFlow.queue} only tasks are assigned a priority and
     * completed in ascending priority order.
     *
     * @name priorityQueue
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @see [async.queue]{@link module:ControlFlow.queue}
     * @category Control Flow
     * @param {Function} worker - An asynchronous function for processing a queued
     * task, which must call its `callback(err)` argument when finished, with an
     * optional `error` as an argument.  If you want to handle errors from an
     * individual task, pass a callback to `q.push()`. Invoked with
     * (task, callback).
     * @param {number} concurrency - An `integer` for determining how many `worker`
     * functions should be run in parallel.  If omitted, the concurrency defaults to
     * `1`.  If the concurrency is `0`, an error is thrown.
     * @returns {module:ControlFlow.QueueObject} A priorityQueue object to manage the tasks. There are two
     * differences between `queue` and `priorityQueue` objects:
     * * `push(task, priority, [callback])` - `priority` should be a number. If an
     *   array of `tasks` is given, all tasks will be assigned the same priority.
     * * The `unshift` method was removed.
     */function priorityQueue(worker,concurrency){// Start with a normal queue
var q=queue$1(worker,concurrency);// Override push to accept second parameter representing priority
q.push=function(data,priority,callback){if(callback==null)callback=noop;if(typeof callback!=='function'){throw new Error('task callback must be a function');}q.started=true;if(!isArray(data)){data=[data];}if(data.length===0){// call drain immediately if there are no tasks
return setImmediate$1(function(){q.drain();});}priority=priority||0;var nextNode=q._tasks.head;while(nextNode&&priority>=nextNode.priority){nextNode=nextNode.next;}arrayEach(data,function(task){var item={data:task,priority:priority,callback:callback};if(nextNode){q._tasks.insertBefore(nextNode,item);}else{q._tasks.push(item);}});setImmediate$1(q.process);};// Remove unshift function
delete q.unshift;return q;}/**
     * Runs the `tasks` array of functions in parallel, without waiting until the
     * previous function has completed. Once any the `tasks` completed or pass an
     * error to its callback, the main `callback` is immediately called. It's
     * equivalent to `Promise.race()`.
     *
     * @name race
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @category Control Flow
     * @param {Array} tasks - An array containing functions to run. Each function
     * is passed a `callback(err, result)` which it must call on completion with an
     * error `err` (which can be `null`) and an optional `result` value.
     * @param {Function} callback - A callback to run once any of the functions have
     * completed. This function gets an error or result from the first function that
     * completed. Invoked with (err, result).
     * @returns undefined
     * @example
     *
     * async.race([
     *     function(callback) {
     *         setTimeout(function() {
     *             callback(null, 'one');
     *         }, 200);
     *     },
     *     function(callback) {
     *         setTimeout(function() {
     *             callback(null, 'two');
     *         }, 100);
     *     }
     * ],
     * // main callback
     * function(err, result) {
     *     // the result will be equal to 'two' as it finishes earlier
     * });
     */function race(tasks,callback){callback=once(callback||noop);if(!isArray(tasks))return callback(new TypeError('First argument to race must be an array of functions'));if(!tasks.length)return callback();arrayEach(tasks,function(task){task(callback);});}var slice=Array.prototype.slice;/**
     * Same as [`reduce`]{@link module:Collections.reduce}, only operates on `array` in reverse order.
     *
     * @name reduceRight
     * @static
     * @memberOf module:Collections
     * @method
     * @see [async.reduce]{@link module:Collections.reduce}
     * @alias foldr
     * @category Collection
     * @param {Array} array - A collection to iterate over.
     * @param {*} memo - The initial state of the reduction.
     * @param {Function} iteratee - A function applied to each item in the
     * array to produce the next step in the reduction. The `iteratee` is passed a
     * `callback(err, reduction)` which accepts an optional error as its first
     * argument, and the state of the reduction as the second. If an error is
     * passed to the callback, the reduction is stopped and the main `callback` is
     * immediately called with the error. Invoked with (memo, item, callback).
     * @param {Function} [callback] - A callback which is called after all the
     * `iteratee` functions have finished. Result is the reduced value. Invoked with
     * (err, result).
     */function reduceRight(array,memo,iteratee,callback){var reversed=slice.call(array).reverse();reduce(reversed,memo,iteratee,callback);}/**
     * Wraps the function in another function that always returns data even when it
     * errors.
     *
     * The object returned has either the property `error` or `value`.
     *
     * @name reflect
     * @static
     * @memberOf module:Utils
     * @method
     * @category Util
     * @param {Function} fn - The function you want to wrap
     * @returns {Function} - A function that always passes null to it's callback as
     * the error. The second argument to the callback will be an `object` with
     * either an `error` or a `value` property.
     * @example
     *
     * async.parallel([
     *     async.reflect(function(callback) {
     *         // do some stuff ...
     *         callback(null, 'one');
     *     }),
     *     async.reflect(function(callback) {
     *         // do some more stuff but error ...
     *         callback('bad stuff happened');
     *     }),
     *     async.reflect(function(callback) {
     *         // do some more stuff ...
     *         callback(null, 'two');
     *     })
     * ],
     * // optional callback
     * function(err, results) {
     *     // values
     *     // results[0].value = 'one'
     *     // results[1].error = 'bad stuff happened'
     *     // results[2].value = 'two'
     * });
     */function reflect(fn){return initialParams(function reflectOn(args,reflectCallback){args.push(rest(function callback(err,cbArgs){if(err){reflectCallback(null,{error:err});}else{var value=null;if(cbArgs.length===1){value=cbArgs[0];}else if(cbArgs.length>1){value=cbArgs;}reflectCallback(null,{value:value});}}));return fn.apply(this,args);});}function reject$1(eachfn,arr,iteratee,callback){_filter(eachfn,arr,function(value,cb){iteratee(value,function(err,v){if(err){cb(err);}else{cb(null,!v);}});},callback);}/**
     * The opposite of [`filter`]{@link module:Collections.filter}. Removes values that pass an `async` truth test.
     *
     * @name reject
     * @static
     * @memberOf module:Collections
     * @method
     * @see [async.filter]{@link module:Collections.filter}
     * @category Collection
     * @param {Array|Iterable|Object} coll - A collection to iterate over.
     * @param {Function} iteratee - A truth test to apply to each item in `coll`.
     * The `iteratee` is passed a `callback(err, truthValue)`, which must be called
     * with a boolean argument once it has completed. Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called after all the
     * `iteratee` functions have finished. Invoked with (err, results).
     * @example
     *
     * async.reject(['file1','file2','file3'], function(filePath, callback) {
     *     fs.access(filePath, function(err) {
     *         callback(null, !err)
     *     });
     * }, function(err, results) {
     *     // results now equals an array of missing files
     *     createFiles(results);
     * });
     */var reject=doParallel(reject$1);/**
     * A helper function that wraps an array or an object of functions with reflect.
     *
     * @name reflectAll
     * @static
     * @memberOf module:Utils
     * @method
     * @see [async.reflect]{@link module:Utils.reflect}
     * @category Util
     * @param {Array} tasks - The array of functions to wrap in `async.reflect`.
     * @returns {Array} Returns an array of functions, each function wrapped in
     * `async.reflect`
     * @example
     *
     * let tasks = [
     *     function(callback) {
     *         setTimeout(function() {
     *             callback(null, 'one');
     *         }, 200);
     *     },
     *     function(callback) {
     *         // do some more stuff but error ...
     *         callback(new Error('bad stuff happened'));
     *     },
     *     function(callback) {
     *         setTimeout(function() {
     *             callback(null, 'two');
     *         }, 100);
     *     }
     * ];
     *
     * async.parallel(async.reflectAll(tasks),
     * // optional callback
     * function(err, results) {
     *     // values
     *     // results[0].value = 'one'
     *     // results[1].error = Error('bad stuff happened')
     *     // results[2].value = 'two'
     * });
     *
     * // an example using an object instead of an array
     * let tasks = {
     *     one: function(callback) {
     *         setTimeout(function() {
     *             callback(null, 'one');
     *         }, 200);
     *     },
     *     two: function(callback) {
     *         callback('two');
     *     },
     *     three: function(callback) {
     *         setTimeout(function() {
     *             callback(null, 'three');
     *         }, 100);
     *     }
     * };
     *
     * async.parallel(async.reflectAll(tasks),
     * // optional callback
     * function(err, results) {
     *     // values
     *     // results.one.value = 'one'
     *     // results.two.error = 'two'
     *     // results.three.value = 'three'
     * });
     */function reflectAll(tasks){var results;if(isArray(tasks)){results=arrayMap(tasks,reflect);}else{results={};baseForOwn(tasks,function(task,key){results[key]=reflect.call(this,task);});}return results;}/**
     * The same as [`reject`]{@link module:Collections.reject} but runs a maximum of `limit` async operations at a
     * time.
     *
     * @name rejectLimit
     * @static
     * @memberOf module:Collections
     * @method
     * @see [async.reject]{@link module:Collections.reject}
     * @category Collection
     * @param {Array|Iterable|Object} coll - A collection to iterate over.
     * @param {number} limit - The maximum number of async operations at a time.
     * @param {Function} iteratee - A truth test to apply to each item in `coll`.
     * The `iteratee` is passed a `callback(err, truthValue)`, which must be called
     * with a boolean argument once it has completed. Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called after all the
     * `iteratee` functions have finished. Invoked with (err, results).
     */var rejectLimit=doParallelLimit(reject$1);/**
     * The same as [`reject`]{@link module:Collections.reject} but runs only a single async operation at a time.
     *
     * @name rejectSeries
     * @static
     * @memberOf module:Collections
     * @method
     * @see [async.reject]{@link module:Collections.reject}
     * @category Collection
     * @param {Array|Iterable|Object} coll - A collection to iterate over.
     * @param {Function} iteratee - A truth test to apply to each item in `coll`.
     * The `iteratee` is passed a `callback(err, truthValue)`, which must be called
     * with a boolean argument once it has completed. Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called after all the
     * `iteratee` functions have finished. Invoked with (err, results).
     */var rejectSeries=doLimit(rejectLimit,1);/**
     * Creates a function that returns `value`.
     *
     * @static
     * @memberOf _
     * @since 2.4.0
     * @category Util
     * @param {*} value The value to return from the new function.
     * @returns {Function} Returns the new constant function.
     * @example
     *
     * var objects = _.times(2, _.constant({ 'a': 1 }));
     *
     * console.log(objects);
     * // => [{ 'a': 1 }, { 'a': 1 }]
     *
     * console.log(objects[0] === objects[1]);
     * // => true
     */function constant$1(value){return function(){return value;};}/**
     * Attempts to get a successful response from `task` no more than `times` times
     * before returning an error. If the task is successful, the `callback` will be
     * passed the result of the successful task. If all attempts fail, the callback
     * will be passed the error and result (if any) of the final attempt.
     *
     * @name retry
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @category Control Flow
     * @param {Object|number} [opts = {times: 5, interval: 0}| 5] - Can be either an
     * object with `times` and `interval` or a number.
     * * `times` - The number of attempts to make before giving up.  The default
     *   is `5`.
     * * `interval` - The time to wait between retries, in milliseconds.  The
     *   default is `0`. The interval may also be specified as a function of the
     *   retry count (see example).
     * * If `opts` is a number, the number specifies the number of times to retry,
     *   with the default interval of `0`.
     * @param {Function} task - A function which receives two arguments: (1) a
     * `callback(err, result)` which must be called when finished, passing `err`
     * (which can be `null`) and the `result` of the function's execution, and (2)
     * a `results` object, containing the results of the previously executed
     * functions (if nested inside another control flow). Invoked with
     * (callback, results).
     * @param {Function} [callback] - An optional callback which is called when the
     * task has succeeded, or after the final failed attempt. It receives the `err`
     * and `result` arguments of the last attempt at completing the `task`. Invoked
     * with (err, results).
     * @example
     *
     * // The `retry` function can be used as a stand-alone control flow by passing
     * // a callback, as shown below:
     *
     * // try calling apiMethod 3 times
     * async.retry(3, apiMethod, function(err, result) {
     *     // do something with the result
     * });
     *
     * // try calling apiMethod 3 times, waiting 200 ms between each retry
     * async.retry({times: 3, interval: 200}, apiMethod, function(err, result) {
     *     // do something with the result
     * });
     *
     * // try calling apiMethod 10 times with exponential backoff
     * // (i.e. intervals of 100, 200, 400, 800, 1600, ... milliseconds)
     * async.retry({
     *   times: 10,
     *   interval: function(retryCount) {
     *     return 50 * Math.pow(2, retryCount);
     *   }
     * }, apiMethod, function(err, result) {
     *     // do something with the result
     * });
     *
     * // try calling apiMethod the default 5 times no delay between each retry
     * async.retry(apiMethod, function(err, result) {
     *     // do something with the result
     * });
     *
     * // It can also be embedded within other control flow functions to retry
     * // individual methods that are not as reliable, like this:
     * async.auto({
     *     users: api.getUsers.bind(api),
     *     payments: async.retry(3, api.getPayments.bind(api))
     * }, function(err, results) {
     *     // do something with the results
     * });
     */function retry(opts,task,callback){var DEFAULT_TIMES=5;var DEFAULT_INTERVAL=0;var options={times:DEFAULT_TIMES,intervalFunc:constant$1(DEFAULT_INTERVAL)};function parseTimes(acc,t){if(typeof t==='object'){acc.times=+t.times||DEFAULT_TIMES;acc.intervalFunc=typeof t.interval==='function'?t.interval:constant$1(+t.interval||DEFAULT_INTERVAL);}else if(typeof t==='number'||typeof t==='string'){acc.times=+t||DEFAULT_TIMES;}else{throw new Error("Invalid arguments for async.retry");}}if(arguments.length<3&&typeof opts==='function'){callback=task||noop;task=opts;}else{parseTimes(options,opts);callback=callback||noop;}if(typeof task!=='function'){throw new Error("Invalid arguments for async.retry");}var attempt=1;function retryAttempt(){task(function(err){if(err&&attempt++<options.times){setTimeout(retryAttempt,options.intervalFunc(attempt));}else{callback.apply(null,arguments);}});}retryAttempt();}/**
     * A close relative of [`retry`]{@link module:ControlFlow.retry}.  This method wraps a task and makes it
     * retryable, rather than immediately calling it with retries.
     *
     * @name retryable
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @see [async.retry]{@link module:ControlFlow.retry}
     * @category Control Flow
     * @param {Object|number} [opts = {times: 5, interval: 0}| 5] - optional
     * options, exactly the same as from `retry`
     * @param {Function} task - the asynchronous function to wrap
     * @returns {Functions} The wrapped function, which when invoked, will retry on
     * an error, based on the parameters specified in `opts`.
     * @example
     *
     * async.auto({
     *     dep1: async.retryable(3, getFromFlakyService),
     *     process: ["dep1", async.retryable(3, function (results, cb) {
     *         maybeProcessData(results.dep1, cb);
     *     })]
     * }, callback);
     */function retryable(opts,task){if(!task){task=opts;opts=null;}return initialParams(function(args,callback){function taskFn(cb){task.apply(null,args.concat([cb]));}if(opts)retry(opts,taskFn,callback);else retry(taskFn,callback);});}/**
     * Run the functions in the `tasks` collection in series, each one running once
     * the previous function has completed. If any functions in the series pass an
     * error to its callback, no more functions are run, and `callback` is
     * immediately called with the value of the error. Otherwise, `callback`
     * receives an array of results when `tasks` have completed.
     *
     * It is also possible to use an object instead of an array. Each property will
     * be run as a function, and the results will be passed to the final `callback`
     * as an object instead of an array. This can be a more readable way of handling
     *  results from {@link async.series}.
     *
     * **Note** that while many implementations preserve the order of object
     * properties, the [ECMAScript Language Specification](http://www.ecma-international.org/ecma-262/5.1/#sec-8.6)
     * explicitly states that
     *
     * > The mechanics and order of enumerating the properties is not specified.
     *
     * So if you rely on the order in which your series of functions are executed,
     * and want this to work on all platforms, consider using an array.
     *
     * @name series
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @category Control Flow
     * @param {Array|Iterable|Object} tasks - A collection containing functions to run, each
     * function is passed a `callback(err, result)` it must call on completion with
     * an error `err` (which can be `null`) and an optional `result` value.
     * @param {Function} [callback] - An optional callback to run once all the
     * functions have completed. This function gets a results array (or object)
     * containing all the result arguments passed to the `task` callbacks. Invoked
     * with (err, result).
     * @example
     * async.series([
     *     function(callback) {
     *         // do some stuff ...
     *         callback(null, 'one');
     *     },
     *     function(callback) {
     *         // do some more stuff ...
     *         callback(null, 'two');
     *     }
     * ],
     * // optional callback
     * function(err, results) {
     *     // results is now equal to ['one', 'two']
     * });
     *
     * async.series({
     *     one: function(callback) {
     *         setTimeout(function() {
     *             callback(null, 1);
     *         }, 200);
     *     },
     *     two: function(callback){
     *         setTimeout(function() {
     *             callback(null, 2);
     *         }, 100);
     *     }
     * }, function(err, results) {
     *     // results is now equal to: {one: 1, two: 2}
     * });
     */function series(tasks,callback){_parallel(eachOfSeries,tasks,callback);}/**
     * Returns `true` if at least one element in the `coll` satisfies an async test.
     * If any iteratee call returns `true`, the main `callback` is immediately
     * called.
     *
     * @name some
     * @static
     * @memberOf module:Collections
     * @method
     * @alias any
     * @category Collection
     * @param {Array|Iterable|Object} coll - A collection to iterate over.
     * @param {Function} iteratee - A truth test to apply to each item in the array
     * in parallel. The iteratee is passed a `callback(err, truthValue)` which must
     * be called with a boolean argument once it has completed. Invoked with
     * (item, callback).
     * @param {Function} [callback] - A callback which is called as soon as any
     * iteratee returns `true`, or after all the iteratee functions have finished.
     * Result will be either `true` or `false` depending on the values of the async
     * tests. Invoked with (err, result).
     * @example
     *
     * async.some(['file1','file2','file3'], function(filePath, callback) {
     *     fs.access(filePath, function(err) {
     *         callback(null, !err)
     *     });
     * }, function(err, result) {
     *     // if result is true then at least one of the files exists
     * });
     */var some=_createTester(eachOf,Boolean,identity);/**
     * The same as [`some`]{@link module:Collections.some} but runs a maximum of `limit` async operations at a time.
     *
     * @name someLimit
     * @static
     * @memberOf module:Collections
     * @method
     * @see [async.some]{@link module:Collections.some}
     * @alias anyLimit
     * @category Collection
     * @param {Array|Iterable|Object} coll - A collection to iterate over.
     * @param {number} limit - The maximum number of async operations at a time.
     * @param {Function} iteratee - A truth test to apply to each item in the array
     * in parallel. The iteratee is passed a `callback(err, truthValue)` which must
     * be called with a boolean argument once it has completed. Invoked with
     * (item, callback).
     * @param {Function} [callback] - A callback which is called as soon as any
     * iteratee returns `true`, or after all the iteratee functions have finished.
     * Result will be either `true` or `false` depending on the values of the async
     * tests. Invoked with (err, result).
     */var someLimit=_createTester(eachOfLimit,Boolean,identity);/**
     * The same as [`some`]{@link module:Collections.some} but runs only a single async operation at a time.
     *
     * @name someSeries
     * @static
     * @memberOf module:Collections
     * @method
     * @see [async.some]{@link module:Collections.some}
     * @alias anySeries
     * @category Collection
     * @param {Array|Iterable|Object} coll - A collection to iterate over.
     * @param {Function} iteratee - A truth test to apply to each item in the array
     * in parallel. The iteratee is passed a `callback(err, truthValue)` which must
     * be called with a boolean argument once it has completed. Invoked with
     * (item, callback).
     * @param {Function} [callback] - A callback which is called as soon as any
     * iteratee returns `true`, or after all the iteratee functions have finished.
     * Result will be either `true` or `false` depending on the values of the async
     * tests. Invoked with (err, result).
     */var someSeries=doLimit(someLimit,1);/**
     * Sorts a list by the results of running each `coll` value through an async
     * `iteratee`.
     *
     * @name sortBy
     * @static
     * @memberOf module:Collections
     * @method
     * @category Collection
     * @param {Array|Iterable|Object} coll - A collection to iterate over.
     * @param {Function} iteratee - A function to apply to each item in `coll`.
     * The iteratee is passed a `callback(err, sortValue)` which must be called once
     * it has completed with an error (which can be `null`) and a value to use as
     * the sort criteria. Invoked with (item, callback).
     * @param {Function} callback - A callback which is called after all the
     * `iteratee` functions have finished, or an error occurs. Results is the items
     * from the original `coll` sorted by the values returned by the `iteratee`
     * calls. Invoked with (err, results).
     * @example
     *
     * async.sortBy(['file1','file2','file3'], function(file, callback) {
     *     fs.stat(file, function(err, stats) {
     *         callback(err, stats.mtime);
     *     });
     * }, function(err, results) {
     *     // results is now the original array of files sorted by
     *     // modified date
     * });
     *
     * // By modifying the callback parameter the
     * // sorting order can be influenced:
     *
     * // ascending order
     * async.sortBy([1,9,3,5], function(x, callback) {
     *     callback(null, x);
     * }, function(err,result) {
     *     // result callback
     * });
     *
     * // descending order
     * async.sortBy([1,9,3,5], function(x, callback) {
     *     callback(null, x*-1);    //<- x*-1 instead of x, turns the order around
     * }, function(err,result) {
     *     // result callback
     * });
     */function sortBy(coll,iteratee,callback){map(coll,function(x,callback){iteratee(x,function(err,criteria){if(err)return callback(err);callback(null,{value:x,criteria:criteria});});},function(err,results){if(err)return callback(err);callback(null,arrayMap(results.sort(comparator),baseProperty('value')));});function comparator(left,right){var a=left.criteria,b=right.criteria;return a<b?-1:a>b?1:0;}}/**
     * Sets a time limit on an asynchronous function. If the function does not call
     * its callback within the specified milliseconds, it will be called with a
     * timeout error. The code property for the error object will be `'ETIMEDOUT'`.
     *
     * @name timeout
     * @static
     * @memberOf module:Utils
     * @method
     * @category Util
     * @param {Function} asyncFn - The asynchronous function you want to set the
     * time limit.
     * @param {number} milliseconds - The specified time limit.
     * @param {*} [info] - Any variable you want attached (`string`, `object`, etc)
     * to timeout Error for more information..
     * @returns {Function} Returns a wrapped function that can be used with any of
     * the control flow functions.
     * @example
     *
     * async.timeout(function(callback) {
     *     doAsyncTask(callback);
     * }, 1000);
     */function timeout(asyncFn,milliseconds,info){var originalCallback,timer;var timedOut=false;function injectedCallback(){if(!timedOut){originalCallback.apply(null,arguments);clearTimeout(timer);}}function timeoutCallback(){var name=asyncFn.name||'anonymous';var error=new Error('Callback function "'+name+'" timed out.');error.code='ETIMEDOUT';if(info){error.info=info;}timedOut=true;originalCallback(error);}return initialParams(function(args,origCallback){originalCallback=origCallback;// setup timer and call original function
timer=setTimeout(timeoutCallback,milliseconds);asyncFn.apply(null,args.concat(injectedCallback));});}/* Built-in method references for those with the same name as other `lodash` methods. */var nativeCeil=Math.ceil;var nativeMax$1=Math.max;/**
     * The base implementation of `_.range` and `_.rangeRight` which doesn't
     * coerce arguments to numbers.
     *
     * @private
     * @param {number} start The start of the range.
     * @param {number} end The end of the range.
     * @param {number} step The value to increment or decrement by.
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {Array} Returns the range of numbers.
     */function baseRange(start,end,step,fromRight){var index=-1,length=nativeMax$1(nativeCeil((end-start)/(step||1)),0),result=Array(length);while(length--){result[fromRight?length:++index]=start;start+=step;}return result;}/**
     * The same as [times]{@link module:ControlFlow.times} but runs a maximum of `limit` async operations at a
     * time.
     *
     * @name timesLimit
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @see [async.times]{@link module:ControlFlow.times}
     * @category Control Flow
     * @param {number} count - The number of times to run the function.
     * @param {number} limit - The maximum number of async operations at a time.
     * @param {Function} iteratee - The function to call `n` times. Invoked with the
     * iteration index and a callback (n, next).
     * @param {Function} callback - see [async.map]{@link module:Collections.map}.
     */function timeLimit(count,limit,iteratee,callback){mapLimit(baseRange(0,count,1),limit,iteratee,callback);}/**
     * Calls the `iteratee` function `n` times, and accumulates results in the same
     * manner you would use with [map]{@link module:Collections.map}.
     *
     * @name times
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @see [async.map]{@link module:Collections.map}
     * @category Control Flow
     * @param {number} n - The number of times to run the function.
     * @param {Function} iteratee - The function to call `n` times. Invoked with the
     * iteration index and a callback (n, next).
     * @param {Function} callback - see {@link module:Collections.map}.
     * @example
     *
     * // Pretend this is some complicated async factory
     * var createUser = function(id, callback) {
     *     callback(null, {
     *         id: 'user' + id
     *     });
     * };
     *
     * // generate 5 users
     * async.times(5, function(n, next) {
     *     createUser(n, function(err, user) {
     *         next(err, user);
     *     });
     * }, function(err, users) {
     *     // we should now have 5 users
     * });
     */var times=doLimit(timeLimit,Infinity);/**
     * The same as [times]{@link module:ControlFlow.times} but runs only a single async operation at a time.
     *
     * @name timesSeries
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @see [async.times]{@link module:ControlFlow.times}
     * @category Control Flow
     * @param {number} n - The number of times to run the function.
     * @param {Function} iteratee - The function to call `n` times. Invoked with the
     * iteration index and a callback (n, next).
     * @param {Function} callback - see {@link module:Collections.map}.
     */var timesSeries=doLimit(timeLimit,1);/**
     * A relative of `reduce`.  Takes an Object or Array, and iterates over each
     * element in series, each step potentially mutating an `accumulator` value.
     * The type of the accumulator defaults to the type of collection passed in.
     *
     * @name transform
     * @static
     * @memberOf module:Collections
     * @method
     * @category Collection
     * @param {Array|Iterable|Object} coll - A collection to iterate over.
     * @param {*} [accumulator] - The initial state of the transform.  If omitted,
     * it will default to an empty Object or Array, depending on the type of `coll`
     * @param {Function} iteratee - A function applied to each item in the
     * collection that potentially modifies the accumulator. The `iteratee` is
     * passed a `callback(err)` which accepts an optional error as its first
     * argument. If an error is passed to the callback, the transform is stopped
     * and the main `callback` is immediately called with the error.
     * Invoked with (accumulator, item, key, callback).
     * @param {Function} [callback] - A callback which is called after all the
     * `iteratee` functions have finished. Result is the transformed accumulator.
     * Invoked with (err, result).
     * @example
     *
     * async.transform([1,2,3], function(acc, item, index, callback) {
     *     // pointless async:
     *     process.nextTick(function() {
     *         acc.push(item * 2)
     *         callback(null)
     *     });
     * }, function(err, result) {
     *     // result is now equal to [2, 4, 6]
     * });
     *
     * @example
     *
     * async.transform({a: 1, b: 2, c: 3}, function (obj, val, key, callback) {
     *     setImmediate(function () {
     *         obj[key] = val * 2;
     *         callback();
     *     })
     * }, function (err, result) {
     *     // result is equal to {a: 2, b: 4, c: 6}
     * })
     */function transform(coll,accumulator,iteratee,callback){if(arguments.length===3){callback=iteratee;iteratee=accumulator;accumulator=isArray(coll)?[]:{};}callback=once(callback||noop);eachOf(coll,function(v,k,cb){iteratee(accumulator,v,k,cb);},function(err){callback(err,accumulator);});}/**
     * Undoes a [memoize]{@link module:Utils.memoize}d function, reverting it to the original,
     * unmemoized form. Handy for testing.
     *
     * @name unmemoize
     * @static
     * @memberOf module:Utils
     * @method
     * @see [async.memoize]{@link module:Utils.memoize}
     * @category Util
     * @param {Function} fn - the memoized function
     * @returns {Function} a function that calls the original unmemoized function
     */function unmemoize(fn){return function(){return(fn.unmemoized||fn).apply(null,arguments);};}/**
     * Repeatedly call `fn`, while `test` returns `true`. Calls `callback` when
     * stopped, or an error occurs.
     *
     * @name whilst
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @category Control Flow
     * @param {Function} test - synchronous truth test to perform before each
     * execution of `fn`. Invoked with ().
     * @param {Function} iteratee - A function which is called each time `test` passes.
     * The function is passed a `callback(err)`, which must be called once it has
     * completed with an optional `err` argument. Invoked with (callback).
     * @param {Function} [callback] - A callback which is called after the test
     * function has failed and repeated execution of `fn` has stopped. `callback`
     * will be passed an error and any arguments passed to the final `fn`'s
     * callback. Invoked with (err, [results]);
     * @returns undefined
     * @example
     *
     * var count = 0;
     * async.whilst(
     *     function() { return count < 5; },
     *     function(callback) {
     *         count++;
     *         setTimeout(function() {
     *             callback(null, count);
     *         }, 1000);
     *     },
     *     function (err, n) {
     *         // 5 seconds have passed, n = 5
     *     }
     * );
     */function whilst(test,iteratee,callback){callback=onlyOnce(callback||noop);if(!test())return callback(null);var next=rest(function(err,args){if(err)return callback(err);if(test())return iteratee(next);callback.apply(null,[null].concat(args));});iteratee(next);}/**
     * Repeatedly call `fn` until `test` returns `true`. Calls `callback` when
     * stopped, or an error occurs. `callback` will be passed an error and any
     * arguments passed to the final `fn`'s callback.
     *
     * The inverse of [whilst]{@link module:ControlFlow.whilst}.
     *
     * @name until
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @see [async.whilst]{@link module:ControlFlow.whilst}
     * @category Control Flow
     * @param {Function} test - synchronous truth test to perform before each
     * execution of `fn`. Invoked with ().
     * @param {Function} fn - A function which is called each time `test` fails.
     * The function is passed a `callback(err)`, which must be called once it has
     * completed with an optional `err` argument. Invoked with (callback).
     * @param {Function} [callback] - A callback which is called after the test
     * function has passed and repeated execution of `fn` has stopped. `callback`
     * will be passed an error and any arguments passed to the final `fn`'s
     * callback. Invoked with (err, [results]);
     */function until(test,fn,callback){whilst(function(){return!test.apply(this,arguments);},fn,callback);}/**
     * Runs the `tasks` array of functions in series, each passing their results to
     * the next in the array. However, if any of the `tasks` pass an error to their
     * own callback, the next function is not executed, and the main `callback` is
     * immediately called with the error.
     *
     * @name waterfall
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @category Control Flow
     * @param {Array} tasks - An array of functions to run, each function is passed
     * a `callback(err, result1, result2, ...)` it must call on completion. The
     * first argument is an error (which can be `null`) and any further arguments
     * will be passed as arguments in order to the next task.
     * @param {Function} [callback] - An optional callback to run once all the
     * functions have completed. This will be passed the results of the last task's
     * callback. Invoked with (err, [results]).
     * @returns undefined
     * @example
     *
     * async.waterfall([
     *     function(callback) {
     *         callback(null, 'one', 'two');
     *     },
     *     function(arg1, arg2, callback) {
     *         // arg1 now equals 'one' and arg2 now equals 'two'
     *         callback(null, 'three');
     *     },
     *     function(arg1, callback) {
     *         // arg1 now equals 'three'
     *         callback(null, 'done');
     *     }
     * ], function (err, result) {
     *     // result now equals 'done'
     * });
     *
     * // Or, with named functions:
     * async.waterfall([
     *     myFirstFunction,
     *     mySecondFunction,
     *     myLastFunction,
     * ], function (err, result) {
     *     // result now equals 'done'
     * });
     * function myFirstFunction(callback) {
     *     callback(null, 'one', 'two');
     * }
     * function mySecondFunction(arg1, arg2, callback) {
     *     // arg1 now equals 'one' and arg2 now equals 'two'
     *     callback(null, 'three');
     * }
     * function myLastFunction(arg1, callback) {
     *     // arg1 now equals 'three'
     *     callback(null, 'done');
     * }
     */function waterfall(tasks,callback){callback=once(callback||noop);if(!isArray(tasks))return callback(new Error('First argument to waterfall must be an array of functions'));if(!tasks.length)return callback();var taskIndex=0;function nextTask(args){if(taskIndex===tasks.length){return callback.apply(null,[null].concat(args));}var taskCallback=onlyOnce(rest(function(err,args){if(err){return callback.apply(null,[err].concat(args));}nextTask(args);}));args.push(taskCallback);var task=tasks[taskIndex++];task.apply(null,args);}nextTask([]);}var index={applyEach:applyEach,applyEachSeries:applyEachSeries,apply:apply$1,asyncify:asyncify,auto:auto,autoInject:autoInject,cargo:cargo,compose:compose,concat:concat,concatSeries:concatSeries,constant:constant,detect:detect,detectLimit:detectLimit,detectSeries:detectSeries,dir:dir,doDuring:doDuring,doUntil:doUntil,doWhilst:doWhilst,during:during,each:eachLimit,eachLimit:eachLimit$1,eachOf:eachOf,eachOfLimit:eachOfLimit,eachOfSeries:eachOfSeries,eachSeries:eachSeries,ensureAsync:ensureAsync,every:every,everyLimit:everyLimit,everySeries:everySeries,filter:filter,filterLimit:filterLimit,filterSeries:filterSeries,forever:forever,log:log,map:map,mapLimit:mapLimit,mapSeries:mapSeries,mapValues:mapValues,mapValuesLimit:mapValuesLimit,mapValuesSeries:mapValuesSeries,memoize:memoize,nextTick:nextTick,parallel:parallelLimit,parallelLimit:parallelLimit$1,priorityQueue:priorityQueue,queue:queue$1,race:race,reduce:reduce,reduceRight:reduceRight,reflect:reflect,reflectAll:reflectAll,reject:reject,rejectLimit:rejectLimit,rejectSeries:rejectSeries,retry:retry,retryable:retryable,seq:seq,series:series,setImmediate:setImmediate$1,some:some,someLimit:someLimit,someSeries:someSeries,sortBy:sortBy,timeout:timeout,times:times,timesLimit:timeLimit,timesSeries:timesSeries,transform:transform,unmemoize:unmemoize,until:until,waterfall:waterfall,whilst:whilst,// aliases
all:every,any:some,forEach:eachLimit,forEachSeries:eachSeries,forEachLimit:eachLimit$1,forEachOf:eachOf,forEachOfSeries:eachOfSeries,forEachOfLimit:eachOfLimit,inject:reduce,foldl:reduce,foldr:reduceRight,select:filter,selectLimit:filterLimit,selectSeries:filterSeries,wrapSync:asyncify};$m['async/dist/async.js#2.0.1']['default']=index;$m['async/dist/async.js#2.0.1'].applyEach=applyEach;$m['async/dist/async.js#2.0.1'].applyEachSeries=applyEachSeries;$m['async/dist/async.js#2.0.1'].apply=apply$1;$m['async/dist/async.js#2.0.1'].asyncify=asyncify;$m['async/dist/async.js#2.0.1'].auto=auto;$m['async/dist/async.js#2.0.1'].autoInject=autoInject;$m['async/dist/async.js#2.0.1'].cargo=cargo;$m['async/dist/async.js#2.0.1'].compose=compose;$m['async/dist/async.js#2.0.1'].concat=concat;$m['async/dist/async.js#2.0.1'].concatSeries=concatSeries;$m['async/dist/async.js#2.0.1'].constant=constant;$m['async/dist/async.js#2.0.1'].detect=detect;$m['async/dist/async.js#2.0.1'].detectLimit=detectLimit;$m['async/dist/async.js#2.0.1'].detectSeries=detectSeries;$m['async/dist/async.js#2.0.1'].dir=dir;$m['async/dist/async.js#2.0.1'].doDuring=doDuring;$m['async/dist/async.js#2.0.1'].doUntil=doUntil;$m['async/dist/async.js#2.0.1'].doWhilst=doWhilst;$m['async/dist/async.js#2.0.1'].during=during;$m['async/dist/async.js#2.0.1'].each=eachLimit;$m['async/dist/async.js#2.0.1'].eachLimit=eachLimit$1;$m['async/dist/async.js#2.0.1'].eachOf=eachOf;$m['async/dist/async.js#2.0.1'].eachOfLimit=eachOfLimit;$m['async/dist/async.js#2.0.1'].eachOfSeries=eachOfSeries;$m['async/dist/async.js#2.0.1'].eachSeries=eachSeries;$m['async/dist/async.js#2.0.1'].ensureAsync=ensureAsync;$m['async/dist/async.js#2.0.1'].every=every;$m['async/dist/async.js#2.0.1'].everyLimit=everyLimit;$m['async/dist/async.js#2.0.1'].everySeries=everySeries;$m['async/dist/async.js#2.0.1'].filter=filter;$m['async/dist/async.js#2.0.1'].filterLimit=filterLimit;$m['async/dist/async.js#2.0.1'].filterSeries=filterSeries;$m['async/dist/async.js#2.0.1'].forever=forever;$m['async/dist/async.js#2.0.1'].log=log;$m['async/dist/async.js#2.0.1'].map=map;$m['async/dist/async.js#2.0.1'].mapLimit=mapLimit;$m['async/dist/async.js#2.0.1'].mapSeries=mapSeries;$m['async/dist/async.js#2.0.1'].mapValues=mapValues;$m['async/dist/async.js#2.0.1'].mapValuesLimit=mapValuesLimit;$m['async/dist/async.js#2.0.1'].mapValuesSeries=mapValuesSeries;$m['async/dist/async.js#2.0.1'].memoize=memoize;$m['async/dist/async.js#2.0.1'].nextTick=nextTick;$m['async/dist/async.js#2.0.1'].parallel=parallelLimit;$m['async/dist/async.js#2.0.1'].parallelLimit=parallelLimit$1;$m['async/dist/async.js#2.0.1'].priorityQueue=priorityQueue;$m['async/dist/async.js#2.0.1'].queue=queue$1;$m['async/dist/async.js#2.0.1'].race=race;$m['async/dist/async.js#2.0.1'].reduce=reduce;$m['async/dist/async.js#2.0.1'].reduceRight=reduceRight;$m['async/dist/async.js#2.0.1'].reflect=reflect;$m['async/dist/async.js#2.0.1'].reflectAll=reflectAll;$m['async/dist/async.js#2.0.1'].reject=reject;$m['async/dist/async.js#2.0.1'].rejectLimit=rejectLimit;$m['async/dist/async.js#2.0.1'].rejectSeries=rejectSeries;$m['async/dist/async.js#2.0.1'].retry=retry;$m['async/dist/async.js#2.0.1'].retryable=retryable;$m['async/dist/async.js#2.0.1'].seq=seq;$m['async/dist/async.js#2.0.1'].series=series;$m['async/dist/async.js#2.0.1'].setImmediate=setImmediate$1;$m['async/dist/async.js#2.0.1'].some=some;$m['async/dist/async.js#2.0.1'].someLimit=someLimit;$m['async/dist/async.js#2.0.1'].someSeries=someSeries;$m['async/dist/async.js#2.0.1'].sortBy=sortBy;$m['async/dist/async.js#2.0.1'].timeout=timeout;$m['async/dist/async.js#2.0.1'].times=times;$m['async/dist/async.js#2.0.1'].timesLimit=timeLimit;$m['async/dist/async.js#2.0.1'].timesSeries=timesSeries;$m['async/dist/async.js#2.0.1'].transform=transform;$m['async/dist/async.js#2.0.1'].unmemoize=unmemoize;$m['async/dist/async.js#2.0.1'].until=until;$m['async/dist/async.js#2.0.1'].waterfall=waterfall;$m['async/dist/async.js#2.0.1'].whilst=whilst;$m['async/dist/async.js#2.0.1'].all=every;$m['async/dist/async.js#2.0.1'].allLimit=everyLimit;$m['async/dist/async.js#2.0.1'].allSeries=everySeries;$m['async/dist/async.js#2.0.1'].any=some;$m['async/dist/async.js#2.0.1'].anyLimit=someLimit;$m['async/dist/async.js#2.0.1'].anySeries=someSeries;$m['async/dist/async.js#2.0.1'].find=detect;$m['async/dist/async.js#2.0.1'].findLimit=detectLimit;$m['async/dist/async.js#2.0.1'].findSeries=detectSeries;$m['async/dist/async.js#2.0.1'].forEach=eachLimit;$m['async/dist/async.js#2.0.1'].forEachSeries=eachSeries;$m['async/dist/async.js#2.0.1'].forEachLimit=eachLimit$1;$m['async/dist/async.js#2.0.1'].forEachOf=eachOf;$m['async/dist/async.js#2.0.1'].forEachOfSeries=eachOfSeries;$m['async/dist/async.js#2.0.1'].forEachOfLimit=eachOfLimit;$m['async/dist/async.js#2.0.1'].inject=reduce;$m['async/dist/async.js#2.0.1'].foldl=reduce;$m['async/dist/async.js#2.0.1'].foldr=reduceRight;$m['async/dist/async.js#2.0.1'].select=filter;$m['async/dist/async.js#2.0.1'].selectLimit=filterLimit;$m['async/dist/async.js#2.0.1'].selectSeries=filterSeries;$m['async/dist/async.js#2.0.1'].wrapSync=asyncify;});

/*== lib/File.js ==*/
$m['lib/File.js'] = {};
'use strict';

const { series: _libFilejs_series, parallel: _libFilejs_parallel } = $m['async/dist/async.js#2.0.1'];
const { debug: _libFilejs_debug, print: _libFilejs_print, strong: _libFilejs_strong, warn: _libFilejs_warn } = $m['lib/utils/cnsl.js'];
const { regexpEscape: _libFilejs_regexpEscape, truncate: _libFilejs_truncate } = $m['lib/utils/string.js'];
const { resolve: _libFilejs_resolve } = $m['lib/identify-resource/index.js'];
const { readFileSync: _libFilejs_readFile, writeFileSync: _libFilejs_writeFile } = require('fs');
const { mkdir: { sync: _libFilejs_mkdir } } = $m['recur-fs/index.js#2.2.3'];
const _libFilejs_callable = $m['lib/utils/callable.js'];
const _libFilejs_chalk = $m['chalk/index.js#1.1.3'];
const _libFilejs_md5 = $m['md5/md5.js#2.2.1'];
const _libFilejs_path = require('path');
const _libFilejs_unique = $m['lodash/uniq.js#4.15.0'];

const _libFilejs_RE_ESCAPE_ID = /[#._-\s/\\]/g;
const _libFilejs_WORKFLOW_INLINEABLE = ['load'];
const _libFilejs_WORKFLOW_STANDARD = ['load', 'parse', 'runWorkflowForDependencies'];
const _libFilejs_WORKFLOWS = {
  standard: 1,
  inlineable: 2,
  writeable: 4
};

$m['lib/File.js'] = class File {
  /**
   * Constructor
   * @param {String} id
   * @param {String} filepath
   * @param {String} type
   * @param {Object} options
   *  - {Object} caches
   *  - {Object} fileExtensions
   *  - {Function} fileFactory
   *  - {Object} pluginOptions
   *  - {Object} runtimeOptions
   *  - {Array} sources
   */
  constructor(id, filepath, type, options) {
    this.content = '';
    this.encoding = 'utf8';
    this.date = Date.now();
    this.dependencies = [];
    this.dependencyReferences = [];
    this.fileContent = '';
    this.filepath = filepath;
    this.hash = '';
    this.helpers = [];
    this.id = id;
    // TODO: short name when compressed?
    this.idSafe = id.replace(_libFilejs_RE_ESCAPE_ID, '');
    this.isDependency = false;
    this.isInline = false;
    this.isLocked = false;
    this.options = options;
    this.ran = 0;
    this.type = type;
    this.workflows = {
      standard: [_libFilejs_WORKFLOW_STANDARD],
      inlineable: [_libFilejs_WORKFLOW_INLINEABLE],
      writeable: [[]]
    };

    this.extension = _libFilejs_path.extname(this.filepath).slice(1);
    this.relpath = _libFilejs_truncate(_libFilejs_path.relative(process.cwd(), filepath));
    this.name = _libFilejs_path.basename(this.filepath);

    // Force generation of hash
    this.load();

    _libFilejs_debug(`created File instance ${ _libFilejs_strong(this.relpath) }`, 3);
  }

  /**
   * Retrieve writeable state
   * @param {Boolean} isBatch
   * @returns {Boolean}
   */
  isWriteable(isBatch) {
    return !this.isInline
    // Only writeable if not node_module in batch mode
    && isBatch ? !~this.filepath.indexOf('node_modules') : !this.isDependency;
  }

  /**
   * Retrieve inlineable state
   * @returns {Boolean}
   */
  isInlineable() {
    return this.isInline;
  }

  /**
   * Retrieve parsed workflows for 'buildOptions'
   * @param {String} type
   * @param {Number} index
   * @param {Object} buildOptions
   *  - {Boolean} bootstrap
   *  - {Boolean} boilerplate
   *  - {Boolean} browser
   *  - {Boolean} bundle
   *  - {Boolean} compress
   *  - {Array} ignoredFiles
   *  - {Boolean} helpers
   *  - {Boolean} watchOnly
   * @returns {Array}
   */
  parseWorkflow(type, index, buildOptions) {
    if (!this.workflows[type] || !this.workflows[type][index]) return [];

    return this.workflows[type][index].reduce((tasks, task) => {
      if (~task.indexOf(':')) {
        let conditions = task.split(':');

        task = conditions.pop();
        const passed = conditions.every(condition => {
          return condition.charAt(0) == '!' ? !buildOptions[condition.slice(1)] : buildOptions[condition];
        });

        if (!passed) return tasks;
      }
      tasks.push(task);
      return tasks;
    }, []);
  }

  /**
   * Retrieve flattened dependency tree
   * @param {Boolean} asReferences
   * @returns {Array}
   */
  getAllDependencies(asReferences) {
    const key = asReferences ? 'dependencyReferences' : 'dependencies';
    const root = this;
    let deps = [];
    let depsUnique = [];

    function add(dependency, dependant) {
      const file = dependency.file || dependency;

      if (file !== root) {
        deps.push(dependency);
        // Add children
        if (key in file) {
          file[key].forEach(function (dep) {
            // Protect against circular references
            if ((dep.instance || dep) != dependant) add(dep, dependency);
          });
        }
      }
    }

    this[key].forEach(add);

    // Reverse and filter unique
    // Prefer deeply nested duplicates
    for (let i = deps.length - 1; i >= 0; i--) {
      if (!~depsUnique.indexOf(deps[i])) depsUnique.push(deps[i]);
    }

    return depsUnique;
  }

  /**
   * Retrieve flattened helpers
   * @returns {Array}
   */
  getAllHelpers() {
    let helpers = [...this.helpers];

    function add(dependency) {
      helpers.push(...dependency.helpers);
      // Add children
      dependency.dependencies.forEach(add);
    }

    this.dependencies.forEach(add);

    return _libFilejs_unique(helpers);
  }

  /**
   * Add 'dependencies'
   * @param {Array} dependencies
   * @param {Object} buildOptions
   *  - {Boolean} bootstrap
   *  - {Boolean} boilerplate
   *  - {Boolean} browser
   *  - {Boolean} bundle
   *  - {Boolean} compress
   *  - {Array} ignoredFiles
   *  - {Boolean} helpers
   *  - {Boolean} watchOnly
   */
  addDependencies(dependencies, buildOptions) {
    if (!Array.isArray(dependencies)) dependencies = [dependencies];

    const ignoredFiles = buildOptions.ignoredFiles || [];
    const resolveOptions = {
      fileExtensions: this.options.fileExtensions,
      type: this.type,
      sources: this.options.sources
    };

    dependencies.forEach(dependency => {
      // Inlined/sidecar dependencies are pre-resolved
      const filepath = dependency.filepath || _libFilejs_resolve(this.filepath, dependency.id, resolveOptions);

      // Unable to resolve filepath or create instance
      if (filepath === '') {
        _libFilejs_warn(`dependency ${ _libFilejs_strong(dependency.id) } for ${ _libFilejs_strong(this.id) } not found`, 3);
        return;
      }

      this.dependencyReferences.push(dependency);

      // Handle disabled, including native modules (force ignore of node_modules when watch only build)
      if (filepath === false || buildOptions.watchOnly && ~filepath.indexOf('node_modules')) {
        dependency.isDisabled = true;
        return;
      }

      const instance = this.options.fileFactory(filepath, this.options);

      dependency.file = instance;
      // Ignore if parent file, circular dependency, or ignored child file
      if (instance.isLocked || ~instance.dependencies.indexOf(this) || ~ignoredFiles.indexOf(filepath)) {
        dependency.isIgnored = true;
      } else if (!~this.dependencies.indexOf(instance)) {
        instance.isDependency = true;
        // Identify as inline-source dependency
        instance.isInline = 'stack' in dependency;
        this.dependencies.push(instance);
      }
    });
  }

  /**
   * Inline dependencyReferences
   */
  inlineDependencyReferences() {
    function inline(content, references) {
      let inlineContent;

      references.forEach(reference => {
        // Inline nested dependencies
        // Duplicates are allowed (not @import_once)
        inlineContent = reference.file.dependencyReferences.length ? inline(reference.file.content, reference.file.dependencyReferences) : reference.file.content;
        // Replace @import * with inlined content
        if (reference.context) content = content.replace(new RegExp(_libFilejs_regexpEscape(reference.context), 'mg'), inlineContent);
      });
      return content;
    }

    // TODO: remove comments?
    this.content = inline(this.content, this.dependencyReferences);
  }

  /**
   * Run workflow set based on 'type' and 'buildOptions'
   * @param {String} type
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
  run(type, buildOptions, fn) {
    if (!this.workflows[type]) return fn();

    const workflows = this.workflows[type].map((workflow, idx) => {
      return _libFilejs_callable(this, 'runWorkflow', type, idx, buildOptions);
    });

    _libFilejs_series(workflows, err => {
      if (err) return fn(err);
      // Return all dependencies
      fn(null, this.getAllDependencies(false));
    });
  }

  /**
   * Run workflow set for 'type' and 'buildOptions' on 'dependencies'
   * @param {String} type
   * @param {Object} buildOptions
   *  - {Boolean} bootstrap
   *  - {Boolean} boilerplate
   *  - {Boolean} browser
   *  - {Boolean} bundle
   *  - {Boolean} compress
   *  - {Array} ignoredFiles
   *  - {Boolean} helpers
   *  - {Boolean} watchOnly
   * @param {Array} [dependencies]
   * @param {Function} fn(err)
   */
  runForDependencies(type, buildOptions, dependencies, fn) {
    dependencies = dependencies || this.dependencies;
    _libFilejs_parallel(dependencies.map(dependency => {
      return _libFilejs_callable(dependency, 'run', type, buildOptions);
    }), fn);
  }

  /**
   * Run workflow tasks for 'type' and 'index'
   * @param {String} type
   * @param {Number} index
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
  runWorkflow(type, index, buildOptions, fn) {
    if (this.ran & _libFilejs_WORKFLOWS[type] * (index + 1)) return fn();

    const workflow = this.parseWorkflow(type, index, buildOptions);
    const tasks = workflow.map(task => {
      return task == 'runWorkflowForDependencies' ? _libFilejs_callable(this, task, type, index, buildOptions) : _libFilejs_callable(this, task, buildOptions);
    });

    _libFilejs_series(tasks, err => {
      if (err) return fn(err);
      this.ran |= _libFilejs_WORKFLOWS[type] * (index + 1);
      fn();
    });
  }

  /**
   * Run workflow tasks for 'type' and 'index' on dependencies
   * @param {String} type
   * @param {Number} index
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
   */
  runWorkflowForDependencies(type, index, buildOptions, fn) {
    _libFilejs_parallel(this.dependencies.map(dependency => {
      return _libFilejs_callable(dependency, 'runWorkflow', type, index, buildOptions);
    }), fn);
  }

  /**
   * Read and store file contents
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
   */
  load(buildOptions, fn) {
    if (!this.fileContent) {
      const content = _libFilejs_readFile(this.filepath, this.encoding);

      this.content = this.fileContent = content;
      this.hash = _libFilejs_md5(content);

      _libFilejs_debug(`load: ${ _libFilejs_strong(this.relpath) }`, 4);
    } else {
      this.content = this.fileContent;
    }

    if (fn) fn();
  }

  /**
   * Parse file contents for dependency references [no-op]
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
   */
  parse(buildOptions, fn) {
    _libFilejs_debug(`parse: ${ _libFilejs_strong(this.relpath) }`, 4);
    fn();
  }

  /**
   * Compile file contents [no-op]
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
   */
  compile(buildOptions, fn) {
    _libFilejs_debug(`compile: ${ _libFilejs_strong(this.relpath) }`, 4);
    fn();
  }

  /**
   * Compress file contents [no-op]
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
   */
  compress(buildOptions, fn) {
    _libFilejs_debug(`compress: ${ _libFilejs_strong(this.relpath) }`, 4);
    fn();
  }

  /**
   * Write file contents to disk
   * @param {String} filepath
   * @param {Object} buildOptions
   *  - {Boolean} bootstrap
   *  - {Boolean} boilerplate
   *  - {Boolean} browser
   *  - {Boolean} bundle
   *  - {Boolean} compress
   *  - {Array} ignoredFiles
   *  - {Boolean} helpers
   *  - {Boolean} watchOnly
   * @param {Function} fn(err, results)
   */
  write(filepath, buildOptions, fn) {
    this.run('writeable', buildOptions, err => {
      if (err) return fn(err);

      const relpath = _libFilejs_truncate(_libFilejs_path.relative(process.cwd(), filepath));

      _libFilejs_mkdir(filepath);
      _libFilejs_writeFile(filepath, this.content, 'utf8');

      _libFilejs_print(_libFilejs_chalk.green(`built ${ this.options.runtimeOptions.compress ? 'and compressed' : '' } ${ _libFilejs_strong(relpath) }`), 2);

      fn(null, {
        filepath,
        hash: _libFilejs_md5(this.content),
        helpers: this.getAllHelpers(),
        date: Date.now()
      });
    });
  }

  /**
   * Reset content
   * @param {Boolean} hard
   */
  reset(hard) {
    this.isDependency = false;
    this.isInline = false;
    this.isLocked = false;
    this.date = Date.now();
    this.dependencies = [];
    this.dependencyReferences = [];
    this.helpers = [];
    this.ran = 0;
    if (!hard) {
      this.content = this.fileContent;
    } else {
      this.content = this.fileContent = '';
    }
    _libFilejs_debug(`reset${ hard ? '(hard):' : ':' } ${ _libFilejs_strong(this.relpath) }`, 4);
  }

  /**
   * Destroy instance
   */
  destroy() {
    this.reset(true);
    this.options = null;
  }
};

/*== lib/config/buildParser.js ==*/
$m['lib/config/buildParser.js'] = {};
'use strict';

const { strong: _libconfigbuildParserjs_strong, warn: _libconfigbuildParserjs_warn } = $m['lib/utils/cnsl.js'];
const { indir: _libconfigbuildParserjs_indir, readdir: { sync: _libconfigbuildParserjs_readdir } } = $m['recur-fs/index.js#2.2.3'];
const _libconfigbuildParserjs_filetype = $m['lib/config/filetype.js'];
const _libconfigbuildParserjs_fs = require('fs');
const _libconfigbuildParserjs_glob = $m['glob/glob.js#7.0.6'].sync;
const _libconfigbuildParserjs_match = $m['minimatch/minimatch.js#3.0.3'];
const _libconfigbuildParserjs_path = require('path');
const _libconfigbuildParserjs_pluginLoader = $m['lib/config/pluginLoader.js'];

const _libconfigbuildParserjs_DEPRECATED_VERSION = 'this build format is no longer compatible with newer versions of Buddy. See https://github.com/popeindustries/buddy/blob/master/docs/config.md for help';
const _libconfigbuildParserjs_RE_GLOB = /[\*\[\{]/;

let _libconfigbuildParserjs_numBuildTargets;

$m['lib/config/buildParser.js'] = {
  /**
   * Parse and validate build targets of 'config'
   * @param {Object} config
   */
  parse(config) {
    if (!config.build) throw Error('missing build data');
    config.build = _libconfigbuildParserjs_parseBuild(config.build, config.caches, config.fileExtensions, config.fileFactory, config.runtimeOptions, config.server, config.sources);
  }
};

/**
 * Parse and validate build targets
 * @param {Object} build
 * @param {Object} caches
 * @param {Object} fileExtensions
 * @param {Function} fileFactory
 * @param {Object} runtimeOptions
 * @param {Object} server
 * @param {Array} sources
 * @param {Object} [parent]
 * @returns {Array}
 */
function _libconfigbuildParserjs_parseBuild(build, caches, fileExtensions, fileFactory, runtimeOptions, server, sources, parent) {
  if (!parent) _libconfigbuildParserjs_numBuildTargets = 0;
  // Deprecate sources
  if ('sources' in build) {
    _libconfigbuildParserjs_warn(`${ _libconfigbuildParserjs_strong('sources') } attribute is no longer supported. Use environment variable ${ _libconfigbuildParserjs_strong('BROWSER_PATH') } instead`, 1);
  }
  // Deprecate targets
  if ('targets' in build) {
    _libconfigbuildParserjs_warn(_libconfigbuildParserjs_DEPRECATED_VERSION);
    build = build.targets;
  }
  // Support basic mode with single build target
  if (!Array.isArray(build)) build = [build];

  return build.reduce((build, buildTarget) => {
    // Deprecate old formats
    if ('js' in buildTarget || 'css' in buildTarget || 'html' in buildTarget || 'targets' in buildTarget) {
      _libconfigbuildParserjs_warn(_libconfigbuildParserjs_DEPRECATED_VERSION);
      return build;
    }
    // Deprecate aliases
    if (buildTarget.alias) _libconfigbuildParserjs_warn(`${ _libconfigbuildParserjs_strong('alias') } attribute is no longer supported. Use package.json ${ _libconfigbuildParserjs_strong('browser') } field instead`, 1);
    // Deprecate modular
    if (buildTarget.modular) _libconfigbuildParserjs_warn(`${ _libconfigbuildParserjs_strong('modular') } attribute has been renamed to ${ _libconfigbuildParserjs_strong('bundle') }`, 1);
    // Deprecate sources
    if (buildTarget.sources) _libconfigbuildParserjs_warn(`${ _libconfigbuildParserjs_strong('sources') } attribute is no longer supported. Use environment variable ${ _libconfigbuildParserjs_strong('BROWSER_PATH') } instead`, 1);

    if (buildTarget.bootstrap == null) buildTarget.bootstrap = true;
    if (buildTarget.label == null) buildTarget.label = '';
    if (buildTarget.bundle == null || buildTarget.modular) buildTarget.bundle = true;
    buildTarget.sources = sources;
    buildTarget.hasChildren = false;
    buildTarget.hasParent = !!parent;
    buildTarget.index = ++_libconfigbuildParserjs_numBuildTargets;
    buildTarget.caches = caches;
    buildTarget.runtimeOptions = runtimeOptions;
    buildTarget.watchOnly = !buildTarget.output;
    if (!buildTarget.hasParent) {
      let pluginOptions = buildTarget.options || {};

      // Generate Babel options based on 'options' and target 'version'
      // Any versions that indicate server as target will return 'false'
      buildTarget.browser = _libconfigbuildParserjs_pluginLoader.loadBuildPlugins(pluginOptions, buildTarget.version);

      let fileFactoryOptions = { caches, fileExtensions, pluginOptions, runtimeOptions, sources };

      // Create fileFactory function with memoized options
      fileFactoryOptions.fileFactory = function createFile(filepath) {
        return fileFactory(filepath, fileFactoryOptions);
      };

      buildTarget.fileFactory = fileFactoryOptions.fileFactory;
    } else {
      // options/version only valid for root parent build targets
      if (buildTarget.options || buildTarget.version) _libconfigbuildParserjs_warn("child build targets inherit their root parent 'version' and 'options'");
      buildTarget.browser = parent.browser;
      buildTarget.fileFactory = parent.fileFactory;
      buildTarget.sources = parent.sources;
    }
    delete buildTarget.options;
    delete buildTarget.version;

    _libconfigbuildParserjs_parseInputOutput(buildTarget, fileExtensions, runtimeOptions);
    // Ignore build targets with nulled input (no grep match)
    if ('input' in buildTarget && buildTarget.input != null) {
      // Flag as app server target
      buildTarget.isAppServer = _libconfigbuildParserjs_isAppServer(buildTarget.inputpaths, server);
      // Prevents pruning of dependencies if non-bundle batch job
      buildTarget.writeableFilterFlag = !buildTarget.bundle && buildTarget.batch;
      // Store hooks
      if (buildTarget.before) buildTarget.before = _libconfigbuildParserjs_defineHook(buildTarget.before);
      if (buildTarget.afterEach) buildTarget.afterEach = _libconfigbuildParserjs_defineHook(buildTarget.afterEach);
      if (buildTarget.after) buildTarget.after = _libconfigbuildParserjs_defineHook(buildTarget.after);

      // Traverse child build targets
      if (buildTarget.build) {
        buildTarget.hasChildren = true;
        buildTarget.build = _libconfigbuildParserjs_parseBuild(buildTarget.build, caches, fileExtensions, fileFactory, runtimeOptions, server, sources, buildTarget);
        _libconfigbuildParserjs_parseChildInputpaths(buildTarget);
      }
      build.push(buildTarget);
    }

    return build;
  }, []);
}

/**
 * Parse input/output path(s) for 'buildTarget'
 * @param {Object} buildTarget
 * @param {Object} fileExtensions
 * @param {Object} runtimeOptions
 */
function _libconfigbuildParserjs_parseInputOutput(buildTarget, fileExtensions, runtimeOptions) {
  let outputs, outputIsDirectory;

  // Parse output
  if (buildTarget.output) {
    outputs = buildTarget.output;

    if (!Array.isArray(outputs)) outputs = [outputs];

    // Use compressed if specified
    if (runtimeOptions.compress && 'output_compressed' in buildTarget) {
      let outputsCompressed = buildTarget.output_compressed;

      if (!Array.isArray(outputsCompressed)) outputsCompressed = [outputsCompressed];
      if (outputsCompressed.length != outputs.length) {
        throw Error(`total number of outputs (${ _libconfigbuildParserjs_strong(buildTarget.output) }) do not match total number of compressed outputs (${ _libconfigbuildParserjs_strong(buildTarget.output_compressed) })`);
      }
      outputs = outputsCompressed;
      buildTarget.output = buildTarget.output_compressed;
    }

    outputIsDirectory = outputs.length == 1 && !_libconfigbuildParserjs_path.extname(outputs[0]).length;
  } else {
    buildTarget.outputpaths = [];
  }

  // Parse input
  if (buildTarget.input) {
    let allFileExtensions = [];
    let inputs = buildTarget.input;
    let inputsRelative = [];

    // Gather all extensions to allow for easier filtering
    for (const type in fileExtensions) {
      allFileExtensions.push(...fileExtensions[type]);
    }

    if (!Array.isArray(inputs)) inputs = [inputs];

    buildTarget.inputpaths = inputs.reduce((inputs, input) => {
      // Expand glob pattern
      if (_libconfigbuildParserjs_RE_GLOB.test(input)) {
        inputs = inputs.concat(_libconfigbuildParserjs_glob(input, { matchBase: true }));
      } else {
        inputs.push(input);
      }
      return inputs;
    }, []).reduce((inputs, input) => {
      input = _libconfigbuildParserjs_path.resolve(input);
      // Expand directory
      if (!_libconfigbuildParserjs_path.extname(input).length) {
        // Batch mode will change output behaviour if dir -> dir
        buildTarget.batch = true;
        inputs = inputs.concat(_libconfigbuildParserjs_readdir(input, (resource, stat) => {
          const isFile = stat.isFile();

          // Capture relative path for dir -> dir
          if (isFile) inputsRelative.push(_libconfigbuildParserjs_path.relative(input, resource));
          return isFile;
        }));
      } else {
        inputs.push(input);
        inputsRelative.push(_libconfigbuildParserjs_path.basename(input));
      }
      return inputs;
    }, []).filter((input, idx) => {
      const extension = _libconfigbuildParserjs_path.extname(input).slice(1);
      let include = true;

      // Include/exclude if grepping
      if (runtimeOptions.grep) {
        include = buildTarget.label == runtimeOptions.grep || _libconfigbuildParserjs_match(input, runtimeOptions.grep, { matchBase: true });
        if (runtimeOptions.invert) include = !include;
      }
      // Exclude unknown files
      if (!~allFileExtensions.indexOf(extension)) {
        include = false;
      }

      if (!include) inputsRelative.splice(idx, 1);
      return include;
    }).map(input => {
      const inputpath = _libconfigbuildParserjs_path.resolve(input);
      if (!_libconfigbuildParserjs_fs.existsSync(inputpath)) _libconfigbuildParserjs_warn(_libconfigbuildParserjs_strong(input) + ' doesn\'t exist', 1);
      return inputpath;
    });

    if (!buildTarget.inputpaths.length) {
      buildTarget.input = null;
      buildTarget.inputpaths = null;
      return;
    }

    if (outputs) {
      if (buildTarget.inputpaths.length != outputs.length && !outputIsDirectory) {
        throw Error(`unable to resolve inputs (${ _libconfigbuildParserjs_strong(buildTarget.input) }) with outputs (${ _libconfigbuildParserjs_strong(buildTarget[runtimeOptions.compress ? 'output_compressed' : 'output']) })`);
      }

      buildTarget.outputpaths = buildTarget.inputpaths.map((inputpath, idx) => {
        let outputpath = '';

        if (outputIsDirectory) {
          // Preserve relative paths when batching
          outputpath = _libconfigbuildParserjs_path.join(_libconfigbuildParserjs_path.resolve(outputs[0]), inputsRelative[idx]);
        } else {
          outputpath = _libconfigbuildParserjs_path.resolve(outputs[idx]);
        }

        const extension = _libconfigbuildParserjs_path.extname(outputpath);
        const type = _libconfigbuildParserjs_filetype(inputpath, fileExtensions);

        // Resolve missing extension
        if (!extension) outputpath += `.${ type }`;
        if (type != 'image' && extension != `.${ type }`) outputpath = outputpath.replace(extension, `.${ type }`);

        return outputpath;
      });
    }
  }
}

/**
 * Parse nested child input paths
 * @param {Object} buildTarget
 */
function _libconfigbuildParserjs_parseChildInputpaths(buildTarget) {
  function parse(build) {
    let inputpaths = [];

    build.forEach(buildTarget => {
      inputpaths = inputpaths.concat(buildTarget.inputpaths, buildTarget.build ? parse(buildTarget.build) : []);
    });

    return inputpaths;
  }

  buildTarget.childInputpaths = parse(buildTarget.build);
}

/**
 * Determine if 'inputpaths' contain server file
 * @param {Array} inputpaths
 * @param {Object} server
 * @returns {Boolean}
 */
function _libconfigbuildParserjs_isAppServer(inputpaths, server) {
  // Test if 'p' is in 'dirs'
  function contains(dirs, p) {
    if (!Array.isArray(dirs)) dirs = [dirs];
    return dirs.some(dir => {
      return _libconfigbuildParserjs_indir(dir, p);
    });
  }

  return server != undefined && server.file != undefined && contains(inputpaths, _libconfigbuildParserjs_path.resolve(server.file));
}

/**
 * Convert hook path or expression to Function
 * @param {String} hook
 * @returns {Function}
 */
function _libconfigbuildParserjs_defineHook(hook) {
  // Load file content if filepath
  if (_libconfigbuildParserjs_path.extname(hook) && (~hook.indexOf('/') || ~hook.indexOf(_libconfigbuildParserjs_path.sep))) {
    let hookpath;

    if (_libconfigbuildParserjs_fs.existsSync(hookpath = _libconfigbuildParserjs_path.resolve(hook))) {
      hook = _libconfigbuildParserjs_fs.readFileSync(hookpath, 'utf8');
    } else {
      throw Error('hook (' + _libconfigbuildParserjs_strong(hook) + ') isn\'t a valid path');
    }
  }

  return new Function('global', 'process', 'console', 'require', 'context', 'options', 'done', hook);
}

/*== lib/config/index.js ==*/
$m['lib/config/index.js'] = {};
'use strict';

const { error: _libconfigindexjs_error, print: _libconfigindexjs_print, strong: _libconfigindexjs_strong, warn: _libconfigindexjs_warn } = $m['lib/utils/cnsl.js'];
const { hunt: { sync: _libconfigindexjs_hunt } } = $m['recur-fs/index.js#2.2.3'];
const { identify: _libconfigindexjs_identify } = $m['lib/identify-resource/index.js'];
const _libconfigindexjs_buildParser = $m['lib/config/buildParser.js'];
const _libconfigindexjs_env = $m['lib/utils/env.js'];
const _libconfigindexjs_File = $m['lib/File.js'];
const _libconfigindexjs_fileCache = $m['lib/config/fileCache.js'];
const _libconfigindexjs_fileIDCache = $m['lib/identify-resource/cache.js'];
const _libconfigindexjs_filetype = $m['lib/config/filetype.js'];
const _libconfigindexjs_fs = require('fs');
const _libconfigindexjs_merge = $m['lodash/merge.js#4.15.0'];
const _libconfigindexjs_path = require('path');
const _libconfigindexjs_pluginLoader = $m['lib/config/pluginLoader.js'];
const _libconfigindexjs_utils = $m['lib/utils/index.js'];

const _libconfigindexjs_DEFAULT_MANIFEST = {
  js: 'buddy.js',
  json: 'buddy.json',
  pkgjson: 'package.json'
};

/**
 * Retrieve new instance of Config
 * @param {String|Object} [configpath]
 * @param {Object} [runtimeOptions]
 * @returns {Config}
 */
$m['lib/config/index.js'] = function configFactory(configpath, runtimeOptions) {
  return new _libconfigindexjs_Config(configpath, runtimeOptions);
};

class _libconfigindexjs_Config {
  /**
   * Constructor
   * @param {String|Object} [configpath]
   * @param {Object} [runtimeOptions]
   */
  constructor(configpath, runtimeOptions) {
    const version = require(_libconfigindexjs_path.resolve(__dirname, '../../package.json')).version;
    let data;

    if ('string' == typeof configpath || configpath == null) {
      this.url = _libconfigindexjs_locateConfig(configpath);
      data = require(this.url);

      // Set current directory to location of file
      process.chdir(_libconfigindexjs_path.dirname(this.url));
      _libconfigindexjs_print('loaded config ' + _libconfigindexjs_strong(this.url), 0);

      // Passed in JSON object
    } else {
      this.url = '';
      data = configpath;
    }
    // Package.json
    if (data.buddy) data = data.buddy;
    // Handle super simple mode
    if (data.input) data = { build: [data] };

    _libconfigindexjs_env('VERSION', version);

    this.build = [];
    this.fileDefinitionByExtension = {};
    this.fileExtensions = {};
    this.runtimeOptions = _libconfigindexjs_merge({
      compress: false,
      deploy: false,
      grep: false,
      invert: false,
      reload: false,
      script: false,
      serve: false,
      watch: false,
      verbose: false
    }, runtimeOptions);
    this.script = '';
    this.server = {
      directory: '.',
      port: 8080
    };
    this.sources = _libconfigindexjs_parseSources(this);
    this.version = version;
    this.caches = {
      fileInstances: _libconfigindexjs_fileCache(this.runtimeOptions.watch),
      fileIDs: _libconfigindexjs_fileIDCache,
      clear: _libconfigindexjs_fileIDCache.clear
    };
    this.fileFactory = this.fileFactory.bind(this);

    // Merge config file data
    _libconfigindexjs_merge(this, data);

    // Load default/installed plugins
    // Generates fileExtensions/types used to validate build
    _libconfigindexjs_pluginLoader.loadPluginModules(this, _libconfigindexjs_parsePlugins(this));
    // Parse build data
    _libconfigindexjs_buildParser.parse(this);
  }

  /**
   * Retrieve File instance for 'filepath'
   * @param {String} filepath
   * @param {Object} options
   *  - {Object} caches
   *  - {Object} fileExtensions
   *  - {Function} fileFactory
   *  - {Object} pluginOptions
   *  - {Object} runtimeOptions
   *  - {Array} sources
   * @returns {File}
   */
  fileFactory(filepath, options) {
    const { caches, fileExtensions, sources } = options;

    // Retrieve cached
    if (caches.fileInstances.hasFile(filepath)) return caches.fileInstances.getFile(filepath);

    const extension = _libconfigindexjs_path.extname(filepath).slice(1);
    const id = _libconfigindexjs_identify(filepath, { fileExtensions, sources, type: _libconfigindexjs_filetype(filepath, fileExtensions) });
    const ctor = this.fileDefinitionByExtension[extension];

    if (!id) throw Error(`unable to create file for: ${ _libconfigindexjs_strong(filepath) }`);

    const file = new ctor(id, filepath, options);

    caches.fileInstances.addFile(file);
    // Warn of multiple versions
    if (caches.fileIDs.hasMultipleVersions(id)) {
      _libconfigindexjs_warn(`more than one version of ${ _libconfigindexjs_strong(id.split('#')[0]) } exists (${ _libconfigindexjs_strong(file.relpath) })`, 3);
    }

    return file;
  }

  /**
   * Register file 'extensions' for 'type'
   * @param {Array} extensions
   * @param {String} type
   */
  registerFileExtensionsForType(extensions, type) {
    if (!this.fileExtensions[type]) this.fileExtensions[type] = [];
    this.fileExtensions[type].push(...extensions);
  }

  /**
   * Register target 'version' for 'type'
   * @param {String} version
   * @param {Object} options
   * @param {String} type
   */
  registerTargetVersionForType(version, options, type) {
    if (type == 'js') {
      _libconfigindexjs_pluginLoader.addPreset('babel', version, options);
    }
  }

  /**
   * Register file definitiion and 'extensions' for 'type'
   * @param {Function} define
   * @param {Array} extensions
   * @param {String} type
   */
  registerFileDefinitionAndExtensionsForType(define, extensions, type) {
    const def = define(this.fileDefinitionByExtension[type] || _libconfigindexjs_File, _libconfigindexjs_utils);

    if (extensions) {
      this.registerFileExtensionsForType(extensions, type);
      extensions.forEach(extension => {
        this.fileDefinitionByExtension[extension] = def;
      });
    }
  }

  /**
   * Extend file definitiion for 'extensions' or 'type'
   * @param {Function} extend
   * @param {Array} extensions
   * @param {String} type
   * @returns {null}
   */
  extendFileDefinitionForExtensionsOrType(extend, extensions, type) {
    const key = extensions ? extensions[0] : this.fileExtensions[type][0];
    const def = this.fileDefinitionByExtension[key];

    if (!def) return _libconfigindexjs_error(`no File type available for extension for ${ _libconfigindexjs_strong(key) }`);

    extend(def.prototype, _libconfigindexjs_utils);
  }

  /**
   * Destroy instance
   */
  destroy() {
    this.caches.fileInstances.flush();
    this.caches.fileIDs.clear();
  }
}

/**
 * Locate the configuration file
 * Walks the directory tree if no file/directory specified
 * @param {String} [url]
 * @returns {String}
 */
function _libconfigindexjs_locateConfig(url) {
  let configpath = '';

  function check(dir) {
    // Support js, json, and package.json
    const urljs = _libconfigindexjs_path.join(dir, _libconfigindexjs_DEFAULT_MANIFEST.js);
    const urljson = _libconfigindexjs_path.join(dir, _libconfigindexjs_DEFAULT_MANIFEST.json);
    const urlpkgjson = _libconfigindexjs_path.join(dir, _libconfigindexjs_DEFAULT_MANIFEST.pkgjson);
    let urlFinal;

    if (_libconfigindexjs_fs.existsSync(urlFinal = urljs) || _libconfigindexjs_fs.existsSync(urlFinal = urljson) || _libconfigindexjs_fs.existsSync(urlFinal = urlpkgjson)) {
      return urlFinal;
    }

    return '';
  }

  if (url) {
    configpath = _libconfigindexjs_path.resolve(url);
    try {
      // Try default file name if passed directory
      if (!_libconfigindexjs_path.extname(configpath).length || _libconfigindexjs_fs.statSync(configpath).isDirectory()) {
        configpath = check(configpath);
        if (!configpath) throw Error('no default found');
      }
    } catch (err) {
      throw Error(_libconfigindexjs_strong('buddy') + ' config not found in ' + _libconfigindexjs_strong(_libconfigindexjs_path.dirname(url)));
    }

    // No url specified
  } else {
    try {
      // Find the first instance of a DEFAULT file based on the current working directory
      configpath = _libconfigindexjs_hunt(process.cwd(), (resource, stat) => {
        if (stat.isFile()) {
          const basename = _libconfigindexjs_path.basename(resource);

          return basename == _libconfigindexjs_DEFAULT_MANIFEST.js || basename == _libconfigindexjs_DEFAULT_MANIFEST.json || basename == _libconfigindexjs_DEFAULT_MANIFEST.pkgjson;
        }
      }, true);
    } catch (err) {
      if (!configpath) throw Error(_libconfigindexjs_strong('buddy') + ' config not found');
    }
  }

  return configpath;
}

/**
 * Parse sources
 * @param {Config} config
 * @returns {Array}
 */
function _libconfigindexjs_parseSources(config) {
  // Default to current dir
  let sources = ['.'];

  // Handle env var
  if (process.env.BROWSER_PATH) {
    const paths = ~process.env.BROWSER_PATH.indexOf(':') ? process.env.BROWSER_PATH.split(':') : [process.env.BROWSER_PATH];

    sources.push(...paths);
  }

  return sources.map(source => _libconfigindexjs_path.resolve(source));
}

/**
 * Parse plugins defined in 'config'
 * @param {Config} config
 * @returns {Array}
 */
function _libconfigindexjs_parsePlugins(config) {
  let plugins = [];

  function parse(plugins) {
    return plugins.map(plugin => {
      if ('string' == typeof plugin) plugin = _libconfigindexjs_path.resolve(plugin);
      return plugin;
    });
  }

  // Handle plugin paths defined in config file
  if (config.plugins) {
    plugins.push(...parse(config.plugins));
    delete config.plugins;
  }
  // Handle plugin paths/functions defined in runtime options
  if (config.runtimeOptions.plugins) {
    plugins.push(...parse(config.runtimeOptions.plugins));
    delete config.runtimeOptions.plugins;
  }

  return plugins;
}

/*== node_modules/lodash/compact.js ==*/
$m['lodash/compact.js#4.15.0'] = {};
/**
 * Creates an array with all falsey values removed. The values `false`, `null`,
 * `0`, `""`, `undefined`, and `NaN` are falsey.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to compact.
 * @returns {Array} Returns the new array of filtered values.
 * @example
 *
 * _.compact([0, 1, false, 2, '', 3]);
 * // => [1, 2, 3]
 */
function _lodashcompactjs4150_compact(array) {
  var index = -1,
      length = array ? array.length : 0,
      resIndex = 0,
      result = [];

  while (++index < length) {
    var value = array[index];
    if (value) {
      result[resIndex++] = value;
    }
  }
  return result;
}

$m['lodash/compact.js#4.15.0'] = _lodashcompactjs4150_compact;

/*== lib/utils/unique.js ==*/
$m['lib/utils/unique.js'] = {};
'use strict';

const { regexpEscape: _libutilsuniquejs_regexpEscape } = $m['lib/utils/string.js'];
const _libutilsuniquejs_fs = require('fs');
const _libutilsuniquejs_md5 = $m['md5/md5.js#2.2.1'];
const _libutilsuniquejs_path = require('path');

const _libutilsuniquejs_RE_HASH_TOKEN = /%hash%/;
const _libutilsuniquejs_RE_TOKEN = /%(?:hash|date)%/;

$m['lib/utils/unique.js'] = {
  /**
   * Find file matching 'pattern'
   * @param {String} pattern
   * @returns {String}
   */
  find(pattern) {
    pattern = _libutilsuniquejs_path.resolve(pattern);

    // Limit scope to containing directory
    const dir = _libutilsuniquejs_path.dirname(pattern);
    let files, reToken;

    // Matches {hash} or {date}
    if (reToken = _libutilsuniquejs_RE_TOKEN.exec(pattern)) {
      try {
        files = _libutilsuniquejs_fs.readdirSync(dir);
      } catch (err) {
        // Directory doesn't exist
        return '';
      }

      // Generate regexp with pattern as wildcard
      const re = new RegExp(_libutilsuniquejs_regexpEscape(pattern).replace(reToken[0], _libutilsuniquejs_RE_HASH_TOKEN.test(pattern) ? '[a-f0-9]{32}' : '[0-9]{13,}'));

      for (let i = 0, n = files.length; i < n; i++) {
        const filepath = _libutilsuniquejs_path.resolve(dir, files[i]);

        if (re.test(filepath)) return filepath;
      }
    }

    return '';
  },

  /**
   * Generate unique filepath from 'pattern'
   * @param {String} pattern
   * @param {String|Boolean} content
   * @returns {String}
   */
  generate(pattern, content) {
    pattern = _libutilsuniquejs_path.resolve(pattern);

    let reToken, wildcard;

    if (reToken = _libutilsuniquejs_RE_TOKEN.exec(pattern)) {
      wildcard = reToken[0];
      if (wildcard == '%hash%') {
        // Remove if content == false
        pattern = pattern.replace(wildcard, content ? _libutilsuniquejs_md5(content) : '');
      } else if (wildcard == '%date%') {
        pattern = pattern.replace(wildcard, content ? Date.now() : '');
      }
    }

    return pattern;
  },

  /**
   * Determine whether 'pattern' is supported
   * @param {String} pattern
   * @returns {Boolean}
   */
  isUniquePattern(pattern) {
    return _libutilsuniquejs_RE_TOKEN.test(pattern);
  }
};

/*== lib/utils/pathname.js ==*/
$m['lib/utils/pathname.js'] = {};
'use strict';

const _libutilspathnamejs_path = require('path');

/**
 * Retrieve path name (dirname/filename) of 'p'
 * @param {String} p
 * @returns {String}
 */
$m['lib/utils/pathname.js'] = function pathname(p) {
  p = _libutilspathnamejs_path.resolve(p);

  let dir = _libutilspathnamejs_path.resolve(p, '..');

  if (dir == process.cwd()) dir = '.';

  return `${ _libutilspathnamejs_path.basename(dir) }/${ _libutilspathnamejs_path.basename(p) }`;
};

/*== lib/build.js ==*/
$m['lib/build.js'] = {};
'use strict';

const { debug: _libbuildjs_debug, print: _libbuildjs_print, start: _libbuildjs_start, stop: _libbuildjs_stop, strong: _libbuildjs_strong, warn: _libbuildjs_warn } = $m['lib/utils/cnsl.js'];
const { parallel: _libbuildjs_parallel, series: _libbuildjs_series, waterfall: _libbuildjs_waterfall } = $m['async/dist/async.js#2.0.1'];
const _libbuildjs_callable = $m['lib/utils/callable.js'];
const _libbuildjs_chalk = $m['chalk/index.js#1.1.3'];
const _libbuildjs_distinct = $m['lodash/uniq.js#4.15.0'];
const _libbuildjs_env = $m['lib/utils/env.js'];
const _libbuildjs_flatten = $m['lodash/flatten.js#4.15.0'];
const _libbuildjs_fs = require('fs');
const _libbuildjs_merge = $m['lodash/merge.js#4.15.0'];
const _libbuildjs_pathname = $m['lib/utils/pathname.js'];
const _libbuildjs_unique = $m['lib/utils/unique.js'];

const _libbuildjs_MAX_INPUT_STRING_LENGTH = 3;

/**
 * Build instance factory
 * @param {Object} props
 *  - {Boolean} bootstrap
 *  - {Object} build
 *  - {Boolean} bundle
 *  - {Object} caches
 *  - {Array} childInputpaths
 *  - {Function} fileFactory
 *  - {Boolean} hasChildren
 *  - {Boolean} hasParent
 *  - {Number} index
 *  - {String} input
 *  - {Array} inputpaths
 *  - {Boolean} isAppServer
 *  - {String} label
 *  - {String} output
 *  - {Array} outputpaths
 *  - {Object} runtimeOptions
 *  - {Array} sources
 *  - {Boolean} watchOnly
 *  - {Boolean} writeableFilterFlag
 * @returns {Build}
 */
$m['lib/build.js'] = function buildFactory(props) {
  return new _libbuildjs_Build(props);
};

class _libbuildjs_Build {
  /**
   * Constructor
   * @param {Object} props
   *  - {Boolean} bootstrap
   *  - {Boolean} browser
   *  - {Object} build
   *  - {Boolean} bundle
   *  - {Object} caches
   *  - {Array} childInputpaths
   *  - {Function} fileFactory
   *  - {Boolean} hasChildren
   *  - {Boolean} hasParent
   *  - {Number} index
   *  - {String} input
   *  - {Array} inputpaths
   *  - {Boolean} isAppServer
   *  - {String} label
   *  - {String} output
   *  - {Array} outputpaths
   *  - {Object} runtimeOptions
   *  - {Array} sources
   *  - {Boolean} watchOnly
   *  - {Boolean} writeableFilterFlag
   */
  constructor(props) {
    _libbuildjs_merge(this, props);
    this.id = this.label || this.index != null && this.index.toString();
    this.referencedFiles = [];
    this.processFilesOptions = {
      // TODO: should only parent include?
      boilerplate: this.browser,
      bootstrap: this.bootstrap,
      browser: this.browser,
      bundle: this.bundle,
      compress: this.runtimeOptions.compress,
      // TODO: include in child if watching?
      helpers: !this.hasParent && this.bundle,
      ignoredFiles: this.childInputpaths,
      watchOnly: this.watchOnly
    };

    // Handle printing long input arrays
    if (this.inputpaths.length > 1) {
      this.inputString = this.inputpaths.map(input => {
        return _libbuildjs_pathname(input);
      });
      // Trim long lists
      if (this.inputString.length > _libbuildjs_MAX_INPUT_STRING_LENGTH) {
        const remainder = this.inputString.length - _libbuildjs_MAX_INPUT_STRING_LENGTH;

        this.inputString = `${ this.inputString.slice(0, _libbuildjs_MAX_INPUT_STRING_LENGTH).join(', ') } ...and ${ remainder } other${ remainder > 1 ? 's' : '' }`;
      } else {
        this.inputString = this.inputString.join(', ');
      }
    } else {
      this.inputString = _libbuildjs_pathname(this.inputpaths[0]);
    }

    _libbuildjs_debug(`created Build instance with input: ${ _libbuildjs_strong(this.inputString) } and output: ${ _libbuildjs_strong(this.output) }`, 2);
  }

  /**
   * Run build
   * @param {Function} fn(err, results)
   * @returns {null}
   */
  run(fn) {
    // Skip if watch only and not running a watch build
    if (this.watchOnly && !this.runtimeOptions.watch) return fn();

    const timerID = this.inputpaths[0];
    const type = this.watchOnly && this.runtimeOptions.watch ? 'watching ' : 'building ';

    this.referencedFiles = [];

    _libbuildjs_start(timerID);

    _libbuildjs_print(`${ type } ${ _libbuildjs_strong(this.inputString) } ${ this.output ? ' to ' + _libbuildjs_strong(this.output) : '' }`, 1);

    _libbuildjs_waterfall([
    // Execute 'before' hook
    _libbuildjs_callable(this, 'executeHook', 'before', [this], this.inputpaths),
    // Init file instances
    _libbuildjs_callable(this, 'initFiles' /* , filepaths */),
    // Process files
    _libbuildjs_callable(this, 'processFiles' /* , files */),
    // Print
    _libbuildjs_callable(this, 'printProgress', timerID /* , referencedFiles */),
    // Execute 'afterEach' hooks
    _libbuildjs_callable(this, 'executeHook', 'afterEach' /* , referencedFiles */),
    // Build child targets
    _libbuildjs_callable(this, 'runChildren' /* , referencedFiles */),
    // Write files
    _libbuildjs_callable(this, 'writeFiles' /* , referencedFiles, childResults */),
    // Execute 'after' hook
    _libbuildjs_callable(this, 'executeHook', 'after', [this] /* , results */),
    // Reset
    _libbuildjs_callable(this, 'reset' /* , results */)], fn);
  }

  /**
   * Parse source 'filepaths'
   * @param {Array} filepaths
   * @param {Function} fn(err, files)
   */
  initFiles(filepaths, fn) {
    fn(null, filepaths.reduce((files, filepath) => {
      const file = this.fileFactory(filepath, this.fileFactoryOptions);

      if (!file) {
        _libbuildjs_warn(`${ _libbuildjs_strong(filepath) } not found in project source`, 4);
      } else {
        files.push(file);
      }
      return files;
    }, []));
  }

  /**
   * Process 'files'
   * @param {Array} files
   * @param {Function} fn(err, files)
   */
  processFiles(files, fn) {
    _libbuildjs_env('INPUT', files, this.id);
    _libbuildjs_env('INPUT_HASH', files, this.id);
    _libbuildjs_env('INPUT_DATE', files, this.id);

    _libbuildjs_parallel(files.map(file => _libbuildjs_callable(file, 'run', 'standard', this.processFilesOptions)), (err, results) => {
      if (err) return fn(err);
      this.referencedFiles = _libbuildjs_distinct(files.concat(_libbuildjs_flatten(results)));
      fn(null, this.referencedFiles);
    });
  }

  /**
   * Print progress
   * @param {String} timerID
   * @param {Array} files
   * @param {Function} fn(err, files)
   */
  printProgress(timerID, files, fn) {
    _libbuildjs_print('[processed ' + _libbuildjs_strong(files.length) + (files.length > 1 ? ' files' : ' file') + ' in ' + _libbuildjs_chalk.cyan(_libbuildjs_stop(timerID) + 'ms') + ']', 2);
    fn(null, files);
  }

  /**
   * Run child builds
   * @param {Array} files
   * @param {Function} fn(err, files, childResults)
   * @returns {null}
   */
  runChildren(files, fn) {
    if (!this.hasChildren) return fn(null, files, []);

    // Lock files to prevent inclusion in downstream targets
    this.lock(this.referencedFiles);
    _libbuildjs_series(this.build.map(build => _libbuildjs_callable(build, 'build')), (err, results) => {
      if (err) return fn(err);

      this.unlock(this.referencedFiles);
      fn(files, _libbuildjs_flatten(results || []));
    });
  }

  /**
   * Write content for 'files'
   * @param {Array} files
   * @param {Array} childResults
   * @param {Function} fn(err, results)
   */
  writeFiles(files, childResults, fn) {
    const writeable = files.filter(file => file.isWriteable(this.writeableFilterFlag)).reduce((writeable, file) => {
      let filepath = '';

      for (let i = 0, n = this.inputpaths.length; i < n; i++) {
        if (this.inputpaths[i] == file.filepath) {
          filepath = this.outputpaths[i];
          break;
        }
      }

      // Don't write if no output path
      if (filepath) {
        // Handle generating unique paths
        if (_libbuildjs_unique.isUniquePattern(filepath)) {
          // Remove existing
          const existing = _libbuildjs_unique.find(filepath);

          if (existing && _libbuildjs_fs.existsSync(existing)) _libbuildjs_fs.unlinkSync(existing);

          // Generate unique path
          // Disable during watch otherwise css reloading won't work
          filepath = _libbuildjs_unique.generate(filepath, !this.runtimeOptions.watch ? file.content : false);
        }

        writeable.push(_libbuildjs_callable(file, 'write', filepath, this.processFilesOptions));
      }

      return writeable;
    }, []);

    // Results are [{ filepath, hash, date, helpers }]
    _libbuildjs_parallel(writeable, (err, results) => {
      if (err) return fn(err);

      _libbuildjs_env('OUTPUT', results.map(item => item.filepath), this.id);
      _libbuildjs_env('OUTPUT_HASH', results.map(item => item.hash), this.id);
      _libbuildjs_env('OUTPUT_DATE', results.map(item => item.date), this.id);

      fn(null, results.concat(childResults));
    });
  }

  /**
   * Reset referenced files
   * @param {Array} results
   * @param {Array} fn(err, results)
   */
  reset(results, fn) {
    this.referencedFiles.forEach(file => file.reset());
    this.caches.clear();
    fn(null, results);
  }

  /**
   * Set lock flag for 'files'
   * @param {Array} files
   */
  lock(files) {
    files.forEach(file => {
      file.isLocked = true;
    });
  }

  /**
   * Unset lock flag for 'files'
   * @param {Array} files
   */
  unlock(files) {
    files.forEach(file => {
      file.isLocked = false;
    });
  }

  /**
   * Determine if 'file' is a referenced file (child targets included)
   * @param {File} file
   * @returns {Boolean}
   */
  hasFile(file) {
    if (~this.referencedFiles.indexOf(file)) return true;

    if (this.hasChildren) {
      for (let i = 0, n = this.build.length; i < n; i++) {
        if (this.build[i].hasFile(file)) return true;
      }
    }

    return false;
  }

  /**
   * Execute the 'hook' function for 'contexts'
   * @param {String} hook
   * @param {Array} contexts
   * @param {Object} [passthrough]
   * @param {Function} fn(err)
   * @returns {null}
   */
  executeHook(hook, contexts, passthrough, fn) {
    // Handle missing passthrough value
    if (!fn && 'function' == typeof passthrough) {
      fn = passthrough;
      passthrough = contexts;
    }
    if (!this[hook]) return fn(null, passthrough);

    _libbuildjs_print('executing ' + hook + ' hook...', 2);
    _libbuildjs_parallel(contexts.map(context => {
      // Make global objects available to the function
      return _libbuildjs_callable(this, hook, global, process, console, require, context, this.runtimeOptions);
    }), err => {
      fn(err, passthrough);
    });
  }
}

/*== lib/buddy.js ==*/
$m['lib/buddy.js'] = {};
'use strict';

const { series: _libbuddyjs_series } = $m['async/dist/async.js#2.0.1'];
const { spawn: _libbuddyjs_spawn } = require('child_process');
const _libbuddyjs_buildFactory = $m['lib/build.js'];
const _libbuddyjs_callable = $m['lib/utils/callable.js'];
const _libbuddyjs_chalk = $m['chalk/index.js#1.1.3'];
const _libbuddyjs_cnsl = $m['lib/utils/cnsl.js'];
const _libbuddyjs_compact = $m['lodash/compact.js#4.15.0'];
const _libbuddyjs_configFactory = $m['lib/config/index.js'];
const _libbuddyjs_flatten = $m['lodash/flatten.js#4.15.0'];
const _libbuddyjs_path = require('path');

const { BELL: _libbuddyjs_BELL, debug: _libbuddyjs_debug, error: _libbuddyjs_error, print: _libbuddyjs_print, start: _libbuddyjs_start, stop: _libbuddyjs_stop, strong: _libbuddyjs_strong } = _libbuddyjs_cnsl;
let _libbuddyjs_serverfarm = null;

/**
 * Buddy instance factory
 * @param {String|Object} configpath [file name | JSON Object]
 * @param {Object} options
 * @returns {Buddy}
 */
$m['lib/buddy.js'] = function buddyFactory(configpath, options) {
  return new _libbuddyjs_Buddy(configpath, options);
};

class _libbuddyjs_Buddy {
  /**
   * Constructor
   * Initialize based on configuration located at 'configpath'
   * The directory tree will be walked if no 'configpath' specified
   * @param {String|Object} configpath [file name | JSON Object]
   * @param {Object} runtimeOptions
   */
  constructor(configpath, runtimeOptions = {}) {
    // Set console behaviour
    _libbuddyjs_cnsl.verbose = runtimeOptions.verbose;

    this.building = false;
    this.config = _libbuddyjs_configFactory(configpath, runtimeOptions);
    this.onFileCacheChange = this.onFileCacheChange.bind(this);

    // Setup watch
    if (this.config.runtimeOptions.watch) {
      this.config.caches.fileInstances.on('change', this.onFileCacheChange);
      // TODO: add error listener
    }

    // Initialize builds
    this.builds = this.initBuilds(this.config);
  }

  /**
   * Build sources based on build targets specified in config
   * @param {Function} fn
   */
  build(fn) {
    _libbuddyjs_start('build');

    // Build targets
    this.run(this.builds, (err, results) => {
      if (err) return fn ? fn(err) : _libbuddyjs_error(err, 2);
      _libbuddyjs_print(`completed build in ${ _libbuddyjs_chalk.cyan(_libbuddyjs_stop('build') / 1000 + 's') }`, 1);
      // Run script
      this.executeScript();
      if (fn) fn(null, results.map(result => result.filepath));
    });
  }

  /**
   * Build sources and watch for changes
   * @param {Function} fn
   */
  watch(fn) {
    // Build first
    this.build((err, results) => {
      if (err) return fn ? fn(err) : _libbuddyjs_error(err, 2);

      if (this.config.runtimeOptions.reload || this.config.runtimeOptions.serve) {
        // Protect against uninstalled add-on
        try {
          // Hide from buddy parsing
          _libbuddyjs_serverfarm = $m['lib/utils/index.js'];
        } catch (tryError) {
          return _libbuddyjs_error('buddy-server add-on missing. Install \'buddy-server\' with npm', 2, true);
        }
        // Start servers
        _libbuddyjs_serverfarm.start(this.config.runtimeOptions.serve, this.config.runtimeOptions.reload, this.config.server, serverError => {
          if (serverError) {/* Ignore and keep watching */}
        });
      } else {
        _libbuddyjs_print('watching files for changes:', 1);
      }
    });
  }

  /**
   * Cleanup after unhandled exception
   */
  exceptionalCleanup() {
    if (_libbuddyjs_serverfarm) _libbuddyjs_serverfarm.stop();
  }

  /**
   * Reset
   */
  destroy() {
    this.exceptionalCleanup();
    this.config.destroy();

    this.config = null;
    this.builds = [];
  }

  /**
   * Recursively initialize all valid build instances specified in configuration
   * @param {Options} config
   * @returns {Array}
   */
  initBuilds(config) {
    function init(builds) {
      return builds.map(build => {
        const instance = _libbuddyjs_buildFactory(build);

        // Traverse
        if (instance.hasChildren) instance.build = init(instance.build);
        return instance;
      });
    }

    return init(config.build);
  }

  /**
   * Run all build targets
   * @param {Array} builds
   * @param {Function} fn(err, results)
   */
  run(builds, fn) {
    this.building = true;

    // Execute builds in sequence
    _libbuddyjs_series(builds.map(build => _libbuddyjs_callable(build, 'run')), (err, results) => {
      if (err) return fn(err);

      this.building = false;
      fn(null, _libbuddyjs_compact(_libbuddyjs_flatten(results)));
    });
  }

  /**
   * Run the script defined in config 'script'
   */
  executeScript() {
    let hasErrored = false;
    let args, command, script;

    if (this.config.runtimeOptions.script && (script = this.config.script)) {
      script = script.split(' ');
      command = script.shift();
      args = script;

      _libbuddyjs_print('executing script...', 1);
      _libbuddyjs_debug(`execute: ${ _libbuddyjs_strong(this.config.script) }`, 3);

      script = _libbuddyjs_spawn(command, args, { cwd: process.cwd() });

      script.stdout.on('data', data => {
        process.stdout.write(data.toString());
      });

      script.stderr.on('data', data => {
        process.stderr.write(data.toString());
        hasErrored = true;
      });

      script.on('close', code => {
        if (hasErrored) process.stderr.write(_libbuddyjs_BELL);
      });
    }
  }

  /**
   * Handle cache changes
   * @param {File} file
   */
  onFileCacheChange(file) {
    const now = new Date();
    const builds = this.builds.filter(build => build.hasFile(file));
    // Determine if any changes to app server code that needs a restart
    const servers = builds.filter(build => build.isAppServer);

    if (!this.building) {
      _libbuddyjs_print(`[${ now.toLocaleTimeString() }] ${ _libbuddyjs_chalk.yellow('changed') } ${ _libbuddyjs_strong(_libbuddyjs_path.relative(process.cwd(), file.filepath)) }`, 1);

      _libbuddyjs_start('watch');

      this.run(builds, (err, filepaths) => {
        // Don't throw
        if (err) return _libbuddyjs_error(err, 2, false);
        if (_libbuddyjs_serverfarm) {
          // Trigger partial refresh if only 1 css file, full reload if not
          const filepath = filepaths.length == 1 && _libbuddyjs_path.extname(filepaths[0]) == '.css' ? filepaths[0] : 'foo.js';

          // Refresh browser
          if (!servers.length) return _libbuddyjs_serverfarm.refresh(_libbuddyjs_path.basename(filepath));

          // Restart app server
          _libbuddyjs_serverfarm.restart(err => {
            if (err) {} /* ignore */
            // Refresh browser
            _libbuddyjs_serverfarm.refresh(_libbuddyjs_path.basename(filepath));
          });
        }
        _libbuddyjs_print(`completed build in ${ _libbuddyjs_chalk.cyan(_libbuddyjs_stop('watch') / 1000 + 's') }`, 1);
        // Run test script
        this.executeScript();
      });
    }
  }
}
})()