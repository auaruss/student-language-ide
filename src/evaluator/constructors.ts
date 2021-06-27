/**
 * @fileoverview The canonical way to construct an entity of any type from types.ts should live in this file.
 *               Update this file with constructors when applicable changes are made to types.ts.
 * 
 * @author Alice Russell
 */

import {
  TokenType, Token, TokenError,
  SExp, ReadError, Expr, ExprResult,
  ExprError, TopLevelError, Env, TopLevel,
  ReadResult, ValueError, ResultError, Value,
  Nothing, Just, StructType, Result
} from './types';

// ----------------------------------------------------------------------------
// | Token constructors                                                       |
// ----------------------------------------------------------------------------

export const Tok = (t: TokenType, v: string): Token => {
  return { type: t, token: v };
}

export const NumTok     = (v: string): Token => { return Tok(TokenType.Number,       v.toString()); }
export const IdTok      = (v: string): Token => { return Tok(TokenType.Identifier,   v);            }
export const StringTok  = (v: string): Token => { return Tok(TokenType.String, '"' + v + '"');      }
export const BooleanTok = (v: string): Token => { return Tok(TokenType.Boolean,      v);            }
export const CommentTok = (v: string): Token => { return Tok(TokenType.Whitespace,      v);            }

export const TokErr = (v: string): TokenError => { 
  return { tokenError: 'Unidentified Token', string: v };
}

// ----------------------------------------------------------------------------
// | SExp constructors                                                        |
// ----------------------------------------------------------------------------

export const Atom = (t: 'String'|'Num'|'Id'|'Bool',
              v: string|number|boolean): SExp => {
  if ((t === 'String' || t === 'Id') && (typeof v === 'string')) {
    return { type:  t, sexp: v };
  } else if (t === 'Num' && (typeof v === 'number')) {
    return { type:  t, sexp: v };
  } else if (t === 'Bool' && (typeof v === 'boolean')) {
    return { type:  t, sexp: v };
  }
  throw new Error('Mismatch in atom type/value');
}

export const NumAtom     = (v: number): SExp => { return Atom('Num',            v);  }
export const IdAtom      = (v: string): SExp => { return Atom('Id',             v);  }
export const StringAtom  = (v: string): SExp => { return Atom('String',         v);  }
export const BooleanAtom = (v: string): SExp => { return Atom('Bool', whichBool(v)); }

/**
 * Converts a boolean string in BSL into a boolean.
 * @param t token
 */
 const whichBool = (s: string): boolean => {
  switch (s) {
    case '#T':
    case '#t':
    case '#true':
       return true;
    case '#F':
    case '#f':
    case '#false':
      return false;
  }
  return false;
}

export const SExps = (...args: SExp[]): SExp => {
  return {
    type: 'SExp Array',
    sexp: args
  };
}

export const SExpsFromArray = (sexps: SExp[]): SExp => {
  return {
    type: 'SExp Array',
    sexp: sexps
  };
}

export function Res<T> (t: T, r: Token[]): ReadResult<T> {
  return { thing: t, remain: r };
}

export const ReadErr = (
  e: 'No Valid SExp'
  | 'No Closing Paren'
  | 'No Open Paren'
  | 'Mismatched Parens'
  | 'Invalid token found while reading SExp',
  v: Token[]): ReadError => { 
  return { readError: e, tokens: v }; 
}

// ----------------------------------------------------------------------------
// | Top Level constructors                                                   |
// ----------------------------------------------------------------------------

export const MakeVariableDefinition = (name: string, body: Expr): TopLevel => {
  return {
    type: 'define-constant',
    name: name,
    body: body
  };
}

export const MakeFunctionDefinition = (
  name: string,
  params: string[],
  body: Expr
): TopLevel => {
  return {
    type: 'define-function',
    name: name,
    params: params,
    body: body
  };
}

export const MakeStructureDefinition = (
  name: string,
  fields: string[]
): TopLevel => {
  return {
    type: 'define-struct',
    name: name,
    fields: fields
  };
}

export const MakeCheckExpect = (actual: Expr, expected: Expr): TopLevel => {
  return {
    type: 'check-expect',
    actual: actual,
    expected: expected
  };
}

export const MakeCheckWithin = (actual: Expr, expected: Expr, margin: Expr): TopLevel => {
  return {
    type: 'check-within',
    actual: actual,
    expected: expected,
    margin: margin
  };
}

export const MakeCheckError = (
  expression: Expr,
  expectedRrrorMessage?: string
): TopLevel => {
  return expectedRrrorMessage ? {
    type: 'check-error',
    expression: expression,
    expectedErrorMessage: expectedRrrorMessage
  } : {
    type: 'check-error',
    expression: expression,
  };
}

// ----------------------------------------------------------------------------
// | Expr constructors                                                        |
// ----------------------------------------------------------------------------

export const MakePrimitiveExpr = (t:'String'|'Number'|'VariableUsage'|'Boolean',
              v: string|number|boolean): Expr => {
  if ((t === 'String' || t === 'VariableUsage') && (typeof v === 'string')) {
    return { typeOfExpression:  t, const: v };
  } else if (t === 'Number' && (typeof v === 'number')) {
    return { typeOfExpression:  t, const: v };
  } else if (t === 'Boolean' && (typeof v === 'boolean')) {
    return { typeOfExpression:  t, const: v };
  }
  throw new Error('Mismatch in primitive Expr type/value');
}

export const MakeNumberExpr = (v: number):  Expr => { return MakePrimitiveExpr('Number',    v);  }
export const MakeVariableUsageExpr = (v: string):  Expr => { return MakePrimitiveExpr('VariableUsage',     v);  }
export const MakeStringExpr  = (v: string):  Expr => { return MakePrimitiveExpr('String', v);  }
export const MakeBooleanExpr = (v: boolean): Expr => { return MakePrimitiveExpr('Boolean',   v); }

export const MakeCall = (op: string, args: Expr[]): Expr => {
  return {
    typeOfExpression: 'Call',
    op: op,
    args: args
  };
}

export const MakeIf = (p: Expr, c: Expr, a: Expr): Expr => {
  return {
    typeOfExpression: 'if',
    predicate: p,
    consequent: c,
    alternative: a
  };
}

export const MakeCond = (clauses: [Expr, Expr][]): Expr => {
  return {
    typeOfExpression: 'cond',
    clauses: clauses
  };
}

export const MakeAnd = (args: Expr[]): Expr => {
  return {
    typeOfExpression: 'and',
    arguments: args
  };
}

export const MakeOr = (args: Expr[]): Expr => {
  return {
    typeOfExpression: 'or',
    arguments: args
  };
}

export const MakeTemplatePlaceholder = (sexp: SExp): Expr => {
  return {
    typeOfExpression: 'TemplatePlaceholder',
    sexp: sexp
  };
}

export const TopLevelErr = (
  topLevelError: string,
  sexps: SExp[]
): TopLevelError => {
  return {
    topLevelError: topLevelError,
    sexps: sexps
  };
}

export const ExprErr = (e: string,
  v: SExp[]
): ExprError => {
  return { exprError: e, sexps: v };
}


// ----------------------------------------------------------------------------
// | Result constructors                                                      |
// ----------------------------------------------------------------------------

export const Bind = (d: string, v: ExprResult | null): Result => {
  return {
    type: 'define',
    defined: d,
    toBe: v
  };
}

export const MakeCheckSuccess = (): Result => {
  return {
    type: 'check-success'
  };
}

export const MakeCheckFailure = (actual: ExprResult, expected: Value): Result => {
  return {
    type: 'check-failure',
    actual: actual,
    expected: expected
  };
}

export const MakeCheckExpectedError = (expected: ValueError): Result => {
  return { 
    type: 'check-expected-error',
    expected: expected
  };
}

// ----------------------------------------------------------------------------
// | ExprResult constructors                                                  |
// ----------------------------------------------------------------------------


export const MakeAtomic = (v: string|number|boolean): Value => {
  return { type: 'Atomic', value: v };
}

export const MakeBuiltinFunction = (v: ((vs: Value[]) => ExprResult)): Value => {
  return { type: 'BuiltinFunction', value: v };
}

export const MakeStructTypeValue = (name: string): Value  => {
  return { type: 'StructType', name: name };
}

export const MakeStruct = (s: StructType, v: ExprResult[]): Value => {
  return {
    type: 'Struct',
    struct: s,
    values: v
  };
}

export const MakeStructureConstructor = (st: StructType): Value => {
  return {
    type: 'StructureConstructor',
    struct: st
  };
};

export const MakeStructureAccessor = (st: StructType, i: number): Value => {
  return {
    type: 'StructureAccessor', // if applying to a struct, check that the two struct types are equal with ===
    struct: st,
    index: i
  };
}

export const MakeStructurePredicate =  (st: StructType): Value => {
  return {
    type: 'StructurePredicate',
    struct: st
  };
}

export const MakeStructType = (name: string, fields: string[]): StructType => {
  return {
    name: name,
    fields: fields
  };
}

export const MakeNothing = (): Nothing => {
  return { type: 'nothing' };
}

export function MakeJust<T>(t: T): Just<T> {
  return { type: 'just', thing: t };
}

export function Clos(a: string[], e: Env, b: Expr): Value {
  return {
    type: 'Closure',
    value: {
      args: a,
      env: e,
      body: b
    }
  };
}

export const ResultErr = (
  err: string,
  t: TopLevel): ResultError => {
  return {
    resultError: err,
    toplevel: t
  };
}

export const ValErr = (err: string, e?: Expr): ValueError => {
  if (! e) return { valueError: err, expr: undefined };
  return { valueError: err, expr: e };
}

export const CP: Token    = Tok(TokenType.CloseParen,        ')');
export const OP: Token    = Tok(TokenType.OpenParen,         '(');
export const SPACE: Token = Tok(TokenType.Whitespace,        ' ');
export const OSP: Token   = Tok(TokenType.OpenSquareParen,   '[');
export const CSP: Token   = Tok(TokenType.CloseSquareParen,  ']');
export const OBP: Token   = Tok(TokenType.OpenBraceParen,    '{');
export const CBP: Token   = Tok(TokenType.CloseBraceParen,   '}');
export const NL: Token    = Tok(TokenType.Whitespace,       '\n');

export const NOP: Nothing = { type: 'nothing' };

export const Spaces = (x : number): Token => {
  let spaces = '';
  for (let i = 0; i < x; i++) spaces += ' ';
  return Tok(TokenType.Whitespace, spaces);
}