import { xNullBind } from './test/examples';
import { isCheckError, isValue, isValueArray } from './predicates';
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
  Maybe, Value, Check, CheckResult, Just
} from './types';

import {
  Bind, Clos, NFn, ValErr,
  MakeNothing, MakeJust, BindingErr, MakeCheckExpectedError, MakeCheckSuccess, MakeCheckFailure, MakeStructureConstructor, MakeStruct
} from './constructors';

import { isDefinition, isExpr, isCheck, isExprError, isValueError, isDefinitionError } from './predicates';

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
    (d: Definition) => { 
      if (! isDefinitionError(d)) {
        env = extendEnv(d.name, env)
      }
    }
  );

  const evalPass = toplevels.map(
    e => isCheck(e) ? e : evaluateDefOrExpr(e, env)
  );

  return evalPass.map(
    e => isCheck(e) ? evaluateCheck(e, env): e
  );
}

/**
 * Evaluates a top level syntactical object into a result.
 * @param deforexpr a definition or expression
 * @param env the environment for the selected student language
 * @returns a result after evaluating the top level syntactical object
 */
const evaluateDefOrExpr = (deforexpr: Definition | Expr, env: Env): Result => {
  if (isDefinition(deforexpr)) {
    return evaluateDefinition(deforexpr, env);
  } else {
    return evaluateExpr(deforexpr, env);
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
      throw new Error('Somehow, the environment was not populated correctly by the first pass. Bug in evaluateDefinition.');
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
        return ValErr('this variable is not defined', e);
      } else if (x.type === 'nothing') {
        return ValErr('Id referenced before definition', e);
      } else {
        return x.thing;
      }

    case 'if':
      const pred = evaluateExpr(e.predicate, env);
      if (isValueError(pred)) return pred;
      if (pred.type !== 'NonFunction' || typeof pred.value !== 'boolean')
        return ValErr('predicate must be a boolean', e);
      return pred.value ? evaluateExpr(e.consequent, env) : evaluateExpr(e.alternative, env);

    case 'cond':
      for (let clause of e.clauses) {
        const pred = evaluateExpr(clause[0], env);
        if (isValueError(pred)) return pred;
        if (pred.type === 'NonFunction' && pred.value === 'else')
          return evaluateExpr(clause[1], env);
        if (! (pred.type === 'NonFunction' && typeof pred.value === "boolean"))
          return ValErr('Expression used as clause predicate in cond must evaluate to a boolean', e);
        if (pred.value) return evaluateExpr(clause[1], env);
      }

      return ValErr('all cond questions are false', e);

    case 'Call':
      const op = evaluateOperator(e, e.op, env);
      if (isValueError(op)) return op;

      const args = evaluateOperands(e.args, env);
      if (! isValueArray(args)) return ValErr('An argument didn\'t evaluate properly', e);
  
      return apply(op, args, env, e);
  }
}

const evaluateOperator = (e: Expr, op: string, env: Env): ExprResult  => {
  let maybeBody = getVal(op, env);

  if (!maybeBody) {
    return ValErr('Expression undefined in program', e);
  } else if (maybeBody.type === 'nothing') {
    return ValErr('Expression defined later in program', e);
  }

  return maybeBody.thing;
}

const evaluateOperands = (args: Expr[], env: Env): ExprResult[] => {
  return args.map(arg => evaluateExpr(arg, env));
}

const apply = (op: Value, args: Value[], env: Env, e: Expr): ExprResult => {
  switch (op.type) {
    case 'NonFunction':
    case 'Struct':
      return ValErr('Tried to apply a nonfunction as a function', e);

    case 'BuiltinFunction':
      return op.value(args);

    case 'Closure':
      let clos = op.value;
      if (! (clos.args.length === args.length))
        return ValErr('Arity mismatch', e);

      let localEnv = new Map<String, Maybe<ExprResult>>(clos.env);

      for (let i = 0; i < args.length; i++) {
        localEnv = extendEnv(clos.args[i], localEnv, MakeJust(args[i]));
      }
        
      return evaluateExpr(clos.body, localEnv);

    case 'StructureAccessor':
      if (args.length !== 1) return ValErr('must apply a structure accessor to exactly one argument', e);
      if (args[0].type !== 'Struct') return ValErr('must apply a structure accessor to a struct', e);
      if (args[0].struct !== op.struct) return ValErr('applied structure accessor to the wrong type of struct', e);
      return args[0].values[op.index];

    case 'StructureConstructor':
      if (args.length !== op.struct.fields.length)
        return ValErr('incorrect number of fields for make-' + op.struct.name, e);
      return MakeStruct(op.struct, args);

    case 'StructurePredicate':
      if (args.length !== 1) return ValErr('must apply a structure accessor to exactly one argument', e);
      if (args[0].type !== 'Struct') return ValErr('must apply a structure accessor to a struct', e);
      return NFn(op.struct === args[0].struct);
  }

}

/**
 * Tests a Check.
 * @param c Check to be tested
 */
const evaluateCheck = (c: Check, env: Env): CheckResult => {
  if (isCheckError(c))
    return c;
  else {
    const expected = evaluateExpr(c.expected, env);
    if (isValueError(expected)) {
      return MakeCheckExpectedError(expected);
    } else {
      const actual = evaluateExpr(c.actual, env);
      if (actualEqualsExpected(actual, expected)) {
        return MakeCheckSuccess();
      } else {
        return MakeCheckFailure(actual, expected);
      }
    }
  }
}

const actualEqualsExpected = (actual: ExprResult, expected: Value): boolean => {
  if (isValue(actual)) {
    if (expected.type === 'NonFunction') {
      return actual.type === 'NonFunction' && expected.value === actual.value;
    } else if (expected.type === 'BuiltinFunction') {
      // ???
      return false;
    } else {
      // false for bsl...? 
      return false;
    }
  } else return false;
}


/**
 * Puts a definition into an environment. Does not mutate the original environment.
 * @param name
 * @param env an environment to be extended
 * @returns a new copy of the environment extended with another top level definition
 */
const extendEnv = (
  name: string,
  env: Env,
  expression: Maybe<ExprResult>=MakeNothing()
): Env => {
  let e: Env = new Map(env);
  e.set(name, expression);
  return e;
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

