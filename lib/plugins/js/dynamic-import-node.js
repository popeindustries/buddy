function buddyImport (url, id) {
  return new Promise(function (resolve, reject) {
    if (id in self.$m) return resolve(self.$m[id]);
    try {
      const m = originalRequire(url);

      resolve(m);
    } catch (err) {
      reject(err);
    }
  });
}