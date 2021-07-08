/**
 * @fileoverview The main testing file for the project.
 * currentWorkingOnTheseTests is the function where the test 
 * suites are run. The code is formatted here using few indentations because
 * many tests are written with template literals (template strings),
 * Feel free to change the indentation.
 * The tests are structured into test suite functions which are intended
 * to group related tests (by feature or concept). There is a
 * nonCurrentWorkingOnTheseTests function which you can use to place test
 * suites which may currently fail but are unrelated to your work.
 * 
 * @author Alice Russell
 */

'use strict';

import { MakeCheckExpect, MakeCheckSuccess, MakeIf } from '../constructors';
import { t, tIO } from './test-harness';

import {
  Tok,
  NumTok, NumAtom, MakeNumberExpr, MakeAtomic,
  StringTok, StringAtom, MakeStringExpr,
  IdTok, IdAtom, MakeVariableUsageExpr,
  BooleanTok, BooleanAtom, MakeBooleanExpr,
  TokErr, ReadErr, TopLevelErr, ValErr,
  CP, OP, SPACE, OSP, CSP, OBP, CBP, NL,
  SExps, MakeVariableDefinition, MakeFunctionDefinition,
  MakeCall, CommentTok
} from '../constructors';

import { TokenType } from '../types';

import { 
  checkExpectSameNum, checkExpectSameId, checkExpectSameString, 
  checkExpectTrue, checkExpectFalse, checkExpectDiffNum, 
  checkExpectDiffId, checkExpectDiffString,
  checkExpectTrueIsNotFalse, checkExpectDiffType1, 
  checkExpectDiffType2, checkExpectDiffType3, checkExpectedErrorDiffId,
  checkExpectedErrorDiffType1, checkExpectedErrorSameId, checkFailureDiffNum,
  checkFailureDiffString, checkFailureDiffType2,
  checkFailureDiffType3, checkFailureTrueIsNotFalse,
  and1, and2, and3, and4, and5, or1, or2, or3, or4, or5, posnTemplateDefn
} from './examples';

import { tokenize } from '../tokenize';
import { read } from '../read';

import { a2Tests } from './assignment2.spec';
import { a3Tests } from './assignment3.spec';
import { a4Tests } from './assignment4.spec';

const errorTests = (): void => {

const tokenizerErrorTests = (): void => {
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
    TopLevelErr('define: expected only one expression after the variable name bool, but found 1 extra part',
    [
      SExps(
        IdAtom('define'),
        IdAtom('bool'),
        TokErr('#'),
        IdAtom('t123')
      )
    ])
  ],
);

}

tokenizerErrorTests();

const readerErrorTests = (): void => {

tIO(`([)]]]]]]]]]`,
`Read Error: No Valid SExp for ([)]]]]]]]]]
`);

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

t('(\n'
  + '1',

  [ OP, NL, NumTok('1') ],
  [ ReadErr('No Closing Paren', [ OP, NumTok('1') ]) ],
  [ ReadErr('No Closing Paren', [ OP, NumTok('1') ]) ],
  [ ReadErr('No Closing Paren', [ OP, NumTok('1') ]) ],
  'Read Error: No Closing Paren for (1\n'
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

/**
 * @knowntestfail The reader should operate as described below
 * in option 2.
 * 
 *    1st option. Reader separates into 3 objects. ( [) 1
 * -> 2nd option. Reader separates into 2 objects. ([) 1 <- We are currently using this.
 *    3rd option. Reader separates into 3 objects, ignoring incorrect closing paren. ( [ 1
 */
tIO(`
([)
1`,
`Read Error: No Valid SExp for ([)
1
`);

/**
* @knowntestfail see above test failure
*/
tIO(`
([))
1`,

`Read Error: No Valid SExp for ([)
Read Error: No Open Paren for )
1`
);

/**
* @knowntestfail see above test failures
*/
tIO(`(]))
1`,
`Read Error: No Valid SExp for (])
Read Error: No Open Paren for )
1`);

/**
* @knowntestfail see above test failures
*/
tIO(`
([[[][][][][][])
(define x 10)
x`,

`Read Error: No Valid SExp for ([[[][][][][][])
Defined x to be 10.
10
`);

/**
 * @knowntestfail '.' should not pass the reader as valid
 */
tIO(`(define (f .) .)`,
`read-syntax: illegal use of \`.\`
`);

/**
 * @knowntestfail '#)' should not pass the reader as valid
 */
tIO(`((#) 2 3)`,
`read-syntax: bad syntax \`#)\`
`);

}

readerErrorTests();

const parserErrorTests = (): void => {

tIO('(pi)',
`function call: expected a function after the open parenthesis, but found a variable
`);

tIO('(3)',
`function call: expected a function after the open parenthesis, but found a number
`);


t('()',
  [ OP, CP ],
  [ SExps() ],
  [ TopLevelErr('function call: expected a function after the open parenthesis, but nothing\'s there', []) ],
  [ TopLevelErr('function call: expected a function after the open parenthesis, but nothing\'s there', []) ],
`function call: expected a function after the open parenthesis, but nothing\'s there
`);

// Identifier required at the function call position, so this should be a parsing error.
t('((+) 1 2)', undefined, undefined,
  [
    TopLevelErr('function call: expected a function after the open parenthesis, but found something else', read('(+) 1 2'))
  ]
);

}

parserErrorTests();

const evaluatorErrorTests = (): void => {

tIO(`(+ + *)`,
`+: expected a function call, but there is no open parenthesis before this function
`);
  
/**
 * @knowntestfail redefining the name check-expect
 * somewhere in the evaluator, which is disallowed
 */
tIO(`(define-struct check [expect to be])`,
`check-expect: this name was defined previously and cannot be re-defined
`);

/**
 * @knowntestfail redefining the name check-expect
 * somewhere in the evaluator, which is disallowed
 */
tIO(`(define-struct check-expect [to be])`,
`check-expect: this name was defined previously and cannot be re-defined
`);

t('hello',
  [ IdTok('hello') ],
  [ IdAtom('hello') ],
  [ MakeVariableUsageExpr('hello') ],
  [ ValErr('this variable is not defined', MakeVariableUsageExpr('hello') )],
  'hello: this variable is not defined\n'
);

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


tIO('(check-expect + +)',
  '+: expected a function call, but there is no open parenthesis before this function\n'
);

tIO(
`(define (! x) x)
(check-expect ! !)
`,
`Defined (! x) to be x.
!: expected a function call, but there is no open parenthesis before this function
`);

tIO(`(define (hi bye) (+))
(pi)`,
`Defined (hi bye) to be (+).
function call: expected a function after the open parenthesis, but found a variable
`);

}

evaluatorErrorTests();

}

const demoTests = (): void => {
  
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
   [ MakeCall('+', [MakeNumberExpr(2), MakeNumberExpr(3)]) ],
   [ MakeAtomic(5) ],
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
   [ MakeCall('+', [MakeNumberExpr(2), MakeNumberExpr(4)]) ],
   [ MakeAtomic(6) ],
   '6\n'
 );
 
 // // t('(+ 2 4) ');
 
 t('(+ 2 4) (+',
   [OP, Tok(TokenType.Identifier, '+'), SPACE, Tok(TokenType.Number, '2'), SPACE, Tok(TokenType.Number, '4'), CP, SPACE, OP, Tok(TokenType.Identifier, '+')],
   [ SExps(IdAtom('+'), NumAtom(2), NumAtom(4)), ReadErr('No Closing Paren', [OP, Tok(TokenType.Identifier, '+')])],
   [ MakeCall('+', [MakeNumberExpr(2), MakeNumberExpr(4)]), ReadErr('No Closing Paren', [OP, Tok(TokenType.Identifier, '+')]) ],
   [ MakeAtomic(6), ReadErr('No Closing Paren', [OP, Tok(TokenType.Identifier, '+')]) ],
   '6\n'
   + 'Read Error: No Closing Paren for (+\n'
 );
 
 // // t('(+ 2 4) (+ ');
 
 t('(+ 2 4) (+ 4',
   [OP, Tok(TokenType.Identifier, '+'), SPACE, Tok(TokenType.Number, '2'), SPACE, Tok(TokenType.Number, '4'), CP, SPACE, OP, Tok(TokenType.Identifier, '+'), SPACE, Tok(TokenType.Number, '4')],
   [ SExps(IdAtom('+'), NumAtom(2), NumAtom(4)), ReadErr('No Closing Paren', [OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '4')])],
   [ MakeCall('+', [MakeNumberExpr(2), MakeNumberExpr(4)]), ReadErr('No Closing Paren', [OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '4')]) ],
   [ MakeAtomic(6), ReadErr('No Closing Paren', [OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '4')]) ],
   '6\n'
   + 'Read Error: No Closing Paren for (+ 4\n'
 );
 
 // t('(+ 2 4) (+ 4 ');
 
 t('(+ 2 4) (+ 4 7',
   [OP, Tok(TokenType.Identifier, '+'), SPACE, Tok(TokenType.Number, '2'), SPACE, Tok(TokenType.Number, '4'), CP, SPACE, OP, Tok(TokenType.Identifier, '+'), SPACE, Tok(TokenType.Number, '4'), SPACE, Tok(TokenType.Number, '7')],
   [ SExps(IdAtom('+'), NumAtom(2), NumAtom(4)), ReadErr('No Closing Paren', [OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '4'), Tok(TokenType.Number, '7')])],
   [ MakeCall('+', [MakeNumberExpr(2), MakeNumberExpr(4)]), ReadErr('No Closing Paren', [OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '4'), Tok(TokenType.Number, '7')]) ],
   [ MakeAtomic(6), ReadErr('No Closing Paren', [OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '4'), Tok(TokenType.Number, '7')]) ],
   '6\n'
   + 'Read Error: No Closing Paren for (+ 4 7\n'
 );
 
 t('(+ 2 4) (+ 4 7)',
   [OP, Tok(TokenType.Identifier, '+'), SPACE, Tok(TokenType.Number, '2'), SPACE, Tok(TokenType.Number, '4'), CP, SPACE, OP, Tok(TokenType.Identifier, '+'), SPACE, Tok(TokenType.Number, '4'), SPACE, Tok(TokenType.Number, '7'), CP],
   [ SExps(IdAtom('+'), NumAtom(2), NumAtom(4)), SExps(IdAtom('+'), NumAtom(4), NumAtom(7))],
   [ MakeCall('+', [MakeNumberExpr(2), MakeNumberExpr(4)]), MakeCall('+', [MakeNumberExpr(4), MakeNumberExpr(7)]) ],
   [ MakeAtomic(6), MakeAtomic(11) ],
   '6\n' +
   '11\n'
 );

}

const parserStaticCheckTests = (): void => {

/**
 * @knowntestfail 
 */
// What should happen when we replace an existing function with a new variable in scope then try to use that variable.
tIO(`
(define (format-month m f)
  (cond [(string=? "long" f) m]
        [(string=? "short" f) (substring m 0 3)]))

(define (format-november format-month) (format-month "November" "long"))`,
`Defined (format-month m f) to be (cond [(string=? "long" f) m] [(string=? "short" f) (substring m 0 3)]).
function call: expected a function after the open parenthesis, but found a variable
`);

/**
 * @knowntestfail
 */
tIO(
`(and false +)

(define (f x) x)
(and false f)

(and false make-posn)
(and false posn-x)
(and false posn?)
(and "hello" true)`,
`+: expected a function call, but there is no open parenthesis before this function
Defined (f x) to be x.
f: expected a function call, but there is no open parenthesis before this function
make-posn: expected a function call, but there is no open parenthesis before this function
posn-x: expected a function call, but there is no open parenthesis before this function
posn?: expected a function call, but there is no open parenthesis before this function
"hello": and: question result is not true or false
`);

/**
 * @knowntestfail
 */
tIO('(define (hi bye) rye)',
`rye: this variable is not defined
`);
 
/**
 * @knowntestfail
 */
tIO('(define (hi bye) (f 2 2))',
`f: this function is not defined
`);

/**
 * @knowntestfail
 */
tIO(`(define (apply2 f x y) (f x y)) (apply2 + 2 3)`,
`function call: expected a function after the open parenthesis, but found a variable
apply2: this function is not defined
`);

/**
 * @knowntestfail
 */
tIO(`("string")
(id)
(#t)
((+ 2 2) 2 2)`,
`function call: expected a function after the open parenthesis, but found a string
id: this function is not defined
function call: expected a function after the open parenthesis, but found a boolean
function call: expected a function after the open parenthesis, but found something else
`);
}

const atomicValuesTests = (): void => {

t('', [], [], [], [], '\n');

t('123',
  [ NumTok('123') ],
  [ NumAtom(123) ],
  [ MakeNumberExpr(123) ],
  [ MakeAtomic(123) ], 
  '123\n'
);

t('-13',
  [ NumTok('-13') ],
  [ NumAtom(-13) ],
  [ MakeNumberExpr(-13) ],
  [ MakeAtomic(-13) ], 
  '-13\n'
);

t('-0',
  [ NumTok('-0') ],
  [ NumAtom(-0) ],
  [ MakeNumberExpr(-0) ],
  [ MakeAtomic(-0) ], 
  '0\n'
);

t('"hello"',
  [ StringTok('hello') ],
  [ StringAtom('hello') ],
  [ MakeStringExpr('hello')],
  [ MakeAtomic('hello') ],
  '"hello"\n'
);

t('#true',
  [ BooleanTok('#true') ],
  [ BooleanAtom('#true') ],
  [ MakeBooleanExpr(true) ],
  [ MakeAtomic(true)],
  '#true\n'
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

}

const readerOnlyTests = (): void => {

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

t(
  `;(define x 10)`,
  [ CommentTok(';(define x 10)') ],
  []
);

}

const builtinEnvironmentTests = (): void => {

const builtinStructTests = (): void => {

tIO('(make-posn 2 3)', '(make-posn 2 3)\n');

tIO('(posn-x (make-posn 2 3))', '2\n');

tIO('(posn-y (make-posn 2 3))', '3\n');

tIO('(make-posn (+ 2 "hello") 2)',
`+: expects a number as 2nd argument, given "hello"
`
);

tIO(`(posn "x" 10)`,
`posn: expected a function after the open parenthesis, but found a structure type (do you mean make-posn)
`);

/**
 * @knowntestfail Fixing this test requires making error reporting into a side channel.
 */
tIO(`(define p (make-posn (+ 2 "hello") 3))
(posn-y p)
`,
`+: expects a number as 2nd argument, given "hello"
p: this variable is not defined
`);

tIO('(posn-x (make-color 15 15 15))',
`posn-x: expects a posn, given a color
`);

tIO(`(posn? (make-posn 2 2))`,
`#true
`);

tIO(`(posn? 10)`,
`#false
`);

}

builtinStructTests();

const arithmeticTests = (): void => {

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


tIO('(- 0 0)', '0\n');

}

arithmeticTests();

// Note: This is not how DrRacket outputs number->string arity mismatch
// DrRacket output:
// number->string: arity mismatch;
//  the expected number of arguments does not match the given number
//   expected: 1 to 2
//   given: 0
tIO(`(number->string)`,
`number->string: expects at least 1 argument, but found only 0
`);

tIO(`(number->string x)`,
`x: this variable is not defined
`);

tIO(`(number->string 1)`,
`"1"
`);

// Note: This is not how DrRacket outputs number->string arity mismatch
// DrRacket output:
// number->string: expects (or/c 2 8 10 16), (or/c 2 8 10 16), (or/c 2 8 10 16), or (or/c 2 8 10 16) as 2nd argument, given "hello"
tIO(`(number->string 1 "hello")`,
`number->string: expects only 1 argument, but found 2
`);

// Note: This is not how DrRacket outputs number->string arity mismatch
// DrRacket output:
// "1"
tIO(`(number->string 1 2)`,
`number->string: expects only 1 argument, but found 2
`);

tIO('(sin 1)',
`${ Math.sin(1) }
`);

tIO('(sin 2 3)',
'sin: expects only 1 argument, but found 2\n'
);

tIO(`(modulo 5 2)
(modulo -5 2)
(modulo 0 1)
(modulo 0 0)
(modulo 2 -7)
(modulo 2 7)
(modulo 135 17)`,
`1
1
0
modulo: undefined for 0
-5
2
16
`);

tIO(`(abs -1 -2)
(abs -13)
(abs 0)
(abs 100)`,
`abs: expects only 1 argument, but found 2
13
0
100
`);

tIO(`(add1 1)`,
`2
`);

tIO(`(string-append "" "hello " "world" "")`,
`"hello world"
`
);

tIO(`(string=? "January" "January" "January")
(string=? "January" "January")
(string=? "January" "February" "January")
(string=? "January" "February")
`,
`#true
#true
#false
#false
`);

tIO('true false',
`#true
#false
`);

tIO('(floor 1.55555)',
`1
`);

t('(+ define 1)', undefined, undefined, 
  [
    TopLevelErr(
      'define: expected an open parenthesis before define, but found none',
      [IdAtom('define')]
    )
  ]
);

tIO(`(not true)
(not false)
(not true true)
(not "One")`,
`#false
#true
not: expects only 1 argument, but found 2
not: expected either #true or #false; given something else
`);

tIO(`(substring "hello world" 2)
(substring "hello world" 2 4)
(substring "hello" 5 5)
(substring "hello" 25)
(substring "hello" 5 25)`,
`"llo world"
"ll"
""
substring: starting index is out of range
substring: ending index is out of range
`);

tIO(`
(+ 2 2 2 2 2 2 2 2 2 2 2
  22 2 2 2 2 2 2 2 2 2 2 22 2 2 2 2 2 2 2 2 2
  2 222 2 2 2 2 2 2 2 2 2 2 22
  2 2 2 2 2 2 2 2 2
  2 22 2 2 2 2 2 2 2 2 2 2 22 2 2 2 2 2 2
  2 2 2 2 22 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2
  2 2 2 22 2 "hello" 1
)`,
`+: expects a number as 101st argument, given "hello"
`);

}

const keywordTests = (): void => {

const definitionTests = (): void => {


// f used before its definition
// must know its got a defn but that it hasnt been 'filled in'
tIO('(define x (f 3)) (define (f y) y)',
`(f 3): Expression defined later in program
Defined (f y) to be y.
`);

tIO('(define x (+ (+) 3))',
`+: expects at least 2 arguments, but found only 0
`);

tIO(`(define (f x) (if x))`,
`if: expected a question and two answers, but found only 1 part
`);

t('(define x 10) (define x 20)');

tIO('(define x 10) x',
`Defined x to be 10.
10
`);

t(
  '(define x 10)',
  [ OP, IdTok('define'), SPACE, IdTok('x'), SPACE, NumTok('10'), CP ],
  [ 
    SExps(IdAtom('define'), IdAtom('x'), NumAtom(10))
  ]
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
    MakeFunctionDefinition(
      'fact',
      ['n'],
      MakeIf(
        MakeCall(
          '=',
          [ MakeVariableUsageExpr('n'), MakeNumberExpr(0) ]
        ),
        MakeNumberExpr(1),
        MakeCall(
          '*',
          [
            MakeVariableUsageExpr('n'),
            MakeCall(
              'fact',
              [ MakeCall('-', [MakeVariableUsageExpr('n'), MakeNumberExpr(1)]) ]
            )
          ]
        )
      )
    )
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

t('(define (mn x y) (if (< x y) x y))',
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

tIO('(define (f x) (+ x x))',
'Defined (f x) to be (+ x x).\n'
);

tIO('(define (f x y) (+ x y))',
'Defined (f x y) to be (+ x y).\n'
);

// How keywords are restricted from being used as var names in BSL.
tIO('(define (f λ) (+ λ λ))', 'define: expected a variable, but found a keyword\n');
tIO('(define (f if) (+ if if))', 'define: expected a variable, but found a keyword\n');


tIO(`(define (f make-posn) make-posn)
(f 10)`,
`Defined (f make-posn) to be make-posn.
10
`);

tIO('(define (x define-struct y) y)',
`define: expected a variable, but found a keyword
`);

t('(define define 1)', undefined, undefined, 
  [
    TopLevelErr(
      'define: expected a variable name, or a function name and its variables (in parentheses), but found a keyword',
      read('(define define 1)')
    )
  ]
);

tIO(`(define (hi bye) ((+ 2 2) 2 2))`,
`function call: expected a function after the open parenthesis, but found something else
`);

tIO(`(define (define-struct x y) x)`,
`define: expected the name of the function, but found a keyword
`);

tIO('(define f +)', 
`+: expected a function call, but there is no open parenthesis before this function
`);

tIO(`(define f (+ sin cos))`,
`sin: expected a function call, but there is no open parenthesis before this function
`);

tIO(`(define y x) 
(define x 3)`,
`x: this variable is not defined
Defined x to be 3.
`);

}

definitionTests();

const defineStructTests = (): void => {

tIO(`define-struct`,
`define-struct: expected an open parenthesis before define-struct, but found none
`);

tIO(`(define-struct)`,
`define-struct: expected the structure name after define-struct, but nothing's there
`);

tIO(`(define-struct "posn" [x y])`,
`define-struct: expected the structure name after define-struct, but found a string
`);

tIO(`(define-struct 1 [x y])`,
`define-struct: expected the structure name after define-struct, but found a number
`);

tIO(`(define-struct #t [x y])`,
`define-struct: expected the structure name after define-struct, but found a boolean
`);

tIO(`(define-struct (f x) [x y])`,
`define-struct: expected the structure name after define-struct, but found something else
`);

tIO(`(define-struct posn)`,
`define-struct: expected at least one field name (in parentheses) after the structure name, but nothing's there
`);

tIO(`(define-struct posn 1 2 3)`,
`define-struct: expected at least one field name (in parentheses) after the structure name, but found a number
`);

tIO(`(define-struct posn (x y) 2 3)`,
`define-struct: expected nothing after the field names, but found 2 extra parts
`);

tIO(`(define-struct posn "x")`,
`define-struct: expected at least one field name (in parentheses) after the structure name, but found a string
`);

tIO(`(define-struct posn 1)`,
`define-struct: expected at least one field name (in parentheses) after the structure name, but found a number
`);

tIO(`(define-struct posn #t)`,
`define-struct: expected at least one field name (in parentheses) after the structure name, but found a boolean
`);

tIO(`(define-struct posn (x 1) 1)`,
`define-struct: expected a field name, but found a number
`);

tIO(`(define-struct posn (x (x y)))`,
`define-struct: expected a field name, but found something else
`);


tIO(`(define-struct point (x y))
(define-struct point (x y))`,
`Defined point to be a structure type named point.
point: this name was defined previously and cannot be re-defined
`);

tIO(`(define-struct point (x y))
(define point-x 1)`,
`Defined point to be a structure type named point.
point-x: this name was defined previously and cannot be re-defined
`);

tIO(`(define-struct point (x y))
(define (point-x y) y)`,
`Defined point to be a structure type named point.
point-x: this name was defined previously and cannot be re-defined
`);

tIO(`(define point-x 1)
(define-struct point (x y))`,
`Defined point-x to be 1.
point-x: this name was defined previously and cannot be re-defined
`);

tIO(`(define (point-x y) y)
(define-struct point (x y))`,
`Defined (point-x y) to be y.
point-x: this name was defined previously and cannot be re-defined
`);

tIO(`(define point-x 10)`,
`Defined point-x to be 10.
`);

tIO(`(define-struct point [x y])
(define x 10)
(point x (make-point 10 10))`,
`Defined point to be a structure type named point.
Defined x to be 10.
point: expected a function after the open parenthesis, but found a structure type (do you mean make-point)
`);

}

defineStructTests();

const checkExpectTests = (): void => {

tIO('(check-expect (define x 10) 10)',
`define: found a definition that is not at the top level
`);

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
    MakeVariableDefinition('x', MakeNumberExpr(10)),
    MakeCheckExpect(MakeVariableUsageExpr('x'), MakeNumberExpr(10))
  ]
);

tIO(`(cond [(string=? "hello" "goodbye") 1]
[(string=? "hello" "hellow") 2])`,
`(cond [(string=? "hello" "goodbye") 1] [(string=? "hello" "hellow") 2]): all question results were false
`);

tIO(`(define (! n) (cond [false 2] [else 4]))`,
`Defined (! n) to be (cond [false 2] [else 4]).
`);

}

checkExpectTests();

const andOrTests = (): void => {

t(`(and true)
(and true true)
(and true true true)
(and true false true)
(and true false "hello")
(and true "hello" false)`,
  undefined,
  undefined,
  [
    TopLevelErr('and: expects at least 2 arguments, but found only 1', read('(and true)')),
    and1, and2, and3, and4, and5
  ],
  undefined,
`and: expects at least 2 arguments, but found only 1
#true
#true
#false
#false
"hello": and: question result is not true or false
`);

t(`(or false)
(or false false)
(or false true true)
(or false false true)
(or false true "hello")
(or false "hello" true)`,
  undefined,
  undefined,
  [
    TopLevelErr('or: expects at least 2 arguments, but found only 1', read('(or false)')),
    or1, or2, or3, or4, or5
  ],
  undefined,
`or: expects at least 2 arguments, but found only 1
#false
#true
#true
#true
"hello": or: question result is not true or false
`);

tIO(
`(and false (make-posn 2 2))`,
`#false
`);

}

andOrTests();

// Note: This is an intentional difference from how DrRacket BSL behaves.
tIO(`(define (f check-expect) check-expect)
(define (f check-error) check-error)
(define (f check-within) check-within)
(define (f check-random) check-random)
(define (f check-satisfied) check-satisfied)
(define (f check-member-of) check-member-of)
(define (f check-range) check-range)`,
`define: expected a variable, but found a keyword
define: expected a variable, but found a keyword
define: expected a variable, but found a keyword
define: expected a variable, but found a keyword
define: expected a variable, but found a keyword
define: expected a variable, but found a keyword
define: expected a variable, but found a keyword
`);

tIO(`(cond [(< 2 3) +] [else -])`,
`+: expected a function call, but there is no open parenthesis before this function
`);

tIO(
`(cond [(string=? "hello" "goodbye") 1]
        [(string=? "hello" "hello") 2])`,
`2
`
);

tIO(`else`,
`else: not allowed here, because this is not a question in a clause
`);

tIO(`(else 10)`,
`else: not allowed here, because this is not a question in a clause
`);

tIO(
`
(cond [true 1]
      [else 0])
`,
`1
`);

tIO(
`
(cond [false 1]
      [else 0])
`,
`0
`);

t(`
(define (process-posn p) 
  (... (posn-x p) ... (posn-y p) ...))
`,
  undefined,
  undefined,
  [ posnTemplateDefn ],
  undefined,
`Defined (process-posn p) to be (... (posn-x p) ... (posn-y p) ...).
`);

tIO(`
(define (process-posn p) 
  (... (posn-x p) ... (posn-y p) ...))
(process-posn (make-posn 1 2))
`,
`Defined (process-posn p) to be (... (posn-x p) ... (posn-y p) ...).
...: expected a finished expression, but found a template
`);

tIO(`
(define (f x)
  (cond [x 1]
        [... 2]))
(f true)
(f false)`,
`Defined (f x) to be (cond [x 1] [... 2]).
1
...: expected a finished expression, but found a template
`);

/** @knowntestfail error message mismatch */
tIO('(cond ["#t" "hello"] [else "goodbye"])',
`cond: question result is not true or false
`);

tIO('((λ (x) (+ 2 x)) 2)',
`function call: expected a function after the open parenthesis, but found something else
`);

}

/**
 * A place to put the test groupings we are currently working on.
 * These are currently run always by default.
 */
const currentWorkingOnTheseTests = (): void => {
  errorTests();
  readerOnlyTests();

  builtinEnvironmentTests();
  keywordTests();
  atomicValuesTests();

  a2Tests();
  a3Tests();
  a4Tests();
  demoTests();
}

/**
 * A place to put the test groupings we are not currently working on.
 * These are currently run never by default.
 */
const nonCurrentWorkingOnTheseTests = (): void => {
  parserStaticCheckTests();
}

currentWorkingOnTheseTests();