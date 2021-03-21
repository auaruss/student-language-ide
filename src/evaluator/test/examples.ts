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
  NumTok, IdTok, StringTok, BooleanTok, CommentTok,
  NumAtom, IdAtom, StringAtom, BooleanAtom, SExps,
  NumExpr, IdExpr, StringExpr, BooleanExpr, Call,
  NFn, Bind, MakeCheckExpect
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
// | Definition examples                                                      |
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
// | Definition Error examples                                                |
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
// | Expr examples                                                            |
// ----------------------------------------------------------------------------

export const negThirteenExpr = NumExpr(-13);
export const negOneExpr = NumExpr(-1);
export const negZeroExpr = NumExpr(-0);
export const zeroExpr = NumExpr(0);
export const oneExpr = NumExpr(1);
export const thirteenExpr = NumExpr(13);

export const helloIdExpr = IdExpr('hello');
export const goodbyeIdExpr = IdExpr('goodbye');

export const helloStringExpr = StringExpr('hello');
export const goodbyeStringExpr = StringExpr('goodbye');

export const trueExpr = BooleanExpr(true);
export const falseExpr = BooleanExpr(false);

// ----------------------------------------------------------------------------
// | Check Expect examples                                                    |
// ----------------------------------------------------------------------------

// expected successes

export const checkExpectSameNum
  = MakeCheckExpect(negThirteenExpr, negThirteenExpr);

export const checkExpectSameId
  = MakeCheckExpect(helloIdExpr, helloIdExpr);

export const checkExpectSameString
  = MakeCheckExpect(helloStringExpr, helloStringExpr);

export const checkExpectTrue
  = MakeCheckExpect(trueExpr, trueExpr);

export const checkExpectFalse
  = MakeCheckExpect(falseExpr, falseExpr);



// expected failures

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


export const negThirteenVal = NFn(-13);
export const negOneVal = NFn(-1);
export const negZeroVal = NFn(-0);
export const zeroVal = NFn(0);
export const oneVal = NFn(1);
export const tenVal = NFn(10);
export const thirteenVal = NFn(13);

export const helloVal = NFn('hello');
export const goodbyeVal = NFn('goodbye');

export const trueVal = NFn(true);
export const falseVal = NFn(false);


export const xTenBind = Bind('x', tenVal);
export const xNullBind = Bind('x', null);
export const sHelloBind = Bind('s', helloVal);
export const sGoodbyeBind = Bind('s', goodbyeVal);
export const tGoodByeBind = Bind('t', goodbyeVal);

// ----------------------------------------------------------------------------
// | Result Error examples                                                    |
// ----------------------------------------------------------------------------