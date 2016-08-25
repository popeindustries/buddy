var nums = [1,2,3,4];

nums.map(n => n + 1);

f(1,2);
g(1,2,3,4);

function f (x, y) {
  return {x, y};
}

function g (x, ...y) {
  return x * y.length;
}