function buddyImport (url, id) {
  if (process.env.RUNTIME != 'browser') {
    return new Promise(function (resolve, reject) {
      if (id in self.$m) return resolve(require(id));
      try {
        var m = $req(url);
        resolve(m);
      } catch (err) {
        reject(err);
      }
    });
  }
  return new Promise(function (resolve, reject) {
    if (id in self.$m) return resolve(require(id));

    buddyLoad(url, function (err) {
      if (err) return reject(err);
      resolve(self.$m[id]);
    });
  });
}
function buddyLoad (url, cb) {
  // Worker
  if (typeof window === 'undefined') {
    try {
      self.importScripts(url);
      cb();
    } catch (err) {
      cb(err);
    }
  // Window
  } else {
    var script = document.createElement('script');
    var first = document.getElementsByTagName('script')[0];
    var done = function (evt) {
      script.onload = script.onreadystatechange = script.onerror = null;
      if (evt && evt.type == 'error') return cb(Error('error loading: ' + url));
      cb();
    };

    script.async = true;
    script.src = url;
    script.onerror = done;
    script.onload = done;
    script.onreadystatechange = function () {
      if ('loaded' === script.readyState || 'complete' === script.readyState) {
        done();
      }
    };

    first.parentNode.insertBefore(script, first);
  }
}