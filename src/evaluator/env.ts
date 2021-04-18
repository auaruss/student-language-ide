/**
 * @fileoverview This file holds the built in environment for the Beginning Student Language.
 * 
 * @author Alice Russell
 */

'use strict';

import { MakeStructType, MakeStructureConstructor, MakeStructureAccessor } from './constructors';
import { ExprResult, Env, Just, Maybe, Value, StructType, Expr } from './types';
import { BFn, NFn, ValErr, MakeJust } from './constructors';

export const builtinEnv = (): Env => {
  let env = new Map<String, Maybe<ExprResult>>();

  const posnType: StructType = MakeStructType('posn', ['x', 'y']);

  env.set('pi', NFnEnv(Math.PI));
  env.set('true', NFnEnv(true));
  env.set('false', NFnEnv(false));

  env.set('+', plus());
  env.set('-', minus());
  env.set('*', multiply());
  env.set('/', divide());

  env.set('string-append', stringAppend());
  env.set('string=?', stringEquals());
  // env.set('substring');
  
  env.set('sin', sin());
  env.set('cos', cos());
  env.set('add1', addOne());
  env.set('floor', floor());
  // env.set('modulo');
  // env.set('abs');

  env.set('make-posn', MakeJust(MakeStructureConstructor(posnType)));
  env.set('posn-x', MakeJust(MakeStructureAccessor(posnType, 0)));
  env.set('posn-y', MakeJust(MakeStructureAccessor(posnType, 1)));
  env.set('posn?', MakeJust(MakeStructureConstructor(posnType)));


  // env.set('and');
  // env.set('or');
  // env.set('<');
  // env.set('<=');
  // env.set('number=?');
  // env.set('>');
  // env.set('>=');


  return env;
}

// ----------------------------------------------------------------------------

// Environment function values.

const plus = (): Just<ExprResult> => {
  return BFnEnv(checkArityThenApply('+', constructReducableNumberOperation((acc, elem) => acc + elem, 0), 2, true));
}

const minus = (): Just<ExprResult> => {
  return BFnEnv(checkArityThenApply('-', constructReducableNumberOperation((acc, elem) => acc - elem, 0, true, true), 1, true));
}

const multiply = (): Just<ExprResult> => {
  return BFnEnv(checkArityThenApply('*', constructReducableNumberOperation((acc, elem) => acc * elem, 1), 2, true));
}

const divide = (): Just<ExprResult> => {
  return BFnEnv(checkArityThenApply('/', constructReducableNumberOperation((acc, elem) => acc / elem, 0, true), 2, true));
}

const stringAppend = (): Just<ExprResult> => {
  return BFnEnv(constructReducableStringOperation((a, b) => a.concat(b), ''));
}

const stringEquals = (): Just<ExprResult> => {
  return BFnEnv(
    checkArityThenApply(
      'string=?', 
      (vs: Value[]) => {
        const first = vs[0]
        if (first.type === 'NonFunction' && typeof first.value === 'string') 
          return constructReducableStringOperation((acc, elem) => acc && (elem === first.value), true)(vs)
        throw new Error('impossible line reached, bug in string=?');
      },
      2, 
      true
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

const floor = (): Just<ExprResult> => {
  return BFnEnv(constructSingletonNumberOperation('floor', x => Math.floor(x)));
}

// ----------------------------------------------------------------------------


// Helper functions for environment creation.

const constructSingletonNumberOperation = (
  opName: string,
  op: (x: number) => number,
): ((vs: Value[]) => ExprResult) => {
  return checkArityThenApply(
    opName,
    (vs: Value[]) => {
      const nums = checkIfIsNumbers(vs);
      if (vs.length !== 1)
        throw new Error('Impossible arity mismatch; fix constructSingletonNumberOperation bug');
      const num = nums[0];
      return NFn(op(num));
    },
    1, false
  );
}

const constructSingletonStringOperation = (
  opName: string,
  op: (x: string) => string,
): ((vs: Value[]) => ExprResult) => {
  return checkArityThenApply(
    opName,
    (vs: Value[]) => {
      const strs = checkIfIsStrings(vs);
      if (vs.length !== 1)
        throw new Error('Impossible arity mismatch; fix constructSingletonStringOperation bug');
      const str = strs[0];
      return NFn(op(str));
    },
    1, false
  );
}

const constructReducableNumberOperation = (
  op: (a: any, b: number) => any,
  id: any,
  idIsIndex?: boolean,
  subtraction?: boolean
): ((vs: Value[]) => ExprResult) => {
  return (vs: Value[]) => {
    const nums: number[] | false = checkIfIsNumbers(vs);
    
    if (nums === false) {
      return ValErr('Not a number');
    }

    if (subtraction && nums.length === 1) return NFn(-nums[0]);
    
    if (idIsIndex)
      return NFn(
        nums.slice(0, id)
            .concat(nums.slice(id + 1))
            .reduce(op, nums[id])
      );

    return NFn(nums.reduce(op, id));
  };
}

const constructReducableStringOperation = (
  op: (a: any, b: string) => any,
  id: any
): ((vs: Value[]) => ExprResult) => {
  return (vs: Value[]) => {
    const strings: string[] | false = checkIfIsStrings(vs);
    
    if (strings === false) {
      return ValErr('Not a string');
    }
    
    return NFn(strings.reduce(op, id));
  };
}

const BFnEnv = ( v: ((vs: Value[]) => ExprResult)): Just<ExprResult> => {
  return MakeJust(BFn(v));
}

const NFnEnv = (v: string | boolean | number): Just<ExprResult> => {
  return MakeJust(NFn(v));
}

const checkIfIsNumbers = (vs: Value[]): number[] | false => {
  const nums: number[] = []
  for (let v of vs) {
    if (! (v.type === 'NonFunction'))
      return false;
    if (typeof v.value !== 'number')
      return false;
    nums.push(v.value);
  }

  return nums;
}

const maybeGetElemNumber = (v: Value): number | false => {
  if (! (v.type === 'NonFunction'))
    return false;
  if (typeof v.value !== 'number')
    return false;
  return v.value;
}

const checkIfIsStrings = (vs: Value[]): string[] | false => {
  const strings: string[] = []
  for (let v of vs) {
    if (! (v.type === 'NonFunction'))
      return false;
    if (typeof v.value !== 'string')
      return false;
    strings.push(v.value);
  }

  return strings;
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