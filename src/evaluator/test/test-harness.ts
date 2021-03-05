'use strict';

import {
  isBinding, isClos, isBindingError, isValueError,
  isValue, isExprError, isReadError, isTokenError,
} from './../predicates';

import {
  DefOrExpr, Definition, Expr, ReadError,
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



export const t  = (
  input?: string,
  tokens?: Token[],
  sexps?: SExp[],
  deforexprs?: DefOrExpr[],
  values?: Result[],
  output?: string
) => {

  const inner = () => {
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
          let def: DefOrExpr[] = deforexprs;
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
                    matchingBindings(d, v);
                  } else {
                    // expect(v).toBeInstanceOf(Binding);
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
  describe(subject, inner)


}
// this is a separate function with 2 inputs
            // for (let i = 0; i < doe.length; i++) {
            //   let d = doe[i];
            //   let v = vals[i];
            //   if (isBinding(v)) {
            //     if (v.toBe === null) { // should not use this should care whether a value is null or not
            //         if (isBinding(d)) {
            //         expect(d.defined).toEqual(v.defined);
            //         expect(isClos(d.toBe)).toBeTruthy();
            //       }
            //       // check d is a binding and left hand side of v = left hand side of d 
                  
            //       expect(isBinding(d)).toBeTruthy();

            //     } else expect(d).toEqual(v);
            //   } else expect(d).toEqual(v);
            // }
            


const matchingToken = (actual: Token, expected: Token): boolean => {
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

const matchingTokenErrors = (actual: TokenError, expected: TokenError): boolean => {
  return expected.tokenError === actual.tokenError && expected.string === actual.string;
}

const matchingTokens = (actual: Token[], expected: Token[]): boolean => {
  if (expected.length !== actual.length) return false;
  for (let i = 0; i < expected.length; i++) {
    if (! matchingToken(actual[i], expected[i])) return false;
  }
  return true;
}
        
const matchingSexp = (actual: SExp, expected: SExp): boolean => {
  if (isReadError(expected)) {
    return isReadError(actual) && matchingReadErrors(actual, expected);
  } else if (expected.type === 'SExp Array') {
    return (
      (! isReadError(actual))
      && actual.type === 'SExp Array'
      && matchingSexps(actual.sexp, expected.sexp)
    );
  } else {
    return (! isReadError(actual)) && expected.sexp === actual.sexp;
  }
}

const matchingSexps = (actual: SExp[], expected: SExp[]): boolean => {
  if (expected.length !== actual.length) return false;
  for (let i = 0; i < expected.length; i++) {
    if (! matchingSexp(actual[i], expected[i])) return false;
  }
  return true;
}


const matchingReadErrors = (actual: ReadError, expected: ReadError): boolean => {
  if (isTokenError(expected)) {
    return isTokenError(actual) && (matchingTokenErrors(actual, expected));
  } else {
    return (
     (! isTokenError(actual))
     && expected.readError === actual.readError
     && matchingTokens(actual.tokens, expected.tokens)
    );
  }
}


/**
 * Determines whether two bindings match, allowing the developer to provide null
 * in a binding for convenience.
 * @param actual value returned from the evaluator
 * @param expected value provided to the testing suite by a developer to test
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

// write example bindings and tests here





// test for errors and closures here.


const matchingValues = (actual: Value, expected: Value): boolean => {
  if (expected.type === 'NonFunction') {
    return actual.type === 'NonFunction' && expected.value === actual.value;
  } else if (expected.type === 'BuiltinFunction') {
    return actual.type === 'BuiltinFunction';
  } else {
    return actual.type === 'Closure';
  }
}

const matchingValueErrors = (actual: ValueError, expected: ValueError): boolean => {
  if (isExprError(expected)) {
    return isExprError(actual) && (matchingExprErrors(actual, expected));
  } else {
    if (isExprError(actual)) return false;
    return expected.valueError === actual.valueError && matchingExprs(actual.expr, expected.expr);
  }
}

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

const matchingExprErrors = (actual: ExprError, expected: ExprError): boolean => {
  if (isReadError(expected)) {
    return isReadError(actual) && (matchingReadErrors(actual, expected));
  } else {
    return (
      (! isReadError(actual))
      && expected.exprError === actual.exprError
      && matchingSexps(actual.sexps, expected.sexps)
    );
  }
}


const v1 = NFn(10);
const v2 = NFn('hello');
const v3 = NFn('goodbye');

const b1 = Bind('x', v1);
const b2 = Bind('x', null);
const b3 = Bind('s', v2);
const b4 = Bind('s', v3);
const b5 = Bind('t', v3);

checkExpect(matchingBindings(b1, b1), true);
checkExpect(matchingBindings(b1, b2), true);
checkExpect(matchingBindings(b1, b3), false);
checkExpect(matchingBindings(b3, b4), false);
checkExpect(matchingBindings(b4, b5), false);

checkExpect(matchingValues(v1, v1), true);
checkExpect(matchingValues(v2, v2), true);
checkExpect(matchingValues(v3, v3), true);
checkExpect(matchingValues(v1, v2), false);
checkExpect(matchingValues(v2, v3), false);