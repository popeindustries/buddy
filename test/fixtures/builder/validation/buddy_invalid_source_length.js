exports.build = {
	js: {
		sources: [],
		targets: [{
			'input': 'src/coffee/main.coffee',
			'output': 'js/main.js'
		}]
	},
	css: {
		sources: ['src/stylus'],
		targets: [{
			'input': 'src/stylus',
			'output': 'css/main.css'
		}]
	},
	html: {
		sources: [],
		targets: []
	}
}
