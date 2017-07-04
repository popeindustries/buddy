// @flow

'use strict';

import type File from '../File';
export type FileUtils = {
  appendContent: (File, string | File) => void,
  prependContent: (File, string | File) => void,
  replaceContent: (string | Array<[string, number, string | File]>, number, string | File) => void
};

const { getLocationFromIndex } = require('./string');
const sourceMap = require('./sourceMap');

module.exports = {
  appendContent,
  prependContent,
  replaceContent
};

/**
 * Append 'content' to 'file' content
 */
function appendContent(file: File, content: string | File) {
  let contentLines = 0;

  if (typeof content === 'string') {
    contentLines = content.split('\n').length;
  } else {
    if (file.map != null) {
      sourceMap.append(file.map, content.map, file.totalLines);
    }
    contentLines = content.totalLines;
    content = content.content;
  }
  // New line if not first
  file.content += `${file.content.length > 0 ? '\n' : ''}${content}`;
  file.totalLines += contentLines;
}

/**
 * Prepend 'content' to 'file' content
 */
function prependContent(file: File, content: string | File) {
  let contentLines = 0;

  if (typeof content === 'string') {
    contentLines = content.split('\n').length;
    if (file.map != null) {
      sourceMap.prepend(file.map, null, contentLines);
    }
  } else {
    contentLines = content.totalLines;
    if (file.map != null) {
      sourceMap.prepend(file.map, content.map, contentLines);
    }
    content = content.content;
  }
  file.content = `${content}${file.content.length > 0 ? '\n' : ''}` + file.content;
  file.totalLines += contentLines;
}

/**
 * Replace 'string' at 'index' with 'content'
 */
function replaceContent(
  file: File,
  string: string | Array<[string, number, string | File]>,
  index: number,
  content: string | File
) {
  // Convert to batch
  if (!Array.isArray(string)) {
    string = [[string, index, content]];
  }

  const indexes = string.map(args => args[1]);
  const location = getLocationFromIndex(file.content, indexes);
  let offsetIndex = 0;
  let offsetLine = 0;

  const replace = (args, idx) => {
    let [string, index, content] = args;
    let line = location[idx].line;
    let contentLines = 0;

    index += offsetIndex;
    line += offsetLine;

    if (typeof content === 'string') {
      contentLines = content.split('\n').length - 1;
      if (contentLines > 0 && file.map != null) {
        sourceMap.insert(file.map, null, contentLines, line);
      }
    } else {
      contentLines = content.totalLines - 1;
      if (file.map != null) {
        sourceMap.insert(file.map, content.map, contentLines, line);
      }
      content = content.content;
    }

    file.content = file.content.substring(0, index) + content + file.content.substring(index + string.length);
    file.totalLines += contentLines;

    offsetIndex += content.length - string.length;
    offsetLine += contentLines;
  };

  string.forEach(replace);
}
