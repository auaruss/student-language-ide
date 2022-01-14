/**
 * @fileoverview An evaluator for the student languages.
 *               Generally, produces types from the fourth section of types.ts given types
 *               from the third section of types.ts.
 * 
 * @author Alice Russell
 */

 'use strict';

import {
  TopLevel, Expr, ExprResult,Env,
  Result, Maybe, Value, ValueError, Closure, StructType
} from './types';

import {
  Bind, Clos, MakeAtomic, ValErr,
  MakeNothing, MakeJust, MakeCheckExpectedError, 
  MakeCheckSuccess, MakeCheckFailure, MakeStruct, ResultErr,
  MakeStructType, MakeStructureConstructor, MakeStructurePredicate, MakeStructureAccessor, MakeStringExpr, MakeVariableUsageExpr
} from './constructors';

import {
  isValue, isValueArray, isTopLevelError,
  isExpr, isTopLevel, isExprError, isValueError
} from './predicates';
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

  for (const toplevel of toplevels) {
    if ((! isTopLevelError(toplevel)) 
        && (! isExpr(toplevel))
        && (
          toplevel.type === 'define-constant'
          || toplevel.type === 'define-function'
          || toplevel.type === 'define-struct'
    )) {
      env = extendEnv(toplevel.name, env);

      if (toplevel.type === 'define-struct'
         && (! isInEnv('make-' + toplevel.name, env))
         && (! isInEnv(toplevel.name + '?', env))
         && (toplevel.fields.reduce((acc, elem) => acc && (! isInEnv(elem, env)), true))
      ) {
        env = extendEnv('make-' + toplevel.name, env);
        env = extendEnv(toplevel.name + '?', env);
        for (let field of toplevel.fields)
          env = extendEnv(toplevel.name + '-' + field, env);
      }
    }
  }

  const evalPass = toplevels.map(
    e => {
      return (
        ((! isTopLevelError(e))
          && (! isExpr(e))
          && (
               (e.type === 'check-expect')
            || (e.type === 'check-within')
            || (e.type === 'check-error')
          )
        ) ? e
        : evaluateTopLevel(e, env)
      );
    }
  );

  return evalPass.map(
    e => {
      return (
        ((! isTopLevelError(e))
          && isTopLevel(e)
          && (! isExpr(e))
        ) ? evaluateCheck(e, env)
        : e
      );
    }
  );
}

/**
 * Evaluates a top level syntactical object into a result.
 * @param toplevel a definition or expression
 * @param env the environment for the selected student language
 * @returns a result after evaluating the top level syntactical object
 */
const evaluateTopLevel = (toplevel: TopLevel, env: Env): Result => {
  if (isTopLevelError(toplevel)) return toplevel;
  if ((! isExpr(toplevel))
    && (
       toplevel.type === 'define-constant'
    || toplevel.type === 'define-function'
    || toplevel.type === 'define-struct'
    )
  )
    return evaluateDefinition(toplevel, env);
  else if (isExpr(toplevel))
    return evaluateExpr(toplevel, env);

  else return ResultErr('err, not a definition or expression, bug in evaluateTopLevel', toplevel);
}

/**
 * Second pass over the definitions, which produces a value to be printed.
 * @warning Mutates the environment.
 * @param d a top level definition
 * @param env the environment for the selected student language
 * @returns a definition result, which includes the information intended to print out something human-readable about the definition
 */
const evaluateDefinition = (d: {
  type: 'define-constant',
  name: string,
  body: Expr
} | {
  type: 'define-function',
  name: string,
  params: string[]
  body: Expr
} | {
  type: 'define-struct',
  name: string,
  fields: string[]
}, env: Env): Result => {
  let defnVal = env.get(d.name);
  let sndarg: ExprResult;

  if (defnVal === undefined)
    throw new Error('Somehow, the environment was not populated correctly by the first pass. Bug in evaluateDefinition.');
  if (defnVal.type === 'just')
    return ResultErr(`this name was defined previously and cannot be re-defined`, MakeVariableUsageExpr(d.name));

  switch (d.type) {
    case 'define-struct': 
      return evaluateStructureDefinition(d, env);

    case 'define-function':
      sndarg = Clos(d.params, env, d.body);
      break;

    case 'define-constant':
      sndarg = evaluateExpr(d.body, env);
      break;
  }

  mutateEnv(d.name, MakeJust(sndarg), env);
  return Bind(d.name, sndarg);
}

/**
 * Evaluates a strcuture definition and creates the related helper functions.
 * (e.g. for a posn structure, make-posn, posn-x, posn-y, posn?)
 * @warning Mutates the environment.
 * @param d a top level definition
 * @param env the environment for the selected student language
 * @returns a definition result, which includes the information 
 *          intended to print out something human-readable about the definition
 */
const evaluateStructureDefinition = (d: {
  type: 'define-struct',
  name: string,
  fields: string[]
}, env: Env) => {
  let structConstructor = env.get('make-' + d.name);
  
  if (structConstructor === undefined)
    return handleDefineStructError(d, env);
  if (structConstructor.type === 'just')
    return ResultErr(`this name was defined previously and cannot be re-defined`, MakeVariableUsageExpr(`make-${ d.name }`));

  
  let structPredicate = env.get(d.name + '?');

  if (structPredicate === undefined)
    return handleDefineStructError(d, env);
  if (structPredicate.type === 'just')
    return ResultErr(`this name was defined previously and cannot be re-defined`, MakeVariableUsageExpr(`${ d.name }?`));

  for (let field of d.fields) {
    let structAccessor = env.get(d.name + '-' + field);
    if (structAccessor === undefined)
      return handleDefineStructError(d, env);
    if (structAccessor.type === 'just')
      return ResultErr(`this name was defined previously and cannot be re-defined`, MakeVariableUsageExpr(`${ d.name }-${ field }`));
  }

  const s = MakeStructType(d.name, d.fields);

  mutateEnv('make-' + d.name, MakeJust(MakeStructureConstructor(s)), env);
  mutateEnv(d.name + '?', MakeJust(MakeStructurePredicate(s)), env);

  for (let i = 0; i < d.fields.length; i++)
    mutateEnv(d.name + '-' + d.fields[i], MakeJust(MakeStructureAccessor(s, i)), env);

  const sndarg: ExprResult = { type: 'StructType', name: d.name };
  mutateEnv(d.name, MakeJust(sndarg), env);
  return Bind(d.name, sndarg);
}

/**
 * Evaluates an expression.
 * @param e an expression
 * @param env an environment which is a base environment
 *            from a student language or one extended inside a function call
 * @returns an expression result
 */
const evaluateExpr = (e: Expr, env: Env): ExprResult => {
  if (isExprError(e)) {
    return e;
  } else switch (e.typeOfExpression) {
    case 'String':
    case 'Number':
    case 'Boolean':
      return MakeAtomic(e.const);

    case 'VariableUsage':
      return evaluateVariableUsage(e, env);

    case 'if':
      return evaluateIf(e, env);

    case 'cond':
      return evaluateCond(e, env);

    case 'Call':
      return evaluateCall(e, env);

    case 'and':
      return evaluateAnd(e, env);

    case 'or':
      return evaluateOr(e, env);

    case 'TemplatePlaceholder':
      return ValErr('...: expected a finished expression, but found a template');
  }
}

const evaluateVariableUsage = (e: {
  typeOfExpression: 'VariableUsage',
  const: string
}, env: Env) => {
  let maybeExprResult = getVal(e.const, env);
  if (!maybeExprResult || maybeExprResult.type === 'nothing')
    return ValErr('this variable is not defined', e);
  
  let exprResult = maybeExprResult.thing;

  if (isValueError(exprResult)) return ValErr('this variable is not defined', e);

  switch (exprResult.type) {
    case 'BuiltinFunction':
    case 'Closure':
    case 'StructureAccessor':
    case 'StructureConstructor':
    case 'StructurePredicate':
      return ValErr(e.const + ': expected a function call, but there is no open parenthesis before this function');
  }

  return exprResult;
}

const evaluateIf = (e: {
  typeOfExpression: 'if',
  predicate: Expr,
  consequent: Expr,
  alternative: Expr
}, env: Env) => {
  const pred = evaluateExpr(e.predicate, env);
      if (isValueError(pred)) return pred;
      if (pred.type !== 'Atomic' || typeof pred.value !== 'boolean')
        return ValErr('predicate must be a boolean', e);
      return pred.value ? evaluateExpr(e.consequent, env) : evaluateExpr(e.alternative, env);
}

const evaluateCond = (e: {
  typeOfExpression: 'cond',
  clauses: [Expr, Expr][]
  final?: Expr
}, env: Env) => {
  for (let clause of e.clauses) {
    const pred = evaluateExpr(clause[0], env);
    if (isValueError(pred)) return pred;
    if (! (pred.type === 'Atomic' && typeof pred.value === 'boolean'))
      return ValErr('cond: question result is not true or false');
    if (pred.value) return evaluateExpr(clause[1], env);
  }

  if (e.final !== undefined) return evaluateExpr(e.final, env);
  return ValErr('all question results were false', e);
}

const evaluateCall = (e: {
  typeOfExpression: 'Call',
  op: string,
  args: Expr[],
}, env: Env) => {
  const op = evaluateOperator(e, e.op, env);
  if (isValueError(op)) return op;

  const args = evaluateOperands(e.args, env);
  if (! isValueArray(args)) {
    for (let arg of args) {
      if (isValueError(arg)) return arg;
    }
    throw new Error("Bug in evaluateExpr, an argument to a function somehow is neither a value or a value error. Check all related predicates if you don't think the bug is here.");
  }

  return apply(op, args, env, e);
}

const evaluateAnd = (e: {
  typeOfExpression: 'and',
  arguments: Expr[]
}, env: Env) => {
  for (let argument of e.arguments) {
    let evaluatedArg = evaluateExpr(argument, env);
    
    if (isValueError(evaluatedArg)) return evaluatedArg;

    switch (evaluatedArg.type) {
      case 'Atomic':
        if (evaluatedArg.value === false)
          return MakeAtomic(false);
        if (evaluatedArg.value === true)
          break;
      
      // Fallthrough case for all non-boolean values.
      default:
        return ValErr(`and: question result is not true or false`, argument);   
    }
  }

  return MakeAtomic(true);
}

const evaluateOr = (e: {
  typeOfExpression: 'or',
  arguments: Expr[]
}, env: Env) => {
  for (let argument of e.arguments) {
    let evaluatedArg = evaluateExpr(argument, env);
    
    if (isValueError(evaluatedArg)) return evaluatedArg;

    switch (evaluatedArg.type) {
      case 'Atomic':
        if (evaluatedArg.value === false)
          break;
        if (evaluatedArg.value === true)
          return MakeAtomic(true);
      
      // Fallthrough case for all non-boolean values.
      default:
        return ValErr(`or: question result is not true or false`, argument);
    }
  }

  return MakeAtomic(false);
}

const evaluateOperator = (e: Expr, op: string, env: Env): ExprResult  => {
  let maybeBody = getVal(op, env);

  if (!maybeBody)
    return ValErr('Expression undefined in program', e);
  if (maybeBody.type === 'nothing')
    return ValErr('Expression defined later in program', e);
  if (isValueError(maybeBody.thing))
    return maybeBody.thing;

  return maybeBody.thing;
}

/**
 * @todo e
 * @param args 
 * @param env 
 * @returns 
 */
const evaluateOperands = (args: Expr[], env: Env): ExprResult[] => {
  return args.map(arg => evaluateExpr(arg, env));
}

const apply = (op: Value, args: Value[], env: Env, e: Expr): ExprResult => {
  switch (op.type) {
    case 'Atomic':
    case 'Struct':
      return ValErr('function call: expected a function after the open parenthesis, but found a variable');

    case 'StructType':
      return ValErr(`${op.name}: expected a function after the open parenthesis, but found a structure type (do you mean make-${op.name})`);

    case 'BuiltinFunction':
      return op.value(args);

    case 'Closure':
      return applyClosure(op, args, e);

    case 'StructureAccessor':
      return applyStructureAccessor(op, args, e);

    case 'StructureConstructor':
      return applyStructureConstructor(op, args, e);

    case 'StructurePredicate':
      return applyStructurePredicate(op, args, e);
  }
}

const applyClosure = (op: {
  type: 'Closure',
  value: Closure
}, args: Value[], e: Expr) => {
  let clos = op.value;
  if (! (clos.args.length === args.length))
    return ValErr('Arity mismatch', e);

  let localEnv = new Map<String, Maybe<ExprResult>>(clos.env);

  for (let i = 0; i < args.length; i++) {
    localEnv = extendEnv(clos.args[i], localEnv, MakeJust(args[i]));
  }
    
  return evaluateExpr(clos.body, localEnv);
}

const applyStructureAccessor = (op: {
  type: 'StructureAccessor',
  struct: StructType,
  index: number
}, args: Value[], e: Expr) => {
  if (args.length !== 1) return ValErr('must apply a structure accessor to exactly one argument', e);
  if (args[0].type !== 'Struct') return ValErr('must apply a structure accessor to a struct', e);
  if (args[0].struct !== op.struct) return ValErr(`posn-x: expects a posn, given a ${ args[0].struct.name }`);
  return args[0].values[op.index];
}

const applyStructureConstructor = (op: {
  type: 'StructureConstructor',
  struct: StructType
}, args: Value[], e: Expr) => {
  if (args.length !== op.struct.fields.length)
  return ValErr('incorrect number of fields for make-' + op.struct.name, e);
  return MakeStruct(op.struct, args);
}

const applyStructurePredicate = (op: {
  type: 'StructurePredicate',
  struct: StructType
}, args: Value[], e: Expr) => {
  if (args.length !== 1) return ValErr('must apply a structure predicate to exactly one argument', e);
  if (args[0].type !== 'Struct') return MakeAtomic(false);
  return MakeAtomic(op.struct === args[0].struct);
}

/**
 * Tests a Check.
 * @param c Check to be tested
 */
const evaluateCheck = (c: {
  type: 'check-expect',
  actual: Expr,
  expected: Expr
} | {
  type: 'check-within'
  actual: Expr,
  expected: Expr,
  margin: Expr
} | {
  type: 'check-error',
  expression: Expr,
  expectedRrrorMessage?: string
}, env: Env): Result => {
  if (c.type === 'check-within' || c.type === 'check-error')
    return ValErr('Unimplemented');

  const expected = evaluateExpr(c.expected, env);
  if (isValueError(expected)) {
    return MakeCheckExpectedError(expected);
  } else {
    const actual = evaluateExpr(c.actual, env);
    if (isValueError(actual))
      return MakeCheckExpectedError(actual);
    if (actualEqualsExpected(actual, expected))
      return MakeCheckSuccess();
    else
      return MakeCheckFailure(actual, expected);
  }
}

const actualEqualsExpected = (actual: ExprResult, expected: Value): boolean => {
  if (isValue(actual))
    switch (expected.type) {
      // These 6 cases should not be applicable to this function.
      case 'BuiltinFunction':
      case 'StructureAccessor':
      case 'StructureConstructor':
      case 'StructurePredicate':
      case 'StructType':
      case 'Closure':
        return false;
      case 'Atomic':
        return actual.type === 'Atomic' && expected.value === actual.value;
      case 'Struct':
        return (
          actual.type === 'Struct'
          && actual.struct.name === expected.struct.name
          && arraysEqual(actual.struct.fields, expected.struct.fields)
          && exprResultArraysEqual(actual.values, expected.values)
        );
    }
  return false;
}

function arraysEqual<T>(a: T[], b: T[]): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

const exprResultArraysEqual = (a: ExprResult[], b: ExprResult[]): boolean => {
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    const e1 = a[i];
    const e2 = a[i];

    if (isValueError(e1) || isValueError(e2)) return false;
    if (! actualEqualsExpected(e1, e2)) return false;
  }

  return true;
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

const handleDefineStructError = (d: {
  type: 'define-struct',
  name: string,
  fields: string[]
}, env: Env): ValueError => {
  const names = ['make-' + d.name, d.name + '?'];
  names.push(...d.fields.map(field => d.name + '-' + field));
  
  for (const name of names) {
    const x = getVal(name, env);
    if (x !== false && x.type === 'just')
      return ValErr(`${name}: this name was defined previously and cannot be re-defined`);
  }

  throw new Error('Bug in define-struct error handling thrown in handleDefineStructError');
}
