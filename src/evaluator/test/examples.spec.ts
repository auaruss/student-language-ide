'use strict';

import { MakeCheckExpect, MakeCheckSuccess, MakeIf } from '../constructors';
import { t, tIO } from './test-harness';

import {
  Tok,
  NumTok, NumAtom, NumExpr, NFn,
  StringTok, StringAtom, StringExpr,
  IdTok, IdAtom, IdExpr,
  BooleanTok, BooleanAtom, BooleanExpr,
  TokErr, ReadErr, DefnErr, ExprErr, ValErr,
  CP, OP, SPACE, OSP, CSP, OBP, CBP, NL,
  SExps, VarDefn, FnDefn, Call, Bind, CommentTok
} from '../constructors';

import {
  TopLevel, Definition, Expr, ReadError,
  TokenType, TokenError, Token, SExp, ExprResult, Result
} from '../types';

import { 
  checkExpectSameNum, checkExpectSameId, checkExpectSameString, 
  checkExpectTrue, checkExpectFalse, checkExpectDiffNum, 
  checkExpectDiffId, checkExpectDiffString,
  checkExpectTrueIsNotFalse, checkExpectDiffType1, 
  checkExpectDiffType2, checkExpectDiffType3, checkExpectedErrorDiffId, checkExpectedErrorDiffType1, checkExpectedErrorSameId, checkFailureDiffNum, checkFailureDiffString, checkFailureDiffType2, checkFailureDiffType3, checkFailureTrueIsNotFalse
} from './examples';


import { tokenize } from '../tokenize';
import { read } from '../read';
import { ParseError } from '@angular/compiler';

/*****************************************************************************
 *                        Test cases for correctness.                        *
 *                                                                           *
 * These test cases are intended to test the basic behavior of a BSL program *
 * regardless of live editing behavior.                                      *
 *****************************************************************************/

t('', [], [], [], [], '\n');

t('()',
  [ OP, CP ],
  [ SExps() ],
  [ ExprErr('Empty Expr', [ SExps() ]) ],
  [ ExprErr('Empty Expr', [ SExps() ]) ],
  'Expression Error: Empty Expr in ()\n');

t('123',
  [ NumTok('123') ],
  [ NumAtom(123) ],
  [ NumExpr(123) ],
  [ NFn(123) ], 
  '123\n'
);

t('-13',
  [ NumTok('-13') ],
  [ NumAtom(-13) ],
  [ NumExpr(-13) ],
  [ NFn(-13) ], 
  '-13\n'
);

t('-0',
  [ NumTok('-0') ],
  [ NumAtom(-0) ],
  [ NumExpr(-0) ],
  [ NFn(-0) ], 
  '0\n'
);

t('"hello"',
  [ StringTok('hello') ],
  [ StringAtom('hello') ],
  [ StringExpr('hello')],
  [ NFn('hello') ],
  '"hello"\n'
);

t('hello',
  [ IdTok('hello') ],
  [ IdAtom('hello') ],
  [ IdExpr('hello') ],
  [ ValErr('this variable is not defined', IdExpr('hello') )],
  'hello: this variable is not defined\n'
);

t('#true',
  [ BooleanTok('#true') ],
  [ BooleanAtom('#true') ],
  [ BooleanExpr(true) ],
  [ NFn(true)],
  '#true\n'
);

t('(', 
  [ OP ],
  [ ReadErr('No Closing Paren', [ OP ]) ],
  [ ReadErr('No Closing Paren', [ OP ]) ],
  [ ReadErr('No Closing Paren', [ OP ]) ],
  'Read Error: No Closing Paren for (\n'
);


t('[',
  [ OSP ],
  [ ReadErr('No Closing Paren', [ OSP ]) ],
  [ ReadErr('No Closing Paren', [ OSP ]) ],
  [ ReadErr('No Closing Paren', [ OSP ]) ],
  'Read Error: No Closing Paren for [\n'
);

t('{',
  [ OBP ],
  [ ReadErr('No Closing Paren', [ OBP ]) ],
  [ ReadErr('No Closing Paren', [ OBP ]) ],
  [ ReadErr('No Closing Paren', [ OBP ]) ],
  'Read Error: No Closing Paren for {\n'
);

t(')',
  [ CP ],
  [ ReadErr('No Open Paren', [ CP ]) ],
  [ ReadErr('No Open Paren', [ CP ]) ],
  [ ReadErr('No Open Paren', [ CP ]) ],
  'Read Error: No Open Paren for )\n'
);

t(']',
  [ CSP ],
  [ ReadErr('No Open Paren', [ CSP ]) ],
  [ ReadErr('No Open Paren', [ CSP ]) ],
  [ ReadErr('No Open Paren', [ CSP ]) ],
  'Read Error: No Open Paren for ]\n'
);

t('}',
  [ CBP ],
  [ ReadErr('No Open Paren', [ CBP ]) ],
  [ ReadErr('No Open Paren', [ CBP ]) ],
  [ ReadErr('No Open Paren', [ CBP ]) ],
  'Read Error: No Open Paren for }\n'
);

t('#t', [ BooleanTok('#t') ], [ BooleanAtom('#t') ]);
t('#f', [ BooleanTok('#f') ], [ BooleanAtom('#f') ]);
t('#true', [ BooleanTok('#true') ], [ BooleanAtom('#true') ]);
t('#false', [ BooleanTok('#false') ], [ BooleanAtom('#false') ]);

t('x', [ IdTok('x') ], [ IdAtom('x') ]);
t('+', [ IdTok('+') ], [ IdAtom('+') ]);

t('"abc" def "ghi"',
  
  [
    StringTok('abc'),
    SPACE,
    IdTok('def'),
    SPACE,
    StringTok('ghi')
  ],
  
  [
    StringAtom('abc'),
    IdAtom('def'),
    StringAtom('ghi')
  ]
);

t('"abc"def"ghi"',
  
  [
    StringTok('abc'),
    IdTok('def'),
    StringTok('ghi')
  ],

  [
    StringAtom('abc'),
    IdAtom('def'),
    StringAtom('ghi')
  ]
);

t('#t123',
  [
    TokErr('#'),
    IdTok('t123')
  ],

  [
    ReadErr(
      'Invalid token found while reading SExp',
      [TokErr('#')]
    ),

    IdAtom('t123')
  ]
);

t(
  '(define x 10)',
  [ OP, IdTok('define'), SPACE, IdTok('x'), SPACE, NumTok('10'), CP ],
  [ 
    SExps(IdAtom('define'), IdAtom('x'), NumAtom(10))
  ]
);

t('(123)',
  
  [
    OP,
    NumTok('123'),
    CP
  ],

  [
    SExps(NumAtom(123))
  ]
);

t('(\n'
  + '1',

  [ OP, NL, NumTok('1') ],
  [ ReadErr('No Closing Paren', [ OP, NumTok('1') ]) ],
  [ ReadErr('No Closing Paren', [ OP, NumTok('1') ]) ],
  [ ReadErr('No Closing Paren', [ OP, NumTok('1') ]) ],
  'Read Error: No Closing Paren for (1\n'
);

//    1st option. ( [) 1
// -> 2nd option. ([) 1 <- We are currently using this.
//    3rd option. ( [ 1
t('([)\n'
  + '1'
);


// ([) ) 1
t('([))\n'
  + '1'
);

t('(]))\n'
+ '1'
);

t('([[[][][][][][])\n'
  + '(define x 10)\n'
  + 'x',
);

t('([[[][][][][][])))[][])))){}{}{}',
  
  [
    OP,
    OSP,
    OSP,
    OSP,
    CSP,
    OSP,
    CSP,
    OSP,
    CSP,
    OSP,
    CSP,
    OSP,
    CSP,
    OSP,
    CSP,
    CP,
    CP,
    CP,
    OSP,
    CSP,
    OSP,
    CSP,
    CP,
    CP,
    CP,
    CP,
    OBP,
    CBP,
    OBP,
    CBP,
    OBP,
    CBP
  ],

  [
    ReadErr('No Valid SExp',
      [
        OP,
        OSP,
        OSP,
        OSP,
        CSP,
        OSP,
        CSP,
        OSP,
        CSP,
        OSP,
        CSP,
        OSP,
        CSP,
        OSP,
        CSP,
        CP,
        CP,
        CP,
        OSP,
        CSP,
        OSP,
        CSP,
        CP,
        CP,
        CP,
        CP,
        OBP,
        CBP,
        OBP,
        CBP,
        OBP,
        CBP
      ])
    ]
);

t(') (hello)',
  
  [
    CP,
    SPACE,
    OP,
    IdTok('hello'),
    CP
  ],

  [
    ReadErr('No Open Paren', [ CP ]),
    SExps(IdAtom('hello'))
  ],
);

t('(define bool #t123)',
  
  [
    OP,
    IdTok('define'),
    SPACE,
    IdTok('bool'),
    SPACE,
    TokErr('#'),
    IdTok('t123'),
    CP
  ],

  [
    SExps(
      IdAtom('define'),
      IdAtom('bool'),
      TokErr('#'),
      IdAtom('t123'),
    )
  ],

  [
    DefnErr('A definition can\'t have more than 3 parts',
    [
      IdAtom('define'),
      IdAtom('bool'),
      TokErr('#'),
      IdAtom('t123'),
    ])
  ],
);

t('(define (fact n) (if (= n 0) 1 (* n (fact (- n 1)))))',
  
  [
    OP,
    IdTok('define'),
    SPACE,
    OP,
    IdTok('fact'),
    SPACE,
    IdTok('n'),
    CP,
    SPACE,
    OP,
    IdTok('if'),
    SPACE,
    OP,
    IdTok('='),
    SPACE,
    IdTok('n'),
    SPACE,
    NumTok('0'),
    CP,
    SPACE,
    NumTok('1'),
    SPACE,
    OP,
    IdTok('*'),
    SPACE,
    IdTok('n'),
    SPACE,
    OP,
    IdTok('fact'),
    SPACE,
    OP,
    IdTok('-'),
    SPACE,
    IdTok('n'),
    SPACE,
    NumTok('1'),
    CP,
    CP,
    CP,
    CP,
    CP
  ],

  [
    SExps(
      IdAtom('define'),
      SExps(
        IdAtom('fact'),
        IdAtom('n')
      ),
      SExps(
        IdAtom('if'),
        SExps(
          IdAtom('='),
          IdAtom('n'),
          NumAtom(0)
        ),
        NumAtom(1),
        SExps(
          IdAtom('*'),
          IdAtom('n'),
          SExps(
            IdAtom('fact'),
            SExps(
              IdAtom('-'),
              IdAtom('n'),
              NumAtom(1)
            )
          )
        )
      )
    )
  ],
  
  [
    FnDefn(
      'fact',
      ['n'],
      MakeIf(
        Call(
          '=',
          [ IdExpr('n'), NumExpr(0) ]
        ),
        NumExpr(1),
        Call(
          '*',
          [
            IdExpr('n'),
            Call(
              'fact',
              [ Call('-', [IdExpr('n'), NumExpr(1)]) ]
            )
          ]
        )
      )
    )
  ]
);

t('define (fact n) (if (= n 0) 1 (* n (fact (- n 1)))))',

  [
    IdTok('define'),
    SPACE,
    OP,
    IdTok('fact'),
    SPACE,
    IdTok('n'),
    CP,
    SPACE,
    OP,
    IdTok('if'),
    SPACE,
    OP,
    IdTok('='),
    SPACE,
    IdTok('n'),
    SPACE,
    NumTok('0'),
    CP,
    SPACE,
    NumTok('1'),
    SPACE,
    OP,
    IdTok('*'),
    SPACE,
    IdTok('n'),
    SPACE,
    OP,
    IdTok('fact'),
    SPACE,
    OP,
    IdTok('-'),
    SPACE,
    IdTok('n'),
    SPACE,
    NumTok('1'),
    CP,
    CP,
    CP,
    CP,
    CP
  ],

  [
    IdAtom('define'),
    SExps(
      IdAtom('fact'),
      IdAtom('n')
    ),
    SExps(
      IdAtom('if'),
      SExps(
        IdAtom('='),
        IdAtom('n'),
        NumAtom(0)
      ),
      NumAtom(1),
      SExps(
        IdAtom('*'),
        IdAtom('n'),
        SExps(
          IdAtom('fact'),
          SExps(
            IdAtom('-'),
            IdAtom('n'),
            NumAtom(1)
          )
        )
      )
    ),
    ReadErr('No Open Paren', [ CP ])
  ],
);

t('(fact n) (if (= n 0) 1 (* n (fact (- n 1)))))',
  [
    OP,
    IdTok('fact'),
    SPACE,
    IdTok('n'),
    CP,
    SPACE,
    OP,
    IdTok('if'),
    SPACE,
    OP,
    IdTok('='),
    SPACE,
    IdTok('n'),
    SPACE,
    NumTok('0'),
    CP,
    SPACE,
    NumTok('1'),
    SPACE,
    OP,
    IdTok('*'),
    SPACE,
    IdTok('n'),
    SPACE,
    OP,
    IdTok('fact'),
    SPACE,
    OP,
    IdTok('-'),
    SPACE,
    IdTok('n'),
    SPACE,
    NumTok('1'),
    CP,
    CP,
    CP,
    CP,
    CP
  ],

  [
    SExps(
      IdAtom('fact'),
      IdAtom('n')
    ),
    SExps(
      IdAtom('if'),
      SExps(
        IdAtom('='),
        IdAtom('n'),
        NumAtom(0)
      ),
      NumAtom(1),
      SExps(
        IdAtom('*'),
        IdAtom('n'),
        SExps(
          IdAtom('fact'),
          SExps(
            IdAtom('-'),
            IdAtom('n'),
            NumAtom(1)
          )
        )
      )
    ),
    ReadErr('No Open Paren', [ CP ])
  ]
);

t('(define (simple-choice x y z) (if x y z))\n'
+ '(simple-choice #t 10 20)\n'
+ '\n'
+ '(define (* m n) (if (= n 0) 0 (+ m (* m (- n 1)))))\n'
+ '(define (fact n) (if (= n 0) 1 (* n (fact (- n 1)))))\n',

  tokenize('(define (simple-choice x y z) (if x y z))')
  .concat([ NL ])
  .concat(tokenize('(simple-choice #t 10 20)'))
  .concat([ Tok(TokenType.Whitespace, '\n\n') ])
  .concat(tokenize('(define (* m n) (if (= n 0) 0 (+ m (* m (- n 1)))))'))
  .concat([ NL ])
  .concat(tokenize('(define (fact n) (if (= n 0) 1 (* n (fact (- n 1)))))'))
  .concat([ NL ]),

  [
    SExps(
      IdAtom('define'),
      SExps(
        IdAtom('simple-choice'),
        IdAtom('x'),
        IdAtom('y'),
        IdAtom('z')
      ),
      SExps(
        IdAtom('if'),
        IdAtom('x'),
        IdAtom('y'),
        IdAtom('z')
      )
    ),

    SExps(
        IdAtom('simple-choice'),
        BooleanAtom('#t'),
        NumAtom(10),
        NumAtom(20)
    ),

    SExps(
      IdAtom('define'),
      SExps(
        IdAtom('*'),
        IdAtom('m'),
        IdAtom('n')
      ),
      SExps(
        IdAtom('if'),
        SExps(
          IdAtom('='),
          IdAtom('n'),
          NumAtom(0)
        ),
        NumAtom(0),
        SExps(
          IdAtom('+'),
          IdAtom('m'),
          SExps(
            IdAtom('*'),
            IdAtom('m'),
            SExps(
              IdAtom('-'),
              IdAtom('n'),
              NumAtom(1)
            )
          )
        )
      )
    ),

    SExps(
      IdAtom('define'),
      SExps(
        IdAtom('fact'),
        IdAtom('n')
      ),
      SExps(
        IdAtom('if'),
        SExps(
          IdAtom('='),
          IdAtom('n'),
          NumAtom(0)
        ),
        NumAtom(1),
        SExps(
          IdAtom('*'),
          IdAtom('n'),
          SExps(
            IdAtom('fact'),
            SExps(
              IdAtom('-'),
              IdAtom('n'),
              NumAtom(1)
            )
          )
        )
      )
    )
  ]
);

t(
  '(define (mn x y) (if (< x y) x y))',
  [
    OP,
    IdTok('define'),
    SPACE,
    OP,
    IdTok('mn'),
    SPACE,
    IdTok('x'),
    SPACE,
    IdTok('y'),
    CP,
    SPACE,
    OP,
    IdTok('if'),
    SPACE,
    OP,
    IdTok('<'),
    SPACE,
    IdTok('x'),
    SPACE,
    IdTok('y'),
    CP,
    SPACE,
    IdTok('x'),
    SPACE,
    IdTok('y'),
    CP,
    CP
  ],

  [
    SExps(
      IdAtom('define'),
      SExps(
        IdAtom('mn'),
        IdAtom('x'),
        IdAtom('y')
      ),
      SExps(
        IdAtom('if'),
        SExps(
          IdAtom('<'),
          IdAtom('x'),
          IdAtom('y')
        ),
        IdAtom('x'),
        IdAtom('y')
      )
    )
  ]
);




t('(simple-choice #t 10 20)',

  [
    OP,
    IdTok('simple-choice'),
    SPACE,
    BooleanTok('#t'),
    SPACE,
    NumTok('10'),
    SPACE,
    NumTok('20'),
    CP
  ],

  [
    SExps(
      IdAtom('simple-choice'),
      BooleanAtom('#t'),
      NumAtom(10),
      NumAtom(20)
    )
  ]
);

t('(* 2 3)',
  [
    OP,
    IdTok('*'),
    SPACE,
    NumTok('2'),
    SPACE,
    NumTok('3'),
    CP
  ],

  [
    SExps(
      IdAtom('*'),
      NumAtom(2),
      NumAtom(3)
    )
  ]
);

t('(fact 5)',
  
  [
    OP,
    IdTok('fact'),
    SPACE,
    NumTok('5'),
    CP
  ],

  [
    SExps(
      IdAtom('fact'),
      NumAtom(5)
    )
  ]
);

t('(f 10)',
  
  [
    OP,
    IdTok('f'),
    SPACE,
    NumTok('10'),
    CP
  ],

  [
    SExps(
      IdAtom('f'),
      NumAtom(10)
    )
  ]
);

t('(define x 100)'
  + '(define testNum 10)'
  + '(define testBool #true)'
  + '(define testStr "Hello")'
  + '(define (simple-choice x y z) (if x y z))'
  + '(simple-choice #t 10 20)'
  + '\n'
  + '(define (mul m n) (if (= n 0) 0 (+ m (mul m (- n 1)))))'
  + '(mul 2 3)'
  + '\n'
  + '\n'
  + '(define (fact n) (if (= n 0) 1 (mul n (fact (- n 1)))))'
  + '(fact 5)'
  + '(define (f x) (g (+ x 1)))'
  + '(define (g y) (mul x y))'
  + '\n'
  + 'x\n'
  + 'testNum\n'
  + 'testBool\n'
  + 'testStr\n'
  + '(* 2 3)'
  + '(/ 2 2)'
  + '(- 3 2)'
  + '(+ 2)'
  + '(- 2)'
  + '(* 2)'
  + '(/ 2)',

  tokenize('(define x 100)')
    .concat(tokenize('(define testNum 10)'))
    .concat(tokenize('(define testBool #true)'))
    .concat(tokenize('(define testStr "Hello")'))
    .concat(tokenize('(define (simple-choice x y z) (if x y z))'))
    .concat(tokenize('(simple-choice #t 10 20)'))
    .concat(tokenize('\n'))
    .concat(tokenize('(define (mul m n) (if (= n 0) 0 (+ m (mul m (- n 1)))))'))
    .concat(tokenize('(mul 2 3)'))
    .concat(tokenize('\n\n'))
    .concat(tokenize('(define (fact n) (if (= n 0) 1 (mul n (fact (- n 1)))))'))
    .concat(tokenize('(fact 5)'))
    .concat(tokenize('(define (f x) (g (+ x 1)))'))
    .concat(tokenize('(define (g y) (mul x y))'))
    .concat(tokenize('\n'))
    .concat(tokenize('x\n'))
    .concat(tokenize('testNum\n'))
    .concat(tokenize('testBool\n'))
    .concat(tokenize('testStr\n'))
    .concat(tokenize('(* 2 3)'))
    .concat(tokenize('(/ 2 2)'))
    .concat(tokenize('(- 3 2)'))
    .concat(tokenize('(+ 2)'))
    .concat(tokenize('(- 2)'))
    .concat(tokenize('(* 2)'))
    .concat(tokenize('(/ 2)')),

  read('(define x 100)')
    .concat(read('(define testNum 10)'))
    .concat(read('(define testBool #true)'))
    .concat(read('(define testStr "Hello")'))
    .concat(read('(define (simple-choice x y z) (if x y z))'))
    .concat(read('(simple-choice #t 10 20)'))
    .concat(read('(define (mul m n) (if (= n 0) 0 (+ m (mul m (- n 1)))))'))
    .concat(read('(mul 2 3)'))
    .concat(read('(define (fact n) (if (= n 0) 1 (mul n (fact (- n 1)))))'))
    .concat(read('(fact 5)'))
    .concat(read('(define (f x) (g (+ x 1)))'))
    .concat(read('(define (g y) (mul x y))'))
    .concat(read('x'))
    .concat(read('testNum'))
    .concat(read('testBool'))
    .concat(read('testStr'))
    .concat(read('(* 2 3)'))
    .concat(read('(/ 2 2)'))
    .concat(read('(- 3 2)'))
    .concat(read('(+ 2)'))
    .concat(read('(- 2)'))
    .concat(read('(* 2)'))
    .concat(read('(/ 2)'))
);

t('(define (fib n) (if (or (= n 0) (= n 1)) 1 (+ (fib (- n 1)) (fib (- n 2)))))',
  [
    OP,
    IdTok('define'),
    SPACE,
    OP,
    IdTok('fib'),
    SPACE,
    IdTok('n'),
    CP,
    SPACE,
    OP,
    IdTok('if'),
    SPACE,
    OP,
    IdTok('or'),
    SPACE,
    OP,
    IdTok('='),
    SPACE,
    IdTok('n'),
    SPACE,
    NumTok('0'),
    CP,
    SPACE,
    OP,
    IdTok('='),
    SPACE,
    IdTok('n'),
    SPACE,
    NumTok('1'),
    CP,
    CP,
    SPACE,
    NumTok('1'),
    SPACE,
    OP,
    IdTok('+'),
    SPACE,
    OP,
    IdTok('fib'),
    SPACE,
    OP,
    IdTok('-'),
    SPACE,
    IdTok('n'),
    SPACE,
    NumTok('1'),
    CP,
    CP,
    SPACE,
    OP,
    IdTok('fib'),
    SPACE,
    OP,
    IdTok('-'),
    SPACE,
    IdTok('n'),
    SPACE,
    NumTok('2'),
    CP,
    CP,
    CP,
    CP,
    CP
  ],

  [
    SExps(
      IdAtom('define'),
      SExps(
        IdAtom('fib'),
        IdAtom('n')
      ),
      SExps(
        IdAtom('if'),
        SExps(
          IdAtom('or'),
          SExps(
            IdAtom('='),
            IdAtom('n'),
            NumAtom(0)
          ),
          SExps(
            IdAtom('='),
            IdAtom('n'),
            NumAtom(1)
          )
        ),
        NumAtom(1),
        SExps(
          IdAtom('+'),
          SExps(
            IdAtom('fib'),
            SExps(
              IdAtom('-'),
              IdAtom('n'),
              NumAtom(1)
            )
          ),
          SExps(
            IdAtom('fib'),
            SExps(
              IdAtom('-'),
              IdAtom('n'),
              NumAtom(2)
            )
          )
        )
      )
    )
  ]
);

t('("hello" world (this "is" "some non" sense (which should be) #t 10 readable))',
  
  [
    OP,
    StringTok('hello'),
    SPACE,
    IdTok('world'),
    SPACE,
    OP,
    IdTok('this'),
    SPACE,
    StringTok('is'),
    SPACE,
    StringTok('some non'),
    SPACE,
    IdTok('sense'),
    SPACE,
    OP,
    IdTok('which'),
    SPACE,
    IdTok('should'),
    SPACE,
    IdTok('be'),
    CP,
    SPACE,
    BooleanTok('#t'),
    SPACE,
    NumTok('10'),
    SPACE,
    IdTok('readable'),
    CP,
    CP
  ],

  [
    SExps(
      StringAtom('hello'),
      IdAtom('world'),
      SExps(
        IdAtom('this'),
        StringAtom('is'),
        StringAtom('some non'),
        IdAtom('sense'),
        SExps(
          IdAtom('which'),
          IdAtom('should'),
          IdAtom('be')
        ),
        BooleanAtom('#t'),
        NumAtom(10),
        IdAtom('readable')
      )
    )
  ]
);


t('(define y x)\n' + 
'(define x 3)');

// f used before its definition
// must know its got a defn but that it hasnt been 'filled in'

t('(define x (f 3)) (define (f y) y)'

);

t('(define x (+ (+) 3)');


t(
`(define x 10)
(check-expect x 10)`,

  [
    OP, IdTok('define'), SPACE, IdTok('x'), SPACE, NumTok('10'), CP, NL,
    OP, IdTok('check-expect'), SPACE, IdTok('x'), SPACE, NumTok('10'), CP
  ],

  [
    SExps(IdAtom('define'), IdAtom('x'), NumAtom(10)),
    SExps(IdAtom('check-expect'), IdAtom('x'), NumAtom(10)),
  ],

  [
    VarDefn('x', NumExpr(10)),
    MakeCheckExpect(IdExpr('x'), NumExpr(10))
  ]

);


t(
`;(define x 10)`,
[ CommentTok(';(define x 10)') ]
);

// write tests here for how a closure should be printed.
t('(define (f x) (+ x x))',
  undefined, undefined, undefined, undefined,
  'Defined (f x) to be (+ x x).\n'
);

t('(define (f x y) (+ x y))',
  undefined, undefined, undefined, undefined,
  'Defined (f x y) to be (+ x y).\n'
);


// do we report both of these?

tIO('(+ hello hello)',
  'hello: this variable is not defined\n'
);


tIO('+',
  '+: expected a function call, but there is no open parenthesis before this function\n'
);

tIO(
`(define (! x)
(if (= x 0)
    1
      (* x (! (- x 1)))))
!
`,
`Defined (! x) to be (if (= x 0) 1 (* x (! (- x 1)))).
!: expected a function call, but there is no open parenthesis before this function
`
);

// Check expect tests

// add more interesting expressions to tests.

// test that definitions can go after check-expects referencing them.
tIO('(check-expect + +)',
  '+: expected a function call, but there is no open parenthesis before this function\n'
);

tIO(
`(define (! x) x)
(check-expect ! !)
`,
`Defined (! x) to be x.
!: expected a function call, but there is no open parenthesis before this function
`
);

// write a test with a definition in it.

t('(check-expect (define x 10) 10)' // does not parse

);

t('(check-expect -13 -13)', undefined, undefined,
 [
  checkExpectSameNum
 ],
 [
  MakeCheckSuccess()
 ],
 '🎉\n'
);

t('(check-expect "hello" "hello")', undefined, undefined,
 [
  checkExpectSameString
 ],
 [
  MakeCheckSuccess()
 ],
 '🎉\n'
);

t('(check-expect #true #t)', undefined, undefined,
 [
  checkExpectTrue
 ],
 [
  MakeCheckSuccess()
 ],
 '🎉\n'
);

t('(check-expect #f #f)', undefined, undefined,
 [
  checkExpectFalse
 ],
 [
  MakeCheckSuccess()
 ],
 '🎉\n'
);

t('(check-expect hello hello)', undefined, undefined,
 [
  checkExpectSameId
 ],
 [
  checkExpectedErrorSameId
 ],
'hello: this variable is not defined\n'
);

t('(check-expect -13 1)', undefined, undefined,
 [
  checkExpectDiffNum
 ],
 [
  checkFailureDiffNum
 ],
 'Actual value -13 differs from 1, the expected value.\n'
);

t('(check-expect hello goodbye)', undefined, undefined,
 [
  checkExpectDiffId
 ],
 [
  checkExpectedErrorDiffId
 ],
 'goodbye: this variable is not defined\n'
);

t('(check-expect "hello" "goodbye")', undefined, undefined,
 [
  checkExpectDiffString
 ],
 [
  checkFailureDiffString
 ],
 'Actual value "hello" differs from "goodbye", the expected value.\n'
);

t('(check-expect #t #f)', undefined, undefined,
 [
  checkExpectTrueIsNotFalse
 ],
 [
  checkFailureTrueIsNotFalse
 ],
 'Actual value #true differs from #false, the expected value.\n'
);

t('(check-expect -13 hello)', undefined, undefined,
 [
  checkExpectDiffType1
 ],
 [
  checkExpectedErrorDiffType1
 ],
 'hello: this variable is not defined\n'
);

t('(check-expect hello "hello")', undefined, undefined,
 [
  checkExpectDiffType2
 ],
 [
  checkFailureDiffType2
 ],
 'hello: this variable is not defined\n'
);

t('(check-expect #true "goodbye")', undefined, undefined,
 [
  checkExpectDiffType3
 ],
 [
  checkFailureDiffType3
 ],
 'Actual value #true differs from "goodbye", the expected value.\n'
);

// Some posn tests

tIO('(make-posn 2 3)', '(make-posn 2 3)');

tIO('(posn-x (make-posn 2 3))', '2');

tIO('(posn-x (make-posn 2 3))', '3');

tIO('(make-posn (+ 2 "hello") 2)',
 '+: expects a number as 2nd argument, given "hello"'
);

tIO(`(define p (make-posn (+ 2 "hello") 3))
(posn-y p)
`,
`+: expects a number as 2nd argument, given "hello"
p: this variable is not defined`
);


t('(define (f x) (if x))'); // This is parse error at 'if'. Fix the parser.

t('(define x 10) (define x 20)');

tIO('(posn-x (make-color 15 15 15 15))',
'posn-x cannot be applied to a make-color');

t('(cond ["#t" "hello"] [else "goodbye"])');


tIO(`(+ 2 3)
(+ 1)
(- 2 3)
(- 1)
(* 2 3)
(* 1)
(/ 2 3)
(/ 1)`,
`5
+: expects at least 2 arguments, but found only 1
-1
-1
6
*: expects at least 2 arguments, but found only 1
0.6666666666666666
/: expects at least 2 arguments, but found only 1
`);

tIO('(sin 1)',
`${ Math.sin(1) }
`
);

tIO('(sin 2 3)',
'sin: expects only 1 argument, but found 2\n'
);

tIO('(define f +)', 
`+: expected a function call, but there is no open parenthesis before this function
`
);

tIO('(- 0 0)', '0\n');

// cond tests

tIO(
`(cond [(string=? "hello" "goodbye") 1]
       [(string=? "hello" "hello") 2])`,
`2
`
);

tIO(`(cond [(string=? "hello" "goodbye") 1]
[(string=? "hello" "hellow") 2])`,
`cond: all question results were false
`)

// Identifier required at the function call position, so this should be a parsing error.
t('((+) 1 2)', undefined, undefined,
  [ExprErr('function call: expected a function after the open parenthesis, but found a part', read('(+)'))]
);

t('((λ (x) (+ 2 x)) 2)');

// How keywords are restricted from being used as var names in BSL.
tIO('(define (f λ) (+ λ λ))', 'define: expected a variable, but found a keyword');
tIO('(define (f if) (+ if if))', 'define: expected a variable, but found a keyword');


// What should happen when we replace an existing function with a new variable in scope then try to use that variable.
tIO(`
(define (format-month m f)
  (cond [(string=? "long" f) m]
        [(string=? "short" f) (substring m 0 3)]))

(define (format-november format-month) (format-month "November" "long"))`,
`Defined (format-month m f) to be (cond [(string=? "long" f) m] [(string=? "short" f) (substring m 0 3)])).
function call: expected a function after the open parenthesis, but found a variable
`);


tIO(`(define (f make-posn) make-posn)
(f 10)`,
`Defined (f make-posn) to be make-posn.
10
`);

/*****************************************************************************
 *                   Test cases for live editing behavior.                   *
 *                                                                           *
 * These test cases are intended to illustrate specific live editing         *
 * behavior and the intended output of the live editor with that behavior.   *
 *****************************************************************************/

/**
 * Our demo: (+ 2 3)
 */
t('', [], [], [], [], '\n');

t('(',
  [OP],
  [ReadErr('No Closing Paren', [OP])],
  [ReadErr('No Closing Paren', [OP])],
  [ReadErr('No Closing Paren', [OP])],
  'Read Error: No Closing Paren for (\n'
);

t('(+',
  [OP, Tok(TokenType.Identifier, '+')],
  [ReadErr('No Closing Paren', [OP, Tok(TokenType.Identifier, '+')])],
  [ReadErr('No Closing Paren', [OP, Tok(TokenType.Identifier, '+')])],
  [ReadErr('No Closing Paren', [OP, Tok(TokenType.Identifier, '+')])],
  'Read Error: No Closing Paren for (+\n'
);

// t('(+ ');

t('(+ 2',
  [OP, Tok(TokenType.Identifier, '+'), SPACE, Tok(TokenType.Number, '2')],
  [ReadErr('No Closing Paren', [OP, IdTok('+'), NumTok('2')])],
  [ReadErr('No Closing Paren', [OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '2')])],
  [ReadErr('No Closing Paren', [OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '2')])],
  'Read Error: No Closing Paren for (+ 2\n'
);

t('(+ 2 3',
  [OP, Tok(TokenType.Identifier, '+'), SPACE, Tok(TokenType.Number, '2'), SPACE, Tok(TokenType.Number, '3')],
  [ReadErr('No Closing Paren', [OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '2'), Tok(TokenType.Number, '3')])],
  [ReadErr('No Closing Paren', [OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '2'), Tok(TokenType.Number, '3')])],
  [ReadErr('No Closing Paren', [OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '2'), Tok(TokenType.Number, '3')])],
  'Read Error: No Closing Paren for (+ 2 3\n'
);


t('(+ 2 3)',
  [OP, Tok(TokenType.Identifier, '+'), SPACE, Tok(TokenType.Number, '2'), SPACE, Tok(TokenType.Number, '3'), CP],
  [ SExps(IdAtom('+'), NumAtom(2), NumAtom(3)) ],
  [ Call('+', [NumExpr(2), NumExpr(3)]) ],
  [ NFn(5) ],
  '5\n'
);

// // t('(+ 2 3');
// // t('(+ 2 ');


t('(+ 2 4',
  [OP, Tok(TokenType.Identifier, '+'), SPACE, Tok(TokenType.Number, '2'), SPACE, Tok(TokenType.Number, '4')],
  [ReadErr('No Closing Paren', [OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '2'), Tok(TokenType.Number, '4')])],
  [ReadErr('No Closing Paren', [OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '2'), Tok(TokenType.Number, '4')])],
  [ReadErr('No Closing Paren', [OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '2'), Tok(TokenType.Number, '4')])],
  'Read Error: No Closing Paren for (+ 2 4\n'
);

t('(+ 2 4)',
  [OP, Tok(TokenType.Identifier, '+'), SPACE, Tok(TokenType.Number, '2'), SPACE, Tok(TokenType.Number, '4'), CP],
  [ SExps(IdAtom('+'), NumAtom(2), NumAtom(4)) ],
  [ Call('+', [NumExpr(2), NumExpr(4)]) ],
  [ NFn(6) ],
  '6\n'
);

// // t('(+ 2 4) ');

t('(+ 2 4) (+',
  [OP, Tok(TokenType.Identifier, '+'), SPACE, Tok(TokenType.Number, '2'), SPACE, Tok(TokenType.Number, '4'), CP, SPACE, OP, Tok(TokenType.Identifier, '+')],
  [ SExps(IdAtom('+'), NumAtom(2), NumAtom(4)), ReadErr('No Closing Paren', [OP, Tok(TokenType.Identifier, '+')])],
  [ Call('+', [NumExpr(2), NumExpr(4)]), ReadErr('No Closing Paren', [OP, Tok(TokenType.Identifier, '+')]) ],
  [ NFn(6), ReadErr('No Closing Paren', [OP, Tok(TokenType.Identifier, '+')]) ],
  '6\n'
  + 'Read Error: No Closing Paren for (+\n'
);

// // t('(+ 2 4) (+ ');

t('(+ 2 4) (+ 4',
  [OP, Tok(TokenType.Identifier, '+'), SPACE, Tok(TokenType.Number, '2'), SPACE, Tok(TokenType.Number, '4'), CP, SPACE, OP, Tok(TokenType.Identifier, '+'), SPACE, Tok(TokenType.Number, '4')],
  [ SExps(IdAtom('+'), NumAtom(2), NumAtom(4)), ReadErr('No Closing Paren', [OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '4')])],
  [ Call('+', [NumExpr(2), NumExpr(4)]), ReadErr('No Closing Paren', [OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '4')]) ],
  [ NFn(6), ReadErr('No Closing Paren', [OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '4')]) ],
  '6\n'
  + 'Read Error: No Closing Paren for (+ 4\n'
);

// t('(+ 2 4) (+ 4 ');

t('(+ 2 4) (+ 4 7',
  [OP, Tok(TokenType.Identifier, '+'), SPACE, Tok(TokenType.Number, '2'), SPACE, Tok(TokenType.Number, '4'), CP, SPACE, OP, Tok(TokenType.Identifier, '+'), SPACE, Tok(TokenType.Number, '4'), SPACE, Tok(TokenType.Number, '7')],
  [ SExps(IdAtom('+'), NumAtom(2), NumAtom(4)), ReadErr('No Closing Paren', [OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '4'), Tok(TokenType.Number, '7')])],
  [ Call('+', [NumExpr(2), NumExpr(4)]), ReadErr('No Closing Paren', [OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '4'), Tok(TokenType.Number, '7')]) ],
  [ NFn(6), ReadErr('No Closing Paren', [OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '4'), Tok(TokenType.Number, '7')]) ],
  '6\n'
  + 'Read Error: No Closing Paren for (+ 4 7\n'
);

t('(+ 2 4) (+ 4 7)',
  [OP, Tok(TokenType.Identifier, '+'), SPACE, Tok(TokenType.Number, '2'), SPACE, Tok(TokenType.Number, '4'), CP, SPACE, OP, Tok(TokenType.Identifier, '+'), SPACE, Tok(TokenType.Number, '4'), SPACE, Tok(TokenType.Number, '7'), CP],
  [ SExps(IdAtom('+'), NumAtom(2), NumAtom(4)), SExps(IdAtom('+'), NumAtom(4), NumAtom(7))],
  [ Call('+', [NumExpr(2), NumExpr(4)]), Call('+', [NumExpr(4), NumExpr(7)]) ],
  [ NFn(6), NFn(11) ],
  '6\n' +
  '11\n'
);



/** 
 * Our demo: Someone tries to define fib.
 */

// ''
// '('
// ...
t('(define (fib n)\n' +
'  (if (= fib 0)\n' + 
'      (n 1)\n' + 
'      (else if (= fib 1)\n' +
'            (n 1)\n' +
'            (else (n (fib n - 2) + (fib n - 1))))');

// ...
// missing parens
t('(define (fib n)\n' +
'  (if (= fib 0)\n' + 
'      (n 1)\n' + 
'      (else if (= fib 1)\n' +
'            (n 1)\n' +
'            (else (n (fib n - 2) + (fib n - 1))))))');

// ...
// The student is reminded of prefix notation

t('(define (fib n)\n' +
'  (if (= fib 0)\n' + 
'      (n 1)\n' + 
'      (else if (= fib 1)\n' +
'            (n 1)\n' +
'            (else (n (fib (- n 2) + (fib (- n 1))))))');

// ...
// The student is told fib cant equal 0

t('(define (fib n)\n' +
'  (if (= n 0)\n' + 
'      (n 1)\n' + 
'      (else if (= fib 1)\n' +
'            (n 1)\n' +
'            (else (n (fib (- n 2) + (fib (- n 1))))))');

// ...
// Student is told 'you can't call n'

t('(define (fib n)\n' +
'  (if (= n 0)\n' + 
'      n 1\n' + 
'      (else if (= fib 1)\n' +
'            n 1\n' +
'            (else n (fib (- n 2) + (fib (- n 1)))))');

// ...
// Student is told something like 'now get rid of those n'
t('(define (fib)\n' +
'  (if (= 0)\n' + 
'      1\n' + 
'      (else if (= fib 1)\n' +
'            1\n' +
'            (else (fib (- 2) + (fib (- 1)))))');

// ...
// 'No, not all the n.' 

t('(define (fib n)\n' +
'  (if (= n 0)\n' + 
'      1\n' + 
'      (else if (= fib 1)\n' +
'            1\n' +
'            (else (fib (- n 2) + (fib (- n 1)))))');

// ...
// Prefix notation again.

t('(define (fib n)\n' +
'  (if (= n 0)\n' + 
'      1\n' + 
'      (else if (= fib 1)\n' +
'            1\n' +
'            (else (+ (fib (- n 2)) (fib (- n 1)))))))');

// ...
// Else isn't a thing here.

t('(define (fib n)\n' +
'  (if (= n 0)\n' + 
'      1\n' + 
'      (if (= fib 1)\n' +
'           1\n' +
'           (+ (fib (- n 2)) (fib (- n 1))))))');

 /**
 * Behavior:
 * Someone uses an editor that inserts matching parens automatically.
 * when they write (fib 10), it goes from () to (fib 10) one character at a time.
 */

/**
 * Behavior:
 * A user comments out a piece of code.
 */
