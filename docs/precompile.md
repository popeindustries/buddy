## PRECOMPILED HTML TEMPLATES

*dust*, *handlebars*, *nunjucks*, and *jade* support the precompilation of templates for efficient use in the browser. **buddy** precompiles the template source, wraps the content in a module definition, and exposes a `render()` method:

```html
<!-- src/js/template.dust -->
{title}
<ul>
{#names}
  <li>{name}</li>
{/names}
</ul>
```
```javascript
// src/js/main.js
var template = require('./template')
  , data = {
    title: 'Friends',
    names: [
      {name: 'Joe'},
      {name: 'Bob'},
      {name: 'Annie'}
    ]
  };

template.render(data, function (err, html) {
  // do something with html
});
```