'use strict';

const MAX_DEPTH = 100000;

/**
 * Sort and collect all dependencies
 * @param {JSFile} rootFile
 * @returns {Array}
 */
module.exports = function sort (rootFile) {
  let index = 0;

  function collect (file, collection, ancestors = []) {
    const hasChildren = file.dependencyReferences.length > 0;

    // Only promote to higher depth
    if (file.depth < ++index) file.depth = index;
    if (file !== rootFile && !collection.includes(file)) collection.push(file);
    // Handle circular dependencies
    if (ancestors.includes(file)) {
      ancestors.reverse().some((ancestor) => {
        ancestor.isCircularDependency = true;
        return ancestor === file;
      });
      return collection;
    }
    // Files with no dependencies can safely be promoted to max depth
    if (!hasChildren) {
      file.depth = MAX_DEPTH;
      return collection;
    }
    ancestors.push(file);

    file.dependencyReferences.forEach((reference) => {
      if (reference.file && !reference.file.isIgnored && reference.file !== rootFile) {
        collect(reference.file, collection, ancestors.slice());
      }
    });

    return collection;
  }

  return collect(rootFile, [])
    .sort((a, b) => {
      if (a.depth > b.depth) return 1;
      if (a.depth == b.depth) return 0;
      if (a.depth < b.depth) return -1;
    })
    .reverse();
};