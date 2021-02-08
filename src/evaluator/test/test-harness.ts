import { isBinding, isClos } from './../predicates';
'use strict';

import {
  DefOrExpr, Definition, Expr, ReadError,
  TokenType, TokenError, Token, SExp, ExprResult, Result
} from '../types';

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
  describe(input, () => {
   
    if (input) {
      try {
        let ts = tokenize(input);
        if (tokens) {
          it('should tokenize correctly', () => {
            expect(ts).toEqual(tokens);
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
          it('should parse correctly', () => {
            expect(d).toEqual(deforexprs);
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
          it('should evaluate correctly', () => {
            for (let i = 0; i < doe.length; i++) {
              let d = doe[i];
              let v = values[i];
              if (isBinding(v)) {
                if (isClos(v.toBe)) {
                  expect(isBinding(d)).toBeTruthy();
                  if (isBinding(d)) {
                    expect(d.defined).toEqual(v.defined);
                    expect(isClos(d.toBe)).toBeTruthy();
                  }
                }
              } else expect(d).toEqual(v);
            }
          });
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
  });
}