'use strict';

const MAX_DEPTH = Number.POSITIVE_INFINITY;
const START_DEPTH = Number.MAX_SAFE_INTEGER;

/**
 * Sort and collect all dependencies
 * @param {JSFile} rootFile
 * @returns {Array}
 */
module.exports = function sort (rootFile) {
  let depth = START_DEPTH;

  function collect (file, collection, ancestors = []) {
    const isSeen = collection.includes(file);

    // Handle circular dependencies
    if (ancestors.includes(file)) {
      ancestors.reverse().some((ancestor, idx) => {
        ancestor.isCircularDependency = (ancestor === file) ? 1 : 2;
        return ancestor.isCircularDependency == 1;
      });
    }

    // Bail if file already seen, except if second order circular dependency,
    // where we need to continue to first order file before bailing.
    // This deopt is neccessary to register additional circular dependencies
    if (file.isCircularDependency ? file.isCircularDependency == 1 : isSeen) {
      return collection;
    }

    const hasChildren = file.dependencyReferences.length > 0;

    if (hasChildren) {
      ancestors.push(file);

      // Traverse outer edge so we start at furthest (highest depth) file from root
      for (let i = file.dependencyReferences.length - 1; i >= 0; i--) {
        const reference = file.dependencyReferences[i];

        if (reference.file && !reference.isIgnored && reference.file !== rootFile) {
          collect(reference.file, collection, ancestors.slice());
        }
      }
    }

    if (!collection.includes(file) && file !== rootFile) {
      // Files with no dependencies can safely be promoted to max depth
      file.depth = hasChildren ? --depth : MAX_DEPTH;
      collection.push(file);
    }

    return collection;
  }

  return collect(rootFile, [])
    // Sort highest first
    .sort((a, b) => {
      if (a.depth > b.depth) return -1;
      if (a.depth == b.depth) return 0;
      if (a.depth < b.depth) return 1;
    });
};