exports.build = {
	js: {
		sources: ["src"],
		targets: [
			{
				"input": "src/**/{foo,bar}/*.js",
				"output": "output"
			}
		]
	}
}