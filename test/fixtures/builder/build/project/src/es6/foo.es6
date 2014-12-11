var nums = [1,2,3,4];

nums.map(n => n + 1);

function f (x, y) {
  return {x, y};
}

function g (x, ...y) {
  return x * y.length;
}