exports.build = {
	"js": {
		"sources": ["src/coffee"],
		"targets": [
			{
				"input": "src/coffee/main.coffee",
				"output": "output",
				"targets": [
					{
						"input": "src/coffee/section/someSection.coffee",
						"output": "output/somesection.js"
					}
				]
			},
			{
				"input": "src/coffee/section/someSection.coffee",
				"output": "output/section/somesection.js"
			}
		]
	}
}
