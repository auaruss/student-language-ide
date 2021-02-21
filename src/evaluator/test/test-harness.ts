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

  const inner = () =>{
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
          let vals: Result[] = values;
          it('should evaluate correctly', () => {
            for (let i = 0; i < doe.length; i++) {
              let d = doe[i];
              let v = vals[i];
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
  }

  if (input) {
    describe(input, () => {inner()});
  } else if (tokens) {
    describe(tokens.toString(), () => {inner()});
  } else if (sexps) {
    describe(sexps.toString(), () => {inner()});
  } else if (deforexprs) {
    describe(deforexprs.toString(), () => {inner()});
  } else if (values) {
    describe(values.toString(), () => {inner()});
  } else if (output) {
    describe(output.toString(), () => {inner()});
  }
}
