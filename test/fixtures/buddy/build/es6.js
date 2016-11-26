import * as foo from './foo';
import barDefault from './bar';
import fDefault, * as fModule from './f';

export default function () {
  console.log(foo);
  console.log(barDefault);
  console.log(fDefault, fModule.bat);
};