exports.build = {
	js: {
		sources: ["src"],
		targets: [
			{
				"input": "src/mainWrapped.js",
				"output": "output"
			}
		]
	}
}