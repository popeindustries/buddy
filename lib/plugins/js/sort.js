'use strict';

const { getSharedDecendants, walk } = require('../../utils/tree');

const MAX_DEPTH = 10000;
const MAX_DEPTH_CIRCULAR = MAX_DEPTH / 2;

/**
 * Sort and gather all dependencies
 * @param {JSFile} rootFile
 * @returns {Array}
 */
module.exports = function sort (rootFile) {
  function process (file, collection) {
    // Files with no dependencies can safely be promoted to max depth
    if (!file.dependencyReferences.length) file.depth = MAX_DEPTH;
    if (file !== rootFile && !collection.includes(file)) collection.push(file);
    console.log(file.depth, file.id)

    file.dependencyReferences.forEach((reference) => {
      const { file: refFile } = reference;

      if (refFile && !refFile.isIgnored && refFile != rootFile) {
        const isOwnDependency = file.dependencies.includes(refFile);

        // Promote to higher depth
        if (refFile.depth < file.depth + 1) refFile.depth = file.depth + 1;
        if (isOwnDependency) refFile.parent = file;
        checkForCircularDependencies(file, refFile);

        if (!collection.includes(refFile)) {
          collection.push(refFile);
          process(refFile, collection);
        }
      }
    });

    return collection;
  }

  return process(rootFile, [])
    .sort((a, b) => {
      if (a.depth > b.depth) return 1;
      if (a.depth == b.depth) return 0;
      if (a.depth < b.depth) return -1;
    })
    .reverse()
    // .reduce((sorted, file) => {
    //   if (!sorted.includes(file) && file !== rootFile) {
    //     walk(file.dependencyReferences, (reference) => {
    //       if (!reference.file) return;
    //       // Keep walking all non-circular references
    //       return reference.file.dependencyReferences.filter((reference) => !sorted.includes(reference.file) && reference.file != file && file !== rootFile);
    //     }, (reference) => {
    //       // Add reference file after walking it's dependencies
    //       if (!sorted.includes(reference.file)) {
    //         // console.log('  ', reference.file.id, reference.file.depth, reference.file.isCircularDependency);
    //         sorted.push(reference.file);
    //       }
    //     });
    //     if (!sorted.includes(file)) {
    //       // console.log(file.id, file.depth, file.isCircularDependency);
    //       sorted.push(file);
    //     }
    //   }
    //   return sorted;
    // }, []);
};

/**
 * Check for circular dependency (including deeply nested)
 * If 'refFile' is an ancestor of 'file',
 * we have a circular dependency one or several times removed
 * @param {JSFile} file
 * @param {JSFile} refFile
 */
function checkForCircularDependencies (file, refFile) {
  let decendants = getSharedDecendants(file, refFile);

  // Files are related (dependency is an ancestor)
  if (decendants.length) {
    decendants.push(file);
    // Flag all files from current to ancestor as circular
    decendants.forEach((file, idx) => {
      console.log('<===> circular', file.id)
      file.isCircularDependency = true;
    });
  }
}