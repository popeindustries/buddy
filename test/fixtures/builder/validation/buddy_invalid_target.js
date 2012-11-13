exports.build = {
	js: {
		sources: ['src/coffee']
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
