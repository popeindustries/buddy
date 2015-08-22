## Hooks

It is possible to intervene in the build process through the use of *hooks*. Hooks are assigned to specific targets and defined in the target configuration. There are three types available:

- **before**: executed before a *target* is built

- **after**: executed after a *target* is built

- **afterEach**: executed after an output *file* is processed, but before it is written to disk

Hooks can be written as inline JavaScript, or loaded from a file if a path is specified:

```json
{
  ...
  "buddy": {
    "targets": [
      {
        "input": "somefile.js",
        "output": "somedir",
        "before": "console.log('before hook'); done();",
        "after": "path/to/afterHook.js"
      }
    ]
  }
  ...
}
```

All hooks are passed the following arguments:

- **context**: the `target` (before and after) or `file` (afterEach) instance

- **options**: the runtime options used to execute buddy (`compress`, `lazy`, `reload`, `watch`, `deploy`, etc)

- **done**: a callback function that accepts an optional `error`. **MUST** be called in order to return control back to the program.
