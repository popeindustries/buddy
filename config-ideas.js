{
	build: {
		sources: ['src'],
		targets: [
			{
				input: 'src/main.js',
				output: 'www',
				bootstrap: true,
				boilerplate: true
			},
			{
				input: 'src/main.css',
				output: 'www'
			}
		],
		after: '',
		afterEach: '',
		server: {
			port: 3000,
			env: {
				"FOO": 'foo'
			}
		}
	}
}

{
	build: {
		targets: [
			{
				input: ['src/main.js', 'src/main.css'],
				output: 'www',
				bootstrap: true,
				boilerplate: true
			}
		]
	}
}

{
	build: {
		targets: [
			{
				input: 'src/libs.js',
				output: 'www',
				bootstrap: true,
				boilerplate: true,
				targets: [
					{
						// parse manifest
						input: 'node_modules/app',
						//
						// use manifest 'name' as filename
						output: 'www',
						targets: [
							{
								input: ['node_modules/gateway', 'node_modules/extreme', 'node_modules/search'],
								output: 'www'
							}
						]
					}
				]
			},
			{
				// parse dep tree
				input: 'index.js',
				server: true
			}
		]
	}
}

// Build subprojects
{
	build: {
		targets: [
			'node_modules/app',
			'node_modules/gateway',
			'node_modules/extreme',
			'node_modules/search'
		]
	}
}

{
	build: {
		targets: [
			{
				input: 'node_modules/app:libs.js+node_modules/gateway:libs.js+node_modules/extreme:libs.js',
				output: 'www/libs.js'
				bootstrap: true,
				boilerplate: true,
				targets: [
					{
						input: 'node_modules/app:client.js',
						output: 'www/index.js',
						targets: [
							{
								input: ['node_modules/gateway:client.js', 'node_modules/extreme:client.js', 'node_modules/search:client.js'],
								output: 'www'
							}
						]
					}
				]
			}
		]
	}
}

{
	build: {
		targets: [
			{
				input: [
					// shared deps
					'node_modules/{app,gateway,extreme,search}/libs.js',
					'node_modules/{app,gateway,extreme,search}/client.js'
				],
				output: [
					// concat
					'www/libs.js',
					// unique names?
					'www'
				],
				// first output
				bootstrap: true,
				boilerplate: true
			}
		]
	}
}

{
	build: {
		targets: [
			{
				cmd: [
					'node_modules/{app,gateway,extreme,search}/libs.js>www/libs.js',
					'node_modules/{app,gateway,extreme,search}/client.js>www'
				]
			}
		]
	}
}

{
	build: {
		sources: ['src'],
		targets: [
			{
				input: ['libs.js', 'node_modules/@yr/{gateway,extreme,search}/libs.js'],
				output: 'www/libs.js',
				alias: {
					react: 'dist/react.js'
				},
				bootstrap: true,
				targets: [
					{
						input: ['client.js', 'node_modules/@yr/{gateway,extreme,search}/client.js'],
						output: 'www/%dirname%.js',
						sources: ['node_modules/nib/nib']
					}
				]
			},
			{
				input: ['client.styl', 'node_modules/@yr/{gateway,extreme,search}/client.styl'],
				output: 'www/index.css'
			},
			{
				input: 'index.js'
			}
		]
	}
}

{
	build: {
		targets: [
			{
				input: ['main.js', 'main.css'],
				ouput: 'www'
			}
		]
	}
}