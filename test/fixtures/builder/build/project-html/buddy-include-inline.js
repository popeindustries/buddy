exports.build = {
	"html": {
		"sources": ["src/nunjucks"],
		"targets": [
			{
				"input": "src/nunjucks/index.nunjs",
				"output": "output/html"
			}
		]
	}
}