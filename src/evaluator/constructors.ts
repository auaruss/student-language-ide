/**
 * @fileoverview The canonical way to construct an entity of any type from types.ts should live in this file.
 *               Update this file with constructors when applicable changes are made to types.ts.
 * 
 * @author Alice Russell
 */

import {
  TokenType, Token, TokenError,
  SExp, ReadError, Expr, ExprResult,
  TopLevel, ExprError, DefinitionError, Closure, Env,
  Definition, ReadResult, DefinitionResult, ValueError, BindingError,
  Binding, Value, Nothing, Just, Maybe, Check
} from './types';
import { isDefinitionResult } from './predicates';

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
// | Definition constructors                                                  |
// ----------------------------------------------------------------------------

export const VarDefn = (name: string, body: Expr): Definition => {
  return {
    type: 'define-constant',
    name: name,
    body: body
  };
}

export const FnDefn = (
  name: string,
  params: string[],
  body: Expr
): Definition => {
  return {
    type: 'define-function',
    name: name,
    params: params,
    body: body
  };
}


// ----------------------------------------------------------------------------
// | Expr constructors                                                        |
// ----------------------------------------------------------------------------

export const PrimitiveExpr = (t:'String'|'Num'|'Id'|'Bool',
              v: string|number|boolean): Expr => {
  if ((t === 'String' || t === 'Id') && (typeof v === 'string')) {
    return { type:  t, const: v };
  } else if (t === 'Num' && (typeof v === 'number')) {
    return { type:  t, const: v };
  } else if (t === 'Bool' && (typeof v === 'boolean')) {
    return { type:  t, const: v };
  }
  throw new Error('Mismatch in primitive Expr type/value');
}

export const NumExpr     = (v: number):  Expr => { return PrimitiveExpr('Num',    v);  }
export const IdExpr      = (v: string):  Expr => { return PrimitiveExpr('Id',     v);  }
export const StringExpr  = (v: string):  Expr => { return PrimitiveExpr('String', v);  }
export const BooleanExpr = (v: boolean): Expr => { return PrimitiveExpr('Bool',   v); }

export const Call = (op: string, args: Expr[]): Expr => {
  return {
    type: 'Call',
    op: op,
    args: args
  };
}

export const ExprErr = (
  e: 'Empty Expr'
   | 'Defn inside Expr'
   | 'No function name after open paren'
   | 'Function call with no arguments',
  v: SExp[]
): ExprError => {
  return { exprError: e, sexps: v };
}

export const DefnErr = (
  e: 'Invalid expression passed where function name was expected'
   | 'Invalid expression passed where function argument was expected'
   | 'A definition requires two parts, but found none'
   | 'A definition requires two parts, but found one' 
   | 'Passed a non-definition as definition'
   | 'Expected a variable name, or a function header'
   | 'Expected a function header with parameters in parentheses, received nothing in parentheses'
   | 'Expected a function header with parameters in parentheses, received a function name with no parameters'
   | 'A function in BSL cannot have zero parameters'
   | 'A definition can\'t have more than 3 parts'
   | 'Cannot have a definition as the body of a definition',
  v: SExp[]): DefinitionError => {
    return { defnError: e, sexps: v };
} 

// ----------------------------------------------------------------------------
// | Check constructors                                                       |
// ----------------------------------------------------------------------------

export const MakeCheckExpect = (actual: Expr, expected: Expr): Check => {
  return {
    type: 'check-expect',
    actual: actual,
    expected: expected
  };
}



// ----------------------------------------------------------------------------
// | Value constructors                                                       |
// ----------------------------------------------------------------------------

export const MakeNothing = (): Nothing => {
  return { type: 'nothing' };
}

export function MakeJust<T>(t: T): Just<T> {
  return { type: 'just', thing: t };
}

export const Bind = (d: string, v: ExprResult | null): Binding => {
  return {
    type: 'define',
    defined: d,
    toBe: v
  }
}

export const NFn = (v: string|number|boolean): Value => {
  return { type: 'NonFunction', value: v };
}

export const BFn = (v: ((vs: Value[]) => ExprResult)): Value => {
  return { type: 'BuiltinFunction', value: v };
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

export const ValErr = (
  err: 'Id not in environment'
     | 'Id referenced before definition'
     | 'Arity mismatch'
     | 'Function used as a predicate'
     | 'Non-boolean value used as a predicate'
     | 'Expression undefined in program'
     | 'Expression defined later in program'
     | 'Nonfunction applied as a function',
     e: Expr): ValueError => {
  return { valueError: err, expr: e };
}

export const BindingErr = (
  err: 'Repeated definition of the same name',
  d: Definition): BindingError => {
  return {
    bindingError: err,
    definition: d
  };
}

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