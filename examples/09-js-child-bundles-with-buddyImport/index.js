const arrify = require('arrify');

buddyImport('./child')
  .then((child) => {
    const childArr = arrify(child);
  });