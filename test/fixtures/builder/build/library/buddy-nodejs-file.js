exports.build = {
	"js": {
		"sources": ["src/coffee"],
		"targets": [
			{
				"input": "src/coffee/lib1.coffee",
				"output": "output",
				"modular": false
			}
		]
	}
}