'use strict';

import {
  isBinding, isClos, isBindingError, isValueError,
  isValue, isExprError, isReadError, isTokenError,
} from './../predicates';

import {
  TopLevel, Definition, Expr, ReadError,
  TokenType, TokenError, Token, SExp, ExprResult, Result, Binding,
  Value, ValueError, ExprError
} from '../types';

import {
  Bind, NFn
} from '../constructors';

import { checkExpect } from './check-expect';

import { tokenize                     } from '../tokenize';
import { read,     readTokens         } from '../read';
import { parse,    parseSexps         } from '../parse';
import { evaluate, evaluateDefOrExprs } from '../eval';
import { print,    printResults       } from '../print';
import { ɵdevModeEqual } from '@angular/core';


/**
 * The test harness for the evaluator pipeline.
 * @param input user's expected program
 * @param tokens expected tokenization of user's program
 * @param sexps expected reading of previous tokenization
 * @param deforexprs expected parsing of previous reading
 * @param values expected evaluation of previous parsing
 * @param output expected printing of previous evaluation
 * @returns nothing, prints test output to the console
 */
export const t  = (
  input?: string,
  tokens?: Token[],
  sexps?: SExp[],
  deforexprs?: TopLevel[],
  values?: Result[],
  output?: string
): void => {

  const pipeline = () => {
    if (input) {
      try {
        let ts = tokenize(input);
        if (tokens) {
          let toks: Token[] = tokens;
          it('should tokenize correctly', () => {
            expect(ts).toEqual(toks);
          });
        } else {
          tokens = ts;
        }
      } catch (e) {
        it('Threw this error on the tokenizer: ' + e, () => expect(e).toBeDefined());
      }
    }

    if (tokens) {
      let s: any;
      try {
        s = readTokens(tokens);
        if (sexps) {
          it('should read correctly', () => {
            expect(s).toEqual(sexps);
          });
        } else {
          sexps = s;
        }
      } catch (e) {
        it('Threw this error on the reader: ' + e, () => expect(e).toBeDefined());
      }
    }

    if (sexps) {
      try {
        let d = parseSexps(sexps);
        if (deforexprs) {
          // assign to a variable which has the definite type DefOrExpr[] instead of DefOrExpr[] | undefined.
          let def: TopLevel[] = deforexprs;
          it('should parse correctly', () => {
            expect(d).toEqual(def);
          });
        } else {
          deforexprs = d;
        }
      } catch (e) {
        it('Threw this error on the parser: ' + e, () => expect(e).toBeDefined());
      }
    }

    if (deforexprs) {
      try {
        let doe = evaluateDefOrExprs(deforexprs);
        if (values) {
          const vals: Result[] = values;

          if (vals.length != doe.length) {
            it('should evaluate to the correct number of results', () =>{
              expect(doe.length).toEqual(vals.length);
            });
          } else {
            it('should evaluate correctly', () => {

              for (let i = 0; i < vals.length; i++) {
                let d = doe[i];
                let v = vals[i];

                if (isBinding(d)) {
                  if (isBinding(v)) {
                    expect(matchingBindings(d, v)).toBeTruthy();
                  } else {
                    fail('Expected a non-binding, but evaluator returned a binding.');
                  }
                }
              }

            });
          }
        } else {
          values = doe;
        }
      } catch (e) {
        it('Threw this error on the evaluator: ' + e, () => expect(e).toBeDefined());;
      }
    }

    if (values) { // values cannot be guaranteed to be 
      try {
        let o = printResults(values);
        if (output) {
          it('should output correctly', () => {
            expect(o).toEqual(output);
          });
        }
      } catch (e) {
        it('Threw this error on the printer: ' + e, () => expect(e).toBeDefined());
      }
    }
  }

  let subject;

  for (let i of [input, tokens, sexps, deforexprs, values, output]) {
    if (i) {
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


// Examples to test the matching functions.

const v1 = NFn(10);
const v2 = NFn('hello');
const v3 = NFn('goodbye');

const b1 = Bind('x', v1);
const b2 = Bind('x', null);
const b3 = Bind('s', v2);
const b4 = Bind('s', v3);
const b5 = Bind('t', v3);


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
  if (isExprError(expected)) {
    return isExprError(actual) && (matchingExprErrors(actual, expected));
  } else if (expected.type === 'Call') {
    if (isExprError(actual) || actual.type !== 'Call') return false;
    if (expected.op !== actual.op) return false;
    if (expected.args.length !== actual.args.length) return false;
    for (let i = 0; i < expected.args.length; i++) {
      if (! matchingExprs(actual.args[i], expected.args[i]))
        return false;
    }
    return true;
  } else {
    return (! isExprError(actual)) && expected.type === actual.type && expected.const === actual.const;
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
  if (expected.type === 'NonFunction') {
    return actual.type === 'NonFunction' && expected.value === actual.value;
  } else if (expected.type === 'BuiltinFunction') {
    return actual.type === 'BuiltinFunction';
  } else {
    return actual.type === 'Closure';
  }
}

checkExpect(matchingValues(v1, v1), true);
checkExpect(matchingValues(v2, v2), true);
checkExpect(matchingValues(v3, v3), true);
checkExpect(matchingValues(v1, v2), false);
checkExpect(matchingValues(v2, v3), false);

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
    return expected.valueError === actual.valueError && matchingExprs(actual.expr, expected.expr);
  }
}

/**
 * Determines whether two bindings match, allowing the developer to provide null
 * in a binding for convenience.
 * @param actual binding returned from a function
 * @param expected binding provided to the testing suite by a developer to test
 * @returns whether two bindings are considered to match to the testing framework
 */
const matchingBindings = (actual: Binding, expected: Binding): boolean => {
  if (actual.defined === expected.defined) {
    if (actual.toBe === null) throw new Error("Null is not allowed to be returned from the evaluator in a Binding's toBe field.");
    if (expected.toBe === null) return true;
    
    let actualToBe = actual.toBe;
    let expectedToBe = expected.toBe;

    return (
      isValueError(expectedToBe)
      ? isValueError(actualToBe) && matchingValueErrors(actualToBe, expectedToBe)
      : isValue(actualToBe) && matchingValues(actualToBe, expectedToBe)
    );

  } else return false;
}

checkExpect(matchingBindings(b1, b1), true);
checkExpect(matchingBindings(b1, b2), true);
checkExpect(matchingBindings(b1, b3), false);
checkExpect(matchingBindings(b3, b4), false);
checkExpect(matchingBindings(b4, b5), false);