/**
 * @fileoverview An evaluator for the student languages.
 *               Generally, produces types from the fourth section of types.ts given types
 *               from the third section of types.ts.
 * 
 * @author Alice Russell
 */

 'use strict';

import {
  TopLevel, Definition, Expr, ExprResult,
  Env, ValueError, DefinitionResult, Result,
  Maybe, Value
} from './types';

import {
  Bind, Clos, NFn, ValErr,
  MakeNothing, MakeJust, BindingErr
} from './constructors';

import { isDefinition, isExpr, isExprError, isValueError, isDefinitionError } from './predicates';

import { parse } from './parse';

import { builtinEnv } from './env';

/**
 * Evaluates a string into a list of results.
 * @param exp a string intended to be some expressions from the student languages
 * @returns a list of results after evaluating the string's parsed AST
 */
export const evaluate = (exp: string): Result[] => {
  return evaluateTopLevels(parse(exp));
}

/**
 * Evaluates a list of top level syntactical objects into a list of results.
 * also using a first pass which populates the environment.
 * @param toplevels a list of top level syntactical objects
 * @returns a list of results after evaluating the top level syntactical objects
 */
export const evaluateTopLevels = (toplevels: TopLevel[]): Result[] => {
  let env = builtinEnv();
  toplevels.filter(isDefinition).forEach(
    (d: Definition) => env = extendEnv(d, env)
  );

  return toplevels.map(e => evaluateDefOrExpr(e, env));
}

/**
 * Evaluates a top level syntactical object into a result.
 * @param toplevel a top level syntactical object 
 * @param env the environment for the selected student language
 * @returns a result after evaluating the top level syntactical object
 */
const evaluateDefOrExpr = (toplevel: TopLevel, env: Env): Result => {
  if (isDefinition(toplevel)) {
    return evaluateDefinition(toplevel, env);
  } else {
    return evaluateExpr(toplevel, env);
  }
}

/**
 * Second pass over the definitions, which produces a value to be printed.
 * @warning Mutates the environment.
 * @param d a top level definition
 * @param env the environment for the selected student language
 * @returns a definition result, which includes the information intended to print out something human-readable about the definition
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
 * @param e an expression
 * @param env an environment which is a base environment from a student language or one extended inside a function call
 * @returns an expression result
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
 * Puts a definition into an environment. Does not mutate the original environment.
 * @param d a definition (used for top level defines)
 *          or string (used for lexical scoping of function calls)
 * @param env an environment to be extended
 * @returns a new copy of the environment extended with another top level definition
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
 * @warning Mutates the environment.
 * @param name definition name
 * @param v definition closure
 * @param env environment to be changed
 * @returns nothing
 */
const mutateEnv = (name: String, v: Maybe<ExprResult>, env: Env): void => {
  env.set(name, v);
};



/**
 * Checks if an identifier is in an enviroment
 * @param id identifier name
 * @param env environment which may contain the identifier name
 * @returns whether the identifier is in the environment
 */
const isInEnv = (id: string, env: Env): boolean => {
  return env.has(id);
}

/**
 * Gets an identifier's value from an environment if it's there.
 * @param id identifier name
 * @param env environment which may contain the identifier name
 * @returns a Maybe<ExprResult> structure if the identifier is in the environment, and false if it is not
 */
const getVal = (id: string, env: Env): Maybe<ExprResult> | false => {
  const a = env.get(id);
  if (a !== undefined) return a;
  return false;
}

