exports.build = {
	js: {
		sources: ['src/coffee'],
		targets: []
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
