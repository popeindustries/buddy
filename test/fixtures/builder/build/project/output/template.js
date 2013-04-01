require.register('template', function(module, exports, require) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [2,'>= 1.0.0-rc.3'];
  helpers = helpers || Handlebars.helpers; data = data || {};
    var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;
  
  
    buffer += "<div class=\"entry\">\n  <h1>";
    if (stack1 = helpers.title) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
    else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
    buffer += escapeExpression(stack1)
      + "</h1>\n  <div class=\"body\">\n    ";
    if (stack1 = helpers.body) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
    else { stack1 = depth0.body; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
    buffer += escapeExpression(stack1)
      + "\n  </div>\n</div>";
    return buffer;
    });
});