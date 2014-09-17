exports.build = {
	js: {
		sources: ["src"],
		targets: [
			{
				"input": "src/empty/*.js",
				"output": "output/empty"
			}
		]
	}
}