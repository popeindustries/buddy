import * as foo from './foo';
import barDefault from './bar';
import fDefault, * as fModule from './f';

const importedFoo = foo;

export default function() {
  console.log(importedFoo);
  console.log(foo);
  console.log(barDefault);
  console.log(fDefault, fModule.bat);
}
