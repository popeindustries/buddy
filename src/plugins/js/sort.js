// @flow

'use strict';

import File from '../../File';

const MAX_DEPTH = Number.POSITIVE_INFINITY;
const START_DEPTH = Number.MAX_SAFE_INTEGER;

/**
 * Sort and collect all dependencies
 */
module.exports = function sort(rootFile: File): Array<File> {
  let depth = START_DEPTH;

  function collect(file: File, collection: Array<File>, ancestors: Array<File> = []) {
    const isSeen = collection.includes(file);

    // Handle circular dependencies
    if (ancestors.includes(file)) {
      ancestors.reverse().some((ancestor, idx) => {
        ancestor.isCircularDependency = ancestor === file ? 1 : 2;
        return ancestor.isCircularDependency == 1;
      });
    }

    // Bail if file already seen, except if second order circular dependency,
    // where we need to continue to first order file before bailing.
    // This deopt is necessary to register additional circular dependencies
    if (file.isCircularDependency ? file.isCircularDependency == 1 : isSeen) {
      return collection;
    }

    const hasChildren = file.dependencyReferences.length > 0;

    if (hasChildren) {
      ancestors.push(file);

      // Traverse outer edge so we start at furthest (highest depth) file from root
      for (let i = file.dependencyReferences.length - 1; i >= 0; i--) {
        const reference = file.dependencyReferences[i];

        if (reference.file != null && !reference.isIgnored && reference.file !== rootFile) {
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

  // Sort highest first
  return collect(rootFile, []).sort((a, b) => b.depth - a.depth);
};
