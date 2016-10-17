[![NPM Version](https://img.shields.io/npm/v/buddy-server.svg?style=flat)](https://npmjs.org/package/buddy-server)

# buddy-server

A simple development fileserver, with LiveReload support, for the [buddy](https://github.com/popeindustries/buddy) build tool.

***WARNING***: default fileserving is very permissive, and will walk the project directory tree looking for the requested file until a match is found. This is inherently insecure, and therefore only recommended for local development.

When working with the LiveReload feature, it is recommended to install the [LiveReload Chrome extension](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei?hl=en), or include the following in your html source to initiate the connection:

```html
<script src="http://localhost:35729/livereload.js"></script>
```

## Usage

```json
{
  "devDependencies": {
    "buddy": "6.0.0",
    "buddy-server": "2.0.0"
  },
  "buddy": {
    "server": {
      "port": 8000,
      "directory": "www"
    }
  }
```
```bash
$ buddy watch --serve --reload
```

To use a custom application server instead of the default, specify a `file` path to your server:

```json
"buddy": {
  "server": {
    "port": 8000,
    "file": "./index.js"
  }
}
```

Configure environment variables with `env`:

```json
"buddy": {
  "server": {
    "port": 8000,
    "file": "./index.js",
    "env": {
      "DEBUG": "*"
    }
  }
}
```