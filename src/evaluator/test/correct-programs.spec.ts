import { Closure } from './../types';
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
  SExps, VarDefn, FnDefn, Call, CommentTok, Clos, Bind, Spaces
} from '../constructors';

import {
  TopLevel, Definition, Expr, ReadError,
  TokenType, TokenError, Token, SExp, ExprResult, Result
} from '../types';

import { tokenize                     } from '../tokenize';
import { read,     readTokens         } from '../read';
import { parse,    parseSexps         } from '../parse';
import { evaluate, evaluateTopLevels } from '../eval';
import { print,    printResults       } from '../print';

const A_CLOSURE: ExprResult = {
  type: 'Closure',
  value: {
    args: [],
    env: new Map(),
    body: {
      type: 'String',
      const: 'dummy-closure'
    }
  }
};


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
    CommentTok('; Exercise 1.\n'), NL,
    CommentTok('; init-speed: Number\n'),
    OP, IdTok('define'), SPACE, IdTok('init-speed'), SPACE, NumTok('1.5'), CP, Tok(TokenType.Whitespace, '\n\n'),
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
      OP, IdTok('define'), SPACE, IdTok('init-speed'), SPACE, NumTok('1.5'), CP, Tok(TokenType.Whitespace, '\n\n'),
      CommentTok('; init-angle: Number\n'),
      OP,
        IdTok('define'), SPACE,
        IdTok('init-angle'), SPACE,
        OP, IdTok('*'), SPACE, NumTok('0.3'), SPACE, IdTok('pi'), CP,
      CP, Tok(TokenType.Whitespace, '\n\n'),
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
      CP, Tok(TokenType.Whitespace, '\n\n'),
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
(define init-y-vel (* init-speed (sin init-angle)))

; Exercise 3.

; y-pos: Number -> Number
; Calculates the altitude of the rocket as a function of time.
(define (y-pos t)
  (- (* init-y-vel t)
     (* 0.5 0.003 t t)))`,
    
      [
        CommentTok('; Exercise 1.\n'),
        NL,
        CommentTok('; init-speed: Number\n'),
        OP, IdTok('define'), SPACE, IdTok('init-speed'), SPACE, NumTok('1.5'), CP, Tok(TokenType.Whitespace, '\n\n'),
        CommentTok('; init-angle: Number\n'),
        OP,
          IdTok('define'), SPACE,
          IdTok('init-angle'), SPACE,
          OP, IdTok('*'), SPACE, NumTok('0.3'), SPACE, IdTok('pi'), CP,
        CP, Tok(TokenType.Whitespace, '\n\n'),
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
        CP, Tok(TokenType.Whitespace, '\n\n'),
        CommentTok('; init-y-vel: Number\n'),
        OP,
          IdTok('define'), SPACE,
          IdTok('init-y-vel'), SPACE, 
          OP,
            IdTok('*'), SPACE,
            IdTok('init-speed'), SPACE,
            OP, IdTok('sin'), SPACE, IdTok('init-angle'), CP,
          CP,
        CP, Tok(TokenType.Whitespace, '\n\n'),
        
        CommentTok('; Exercise 3.\n'),
        NL,
        CommentTok('; y-pos: Number -> Number\n'),
        CommentTok('; Calculates the altitude of the rocket as a function of time.\n'),
        OP,
          IdTok('define'), SPACE,
          OP, IdTok('y-pos'), SPACE, IdTok('t'), CP, Tok(TokenType.Whitespace, '\n  '),
          OP,
            IdTok('-'), SPACE,
            OP,
              IdTok('*'), SPACE,
              IdTok('init-y-vel'), SPACE,
              IdTok('t'),
            CP, Tok(TokenType.Whitespace, '\n     '),
            OP,
              IdTok('*'), SPACE,
              NumTok('0.5'), SPACE,
              NumTok('0.003'), SPACE,
              IdTok('t'), SPACE,
              IdTok('t'),
            CP,
          CP,
        CP
      ],
    
      [
       SExps(IdAtom('define'), IdAtom('init-speed'), NumAtom(1.5)),
       SExps(IdAtom('define'), IdAtom('init-angle'), SExps(IdAtom('*'), NumAtom(0.3), IdAtom('pi'))),
       SExps(IdAtom('define'), IdAtom('init-x-vel'), SExps(IdAtom('*'), IdAtom('init-speed'), SExps(IdAtom('cos'), IdAtom('init-angle')))),
       SExps(IdAtom('define'), IdAtom('init-y-vel'), SExps(IdAtom('*'), IdAtom('init-speed'), SExps(IdAtom('sin'), IdAtom('init-angle')))),
       SExps(
         IdAtom('define'),
         SExps(IdAtom('y-pos'), IdAtom('t')),
         SExps(
           IdAtom('-'),
           SExps(IdAtom('*'), IdAtom('init-y-vel'), IdAtom('t')),
           SExps(IdAtom('*'), NumAtom(0.5), NumAtom(0.003), IdAtom('t'), IdAtom('t'))
         )
       )
      ],
    
      [
        VarDefn('init-speed', NumExpr(1.5)),
        VarDefn('init-angle', Call('*', [NumExpr(0.3), IdExpr('pi')])),
        VarDefn('init-x-vel', Call('*',  [IdExpr('init-speed'), Call('cos', [IdExpr('init-angle')])])),
        VarDefn('init-y-vel', Call('*',  [IdExpr('init-speed'), Call('sin', [IdExpr('init-angle')])])),
        FnDefn(
          'y-pos',
          ['t'],
          Call('-',
            [
              Call('*', [IdExpr('init-y-vel'), IdExpr('t')]),
              Call('*', [NumExpr(0.5), NumExpr(0.003), IdExpr('t'), IdExpr('t')])
            ]
          )
        )
      ],
    
      [
        Bind('init-speed', NFn(1.5)),
        Bind('init-angle', NFn(0.3 * Math.PI)),
        Bind('init-x-vel', NFn(1.5 * Math.cos(0.3 * Math.PI))),
        Bind('init-y-vel', NFn(1.5 * Math.sin(0.3 * Math.PI))),
        Bind('y-pos', null)
      ],
    
`Defined init-speed to be 1.5.
Defined init-angle to be ${0.3 * Math.PI}.
Defined init-x-vel to be ${1.5 * Math.cos(0.3 * Math.PI)}.
Defined init-y-vel to be ${1.5 * Math.sin(0.3 * Math.PI)}.
Defined y-pos.
` // null means we dont print out the body
);