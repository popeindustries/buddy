require.register('main', function(module, exports, require) {
  var take, slice$ = [].slice;
  take = curry$(function(n, list){
    var x, xs;
    x = list[0], xs = slice$.call(list, 1);
    switch (false) {
    case !(n <= 0):
      return [];
    case !empty(list):
      return [];
    default:
      return [x].concat(take(n - 1, xs));
    }
  });
  function curry$(f, bound){
    var context,
    _curry = function(args) {
      return f.length > 1 ? function(){
        var params = args ? args.concat() : [];
        context = bound ? context || this : this;
        return params.push.apply(params, arguments) <
            f.length && arguments.length ?
          _curry.call(context, params) : f.apply(context, params);
      } : f;
    };
    return _curry();
  }
});