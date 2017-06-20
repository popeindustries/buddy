function buddyImport(url, id) {
  if (process.env.RUNTIME !== 'browser') {
    return new Promise(function(resolve, reject) {
      if (id in self.$m) return resolve(require(id));
      try {
        var m = $req(url);
        resolve(m);
      } catch (err) {
        reject(err);
      }
    });
  }
  return new Promise(function(resolve, reject) {
    if (id in self.$m) return resolve(require(id));

    buddyLoad(url, function(err) {
      var module = self.$m[id];

      if (!module || err) return reject(Error('error loading: ' + url));
      resolve(require(id));
    });
  });
}
function buddyLoad(url, cb) {
  // Worker
  if ('importScripts' in self) {
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
    var done = function() {
      script.onload = script.onerror = null;
      clearTimeout(timeout);
      cb();
    };
    var timeout = setTimeout(done, 120000);

    script.async = true;
    script.src = url;
    script.type = 'text/javascript';
    script.charset = 'utf-8';
    script.onerror = script.onload = done;

    first.parentNode.insertBefore(script, first);
  }
}
