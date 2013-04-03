exports.build = {
	js: {
		sources: ['src'],
		targets: [{
			'input': 'src/main.js',
			'output': 'js/main.js',
			targets: [{
				input: 'src/sub.js',
				output: 'js/sub.js'
			}]
		}]
	},
	css: {
		sources: ['src'],
		targets: [{
			'input': 'src',
			'output': 'css'
		}]
	},
	html: {
		sources: [],
		targets: []
	}
};
