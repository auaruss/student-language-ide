/**
 * @fileoverview The types for the entire pipeline from start to finish of the evaluator live here.
 *               When you change this file, make sure to create any relevant constructors in constructors.ts.
 *               When you change this file, make sure to create any relevant predicates in predicates.ts.
 *               When you change this file, make sure to create any relevant examples for tests in tests/examples.ts.
 * 
 * @author Alice Russell
 */

'use strict';

export type Token
  = TokenError | {
    type: TokenType
    token: string,
  };

export enum TokenType {
  OpenParen='OpenParen',
  OpenSquareParen='OpenSquareParen',
  OpenBraceParen='OpenBraceParen',
  CloseParen='CloseParen',
  CloseSquareParen='CloseSquareParen',
  CloseBraceParen='CloseBraceParen',
  Number='Number',
  String='String',
  Identifier='Identifier',
  Whitespace='Whitespace',
  Boolean='Boolean',
  Newline='Newline',
  Comment='Comment'
};

export type TokenError
  = {
    tokenError: string,
    string: string
  };

// ----------------------------------------------------------------------------

export type ReadResult<T>
  = {
    thing: T,
    remain: Token[]
  };

export type SExp
  = ReadError | {
    type: 'SExp Array',
    sexp: SExp[]
  } | {
    type: 'String'
    sexp: string
  } | {
    type: 'Num'
    sexp: number
  } | {
    type: 'Id',
    sexp: string
  } | {
    type: 'Bool',
    sexp: boolean
  };

export type ReadError
  =  {
    readError: string,
    tokens: Token[]
  } | TokenError;

// ----------------------------------------------------------------------------

export type TopLevel
  = Definition | Expr | Check;

export type Definition
  = DefinitionError | {
    type: 'define-constant',
    name:  string,
    body: Expr
  } | {
    type: 'define-function',
    name: string,
    params: string[]
    body: Expr
  };


export type Expr
  = ExprError | {
    type: 'String',
    const: string
  } | {
    type: 'Num',
    const: number
  } | {
    type: 'Id',
    const: string
  } | {
    type: 'Bool',
    const: boolean
  } | {
    type: 'Call',
    op: string,
    args: Expr[],
  };


export type Check
  = CheckError | {
    type: 'check-expect',
    actual: Expr,
    expected: Expr
  };

export type DefinitionError
  = ReadError | {
    defnError: string,
    sexps: SExp[]
  };

export type ExprError
  = ReadError | {
    exprError: string,
    sexps: SExp[]
  };

export type CheckError
  = ReadError | {
    checkError: string,
    sexps: SExp[]
  };

// ----------------------------------------------------------------------------

export type Result
  = DefinitionResult | ExprResult | CheckResult;

export type DefinitionResult
  = BindingError | Binding;

export type ExprResult
  = ValueError | Value;

export type CheckResult
  = {
    type: 'check-success'
  } | {
    type: 'check-failure',
    actual: ExprResult,
    expected: Value
  } | { 
    type: 'check-expected-error',
    expected: ValueError
  } | CheckError;

export type Nothing
 = { type: 'nothing' };

export type Just<T>
 = { type: 'just', thing: T};

export type Maybe<T>
 = Nothing | Just<T>;

export type Binding
  = {
    type: 'define',
    defined: string,
    toBe: ExprResult | null
  };

export type Value
  = {
    type: 'NonFunction',
    value: string | number | boolean
  } | {
    type: 'BuiltinFunction',
    value: ((vs: Value[]) => ExprResult)
  } | {
    type: 'Closure',
    value: Closure
  };

export type BindingError
 = DefinitionError | {
   bindingError: string,
   definition: Definition
 }; // ...

export type ValueError
   = ExprError | {
    valueError: string,
    expr: Expr // put identifier for expr in this thing
  };

export type Closure
  = {
    args: string[],
    env: Env,
    body: Expr
  };

export type Env = Map<String, Maybe<ExprResult>>;



// Every templated part should be a field in the errors