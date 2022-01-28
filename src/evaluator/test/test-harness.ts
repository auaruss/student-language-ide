'use strict';

/**
 * @fileoverview Holds the testing harness for conveniently testing the evaluator pipeline,
 *               and also holds some associated functions.
 * 
 * @author Alice Russell
 * 
 */

import {
  isValueError, isExprError, isReadError, isTokenError, isResultError, isTopLevelError,
  isExpr
} from './../predicates';

import {
  TopLevel, Expr, ReadError, TokenError, 
  Token, SExp, Result, Value, ValueError, ExprError, ResultError, ExprResult, TopLevelError
} from '../types';

import { checkExpect } from './check-expect';


import { goodbyeVal, helloVal, tenVal, negZeroTok, negOneTok, negThirteenTok, oneTok, zeroTok } from './examples';


import { tokenize } from '../tokenize';
import { readTokens } from '../read';
import { parseTopLevels } from '../parse';
import { evaluateTopLevels } from '../eval';
import { printResults } from '../print';

/**
 * The testing harness for if you just need to give the input and output strings.
 * @param input user's expected program
 * @param output expected printing of previous evaluation
 * @returns nothing, but prints test output to the console
 */
export const tIO = (input: string, output: string): void => {
  t(input, undefined, undefined, undefined, undefined, output);
}

/**
 * The test harness for the evaluator pipeline.
 * @param input user's expected program
 * @param tokens expected tokenization of user's program
 * @param sexps expected reading of previous tokenization
 * @param toplevels expected parsing of previous reading
 * @param values expected evaluation of previous parsing
 * @param output expected printing of previous evaluation
 * @returns nothing, but prints test output to the console
 */
export const t  = (
  input?: string,
  tokens?: Token[],
  sexps?: SExp[],
  toplevels?: TopLevel[],
  values?: Result[],
  output?: string
): void => {

  const pipeline = () => {
    if (input !== undefined) {
      try {
        let ts = tokenize(input);
        if (tokens !== undefined) {
          let toks: Token[] = tokens;
          it('should tokenize correctly', () => {
            expect(ts).toEqual(toks);
          });
        } else {
          tokens = ts;
        }
      } catch (e) {
        it('Threw this error on the tokenizer: ' + e, () => fail(e));
      }
    }

    if (tokens !== undefined) {
      let s: any;
      try {
        s = readTokens(tokens);
        if (sexps !== undefined) {
          it('should read correctly', () => {
            expect(s).toEqual(sexps);
          });
        } else {
          sexps = s;
        }
      } catch (e) {
        it('Threw this error on the reader: ' + e, () => () => fail(e));
      }
    }

    if (sexps !== undefined) {
      try {
        let d = parseTopLevels(sexps);
        if (toplevels !== undefined) {
          let def: TopLevel[] = toplevels;
          it('should parse correctly', () => {
            expect(d).toEqual(def);
          });
        } else {
          toplevels = d;
        }
      } catch (e) {
        it('Threw this error on the parser: ' + e, () => fail(e));
      }
    }

    if (toplevels !== undefined) {
      try {
        let doe = evaluateTopLevels(toplevels);
        if (values !== undefined) {
          const vals: Result[] = values;

          if (vals.length != doe.length) {
            it('should evaluate to the correct number of results', () =>{
              expect(doe.length).toEqual(vals.length);
            });
          } else {
            it('should evaluate correctly', () => {

              for (let i = 0; i < vals.length; i++) {
                let actual = doe[i];
                let expected = vals[i];

                if (isValueError(actual))
                  expect(isValueError(expected) && matchingValueErrors(actual, expected)).toBeTruthy();
                
                else if (isResultError(actual))
                  expect(isResultError(expected) && matchingResultErrors(actual, expected)).toBeTruthy();

                else if (actual.type === 'define')
                  expect(
                    (! (isValueError(expected) || isResultError(expected)))
                    && expected.type === 'define'
                    && actual.defined === expected.defined
                    && actual.toBe !== null
                    &&(
                      expected.toBe === null
                      || (matchingExprResults(actual.toBe, expected.toBe))
                    )
                  ).toBeTruthy();

                else if (isValueError(expected) || isResultError(expected))
                    fail('expected value is an error, but actual value is not');

                else if (expected.type === 'define')
                    fail('expected value is a binding, but actual value is not');

                else expect(actual).toEqual(expected);
              }

            });
          }
        } else {
          values = doe;
        }
      } catch (e) {
        it('Threw this error on the evaluator: ' + e, () => fail(e));
      }
    }

    if (values !== undefined) { // values cannot be guaranteed to be 
      try {
        let o = printResults(values);
        if (output !== undefined) {
          it('should output correctly', () => {
            expect(o).toEqual(output);
          });
        }
      } catch (e) {
        it('Threw this error on the printer: ' + e, () => () => fail(e));
      }
    }
  }

  let subject: string = '';

  for (let i of [input, tokens, sexps, toplevels, values, output]) {
    if (i !== undefined) {
      if (typeof i === 'string')
        subject = i;
      else
        subject = i.toString();
      break;
    }
    return;
  }

  describe(subject, pipeline);
}

/**
 * Determines if two tokens are equal.
 * @param actual actual token produced by a function
 * @param expected test token expected to be equal 
 * @returns whether two tokens are equal
 */
const matchingTokens = (actual: Token, expected: Token): boolean => {
  if (isTokenError(expected)) {
    return isTokenError(actual) && matchingTokenErrors(actual, expected);
  } else {
    return (
      (! isTokenError(actual))
      && expected.type === actual.type
      && expected.token === actual.token
    );
  }
}

checkExpect(matchingTokens(negThirteenTok, negThirteenTok), true);
checkExpect(matchingTokens(negThirteenTok, negOneTok), false);
checkExpect(matchingTokens(negZeroTok, zeroTok), false);
checkExpect(matchingTokens(oneTok, oneTok), true);

/**
 * Determines if two token arrays are equal.
 * @param actual actual token array produced by a function
 * @param expected test token array expected to be equal 
 * @returns whether two token arrays are equal
 */
const matchingTokenArrays = (actual: Token[], expected: Token[]): boolean => {
  if (expected.length !== actual.length) return false;
  for (let i = 0; i < expected.length; i++) {
    if (! matchingTokens(actual[i], expected[i])) return false;
  }
  return true;
}

checkExpect(matchingTokenArrays([], []), true);
checkExpect(matchingTokenArrays([negThirteenTok, negThirteenTok], [negThirteenTok, negThirteenTok]), true);
checkExpect(matchingTokenArrays([negThirteenTok, negOneTok], []), false);
checkExpect(matchingTokenArrays([oneTok, negZeroTok], [oneTok, zeroTok]), false);

/**
 * Determines if two token errors are equal.
 * @param actual actual token error produced by a function
 * @param expected test token error expected to be equal 
 * @returns whether two token errors are equal
 */
const matchingTokenErrors = (actual: TokenError, expected: TokenError): boolean => {
  return expected.tokenError === actual.tokenError && expected.string === actual.string;
}

/**
 * Determines if two sexps are equal.
 * @param actual actual sexp produced by a function
 * @param expected test sexp expected to be equal
 * @returns whether two sexps are equal
 */
const matchingSexps = (actual: SExp, expected: SExp): boolean => {
  if (isReadError(expected)) {
    return isReadError(actual) && matchingReadErrors(actual, expected);
  } else if (expected.type === 'SExp Array') {
    return (
      (! isReadError(actual))
      && actual.type === 'SExp Array'
      && matchingSexpArrays(actual.sexp, expected.sexp)
    );
  } else {
    return (! isReadError(actual)) && expected.sexp === actual.sexp;
  }
}

/**
 * Determines if two sexp arrays are equal.
 * @param actual actual sexp array produced by a function
 * @param expected test sexp array expected to be equal 
 * @returns whether two sexp arrays are equal
 */
const matchingSexpArrays = (actual: SExp[], expected: SExp[]): boolean => {
  if (expected.length !== actual.length) return false;
  for (let i = 0; i < expected.length; i++) {
    if (! matchingSexps(actual[i], expected[i])) return false;
  }
  return true;
}

/**
 * Determines if two token errors are equal.
 * @param actual actual token error produced by a function
 * @param expected test token error expected to be equal 
 * @returns whether two token errors are equal
 */
const matchingReadErrors = (actual: ReadError, expected: ReadError): boolean => {
  if (isTokenError(expected)) {
    return isTokenError(actual) && (matchingTokenErrors(actual, expected));
  } else {
    return (
     (! isTokenError(actual))
     && expected.readError === actual.readError
     && matchingTokenArrays(actual.tokens, expected.tokens)
    );
  }
}

/**
 * Determines if two exprs are equal.
 * @param actual actual expr produced by a function
 * @param expected test expr expected to be equal 
 * @returns whether two exprs are equal
 */
const matchingExprs = (actual: Expr, expected: Expr): boolean => {
  if (isExprError(expected))
    return isExprError(actual) && (matchingExprErrors(actual, expected));
  if (isExprError(actual)) return false;

  switch (expected.typeOfExpression) {
    case 'Boolean':
    case 'Number':
    case 'String':
    case 'VariableUsage':
      return (
        actual.typeOfExpression === expected.typeOfExpression
        && actual.const === expected.const
      );
  
    case 'Call':
      return (
        actual.typeOfExpression === expected.typeOfExpression
        && actual.op === expected.op
        && actual.args === expected.args
      );

    case 'TemplatePlaceholder':
      return (
        actual.typeOfExpression === expected.typeOfExpression
        && matchingSexps(actual.sexp, expected.sexp)
      );

    case 'and':
    case 'or':
      if (actual.typeOfExpression !== expected.typeOfExpression)
        return false;
      if (actual.arguments.length !== expected.arguments.length)
        return false;
      
      for (let i = 0; i < expected.arguments.length; i++)
        if (! matchingExprs(actual.arguments[i], expected.arguments[i]))
          return false;
      
      return true;

    case 'cond':
      if (actual.typeOfExpression !== expected.typeOfExpression)
        return false;
      if (actual.clauses.length !== expected.clauses.length)
        return false;

      for (let i = 0; i < expected.clauses.length; i++)
        if (! (matchingExprs(actual.clauses[i][0], expected.clauses[i][0])
            && matchingExprs(actual.clauses[i][1], expected.clauses[i][1])))
          return false;
        
      return true;

    case 'if':
      return (
        expected.typeOfExpression === actual.typeOfExpression
        && matchingExprs(expected.predicate, actual.predicate)
        && matchingExprs(expected.consequent, actual.consequent)
        && matchingExprs(expected.alternative, actual.alternative)
      );
  }
}

/**
 * Determines if two expr errors are equal.
 * @param actual actual expr error produced by a function
 * @param expected test expr error expected to be equal 
 * @returns whether two expr errors are equal
 */
const matchingExprErrors = (actual: ExprError, expected: ExprError): boolean => {
  if (isReadError(expected)) {
    return isReadError(actual) && (matchingReadErrors(actual, expected));
  } else {
    return (
      (! isReadError(actual))
      && expected.exprError === actual.exprError
      && matchingSexpArrays(actual.sexps, expected.sexps)
    );
  }
}

/**
 * Determines if two values are equal.
 * @param actual actual value produced by a function
 * @param expected test value expected to be equal 
 * @returns whether two values are equal
 */
const matchingValues = (actual: Value, expected: Value): boolean => {
  if (expected.type === 'Atomic') {
    return actual.type === 'Atomic' && expected.value === actual.value;
  } else if (expected.type === 'BuiltinFunction') {
    return actual.type === 'BuiltinFunction';
  } else {
    return actual.type === 'Closure';
  }
}

checkExpect(matchingValues(tenVal, tenVal), true);
checkExpect(matchingValues(helloVal, helloVal), true);
checkExpect(matchingValues(goodbyeVal, goodbyeVal), true);
checkExpect(matchingValues(tenVal, helloVal), false);
checkExpect(matchingValues(helloVal, goodbyeVal), false);

/**
 * Determines if two value errors are equal.
 * @param actual actual value error produced by a function
 * @param expected test value error expected to be equal 
 * @returns whether two value errors are equal
 */
const matchingValueErrors = (actual: ValueError, expected: ValueError): boolean => {
  if (isExprError(expected)) {
    return isExprError(actual) && (matchingExprErrors(actual, expected));
  } else {
    if (isExprError(actual)) return false;
    if (Array.isArray(actual.expr) || Array.isArray(expected.expr)) return false;
    if (! actual.expr) return (! expected.expr);
    if (! expected.expr) return false;
    return expected.valueError === actual.valueError && matchingExprs(actual.expr, expected.expr);
  }
}

/**
 * Determines if two result errors are equal.
 * @param actual actual result error produced by a function
 * @param expected test result error expected to be equal 
 * @returns whether two result errors are equal
 */
const matchingResultErrors = (actual: ResultError, expected: ResultError): boolean => {
  if (isTopLevelError(expected))
    return (isTopLevelError(actual) && matchingTopLevelErrors(actual, expected));
  return (
    (! isTopLevelError(actual))
    && expected.resultError === actual.resultError
    && matchingTopLevels(expected.toplevel, actual.toplevel)
  )
}

/**
 * Determines if two expression results are equal.
 * @param actual actual expression result produced by a function
 * @param expected test expression result expected to be equal 
 * @returns whether two expression results are equal
 */
 const matchingExprResults = (actual: ExprResult, expected: ExprResult): boolean => {
  if (isValueError(expected))
    return isValueError(actual) && matchingValueErrors(actual, expected);
  return (! isValueError(actual)) && matchingValues(actual, expected);
}

/**
 * Determines if two top level syntactical objects are equal.
 * @param actual actual top level syntactical object produced by a function
 * @param expected test top level syntactical object expected to be equal 
 * @returns whether top level syntactical objects are equal
 */
const matchingTopLevels = (actual: TopLevel, expected: TopLevel): boolean => {
  if (isTopLevelError(expected))
    return isTopLevelError(actual) && matchingTopLevelErrors(actual, expected);
  if (isExpr(expected))
    return isExpr(actual) && matchingExprs(actual, expected);
  
  if (isTopLevelError(actual) || isExpr(actual))
    return false;
  
  switch (expected.type) {
    case 'check-error':
      return (
        expected.type === actual.type
        && matchingExprs(actual.expression, expected.expression)
        && actual.expectedErrorMessage === expected.expectedErrorMessage
      );

    case 'check-expect':
      return (
        expected.type === actual.type
        && matchingExprs(actual.actual, expected.actual)
        && matchingExprs(actual.expected, expected.expected)
      );

    case 'check-within':
      return (
        expected.type === actual.type
        && matchingExprs(actual.actual, expected.actual)
        && matchingExprs(actual.expected, expected.expected)
        && matchingExprs(actual.margin, expected.margin)
      );

    case 'define-constant':
      return (
        expected.type === actual.type
        && expected.name === actual.name
        && matchingExprs(actual.body, expected.body)
      );

    case 'define-function':
      return (
        expected.type === actual.type
        && expected.name === actual.name
        && expected.params === actual.params
      );

    case 'define-struct':
      return (
        expected.type === actual.type
        && expected.fields === actual.fields
        && expected.name === actual.name
      );
  }
}

/**
 * Determines if two top level errors are equal.
 * @param actual actual top level error produced by a function
 * @param expected test top level error expected to be equal 
 * @returns whether top level errors are equal
 */
const matchingTopLevelErrors = (actual: TopLevelError, expected: TopLevelError): boolean => {
  return true;
}
