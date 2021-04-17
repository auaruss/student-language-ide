import { MakeStructType, MakeStructureConstructor, MakeStructureAccessor } from './constructors';
/**
 * @fileoverview This file holds the built in environment for the Beginning Student Language.
 * 
 * @author Alice Russell
 */

'use strict';

import {
  ExprResult, Env, Just, Maybe, Value, StructType
} from './types';

import {
BFn, NFn, ValErr, MakeJust, 
} from './constructors';

export const builtinEnv = (): Env => {
  let env = new Map<String, Maybe<ExprResult>>();

  const posnType: StructType = MakeStructType('posn', ['x', 'y']);

  env.set('+',  BFnEnv(checkArityThenApply('+', constructReducableNumberOperation((acc, elem) => acc + elem, 0), 2, true)));
  env.set('-', 
    BFnEnv(
      checkArityThenApply('-',
        (vs: Value[]) => {
          const id = maybeGetElemNumber(vs[0]) ? maybeGetElemNumber(vs[0]) : 0;
          if (id === false) throw new Error("-: This error should never be reachable.");
          if (vs.length === 1) return constructReducableNumberOperation((acc, elem) => acc, -id)(vs);
          return constructReducableNumberOperation((acc, elem) => acc - elem, id)(vs.slice(1));
        },
        1, true
      )
    )
  );
  env.set('*',  BFnEnv(checkArityThenApply('*', constructReducableNumberOperation((acc, elem) => acc * elem, 1), 2, true)));
  env.set('/',  
    BFnEnv(
      checkArityThenApply('/',
        (vs: Value[]) => {
          const id = maybeGetElemNumber(vs[0]) ? maybeGetElemNumber(vs[0]) : 1;
          if (id === false) throw new Error("/: This error should never be reachable.");
          return constructReducableNumberOperation((acc, elem) => acc / elem, id)(vs.slice(1));
        },
        2, true
      )
    )
  );

  env.set('string-append',  BFnEnv(constructReducableStringOperation((a, b) => a.concat(b), '')));
  
  env.set('pi', NFnEnv(Math.PI));
  
  env.set('sin', BFnEnv(constructSingletonNumberOperation('sin', x => Math.sin(x))));
  env.set('cos', BFnEnv(constructSingletonNumberOperation('cos', x => Math.cos(x))));

  env.set('make-posn', MakeJust(MakeStructureConstructor(posnType)));
  env.set('posn-x', MakeJust(MakeStructureAccessor(posnType, 0)));
  env.set('posn-y', MakeJust(MakeStructureAccessor(posnType, 1)));
  env.set('posn?', MakeJust(MakeStructureConstructor(posnType)));

  return env;
}

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
  )
}

const constructReducableNumberOperation = (
  op: (a: number, b: number) => number,
  id: number
): ((vs: Value[]) => ExprResult) => {
  return (vs: Value[]) => {
    const nums: number[] | false = checkIfIsNumbers(vs);
    
    if (nums === false) {
      return ValErr('Not a number');
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