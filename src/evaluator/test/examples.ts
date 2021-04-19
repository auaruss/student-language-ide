'use strict';

/**
 * @fileoverview Holds many useful examples of our types in types.ts primarily for the purposes of testing
 * 
 * @author Alice Russell
 * 
 * Naming scheme:
 * 
 * All values are named <value>Val
 * All vindings are named <name><boundValue>Bind
 */


 import { 
  NumTok, IdTok, StringTok, BooleanTok,
  NumAtom, IdAtom, StringAtom, BooleanAtom,
  MakeNumberExpr, MakeVariableUsageExpr, MakeStringExpr, MakeBooleanExpr, MakeCall,
  MakeAtomic, Bind, MakeCheckExpect, ValErr, MakeCheckExpectedError, MakeCheckFailure, MakeIf, MakeFunctionDefinition, MakeCond
} from './../constructors';

// ----------------------------------------------------------------------------
// | Token examples                                                           |
// ----------------------------------------------------------------------------

export const negThirteenTok = NumTok('-13');
export const negOneTok = NumTok('-1');
export const negZeroTok = NumTok('-0');
export const zeroTok = NumTok('0');
export const oneTok = NumTok('1');
export const thirteenTok = NumTok('13');

export const helloIdTok = IdTok('hello');
export const goodbyeIdTok = IdTok('goodbye');

export const helloStringTok = StringTok('hello');
export const goodbyeStringTok = StringTok('goodbye');

export const trueTok = BooleanTok('#t');
export const falseTok = BooleanTok('#f');

// ----------------------------------------------------------------------------
// | Token Error examples                                                     |
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
// | SExp examples                                                            |
// ----------------------------------------------------------------------------

export const negThirteenAtom = NumAtom(-13);
export const negOneAtom = NumAtom(-1);
export const negZeroAtom = NumAtom(-0);
export const zeroAtom = NumAtom(0);
export const oneAtom = NumAtom(1);
export const thirteenAtom = NumAtom(13);

export const helloIdAtom = IdAtom('hello');
export const goodbyeIdAtom = IdAtom('goodbye');

export const helloStringAtom = StringAtom('hello');
export const goodbyeStringAtom = StringAtom('goodbye');

export const trueAtom = BooleanAtom('#t');
export const falseAtom = BooleanAtom('#f');

// ----------------------------------------------------------------------------
// | SExp Error examples                                                      |
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
// | Expr examples                                                            |
// ----------------------------------------------------------------------------

export const negThirteenExpr = MakeNumberExpr(-13);
export const negOneExpr = MakeNumberExpr(-1);
export const negZeroExpr = MakeNumberExpr(-0);
export const zeroExpr = MakeNumberExpr(0);
export const oneExpr = MakeNumberExpr(1);
export const thirteenExpr = MakeNumberExpr(13);

export const helloIdExpr = MakeVariableUsageExpr('hello');
export const goodbyeIdExpr = MakeVariableUsageExpr('goodbye');

export const helloStringExpr = MakeStringExpr('hello');
export const goodbyeStringExpr = MakeStringExpr('goodbye');

export const trueExpr = MakeBooleanExpr(true);
export const falseExpr = MakeBooleanExpr(false);

// ----------------------------------------------------------------------------
// | If/Cond examples                                                         |
// ----------------------------------------------------------------------------

export const basicIf1 = MakeIf(trueExpr, helloStringExpr, goodbyeStringExpr);
export const basicIf2 = MakeIf(falseExpr, helloStringExpr, goodbyeStringExpr);
export const factorialIf
  = MakeIf(
      MakeCall('=', [MakeVariableUsageExpr('n'), MakeNumberExpr(0)]),
      MakeNumberExpr(1),
      MakeCall('*', [
        MakeVariableUsageExpr('n'),
        MakeCall('!', [MakeCall('-', [MakeVariableUsageExpr('n'), MakeNumberExpr(1)])])
      ])
    );

export const factorialCond
  = MakeCond(
      [
        [MakeCall('=', [MakeVariableUsageExpr('n'), MakeNumberExpr(0)]), MakeNumberExpr(1)],
        [
          MakeVariableUsageExpr('else'), 
          MakeCall('*', [
            MakeVariableUsageExpr('n'),
            MakeCall('!', [MakeCall('-', [MakeVariableUsageExpr('n'), MakeNumberExpr(1)])])
          ])
        ]
      ]
    );

// ----------------------------------------------------------------------------
// | Definition examples                                                      |
// ----------------------------------------------------------------------------

export const factorialIfDefn = MakeFunctionDefinition('!', ['n'], factorialIf);
export const factorialCondDefn = MakeFunctionDefinition('!', ['n'], factorialCond);

// ----------------------------------------------------------------------------
// | Definition Error examples                                                |
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
// | Check Expect examples                                                    |
// ----------------------------------------------------------------------------

// expected successes

export const checkExpectSameNum
  = MakeCheckExpect(negThirteenExpr, negThirteenExpr);

export const checkExpectSameString
  = MakeCheckExpect(helloStringExpr, helloStringExpr);

export const checkExpectTrue
  = MakeCheckExpect(trueExpr, trueExpr);

export const checkExpectFalse
  = MakeCheckExpect(falseExpr, falseExpr);



// expected failures
export const checkExpectSameId
  = MakeCheckExpect(helloIdExpr, helloIdExpr);

export const checkExpectDiffNum
  = MakeCheckExpect(negThirteenExpr, oneExpr);

export const checkExpectDiffId
  = MakeCheckExpect(helloIdExpr, goodbyeIdExpr);

export const checkExpectDiffString
  = MakeCheckExpect(helloStringExpr, goodbyeStringExpr);

export const checkExpectTrueIsNotFalse
  = MakeCheckExpect(trueExpr, falseExpr);

export const checkExpectDiffType1
  = MakeCheckExpect(negThirteenExpr, helloIdExpr);

export const checkExpectDiffType2
  = MakeCheckExpect(helloIdExpr, helloStringExpr);

export const checkExpectDiffType3
  = MakeCheckExpect(trueExpr, goodbyeStringExpr);


// ----------------------------------------------------------------------------
// | Expr Error examples                                                      |
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
// | Result examples                                                          |
// ----------------------------------------------------------------------------


export const negThirteenVal = MakeAtomic(-13);
export const negOneVal = MakeAtomic(-1);
export const negZeroVal = MakeAtomic(-0);
export const zeroVal = MakeAtomic(0);
export const oneVal = MakeAtomic(1);
export const tenVal = MakeAtomic(10);
export const thirteenVal = MakeAtomic(13);

export const helloVal = MakeAtomic('hello');
export const goodbyeVal = MakeAtomic('goodbye');

export const trueVal = MakeAtomic(true);
export const falseVal = MakeAtomic(false);


export const xTenBind = Bind('x', tenVal);
export const xNullBind = Bind('x', null);
export const sHelloBind = Bind('s', helloVal);
export const sGoodbyeBind = Bind('s', goodbyeVal);
export const tGoodByeBind = Bind('t', goodbyeVal);

// ----------------------------------------------------------------------------
// | CheckResult examples                                                     |
// ----------------------------------------------------------------------------

export const checkExpectedErrorSameId
  = MakeCheckExpectedError(ValErr('this variable is not defined', helloIdExpr));

export const checkFailureDiffNum
  = MakeCheckFailure(negThirteenVal, oneVal);

export const checkExpectedErrorDiffId
  = MakeCheckExpectedError(ValErr('this variable is not defined', goodbyeIdExpr));

export const checkFailureDiffString
  = MakeCheckFailure(helloVal, goodbyeVal);

export const checkFailureTrueIsNotFalse
  = MakeCheckFailure(trueVal, falseVal);

export const checkExpectedErrorDiffType1
  = MakeCheckExpectedError(ValErr('this variable is not defined', helloIdExpr));

export const checkFailureDiffType2
  = MakeCheckExpectedError(ValErr('this variable is not defined', helloIdExpr));

export const checkFailureDiffType3
  = MakeCheckFailure(trueVal, goodbyeVal);

// ----------------------------------------------------------------------------
// | Result Error examples                                                    |
// ----------------------------------------------------------------------------

