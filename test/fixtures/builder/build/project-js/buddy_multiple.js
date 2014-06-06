exports.build = {
	js: {
		sources: ["src"],
		targets: [
			{
				"input": ["src/empty/empty.js", "src/empty/empty2.js"],
				"output": "output/empty"
			}
		]
	}
}