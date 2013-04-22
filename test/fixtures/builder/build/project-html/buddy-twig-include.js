exports.build = {
	"html": {
		"sources": ["src/twig"],
		"options":{
			"allowInlineIncludes" : true
		},
		"targets": [
			{
				"input": "src/twig/index2.twig",
				"output": "output/html/twig"
			}
		]
	}
}