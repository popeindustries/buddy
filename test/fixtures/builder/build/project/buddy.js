exports.build = {
	"js": {
		"sources": ["src/coffee"],
		"targets": [
			{
				"input": "src/coffee/main.coffee",
				"output": "output/js"
			}
		]
	},
	"css": {
		"sources": ["src/stylus"],
		"targets": [
			{
				"input": "src/stylus",
				"output": "output/css"
			}
		]
	}
}