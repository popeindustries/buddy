function buddyImport (url, id) {
  return new Promise(function (resolve, reject) {
    if (id in self.$m) return resolve(id);

    load(url, function (err) {
      if (err) return reject(err);
      resolve(id);
    });
  });
}

function load (url, cb) {
  if (!url) return cb(Error('missing url for import'));

  var script = document.createElement('script');
  var first = document.getElementsByTagName('script')[0];
  var done = function (err) {
    script.onload = script.onreadystatechange = script.onerror = null;
    cb(err);
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