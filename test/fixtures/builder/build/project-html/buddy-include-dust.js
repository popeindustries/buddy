exports.build = {
	"html": {
		"sources": ["src/dust"],
		"targets": [
			{
				"input": "src/dust/index.dust",
				"output": "output/html"
			}
		]
	}
}