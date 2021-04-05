import { MakeStructType, MakeStructureConstructor, MakeStructureAccessor } from './constructors';
/**
 * @fileoverview This file holds the built in environment for the Beginning Student Language.
 * 
 * @author Alice Russell
 */

'use strict';

import {
  ExprResult, Env, Just, Maybe, Value
} from './types';

import {
BFn, NFn, ValErr, MakeJust, 
} from './constructors';

export const builtinEnv = (): Env => {
  let env = new Map<String, Maybe<ExprResult>>();

  env.set('+',  BFnEnv(constructReducableNumberOperation((a, b) => a + b, 0)));
  env.set('-',  BFnEnv(constructReducableNumberOperation((a, b) => a - b, 0)));
  env.set('*',  BFnEnv(constructReducableNumberOperation((a, b) => a * b, 1)));
  env.set('/',  
    BFnEnv(checkArityThenApply(constructReducableNumberOperation((a, b) => a / b, 1), 1, true))
  );

  env.set('string-append',  BFnEnv(constructReducableStringOperation((a, b) => a.concat(b), '')));
  
  env.set('pi', NFnEnv(Math.PI));
  
  env.set('sin', BFnEnv(constructSingletonNumberOperation(x => Math.sin(x))));
  env.set('cos', BFnEnv(constructSingletonNumberOperation(x => Math.cos(x))));

  env.set('make-posn', MakeJust(MakeStructureConstructor(MakeStructType('posn', ['x', 'y']))));
  env.set('posn-x', MakeJust(MakeStructureAccessor(MakeStructType('posn', ['x', 'y']), 0)));
  env.set('posn-y', MakeJust(MakeStructureAccessor(MakeStructType('posn', ['x', 'y']), 1)));
  env.set('posn?', MakeJust(MakeStructureConstructor(MakeStructType('posn', ['x', 'y']))))

  return env;
}

const constructSingletonNumberOperation = (
  op: (x: number) => number,
): ((vs: Value[]) => ExprResult) => {
  return checkArityThenApply(
    (vs: Value[]) => {
      const nums = checkIfIsNumbers(vs);
      if (vs.length !== 1)
        throw new Error('Impossible arity mismatch; fix constructSingletonNumberOperation bug');
      const num = nums[0];
      return NFn(op(num));
    },
    1, false
  )
}

const constructReducableNumberOperation = (
  op: (a: number, b: number) => number,
  id: number
): ((vs: Value[]) => ExprResult) => {
  return (vs: Value[]) => {
    const nums: number[] | false = checkIfIsNumbers(vs);
    
    if (nums === false) {
      return ValErr('Not a number', vs);
    }
    
    return NFn(nums.reduce(op, id));
  };
}

const constructReducableStringOperation = (
  op: (a: string, b: string) => string,
  id: string
): ((vs: Value[]) => ExprResult) => {
  return (vs: Value[]) => {
    const strings: string[] | false = checkIfIsStrings(vs);
    
    if (strings === false) {
      return ValErr('Not a string', vs);
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
  f: ((vs: Value[]) => ExprResult),
  arity: number,
  allowUnlimited: boolean,
  max?: number
): ((vs: Value[]) => ExprResult) => {
  // if max is not defined default to be equal to the arity argument
  let gate = max ? max : arity;

  return (vs: Value[]) => {
    if (vs.length < arity) return ValErr('Arity mismatch', vs);
    if ((! allowUnlimited) && vs.length > gate) return ValErr('Arity mismatch', vs);

    return f(vs);
  }
}