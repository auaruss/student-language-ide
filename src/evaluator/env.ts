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

/**
 * This file holds the built in environment for the Beginning Student Language.
 */


export const builtinEnv = (): Env => {
  let m = new Map<String, Maybe<ExprResult>>();
  
  m.set('+',
    MakeJust(BFn(
      (vs: Value[]) => {
        let ns:number[] = vs.map( v => {
          if (typeof v.value == 'number') {
            return v.value;
          } else {
            return 0;
            // error non-num passed to +
          }
        });

        if (ns) {
          return NFn(
            ns.reduce((acc: number, elem: number) => acc + elem, 0)
          );
        } else {
          //  Error '+: All arguments to + must be numbers.'
          return NFn(0);
        }
      }
    ))
  );

  //special thanks to Leona
  m.set('string-append',
   MakeJust(BFn(
     (vs: Value[]) => {
      let strings:string[] = vs.map( v => {
        if (typeof v.value == 'string') {
          return v.value;
        } else {
          return '';
          // error non-num passed to +
        }
      });

      if (strings) {
        return NFn(
          strings.reduce((acc: string, elem: string) => acc.concat(elem), '')
        );
      } else {
        //  Error '+: All arguments to + must be numbers.'
        return NFn('');
      }
     }
   ))
  );

  // m.set('*',
  //   BFn(
  //   (vs: Value[]) => {
  //       let ns = vs.map(v => v.value);
  //       if (isNumberArray(ns)) {
  //         return NFn(
  //           ns.reduce((acc: number, elem: number) => acc * elem, 1)
  //         );
  //       } else {
  //         throw new Error('*: All arguments to * must be numbers.');
  //       }
  //     }
  //   )
  // );

  m.set('-',
    MakeJust(BFn(
      (vs: Value[]) => {
        let ns:number[] = vs.map( v => {
          if (typeof v.value == 'number') {
            return v.value;
          } else {
            return 0;
            // error non-num passed to +
          }
        });

        if (ns) {
          return NFn(
            ns.slice(1).reduce((acc: number, elem: number) => acc - elem, ns[0])
          );
        } else {
          //  Error '-: All arguments to - must be numbers.'
          return NFn(0);
        }
      }
    )));

  // m.set('/',
  //   BFn(
  //     (vs: Value[]) => {
  //       let ns = vs.map(v => v.value);
  //       if (isNumberArray(ns)) {
  //         if (ns.length === 0) throw new Error('-: expects at least 1 argument, but found none');
  //         if (ns.length === 1) return NFn(1/ns[0]);
  //         return NFn(
  //           ns.slice(1).reduce((acc: number, elem: number) => acc / elem, ns[0])
  //         );
  //       } else {
  //         throw new Error('/: All arguments to / must be numbers.');
  //       }
  //     }
  //   )
  // );

  m.set('=',
    MakeJust(BFn(
      (vs: Value[]) => {
        if (vs.length === 0) throw new Error('=: expects at least 1 argument, but found none');
        let valToBeEqualTo = vs[0].value;
        return NFn(
          vs.slice(1).reduce((acc: boolean, elem: Value) => acc && elem.value === valToBeEqualTo, true)
        );
      }
    ))
  );

  return m;
}