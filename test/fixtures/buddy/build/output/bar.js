(function () {
/*== foo.js ==*/
$m['foo'] = { exports: {} };

$m['foo'].exports = 'foo';
/*≠≠ foo.js ≠≠*/
/*== bar.js ==*/
$m['bar'] = { exports: {} };

var bar__foo = require('./foo');

$m['bar'].exports = bar__foo;
/*≠≠ bar.js ≠≠*/
})()



//# sourceMappingURL=bar.map