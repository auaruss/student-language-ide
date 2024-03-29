/**
 * @fileoverview This file holds the built in environment for the Beginning Student Language.
 * 
 * @author Alice Russell
 */

'use strict';

import { MakeStructType, MakeStructureConstructor, MakeStructureAccessor,MakeStructurePredicate, MakeStructTypeValue } from './constructors';
import { ExprResult, Env, Just, Maybe, Value, StructType } from './types';
import { MakeBuiltinFunction, MakeAtomic, ValErr, MakeJust } from './constructors';

export const builtinEnv = (): Env => {
  let env = new Map<String, Maybe<ExprResult>>();

  const posnType: StructType = MakeStructType('posn', ['x', 'y']);
  const colorType: StructType = MakeStructType('color', ['red', 'green', 'blue']);

  env.set('pi', NFnEnv(Math.PI));
  env.set('true', NFnEnv(true));
  env.set('false', NFnEnv(false));

  env.set('+', plus());
  env.set('-', minus());
  env.set('*', multiply());
  env.set('/', divide());

  env.set('string-append', stringAppend());
  env.set('string=?', stringEquals());
  env.set('substring', substring());
  
  env.set('sin', sin());
  env.set('cos', cos());
  env.set('add1', addOne());
  env.set('sub1', subOne());
  env.set('floor', floor());
  env.set('modulo', modulo());
  env.set('abs', absoluteVal());

  env.set('posn', MakeJust(MakeStructTypeValue('posn')));
  env.set('make-posn', MakeJust(MakeStructureConstructor(posnType)));
  env.set('posn-x', MakeJust(MakeStructureAccessor(posnType, 0)));
  env.set('posn-y', MakeJust(MakeStructureAccessor(posnType, 1)));
  env.set('posn?', MakeJust(MakeStructurePredicate(posnType)));

  env.set('color', MakeJust(MakeStructTypeValue('color')));
  env.set('make-color', MakeJust(MakeStructureConstructor(colorType)));
  env.set('color-red', MakeJust(MakeStructureAccessor(colorType, 0)));
  env.set('color-green', MakeJust(MakeStructureAccessor(colorType, 1)));
  env.set('color-blue', MakeJust(MakeStructureAccessor(colorType, 2)));
  env.set('color?', MakeJust(MakeStructurePredicate(colorType)));

  env.set('and', and());
  env.set('or', or());
  env.set('not', not());
  env.set('<', lessThan());
  env.set('<=', lessThanEq());
  env.set('=', eq());
  env.set('>=', greaterThanEq());
  env.set('>', greaterThan());

  env.set('number->string', numberToString());
  env.set('string-length', stringLength());

  return env;
}

// ----------------------------------------------------------------------------

// Environment function values.

const plus = (): Just<ExprResult> => {
  return BFnEnv(checkArityThenApply('+', constructReducibleNumberOperation((acc, elem) => acc + elem, 0), 2, true));
}

const minus = (): Just<ExprResult> => {
  return BFnEnv(checkArityThenApply('-', constructReducibleNumberOperation((acc, elem) => acc - elem, 0, true, true), 1, true));
}

const multiply = (): Just<ExprResult> => {
  return BFnEnv(checkArityThenApply('*', constructReducibleNumberOperation((acc, elem) => acc * elem, 1), 2, true));
}

const divide = (): Just<ExprResult> => {
  return BFnEnv(checkArityThenApply('/', constructReducibleNumberOperation((acc, elem) => acc / elem, 0, true), 2, true));
}

const stringAppend = (): Just<ExprResult> => {
  return BFnEnv(constructReducibleStringOperation((a, b) => a.concat(b), ''));
}

const stringEquals = (): Just<ExprResult> => {
  return BFnEnv(
    checkArityThenApply(
      'string=?', 
      (vs: Value[]) => {
        const first = vs[0]
        if (first.type === 'Atomic' && typeof first.value === 'string') 
          return constructReducibleStringOperation((acc, elem) => acc && (elem === first.value), true)(vs)
        throw new Error('impossible line reached, bug in string=?');
      },
      2,
      true
    )
  );
}

const substring = (): Just<ExprResult> => {
  return BFnEnv(
    checkArityThenApply('substring',
      (vs: Value[]) => {
        const strs = checkIfIsStrings([vs[0]]);
        if (! strs) return ValErr('substring: expects a string as 1st argument');
        const str = strs[0];

        const nums = checkIfIsNumbers(vs.slice(1));
        if (typeof nums === 'number') return ValErr('substring: expects one to two numbers as 2nd and possibly 3rd arguments');

        if (nums[0] > str.length) return ValErr('substring: starting index is out of range');
        if (nums.length === 1) return MakeAtomic(str.slice(nums[0]));

        if (nums[1] > str.length) return ValErr('substring: ending index is out of range');
        return MakeAtomic(str.slice(nums[0], nums[1]));
      },
      2, false, 3
    )
  );
}


const sin = (): Just<ExprResult> => {
  return BFnEnv(constructSingletonNumberOperation('sin', x => Math.sin(x)));
}

const cos = (): Just<ExprResult> => {
  return BFnEnv(constructSingletonNumberOperation('cos', x => Math.cos(x)));
}

const addOne = (): Just<ExprResult> => {
  return BFnEnv(constructSingletonNumberOperation('add1', x => x + 1));
}

const subOne = (): Just<ExprResult> => {
  return BFnEnv(constructSingletonNumberOperation('sub1', x => x - 1));
}

const floor = (): Just<ExprResult> => {
  return BFnEnv(constructSingletonNumberOperation('floor', x => Math.floor(x)));
}

const modulo = (): Just<ExprResult> => {
  return BFnEnv(
    checkArityThenApply(
      'modulo',
      (vs: Value[]) => {
        const nums = checkIfIsNumbers(vs);

        if (typeof nums === 'number') return ValErr('modulo: all arguments must be numbers');

        if (nums[1] === 0)
          return ValErr('modulo: undefined for 0');
        
        let [a, n] = nums;
        return MakeAtomic(a - n * Math.floor(a/n)); 
      }, 2, false
    )
  );
}

const absoluteVal = (): Just<ExprResult> => {
  return BFnEnv(constructSingletonNumberOperation('abs', x => Math.abs(x)));
}


const and = (): Just<ExprResult> => {
  return BFnEnv(
    checkArityThenApply(
      'and',
      constructReducibleBooleanOperation((acc, elem) => acc && elem, true),
      2, true
    )
  );
}

const or = (): Just<ExprResult> => {
  return BFnEnv(
    checkArityThenApply(
      'or',
      constructReducibleBooleanOperation((acc, elem) => acc || elem, false),
      2, true
    )
  );
}

const not = (): Just<ExprResult> => {
  return BFnEnv(constructSingletonBooleanOperation('not', b => !b));
}

const lessThan = (): Just<ExprResult> => {
  return BFnEnv(checkArityThenApply('<',
    (vs: Value[]) => {
      let nums = checkIfIsNumbers(vs);
      if (typeof nums === 'number') return ValErr('<: all arguments to < must be numbers');

      let currentNum = nums[0];
      for (let num of nums.slice(1)) {
        if (! (currentNum < num)) return MakeAtomic(false);
        currentNum = num;
      }

      return MakeAtomic(true);
    }, 
    2, true
  ));
}

const lessThanEq = (): Just<ExprResult> => {
  return BFnEnv(checkArityThenApply('<=',
    (vs: Value[]) => {
      let nums = checkIfIsNumbers(vs);
      if (typeof nums === 'number') return ValErr('<=: all arguments to <= must be numbers');

      let currentNum = nums[0];
      for (let num of nums.slice(1)) {
        if (! (currentNum <= num)) return MakeAtomic(false);
        currentNum = num;
      }
      
      return MakeAtomic(true);
    }, 
    2, true
  ));
}

const eq = (): Just<ExprResult> => {
  return BFnEnv(checkArityThenApply('=',
    (vs: Value[]) => {
      let nums = checkIfIsNumbers(vs);
      if (typeof nums === 'number') return ValErr('=: all arguments to = must be numbers');

      let currentNum = nums[0];
      for (let num of nums.slice(1)) {
        if (! (currentNum === num)) return MakeAtomic(false);
        currentNum = num;
      }
      
      return MakeAtomic(true);
    }, 
    2, true
  ));
}

const greaterThanEq = (): Just<ExprResult> => {
  return BFnEnv(checkArityThenApply('>=',
    (vs: Value[]) => {
      let nums = checkIfIsNumbers(vs);
      if (typeof nums === 'number') return ValErr('>=: all arguments to >= must be numbers');

      let currentNum = nums[0];
      for (let num of nums.slice(1)) {
        if (! (currentNum >= num)) return MakeAtomic(false);
        currentNum = num;
      }
      
      return MakeAtomic(true);
    }, 
    2, true
  ));
}

const greaterThan = (): Just<ExprResult> => {
  return BFnEnv(checkArityThenApply('>',
    (vs: Value[]) => {
      let nums = checkIfIsNumbers(vs);
      if (typeof nums === 'number') return ValErr('>: all arguments to > must be numbers');

      let currentNum = nums[0];
      for (let num of nums.slice(1)) {
        if (! (currentNum > num)) return MakeAtomic(false);
        currentNum = num;
      }
      
      return MakeAtomic(true);
    }, 
    2, true
  ));
}

const numberToString = (): Just<ExprResult> => {
  return BFnEnv(constructSingletonNumberOperation('number->string', x => x.toString()));
}

const stringLength = (): Just<ExprResult> => {
  return BFnEnv(constructSingletonStringOperation('string-length', x => x.length));
}

// ----------------------------------------------------------------------------


// Helper functions for environment creation.

const constructSingletonNumberOperation = (
  opName: string,
  op: (x: number) => string|number|boolean,
): ((vs: Value[]) => ExprResult) => {
  return checkArityThenApply(
    opName,
    (vs: Value[]) => {
      const nums = checkIfIsNumbers(vs);
      if (typeof nums === 'number') {
        throw new Error('Argument must be a number.');
      } else {
        if (vs.length !== 1)
          throw new Error('Impossible arity mismatch; fix constructSingletonNumberOperation bug');
        const num: number = nums[0];
        return MakeAtomic(op(num));
      }
    },
    1, false
  );
}

const constructSingletonStringOperation = (
  opName: string,
  op: (x: string) => string|number|boolean,
): ((vs: Value[]) => ExprResult) => {
  return checkArityThenApply(
    opName,
    (vs: Value[]) => {
      const strs = checkIfIsStrings(vs);
      if (strs === false) {
        throw new Error('Argument must be a string.');
      } else {
        if (vs.length !== 1)
          throw new Error('Impossible arity mismatch; fix constructSingletonStringOperation bug');
        const str: string = strs[0];
        return MakeAtomic(op(str));
      }
    },
    1, false
  );
}

const constructSingletonBooleanOperation = (
  opName: string,
  op: (x: boolean) => string|number|boolean,
): ((vs: Value[]) => ExprResult) => {
  return checkArityThenApply(
    opName,
    (vs: Value[]) => {
      const booleans = checkIfIsBooleans(vs);
      
      if (booleans === false) {
        return ValErr('not: expected either #true or #false; given something else');
      }

      if (vs.length !== 1)
        throw new Error('Impossible arity mismatch; fix constructSingletonBooleanOperation bug');
      const boolean: boolean = booleans[0];
      return MakeAtomic(op(boolean));
    },
    1, false
  );
}

const constructReducibleNumberOperation = (
  op: (a: any, b: number) => any,
  id: any,
  idIsIndex?: boolean,
  subtraction?: boolean
): ((vs: Value[]) => ExprResult) => {
  return (vs: Value[]) => {
    const numsOrIndex: number[] | number = checkIfIsNumbers(vs);
    
    if (typeof numsOrIndex === 'number') {
      const v = vs[numsOrIndex];
      const loc = numsOrIndex + 1;
      const suffix = ((loc%100) === 1) ? 'st' : ((loc%100) === 2) ? 'nd' : ((loc%100) === 3) ? 'rd' : 'th';

      return ValErr(`+: expects a number as ${loc.toString().concat(suffix)} argument, given ${ 
        (v.type === 'Atomic')
        ? typeof v.value === 'string' ? '"' + v.value + '"' : v.value
        : 'something else'
      }`);
    }

    if (subtraction && numsOrIndex.length === 1) return MakeAtomic(-numsOrIndex[0]);
    
    if (idIsIndex)
      return MakeAtomic(
        numsOrIndex.slice(0, id)
            .concat(numsOrIndex.slice(id + 1))
            .reduce(op, numsOrIndex[id])
      );

    return MakeAtomic(numsOrIndex.reduce(op, id));
  };
}

const constructReducibleStringOperation = (
  op: (a: any, b: string) => any,
  id: any
): ((vs: Value[]) => ExprResult) => {
  return (vs: Value[]) => {
    const strings: string[] | false = checkIfIsStrings(vs);
    
    if (strings === false) {
      return ValErr('Not a string');
    }
    
    return MakeAtomic(strings.reduce(op, id));
  };
}

const constructReducibleBooleanOperation = (
  op: (a: any, b: boolean) => any,
  id: any
): ((vs: Value[]) => ExprResult) => {
  return (vs: Value[]) => {
    const booleans: boolean[] | false = checkIfIsBooleans(vs);
    
    if (booleans === false) {
      return ValErr('Not a boolean');
    }
    
    return MakeAtomic(booleans.reduce(op, id));
  };
}


const BFnEnv = ( v: ((vs: Value[]) => ExprResult)): Just<ExprResult> => {
  return MakeJust(MakeBuiltinFunction(v));
}

const NFnEnv = (v: string | boolean | number): Just<ExprResult> => {
  return MakeJust(MakeAtomic(v));
}

/**
 * Checks whether an array of values is an array of numbers.
 * @param vs argument values to check
 * @returns either the index of the first non-number, or a confirmed array of numbers extracted from the value structures
 */
const checkIfIsNumbers = (vs: Value[]): number[] | number => {
  const nums: number[] = []
  for (let i = 0; i < vs.length; i++) {
    let v = vs[i];

    if (! (v.type === 'Atomic'))
      return i;
    if (typeof v.value !== 'number')
      return i;

    nums.push(v.value);
  }

  return nums;
}

const checkIfIsStrings = (vs: Value[]): string[] | false => {
  const strings: string[] = []
  for (let v of vs) {
    if (! (v.type === 'Atomic'))
      return false;
    if (typeof v.value !== 'string')
      return false;
    strings.push(v.value);
  }

  return strings;
}

const checkIfIsBooleans = (vs: Value[]): boolean[] | false => {
  const booleans: boolean[] = []
  for (let v of vs) {
    if (! (v.type === 'Atomic'))
      return false;
    if (typeof v.value !== 'boolean')
      return false;
    booleans.push(v.value);
  }

  return booleans;
}

const checkArityThenApply = (
  opName: string,
  f: ((vs: Value[]) => ExprResult),
  arity: number,
  allowUnlimited: boolean,
  max?: number
): ((vs: Value[]) => ExprResult) => {
  // if max is not defined default to be equal to the arity argument
  let gate = max ? max : arity;

  return (vs: Value[]) => {
    if (vs.length < arity)
      return ValErr(`${ opName }: expects at least ${ arity } argument${ (arity === 1) ? '' : 's' }, but found only ${ vs.length }`);
    if ((! allowUnlimited) && (vs.length > gate))
      return ValErr(`${ opName }: expects only ${ arity } argument${ (arity === 1) ? '' : 's' }, but found ${ vs.length }`);

    return f(vs);
  }
}
