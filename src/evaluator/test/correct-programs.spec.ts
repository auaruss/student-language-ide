'use strict';

import { t } from './test-harness';

import {
  Tok,
  NumTok, NumAtom, NumExpr, NFn,
  StringTok, StringAtom, StringExpr,
  IdTok, IdAtom, IdExpr,
  BooleanTok, BooleanAtom, BooleanExpr,
  TokErr, ReadErr, DefnErr, ExprErr, ValErr,
  CP, OP, SPACE, OSP, CSP, OBP, CBP, NL,
  SExps, VarDefn, FnDefn, Call, CommentTok, Clos, Bind
} from '../constructors';

import {
  DefOrExpr, Definition, Expr, ReadError,
  TokenType, TokenError, Token, SExp, ExprResult, Result
} from '../types';

import { tokenize                     } from '../tokenize';
import { read,     readTokens         } from '../read';
import { parse,    parseSexps         } from '../parse';
import { evaluate, evaluateDefOrExprs } from '../eval';
import { print,    printResults       } from '../print';

/*****************************************************************************
 *                        Test cases for correctness.                        *
 *                                                                           *
 * These test cases are intended to test the basic behavior of a BSL program *
 * regardless of live editing behavior. These tests are generally based on   *
 * the problem sets from Indiana University's C211 class.                    *
 *****************************************************************************/

 /* Assignment 2 tests. */

t(
`; Exercise 1.

; init-speed: Number
(define init-speed 1.5)

; init-angle: Number
(define init-angle (* 0.3 pi))`,

  [
    CommentTok('; Exercise 1.\n'),
    NL,
    CommentTok('; init-speed: Number\n'),
    OP, IdTok('define'), SPACE, IdTok('init-speed'), SPACE, NumTok('1.5'), CP, NL, 
    NL, 
    CommentTok('; init-angle: Number\n'),
    OP,
      IdTok('define'), SPACE,
      IdTok('init-angle'), SPACE,
      OP, IdTok('*'), SPACE, NumTok('0.3'), SPACE, IdTok('pi'), CP,
    CP
  ],

  [
   SExps(IdAtom('define'), IdAtom('init-speed'), NumAtom(1.5)),
   SExps(IdAtom('define'), IdAtom('init-angle'), SExps(IdAtom('*'), NumAtom(0.3), IdAtom('pi')))
  ],

  [
    VarDefn('init-speed', NumExpr(1.5)),
    VarDefn('init-angle', Call('*', [NumExpr(0.3), IdExpr('pi')]))
  ],

  [
    Bind('init-speed', NFn(1.5)),
    Bind('init-angle', NFn(0.3 * Math.PI))
  ],

`Defined init-speed to be 1.5.
Defined init-angle to be ${0.3 * Math.PI}.
`
);


t(
`; Exercise 1.

; init-speed: Number
(define init-speed 1.5)

; init-angle: Number
(define init-angle (* 0.3 pi))

; Exercise 2.

; init-x-vel: Number
(define init-x-vel (* init-speed (cos init-angle)))

; init-y-vel: Number
(define init-y-vel (* init-speed (sin init-angle)))`,
  
    [
      CommentTok('; Exercise 1.\n'),
      NL,
      CommentTok('; init-speed: Number\n'),
      OP, IdTok('define'), SPACE, IdTok('init-speed'), SPACE, NumTok('1.5'), CP, NL, 
      NL, 
      CommentTok('; init-angle: Number\n'),
      OP,
        IdTok('define'), SPACE,
        IdTok('init-angle'), SPACE,
        OP, IdTok('*'), SPACE, NumTok('0.3'), SPACE, IdTok('pi'), CP,
      CP, NL,
      NL,
      CommentTok('; Exercise 2.\n'),
      NL,
      CommentTok('; init-x-vel: Number\n'),
      OP,
        IdTok('define'), SPACE,
        IdTok('init-x-vel'), SPACE, 
        OP,
          IdTok('*'), SPACE,
          IdTok('init-speed'), SPACE,
          OP, IdTok('cos'), SPACE, IdTok('init-angle'), CP,
        CP,
      CP, NL,
      NL,
      CommentTok('; init-y-vel: Number\n'),
      OP,
        IdTok('define'), SPACE,
        IdTok('init-y-vel'), SPACE, 
        OP,
          IdTok('*'), SPACE,
          IdTok('init-speed'), SPACE,
          OP, IdTok('sin'), SPACE, IdTok('init-angle'), CP,
        CP,
      CP
    ],
  
    [
     SExps(IdAtom('define'), IdAtom('init-speed'), NumAtom(1.5)),
     SExps(IdAtom('define'), IdAtom('init-angle'), SExps(IdAtom('*'), NumAtom(0.3), IdAtom('pi'))),
     SExps(IdAtom('define'), IdAtom('init-x-vel'), SExps(IdAtom('*'), IdAtom('init-speed'), SExps(IdAtom('cos'), IdAtom('init-angle')))),
     SExps(IdAtom('define'), IdAtom('init-y-vel'), SExps(IdAtom('*'), IdAtom('init-speed'), SExps(IdAtom('sin'), IdAtom('init-angle'))))
    ],
  
    [
      VarDefn('init-speed', NumExpr(1.5)),
      VarDefn('init-angle', Call('*', [NumExpr(0.3), IdExpr('pi')])),
      VarDefn('init-x-vel', Call('*',  [IdExpr('init-speed'), Call('cos', [IdExpr('init-angle')])])),
      VarDefn('init-y-vel', Call('*',  [IdExpr('init-speed'), Call('sin', [IdExpr('init-angle')])]))
    ],
  
    [
      Bind('init-speed', NFn(1.5)),
      Bind('init-angle', NFn(0.3 * Math.PI)),
      Bind('init-x-vel', NFn(1.5 * Math.cos(0.3 * Math.PI))),
      Bind('init-y-vel', NFn(1.5 * Math.sin(0.3 * Math.PI)))
    ],
  
`Defined init-speed to be 1.5.
Defined init-angle to be ${0.3 * Math.PI}.
Defined init-x-vel to be ${1.5 * Math.cos(0.3 * Math.PI)}.
Defined init-y-vel to be ${1.5 * Math.sin(0.3 * Math.PI)}.
`
  );

