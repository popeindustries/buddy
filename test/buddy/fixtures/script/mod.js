var fs = require('fs')
	, path = require('path')

	, filepath = process.argv[2];

fs.writeFileSync(path.resolve(filepath), 'oops!', 'utf8');