'use strict';

// TODO: error handling

const escape = require('../utils/reEscape.js');
const inlineRun = require('inline-source/lib/run');

const RE_CSS_COMMENT_LINES = /((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/))$/gm;

/**
 * Inline all inlineable dependency 'references'
 * @param {File} file
 * @param {Array} references
 * @param {Boolean} compress
 * @param {Function} fn(err, content)
 */
module.exports = function (file, references, compress, fn) {
  switch (file.type) {
    case 'js':
      fn(null, inlineJS(file.content, references));
      break;
    case 'css':
      fn(null, inlineCSS(file.content, references));
      break;
    default:
      inlineHTML(file.content, references, compress, fn);
  }
};

/**
 * Inline JS json content
 * @param {String} content
 * @param {Array} references
 * @returns {String}
 */
function inlineJS (content, references) {
  let inlineContent;

  references.forEach((reference) => {
    inlineContent = '';
    // Handle disabled
    if (reference.isDisabled) {
      inlineContent = '{}';
    // Inline json
    } else if (reference.instance.type == 'json') {
      inlineContent = reference.instance.content || '{}';
    }
    // Replace require(*) with inlined content
    if (inlineContent) content = content.replace(new RegExp(escape(reference.match), 'mg'), inlineContent);
  });

  return content;
}

/**
 * Inline CSS @import content
 * @param {String} content
 * @param {Array} references
 * @returns {String}
 */
function inlineCSS (content, references) {
  function inline (inlineContent, inlineReferences) {
    let inlined;

    inlineReferences.forEach((reference) => {
      // Inline nested dependencies
      // Duplicates are allowed (not @import_once)
      inlined = reference.instance.dependencyReferences.length
        ? inline(reference.instance.content, reference.instance.dependencyReferences)
        : reference.instance.content;
      // Replace @import with inlined content
      inlineContent = inlineContent.replace(new RegExp(escape(reference.match), 'mg'), inlined);
    });

    return inlineContent;
  }

  // Remove comments
  // Less/Stylus? leaves comments behind after processing
  content = inline(content, references)
    .replace(RE_CSS_COMMENT_LINES, '');

  return content;
}

/**
 * Inline HTML content
 * @param {String} content
 * @param {Array} references
 * @param {Boolean} compress
 * @param {Function} fn(err, content)
 */
function inlineHTML (content, references, compress, fn) {
  // Find references acquired via inline-source
  const sources = references.filter((reference) => {
    if ('stack' in reference) {
      // Copy to override inline-source behaviour
      reference.fileContent = reference.instance.content;
      reference.compress = compress;
      return true;
    }
    return false;
  });

  if (sources.length) {
    // Update transformed html content
    let context = sources[0].parentContext;

    context.html = content;

    // Defer to inline-source
    inlineRun(context, sources, false, fn);
  } else {
    fn(null, content);
  }
}