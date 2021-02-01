'use strict';



import {
  DefOrExpr, Definition, Expr, ExprResult,
  Env, ValueError, DefinitionResult, Result,
  Nothing, Just, Maybe, Value
} from './types';
import { isDefinition, isExpr, isExprError, isValueError, isDefinitionError } from './predicates';
import { parse } from './parse';
import {
  Bind, BFn, Clos, NFn, ValErr,
  MakeNothing, MakeJust, BindingErr
} from './constructors';

import { builtinEnv } from './env';

/**
 * Evaluates a string into a list of results.
 * @param exp 
 */
export const evaluate = (exp: string): Result[] => {
  return evaluateDefOrExprs(parse(exp));
}

/**
 * Evaluates a list of DefOrExpr into a list of results,
 * with a first pass which populates the environment.
 * @param deforexprs 
 */
export const evaluateDefOrExprs = (deforexprs: DefOrExpr[]): Result[] => {
  let env = builtinEnv();
  deforexprs.filter(isDefinition).forEach(
    (d: Definition) => env = extendEnv(d, env)
  );

  return deforexprs.map(e => evaluateDefOrExpr(e, env));
}

/**
 * Evaluates a DefOrExpr into a result.
 * @param d 
 * @param env 
 */
const evaluateDefOrExpr = (d: DefOrExpr, env: Env): Result => {
  if (isDefinition(d)) {
    return evaluateDefinition(d, env);
  } else {
    return evaluateExpr(d, env);
  }
}

/**
 * Second pass over the definitions, which produces a value to be printed. Mutates the env.
 * @param d 
 * @param env 
 */
const evaluateDefinition = (d: Definition, env: Env): DefinitionResult => {
  if (isDefinitionError(d)) {
    return d;
  } else {
    let defnVal = env.get(d.name);
    if (defnVal === undefined) {
      throw new Error('Somehow, the environment was not populated correctly by the first pass');
    } else {
      let sndarg: Maybe<ExprResult>;
      switch (d.type) {
        case 'define-function':
          sndarg = MakeJust(Clos(d.params, env, d.body));
          break;
        case 'define-constant':
          sndarg = MakeJust(evaluateExpr(d.body, env));
      }
      if (defnVal.type === 'nothing') {
        mutateEnv(d.name, sndarg, env);
        return Bind(d.name, sndarg.thing);
      } else {
        return BindingErr('Repeated definition of the same name', d);
      }
    }
  }
}

/**
 * Evaluates an expression.
 * @param e 
 * @param env 
 */
const evaluateExpr = (e: Expr, env: Env): ExprResult => {
  if (isExprError(e)) {
    return e;
  } else switch (e.type) {

    case 'String':
    case 'Num':
    case 'Bool':
      return NFn(e.const);
    case 'Id':
      let x = getVal(e.const, env);
      if (!x) {
        return ValErr('Id not in environment', e);
      } else if (x.type === 'nothing') {
        return ValErr('Id referenced before definition', e);
      } else {
        return x.thing;
      }
    case 'Call':
      if (e.op === 'if') {
        if (e.args.length !== 3) {
          return ValErr('Arity mismatch', e);
        } else {
          let pred = evaluateExpr(e.args[0], env);
          if (isValueError(pred)) {
            return pred;
          } else if (! (pred.type === 'NonFunction')) {
            return ValErr('Function used as a predicate', e);
          } else if (pred.value === true) {
            return evaluateExpr(e.args[1], env);
          } else if (pred.value === false) {
            return evaluateExpr(e.args[2], env);
          } else {
            return ValErr('Non-boolean value used as a predicate', e);
          }
        }
      }
      let maybeBody = getVal(e.op, env);
      if (!maybeBody) {
        return ValErr('Expression undefined in program', e);
      } else if (maybeBody.type === 'nothing') {
        return ValErr('Expression defined later in program', e);
      } else {
        let body = maybeBody.thing;
        if (isValueError(body)) {
          return body;
        } else if (body.type === 'NonFunction') {
          return ValErr('Nonfunction applied as a function', e);
        } else if (body.type === 'BuiltinFunction') {
          let valuesWithoutError: Value[] = [];
          let possibleErrors: ValueError[] = []; 
          valuesWithoutError = e.args.reduce(
            (acc, elem) => {
              let t = evaluateExpr(elem, env);
              if (!isValueError(t)) acc.push(t);
              else possibleErrors.push(t);
              return acc;
            },
            valuesWithoutError
          );

          if (possibleErrors.length === 0) {
            return body.value(valuesWithoutError);
          } else {
            return possibleErrors[0]; // This could return more info, but this works for now.
          }
        } else {
          let clos = body.value;
          if (clos.args.length === e.args.length) {
            let localEnv = new Map<String, Maybe<ExprResult>>(clos.env);
            let zipped: [string, ExprResult][] = clos.args.map(
              (_, i) => [_, evaluateExpr(e.args[i], env)]
            );

            for (let elem of zipped) {
              let [param, exp] = elem;
              if (isValueError(exp)) {
                return exp;
              } else {
                extendEnv(param, localEnv);
                mutateEnv(param, MakeJust(exp), localEnv);
              }
            }
            
            return evaluateExpr(clos.body, localEnv);
          } else {
            return ValErr('Arity mismatch', e);
          }
        }
      }
  }
}



/**
 * Puts a definition into an environment.
 * @param d a definition (used for top level defines)
 *          or string (used for lexical scoping of function calls)
 * @param env 
 */
const extendEnv = (d: string|Definition, env: Env): Env => {
  if (isDefinitionError(d)) {
    return env;
  } else if (typeof d === 'string') {
    let e: Env = new Map(env);
    e.set(d, MakeNothing());
    return e;
  } else {
    let e: Env = new Map(env);
    e.set(d.name, MakeNothing());
    return e;
  }
}

/**
 * Mutates a definition in the environment.
 * @param name definition name
 * @param v definition closure
 * @param env
 */
const mutateEnv = (name: String, v: Maybe<ExprResult>, env: Env): void => {
  env.set(name, v);
};



/**
 * Checks if an identifier is in an enviroment
 * @param id 
 * @param env 
 */
const isInEnv = (id: string, env: Env): boolean => {
  return env.has(id);
}

/**
 * Gets an identifier's value from an environment if it's there.
 * @param id 
 * @param env
 */
const getVal = (id: string, env: Env): Maybe<ExprResult> | false => {
  const a = env.get(id);
  if (a !== undefined) return a;
  return false;
}

