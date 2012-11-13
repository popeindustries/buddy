exports.build = {
	"js": {
		"sources": ["src/coffee"],
		"targets": [
			{
				"input": "src/coffee/wrapped.coffee",
				"output": "output"
			}
		]
	}
}