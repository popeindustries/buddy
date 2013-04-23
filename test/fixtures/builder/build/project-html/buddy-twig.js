exports.build = {
	"html": {
		"sources": ["src/twig"],
		"targets": [
			{
				"input": "src/twig/index.twig",
				"output": "output/html/twig"
			}
		]
	}
}