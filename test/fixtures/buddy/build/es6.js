import * as foo from './foo';
import barDefault from './bar';
import batDefault, * as batModule from './bat';

export default function () {
  console.log(foo);
  console.log(barDefault);
  console.log(batDefault, batModule.bat);
};