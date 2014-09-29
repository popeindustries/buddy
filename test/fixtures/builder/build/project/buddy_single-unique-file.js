exports.build = {
	"js": {
		"sources": ["src/js"],
		"targets": [
			{
				"input": "src/js/foo.js",
				"output": "output/foo-%hash%.js"
			}
		]
	}
}